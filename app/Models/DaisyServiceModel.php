<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DaisyServiceModel extends Model
{
    //
    use HasFactory;

    protected $fillable = [
        'key_name',
        'name',
        'cost',
    ];

   public static function getCostByKeyName(string $keyName): ?float
    {
        $service = self::where('key_name', $keyName)->first();

        return $service?->cost ? (float) $service->cost : 0.8;
    }
}
