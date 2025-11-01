<script lang="ts">
	import { page } from '$app/stores';
	import { emojis } from '$lib/stores/emoji';
	import type { Emoji } from '$lib/types/emoji';

	const isHome = $derived($page.url.pathname === '/');
	
	const emoji = $derived.by(() => {
		if (isHome) return null;
		
		const emojiId = decodeURIComponent($page.params.id || '');
		if (!emojiId) return null;
		
		const found = $emojis.find((e: Emoji) => e.char === emojiId);
		return found || null;
	});
	
	const emojiDisplayName = $derived.by(() => {
		if (!emoji) {
			const emojiId = decodeURIComponent($page.params.id || '');
			return emojiId || 'Unknown';
		}
		return emoji.name || 'Unknown';
	});
</script>

{#if !isHome}
	<div class="breadcrumbs mb-4">
		<ul>
			<li>
				<a href="/" class="flex items-center gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-5"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
						/>
					</svg>
					<span>Home</span>
				</a>
			</li>
			<li>
				<div class="flex items-center gap-2">
					{#if emoji}
						<span class="text-lg">{emoji.char}</span>
					{/if}
					<span>{emojiDisplayName}</span>
				</div>
			</li>
		</ul>
	</div>
{/if}

