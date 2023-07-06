<script lang="ts">
  import { AppBar, ToggleGroup, ToggleOption } from 'svelte-ux';

  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  export let data;
</script>

<AppBar title="History" />

<main>
  <div class="bg-white">
    <ToggleGroup
      value={$page.route.id}
      variant="underlined"
      classes={{ root: 'px-4', option: 'px-4' }}
      on:change={(e) => goto(e.detail.value)}
    >
      <ToggleOption value="/history/overview">Overview</ToggleOption>
      <ToggleOption value="/history/cumulative">Cumulative</ToggleOption>
      <ToggleOption value="/history/yearly">Yearly</ToggleOption>
      <ToggleOption value="/history/yearToDate">YTD</ToggleOption>
    </ToggleGroup>
  </div>

  <slot />
</main>
