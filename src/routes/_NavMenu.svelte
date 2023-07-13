<script lang="ts">
  import { mdiExitRun, mdiFinance, mdiHome, mdiTimelineClockOutline } from '@mdi/js';

  import { Button, Dialog, NavItem, Toggle, Tooltip } from 'svelte-ux';

  import { athlete } from '$lib/stores';
  import { page } from '$app/stores';

  $: console.log({ $athlete });
</script>

<NavItem currentUrl={$page.url} class="pl-4 border-b border-b-neutral-600">
  <img src={$athlete.profile} class="w-10 h-10 rounded-full mr-4 border border-neutral-600" />

  {#if $athlete}
    <div class="flex-grow">
      <div>{$athlete.firstname} {$athlete.lastname}</div>
      <div class="text-xs text-white/30">{$athlete.city}, {$athlete.state}</div>
    </div>
  {/if}

  <Toggle let:on={open} let:toggle>
    <Tooltip title="Sign out">
      <Button icon={mdiExitRun} on:click={toggle} class="p-2" />
    </Tooltip>

    <Dialog {open} on:close={toggle}>
      <div slot="title">Sign out</div>
      <div class="p-4">Are you sure you want to sign out?</div>

      <div slot="actions" class="flex items-center gap-2">
        <Button variant="fill" color="blue" icon={mdiExitRun} href="/auth/logout" rel="external">
          Sign out
        </Button>
        <Button>Cancel</Button>
      </div>
    </Dialog>
  </Toggle>
</NavItem>

<NavItem text="Home" icon={mdiHome} path="/" currentUrl={$page.url} class="mt-2" />

<h2>Activities</h2>
<NavItem text="Browse" icon={mdiTimelineClockOutline} path="/activities" currentUrl={$page.url} />
<NavItem text="Analysis" icon={mdiFinance} path="/analysis" currentUrl={$page.url} />
