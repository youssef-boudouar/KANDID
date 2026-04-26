<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private DashboardService $dashboardService) {}

    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;

        $stats = $this->dashboardService->getStats($companyId);

        return response()->json($stats);
    }
}
