<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    /**
     * Handle user login
     *
     * @param LoginRequest $request
     * @return JsonResponse
     * @throws ValidationException
     */
    public function login(LoginRequest $request): JsonResponse
    {
        // Check rate limiting
        $this->ensureIsNotRateLimited($request);

        try {
            // Find user by username or email
            $user = User::findByUsernameOrEmail($request->login);

            // Check if user exists and password is correct
            if (!$user || !Hash::check($request->password, $user->password)) {
                RateLimiter::hit($this->throttleKey($request), 60);

                throw ValidationException::withMessages([
                    'login' => ['The provided credentials are incorrect.'],
                ]);
            }

            // Clear rate limiter on successful login
            RateLimiter::clear($this->throttleKey($request));

            // Check if email is verified (optional - uncomment if you want to enforce)
            // if (!$user->is_email_verified) {
            //     return response()->json([
            //         'success' => false,
            //         'message' => 'Please verify your email address before logging in.',
            //     ], 403);
            // }

            // Revoke all existing tokens (optional - for single device login)
            // $user->tokens()->delete();

            // Generate new API token
            $token = $user->createToken('auth_token')->plainTextToken;

            // Update last login (if you have this field).
            // $user->update(['last_login_at' => now()]);

            $userData = [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'is_email_verified' => $user->is_email_verified,
                'balance' => $user->formatted_balance,
                'created_at' => $user->created_at->toDateTimeString(),
            ];

            // Add role ONLY if user is admin
            if ($user->role === 'admin') {
                $userData['role'] = 'admin';
            }

            return response()->json([
                'success' => true,
                'message' => 'Login successful!',
                'data' => [
                    'user' => $userData,
                    'token' => $token,
                    'token_type' => 'Bearer',
                ],
            ], 200);

        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login failed. Please try again.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle user logout
     *
     * @return JsonResponse
     */
    public function logout(): JsonResponse
    {
        // Revoke current token
        auth()->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully!',
        ], 200);
    }

    /**
     * Logout from all devices
     *
     * @return JsonResponse
     */
    public function logoutAll(): JsonResponse
    {
        // Revoke all tokens
        auth()->user()->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out from all devices successfully!',
        ], 200);
    }

    /**
     * Get authenticated user
     *
     * @return JsonResponse
     */
    public function me(): JsonResponse
    {
        $user = auth()->user();

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'is_email_verified' => $user->is_email_verified,
                    'balance' => $user->formatted_balance,
                    'created_at' => $user->created_at->toDateTimeString(),
                ],
            ],
        ], 200);
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @param LoginRequest $request
     * @return void
     * @throws ValidationException
     */
    protected function ensureIsNotRateLimited(LoginRequest $request): void
    {
        if (!RateLimiter::tooManyAttempts($this->throttleKey($request), 5)) {
            return;
        }

        $seconds = RateLimiter::availableIn($this->throttleKey($request));

        throw ValidationException::withMessages([
            'login' => [
                trans('Too many login attempts. Please try again in :seconds seconds.', [
                    'seconds' => $seconds,
                ])
            ],
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     *
     * @param LoginRequest $request
     * @return string
     */
    protected function throttleKey(LoginRequest $request): string
    {
        return Str::transliterate(Str::lower($request->input('login')) . '|' . $request->ip());
    }
}
