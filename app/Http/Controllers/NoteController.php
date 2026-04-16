<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Note;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    public function index(Request $request, $applicationId)
    {
        $application = Application::whereHas('jobOffer', function ($query) use ($request) {
            $query->where('company_id', $request->user()->company_id);
        })->findOrFail($applicationId);

        $notes = Note::where('application_id', $application->id)
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($notes);
    }

    public function store(Request $request, $applicationId)
    {
        $application = Application::whereHas('jobOffer', function ($query) use ($request) {
            $query->where('company_id', $request->user()->company_id);
        })->findOrFail($applicationId);

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
        $note = Note::whereHas('application.jobOffer', function ($query) use ($request) {
            $query->where('company_id', $request->user()->company_id);
        })->findOrFail($id);

        if ($note->user_id !== $request->user()->id) {
            return response()->json(['message' => 'You can only delete your own notes'], 403);
        }

        $note->delete();

        return response()->json(['message' => 'Note deleted']);
    }
}
