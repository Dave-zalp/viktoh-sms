<?php

return [
    /*
    |--------------------------------------------------------------------------
    | SMS-Activate API Configuration
    |--------------------------------------------------------------------------
    */

    'api_key' => env('SMS_ACTIVATE_API_KEY', ''),

    'api_url' => env('SMS_ACTIVATE_API_URL', 'https://hero-sms.com/stubs/handler_api.php'),

    'default_country' => env('SMS_ACTIVATE_DEFAULT_COUNTRY', 187), // USA

    'timeout' => env('SMS_ACTIVATE_TIMEOUT', 30),

    /*
    |--------------------------------------------------------------------------
    | Pricing Configuration
    |--------------------------------------------------------------------------
    */

    'markup_percentage' => env('SMS_ACTIVATE_MARKUP', 20), // Add 20% markup to API prices

    'exchange_rate' => env('SMS_ACTIVATE_EXCHANGE_RATE', 1500), // Dollar to Naira

    /*
    |--------------------------------------------------------------------------
    | Default Settings
    |--------------------------------------------------------------------------
    */

    'default_operator' => env('SMS_ACTIVATE_DEFAULT_OPERATOR', 'any'),

    'activation_timeout' => env('SMS_ACTIVATE_ACTIVATION_TIMEOUT', 1200), // 20 minutes
];
