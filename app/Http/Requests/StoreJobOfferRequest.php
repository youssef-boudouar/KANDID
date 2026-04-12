<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class StoreJobOfferRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title'       => 'required|string|max:50',
            'description' => 'required|string',
            'status'      => 'nullable|string|in:draft,active,archived',
        ];
    }
}
