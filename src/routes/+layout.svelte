<script lang="ts">
  import { onMount } from "svelte";
  import "../app.css";
  import { theme } from "$lib/stores/theme";
  import { browser } from "$app/environment";
  import { base } from "$app/paths";
  import { initializeCursorEffect } from "$lib/stores/cursorEffect";

  let { children } = $props();

  onMount(() => {
    if (browser) {
      const unsubscribe = theme.subscribe((value) => {
        document.documentElement.setAttribute("data-theme", value);
      });

      // Initialize cursor effect if one is stored
      initializeCursorEffect();

      // Register service worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register(`${base}/service-worker.js`)
          .then((registration) => {
            console.log('Service worker registered:', registration);
          })
          .catch((error) => {
            console.error('Service worker registration failed:', error);
          });
      }

      return unsubscribe;
    }
  });
</script>

<svelte:head>
  <meta
    name="description"
    content="A fun and fresh emoji search and browser app"
  />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#ffffff" />
  <link rel="manifest" href="{base}/manifest.json" />
</svelte:head>

{@render children()}
