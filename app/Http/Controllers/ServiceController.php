<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Services\SmsActivateService;

class ServiceController extends Controller
{
    protected $smsActivate;

    public function __construct(SmsActivateService $smsActivate)
    {
        $this->smsActivate = $smsActivate;
    }

    /**
     * Get list of available services
     *
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Get services from database (cached/local)
            $localServices = Service::active()->ordered()->get();

            // Optionally sync with API
            if ($request->has('sync') && $request->sync == 'true') {
                $apiResult = $this->smsActivate->getServicesList();

                if ($apiResult['success']) {
                    return response()->json([
                        'success' => true,
                        'data' => [
                            'local_services' => $localServices,
                            'api_services' => $apiResult['services']
                        ]
                    ], 200);
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'services' => $localServices
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch services',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available countries (English names only, visible countries)
     *
     * @return JsonResponse
     */
    public function getCountries(): JsonResponse
    {
        try {
            $result = $this->smsActivate->getCountries();

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'countries' => $result['countries']
                    ]
                ], 200);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch countries',
                'error' => $result['error'] ?? 'Unknown error'
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch countries',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get prices for a service
     *
     * @param Request $request
     * @return JsonResponse
     */
    // public function getPrices(Request $request): JsonResponse
    // {
    //     try {
    //         $service = $request->input('service');
    //         $country = $request->input('country');

    //         $result = $this->smsActivate->getPrices($service, $country);

    //         if ($result['success']) {
    //             return response()->json([
    //                 'success' => true,
    //                 'data' => $result['prices']
    //             ], 200);
    //         }

    //         // Log failed API response
    //         Log::error('Failed to fetch prices from SMSActivate API', [
    //             'service' => $service,
    //             'country' => $country,
    //             'response' => $result
    //         ]);

    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Failed to fetch prices',
    //             'error' => $result['error'] ?? 'Unknown error'
    //         ], 400);

    //     } catch (\Exception $e) {

    //         // Log unexpected exceptions
    //         Log::error('Exception occurred while fetching prices', [
    //             'service' => $request->input('service'),
    //             'country' => $request->input('country'),
    //             'error' => $e->getMessage(),
    //             'trace' => $e->getTraceAsString()
    //         ]);

    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Failed to fetch prices',
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }

    public function getPrices(Request $request): JsonResponse
    {
        try {
            $service = $request->input('service');   // e.g. "xk"
            $country = $request->input('country');   // e.g. "2"

            // 1. Fetch real-time prices using getTopCountriesByService
            $result = $this->smsActivate->getTopCountriesByService($service);

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch prices',
                    'error' => $result['error'] ?? 'Unknown error'
                ], 400);
            }

            $countries = $result['countries'];

            // 2. Ensure the country ID exists in API response
            if (!array_key_exists($country, $countries)) {
                return response()->json([
                    'success' => false,
                    'message' => "No price data found for country {$country}"
                ], 404);
            }

            $countryData = $countries[$country];

            // 3. Build required response format
            $responseData = [
                $country => [
                    $service => [
                        "cost"           => $countryData["price"],                    // your marked-up price
                        "count"          => $countryData["count"] ?? 0,               // available numbers
                        "physicalCount"  => $countryData["retail_price"] ?? 0,        // mapped as you required
                        "original_cost"  => $countryData["original_price"]
                                            ?? $countryData["price"]                  // original API price
                    ]
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $responseData
            ], 200);

        } catch (\Exception $e) {

            Log::error('Exception occurred while fetching prices', [
                'service' => $request->input('service'),
                'country' => $request->input('country'),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch prices',
                'error' => $e->getMessage()
            ], 500);
        }
    }




    /**
     * Get top countries for a service
     *
     * @param string $serviceCode
     * @return JsonResponse
     */
    public function getTopCountries($serviceCode): JsonResponse
    {
        try {
            $result = $this->smsActivate->getTopCountriesByService($serviceCode, true);

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'countries' => $result['countries']
                    ]
                ], 200);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch top countries',
                'error' => $result['error'] ?? 'Unknown error'
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch top countries',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available services for a specific country
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getServicesForCountry(Request $request): JsonResponse
    {
        $countryId = $request->input('country');

        if (!$countryId) {
            return response()->json([
                'success' => false,
                'message' => 'Country ID is required'
            ], 400);
        }

        try {
            $operator = $request->input('operator');
            $result = $this->smsActivate->getServicesForCountry($countryId, $operator);

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'services' => $result['services'],
                        'total_services' => $result['total_services']
                    ]
                ], 200);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch services for country',
                'error' => $result['error'] ?? 'Unknown error'
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch services for country',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
