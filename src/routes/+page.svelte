<script lang="ts">
	import { onMount } from 'svelte';
	import { emojis, loading, error, loadEmojis } from '$lib/stores/emoji';
	import type { Emoji } from '$lib/types/emoji';
	import Header from '$lib/components/Header.svelte';

	let searchQuery = $state('');
	let selectedCategory = $state<string | null>(null);
	let showModifiers = $state(false);

	onMount(async () => {
		await loadEmojis();
	});

	const isModifier = (emoji: Emoji): boolean => {
		if (emoji.status === 'component' || emoji.group === 'Component') {
			return true;
		}
		
		const skinToneModifiers = ['1F3FB', '1F3FC', '1F3FD', '1F3FE', '1F3FF'];
		return emoji.codepoints.some((cp) => skinToneModifiers.includes(cp));
	};

	const categories = $derived(() => {
		return [...new Set($emojis.map((e) => e.group))].sort();
	});

	const filteredEmojis = $derived(() => {
		let filtered = $emojis;

		if (!showModifiers) {
			filtered = filtered.filter((e) => !isModifier(e));
		}

		if (selectedCategory) {
			filtered = filtered.filter((e) => e.group === selectedCategory);
		}

		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase().trim();
			filtered = filtered.filter((e) => {
				const nameMatch = e.name?.toLowerCase().includes(query);
				const groupMatch = e.group?.toLowerCase().includes(query);
				const subgroupMatch = e.subgroup?.toLowerCase().includes(query);
				const codeMatch = e.sequence?.toLowerCase().includes(query);
				return nameMatch || groupMatch || subgroupMatch || codeMatch;
			});
		}

		return filtered;
	});

	const getCategoryEmoji = (category: string): string => {
		const categoryEmojis = $emojis.filter((e) => e.group === category && !isModifier(e));
		return categoryEmojis[0]?.char || '📁';
	};
</script>

<div class="min-h-screen bg-base-100">
	<div class="container mx-auto px-4 py-8">
		<Header />

		<div class="max-w-4xl mx-auto">
			<div class="mb-6">
				<input
					type="text"
					placeholder="Search emojis..."
					bind:value={searchQuery}
					class="input input-bordered w-full text-lg"
				/>
			</div>

			<div class="mb-6">
				<form class="flex flex-wrap gap-2 items-center">
					<input
						class="btn"
						type="checkbox"
						name="filters"
						aria-label="Show Modifiers"
						bind:checked={showModifiers}
					/>
				</form>
			</div>

			<div class="mb-6 flex flex-wrap gap-2">
				<button
					class="btn btn-sm {selectedCategory === null ? 'btn-primary' : 'btn-outline'}"
					onclick={() => (selectedCategory = null)}
				>
					All
				</button>
				{#each categories() as category}
					<div class="tooltip" data-tip={category}>
						<button
							class="btn btn-sm {selectedCategory === category
								? 'btn-primary'
								: 'btn-outline'}"
							onclick={() => (selectedCategory = category)}
						>
							{getCategoryEmoji(category)}
						</button>
					</div>
				{/each}
			</div>

			{#if $loading}
				<div class="text-center py-12">
					<span class="loading loading-spinner loading-lg"></span>
				</div>
			{:else if $error}
				<div class="alert alert-error">
					<span>{$error}</span>
				</div>
			{:else}
				<div class="mb-4 text-sm opacity-70">
					Found {filteredEmojis().length} emoji{filteredEmojis().length !== 1 ? 's' : ''}
				</div>
				<div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
					{#each filteredEmojis() as emoji}
						<a
							href="/{encodeURIComponent(emoji.char)}"
							class="card bg-base-200 hover:bg-base-300 transition-colors p-4 text-center cursor-pointer no-underline"
							title="{emoji.name}"
						>
							<div class="text-4xl mb-2">{emoji.char}</div>
							<div class="text-xs opacity-70 truncate">{emoji.name || 'Unnamed'}</div>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
