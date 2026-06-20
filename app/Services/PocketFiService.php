<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PocketFiService
{
    protected string $apiUrl;
    protected string $apiToken;
    protected string $businessId;
    protected string $bank;
    protected int $timeout;

    public function __construct()
    {
        $this->apiUrl     = config('pocketfi.api_url');
        $this->apiToken   = config('pocketfi.api_token');
        $this->businessId = config('pocketfi.business_id');
        $this->bank       = config('pocketfi.bank');
        $this->timeout    = config('pocketfi.timeout');
    }

    public function createStaticVirtualAccount(string $firstName, string $lastName, string $phone, string $email): array
    {
        try {
            $payload = [
                'first_name' => $firstName,
                'last_name'  => $lastName,
                'phone'      => $phone,
                'email'      => $email,
                'businessId' => $this->businessId,
                'bank'       => $this->bank,
            ];

            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $this->apiToken,
                    'Content-Type'  => 'application/json',
                    'Accept'        => 'application/json',
                ])
                ->post($this->apiUrl . '/virtual-accounts/create', $payload);

            $data = $response->json();

            Log::info('PocketFi createVirtualAccount response', ['data' => $data]);

            if ($response->successful() && isset($data['status']) && $data['status'] === true && !empty($data['banks'])) {
                return [
                    'success' => true,
                    'data'    => $data,
                ];
            }

            return [
                'success' => false,
                'error'   => $data['message'] ?? 'Failed to create virtual account',
                'data'    => $data,
            ];
        } catch (\Exception $e) {
            Log::error('PocketFi createVirtualAccount error: ' . $e->getMessage());
            return [
                'success' => false,
                'error'   => $e->getMessage(),
            ];
        }
    }
}
