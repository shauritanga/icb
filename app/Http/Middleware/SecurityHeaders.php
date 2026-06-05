<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        $isLocal = app()->environment('local');

        $scriptSources = ["'self'", "'unsafe-inline'"];
        $styleSources  = ["'self'", "'unsafe-inline'", 'https:'];
        $connectSources = ["'self'", 'https:'];

        if ($isLocal) {
            // Allow Vite dev server (both IPv4 and IPv6 localhost)
            $viteOrigins = [
                'http://localhost:5173',
                'http://127.0.0.1:5173',
            ];
            array_push($scriptSources, "'unsafe-eval'", ...$viteOrigins);
            array_push($styleSources, ...$viteOrigins);
            array_push($connectSources, 'ws:', 'wss:', ...$viteOrigins);
        }

        $workerSources = ["'self'", 'blob:'];

        $csp = implode('; ', [
            "default-src 'self'",
            'base-uri \'self\'',
            'form-action \'self\'',
            'frame-ancestors \'self\'',
            'img-src \'self\' data: https:',
            'font-src \'self\' data: https:',
            'style-src '.implode(' ', $styleSources),
            'script-src '.implode(' ', $scriptSources),
            'worker-src '.implode(' ', $workerSources),
            'connect-src '.implode(' ', $connectSources),
            "object-src 'none'",
        ]);

        $response->headers->set('Content-Security-Policy', $csp);
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
        $response->headers->set('Cross-Origin-Opener-Policy', 'same-origin');
        $response->headers->set('Cross-Origin-Resource-Policy', 'same-origin');

        // Only sent over HTTPS in production; omit in local so dev tools work normally.
        if (config('app.env') === 'production') {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        return $response;
    }
}
