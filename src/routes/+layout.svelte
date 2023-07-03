<script lang="ts">
  import { AppLayout, ViewportCenter, Card, Button, createTheme } from 'svelte-ux';

  import { athlete } from '$lib/stores';

  import NavMenu from './_NavMenu.svelte';
  import { mdiLogin } from '@mdi/js';

  export let data;

  createTheme({
    //
  });

  $athlete = data.athlete;
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
