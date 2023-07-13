<script lang="ts">
  import { AppBar, ToggleGroup, ToggleOption } from 'svelte-ux';

  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  export let data;
</script>

<AppBar title="Analysis" />

<main>
  <div class="bg-white">
    <ToggleGroup
      value={$page.route.id}
      variant="underline"
      classes={{
        root: 'overflow-auto scrollbar-none',
        options: 'h-10 justify-start',
        label: 'first:ml-4',
        option: 'px-4 whitespace-nowrap'
      }}
      on:change={(e) => goto(e.detail.value)}
    >
      <ToggleOption value="/analysis/overview">Overview</ToggleOption>
      <ToggleOption value="/analysis/yearly">Yearly</ToggleOption>
      <ToggleOption value="/analysis/yearToDate">Year to Date</ToggleOption>
      <ToggleOption value="/analysis/timeOfDay">Time of Day</ToggleOption>
      <ToggleOption value="/analysis/cumulative">Cumulative</ToggleOption>
    </ToggleGroup>
  </div>

  <slot />
</main>
