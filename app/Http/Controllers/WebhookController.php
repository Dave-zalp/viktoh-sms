<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\User;
use App\Models\Transaction;
use Illuminate\Http\Request;
use App\Models\VirtualAccount;
use App\Models\PurchasedNumber;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

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

    public function pocketFiWebhook(Request $request): JsonResponse
    {
        try {
            $rawPayload = $request->getContent();

            Log::info('PocketFi Webhook Received', $request->all());

            // Verify HMAC-SHA512 signature
            $signature = $_SERVER['HTTP_POCKETFI_SIGNATURE'] ?? $request->header('Pocketfi-Signature');
            $secret    = config('pocketfi.webhook_secret');

            $expectedHash = hash_hmac('sha512', $rawPayload, $secret);

            if (!hash_equals($expectedHash, (string) $signature)) {
                Log::error('PocketFi webhook: invalid signature');
                return response()->json(['message' => 'Invalid signature'], 400);
            }

            $data      = json_decode($rawPayload, true);
            $amount    = floatval(data_get($data, 'order.settlement_amount'));
            $reference = data_get($data, 'transaction.reference');

            if (!$amount || !$reference) {
                Log::warning('PocketFi webhook: missing required fields', $data);
                return response()->json(['message' => 'Missing required fields'], 400);
            }

            DB::beginTransaction();

            // Prevent duplicate processing
            if (Transaction::where('reference', $reference)->exists()) {
                DB::rollBack();
                return response()->json(['message' => 'Transaction already processed'], 200);
            }

            // Match the virtual account by account number embedded in the description
            $description   = data_get($data, 'order.description', '');
            $accountNumber = data_get($data, 'account_number') ?? $this->extractAccountNumber($description);

            $virtualAccount = VirtualAccount::where('account_number', $accountNumber)
                ->where('provider', 'pocketfi')
                ->first();

            if (!$virtualAccount) {
                DB::rollBack();
                Log::error('PocketFi webhook: virtual account not found', [
                    'account_number' => $accountNumber,
                    'description'    => $description,
                ]);
                return response()->json(['message' => 'Account not found'], 404);
            }

            $user        = $virtualAccount->user;
            $transaction = $user->addBalance(
                $amount,
                "Deposit via {$virtualAccount->bank_name} - {$description}",
                'credit'
            );

            $transaction->update(['reference' => $reference]);

            DB::commit();

            Log::info('PocketFi webhook: balance updated', [
                'user_id'     => $user->id,
                'amount'      => $amount,
                'new_balance' => $user->balance,
            ]);

            return response()->json(['message' => 'success'], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('PocketFi Webhook Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Webhook processing failed'], 500);
        }
    }

    /**
     * Extract account number from PocketFi payment description if present.
     */
    private function extractAccountNumber(string $description): ?string
    {
        // Attempt to pull a 10-digit NUBAN from the description
        if (preg_match('/\b(\d{10})\b/', $description, $matches)) {
            return $matches[1];
        }

        return null;
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


    public function handleDaisyWebhook(Request $request)
    {
        Log::info('DaisySMS Webhook Received', ['payload' => $request->all()]);

        $validator = Validator::make($request->all(), [
            'activationId' => 'required|numeric',
            'messageId'    => 'required|numeric',
            'service'      => 'required|string',
            'text'         => 'nullable|string',
            'code'         => 'nullable|string',
            'country'      => 'required|numeric',
            'receivedAt'   => 'required|date',
        ]);

        if ($validator->fails()) {
            Log::warning('DaisySMS Webhook: Invalid webhook data', [
                'errors' => $validator->errors()->toArray(),
            ]);

            return response()->json(['success' => true], 200);
        }

        $validated = $validator->validated();

        // Fetch latest record for this activation
        $number = PurchasedNumber::where('activation_id', $validated['activationId'])
            ->latest()
            ->first();

        if (!$number) {
            Log::warning('DaisySMS Webhook: activation_id not found', [
                'activationId' => $validated['activationId'],
            ]);

            return response()->json(['success' => true], 200);
        }

        /**
         * If we already stored one OTP for this activation,
         * create a NEW record for the new SMS
         */
        if ($number->status === 'received') {
            Log::info('DaisySMS Webhook: additional SMS received', [
                'activationId' => $validated['activationId'],
                'messageId'    => $validated['messageId'],
            ]);

            $number = $number->replicate();

            // Explicitly clear SMS-related fields
            $number->otp_code = null;
            $number->sms_text = null;
            $number->code_received_at = null;
        }

        // Save new SMS / OTP
        $number->activation_id        = $validated['activationId'];
        $number->sms_text             = $validated['text'];
        $number->otp_code             = $validated['code'];
        $number->status               = 'received';
        $number->country_code         = $validated['country'];
        $number->code_received_at     = Carbon::parse($validated['receivedAt']);
        $number->daisy_service_name   = $validated['service'];

        $number->save();

        Log::info('DaisySMS Webhook processed successfully', [
            'purchased_number_id' => $number->id,
            'activation_id'       => $validated['activationId'],
        ]);

        return response()->json(['success' => true], 200);
    }



}
