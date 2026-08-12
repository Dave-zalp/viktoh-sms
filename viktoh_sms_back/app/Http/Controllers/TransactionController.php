<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TransactionController extends Controller
{
    //
    public function myTransactions(Request $request): JsonResponse
    {
        try {
            $user = auth()->user();
            $status = $request->input('status');

            $query = Transaction::where('user_id', $user->id)->orderBy('created_at', 'desc');

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
}
