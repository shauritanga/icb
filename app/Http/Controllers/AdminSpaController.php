<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;
use Symfony\Component\HttpFoundation\Response;

class AdminSpaController extends Controller
{
    public function __invoke(): View
    {
        abort_if(Auth::check() && ! Auth::user()?->is_admin, Response::HTTP_FORBIDDEN);

        return view('admin');
    }
}
