<?php

use App\Models\ServicesettingsModel;

if (! function_exists('service_settings')) {
    function service_settings()
    {
        return cache()->remember('service_settings', 3600, function () {
            return ServicesettingsModel::first() ?? ServicesettingsModel::create();
        });
    }
}
