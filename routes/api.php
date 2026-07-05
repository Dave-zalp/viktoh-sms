<?php

use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\NumberController;
use App\Http\Controllers\BalanceController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\WebhookController;
use App\Http\Controllers\DaisySmsController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\ForgotPasswordController;
use App\Http\Controllers\VirtualAccountController;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;




Route::post('/webhook/paymentpoint', [WebhookController::class, 'paymentPointWebhook'])->withoutMiddleware(VerifyCsrfToken::class);
Route::post('/webhook/pocketfi', [WebhookController::class, 'pocketFiWebhook'])->withoutMiddleware(VerifyCsrfToken::class);
Route::post('/webhook/sms-activate', [WebhookController::class, 'handleSmsWebhook'])->withoutMiddleware(VerifyCsrfToken::class);
Route::post('/webhook/daisysms', [WebhookController::class, 'handleDaisyWebhook'])->withoutMiddleware(VerifyCsrfToken::class);
Route::post('/webhook/korapay', [WebhookController::class, 'KoraPayWebhook'])->withoutMiddleware(VerifyCsrfToken::class);


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
    // */
    // Route::prefix('numbers')->group(function () {
    //     Route::post('/purchase', [NumberController::class, 'purchase']); // POST /api/v1/numbers/purchase
    //     Route::get('/my-numbers', [NumberController::class, 'myNumbers']); // GET /api/v1/numbers/my-numbers
    //     Route::get('/{id}/status', [NumberController::class, 'getStatus']); // GET /api/v1/numbers/1/status
    //     Route::post('/{id}/request-sms', [NumberController::class, 'requestAnotherSms']); // POST /api/v1/numbers/1/request-sms
    //     Route::post('/{id}/cancel', [NumberController::class, 'cancel']); // POST /api/v1/numbers/1/cancel
    //     Route::post('/{id}/complete', [NumberController::class, 'complete']); // POST /api/v1/numbers/1/complete
    // });

       /*
    |--------------------------------------------------------------------------
    | Virtual Account Routes
    |--------------------------------------------------------------------------
    */
    Route::get('/virtual-account', [VirtualAccountController::class, 'getOrCreateVirtualAccount']);

    Route::prefix('transactions')->group(function () {
        Route::get('/me', [TransactionController::class, 'myTransactions']);
    });


    Route::get('/dashboard/stats', [DashboardController::class, 'stats']); // GET /api/v1/dashboard/stats
    Route::get('/dashboard/balance', [DashboardController::class, 'balance']);

    Route::prefix('daisysms')->group(function () {
        Route::get('/balance', [DaisySmsController::class, 'balance']);
        Route::get('/services', [DaisySmsController::class, 'getServices']);
        Route::post('/rent', [DaisySmsController::class, 'rentNumber']);
        Route::get('/{id}/get-code', [DaisySmsController::class, 'getCode']);
        Route::post('/{id}/mark-done', [DaisySmsController::class, 'markDone']);
        Route::post('/{id}/cancel', [DaisySmsController::class, 'cancel']);
    });

    Route::middleware('admin')->prefix('admin')->group(function(){

      Route::get('/dashboard/stats', [AdminController::class, 'stats']);
      Route::get('/dashboard/recent-stats', [AdminController::class, 'recentStats']);
      Route::get('/getUsers', [AdminController::class, 'getUsers']);
      Route::post('/update-balance', [AdminController::class, 'updateBalance']);

      # transaction
      Route::get('/getTransactions', [AdminController::class, 'gettrxs']);

      # orders
      Route::get('/getOrder', [AdminController::class, 'getOrders']);

      #settings
      Route::get('/settings/rate-topup', [AdminController::class, 'getRate_Topup']);
      Route::put('/settings/rate-topup', [AdminController::class, 'updateRate_Topup']);

    });




});
