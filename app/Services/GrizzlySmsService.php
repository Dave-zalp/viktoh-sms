<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GrizzlySmsService
{
    protected $apiKey;
    protected $apiUrl;
    protected $timeout;

    public function __construct()
    {
        $this->apiKey = config('grizzly-sms.api_key');
        $this->apiUrl = config('grizzly-sms.api_url');
        $this->timeout = config('grizzly-sms.timeout');
    }

    /**
     * Get account balance
     */
    public function getBalance()
    {
        try {
            $response = $this->makeRequest([
                'action' => 'getBalance'
            ]);

            if (str_starts_with($response, 'ACCESS_BALANCE:')) {
                $balance = str_replace('ACCESS_BALANCE:', '', $response);
                return [
                    'success' => true,
                    'balance' => floatval($balance)
                ];
            }

            return $this->handleError($response);
        } catch (\Exception $e) {
            Log::error('GrizzlySMS getBalance error: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Get list of available services
     */
    public function getServicesList($country = null, $lang = 'en')
    {
        try {
            $params = [
                'action' => 'getServicesList',
                'lang' => $lang
            ];

            if ($country) {
                $params['country'] = $country;
            }

            $response = $this->makeRequest($params);
            $data = json_decode($response, true);

            if (isset($data['status']) && $data['status'] === 'success') {
                return [
                    'success' => true,
                    'services' => $data['services']
                ];
            }

            return $this->handleError($response);
        } catch (\Exception $e) {
            Log::error('GrizzlySMS getServicesList error: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Get available countries
     */
    public function getCountries()
    {
        try {
            $response = $this->makeRequest([
                'action' => 'getCountries'
            ]);

            $data = json_decode($response, true);

            if ($data) {
                // Transform data to cleaner format with English names
                $countries = [];
                foreach ($data as $country) {
                    if (isset($country['visible']) && $country['visible'] == 1) {
                        $countries[] = [
                            'id' => $country['id'],
                            'name' => $country['eng'],
                            'retry_available' => $country['retry'] == 1,
                            'rent_available' => $country['rent'] == 1,
                            'multi_service_available' => $country['multiService'] == 1
                        ];
                    }
                }

                return [
                    'success' => true,
                    'countries' => $countries
                ];
            }

            return $this->handleError($response);
        } catch (\Exception $e) {
            Log::error('GrizzlySMS getCountries error: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Get available countries (full data)
     */
    public function getCountriesRaw()
    {
        try {
            $response = $this->makeRequest([
                'action' => 'getCountries'
            ]);

            $data = json_decode($response, true);

            if ($data) {
                return [
                    'success' => true,
                    'countries' => $data
                ];
            }

            return $this->handleError($response);
        } catch (\Exception $e) {
            Log::error('GrizzlySMS getCountries error: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Get prices for services by country.
     * GrizzlySMS response shape: { "Country": { "Service": { "cost": Cost, "count": Quantity } } }
     */
    public function getPrices($service = null, $country = null)
    {
        try {
            $params = [
                'action' => 'getPrices'
            ];

            if ($service) {
                $params['service'] = $service;
            }

            if ($country) {
                $params['country'] = $country;
            }

            $response = $this->makeRequest($params);
            $data = json_decode($response, true);

            if ($data) {
                // Apply markup + naira conversion
                $data = $this->applyMarkupToPrices($data);

                return [
                    'success' => true,
                    'prices' => $data
                ];
            }

            return $this->handleError($response);
        } catch (\Exception $e) {
            Log::error('GrizzlySMS getPrices error: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Get country name by ID
     */
    public function getCountryName($countryId)
    {
        $result = $this->getCountriesRaw();

        if ($result['success'] && isset($result['countries'])) {
            foreach ($result['countries'] as $country) {
                if ($country['id'] == $countryId) {
                    return $country['eng'];
                }
            }
        }

        return null;
    }

    /**
     * Purchase a phone number (getNumberV2)
     */
    public function getNumber($service, $country = null, $maxPrice = null)
    {
        try {
            $params = [
                'action' => 'getNumberV2',
                'service' => $service
            ];

            if ($country) {
                $params['country'] = $country;
            }

            if ($maxPrice) {
                $params['maxPrice'] = $maxPrice;
            }

            $response = $this->makeRequest($params);
            $data = json_decode($response, true);

            if (isset($data['activationId'])) {
                return [
                    'success' => true,
                    'activation_id' => $data['activationId'],
                    'phone_number' => $data['phoneNumber'],
                    'cost' => $data['activationCost'],
                    'currency' => $data['currency'] ?? 643,
                    'country_code' => $data['countryCode'],
                    'can_get_another_sms' => $data['canGetAnotherSms'] ?? 0,
                    'activation_time' => $data['activationTime'],
                    'activation_end' => $data['activationEnd'] ?? null,
                ];
            }

            return $this->handleError($response);
        } catch (\Exception $e) {
            Log::error('GrizzlySMS getNumber error: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Get activation status and SMS code (getStatusV2)
     */
    public function getStatus($activationId)
    {
        try {
            $response = $this->makeRequest([
                'action' => 'getStatusV2',
                'id' => $activationId
            ]);

            $data = json_decode($response, true);

            if (isset($data['sms']) && !empty($data['sms']['code'])) {
                return [
                    'success' => true,
                    'status' => 'received',
                    'code' => $data['sms']['code'],
                    'text' => $data['sms']['text'] ?? null,
                    'received_at' => $data['sms']['dateTime'] ?? null,
                ];
            } elseif ($response === 'STATUS_WAIT_CODE') {
                return [
                    'success' => true,
                    'status' => 'waiting',
                    'code' => null
                ];
            } elseif (str_starts_with((string) $response, 'STATUS_WAIT_RETRY:')) {
                return [
                    'success' => true,
                    'status' => 'waiting_retry',
                    'code' => null
                ];
            } elseif ($response === 'STATUS_CANCEL') {
                return [
                    'success' => true,
                    'status' => 'cancelled',
                    'code' => null
                ];
            }

            return $this->handleError($response);
        } catch (\Exception $e) {
            Log::error('GrizzlySMS getStatus error: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Set activation status
     *
     * @param int|string $activationId
     * @param int $status -1 cancel, 1 ready, 3 retry, 6 complete, 8 cancel
     */
    public function setStatus($activationId, $status)
    {
        try {
            $response = $this->makeRequest([
                'action' => 'setStatus',
                'id' => $activationId,
                'status' => $status
            ]);

            if (in_array($response, ['ACCESS_READY', 'ACCESS_RETRY_GET', 'ACCESS_ACTIVATION', 'ACCESS_CANCEL'])) {
                return [
                    'success' => true,
                    'message' => $response
                ];
            }

            return $this->handleError($response);
        } catch (\Exception $e) {
            Log::error('GrizzlySMS setStatus error: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Cancel activation
     */
    public function cancelActivation($activationId)
    {
        return $this->setStatus($activationId, 8);
    }

    /**
     * Confirm activation (finish/complete)
     */
    public function finishActivation($activationId)
    {
        return $this->setStatus($activationId, 6);
    }

    /**
     * Request another SMS on the same number
     */
    public function requestAnotherSms($activationId)
    {
        return $this->setStatus($activationId, 3);
    }

    /**
     * Inform the provider the number is ready / sms was sent to it
     */
    public function markNumberReady($activationId)
    {
        return $this->setStatus($activationId, 1);
    }

    /**
     * Make API request
     */
    protected function makeRequest(array $params)
    {
        $params['api_key'] = $this->apiKey;

        $response = Http::timeout($this->timeout)
            ->get($this->apiUrl, $params);

        return $response->body();
    }

    /**
     * Apply markup + USD -> NGN conversion to raw provider prices.
     *
     * Input shape:  { "Country": { "Service": { "cost": Cost, "count": Quantity } } }
     * Output adds:  original_cost (USD) alongside cost (converted to NGN with markup)
     */
    protected function applyMarkupToPrices(array $data)
    {
        $exchangeRate = (float) service_settings()->grizzly_sms_exc_rate;
        $markupPercentage = (float) service_settings()->grizzly_sms_top_up;

        foreach ($data as $country => &$services) {
            if (!is_array($services)) {
                continue;
            }

            foreach ($services as $service => &$priceData) {
                if (!is_array($priceData) || !isset($priceData['cost'])) {
                    continue;
                }

                $priceData['original_cost'] = $priceData['cost'];
                $priceData['cost'] = round(($priceData['original_cost'] * (1 + ($markupPercentage / 100))) * $exchangeRate, 2);
            }
        }

        return $data;
    }

    /**
     * Handle API errors
     */
    protected function handleError($response)
    {
        $errorMessages = [
            'BAD_KEY' => 'Invalid API key',
            'BAD_ACTION' => 'Invalid action',
            'BAD_SERVICE' => 'Invalid service name',
            'BAD_STATUS' => 'Invalid status',
            'NO_NUMBERS' => 'No numbers available',
            'NO_BALANCE' => 'Insufficient balance',
            'NO_ACTIVATION' => 'Activation not found',
            'BANNED' => 'Account is banned',
            'ERROR_SQL' => 'Database error',
            'WRONG_MAX_PRICE' => 'Maximum price is too low',
            'WRONG_EXCEPTION_PHONE' => 'Invalid phone exception',
            'CHANNELS_LIMIT' => 'Account is blocked',
            'EARLY_CANCEL_DENIED' => 'Cannot cancel within first 2 minutes'
        ];

        foreach ($errorMessages as $key => $message) {
            if (str_contains((string) $response, $key)) {
                return [
                    'success' => false,
                    'error' => $message,
                    'raw_response' => $response
                ];
            }
        }

        return [
            'success' => false,
            'error' => 'Unknown error occurred',
            'raw_response' => $response
        ];
    }
}
