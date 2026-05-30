<x-filament-widgets::widget>
    <div class="overflow-hidden rounded-xl bg-gradient-to-br from-[#073b73] via-[#0f5ea8] to-[#148eb7] shadow-sm ring-1 ring-white/10">
        <div class="grid gap-8 p-6 text-white lg:grid-cols-[1.2fr_1fr] lg:p-8">
            <div class="flex gap-5">
                <div class="hidden h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-white p-3 shadow-lg md:flex">
                    <img src="/logo.png" alt="DIT ICB" class="h-full w-full object-contain">
                </div>
                <div>
                    <p class="text-sm font-semibold uppercase tracking-wide text-[#f8c12c]">DIT ICB Content Centre</p>
                    <h2 class="mt-2 text-2xl font-bold tracking-tight md:text-3xl">Manage the public website with confidence.</h2>
                    <p class="mt-3 max-w-2xl text-sm leading-6 text-blue-50 md:text-base">
                        Keep consultancy services, projects, staff profiles, news, documents, and contact details accurate across English and Swahili content.
                    </p>
                </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
                <a href="/admin/projects/create" class="rounded-lg bg-white/95 px-4 py-3 text-sm font-semibold text-[#073b73] shadow-sm transition hover:bg-[#f8c12c]">
                    Add project
                </a>
                <a href="/admin/news-posts/create" class="rounded-lg bg-white/95 px-4 py-3 text-sm font-semibold text-[#073b73] shadow-sm transition hover:bg-[#f8c12c]">
                    Publish news
                </a>
                <a href="/admin/services" class="rounded-lg bg-white/15 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/25">
                    Manage services
                </a>
                <a href="/" target="_blank" rel="noreferrer" class="rounded-lg bg-white/15 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/25">
                    View website
                </a>
            </div>
        </div>
    </div>
</x-filament-widgets::widget>
