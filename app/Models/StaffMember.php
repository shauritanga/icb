<?php

namespace App\Models;

use App\Models\Concerns\HasLocalizedFields;
use Illuminate\Database\Eloquent\Model;

class StaffMember extends Model
{
    use HasLocalizedFields;

    protected $fillable = [
        'name',
        'position',
        'profession',
        'qualification',
        'experience',
        'photo_path',
        'sort_order',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'position' => 'array',
            'is_published' => 'boolean',
        ];
    }
}
