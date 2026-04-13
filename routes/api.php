<?php

use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\JobOfferController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\PublicJobController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user()->load('company');
    });
    // Job Offers CRUD
    Route::get('/job-offers', [JobOfferController::class, 'index']);
    Route::post('/job-offers', [JobOfferController::class, 'store']);
    Route::get('/job-offers/{id}', [JobOfferController::class, 'show']);
    Route::put('/job-offers/{id}', [JobOfferController::class, 'update']);
    Route::delete('/job-offers/{id}', [JobOfferController::class, 'destroy']);

    // Applications
    Route::get('/job-offers/{jobOfferId}/applications', [ApplicationController::class, 'index']);
    Route::get('/applications/{id}', [ApplicationController::class, 'show']);
    Route::put('/applications/{id}/move', [ApplicationController::class, 'move']);
    Route::delete('/applications/{id}', [ApplicationController::class, 'destroy']);

    Route::get('/applications/{applicationId}/notes', [NoteController::class, 'index']);
Route::post('/applications/{applicationId}/notes', [NoteController::class, 'store']);
Route::delete('/notes/{id}', [NoteController::class, 'destroy']);
});

Route::get('/public/jobs', [PublicJobController::class, 'index']);
Route::get('/public/jobs/{id}', [PublicJobController::class, 'show']);
Route::post('/public/jobs/{id}/apply', [PublicJobController::class, 'apply']);
