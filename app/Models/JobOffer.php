<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JobOffer extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'company_id',
        'created_by',
        'title',
        'description',
        'status',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'job_offer_tag');
    }

    public function scopeForCompany($query, int $companyId)
    {
        return $query->where('company_id', $companyId);
    }

}