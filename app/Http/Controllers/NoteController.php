<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\JobOffer;
use App\Models\Note;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    public function index(Request $request, $applicationId)
    {
        $application = Application::findOrFail($applicationId);

        $jobOffer = JobOffer::findOrFail($application->job_offer_id);

        if ($jobOffer->company_id !== $request->user()->company_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $notes = Note::where('application_id', $application->id)->with('user:id,name')->orderBy('created_at', 'desc')->get();

        return response()->json($notes);
    }

    public function store(Request $request, $applicationId)
    {
        $application = Application::findOrFail($applicationId);

        $jobOffer = JobOffer::findOrFail($application->job_offer_id);

        if ($jobOffer->company_id !== $request->user()->company_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $note = Note::create([
            'user_id' => $request->user()->id,
            'application_id' => $application->id,
            'content' => $validated['content'],
        ]);

        $note->load('user:id,name');

        return response()->json($note, 201);
    }

    public function destroy(Request $request, $id)
    {   
        $note = Note::findOrFail($id);

        $application = Application::findOrFail($note->application_id);

        $jobOffer = JobOffer::findOrFail($application->job_offer_id);

        if ($jobOffer->company_id !== $request->user()->company_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($note->user_id !== $request->user()->id) {
            return response()->json(['message' => 'You can only delete your own notes'], 403);
        }

        $note->delete();

        return response()->json(['message' => 'Note deleted']);
    }
}
