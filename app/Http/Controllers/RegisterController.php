<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Mail\VerifyEmailMail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class RegisterController extends Controller
{
    /**
     * Handle user registration
     *
     * @param RegisterRequest $request
     * @return JsonResponse
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            // Create the user
            $user = User::create([
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'email_verification_token' => Str::random(64),
            ]);

            // Send email verification mail
            $verificationUrl = config('app.frontend_url') . '/verify-email/' . $user->email_verification_token;
            Mail::to($user->email)->send(new VerifyEmailMail($user, $verificationUrl));

            // Generate API token for the user (using Sanctum)
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Registration successful! Please check your email to verify your account.',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'username' => $user->username,
                        'email' => $user->email,
                        'is_email_verified' => $user->is_email_verified,
                        'balance' => $user->formatted_balance,
                        'created_at' => $user->created_at->toDateTimeString(),
                    ],
                    'token' => $token,
                    'token_type' => 'Bearer',
                ],
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registration failed. Please try again.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Verify user email
     *
     * @param string $token
     * @return JsonResponse
     */
    public function verifyEmail(string $token): JsonResponse
    {
        $user = User::where('email_verification_token', $token)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification token.',
            ], 404);
        }

        if ($user->is_email_verified) {
            return response()->json([
                'success' => false,
                'message' => 'Email already verified.',
            ], 400);
        }

        $user->update([
            'is_email_verified' => true,
            'email_verified_at' => now(),
            'email_verification_token' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Email verified successfully! You can now use all features.',
        ], 200);
    }

    /**
     * Resend verification email
     *
     * @return JsonResponse
     */
    public function resendVerification(): JsonResponse
    {
        $user = auth()->user();

        if ($user->is_email_verified) {
            return response()->json([
                'success' => false,
                'message' => 'Email already verified.',
            ], 400);
        }

        $user->update([
            'email_verification_token' => Str::random(64),
        ]);

        // Send email verification mail
        $verificationUrl = config('app.frontend_url') . '/verify-email/' . $user->email_verification_token;
        Mail::to($user->email)->send(new VerifyEmailMail($user, $verificationUrl));

        return response()->json([
            'success' => true,
            'message' => 'Verification email sent successfully!',
        ], 200);
    }
}
