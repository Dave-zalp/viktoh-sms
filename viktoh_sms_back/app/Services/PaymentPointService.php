<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentPointService
{
    protected $apiUrl;
    protected $apiKey;
    protected $apiSecret;
    protected $businessId;
    protected $timeout;

    public function __construct()
    {
        $this->apiUrl = config('paymentpoint.api_url');
        $this->apiKey = config('paymentpoint.api_key');
        $this->apiSecret = config('paymentpoint.api_secret');
        $this->businessId = config('paymentpoint.business_id');
        $this->timeout = config('paymentpoint.timeout');
    }

    /**
     * Create virtual account for customer
     */
    public function createVirtualAccount($email, $name, $phoneNumber, $bankCodes = null)
    {
        try {
            if (!$bankCodes) {
                $bankCodes = config('paymentpoint.default_bank_codes');
            }

            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $this->apiSecret,
                    'api-key' => $this->apiKey,
                    'Content-Type' => 'application/json',
                ])
                ->post($this->apiUrl . '/createVirtualAccount', [
                    'email' => $email,
                    'name' => $name,
                    'phoneNumber' => $phoneNumber,
                    'bankCode' => $bankCodes,
                    'businessId' => $this->businessId,
                ]);

            $data = $response->json();

            if ($response->successful() && isset($data['status']) && $data['status'] === 'success') {
                return [
                    'success' => true,
                    'data' => $data
                ];
            }

            return [
                'success' => false,
                'error' => $data['message'] ?? 'Failed to create virtual account',
                'data' => $data
            ];

        } catch (\Exception $e) {
            Log::error('PaymentPoint createVirtualAccount error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}
