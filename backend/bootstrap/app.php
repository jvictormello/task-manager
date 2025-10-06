<?php

use App\Http\Middleware\RequestLogging;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Routing\Middleware\SubstituteBindings;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->group('api', [
            RequestLogging::class,
            HandleCors::class,
            SubstituteBindings::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Standardize 404 responses for API requests
        $exceptions->render(function (ModelNotFoundException|NotFoundHttpException $e, $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                $message = $request->is('api/tasks*') ? 'Task not found' : 'Resource not found';
                return response()->json(['message' => $message], 404);
            }
            return null; // fall back to default handling
        });
    })->create();
