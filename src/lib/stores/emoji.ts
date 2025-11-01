import { writable } from 'svelte/store';
import { base } from '$app/paths';
import type { Emoji } from '../types/emoji';

export const emojis = writable<Emoji[]>([]);
export const loading = writable<boolean>(true);
export const error = writable<string | null>(null);

let emojiDataLoaded = false;

export async function loadEmojis(): Promise<void> {
	if (emojiDataLoaded) return;

	loading.set(true);
	error.set(null);

	try {
		const response = await fetch(`${base}/data/emoji_unicode_17_data_with_descriptions.json`);
		if (!response.ok) {
			throw new Error('Failed to load emoji data');
		}
		const data = await response.json();
		const emojiArray: Emoji[] = Array.isArray(data) ? data : [];
		emojis.set(emojiArray);
		emojiDataLoaded = true;
		loading.set(false);
	} catch (err) {
		error.set(err instanceof Error ? err.message : 'An error occurred');
		loading.set(false);
	}
}

