<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\LeagueController;
use App\Http\Controllers\MatchController;
use App\Http\Controllers\PlayerController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Test route to debug
Route::get('/test', function() {
    return response()->json(['message' => 'API is working']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // User
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Teams
    Route::apiResource('teams', TeamController::class);
    
    // Leagues
    Route::apiResource('leagues', LeagueController::class);
    
    // Matches
    Route::apiResource('matches', MatchController::class);
    Route::put('/matches/{match}/score', [MatchController::class, 'updateScore']);
    
    // Players
    Route::apiResource('players', PlayerController::class);
    Route::get('/teams/{team}/players', [PlayerController::class, 'getPlayersByTeam']);
});
