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
}
