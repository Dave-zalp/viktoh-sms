<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Mail\ResetPasswordMail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Ramsey\Uuid\Type\Decimal;

class ForgotPasswordController extends Controller
{
    /**
     * Send password reset link
     *
     * @param ForgotPasswordRequest $request
     * @return JsonResponse
     */
    public function sendResetLink(ForgotPasswordRequest $request): JsonResponse
    {
        try {
            $user = User::where('email', $request->email)->first();

            // Generate reset token
            $token = Str::random(64);

            // Store token in password_reset_tokens table
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $request->email],
                [
                    'token' => Hash::make($token),
                    'created_at' => now(),
                ]
            );

            // Send email with reset link
            $resetUrl = config('app.frontend_url') . '/reset-password?token=' . $token . '&email=' . urlencode($request->email);
            Mail::to($user->email)->send(new ResetPasswordMail($user, $resetUrl));

            return response()->json([
                'success' => true,
                'message' => 'Password reset link sent to your email!',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send reset link. Please try again.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reset password
     *
     * @param ResetPasswordRequest $request
     * @return JsonResponse
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        try {
            // Find password reset record
            $passwordReset = DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->first();

            // Check if record exists
            if (!$passwordReset) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired reset token.',
                ], 400);
            }

            // Verify token
            if (!Hash::check($request->token, $passwordReset->token)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired reset token.',
                ], 400);
            }

            // Check if token is expired (10 minutes)
            if (now()->diffInMinutes($passwordReset->created_at) > 10) {
                return response()->json([
                    'success' => false,
                    'message' => 'Reset token has expired. Please request a new one.',
                ], 400);
            }

            // Update user password
            $user = User::where('email', $request->email)->first();
            $user->update([
                'password' => Hash::make($request->password),
            ]);

            // Delete password reset record
            DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->delete();

            // Revoke all tokens (force logout from all devices)
            $user->tokens()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Password reset successfully! Please login with your new password.',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reset password. Please try again.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Verify reset token validity
     *
     * @param string $token
     * @param string $email
     * @return JsonResponse
     */
    public function verifyResetToken(string $token, string $email): JsonResponse
    {
        $passwordReset = DB::table('password_reset_tokens')
            ->where('email', urldecode($email))
            ->first();

        if (!$passwordReset) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid reset token.',
            ], 400);
        }

        if (!Hash::check($token, $passwordReset->token)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid reset token.',
            ], 400);
        }

        if (now()->diffInMinutes($passwordReset->created_at) > 10) {
            return response()->json([
                'success' => false,
                'message' => 'Reset token has expired.',
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Token is valid.',
        ], 200);
    }
}
