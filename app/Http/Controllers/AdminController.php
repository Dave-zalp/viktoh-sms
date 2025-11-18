<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Transaction;
use Illuminate\Http\Request;
use App\Models\PurchasedNumber;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    //
    public function stats(): JsonResponse
    {
        try {
            // Basic counts
            $totalUsers = User::where('role', '!=', 'admin')->count();

            $successfulStatuses = ['completed', 'received'];

           $totalFailedOrders = PurchasedNumber::whereNotIn('status', $successfulStatuses)->count();
           $totalPassedOrder = PurchasedNumber::whereIn('status', $successfulStatuses)->count();
            $totalTransactions = Transaction::count();

            // Total revenue from successful transactions
            $totalRevenue = Transaction::where('type', 'credit')->sum('amount');

            return response()->json([
                'success' => true,
                'message' => 'Dashboard statistics loaded successfully.',
                'data' => [
                    'total_users' => $totalUsers,
                    'total_failed_orders' => $totalFailedOrders,
                    'total_passed_orders' => $totalPassedOrder,
                    'total_transactions' => $totalTransactions,
                    'total_revenue' => number_format($totalRevenue, 2, '.', ''),
                ],
            ], 200);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Failed to load dashboard stats.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
