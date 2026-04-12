<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class MoveApplicationRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'status'       => 'required|string|in:screening,interview,technical,hired,rejected',
            'kanban_order' => 'required|integer|min:0',
        ];
    }
}
