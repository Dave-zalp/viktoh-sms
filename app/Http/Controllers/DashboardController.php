<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\PurchasedNumber;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function stats(Request $request): JsonResponse
    {
        $user = auth()->user();

        // Wallet balance
        $walletBalance = $user->balance;

        // Total SMS purchases
        $totalSmsPurchases = PurchasedNumber::where('user_id', $user->id)->where('status','completed')->count();

        // Total recharge (sum of all credit/deposit transactions)
        $totalRecharge = Transaction::where('user_id', $user->id)
            ->where('type', 'credit')
            ->sum('amount');

        return response()->json([
            'success' => true,
            'data' => [
                'wallet_balance' => floatval($walletBalance),
                'total_sms_purchases' => $totalSmsPurchases,
                'total_recharge' => floatval($totalRecharge),
            ]
        ], 200);
    }


    public function balance(Request $request): JsonResponse
    {
        $user = auth()->user();

        // Wallet balance
        $walletBalance = $user->balance;

        return response()->json([
            'success' => true,
            'data' => [
                'wallet_balance' => floatval($walletBalance),
            ]
        ], 200);
    }
}
