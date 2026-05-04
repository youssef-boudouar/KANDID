<?php

use App\Http\Controllers\ActivityController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\JobOfferController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\PublicJobController;
use App\Http\Controllers\TagController;
use App\Http\Middleware\AdminMiddleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


// Public routes
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // get company name for navbar
    Route::get('/user', function (Request $request) {
        return $request->user()->load('company');
    });
    // Job Offers CRUD
    Route::get('/job-offers', [JobOfferController::class, 'index']);
    Route::post('/job-offers', [JobOfferController::class, 'store']);
    Route::get('/job-offers/{id}', [JobOfferController::class, 'show']);
    Route::put('/job-offers/{id}', [JobOfferController::class, 'update']);
    Route::delete('/job-offers/{id}', [JobOfferController::class, 'destroy']);

    // Tags CRUD
    Route::get('/tags', [TagController::class, 'index']);
    Route::post('/tags', [TagController::class, 'store']);
    Route::put('/tags/{id}', [TagController::class, 'update']);
    Route::delete('/tags/{id}', [TagController::class, 'destroy']);
    Route::post('/job-offers/{id}/tags', [TagController::class, 'attachToJob']);
    Route::delete('/job-offers/{id}/tags/{tagId}', [TagController::class, 'detachFromJob']);

    // Applications
    Route::get('/job-offers/{jobOfferId}/applications', [ApplicationController::class, 'index']);
    Route::get('/applications/{id}', [ApplicationController::class, 'show']);
    Route::put('/applications/reorder', [ApplicationController::class, 'reorder']);
    Route::put('/applications/{id}/move', [ApplicationController::class, 'move']);
    Route::delete('/applications/{id}', [ApplicationController::class, 'destroy']);

    Route::get('/applications/{applicationId}/notes', [NoteController::class, 'index']);
    Route::post('/applications/{applicationId}/notes', [NoteController::class, 'store']);
    Route::delete('/notes/{id}', [NoteController::class, 'destroy']);


    Route::post('/team/invite', [AuthController::class, 'invite']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::get('/activities', [ActivityController::class, 'index']);


    Route::middleware(AdminMiddleware::class)->group(function () {
    Route::get('/admin/stats', [AdminController::class, 'stats']);
    Route::get('/admin/companies', [AdminController::class, 'companies']);
    Route::get('/admin/users', [AdminController::class, 'users']);
    Route::delete('/admin/companies/{id}', [AdminController::class, 'deleteCompany']);
    Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);
});
});

Route::get('/public/jobs', [PublicJobController::class, 'index']);
Route::get('/public/jobs/{id}', [PublicJobController::class, 'show']);
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/public/jobs/{id}/apply', [PublicJobController::class, 'apply']);
});
