<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Service;
use Illuminate\Http\Request;
use App\Models\PurchasedNumber;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Services\SmsActivateService;
use Illuminate\Support\Facades\Validator;

class NumberController extends Controller
{
    protected $smsActivate;

    public function __construct(SmsActivateService $smsActivate)
    {
        $this->smsActivate = $smsActivate;
    }

    /**
     * Purchase a virtual number
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function purchase(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'service_code' => 'required|string',
            'country' => 'nullable|integer',
            'operator' => 'nullable|string',
            'max_price' => 'nullable|numeric|min:0',
        ]);

        return response()->json([
                'success' => false,
                'message' => 'All country number are under upgrade or maintainace, buy from USA Numbers !',
            ], 400);

        if ($validator->fails()) {
            Log::warning('Purchase validation failed', [
                'user_id' => auth()->id(),
                'errors' => $validator->errors()->toArray(),
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $user = User::where('id', auth()->id())->lockForUpdate()->first();
        $serviceCode = $request->service_code;
        $country = $request->country ?? config('sms-activate.default_country');
        $operator = $request->operator;
        $maxPrice = $request->max_price;

        try {
            // Get service
            $service = Service::where('code', $serviceCode)->first();

            if (!$service) {
                $service = Service::create([
                    'code' => $serviceCode,
                    'name' => ucfirst($serviceCode),
                    'is_active' => true
                ]);
                Log::info('Service created', ['service_code' => $serviceCode]);
            }

            DB::beginTransaction();
            Log::info('Starting number purchase', [
                'user_id' => $user->id,
                'service_code' => $serviceCode,
                'country' => $country,
                'operator' => $operator,
                'max_price' => $maxPrice
            ]);

            // Purchase number from SMS-Activate API
            $result = $this->smsActivate->getNumber($serviceCode, $country, $operator, $maxPrice);

            if (!$result['success']) {
                DB::rollBack();
                Log::error('Failed to purchase number from SMS-Activate API', [
                    'user_id' => $user->id,
                    'service_code' => $serviceCode,
                    'country' => $country,
                    'operator' => $operator,
                    'max_price' => $maxPrice,
                    'response' => $result
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to purchase number',
                    'error' => $result['error'] ?? 'Unknown error'
                ], 400);
            }

            // Check if user has sufficient balance
            $cost = (float)$result['cost'];
            $exchangeRate = (float)service_settings()->sms_activate_exc_rate;
            // $exchangeRate = (float)config('sms-activate.exchange_rate', 1500);
            // $markupPercentage = (float)config('sms-activate.markup_percentage', 20);
            $markupPercentage = (float)service_settings()->sms_activate_top_up;

            $finalAmount = round($cost * $exchangeRate * (1 + ($markupPercentage / 100)), 2);

            if (!$user->hasSufficientBalance($finalAmount)) {
                $this->smsActivate->cancelActivation($result['activation_id']);
                DB::rollBack();
                Log::warning('Insufficient balance for number purchase', [
                    'user_id' => $user->id,
                    'required' => $finalAmount,
                    'available' => $user->balance
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient balance',
                    'required' => $finalAmount,
                    'available' => $user->balance
                ], 400);
            }

            // Calculate expiration time (default 20 minutes)
            $expiresAt = now()->addSeconds((int) config('sms-activate.activation_timeout', 1200));

            // Create purchased number record
            $purchasedNumber = PurchasedNumber::create([
                'user_id' => $user->id,
                'service_id' => $service->id,
                'activation_id' => $result['activation_id'],
                'phone_number' => $result['phone_number'],
                'service_code' => $serviceCode,
                'country_code' => $result['country_code'],
                'operator' => $result['operator'],
                'cost' => $finalAmount,
                'currency' => $result['currency'],
                'status' => 'waiting',
                'activation_time' => $result['activation_time'],
                'expires_at' => $expiresAt,
                'can_request_another_sms' => $result['can_get_another_sms'] == 1,
            ]);

            Log::info('Number purchased successfully', [
                'user_id' => $user->id,
                'purchased_number_id' => $purchasedNumber->id,
                'activation_id' => $purchasedNumber->activation_id,
                'cost' => $finalAmount
            ]);

            $user->deductBalance(
                $finalAmount,
                "Purchase virtual number for {$service->name}",
                $purchasedNumber
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Number purchased successfully',
                'data' => [
                    'purchased_number' => [
                        'id' => $purchasedNumber->id,
                        'activation_id' => $purchasedNumber->activation_id,
                        'phone_number' => $purchasedNumber->phone_number,
                        'service' => $service->name,
                        'cost' => $purchasedNumber->cost,
                        'status' => $purchasedNumber->status,
                        'expires_at' => $purchasedNumber->expires_at->toDateTimeString(),
                        'can_request_another_sms' => $purchasedNumber->can_request_another_sms,
                    ],
                    'balance' => [
                        'previous' => $user->balance + $cost,
                        'current' => $user->balance
                    ]
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Exception during number purchase', [
                'user_id' => $user->id ?? null,
                'service_code' => $serviceCode ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to purchase number',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get OTP status for a purchased number
     *
     * @param int $id
     * @return JsonResponse
     */
    public function getStatus($id): JsonResponse
    {
        try {
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

            // Get status from SMS-Activate API
            $result = $this->smsActivate->getStatus($purchasedNumber->activation_id);

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to get status',
                    'error' => $result['error'] ?? 'Unknown error'
                ], 400);
            }


            $data = $result['data'];

            $otpCode = null;
            $smsText = null;

            // Check for SMS
            if (isset($data['sms']['code']) && !empty($data['sms']['code'])) {
                $otpCode = $data['sms']['code'];
                $smsText = $data['sms']['text'] ?? null;
            }

            // Check for Call (voice verification)
            elseif (isset($data['call']['code']) && !empty($data['call']['code'])) {
                $otpCode = $data['call']['code'];
                $smsText = $data['call']['text'] ?? null;
            }

            if ($otpCode) {
                $purchasedNumber->markAsReceived($otpCode, $smsText);

                return response()->json([
                    'success' => true,
                    'data' => [
                        'status' => 'received',
                        'otp_code' => $otpCode,
                        'sms_text' => $smsText,
                        'received_at' => $purchasedNumber->code_received_at->toDateTimeString(),
                    ]
                ], 200);
            }

            // Still waiting
            return response()->json([
                'success' => true,
                'data' => [
                    'status' => 'waiting',
                    'message' => 'Waiting for OTP code',
                    'expires_at' => $purchasedNumber->expires_at->toDateTimeString(),
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all purchased numbers for authenticated user
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function myNumbers(Request $request): JsonResponse
    {
        try {
            $user = auth()->user();
            $status = $request->input('status');

            $query = PurchasedNumber::where('user_id', $user->id)
                ->with('service')
                ->orderBy('created_at', 'desc');

            if ($status) {
                $query->where('status', $status);
            }

            $numbers = $query->paginate(20);

            return response()->json([
                'success' => true,
                'data' => [
                    'numbers' => $numbers->items(),
                    'pagination' => [
                        'current_page' => $numbers->currentPage(),
                        'per_page' => $numbers->perPage(),
                        'total' => $numbers->total(),
                        'last_page' => $numbers->lastPage(),
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch numbers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Request another SMS for a number
     *
     * @param int $id
     * @return JsonResponse
     */
    public function requestAnotherSms($id): JsonResponse
    {
        try {
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

            if (!$purchasedNumber->canRequestAnotherSms()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot request another SMS for this number'
                ], 400);
            }

            // Request another SMS from API
            $result = $this->smsActivate->requestAnotherSms($purchasedNumber->activation_id);

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to request another SMS',
                    'error' => $result['error'] ?? 'Unknown error'
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Another SMS requested successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to request another SMS',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel a number activation
     *
     * @param int $id
     * @return JsonResponse
     */
    public function cancel($id): JsonResponse
    {
        try {
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

            if ($purchasedNumber->status !== 'waiting') {
                return response()->json([
                    'success' => false,
                    'message' => 'Can only cancel waiting activations'
                ], 400);
            }

            DB::beginTransaction();

            // Cancel on SMS-Activate API
            $result = $this->smsActivate->cancelActivation($purchasedNumber->activation_id);

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

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel activation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark activation as completed
     *
     * @param int $id
     * @return JsonResponse
     */
    public function complete($id): JsonResponse
    {
        try {
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

            // Mark as completed on SMS-Activate API
            $result = $this->smsActivate->finishActivation($purchasedNumber->activation_id);

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to complete activation',
                    'error' => $result['error'] ?? 'Unknown error'
                ], 400);
            }

            // Mark as completed locally
            $purchasedNumber->markAsCompleted();

            return response()->json([
                'success' => true,
                'message' => 'Activation completed successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to complete activation',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
