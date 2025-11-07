<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\NumberController;
use App\Http\Controllers\BalanceController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\WebhookController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ForgotPasswordController;
use App\Http\Controllers\VirtualAccountController;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;




Route::post('/webhook/paymentpoint', [WebhookController::class, 'paymentPointWebhook'])->withoutMiddleware(VerifyCsrfToken::class);

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

      /*
    |--------------------------------------------------------------------------
    | Service Routes
    |--------------------------------------------------------------------------
    */
    Route::prefix('services')->group(function () {
        Route::get('/', [ServiceController::class, 'index']); // GET /api/v1/services
        Route::get('/countries', [ServiceController::class, 'getCountries']); // GET /api/v1/services/countries
        Route::get('/by-country', [ServiceController::class, 'getServicesForCountry']); // GET /api/v1/services/by-country?country=187
        Route::get('/prices', [ServiceController::class, 'getPrices']); // GET /api/v1/services/prices
        Route::get('/{serviceCode}/top-countries', [ServiceController::class, 'getTopCountries']); // GET /api/v1/services/wa/top-countries
    });



     /*
    |--------------------------------------------------------------------------
    | Number Purchase & Management Routes
    |--------------------------------------------------------------------------
    */
    Route::prefix('numbers')->group(function () {
        Route::post('/purchase', [NumberController::class, 'purchase']); // POST /api/v1/numbers/purchase
        Route::get('/my-numbers', [NumberController::class, 'myNumbers']); // GET /api/v1/numbers/my-numbers
        Route::get('/{id}/status', [NumberController::class, 'getStatus']); // GET /api/v1/numbers/1/status
        Route::post('/{id}/request-sms', [NumberController::class, 'requestAnotherSms']); // POST /api/v1/numbers/1/request-sms
        Route::post('/{id}/cancel', [NumberController::class, 'cancel']); // POST /api/v1/numbers/1/cancel
        Route::post('/{id}/complete', [NumberController::class, 'complete']); // POST /api/v1/numbers/1/complete
    });


       /*
    |--------------------------------------------------------------------------
    | Balance & Transaction Routes
    |--------------------------------------------------------------------------
    */
    Route::prefix('numbers')->group(function () {
        Route::post('/purchase', [NumberController::class, 'purchase']); // POST /api/v1/numbers/purchase
        Route::get('/my-numbers', [NumberController::class, 'myNumbers']); // GET /api/v1/numbers/my-numbers
        Route::get('/{id}/status', [NumberController::class, 'getStatus']); // GET /api/v1/numbers/1/status
        Route::post('/{id}/request-sms', [NumberController::class, 'requestAnotherSms']); // POST /api/v1/numbers/1/request-sms
        Route::post('/{id}/cancel', [NumberController::class, 'cancel']); // POST /api/v1/numbers/1/cancel
        Route::post('/{id}/complete', [NumberController::class, 'complete']); // POST /api/v1/numbers/1/complete
    });

       /*
    |--------------------------------------------------------------------------
    | Virtual Account Routes
    |--------------------------------------------------------------------------
    */
    Route::prefix('virtual-account')->group(function () {
        Route::post('/generate', [VirtualAccountController::class, 'generateVirtualAccount']); // POST /api/v1/virtual-account/generate
        Route::get('/', [VirtualAccountController::class, 'getVirtualAccount']); // For Admin Use
    });


    Route::get('/dashboard/stats', [DashboardController::class, 'stats']); // GET /api/v1/dashboard/stats




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
