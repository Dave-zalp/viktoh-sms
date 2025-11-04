<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BalanceController extends Controller
{
    /**
     * Get user's current balance
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            $user = auth()->user();

            return response()->json([
                'success' => true,
                'data' => [
                    'balance' => $user->balance,
                    'formatted_balance' => $user->formatted_balance
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch balance',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's transaction history
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function transactions(Request $request): JsonResponse
    {
        try {
            $user = auth()->user();
            $type = $request->input('type'); // debit, credit, refund

            $query = Transaction::where('user_id', $user->id)
                ->orderBy('created_at', 'desc');

            if ($type) {
                $query->where('type', $type);
            }

            $transactions = $query->paginate(20);

            return response()->json([
                'success' => true,
                'data' => [
                    'transactions' => $transactions->items(),
                    'pagination' => [
                        'current_page' => $transactions->currentPage(),
                        'per_page' => $transactions->perPage(),
                        'total' => $transactions->total(),
                        'last_page' => $transactions->lastPage(),
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch transactions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add balance (credit) - For testing or admin use
     * In production, this should be replaced with actual payment gateway integration
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function addBalance(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:1|max:10000',
            'description' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            $user = auth()->user();
            $amount = $request->amount;
            $description = $request->description ?? 'Balance top-up';

            // Add balance
            $transaction = $user->addBalance($amount, $description, 'credit');

            return response()->json([
                'success' => true,
                'message' => 'Balance added successfully',
                'data' => [
                    'transaction' => [
                        'id' => $transaction->id,
                        'amount' => $transaction->amount,
                        'type' => $transaction->type,
                        'description' => $transaction->description,
                        'balance_before' => $transaction->balance_before,
                        'balance_after' => $transaction->balance_after,
                        'created_at' => $transaction->created_at->toDateTimeString(),
                    ],
                    'current_balance' => $user->balance
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add balance',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get balance summary
     *
     * @return JsonResponse
     */
    public function summary(): JsonResponse
    {
        try {
            $user = auth()->user();

            $totalSpent = Transaction::where('user_id', $user->id)
                ->where('type', 'debit')
                ->sum('amount');

            $totalAdded = Transaction::where('user_id', $user->id)
                ->where('type', 'credit')
                ->sum('amount');

            $totalRefunded = Transaction::where('user_id', $user->id)
                ->where('type', 'refund')
                ->sum('amount');

            $activePurchases = $user->purchasedNumbers()
                ->whereIn('status', ['waiting', 'received'])
                ->count();

            $completedPurchases = $user->purchasedNumbers()
                ->where('status', 'completed')
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'current_balance' => $user->balance,
                    'total_spent' => $totalSpent,
                    'total_added' => $totalAdded,
                    'total_refunded' => $totalRefunded,
                    'active_purchases' => $activePurchases,
                    'completed_purchases' => $completedPurchases,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch balance summary',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
