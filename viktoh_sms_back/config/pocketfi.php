<?php

return [
    'api_url'        => env('POCKETFI_API_URL', 'https://pocketfi.ng/api/v1'),
    'api_token'      => env('POCKETFI_API_TOKEN', ''),
    'business_id'    => env('POCKETFI_BUSINESS_ID', ''),
    'bank'           => env('POCKETFI_BANK', 'paga'),
    'webhook_secret' => env('POCKETFI_WEBHOOK_SECRET', ''),
    'timeout'        => env('POCKETFI_TIMEOUT', 30),
];
