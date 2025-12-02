<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServicesettingsModel extends Model
{
    //

        protected $fillable = [
        'sms_activate_exc_rate',
        'sms_activate_top_up',
        'daisy_sms_exc_rate',
        'daisy_sms_top_up',
    ];
    
}
