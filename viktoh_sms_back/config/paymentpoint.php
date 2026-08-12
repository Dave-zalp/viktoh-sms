<?php

return [
    'api_url' => env('PAYMENTPOINT_API_URL', 'https://api.paymentpoint.co/api/v1'),

    'api_key' => env('PAYMENTPOINT_API_KEY', ''),

    'api_secret' => env('PAYMENTPOINT_API_SECRET', ''),

    'security_key' => env('PAYMENTPOINT_API_SECRET', ''),

    'business_id' => env('PAYMENTPOINT_BUSINESS_ID', ''),

    'bank_codes' => [
        'palmpay' => '20946',
        'opay' => '20897',
    ],

    'default_bank_codes' => ['20946', '20897'],

    'timeout' => env('PAYMENTPOINT_TIMEOUT', 30),
];
