<?php
namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;

class ApplicationResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'           => $this->id,
            'status'       => $this->status,
            'kanban_order' => $this->kanban_order,
            'candidate'    => new CandidateResource($this->whenLoaded('candidate')),
            'job_offer'    => $this->whenLoaded('jobOffer', fn() => [
                'id'    => $this->jobOffer->id,
                'title' => $this->jobOffer->title,
            ]),
            'created_at'   => $this->created_at,
            'updated_at'   => $this->updated_at,
        ];
    }
}
