<script lang="ts">
	import { onMount } from 'svelte';
	import { emojis, loading, error, loadEmojis } from '$lib/stores/emoji';
	import type { Emoji } from '$lib/types/emoji';
	import Header from '$lib/components/Header.svelte';
	import { base } from '$app/paths';
	// @ts-ignore - VirtualList doesn't have type definitions
	import VirtualList from '@sveltejs/svelte-virtual-list';

	let searchQuery = $state('');
	let selectedCategory = $state<string | null>(null);
	let showModifiers = $state(false);
	let selectedVersions = $state<Set<string>>(new Set(['all']));

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

	const emojiVersions = $derived(() => {
		const versions = [...new Set($emojis.map((e) => e.emoji_version))].sort((a, b) => {
			const aNum = parseFloat(a);
			const bNum = parseFloat(b);
			return aNum - bNum;
		});
		return versions;
	});

	const filteredEmojis = $derived(() => {
		let filtered = $emojis;

		if (!showModifiers) {
			filtered = filtered.filter((e) => !isModifier(e));
		}

		if (selectedCategory) {
			filtered = filtered.filter((e) => e.group === selectedCategory);
		}

		if (!selectedVersions.has('all') && selectedVersions.size > 0) {
			filtered = filtered.filter((e) => selectedVersions.has(e.emoji_version));
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

	const handleVersionChange = (event: Event) => {
		const select = event.target as HTMLSelectElement;
		const selectedOptions = Array.from(select.selectedOptions, (option) => option.value);
		const newSet = new Set(selectedOptions);

		if (newSet.has('all')) {
			selectedVersions = new Set(['all']);
			Array.from(select.options).forEach((opt) => {
				opt.selected = opt.value === 'all';
			});
		} else if (newSet.size > 0) {
			selectedVersions = newSet;
			Array.from(select.options).forEach((opt) => {
				if (opt.value === 'all') {
					opt.selected = false;
				} else {
					opt.selected = newSet.has(opt.value);
				}
			});
		} else {
			selectedVersions = new Set(['all']);
			Array.from(select.options).forEach((opt) => {
				opt.selected = opt.value === 'all';
			});
		}
	};

	const getCategoryEmoji = (category: string): string => {
		const categoryEmojis = $emojis.filter((e) => e.group === category && !isModifier(e));
		return categoryEmojis[0]?.char || '📁';
	};

	const emojiRows = $derived(() => {
		const emojis = filteredEmojis();
		const itemsPerRow = 8;
		return [...Array(Math.ceil(emojis.length / itemsPerRow)).keys()];
	});
</script>

<div class="flex flex-col h-screen bg-base-100 overflow-hidden">
	<div class="flex-shrink-0">
		<div class="container mx-auto px-4 py-4">
			<Header />
		</div>
	</div>

	<div class="flex-1 overflow-hidden">
		<div class="container mx-auto px-4 pb-4 h-full">
			<div class="max-w-4xl mx-auto h-full flex flex-col">
				<div class="flex-shrink-0 mb-4">
					<input
						type="text"
						placeholder="Search emojis..."
						bind:value={searchQuery}
						class="input input-primary w-full text-lg"
					/>
				</div>

				<div class="flex-shrink-0 mb-4 flex flex-wrap gap-2 justify-between">
					<button
						class="btn btn-lg {selectedCategory === null ? 'btn-primary' : 'btn-outline'}"
						onclick={() => (selectedCategory = null)}
					>
						All
					</button>
					{#each categories() as category}
						<div class="tooltip" data-tip={category}>
							<button
								class="btn btn-lg {selectedCategory === category
									? 'btn-primary'
									: 'btn-outline btn-primary'}"
								onclick={() => (selectedCategory = category)}
							>
								{getCategoryEmoji(category)}
							</button>
						</div>
					{/each}
				</div>

				<div class="flex-shrink-0 mb-4 flex flex-wrap gap-4 items-center justify-between">
					<form class="flex flex-wrap gap-2 items-center">
					<input
						class="btn"
						type="checkbox"
						name="filters"
						aria-label="Show Modifiers"
						bind:checked={showModifiers}
					/>
					</form>

					<select
						class="select"
						onchange={handleVersionChange}
					>
						<option value="all" selected={selectedVersions.has('all')}>All Versions</option>
						{#each emojiVersions() as version}
							<option value={version} selected={selectedVersions.has(version)}>
								Unicode {version}
							</option>
						{/each}
					</select>
				</div>

				<div class="flex-1 overflow-hidden flex flex-col">
					{#if $loading}
						<div class="text-center py-12">
							<span class="loading loading-spinner loading-lg"></span>
						</div>
					{:else if $error}
						<div class="alert alert-error">
							<span>{$error}</span>
						</div>
					{:else}
						<div class="flex-shrink-0 mb-2 text-sm opacity-70">
							Found {filteredEmojis().length} emoji{filteredEmojis().length !== 1 ? 's' : ''}
						</div>
						<div class="flex-1 min-h-0">
							<VirtualList height="100%" items={emojiRows()} itemHeight={140} let:item={row}>
								<div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 mb-4">
									{#each Array(8) as _, i}
										{#if filteredEmojis()[row * 8 + i]}
											{@const emoji = filteredEmojis()[row * 8 + i]}
											<a
												href="{base}/{encodeURIComponent(emoji.char)}"
												class="card bg-base-200 hover:bg-base-300 transition-colors p-4 text-center cursor-pointer no-underline"
												title="{emoji.name}"
											>
												<div class="text-4xl mb-2">{emoji.char}</div>
												<div class="text-xs opacity-70 truncate">{emoji.name || 'Unnamed'}</div>
											</a>
										{/if}
									{/each}
								</div>
							</VirtualList>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
