<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'username',
        'email',
        'password',
        'is_email_verified',
        'balance',
        'email_verification_token',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'email_verification_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_email_verified' => 'boolean',
            'balance' => 'decimal:2',
        ];
    }

    /**
     * Check if user can login with username or email
     *
     * @param string $login
     * @return User|null
     */
    public static function findByUsernameOrEmail(string $login)
    {
        return static::where('email', $login)
            ->orWhere('username', $login)
            ->first();
    }

    /**
     * Get user's formatted balance
     *
     * @return string
     */
    public function getFormattedBalanceAttribute(): string
    {
        return number_format($this->balance, 2);
    }
}
