<script lang="ts">
  import { Card, ProgressCircle, ToggleGroup, ToggleOption } from 'svelte-ux';
  import { format } from '@layerstack/utils';

  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  export let data;
</script>

<main>
  <div class="bg-surface-100">
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
      <ToggleOption value="/analysis/calendar">Calendar</ToggleOption>
      <ToggleOption value="/analysis/timeOfDay">Time of Day</ToggleOption>
      <ToggleOption value="/analysis/cumulative">Cumulative</ToggleOption>
    </ToggleGroup>
  </div>

  {#await data.streamed.activities}
    <Card class="h-[300px] m-4 grid items-center justify-center">
      <div class="grid gap-4 justify-items-center">
        <ProgressCircle class="text-primary" />
        <span class="text-primary-700">
          Loading {format(data.totalActivities, 'integer')} activities...
        </span>
      </div>
    </Card>
  {:then data}
    <slot />
  {/await}
</main>
