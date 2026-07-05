<?php

namespace App\Http\Controllers;

use App\Models\PaymentIntent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class KoraPayController extends Controller
{
    /**
     * Create a pending payment intent and return the reference/public key
     * the frontend needs to call Korapay.initialize().
     */
    public function initialize(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 400);
        }

        $user = $request->user();
        $reference = 'VKT-' . strtoupper(Str::random(8)) . '-' . strtoupper(Str::random(5));

        $paymentIntent = PaymentIntent::create([
            'user_id'  => $user->id,
            'gateway'  => 'korapay',
            'reference' => $reference,
            'amount'   => $request->amount,
            'currency' => 'NGN',
            'status'   => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'public_key' => config('korapay.public_key'),
                'reference'  => $paymentIntent->reference,
                'amount'     => (float) $paymentIntent->amount,
                'currency'   => $paymentIntent->currency,
                'customer'   => [
                    'name'  => $user->username ?? $user->name,
                    'email' => $user->email,
                ],
            ],
        ], 200);
    }
}
