<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchasedNumber extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'service_id',
        'activation_id',
        'phone_number',
        'service_code',
        'country_code',
        'operator',
        'cost',
        'currency',
        'status',
        'otp_code',
        'sms_text',
        'activation_time',
        'code_received_at',
        'expires_at',
        'can_request_another_sms',
        'provider',
        'daisy_service_name'
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'cost' => 'decimal:2',
            'currency' => 'integer',
            'activation_time' => 'datetime',
            'code_received_at' => 'datetime',
            'expires_at' => 'datetime',
            'can_request_another_sms' => 'boolean',
        ];
    }

    /**
     * Get the user that owns the number
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the service for this number
     */
    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Get transaction for this number
     */
    public function transaction()
    {
        return $this->hasOne(Transaction::class);
    }

    /**
     * Scope for active numbers
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['waiting', 'received']);
    }

    /**
     * Scope for waiting numbers
     */
    public function scopeWaiting($query)
    {
        return $query->where('status', 'waiting');
    }

    /**
     * Scope for received numbers
     */
    public function scopeReceived($query)
    {
        return $query->where('status', 'received');
    }

    /**
     * Scope for completed numbers
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope for user's numbers
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Check if number is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at && now()->greaterThan($this->expires_at);
    }

    /**
     * Check if can request another SMS
     */
    public function canRequestAnotherSms(): bool
    {
        return $this->can_request_another_sms && $this->status === 'waiting';
    }

    /**
     * Mark as received
     */
    public function markAsReceived($code, $smsText = null)
    {
        $this->update([
            'status' => 'received',
            'otp_code' => $code,
            'sms_text' => $smsText,
            'code_received_at' => now(),
        ]);
    }

    /**
     * Mark as completed
     */
    public function markAsCompleted()
    {
        $this->update([
            'status' => 'completed',
        ]);
    }

    /**
     * Mark as cancelled
     */
    public function markAsCancelled()
    {
        $this->update([
            'status' => 'cancelled',
        ]);
    }

    /**
     * Mark as expired
     */
    public function markAsExpired()
    {
        $this->update([
            'status' => 'expired',
        ]);
    }
}
