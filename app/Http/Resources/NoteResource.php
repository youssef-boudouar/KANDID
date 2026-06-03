<?php
namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;

class NoteResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'             => $this->id,
            'content'        => $this->content,
            'application_id' => $this->application_id,
            'user'           => $this->whenLoaded('user', fn() => [
                'id'            => $this->user->id,
                'name'          => $this->user->name,
                'profile_photo' => $this->user->profile_photo,
            ]),
            'created_at'     => $this->created_at,
        ];
    }
}
