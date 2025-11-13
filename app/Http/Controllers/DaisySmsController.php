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
    public function balance()
    {
        return response()->json($this->daisy->getBalance());
    }

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
            $exchangeRate = (float)config('daisyrent.exchange_rate', 1500);
            $markupPercentage = (float)config('daisyrent.markup_percentage', 20);

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
                'provider' => 'daisysms'
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
    public function getCode(Request $request)
    {
        $request->validate(['activation_id' => 'required|integer']);

        $result = $this->daisy->getStatus($request->activation_id);

        return response()->json($result);
    }

    /**
     * Mark rental as done
     */
    public function markDone(Request $request)
    {
        $request->validate(['activation_id' => 'required|integer']);

        $result = $this->daisy->markAsDone($request->activation_id);

        return response()->json($result);
    }

    /**
     * Cancel rental
     */
    public function cancel(Request $request)
    {
        $request->validate(['activation_id' => 'required|integer']);

        $result = $this->daisy->cancelRental($request->activation_id);

        return response()->json($result);
    }
}
