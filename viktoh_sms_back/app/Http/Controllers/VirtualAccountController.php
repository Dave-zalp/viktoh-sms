<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\VirtualAccount;
use App\Services\PaymentPointService;
use App\Services\PocketFiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VirtualAccountController extends Controller
{
    protected PaymentPointService $paymentPoint;
    protected PocketFiService $pocketFi;

    public function __construct(PaymentPointService $paymentPoint, PocketFiService $pocketFi)
    {
        $this->paymentPoint = $paymentPoint;
        $this->pocketFi     = $pocketFi;
    }

    /**
     * Return the user's virtual account (any provider), generating one via PocketFi if none exists.
     */
    public function getOrCreateVirtualAccount(Request $request): JsonResponse
    {
        $user = auth()->user();

        $virtualAccount = VirtualAccount::where('user_id', $user->id)
            ->whereIn('provider', ['pocketfi', 'paymentpoint'])
            ->first();

        if ($virtualAccount) {
            return response()->json([
                'success' => true,
                'message' => 'Virtual account retrieved',
                'data' => [
                    'virtual_account' => [
                        'bank_name'      => $virtualAccount->bank_name,
                        'account_number' => $virtualAccount->account_number,
                        'account_name'   => $virtualAccount->account_name,
                        'provider'       => $virtualAccount->provider,
                    ],
                ],
            ], 200);
        }

        // No account found — generate one via PocketFi
        $nameParts = explode(' ', trim($user->username), 2);
        $firstName = $nameParts[0];
        $lastName  = $nameParts[1] ?? $nameParts[0];

        $result = $this->pocketFi->createStaticVirtualAccount(
            $firstName,
            $lastName,
            $user->phone_number,
            $user->email
        );

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create virtual account',
                'error'   => $result['error'] ?? 'Unknown error',
            ], 400);
        }

        $bankAccount = $result['data']['banks'][0] ?? null;

        if (!$bankAccount) {
            return response()->json([
                'success' => false,
                'message' => 'No bank account returned from PocketFi',
            ], 400);
        }

        $virtualAccount = VirtualAccount::create([
            'user_id'        => $user->id,
            'customer_name' => $user->username,
            'customer_email' => $user->email,
            'customer_phone' => $user->phone,
            'provider'       => 'pocketfi',
            'account_number' => $bankAccount['accountNumber'],
            'account_name'   => $bankAccount['accountName'],
            'bank_name'      => $bankAccount['bankName'],
            'business_id'    => $result['data']['businessId'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Virtual account created successfully',
            'data' => [
                'virtual_account' => [
                    'bank_name'      => $virtualAccount->bank_name,
                    'account_number' => $virtualAccount->account_number,
                    'account_name'   => $virtualAccount->account_name,
                    'provider'       => $virtualAccount->provider,
                ],
            ],
        ], 201);
    }
}
