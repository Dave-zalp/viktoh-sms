<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Transaction;
use Illuminate\Http\Request;
use App\Models\VirtualAccount;
use App\Models\PurchasedNumber;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;

class WebhookController extends Controller
{
    public function paymentPointWebhook(Request $request): JsonResponse
    {
        try {
            Log::info('PaymentPoint Webhook Received', $request->all());

            // Verify signature
            $signature = $request->header('Paymentpoint-Signature');
            if (!$signature) {
                Log::error('Missing Paymentpoint-Signature header');
                return response()->json(['message' => 'Invalid signature'], 401);
            }

            // Get raw JSON body
            $payload = $request->getContent();
            $securityKey = config('paymentpoint.security_key');

            // Generate hash
            $generatedHash = hash_hmac('sha256', $payload, $securityKey);

            // Compare signatures
            if (!hash_equals($generatedHash, $signature)) {
                Log::error('Signature verification failed', [
                    'expected' => $generatedHash,
                    'received' => $signature
                ]);
                return response()->json(['message' => 'Invalid signature'], 401);
            }

            // Verify webhook is for successful payment
            if ($request->notification_status !== 'payment_successful' || $request->transaction_status !== 'success') {
                return response()->json(['message' => 'Not a successful payment'], 200);
            }

            $accountNumber = $request->receiver['account_number'];
            $amountPaid = floatval($request->amount_paid);
            $transactionId = $request->transaction_id;

            // Find virtual account
            $virtualAccount = VirtualAccount::where('account_number', $accountNumber)->first();

            if (!$virtualAccount) {
                Log::error('Virtual account not found', ['account_number' => $accountNumber]);
                return response()->json(['message' => 'Account not found'], 404);
            }

            DB::beginTransaction();

            // Check for duplicate transaction
            $existingTransaction = Transaction::where('reference', $transactionId)->first();
            if ($existingTransaction) {
                DB::rollBack();
                return response()->json(['message' => 'Transaction already processed'], 200);
            }

            $user = $virtualAccount->user;

            // Add balance
            $user->addBalance(
                $amountPaid,
                "Deposit via {$request->receiver['bank']} - {$request->sender['name']}",
                'credit'
            );

            // Update transaction reference
            $transaction = Transaction::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->first();

            if ($transaction) {
                $transaction->update(['reference' => $transactionId]);
            }

            DB::commit();

            Log::info('Balance updated successfully', [
                'user_id' => $user->id,
                'amount' => $amountPaid,
                'new_balance' => $user->balance
            ]);

            return response()->json(['message' => 'Webhook processed successfully'], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('PaymentPoint Webhook Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Webhook processing failed'], 500);
        }
    }

    public function handleSmsWebhook(Request $request)
    {
        // 1️⃣ Allowed IPs (from documentation)
        $allowedIps = ['188.42.218.183', '142.91.156.119'];

        if (!in_array($request->ip(), $allowedIps)) {
            Log::warning('Unauthorized webhook access attempt', [
                'ip' => $request->ip(),
                'data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Unauthorized IP'
            ], 403);
        }

        // 2️⃣ Validate the incoming data
        $validated = $request->validate([
            'activationId' => 'required|integer',
            'service' => 'required|string',
            'text' => 'required|string',
            'code' => 'nullable|string',
            'country' => 'nullable|integer',
            'receivedAt' => 'required|date'
        ]);

        // 3️⃣ Log the incoming webhook
        Log::info('Received SMS webhook', [
            'ip' => $request->ip(),
            'payload' => $validated
        ]);

        // 4️⃣ Find the related purchased number
        $purchasedNumber = PurchasedNumber::where('activation_id', $validated['activationId'])->first();

        if (!$purchasedNumber) {
            Log::error('Webhook activation ID not found', [
                'activationId' => $validated['activationId']
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Activation not found'
            ], 404);
        }

        // 5️⃣ Update record with SMS info
        $purchasedNumber->update([
            'sms_text' => $validated['text'],
            'otp_code' => $validated['code'],
            'status' => 'received',
            'code_received_at' => $validated['receivedAt']
        ]);

        // 6️⃣ Respond success
        return response()->json([
            'success' => true,
            'message' => 'Webhook received successfully'
        ], 200);
    }
}
