import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { emojiCursor as EmojiCursor } from 'cursor-effects';

export type CursorEffectStyle = 'rain' | 'elastic';

const CURSOR_EFFECT_KEY = 'emojibrary-cursor-effect';
const CURSOR_EFFECT_STYLE_KEY = 'emojibrary-cursor-effect-style';

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

const getInitialCursorEffectStyle = (): CursorEffectStyle => {
	if (!browser) return 'rain';
	
	try {
		const stored = localStorage.getItem(CURSOR_EFFECT_STYLE_KEY);
		return (stored === 'elastic' ? 'elastic' : 'rain') as CursorEffectStyle;
	} catch (err) {
		console.error('Error loading cursor effect style:', err);
	}
	
	return 'rain';
};

export const cursorEffectEmoji = writable<string | null>(getInitialCursorEffect());
export const cursorEffectStyle = writable<CursorEffectStyle>(getInitialCursorEffectStyle());

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

	cursorEffectStyle.subscribe((value) => {
		try {
			localStorage.setItem(CURSOR_EFFECT_STYLE_KEY, value);
		} catch (err) {
			console.error('Error saving cursor effect style:', err);
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
		const style = get(cursorEffectStyle);
		if (style === 'elastic') {
			import('cursor-effects').then(({ springyEmojiCursor }) => {
				currentCursorInstance = new springyEmojiCursor({ 
					emoji: [emoji],
					delay: 16
				});
				cursorEffectEmoji.set(emoji);
			});
		} else {
			import('cursor-effects').then(({ emojiCursor }) => {
				currentCursorInstance = new emojiCursor({ 
					emoji: [emoji],
					delay: 16
				});
				cursorEffectEmoji.set(emoji);
			});
		}
	} else {
		cursorEffectEmoji.set(null);
	}
}

export function setCursorEffectStyle(style: CursorEffectStyle): void {
	if (!browser) return;
	
	cursorEffectStyle.set(style);
	
	// Reapply the current effect with the new style
	const currentEmoji = get(cursorEffectEmoji);
	if (currentEmoji) {
		if (currentCursorInstance) {
			currentCursorInstance.destroy();
			currentCursorInstance = null;
		}
		
		if (style === 'elastic') {
			import('cursor-effects').then(({ springyEmojiCursor }) => {
				currentCursorInstance = new springyEmojiCursor({ 
					emoji: [currentEmoji],
					delay: 16
				});
			});
		} else {
			import('cursor-effects').then(({ emojiCursor }) => {
				currentCursorInstance = new emojiCursor({ 
					emoji: [currentEmoji],
					delay: 16
				});
			});
		}
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
	const storedStyle = getInitialCursorEffectStyle();
	
	if (storedEmoji) {
		if (storedStyle === 'elastic') {
			import('cursor-effects').then(({ springyEmojiCursor }) => {
				currentCursorInstance = new springyEmojiCursor({ 
					emoji: [storedEmoji],
					delay: 16
				});
			});
		} else {
			import('cursor-effects').then(({ emojiCursor }) => {
				currentCursorInstance = new emojiCursor({ 
					emoji: [storedEmoji],
					delay: 16
				});
			});
		}
	}
}

