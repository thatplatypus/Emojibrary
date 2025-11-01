import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const getInitialTheme = (): 'light' | 'dark' => {
	if (!browser) return 'light';
	
	const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
	if (stored === 'light' || stored === 'dark') return stored;
	
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	return prefersDark ? 'dark' : 'light';
};

export const theme = writable<'light' | 'dark'>(getInitialTheme());

if (browser) {
	theme.subscribe((value) => {
		document.documentElement.setAttribute('data-theme', value);
		localStorage.setItem('theme', value);
	});
	
	document.documentElement.setAttribute('data-theme', getInitialTheme());
}

