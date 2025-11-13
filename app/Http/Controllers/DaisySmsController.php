<?php

namespace App\Http\Controllers;

use App\Services\DaisySmsService;
use Illuminate\Http\Request;

class DaisySmsController extends Controller
{
    protected DaisySmsService $daisy;

    public function __construct(DaisySmsService $daisy)
    {
        $this->daisy = $daisy;
    }

    /**
     * Get account balance
     */
    public function balance()
    {
        return response()->json($this->daisy->getBalance());
    }

        /**
     * Get USA services with markup applied
     */
    public function getServices(Request $request)
    {

        $result = $this->daisy->getServicesWithMarkup();

        return response()->json($result);
    }

    /**
     * Rent a USA number for a service
     */
    public function rentNumber(Request $request)
    {
        $request->validate([
            'service' => 'required|string',
            'max_price' => 'nullable|numeric',
        ]);

        $result = $this->daisy->rentNumber(
            $request->service,
            $request->max_price ?? 5.5
        );

        return response()->json($result);
    }

    /**
     * Get code for rented number
     */
    public function getCode(Request $request)
    {
        $request->validate(['activation_id' => 'required|integer']);

        $result = $this->daisy->getStatus($request->activation_id);

        return response()->json($result);
    }

    /**
     * Mark rental as done
     */
    public function markDone(Request $request)
    {
        $request->validate(['activation_id' => 'required|integer']);

        $result = $this->daisy->markAsDone($request->activation_id);

        return response()->json($result);
    }

    /**
     * Cancel rental
     */
    public function cancel(Request $request)
    {
        $request->validate(['activation_id' => 'required|integer']);

        $result = $this->daisy->cancelRental($request->activation_id);

        return response()->json($result);
    }
}
