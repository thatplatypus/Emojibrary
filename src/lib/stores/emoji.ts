import { writable } from 'svelte/store';
import { browser, dev } from '$app/environment';
import type { Emoji } from '../types/emoji';

export const emojis = writable<Emoji[]>([]);
export const loading = writable<boolean>(true);
export const error = writable<string | null>(null);

let emojiDataLoaded = false;

const getBasePath = (): string => {
	if (!browser) return '';
	if (dev) return '';
	return '/Emojibrary';
};

export async function loadEmojis(): Promise<void> {
	if (emojiDataLoaded) return;

	loading.set(true);
	error.set(null);

	try {
		const basePath = getBasePath();
		const response = await fetch(`${basePath}/data/emoji_unicode_17_data_with_descriptions.json`);
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

