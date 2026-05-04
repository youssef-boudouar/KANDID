<?php
namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    public function index(Request $request)
    {
        $activities = Activity::where('company_id', $request->user()->company_id)
            ->orderByDesc('created_at')
            ->take(20)
            ->get();

        return response()->json($activities);
    }
}
