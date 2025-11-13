<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DaisySmsService
{
    protected string $baseUrl = 'https://daisysms.com/stubs/handler_api.php';
    protected string $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.daisysms.key'); // store API key in config/services.php
    }

    /**
     * Get account balance
     */
    public function getBalance()
    {
        $response = Http::get($this->baseUrl, [
            'api_key' => $this->apiKey,
            'action'  => 'getBalance',
        ]);

        return $response->body();
    }

    /**
     * Get Services
     */
   /**
     * Fetch all services for USA and apply markup
     *
     * @param float $markupPercentage  e.g. 20 for 20% increase
     * @param int $countryCode         default = 187 (USA)
     * @return array
     */
    public function getServicesWithMarkup(float $markupPercentage = 20.0, int $countryCode = 187): array
    {
        $response = Http::timeout(30)->get($this->baseUrl, [
            'api_key' => $this->apiKey,
            'action'  => 'getPricesVerification',
        ]);

        if (!$response->ok()) {
            return [
                'success' => false,
                'message' => 'Failed to fetch service list',
                'data'    => []
            ];
        }

        $data = $response->json();
        if (empty($data) || !is_array($data)) {
            return [
                'success' => false,
                'message' => 'No data found',
                'data'    => []
            ];
        }

        $services = [];

        foreach ($data as $serviceCode => $value) {
            if (!isset($value[$countryCode])) {
                continue; // skip non-USA services
            }

            $service = $value[$countryCode];

            $originalCost = (float) $service['cost'];
            $dollar_rate = 1500;
            $markupAmount = $originalCost * ($markupPercentage / 100) * $dollar_rate;
            $finalCost = round($originalCost + $markupAmount, 2);

            $services[] = [
                'service_code'   => $serviceCode,
                'service_name'   => $service['name'],
                'final_cost'     => $finalCost,
                'time_to_live'   => $service['ttl'],
            ];
        }

        return [
            'success' => true,
            'message' => 'Services fetched successfully',
            'total_services' => count($services),
            'data' => $services,
        ];
    }

    /**
     * Rent a new USA number for a specific service
     */
    public function rentNumber(string $service, float $maxPrice = 5.5)
    {
        $response = Http::get($this->baseUrl, [
            'api_key'   => $this->apiKey,
            'action'    => 'getNumber',
            'service'   => $service,
            'max_price' => $maxPrice,
            'country'   => 187, // USA country code in Daisy API
        ]);

        return $this->parseApiResponse($response->body());
    }

    /**
     * Get SMS code for the rented number
     */
    public function getStatus(int $activationId)
    {
        $response = Http::get($this->baseUrl, [
            'api_key' => $this->apiKey,
            'action'  => 'getStatus',
            'id'      => $activationId,
        ]);

        return $this->parseApiResponse($response->body());
    }

    /**
     * Mark rental as done
     */
    public function markAsDone(int $activationId)
    {
        $response = Http::get($this->baseUrl, [
            'api_key' => $this->apiKey,
            'action'  => 'setStatus',
            'id'      => $activationId,
            'status'  => 6,
        ]);

        return $this->parseApiResponse($response->body());
    }

    /**
     * Cancel rental
     */
    public function cancelRental(int $activationId)
    {
        $response = Http::get($this->baseUrl, [
            'api_key' => $this->apiKey,
            'action'  => 'setStatus',
            'id'      => $activationId,
            'status'  => 8,
        ]);

        return $this->parseApiResponse($response->body());
    }

    /**
     * Parse and standardize API response
     */
    protected function parseApiResponse(string $body): array
    {
        $parts = explode(':', $body);

        if (str_starts_with($body, 'ACCESS_BALANCE')) {
            return ['success' => true, 'balance' => $parts[1] ?? null];
        }

        if (str_starts_with($body, 'ACCESS_NUMBER')) {
            return [
                'success' => true,
                'activation_id' => $parts[1] ?? null,
                'phone' => $parts[2] ?? null,
            ];
        }

        if (str_starts_with($body, 'STATUS_OK')) {
            return [
                'success' => true,
                'code' => $parts[1] ?? null,
            ];
        }

        return ['success' => false, 'message' => $body];
    }
}
