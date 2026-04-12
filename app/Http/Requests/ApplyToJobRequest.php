<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class ApplyToJobRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'first_name' => 'required|string|max:20',
            'last_name'  => 'required|string|max:20',
            'email'      => 'required|email',
            'phone'      => 'required|string|max:20',
            'resume'     => 'required|file|mimes:pdf|max:2048',
        ];
    }
}
