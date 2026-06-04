<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        $hasAccess = $user?->is_admin || in_array($user?->role, ['admin', 'editor'], true);

        if (! $hasAccess) {
            if ($request->expectsJson()) {
                return new JsonResponse([
                    'message' => 'Administrator access is required.',
                ], Response::HTTP_FORBIDDEN);
            }

            abort(Response::HTTP_FORBIDDEN, 'Administrator access is required.');
        }

        return $next($request);
    }
}
