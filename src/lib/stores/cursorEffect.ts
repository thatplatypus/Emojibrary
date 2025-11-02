import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { EmojiCursor } from 'cursor-effects';

const CURSOR_EFFECT_KEY = 'emojibrary-cursor-effect';

const getInitialCursorEffect = (): string | null => {
	if (!browser) return null;
	
	try {
		const stored = localStorage.getItem(CURSOR_EFFECT_KEY);
		return stored || null;
	} catch (err) {
		console.error('Error loading cursor effect:', err);
	}
	
	return null;
};

export const cursorEffectEmoji = writable<string | null>(getInitialCursorEffect());

if (browser) {
	cursorEffectEmoji.subscribe((value) => {
		try {
			if (value) {
				localStorage.setItem(CURSOR_EFFECT_KEY, value);
			} else {
				localStorage.removeItem(CURSOR_EFFECT_KEY);
			}
		} catch (err) {
			console.error('Error saving cursor effect:', err);
		}
	});
}

let currentCursorInstance: EmojiCursor | null = null;

export function setCursorEffect(emoji: string): void {
	if (!browser) return;
	
	if (currentCursorInstance) {
		currentCursorInstance.destroy();
		currentCursorInstance = null;
	}
	
	if (emoji) {
		import('cursor-effects').then(({ emojiCursor }) => {
			currentCursorInstance = new emojiCursor({ 
				emoji: [emoji],
				delay: 16
			});
			cursorEffectEmoji.set(emoji);
		});
	} else {
		cursorEffectEmoji.set(null);
	}
}

export function clearCursorEffect(): void {
	if (currentCursorInstance) {
		currentCursorInstance.destroy();
		currentCursorInstance = null;
	}
	cursorEffectEmoji.set(null);
}

export function initializeCursorEffect(): void {
	if (!browser) return;
	
	const storedEmoji = getInitialCursorEffect();
	if (storedEmoji) {
		import('cursor-effects').then(({ emojiCursor }) => {
			currentCursorInstance = new emojiCursor({ 
				emoji: [storedEmoji],
				delay: 16
			});
		});
	}
}

