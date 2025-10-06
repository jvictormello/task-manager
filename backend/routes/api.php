<?php

use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

Route::middleware('api')->prefix('tasks')->group(function (): void {
    Route::get('/', [TaskController::class, 'index'])->name('tasks.index');
    Route::post('/', [TaskController::class, 'store'])->name('tasks.store');
    Route::get('/statistics', [TaskController::class, 'statistics'])->name('tasks.statistics');
    Route::get('/{task}', [TaskController::class, 'show'])->name('tasks.show');
    Route::put('/{task}', [TaskController::class, 'update'])->name('tasks.update');
    Route::patch('/{task}', [TaskController::class, 'update']);
    Route::delete('/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');
});
