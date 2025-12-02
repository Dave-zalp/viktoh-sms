<?php

namespace App\Http\Controllers;

use App\Models\DaisyServiceModel;
use App\Models\PurchasedNumber;
use App\Models\User;
use Illuminate\Http\Request;
use App\Services\DaisySmsService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class DaisySmsController extends Controller
{
    protected DaisySmsService $daisy;

    public function __construct(DaisySmsService $daisy)
    {
        $this->daisy = $daisy;
    }

    /**
     * Get account balance
     */
    // public function balance()
    // {
    //     return response()->json($this->daisy->getBalance());
    // }

        /**
     * Get USA services with markup applied
     */
    public function getServices(Request $request)
    {

        $result = $this->daisy->getServicesWithMarkup();

        return response()->json($result);
    }

    /**
     * Rent a USA number for a service
     */
     public function rentNumber(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'service' => 'required|string',
        ]);

        if ($validator->fails()) {
            Log::warning('DaisyRent number rental validation failed', [
                'user_id' => auth()->id(),
                'errors'  => $validator->errors()->toArray(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 400);
        }

        $user = User::where('id', auth()->id())->lockForUpdate()->first();
        $serviceCode = $request->service;

        try {
            DB::beginTransaction();
            Log::info('Starting DaisyRent number rental', [
                'user_id' => $user->id,
                'service_code' => $serviceCode,
            ]);

            // Rent number
            $result = $this->daisy->rentNumber($serviceCode);

            if (!$result['success']) {
                DB::rollBack();
                Log::error('Failed to rent number from DaisySMS API', [
                    'user_id' => $user->id,
                    'response' => $result
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to rent number',
                    'error' => $result['error'] ?? 'Unknown error'
                ], 400);
            }

            // Calculate cost
            $cost = DaisyServiceModel::getCostByKeyName($serviceCode);
            $exchangeRate = (float)service_settings()->daisy_sms_exc_rate;
            $markupPercentage = (float)service_settings()->daisy_sms_top_up;

            $finalAmount = round($cost * $exchangeRate * (1 + ($markupPercentage / 100)), 2);

            // Check balance
            if (!$user->hasSufficientBalance($finalAmount)) {
                $this->daisy->cancelRental($result['rental_id']);
                DB::rollBack();

                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient balance',
                    'required' => $finalAmount,
                    'available' => $user->balance
                ], 400);
            }

            // DaisySMS rentals usually expire in 20 minutes; you can adjust
            $expiresAt = now()->addMinutes(20);

            // Save purchase record
            $rentedNumber = PurchasedNumber::create([
                'user_id'      => $user->id,
                'activation_id'    => $result['rental_id'],
                'phone_number' => $result['phone_number'],
                'service_code' => $serviceCode,
                'service_id'   => 187,
                'cost'         => $finalAmount,
                'status'       => 'waiting',
                'expires_at'   => $expiresAt,
                'country_code'=> 187,
                'operator'    => 'any',
                'currency'    => 840,
                'provider' => 'daisysms',
                'can_request_another_sms' => 0
            ]);

            // Deduct balance
            $user->deductBalance(
                $finalAmount,
                "Rented number {$result['phone_number']} for service {$serviceCode}",
                $rentedNumber
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Number rented successfully',
                'data' => [
                    'rented_number' => [
                        'id'           => $rentedNumber->id,
                        'activation_id'    => $rentedNumber->activation_id,
                        'phone_number' => $rentedNumber->phone_number,
                        'service'      => $serviceCode,
                        'cost'         => $rentedNumber->cost,
                        'status'       => $rentedNumber->status,
                        'expires_at'   => $rentedNumber->expires_at->toDateTimeString(),
                        'provider' => $rentedNumber->provider,
                    ],
                    'balance' => [
                        'current' => $user->balance,
                    ]
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Exception during DaisyRent number rental', [
                'user_id' => $user->id ?? null,
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to rent number',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get code for rented number
     */
    public function getCode($id)
    {

        $user = auth()->user();

         $purchasedNumber = PurchasedNumber::where('id', $id)
                ->where('user_id', $user->id)
                 ->lockForUpdate()  // ✅ Critical fix
                ->first();

        if (!$purchasedNumber) {
                return response()->json([
                    'success' => false,
                    'message' => 'Number not found'
                ], 404);
            }

            // If already received, return stored code
            if ($purchasedNumber->status === 'received') {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'status' => 'received',
                        'otp_code' => $purchasedNumber->otp_code,
                        'sms_text' => $purchasedNumber->sms_text,
                        'received_at' => $purchasedNumber->code_received_at->toDateTimeString(),
                    ]
                ], 200);
            }

            // ✅ Check if already expired/cancelled/completed (prevent duplicate refunds)
            if (in_array($purchasedNumber->status, ['expired', 'cancelled', 'completed'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Activation is no longer active',
                    'status' => $purchasedNumber->status
                ], 400);
            }

            // Check if expired
            if ($purchasedNumber->isExpired()) {
                // Use updateOrFail with where clause for double safety
                $updated = PurchasedNumber::where('id', $purchasedNumber->id)
                    ->where('status', 'waiting')  // ✅ Only update if still waiting
                    ->update(['status' => 'expired']);

                // ✅ Only refund if we actually updated the status
                if ($updated) {
                    $user->addBalance(
                        $purchasedNumber->cost,
                        "Refund for expired number {$purchasedNumber->phone_number}",
                        'refund',
                        $purchasedNumber
                    );
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Activation expired',
                    'status' => 'expired'
                ], 400);
            }

            $result = $this->daisy->getStatus($purchasedNumber->activation_id);

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to get status',
                    'error' => $result['error'] ?? 'Unknown error'
                ], 400);
            }

            $purchasedNumber->update([
                'otp_code' => $result['code'],
                'sms_text' => $result['text'] ?? null,
                'status' => 'received',
                'code_received_at' => now(),
            ]);

            return response()->json([
                    'success' => true,
                    'data' => [
                        'status' => 'received',
                        'otp_code' => $result['code'],
                    ]
                ], 200);
    }

    /**
     * Mark rental as done
     */
    public function markDone($id)
    {
        $user = auth()->user();
        $purchasedNumber = PurchasedNumber::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$purchasedNumber) {
            return response()->json([
                'success' => false,
                'message' => 'Number not found'
            ], 404);
        }

        if ($purchasedNumber->status !== 'received') {
            return response()->json([
                'success' => false,
                'message' => 'Can only complete activations with received OTP'
            ], 400);
        }

        $result = $this->daisy->markAsDone($purchasedNumber->activation_id);

        if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to get status',
                    'error' => $result['error'] ?? 'Unknown error'
                ], 400);
            }

        // Mark as completed locally
        $purchasedNumber->markAsCompleted();

        return response()->json([
                    'success' => true,
                    'message' => 'Activation Completed'
                ], 200);
    }

    /**
     * Cancel rental
     */
    public function cancel($id)
    {
            $user = auth()->user();
            $purchasedNumber = PurchasedNumber::where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$purchasedNumber) {
                return response()->json([
                    'success' => false,
                    'message' => 'Number not found'
                ], 404);
            }

            if ($purchasedNumber->status == 'expired') {
                return response()->json([
                    'success' => false,
                    'message' => 'Number is expired, Order has been refunded'
                ], 400);
            }

            if ($purchasedNumber->status !== 'waiting') {
                return response()->json([
                    'success' => false,
                    'message' => 'Can only cancel waiting activations'
                ], 400);
            }

            DB::beginTransaction();

             $result = $this->daisy->cancelRental($purchasedNumber->activation_id);

            if (!$result['success']) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to cancel activation',
                        'error' => $result['error'] ?? 'Unknown error'
                    ], 400);
                }

            // Mark as cancelled
            $purchasedNumber->markAsCancelled();

            // Refund user balance
            $user->addBalance(
                $purchasedNumber->cost,
                "Refund for cancelled number {$purchasedNumber->phone_number}",
                'refund',
                $purchasedNumber
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Activation cancelled and balance refunded',
                'data' => [
                    'refunded_amount' => $purchasedNumber->cost,
                    'current_balance' => $user->balance
                ]
            ], 200);
    }
}
