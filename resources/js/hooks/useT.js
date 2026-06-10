import { usePage } from '@inertiajs/react';

/** Returns the UI translation map for the current locale. */
export function useT() {
    return usePage().props.t ?? {};
}
