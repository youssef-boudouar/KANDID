<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    protected $fillable = [
        'company_id',
        'name',
        'color',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function jobOffers()
    {
        return $this->belongsToMany(JobOffer::class, 'job_offer_tag');
    }
}
