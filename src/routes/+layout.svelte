<script lang="ts">
  import { onMount } from 'svelte';
  import posthog from 'posthog-js';
  import {
    AppLayout,
    ViewportCenter,
    Card,
    Button,
    AppBar,
    Tooltip,
    settings,
    ThemeSelect
  } from 'svelte-ux';
  import { mdiGithub, mdiLogin, mdiTwitter } from '@mdi/js';

  import { athlete } from '$lib/stores';
  import { dev } from '$app/environment';
  import { page } from '$app/stores';

  import NavMenu from './_NavMenu.svelte';

  export let data;

  settings({
    components: {
      AppLayout: {
        classes: {
          aside: 'border-r',
          nav: 'bg-surface-300'
        }
      },
      AppBar: {
        classes:
          'bg-primary text-primary-content shadow-md [text-shadow:1px_1px_2px_theme(colors.primary-700)]'
      },
      NavItem: {
        classes: {
          root: 'text-sm text-surface-content/70 pl-6 py-2 hover:bg-surface-100/70 relative',
          active:
            'text-primary bg-surface-100 font-medium before:absolute before:bg-primary before:rounded-full before:w-1 before:h-2/3 before:left-[6px] shadow z-10'
        }
      }
    },
    // themes: data.themes,
    themes: {
      light: ['light'],
      dark: ['dark']
    }
  });

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
    <svelte:fragment slot="nav">
      <NavMenu />
    </svelte:fragment>

    <AppBar title="Strava Analysis">
      <div slot="actions" class="flex gap-3 items-center">
        <ThemeSelect />
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
  @tailwind utilities;

  :global(body) {
    @apply bg-surface-200;
  }
</style>
