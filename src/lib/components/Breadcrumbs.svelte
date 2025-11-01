<script lang="ts">
  import { page } from "$app/stores";
  import { base } from "$app/paths";
  import { emojis } from "$lib/stores/emoji";
  import type { Emoji } from "$lib/types/emoji";

  const isHome = $derived($page.route.id === "/" || $page.route.id === null);

  const emoji = $derived.by(() => {
    if (isHome) return null;

    const emojiId = $page.params.id ? decodeURIComponent($page.params.id) : "";
    if (!emojiId) return null;

    const found = $emojis.find((e: Emoji) => e.char === emojiId);
    return found || null;
  });
</script>

{#if !isHome}
  <div class="breadcrumbs mb-4">
    <ul>
			<li>
				<a href="{base}/" class="flex items-center gap-2">
					<span class="text-lg">🏠</span>
					<span>Home</span>
				</a>
			</li>
      <li>
        <div class="flex items-center gap-2">
          {#if emoji}
            <span class="text-lg">{emoji.char}</span>
            <span>{emoji.name || "Unknown"}</span>
          {:else}
            <span>{$page.params.id ? decodeURIComponent($page.params.id) : "Unknown"}</span>
          {/if}
        </div>
      </li>
    </ul>
  </div>
{/if}

