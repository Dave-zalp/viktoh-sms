<?php

namespace App\Services;

use App\Models\DaisyServiceModel;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class DaisySmsService
{
    protected string $baseUrl = 'https://daisysms.io/stubs/handler_api.php';
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
    public function getServicesWithMarkup(): array
    {
        $response = Http::timeout(30)->get($this->baseUrl, [
            'api_key' => $this->apiKey,
            'action'  => 'getPricesVerification',
        ]);

        if (!$response->ok()) {
            Log::error('DaisySMS getPricesVerification: non-200 response', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to fetch service list',
                'data'    => []
            ];
        }

        $data = $response->json();
        if (empty($data) || !is_array($data)) {
            Log::error('DaisySMS getPricesVerification: empty/non-JSON response', [
                'status' => $response->status(),
                'body'   => $response->body(),
                'api_key_set' => !empty($this->apiKey),
            ]);

            return [
                'success' => false,
                'message' => 'No data found',
                'data'    => []
            ];
        }

        $dollar_rate      = (float) service_settings()->daisy_sms_exc_rate;
        $markupPercentage = (float) service_settings()->daisy_sms_top_up;

        $services = [];

        foreach ($data as $serviceCode => $value) {
            if (!isset($value['cost'])) {
                continue;
            }

            $originalCost = (float) $value['cost'];
            $finalCost    = round($originalCost * (1 + ($markupPercentage / 100)) * $dollar_rate, 2);

            $services[] = [
                'service_code' => $serviceCode,
                'service_name' => ucwords(str_replace(['_', '-'], ' ', $serviceCode)),
                'final_cost'   => $finalCost,
                'count'        => $value['count'] ?? 0,
                'multi'        => $value['multi'] ?? 0,
            ];
        }

        return [
            'success'        => true,
            'message'        => 'Services fetched successfully',
            'total_services' => count($services),
            'data'           => $services,
        ];
    }

    /**
     * Get the raw USD cost for a single service from the DaisySMS API
     */
    public function getServicePrice(string $serviceCode): float
    {
        $response = Http::timeout(15)->get($this->baseUrl, [
            'api_key' => $this->apiKey,
            'action'  => 'getPricesVerification',
        ]);

        if (!$response->ok()) {
            return 0.0;
        }

        $data = $response->json();
        return isset($data[$serviceCode]['cost']) ? (float) $data[$serviceCode]['cost'] : 0.0;
    }

    /**
     * Rent a new USA number for a specific service
     */
     public function rentNumber(string $service, float $maxPrice = 5.5): array
        {
            $response = Http::get($this->baseUrl, [
                'api_key'   => $this->apiKey,
                'action'    => 'getNumber',
                'service'   => $service,
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

        if (str_starts_with($body, 'ACCESS_ACTIVATION')) {
            return ['success' => true, 'message' => 'ACCESS_ACTIVATION'];
        }

        if (str_starts_with($body, 'ACCESS_CANCEL')) {
            return ['success' => true, 'message' => 'ACCESS_CANCEL'];
        }

        if (str_starts_with($body, 'ACCESS_NUMBER')) {
            return [
                'success' => true,
                'rental_id' => $parts[1] ?? null,
                'phone_number' => $parts[2] ?? null,
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
