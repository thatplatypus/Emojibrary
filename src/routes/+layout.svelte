<script lang="ts">
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import { theme } from '$lib/stores/theme';
	import { browser } from '$app/environment';
	import { base } from '$app/paths';

	let { children } = $props();

	onMount(() => {
		if (browser) {
			document.documentElement.setAttribute('data-theme', $theme);
			const unsubscribe = theme.subscribe((value) => {
				document.documentElement.setAttribute('data-theme', value);
			});
			return unsubscribe;
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="description" content="A fun and fresh emoji search and browser app" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta name="theme-color" content="#ffffff" />
	<link rel="manifest" href="{base}/manifest.json" />
</svelte:head>

{@render children()}
