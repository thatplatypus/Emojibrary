import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type ThemeName = string;

export interface ThemeConfig {
	defaultLight: ThemeName;
	defaultDark: ThemeName;
	selected: ThemeName;
}

export const LIGHT_THEMES: ThemeName[] = [
	'winter',
	'light',
	'cupcake',
	'bumblebee',
	'emerald',
	'valentine',
	'fantasy',
	'acid',
	'caramellatte',
	'nord'
];

export const DARK_THEMES: ThemeName[] = [
	'night',
	'dark',
	'synthwave',
	'dim',
	'forest',
	'black',
	'luxury',
	'dracula',
	'coffee',
	'sunset'
];

const THEME_KEY = 'emojibrary-theme';

const DEFAULT_CONFIG: ThemeConfig = {
	defaultLight: 'winter',
	defaultDark: 'night',
	selected: 'winter'
};

const getInitialThemeConfig = (): ThemeConfig => {
	if (!browser) return DEFAULT_CONFIG;
	
	try {
		const stored = localStorage.getItem(THEME_KEY);
		if (stored) {
			const parsed = JSON.parse(stored) as Partial<ThemeConfig>;
			return {
				defaultLight: parsed.defaultLight || DEFAULT_CONFIG.defaultLight,
				defaultDark: parsed.defaultDark || DEFAULT_CONFIG.defaultDark,
				selected: parsed.selected || (
					window.matchMedia('(prefers-color-scheme: dark)').matches
						? parsed.defaultDark || DEFAULT_CONFIG.defaultDark
						: parsed.defaultLight || DEFAULT_CONFIG.defaultLight
				)
			};
		}
	} catch (err) {
		console.error('Error loading theme config:', err);
	}
	
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	return {
		...DEFAULT_CONFIG,
		selected: prefersDark ? DEFAULT_CONFIG.defaultDark : DEFAULT_CONFIG.defaultLight
	};
};

export const themeConfig = writable<ThemeConfig>(getInitialThemeConfig());

export const theme = writable<ThemeName>('winter');

if (browser) {
	// Derive the current theme from the config
	themeConfig.subscribe((config) => {
		theme.set(config.selected);
		try {
			localStorage.setItem(THEME_KEY, JSON.stringify(config));
		} catch (err) {
			console.error('Error saving theme config:', err);
		}
	});
	
	theme.subscribe((value) => {
		document.documentElement.setAttribute('data-theme', value);
	});
	
	// Initialize theme
	const initialConfig = getInitialThemeConfig();
	document.documentElement.setAttribute('data-theme', initialConfig.selected);
	theme.set(initialConfig.selected);
}

export function toggleTheme(): void {
	themeConfig.update((config) => {
		const isDark = config.selected === config.defaultDark;
		return {
			...config,
			selected: isDark ? config.defaultLight : config.defaultDark
		};
	});
}

export function setDefaultLight(themeName: ThemeName): void {
	themeConfig.update((config) => ({
		...config,
		defaultLight: themeName
	}));
}

export function setDefaultDark(themeName: ThemeName): void {
	themeConfig.update((config) => ({
		...config,
		defaultDark: themeName
	}));
}

export function setSelectedTheme(themeName: ThemeName): void {
	themeConfig.update((config) => ({
		...config,
		selected: themeName
	}));
}
