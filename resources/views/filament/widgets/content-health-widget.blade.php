<x-filament-widgets::widget>
    <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-900 dark:ring-white/10">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p class="text-sm font-semibold uppercase tracking-wide text-primary-600">Publishing readiness</p>
                <h2 class="mt-1 text-xl font-bold tracking-tight text-gray-950 dark:text-white">Website content health</h2>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Targets help keep the public site complete and professional.</p>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            @foreach ($checks as $check)
                <a href="{{ $check['url'] }}" class="rounded-lg border border-gray-200 bg-gray-50 p-4 transition hover:border-primary-300 hover:bg-primary-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-primary-950/30">
                    <div class="flex items-center justify-between gap-3">
                        <h3 class="text-sm font-semibold text-gray-950 dark:text-white">{{ $check['label'] }}</h3>
                        <span @class([
                            'rounded-full px-2 py-1 text-xs font-semibold',
                            'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300' => $check['percent'] >= 100,
                            'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' => $check['percent'] < 100,
                        ])>{{ $check['status'] }}</span>
                    </div>
                    <div class="mt-4 flex items-end justify-between">
                        <p class="text-2xl font-bold text-gray-950 dark:text-white">{{ $check['value'] }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Target {{ $check['target'] }}</p>
                    </div>
                    <div class="mt-3 h-2 rounded-full bg-gray-200 dark:bg-white/10">
                        <div class="h-2 rounded-full bg-primary-600" style="width: {{ $check['percent'] }}%"></div>
                    </div>
                </a>
            @endforeach
        </div>
    </div>
</x-filament-widgets::widget>
