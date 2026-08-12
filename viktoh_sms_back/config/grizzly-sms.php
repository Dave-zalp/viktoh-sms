<?php

return [
    /*
    |--------------------------------------------------------------------------
    | GrizzlySMS API Configuration
    |--------------------------------------------------------------------------
    */

    'api_key' => env('GRIZZLY_SMS_API_KEY', ''),

    'api_url' => env('GRIZZLY_SMS_API_URL', 'https://api.grizzlysms.com/stubs/handler_api.php'),

    'default_country' => env('GRIZZLY_SMS_DEFAULT_COUNTRY', 187), // USA

    'timeout' => env('GRIZZLY_SMS_TIMEOUT', 30),

    /*
    |--------------------------------------------------------------------------
    | Default Settings
    |--------------------------------------------------------------------------
    */

    'default_operator' => env('GRIZZLY_SMS_DEFAULT_OPERATOR', 'any'),

    'activation_timeout' => env('GRIZZLY_SMS_ACTIVATION_TIMEOUT', 1200), // 20 minutes
];
