<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Service;
use Illuminate\Http\Request;
use App\Models\PurchasedNumber;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\GrizzlySmsService;
use Illuminate\Support\Facades\Validator;

class GrizzlySmsController extends Controller
{
    protected GrizzlySmsService $grizzly;

    public function __construct(GrizzlySmsService $grizzly)
    {
        $this->grizzly = $grizzly;
    }

    /**
     * Get available countries
     * GET /api/v1/grizzlysms/countries
     */
    public function getCountries(): JsonResponse
    {
        try {
            $result = $this->grizzly->getCountries();

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'countries' => $result['countries']
                    ]
                ], 200);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch countries',
                'error' => $result['error'] ?? 'Unknown error'
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch countries',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get list of available services
     * GET /api/v1/grizzlysms/services
     */
    public function getServices(Request $request): JsonResponse
    {
        try {
            $country = $request->input('country');
            $result = $this->grizzly->getServicesList($country);

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'services' => $result['services']
                    ]
                ], 200);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch services',
                'error' => $result['error'] ?? 'Unknown error'
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch services',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get prices for a service/country (already converted to NGN with markup applied)
     * GET /api/v1/grizzlysms/prices?service=wa&country=187
     */
    public function getPrices(Request $request): JsonResponse
    {
        try {
            $service = $request->input('service');
            $country = $request->input('country');

            $result = $this->grizzly->getPrices($service, $country);

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'data' => $result['prices']
                ], 200);
            }

            Log::error('Failed to fetch prices from GrizzlySMS API', [
                'service' => $service,
                'country' => $country,
                'response' => $result
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch prices',
                'error' => $result['error'] ?? 'Unknown error'
            ], 400);

        } catch (\Exception $e) {
            Log::error('Exception occurred while fetching GrizzlySMS prices', [
                'service' => $request->input('service'),
                'country' => $request->input('country'),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch prices',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Purchase a virtual number (getNumberV2)
     * POST /api/v1/grizzlysms/purchase
     */
    public function purchase(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'service_code' => 'required|string',
            'country' => 'nullable|integer',
            'max_price' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            Log::warning('GrizzlySMS purchase validation failed', [
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
        $country = $request->country ?? config('grizzly-sms.default_country');
        $maxPrice = $request->max_price;

        try {
            // Get or create local service record (generic services table, shared across providers)
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
            Log::info('Starting GrizzlySMS number purchase', [
                'user_id' => $user->id,
                'service_code' => $serviceCode,
                'country' => $country,
                'max_price' => $maxPrice
            ]);

            // Purchase number from GrizzlySMS API
            $result = $this->grizzly->getNumber($serviceCode, $country, $maxPrice);

            if (!$result['success']) {
                DB::rollBack();
                Log::error('Failed to purchase number from GrizzlySMS API', [
                    'user_id' => $user->id,
                    'service_code' => $serviceCode,
                    'country' => $country,
                    'max_price' => $maxPrice,
                    'response' => $result
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to purchase number',
                    'error' => $result['error'] ?? 'Unknown error'
                ], 400);
            }

            // Convert USD cost -> NGN with markup applied
            $cost = (float) $result['cost'];
            $exchangeRate = (float) service_settings()->grizzly_sms_exc_rate;
            $markupPercentage = (float) service_settings()->grizzly_sms_top_up;

            $finalAmount = round($cost * $exchangeRate * (1 + ($markupPercentage / 100)), 2);

            if (!$user->hasSufficientBalance($finalAmount)) {
                $this->grizzly->cancelActivation($result['activation_id']);
                DB::rollBack();
                Log::warning('Insufficient balance for GrizzlySMS number purchase', [
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
            $expiresAt = now()->addSeconds((int) config('grizzly-sms.activation_timeout', 1200));

            // Create purchased number record
            $purchasedNumber = PurchasedNumber::create([
                'user_id' => $user->id,
                'service_id' => $service->id,
                'activation_id' => $result['activation_id'],
                'phone_number' => $result['phone_number'],
                'service_code' => $serviceCode,
                'country_code' => $result['country_code'],
                'operator' => null,
                'cost' => $finalAmount,
                'currency' => $result['currency'],
                'status' => 'waiting',
                'activation_time' => $result['activation_time'],
                'expires_at' => $expiresAt,
                'can_request_another_sms' => $result['can_get_another_sms'] == 1,
                'provider' => 'grizzlysms',
            ]);

            Log::info('GrizzlySMS number purchased successfully', [
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
                        'provider' => $purchasedNumber->provider,
                        'expires_at' => $purchasedNumber->expires_at->toDateTimeString(),
                        'can_request_another_sms' => $purchasedNumber->can_request_another_sms,
                    ],
                    'balance' => [
                        'previous' => $user->balance + $finalAmount,
                        'current' => $user->balance
                    ]
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Exception during GrizzlySMS number purchase', [
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
     * Poll for OTP status (getStatusV2)
     * GET /api/v1/grizzlysms/{id}/status
     */
    public function getStatus($id): JsonResponse
    {
        try {
            $user = auth()->user();
            $purchasedNumber = PurchasedNumber::where('id', $id)
                ->where('user_id', $user->id)
                ->where('provider', 'grizzlysms')
                ->lockForUpdate()
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

            // Already terminal - prevent duplicate refunds / stale polling
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
                    ->where('status', 'waiting')
                    ->update(['status' => 'expired']);

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

            // Get status from GrizzlySMS API (getStatusV2)
            $result = $this->grizzly->getStatus($purchasedNumber->activation_id);

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to get status',
                    'error' => $result['error'] ?? 'Unknown error'
                ], 400);
            }

            if ($result['status'] === 'received' && !empty($result['code'])) {
                $purchasedNumber->markAsReceived($result['code'], $result['text'] ?? null);

                return response()->json([
                    'success' => true,
                    'data' => [
                        'status' => 'received',
                        'otp_code' => $result['code'],
                        'sms_text' => $result['text'] ?? null,
                        'received_at' => $purchasedNumber->code_received_at->toDateTimeString(),
                    ]
                ], 200);
            }

            if ($result['status'] === 'cancelled') {
                $purchasedNumber->markAsCancelled();

                return response()->json([
                    'success' => false,
                    'message' => 'Activation cancelled by provider',
                    'status' => 'cancelled'
                ], 400);
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
     * Request another SMS on the same number (status=3)
     * POST /api/v1/grizzlysms/{id}/request-sms
     */
    public function requestAnotherSms($id): JsonResponse
    {
        try {
            $user = auth()->user();
            $purchasedNumber = PurchasedNumber::where('id', $id)
                ->where('user_id', $user->id)
                ->where('provider', 'grizzlysms')
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

            $result = $this->grizzly->requestAnotherSms($purchasedNumber->activation_id);

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
     * Cancel a number activation (status=8) and refund
     * POST /api/v1/grizzlysms/{id}/cancel
     */
    public function cancel($id): JsonResponse
    {
        try {
            $user = auth()->user();
            $purchasedNumber = PurchasedNumber::where('id', $id)
                ->where('user_id', $user->id)
                ->where('provider', 'grizzlysms')
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

            $result = $this->grizzly->cancelActivation($purchasedNumber->activation_id);

            if (!$result['success']) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to cancel activation',
                    'error' => $result['error'] ?? 'Unknown error'
                ], 400);
            }

            $purchasedNumber->markAsCancelled();

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
     * Mark activation as completed (status=6)
     * POST /api/v1/grizzlysms/{id}/complete
     */
    public function complete($id): JsonResponse
    {
        try {
            $user = auth()->user();
            $purchasedNumber = PurchasedNumber::where('id', $id)
                ->where('user_id', $user->id)
                ->where('provider', 'grizzlysms')
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

            $result = $this->grizzly->finishActivation($purchasedNumber->activation_id);

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to complete activation',
                    'error' => $result['error'] ?? 'Unknown error'
                ], 400);
            }

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
