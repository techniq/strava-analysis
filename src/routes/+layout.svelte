<script lang="ts">
  import { onMount } from 'svelte';
  import posthog from 'posthog-js';
  import { AppLayout, ViewportCenter, Card, Button, AppBar, Tooltip } from 'svelte-ux';
  import { mdiGithub, mdiLogin, mdiTwitter } from '@mdi/js';

  import { athlete } from '$lib/stores';
  import { dev } from '$app/environment';
  import { page } from '$app/stores';

  import NavMenu from './_NavMenu.svelte';

  export let data;

  $athlete = data.athlete;

  let currentPath = '';
  onMount(() => {
    // Posthog analytics
    if (!dev) {
      const unsubscribePage = page.subscribe(($page) => {
        if (currentPath && currentPath !== $page.url.pathname) {
          // Page navigated away
          posthog.capture('$pageleave');
        }

        // Page entered
        currentPath = $page.url.pathname;
        posthog.capture('$pageview');
      });
      const handleBeforeUnload = () => {
        // Hard reloads or browser exit
        posthog.capture('$pageleave');
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        unsubscribePage();
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  });
</script>

{#if !data.accessToken}
  <ViewportCenter>
    <Card title="Authenticate" subheading="Login to retrieve access token for Strava API">
      <div class="px-4 pb-4">
        <Button href="/auth/login" rel="external" variant="fill" color="blue" icon={mdiLogin}>
          Login
        </Button>
      </div>
    </Card>
  </ViewportCenter>
{:else}
  <AppLayout>
    <nav slot="nav" class="nav h-full">
      <NavMenu />
    </nav>

    <AppBar title="Strava Analysis">
      <div slot="actions" class="flex gap-3">
        <Tooltip title="Open Twitter / X" placement="left" offset={2}>
          <Button
            icon={mdiTwitter}
            href="https://twitter.com/techniq35"
            class="p-2"
            target="_blank"
          />
        </Tooltip>

        <Tooltip title="View repository" placement="left" offset={2}>
          <Button
            icon={mdiGithub}
            href="https://github.com/techniq/strava-analysis"
            class="p-2"
            target="_blank"
          />
        </Tooltip>
      </div>
    </AppBar>

    <slot />
  </AppLayout>
{/if}

<style lang="postcss">
  @tailwind base;
  @tailwind components;

  :global(body) {
    @apply bg-black/10;
  }

  :global(nav h1) {
    @apply py-2 pl-4 mt-4 text-sm text-gray-200 font-bold bg-black/20 border-t border-b border-white/10;
  }

  :global(nav h2) {
    @apply pt-4 pb-2 pl-4 text-xs text-gray-200 font-bold;
  }

  :global(.AppBar) {
    @apply bg-orange-500 text-white shadow-md;
  }
  :global(nav) {
    @apply bg-neutral-800;
  }

  :global(.NavItem) {
    @apply text-sm text-gray-400 pl-6 py-2 border-l-4 border-transparent;

    &:hover {
      @apply text-white bg-gray-300/10;
    }

    &.is-active {
      @apply text-orange-400 bg-gray-500/10 border-orange-400;
    }
  }

  @tailwind utilities;
</style>
