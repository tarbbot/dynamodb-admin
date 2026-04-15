import type { ItemList } from '../types';

export function exportAsJSON(items: ItemList): string {
    return JSON.stringify(items, null, 2);
}
