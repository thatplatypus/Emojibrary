<script lang="ts">
	import { onMount } from 'svelte';
	import { emojis, loading, error, loadEmojis } from '$lib/stores/emoji';
	import type { Emoji } from '$lib/types/emoji';
	import Header from '$lib/components/Header.svelte';
	import { base } from '$app/paths';
	import FavoritesDrawer from '$lib/components/FavoritesDrawer.svelte';
	import { favorites, toggleFavorite } from '$lib/stores/favorites';
	import { setCursorEffect, clearCursorEffect, cursorEffectEmoji } from '$lib/stores/cursorEffect';
	import { goto } from '$app/navigation';
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

	let contextMenu = $state<{
		visible: boolean;
		x: number;
		y: number;
		emoji: Emoji | null;
	}>({
		visible: false,
		x: 0,
		y: 0,
		emoji: null
	});

	let lastRightClickTime = 0;
	let lastRightClickTarget: EventTarget | null = null;
	let copiedMessage = $state<string | null>(null);

	const handleContextMenu = (event: MouseEvent, emoji: Emoji) => {
		const now = Date.now();
		const timeSinceLastClick = now - lastRightClickTime;
		const isSameTarget = event.target === lastRightClickTarget;

		if (timeSinceLastClick < 300 && isSameTarget) {
			lastRightClickTime = 0;
			lastRightClickTarget = null;
			return;
		}

		lastRightClickTime = now;
		lastRightClickTarget = event.target;
		event.preventDefault();

		contextMenu = {
			visible: true,
			x: event.clientX,
			y: event.clientY,
			emoji
		};
	};

	const closeContextMenu = () => {
		contextMenu.visible = false;
	};

	const handleOpen = () => {
		if (contextMenu.emoji) {
			goto(`${base}/${encodeURIComponent(contextMenu.emoji.char)}`);
			closeContextMenu();
		}
	};

	const handleCopy = async () => {
		if (contextMenu.emoji) {
			await navigator.clipboard.writeText(contextMenu.emoji.char);
			copiedMessage = 'Copied!';
			setTimeout(() => {
				copiedMessage = null;
			}, 2000);
			closeContextMenu();
		}
	};

	const handleFavorite = () => {
		if (contextMenu.emoji) {
			toggleFavorite(contextMenu.emoji.char);
			closeContextMenu();
		}
	};

	const isFavoriteEmoji = (emoji: Emoji): boolean => {
		return $favorites.includes(emoji.char);
	};

	const hasCursorEffect = (emoji: Emoji): boolean => {
		return $cursorEffectEmoji === emoji.char;
	};

	const handleCursorEffect = () => {
		if (contextMenu.emoji) {
			if (hasCursorEffect(contextMenu.emoji)) {
				clearCursorEffect();
			} else {
				setCursorEffect(contextMenu.emoji.char);
			}
			closeContextMenu();
		}
	};

	const handleShare = async () => {
		if (contextMenu.emoji) {
			const url = `${window.location.origin}${base}/${encodeURIComponent(contextMenu.emoji.char)}`;
			await navigator.clipboard.writeText(url);
			copiedMessage = 'Link copied!';
			setTimeout(() => {
				copiedMessage = null;
			}, 2000);
			closeContextMenu();
		}
	};

	$effect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (contextMenu.visible) {
				const menu = document.getElementById('emoji-context-menu');
				if (menu && !menu.contains(event.target as Node)) {
					closeContextMenu();
				}
			}
		};

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && contextMenu.visible) {
				closeContextMenu();
			}
		};

		const handleScroll = () => {
			if (contextMenu.visible) {
				closeContextMenu();
			}
		};

		document.addEventListener('click', handleClickOutside);
		document.addEventListener('keydown', handleEscape);
		window.addEventListener('scroll', handleScroll, true);
		return () => {
			document.removeEventListener('click', handleClickOutside);
			document.removeEventListener('keydown', handleEscape);
			window.removeEventListener('scroll', handleScroll, true);
		};
	});
</script>

<FavoritesDrawer>
	<div class="flex flex-col h-screen bg-base-100 overflow-hidden">
		<div class="flex-shrink-0">
			<div class="container mx-auto px-4 py-4">
				<Header />
			</div>
		</div>

		<div class="flex-1 overflow-hidden">
			<div class="container mx-auto px-4 pb-4 h-full">
				<div class="max-w-4xl mx-auto h-full flex flex-col pt-4">
				<div class="flex-shrink-0 mb-4">
					<input
						type="text"
						placeholder="Search emojis..."
						bind:value={searchQuery}
						class="input input-primary w-full text-lg"
					/>
				</div>

				<div class="flex-shrink-0 mb-4 flex flex-wrap gap-2 justify-start lg:justify-between">
					<button
						class="btn btn-md {selectedCategory === null ? 'btn-primary' : 'btn-outline'}"
						onclick={() => (selectedCategory = null)}
					>
						All
					</button>
					{#each categories() as category}
						<div class="tooltip" data-tip={category}>
							<button
								class="btn btn-md {selectedCategory === category
									? 'btn-primary'
									: 'btn-outline btn-primary'}"
								onclick={() => (selectedCategory = category)}
							>
								{getCategoryEmoji(category)}
							</button>
						</div>
					{/each}
				</div>

				<div class="flex-shrink-0 mb-4 flex flex-wrap gap-2 items-center justify-between">
					<form class="flex items-center">
						<label class="label cursor-pointer gap-2">
							<input
								class="checkbox"
								type="checkbox"
								name="filters"
								aria-label="Show Modifiers"
								bind:checked={showModifiers}
							/>
							<span class="label-text">Show Modifiers</span>
						</label>
					</form>

					<select
						class="select flex-1 sm:flex-initial"
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
												oncontextmenu={(e) => handleContextMenu(e, emoji)}
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

	{#if contextMenu.visible && contextMenu.emoji}
		{@const menuWidth = 180}
		{@const menuHeight = 250}
		{@const menuX = Math.min(Math.max(0, contextMenu.x), window.innerWidth - menuWidth)}
		{@const menuY = Math.min(Math.max(0, contextMenu.y), window.innerHeight - menuHeight)}
		<ul
			id="emoji-context-menu"
			class="menu bg-base-200 shadow-lg rounded-box p-2 fixed z-50"
			style="left: {menuX}px; top: {menuY}px; min-width: {menuWidth}px;"
		>
			<li>
				<button class="btn btn-ghost btn-sm justify-start" onclick={handleOpen}>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
					</svg>
					Open
				</button>
			</li>
			<li>
				<button class="btn btn-ghost btn-sm justify-start" onclick={handleCopy}>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
					</svg>
					{copiedMessage === 'Copied!' ? 'Copied!' : 'Copy'}
				</button>
			</li>
			<li>
				<button class="btn btn-ghost btn-sm justify-start" onclick={handleFavorite}>
					{#if isFavoriteEmoji(contextMenu.emoji)}
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 fill-current" viewBox="0 0 24 24">
							<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
						</svg>
						Unfavorite
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
						</svg>
						Favorite
					{/if}
				</button>
			</li>
			<li>
				<button class="btn btn-ghost btn-sm justify-start {hasCursorEffect(contextMenu.emoji) ? 'btn-active' : ''}" onclick={handleCursorEffect}>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
					</svg>
					{hasCursorEffect(contextMenu.emoji) ? 'Remove Cursor Effect' : 'Cursor Effect'}
				</button>
			</li>
			<li>
				<button class="btn btn-ghost btn-sm justify-start" onclick={handleShare}>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
					</svg>
					{copiedMessage === 'Link copied!' ? 'Link copied!' : 'Share'}
				</button>
			</li>
		</ul>
	{/if}
</FavoritesDrawer>
