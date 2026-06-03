<?php
namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;

class JobOfferResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                 => $this->id,
            'title'              => $this->title,
            'description'        => $this->description,
            'status'             => $this->status,
            'applications_count' => $this->applications_count ?? 0,
            'pipeline'           => [
                'screening' => $this->screening_count ?? 0,
                'interview'  => $this->interview_count  ?? 0,
                'technical'  => $this->technical_count  ?? 0,
                'hired'      => $this->hired_count      ?? 0,
                'rejected'   => $this->rejected_count   ?? 0,
            ],
            'tags'               => $this->whenLoaded('tags', fn() =>
                $this->tags->map(fn($t) => ['id' => $t->id, 'name' => $t->name, 'color' => $t->color])
            ),
            'created_at'         => $this->created_at,
            'updated_at'         => $this->updated_at,
        ];
    }
}
