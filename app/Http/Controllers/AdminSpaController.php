<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

class AdminSpaController extends Controller
{
    public function __invoke(): View
    {
        return view('admin');
    }
}
