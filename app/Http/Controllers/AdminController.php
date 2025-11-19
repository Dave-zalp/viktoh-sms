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

   public function recentStats(): JsonResponse
{
    try {
        $limit = request()->get('limit', 10);

        // Recent non-admin users
        $recentUsers = User::where('role', '!=', 'admin')
            ->latest()
            ->take($limit)
            ->get(['id', 'username', 'email', 'balance']);

        // Recent transactions with user email loaded
        $recentTransactions = Transaction::with('user:id,email')
            ->latest()
            ->take($limit)
            ->get(['id', 'user_id', 'type', 'amount', 'reference'])
            ->map(function ($txn) {
                return [
                    'id' => $txn->id,
                    'email' => $txn->user?->email ?? null,
                    'type' => $txn->type,
                    'amount' => $txn->amount,
                    'reference' => $txn->reference,
                ];
            });

        return response()->json([
            'success' => true,
            'message' => 'Recent users and transactions loaded.',
            'data' => [
                'recent_users' => $recentUsers,
                'recent_transactions' => $recentTransactions,
            ]
        ], 200);

    } catch (\Exception $e) {

        return response()->json([
            'success' => false,
            'message' => 'Failed to load recent stats.',
            'error' => $e->getMessage(),
        ], 500);
    }
}

    /**
     * Get all users paginated for admin dashboard.
     */
    public function getUsers(Request $request): JsonResponse
    {
        // Columns you want to return ALWAYS
        $columns = ['username', 'email', 'phone', 'balance'];

        $users = User::query()
            ->select($columns)
            ->latest()
            ->paginate(20); // default pagination

        return response()->json([
            'status' => true,
            'message' => 'Users fetched successfully',
            'data' => $users
        ]);
    }


}
