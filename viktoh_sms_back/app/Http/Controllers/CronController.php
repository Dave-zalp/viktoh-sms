<?php

namespace App\Http\Controllers;

use App\Models\PurchasedNumber;
use App\Models\Transaction;
use Illuminate\Http\Request;

class CronController extends Controller
{
    //
    // public function refundDaisy()
    // {
    //     $getRefunds = PurchasedNumber::where('status', 'waiting')
    //         ->whereNull('otp_code')
    //         ->whereNull('sms_text')
    //         ->where('created_at', '<=', now()->subMinutes(25))
    //         ->get();

    //     return $getRefunds;
    // }

}
