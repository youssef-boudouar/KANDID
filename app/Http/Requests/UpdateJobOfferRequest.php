<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class UpdateJobOfferRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title'       => 'required|string|max:50',
            'description' => 'required|string',
            'status'      => 'required|string|in:draft,active,archived',
        ];
    }
}
