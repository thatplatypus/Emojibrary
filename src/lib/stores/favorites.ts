import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const FAVORITES_KEY = 'emojibrary-favorites';

const getInitialFavorites = (): string[] => {
	if (!browser) return [];
	
	try {
		const stored = localStorage.getItem(FAVORITES_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			return Array.isArray(parsed) ? parsed : [];
		}
	} catch (err) {
		console.error('Error loading favorites:', err);
	}
	
	return [];
};

export const favorites = writable<string[]>(getInitialFavorites());

if (browser) {
	favorites.subscribe((value) => {
		try {
			localStorage.setItem(FAVORITES_KEY, JSON.stringify(value));
		} catch (err) {
			console.error('Error saving favorites:', err);
		}
	});
}

export function toggleFavorite(emojiChar: string): void {
	favorites.update((favs) => {
		if (favs.includes(emojiChar)) {
			return favs.filter((char) => char !== emojiChar);
		} else {
			return [...favs, emojiChar];
		}
	});
}

export function isFavorite(emojiChar: string): boolean {
	let result = false;
	favorites.subscribe((favs) => {
		result = favs.includes(emojiChar);
	})();
	return result;
}

