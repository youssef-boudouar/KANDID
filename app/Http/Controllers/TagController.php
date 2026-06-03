<?php

namespace App\Http\Controllers;

use App\Models\JobOffer;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TagController extends Controller
{
    public function index(Request $request)
    {
        $tags = Tag::where('company_id', $request->user()->company_id)->get();
        return response()->json($tags);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:30',
            'color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        $tag = Tag::create(array_merge($validated, [
            'company_id' => $request->user()->company_id,
        ]));

        return response()->json($tag, 201);
    }

    public function update(Request $request, $id)
    {
        $tag = Tag::where('company_id', $request->user()->company_id)->findOrFail($id);

        $validated = $request->validate([
            'name'  => 'required|string|max:30',
            'color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        $tag->update($validated);
        return response()->json($tag);
    }

    public function destroy(Request $request, $id)
    {
        $tag = Tag::where('company_id', $request->user()->company_id)->findOrFail($id);
        $tag->jobOffers()->detach();
        $tag->delete();
        return response()->json(['message' => 'Tag deleted']);
    }

    public function attachToJob(Request $request, $jobId)
    {
        $jobOffer = JobOffer::forCompany($request->user()->company_id)->findOrFail($jobId);
        $companyId = $request->user()->company_id;
        $validated = $request->validate([
            'tag_ids'   => 'nullable|array',
            'tag_ids.*' => [
                'integer',
                Rule::exists('tags', 'id')->where('company_id', $companyId),
            ],
        ]);
        $jobOffer->tags()->sync($validated['tag_ids'] ?? []);
        return response()->json($jobOffer->load('tags'));
    }

    public function detachFromJob(Request $request, $jobId, $tagId)
    {
        $jobOffer = JobOffer::forCompany($request->user()->company_id)->findOrFail($jobId);
        $jobOffer->tags()->detach($tagId);
        return response()->json(['message' => 'Tag removed']);
    }
}
