<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Application extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'candidate_id',
        'job_offer_id',
        'status',
        'kanban_order',
    ];

    public function candidate()
    {
        return $this->belongsTo(Candidate::class);
    }

    public function jobOffer()
    {
        return $this->belongsTo(JobOffer::class);
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }
}
