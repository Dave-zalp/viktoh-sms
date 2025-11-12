<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsActivateService
{
    protected $apiKey;
    protected $apiUrl;
    protected $timeout;

    public function __construct()
    {
        $this->apiKey = config('sms-activate.api_key');
        $this->apiUrl = config('sms-activate.api_url');
        $this->timeout = config('sms-activate.timeout');
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
            Log::error('SMS-Activate getBalance error: ' . $e->getMessage());
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
            Log::error('SMS-Activate getServicesList error: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Get available services with quantities for a specific country
     * Uses the getNumbersStatus endpoint
     */
    public function getServicesForCountry($countryId, $operator = null)
    {
        try {
            $params = [
                'action' => 'getNumbersStatus',
                'country' => $countryId
            ];

            if ($operator) {
                $params['operator'] = $operator;
            }

            $response = $this->makeRequest($params);
            $data = json_decode($response, true);

            if ($data && is_array($data)) {
                // Load service names mapping
                $serviceNames = $this->getServiceNamesMapping();

                // Transform data to include service names
                $services = [];
                foreach ($data as $code => $quantity) {
                    $quantity = intval($quantity);

                    // Only include services with available numbers
                    if ($quantity > 0) {
                        $services[] = [
                            'code' => $code,
                            'name' => $serviceNames[$code] ?? ucfirst($code),
                            'available_count' => $quantity
                        ];
                    }
                }

                // Sort by available count (descending)
                usort($services, function($a, $b) {
                    return $b['available_count'] - $a['available_count'];
                });

                return [
                    'success' => true,
                    'services' => $services,
                    'total_services' => count($services)
                ];
            }

            return $this->handleError($response);
        } catch (\Exception $e) {
            Log::error('SMS-Activate getServicesForCountry error: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Get service names mapping from JSON file or database
     */
    protected function getServiceNamesMapping()
    {
        // Try to load from database first
        $servicesFromDb = \App\Models\Service::pluck('name', 'code')->toArray();

        if (!empty($servicesFromDb)) {
            return $servicesFromDb;
        }

        // Fallback to default mapping
        return $this->getDefaultServiceMapping();
    }

    /**
     * Default service name mapping
     */
    protected function getDefaultServiceMapping()
    {
        return [
            'full' => 'Full Rent',
            'ig' => 'Instagram+Threads',
            'wa' => 'WhatsApp',
            'fb' => 'Facebook',
            'go' => 'Google/YouTube/Gmail',
            'tg' => 'Telegram',
            'am' => 'Amazon',
            'oi' => 'Tinder',
            'mm' => 'Microsoft',
            'ds' => 'Discord',
            'lf' => 'TikTok/Douyin',
            'hw' => 'Alipay/Alibaba/1688',
            'wx' => 'Apple',
            'ni' => 'Gojek',
            'abu' => 'BPJSTK',
            'vi' => 'Viber',
            'wb' => 'WeChat',
            'ka' => 'Shopee',
            'bdp' => 'Kredito',
            'yw' => 'Grindr',
            'gp' => 'Ticketmaster',
            'ot' => 'Any Other',
            'li' => 'Baidu',
            'tm' => 'Akulaku',
            'ju' => 'Indomaret',
            'jg' => 'Grab',
            'tw' => 'Twitter',
            'ev' => 'Picpay',
            'acm' => 'Razer',
            'pm' => 'AOL',
            'nv' => 'Naver',
            'xh' => 'OVO',
            'mb' => 'Yahoo',
            'fr' => 'Dana',
            'vz' => 'Hinge',
            'dh' => 'eBay',
            'ub' => 'Uber',
            'dl' => 'Lazada',
            'me' => 'Line Messenger',
            'ew' => 'Nike',
            'vk' => 'VK.com',
            'asy' => 'Fore Coffee',
            'wr' => 'Walmart',
            'vr' => 'MotorkuX',
            'bw' => 'Signal',
            'df' => 'Happn',
            'ts' => 'PayPal',
            'qf' => 'RedBook',
            'cq' => 'Mercado',
            'ki' => '99app',
            'ya' => 'Yandex/Uber',
            'api' => 'KKTIX',
            'aaa' => 'Nubank',
            'nc' => 'Payoneer',
            'fd' => 'Mamba',
            'nz' => 'Foodpanda',
            'ok' => 'Odnoklassniki',
            'av' => 'Avito',
            'ma' => 'Mail.ru',
            'uk' => 'UKR.net',
            'kp' => 'Kufarby',
            'mt' => 'Rambler',
            'ab' => 'AliExpress',
            'we' => 'WePlay',
            'qw' => 'Qiwi',
            'bd' => 'Badoo',
            'sb' => 'Sberbank',
            'ym' => 'YandexMoney',
            'nf' => 'Netflix',
            'uk' => 'Steam',
            'zn' => 'Zenly',
            'kl' => 'Klarna',
            'ph' => 'PlayerUnknownsBattleGrounds',
            'rg' => 'Rockstar',
            'vp' => 'Vinted',
            'ao' => 'AzarLive',
            'mg' => 'Magnit',
            'sn' => 'OLX',
            'qk' => 'Quikr',
            'tc' => 'Truecaller',
            'gt' => 'GitLab',
            'pr' => 'Proton',
            'mk' => 'TanTan',
            'bt' => 'Bolt',
            'be' => 'BetWinner',
            'be' => 'Bethub',
            'tf' => 'TrueID',
        ];
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
            Log::error('SMS-Activate getCountries error: ' . $e->getMessage());
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
            Log::error('SMS-Activate getCountries error: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Get prices for services by country
     */
    public function getPrices($service = null, $country = null)
        {
            try {
                $params = [
                    'action' => 'getPricesExtended',
                    // 'freePrice' => 'true'
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
                    // Apply markup
                    $markup = config('sms-activate.markup_percentage', 20);
                    $data = $this->applyMarkupToPrices($data, $markup);

                    return [
                        'success' => true,
                        'prices' => $data
                    ];
                }

                return $this->handleError($response);
            } catch (\Exception $e) {
                Log::error('SMS-Activate getPrices error: ' . $e->getMessage());
                return ['success' => false, 'error' => $e->getMessage()];
            }
        }

    /**
     * Get top countries by service
     */
    public function getTopCountriesByService($service, $freePrice = false)
    {
        try {
            $params = [
                'action' => 'getTopCountriesByService',
                'service' => $service
            ];

            if ($freePrice) {
                $params['freePrice'] = 'true';
            }

            $response = $this->makeRequest($params);
            $data = json_decode($response, true);

            if ($data && !isset($data['error'])) {
                // Apply markup
                $markup = config('sms-activate.markup_percentage', 20);
                foreach ($data as &$country) {
                    if (isset($country['price'])) {
                        $country['original_price'] = $country['price'];
                        $country['price'] = $country['price'] * (1 + ($markup / 100));
                    }
                    if (isset($country['retail_price'])) {
                        $country['retail_price'] = $country['retail_price'] * (1 + ($markup / 100));
                    }
                }

                return [
                    'success' => true,
                    'countries' => $data
                ];
            }

            return $this->handleError($response);
        } catch (\Exception $e) {
            Log::error('SMS-Activate getTopCountriesByService error: ' . $e->getMessage());
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
     * Purchase a phone number
     */
    public function getNumber($service, $country = null, $operator = null, $maxPrice = null)
    {
        try {
            $params = [
                'action' => 'getNumberV2',
                'service' => $service
            ];

            if ($country) {
                $params['country'] = $country;
            }

            if ($operator && $operator !== 'any') {
                $params['operator'] = $operator;
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
                    'currency' => $data['currency'] ?? 840,
                    'country_code' => $data['countryCode'],
                    'can_get_another_sms' => $data['canGetAnotherSms'] ?? 0,
                    'activation_time' => $data['activationTime'],
                    'operator' => $data['activationOperator'] ?? null
                ];
            }

            return $this->handleError($response);
        } catch (\Exception $e) {
            Log::error('SMS-Activate getNumber error: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Get activation status and SMS code
     */
    public function getStatus($activationId)
    {
        try {
            $response = $this->makeRequest([
                'action' => 'getStatus',
                'id' => $activationId
            ]);

            // Parse response
            if (str_starts_with($response, 'STATUS_OK:')) {
                $code = str_replace('STATUS_OK:', '', $response);
                return [
                    'success' => true,
                    'status' => 'received',
                    'code' => trim($code)
                ];
            } elseif ($response === 'STATUS_WAIT_CODE') {
                return [
                    'success' => true,
                    'status' => 'waiting',
                    'code' => null
                ];
            } elseif (str_starts_with($response, 'STATUS_WAIT_RETRY:')) {
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
            Log::error('SMS-Activate getStatus error: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Get detailed activation status (Version 2)
     */
    public function getStatusV2($activationId)
    {
        try {
            $response = $this->makeRequest([
                'action' => 'getStatusV2',
                'id' => $activationId
            ]);

            $data = json_decode($response, true);

            if (isset($data['sms']) || isset($data['call'])) {
                return [
                    'success' => true,
                    'data' => $data
                ];
            } elseif ($response === 'STATUS_CANCEL') {
                return [
                    'success' => true,
                    'status' => 'cancelled'
                ];
            }

            return $this->handleError($response);
        } catch (\Exception $e) {
            Log::error('SMS-Activate getStatusV2 error: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Set activation status
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
            Log::error('SMS-Activate setStatus error: ' . $e->getMessage());
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
     * Confirm activation (finish)
     */
    public function finishActivation($activationId)
    {
        return $this->setStatus($activationId, 6);
    }

    /**
     * Request another SMS
     */
    public function requestAnotherSms($activationId)
    {
        return $this->setStatus($activationId, 3);
    }

    /**
     * Get active activations
     */
    public function getActiveActivations()
    {
        try {
            $response = $this->makeRequest([
                'action' => 'getActiveActivations'
            ]);

            $data = json_decode($response, true);

            if (isset($data['status']) && $data['status'] === 'success') {
                return [
                    'success' => true,
                    'activations' => $data['activeActivations']
                ];
            } elseif ($response === 'NO_ACTIVATIONS') {
                return [
                    'success' => true,
                    'activations' => []
                ];
            }

            return $this->handleError($response);
        } catch (\Exception $e) {
            Log::error('SMS-Activate getActiveActivations error: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
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
     * Apply markup to prices
     */
    protected function applyMarkupToPrices(array $data, $markupPercentage)
    {
        foreach ($data as $country => &$services) {
            foreach ($services as $service => &$priceData) {
                if (isset($priceData['cost'])) {
                    $priceData['original_cost'] = $priceData['cost'];
                    $priceData['cost'] = $priceData['cost'] * (1 + ($markupPercentage / 100));
                }
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
            if (str_contains($response, $key)) {
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
