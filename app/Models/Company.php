<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $fillable = [
        'name',
        'domain',
        'subscription_status',
        'settings',
    ];

    protected function casts(): array
    {
        return [
            'settings' => 'array',
        ];
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
    public function jobOffers()
    {
        return $this->hasMany(JobOffer::class);
    }
}
