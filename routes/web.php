<?php

use App\Http\Controllers\AdminApiController;
use App\Http\Controllers\AdminSpaController;
use App\Http\Controllers\SiteController;
use Illuminate\Support\Facades\Route;

Route::get('/admin/{path?}', AdminSpaController::class)->where('path', '.*')->name('admin.spa');

Route::prefix('api/admin')->group(function (): void {
    Route::post('/login', [AdminApiController::class, 'login'])->middleware('guest');
    Route::post('/logout', [AdminApiController::class, 'logout'])->middleware('auth');
    Route::get('/me', [AdminApiController::class, 'me'])->middleware('auth');
    Route::get('/dashboard', [AdminApiController::class, 'dashboard'])->middleware('auth');
    Route::get('/resources/{resource}', [AdminApiController::class, 'index'])->middleware('auth');
    Route::post('/resources/{resource}', [AdminApiController::class, 'store'])->middleware('auth');
    Route::get('/resources/{resource}/{id}', [AdminApiController::class, 'show'])->middleware('auth');
    Route::put('/resources/{resource}/{id}', [AdminApiController::class, 'update'])->middleware('auth');
    Route::delete('/resources/{resource}/{id}', [AdminApiController::class, 'destroy'])->middleware('auth');
});

Route::get('/', [SiteController::class, 'home'])->name('home');
Route::get('/about', [SiteController::class, 'page'])->defaults('slug', 'about')->name('about');
Route::get('/bureau-profile', [SiteController::class, 'page'])->defaults('slug', 'bureau-profile')->name('bureau-profile');
Route::get('/services', [SiteController::class, 'services'])->name('services');
Route::get('/projects', [SiteController::class, 'projects'])->name('projects');
Route::get('/projects/{slug}', [SiteController::class, 'project'])->name('projects.show');
Route::get('/staff', [SiteController::class, 'staff'])->name('staff');
Route::get('/news', [SiteController::class, 'news'])->name('news');
Route::get('/news/{slug}', [SiteController::class, 'post'])->name('news.show');
Route::get('/contact', [SiteController::class, 'contact'])->name('contact');
