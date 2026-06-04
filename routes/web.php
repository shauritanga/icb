<?php

use App\Http\Controllers\AdminApiController;
use App\Http\Controllers\AdminSpaController;
use App\Http\Controllers\SiteController;
use Illuminate\Support\Facades\Route;

Route::get('/admin/{path?}', AdminSpaController::class)->where('path', '.*')->name('admin.spa');

Route::prefix('api/admin')->group(function (): void {
    Route::post('/login', [AdminApiController::class, 'login'])->middleware(['guest', 'throttle:5,1']);
    Route::middleware(['auth', 'admin'])->group(function (): void {
        Route::post('/logout', [AdminApiController::class, 'logout']);
        Route::get('/me', [AdminApiController::class, 'me']);
        Route::get('/dashboard', [AdminApiController::class, 'dashboard']);
        Route::post('/upload', [AdminApiController::class, 'upload']);
        Route::get('/users', [AdminApiController::class, 'users']);
        Route::post('/users', [AdminApiController::class, 'storeUser']);
        Route::put('/users/{id}', [AdminApiController::class, 'updateUser']);
        Route::delete('/users/{id}', [AdminApiController::class, 'destroyUser']);
        Route::get('/resources/{resource}', [AdminApiController::class, 'index']);
        Route::post('/resources/{resource}', [AdminApiController::class, 'store']);
        Route::get('/resources/{resource}/{id}', [AdminApiController::class, 'show']);
        Route::put('/resources/{resource}/{id}', [AdminApiController::class, 'update']);
        Route::delete('/resources/{resource}/{id}', [AdminApiController::class, 'destroy']);
    });
});

Route::get('/', [SiteController::class, 'home'])->name('home');
Route::get('/about', [SiteController::class, 'page'])->defaults('slug', 'about')->name('about');
Route::get('/bureau-profile', [SiteController::class, 'page'])->defaults('slug', 'bureau-profile')->name('bureau-profile');
Route::get('/services', [SiteController::class, 'services'])->name('services');
Route::get('/projects', [SiteController::class, 'projects'])->name('projects');
Route::get('/projects/{slug}', [SiteController::class, 'project'])->name('projects.show');
Route::get('/staff', [SiteController::class, 'staff'])->name('staff');
Route::get('/staff/{slug}', [SiteController::class, 'staffProfile'])->name('staff.show');
Route::get('/news', [SiteController::class, 'news'])->name('news');
Route::get('/news/{slug}', [SiteController::class, 'post'])->name('news.show');
Route::get('/events', [SiteController::class, 'events'])->name('events');
Route::get('/events/{slug}', [SiteController::class, 'event'])->name('events.show');
Route::get('/contact', [SiteController::class, 'contact'])->name('contact');
