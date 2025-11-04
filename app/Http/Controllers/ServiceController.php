<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Services\SmsActivateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
    public function getPrices(Request $request): JsonResponse
    {
        try {
            $service = $request->input('service');
            $country = $request->input('country');

            $result = $this->smsActivate->getPrices($service, $country);

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'prices' => $result['prices']
                    ]
                ], 200);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch prices',
                'error' => $result['error'] ?? 'Unknown error'
            ], 400);

        } catch (\Exception $e) {
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
