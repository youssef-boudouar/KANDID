<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CompanyController extends Controller
{
    private function isOwner(Request $request): bool
    {
        return $request->user()->company?->created_by === $request->user()->id;
    }

    public function show(Request $request)
    {
        $company = $request->user()->company;
        return response()->json(array_merge($company->toArray(), [
            'is_owner' => $company?->created_by === $request->user()->id,
        ]));
    }

    public function update(Request $request)
    {
        if (!$this->isOwner($request)) {
            return response()->json(['message' => 'Only the company owner can edit the company profile.'], 403);
        }
        $validated = $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'website'     => 'nullable|url|max:255',
        ]);

        $request->user()->company->update($validated);

        return response()->json($request->user()->company);
    }

    public function uploadLogo(Request $request)
    {
        if (!$this->isOwner($request)) {
            return response()->json(['message' => 'Only the company owner can edit the company profile.'], 403);
        }
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $company = $request->user()->company;

        if ($company->logo) {
            Storage::disk('public')->delete($company->logo);
        }

        $path = $request->file('logo')->store('company-logos', 'public');
        $company->update(['logo' => $path]);

        return response()->json(['logo' => $path]);
    }

    public function deleteLogo(Request $request)
    {
        if (!$this->isOwner($request)) {
            return response()->json(['message' => 'Only the company owner can edit the company profile.'], 403);
        }
        $company = $request->user()->company;

        if ($company->logo) {
            Storage::disk('public')->delete($company->logo);
            $company->update(['logo' => null]);
        }

        return response()->json(['message' => 'Logo removed']);
    }
}
