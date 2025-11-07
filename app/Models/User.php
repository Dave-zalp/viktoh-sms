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
        'phone_number',
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

    /**
     * Get user's purchased numbers
     */
    public function purchasedNumbers()
    {
        return $this->hasMany(PurchasedNumber::class);
    }

    /**
     * Get user's transactions
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Get user's active numbers
     */
    public function activeNumbers()
    {
        return $this->hasMany(PurchasedNumber::class)->active();
    }

    /**
     * Deduct balance for number purchase
     */
    public function deductBalance($amount, $description, $purchasedNumber = null)
    {
        $balanceBefore = $this->balance;
        $this->balance -= $amount;
        $this->save();

        return Transaction::create([
            'user_id' => $this->id,
            'purchased_number_id' => $purchasedNumber?->id,
            'type' => 'debit',
            'amount' => $amount,
            'balance_before' => $balanceBefore,
            'balance_after' => $this->balance,
            'description' => $description,
            'reference' => $purchasedNumber?->activation_id,
        ]);
    }

    /**
     * Add balance (credit/refund)
     */
    public function addBalance($amount, $description, $type = 'credit', $purchasedNumber = null)
    {
        $balanceBefore = $this->balance;
        $this->balance += $amount;
        $this->save();

        return Transaction::create([
            'user_id' => $this->id,
            'purchased_number_id' => $purchasedNumber?->id,
            'type' => $type,
            'amount' => $amount,
            'balance_before' => $balanceBefore,
            'balance_after' => $this->balance,
            'description' => $description,
            'reference' => $purchasedNumber?->activation_id,
        ]);
    }

    /**
     * Check if user has sufficient balance
     */
    public function hasSufficientBalance($amount): bool
    {
        return $this->balance >= $amount;
    }
}
