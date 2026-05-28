<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Company extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'domain',
        'subscription_status',
        'settings',
        'logo',
        'description',
        'website',
        'created_by',
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

    public function tags()
    {
        return $this->hasMany(Tag::class);
    }
}
