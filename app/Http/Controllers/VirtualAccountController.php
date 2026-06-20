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
     * Generate or retrieve PaymentPoint virtual account for authenticated user
     */
    public function generateVirtualAccount(Request $request): JsonResponse
    {
        $user = auth()->user();

        // Check if user already has a virtual account
        $existingAccount = VirtualAccount::where('user_id', $user->id)
            ->where('provider', 'paymentpoint')
            ->first();

        if ($existingAccount) {
            return response()->json([
                'success' => true,
                'message' => 'Virtual account already exists',
                'data' => [
                    'virtual_account' => [
                        'bank_name' => $existingAccount->bank_name,
                        'account_number' => $existingAccount->account_number,
                        'account_name' => $existingAccount->account_name,
                        'bank_code' => $existingAccount->bank_code,
                    ]
                ]
            ], 200);
        }

        // Create new virtual account via PaymentPoint API
        $result = $this->paymentPoint->createVirtualAccount(
            $user->email,
            $user->username,
            $user->phone_number
        );

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create virtual account',
                'error' => $result['error'] ?? 'Unknown error'
            ], 400);
        }

        $data = $result['data'];

        // Store virtual account details (first bank account from response)
        $bankAccount = $data['bankAccounts'][0] ?? null;

        if (!$bankAccount) {
            return response()->json([
                'success' => false,
                'message' => 'No bank account returned from PaymentPoint'
            ], 400);
        }

        $virtualAccount = VirtualAccount::create([
            'user_id' => $user->id,
            'provider' => 'paymentpoint',
            'customer_id' => $data['customer']['customer_id'],
            'customer_name' => $data['customer']['customer_name'],
            'customer_email' => $data['customer']['customer_email'],
            'customer_phone_number' => $data['customer']['customer_phone_number'],
            'business_id' => $data['business']['business_Id'],
            'bank_code' => $bankAccount['bankCode'],
            'account_number' => $bankAccount['accountNumber'],
            'account_name' => $bankAccount['accountName'],
            'bank_name' => $bankAccount['bankName'],
            'reserved_account_id' => $bankAccount['Reserved_Account_Id'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Virtual account created successfully',
            'data' => [
                'virtual_account' => [
                    'bank_name' => $virtualAccount->bank_name,
                    'account_number' => $virtualAccount->account_number,
                    'account_name' => $virtualAccount->account_name,
                    'bank_code' => $virtualAccount->bank_code,
                ]
            ]
        ], 201);
    }

    /**
     * Get user's PaymentPoint virtual account
     */
    public function getVirtualAccount(Request $request): JsonResponse
    {
        $user = auth()->user();

        $virtualAccount = VirtualAccount::where('user_id', $user->id)
            ->where('provider', 'paymentpoint')
            ->first();

        if (!$virtualAccount) {
            return response()->json([
                'success' => false,
                'message' => 'No virtual account found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'virtual_account' => [
                    'bank_name' => $virtualAccount->bank_name,
                    'account_number' => $virtualAccount->account_number,
                    'account_name' => $virtualAccount->account_name,
                    'bank_code' => $virtualAccount->bank_code,
                ]
            ]
        ], 200);
    }

    /**
     * Generate or retrieve PocketFi virtual account for authenticated user
     */
    public function generatePocketFiAccount(Request $request): JsonResponse
    {
        $user = auth()->user();

        $existing = VirtualAccount::where('user_id', $user->id)
            ->where('provider', 'pocketfi')
            ->first();

        if ($existing) {
            return response()->json([
                'success' => true,
                'message' => 'Virtual account already exists',
                'data' => [
                    'virtual_account' => [
                        'bank_name'      => $existing->bank_name,
                        'account_number' => $existing->account_number,
                        'account_name'   => $existing->account_name,
                    ],
                ],
            ], 200);
        }

        // Parse username into first/last name for PocketFi
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
                ],
            ],
        ], 201);
    }

    /**
     * Get user's PocketFi virtual account
     */
    public function getPocketFiAccount(Request $request): JsonResponse
    {
        $user = auth()->user();

        $virtualAccount = VirtualAccount::where('user_id', $user->id)
            ->where('provider', 'pocketfi')
            ->first();

        if (!$virtualAccount) {
            return response()->json([
                'success' => false,
                'message' => 'No PocketFi virtual account found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'virtual_account' => [
                    'bank_name'      => $virtualAccount->bank_name,
                    'account_number' => $virtualAccount->account_number,
                    'account_name'   => $virtualAccount->account_name,
                ],
            ],
        ], 200);
    }
}
