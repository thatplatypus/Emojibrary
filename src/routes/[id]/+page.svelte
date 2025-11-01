<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { emojis, loading, loadEmojis } from '$lib/stores/emoji';
	import type { Emoji } from '$lib/types/emoji';
	import Header from '$lib/components/Header.svelte';

	let emoji = $state<Emoji | null>(null);
	let notFound = $state(false);

	const emojiId = $derived(() => decodeURIComponent($page.params.id));

	const findEmoji = () => {
		const found = $emojis.find((e) => e.char === emojiId());
		if (found) {
			emoji = found;
			notFound = false;
		} else {
			notFound = true;
			emoji = null;
		}
	};

	onMount(async () => {
		await loadEmojis();
		findEmoji();
		
		const unsubscribe = emojis.subscribe(() => {
			findEmoji();
		});
		
		return unsubscribe;
	});
</script>

<div class="min-h-screen bg-base-100">
	<div class="container mx-auto px-4 py-8">
		<Header />

		<div class="max-w-2xl mx-auto">
			{#if $loading}
				<div class="text-center py-12">
					<span class="loading loading-spinner loading-lg"></span>
				</div>
			{:else if notFound || !emoji}
				<div class="text-center py-12">
					<div class="text-6xl mb-4">😕</div>
					<h1 class="text-3xl font-bold mb-2">Emoji Not Found</h1>
					<p class="text-lg opacity-70 mb-6">The emoji you're looking for doesn't exist in our library.</p>
					<button class="btn btn-primary" onclick={() => goto('/')}>
						Back to Home
					</button>
				</div>
			{:else}
				<div class="card bg-base-200 shadow-xl">
					<div class="card-body text-center">
						<div class="text-9xl mb-6">{emoji.char}</div>
						<h1 class="card-title text-4xl justify-center mb-4">{emoji.name}</h1>
						
						<div class="divider"></div>
						
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
							<div>
								<h2 class="text-sm font-semibold opacity-70 mb-1">Category</h2>
								<p class="text-lg">{emoji.group}</p>
							</div>
							
							<div>
								<h2 class="text-sm font-semibold opacity-70 mb-1">Subgroup</h2>
								<p class="text-lg">{emoji.subgroup}</p>
							</div>
							
							<div>
								<h2 class="text-sm font-semibold opacity-70 mb-1">Status</h2>
								<p class="text-lg">{emoji.status}</p>
							</div>
							
							<div>
								<h2 class="text-sm font-semibold opacity-70 mb-1">Emoji Version</h2>
								<p class="text-lg">{emoji.emoji_version}</p>
							</div>
							
							<div>
								<h2 class="text-sm font-semibold opacity-70 mb-1">Code Points</h2>
								<p class="text-lg font-mono">{emoji.codepoints.join(' ')}</p>
							</div>
							
							<div>
								<h2 class="text-sm font-semibold opacity-70 mb-1">Sequence</h2>
								<p class="text-lg font-mono">{emoji.sequence}</p>
							</div>
						</div>
						
						{#if emoji.description}
							<div class="divider"></div>
							<div class="text-left">
								<h2 class="text-sm font-semibold opacity-70 mb-2">Description</h2>
								<p class="text-lg">{emoji.description}</p>
							</div>
						{/if}
						
						<div class="card-actions justify-center mt-6">
							<button
								class="btn btn-primary"
								onclick={() => {
									navigator.clipboard.writeText(emoji.char);
								}}
							>
								Copy Emoji
							</button>
							<button class="btn btn-outline" onclick={() => goto('/')}>
								Back to Home
							</button>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

