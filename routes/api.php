<?php

use App\Http\Controllers\ForgotPasswordController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\RegisterController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

// Public routes (no authentication required)
Route::prefix('auth')->group(function () {
    // Registration
    Route::post('/register', [RegisterController::class, 'register']);
    Route::get('/verify-email/{token}', [RegisterController::class, 'verifyEmail']);

    // Login
    Route::post('/login', [LoginController::class, 'login']);

    // Password Reset
    Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLink']);
    Route::post('/reset-password', [ForgotPasswordController::class, 'resetPassword']);
    Route::get('/verify-reset-token/{token}/{email}', [ForgotPasswordController::class, 'verifyResetToken']);
});

// Protected routes (authentication required)
Route::middleware('auth:sanctum')->prefix('auth')->group(function () {
    // User info
    Route::get('/me', [LoginController::class, 'me']);

    // Logout
    Route::post('/logout', [LoginController::class, 'logout']);
    Route::post('/logout-all', [LoginController::class, 'logoutAll']);

    // Resend verification email
    Route::post('/resend-verification', [RegisterController::class, 'resendVerification']);
});

/*
|--------------------------------------------------------------------------
| API Routes (Add your other routes below)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    // Add your other authenticated routes here
    // Example: SMS service routes, number purchase routes, etc.
});
