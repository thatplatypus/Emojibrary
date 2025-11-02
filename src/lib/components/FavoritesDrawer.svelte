<script lang="ts">
  import { emojis } from "$lib/stores/emoji";
  import { favorites } from "$lib/stores/favorites";
  import { base } from "$app/paths";
  import type { Emoji } from "$lib/types/emoji";
  import { Check, Icon, DocumentDuplicate, Heart } from "svelte-hero-icons";
  import { onMount } from "svelte";

  const DRAWER_STATE_KEY = "emojibrary-drawer-open";

  let copiedChar = $state<string | null>(null);
  let drawerOpen = $state(false);

  onMount(() => {
    // Load initial drawer state from localStorage
    try {
      const stored = localStorage.getItem(DRAWER_STATE_KEY);
      if (stored !== null) {
        drawerOpen = stored === "true";
      }
    } catch (err) {
      console.error("Error loading drawer state:", err);
    }
  });

  // Save drawer state when it changes
  $effect(() => {
    try {
      localStorage.setItem(DRAWER_STATE_KEY, String(drawerOpen));
    } catch (err) {
      console.error("Error saving drawer state:", err);
    }
  });

  const favoriteEmojis = $derived.by(() => {
    return $favorites
      .map((char) => $emojis.find((e) => e.char === char))
      .filter((e): e is Emoji => e !== undefined);
  });

  const hasFavorites = $derived.by(() => $favorites.length > 0);

  const copyEmoji = async (char: string) => {
    await navigator.clipboard.writeText(char);
    copiedChar = char;
    setTimeout(() => {
      copiedChar = null;
    }, 2000);
  };
</script>

<div class="drawer drawer-open h-screen">
  <input
    id="favorites-drawer"
    type="checkbox"
    class="drawer-toggle"
    bind:checked={drawerOpen}
  />
  <div class="drawer-content">
    <slot />
  </div>
  <div class="drawer-side h-full fixed is-drawer-close:overflow-visible">
    <label
      for="favorites-drawer"
      aria-label="close sidebar"
      class="drawer-overlay"
    ></label>
    <div
      class="is-drawer-close:w-14 is-drawer-open:w-64 bg-base-200 flex flex-col items-start min-h-full h-full"
    >
      {#if hasFavorites}
        <ul class="menu w-full grow px-0 py-2">
          {#each favoriteEmojis as emoji}
            <li>
              <div class="flex items-center gap-2 w-full">
                <a
                  href="{base}/{encodeURIComponent(emoji.char)}"
                  class="flex items-center gap-2 flex-1 btn btn-ghost justify-start text-left px-0"
                >
                  {#if !drawerOpen}
                    <div
                      class="tooltip tooltip-right"
                      data-tip={emoji.name || "Unknown"}
                    >
                      <span class="text-xl leading-none">{emoji.char}</span>
                    </div>
                  {:else}
                    <span class="text-2xl leading-none">{emoji.char}</span>
                  {/if}

                  <span class="is-drawer-close:hidden text-sm truncate"
                    >{emoji.name || "Unknown"}</span
                  >
                </a>
                {#if drawerOpen}
                <div class="tooltip tooltip-left" data-tip="Copy">

                  <button
                    class="btn btn-ghost btn-sm"
                    onclick={() => copyEmoji(emoji.char)}
                  >
                    <label class="swap swap-rotate">
                      <input
                        type="checkbox"
                        checked={copiedChar === emoji.char}
                      />
                      <Icon src={DocumentDuplicate} class="swap-off h-4 w-4" />
                      <Icon src={Check} class="swap-on h-4 w-4" />
                    </label>
                  </button>
                  </div>
                {/if}
              </div>
            </li>
          {/each}
        </ul>
      {:else}
        <div
          class="flex flex-col items-center justify-center w-full h-full p-4 text-center"
        >
          {#if drawerOpen}
            <span class="text-6xl mb-4">❤️</span>
          {:else}
            <div class="tooltip tooltip-right" data-tip="No favorites!">
              <span class="text-xl mb-4">💔</span>
            </div>
          {/if}
          <p class="{drawerOpen ? 'text-lg' : 'hidden'} opacity-70">
            No favorites!
          </p>
        </div>
      {/if}
      <div
        class="m-2 tooltip tooltip-right"
        data-tip={drawerOpen ? "Close" : "Open"}
      >
        <label
          for="favorites-drawer"
          class="btn btn-ghost btn-circle drawer-button is-drawer-open:rotate-y-180"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            stroke-linejoin="round"
            stroke-linecap="round"
            stroke-width="2"
            fill="none"
            stroke="currentColor"
            class="inline-block size-4"
          >
            <path
              d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"
            ></path>
            <path d="M9 4v16"></path>
            <path d="M14 10l2 2l-2 2"></path>
          </svg>
        </label>
      </div>
    </div>
  </div>
</div>
