<script lang="ts">
  import { mdiExitRun, mdiFinance, mdiTimelineClockOutline } from '@mdi/js';

  import { Button, Dialog, NavItem, Toggle, Tooltip } from 'svelte-ux';

  import { appState } from '$lib/state.svelte';
  import { page } from '$app/state';
</script>

<NavItem path="" currentUrl={page.url} class="pl-4 border-b">
  <img
    src={appState.athlete.profile}
    class="w-10 h-10 rounded-full mr-4 border border-surface-300"
    alt="profile"
  />

  {#if appState.athlete}
    <div class="grow">
      <div>{appState.athlete.firstname} {appState.athlete.lastname}</div>
      <div class="text-xs text-surface-content/40">
        {appState.athlete.city}, {appState.athlete.state}
      </div>
    </div>
  {/if}

  <Toggle let:on={open} let:toggle let:toggleOff>
    <Tooltip title="Sign out">
      <Button icon={mdiExitRun} on:click={toggle} class="p-1 m-1 transition-none" />
    </Tooltip>

    <Dialog {open} on:close={toggleOff}>
      <div slot="title">Sign out</div>
      <div class="p-4">Are you sure you want to sign out?</div>

      <div slot="actions" class="flex items-center gap-2">
        <Button variant="fill" color="primary" icon={mdiExitRun} href="/auth/logout" rel="external">
          Sign out
        </Button>
        <Button>Cancel</Button>
      </div>
    </Dialog>
  </Toggle>
</NavItem>

<!-- <NavItem text="Home" icon={mdiHome} path="/" currentUrl={page.url} class="mt-2" /> -->

<h2>Activities</h2>
<NavItem text="Analysis" icon={mdiFinance} path="/analysis" currentUrl={page.url} />
<NavItem text="Browse" icon={mdiTimelineClockOutline} path="/activities" currentUrl={page.url} />
