<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { emojis, loading, loadEmojis } from "$lib/stores/emoji";
  import type { Emoji } from "$lib/types/emoji";
  import Header from "$lib/components/Header.svelte";
  import FavoritesDrawer from "$lib/components/FavoritesDrawer.svelte";
  import { Check, Icon, DocumentDuplicate, Heart, Home } from "svelte-hero-icons";
  import { favorites, toggleFavorite } from "$lib/stores/favorites";
  import { setCursorEffect, clearCursorEffect, cursorEffectEmoji } from "$lib/stores/cursorEffect";

  let emoji = $state<Emoji | null>(null);
  let notFound = $state(false);
  let copied = $state(false);

  const emojiId = $derived(() => {
    const id = $page.params.id;
    return id ? decodeURIComponent(id) : '';
  });
  
  const isFavorite = $derived.by(() => {
    if (!emoji) return false;
    return $favorites.includes(emoji.char);
  });

  const hasCursorEffect = $derived.by(() => {
    if (!emoji) return false;
    return $cursorEffectEmoji === emoji.char;
  });

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

  onMount(() => {
    loadEmojis().then(() => {
      findEmoji();
    });

    const unsubscribe = emojis.subscribe(() => {
      findEmoji();
    });

    return unsubscribe;
  });

  $effect(() => {
    const id = emojiId();
    if ($emojis.length > 0 && id) {
      findEmoji();
    }
  });
</script>

<FavoritesDrawer>
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
          <p class="text-lg opacity-70 mb-6">
            The emoji you're looking for doesn't exist in our library.
          </p>
          <div class="tooltip" data-tip="Back to Home">
            <button class="btn btn-primary" onclick={() => goto(`${base}/`)}>
              <Icon src={Home} class="h-5 w-5" />
            </button>
          </div>
        </div>
      {:else}
        <div class="card bg-base-200 shadow-xl">
          <div class="card-body text-center">
            <div class="text-9xl mb-6">{emoji.char}</div>
            <h1 class="card-title text-4xl justify-center mb-4">
              {emoji.name}
            </h1>

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
                <h2 class="text-sm font-semibold opacity-70 mb-1">
                  Emoji Version
                </h2>
                <p class="text-lg">{emoji.emoji_version}</p>
              </div>

              <div>
                <h2 class="text-sm font-semibold opacity-70 mb-1">
                  Code Points
                </h2>
                <p class="text-lg font-mono">{emoji.codepoints.join(" ")}</p>
              </div>

              <div>
                <h2 class="text-sm font-semibold opacity-70 mb-1">Sequence</h2>
                <p class="text-lg font-mono">{emoji.sequence}</p>
              </div>
            </div>

            {#if emoji.description}
              <div class="divider"></div>
              <div class="text-left">
                <h2 class="text-sm font-semibold opacity-70 mb-2">
                  Description
                </h2>
                <p class="text-lg">{emoji.description}</p>
              </div>
            {/if}

            <div class="card-actions justify-center mt-6">
              <div class="tooltip" data-tip="Back to Home">
                <button class="btn btn-outline" onclick={() => goto(`${base}/`)}>
                  <Icon src={Home} class="h-5 w-5" />
                </button>
              </div>
              <div class="tooltip" data-tip={copied ? "Copied!" : "Copy"}>
                <button
                  class="btn btn-outline"
                  onclick={async () => {
                    if (emoji) {
                      await navigator.clipboard.writeText(emoji.char);
                      copied = true;
                      setTimeout(() => {
                        copied = false;
                      }, 2000);
                    }
                  }}
                >
                  <label class="swap swap-rotate">
                    <input type="checkbox" bind:checked={copied} />
                    <Icon src={DocumentDuplicate} class="swap-off h-5 w-5" />
                    <Icon src={Check} class="swap-on h-5 w-5" />
                  </label>
                </button>
              </div>
              <div class="tooltip" data-tip={isFavorite ? "Unfavorite" : "Favorite"}>
                <button
                  class="btn {isFavorite ? 'btn-filled' : 'btn-outline'} btn-error"
                  onclick={() => {
                    if (emoji) {
                      toggleFavorite(emoji.char);
                    }
                  }}
                >
                  {#if isFavorite}
                    <Icon src={Heart} class="h-5 w-5 fill-pink-500" solid />
                  {:else}
                    <Icon src={Heart} class="h-5 w-5" />
                  {/if}
                </button>
              </div>
              <div class="tooltip" data-tip={hasCursorEffect ? "Remove Cursor Effect" : "Use Cursor Effect"}>
                <button
                  class="btn {hasCursorEffect ? 'btn-filled' : 'btn-outline'} btn-primary"
                  aria-label={hasCursorEffect ? "Remove Cursor Effect" : "Use Cursor Effect"}
                  onclick={() => {
                    if (emoji) {
                      if (hasCursorEffect) {
                        clearCursorEffect();
                      } else {
                        setCursorEffect(emoji.char);
                      }
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 {hasCursorEffect ? 'fill-current' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
    </div>
  </div>
</FavoritesDrawer>
