<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'company_id', 'user_id', 'type',
        'subject_type', 'subject_id', 'description', 'metadata',
    ];

    protected $casts = [
        'metadata'   => 'array',
        'created_at' => 'datetime',
    ];

    public static function log(
        int $companyId,
        ?int $userId,
        string $type,
        string $subjectType,
        int $subjectId,
        string $description,
        array $metadata = []
    ): void {
        static::create([
            'company_id'   => $companyId,
            'user_id'      => $userId,
            'type'         => $type,
            'subject_type' => $subjectType,
            'subject_id'   => $subjectId,
            'description'  => $description,
            'metadata'     => $metadata ?: null,
        ]);
    }
}
