import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const getInitialTheme = (): 'winter' | 'night' => {
	if (!browser) return 'winter';
	
	const stored = localStorage.getItem('theme') as 'winter' | 'night' | null;
	if (stored === 'winter' || stored === 'night') return stored;
	
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	return prefersDark ? 'night' : 'winter';
};

export const theme = writable<'winter' | 'night'>(getInitialTheme());

if (browser) {
	theme.subscribe((value) => {
		document.documentElement.setAttribute('data-theme', value);
		localStorage.setItem('theme', value);
	});
	
	document.documentElement.setAttribute('data-theme', getInitialTheme());
}

