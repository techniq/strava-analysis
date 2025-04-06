<script lang="ts">
  import { format } from 'date-fns';

  import { Card } from 'svelte-ux';
  import { Area, LinearGradient, LineChart, Tooltip } from 'layerchart';
  import { promiseStore } from '@layerstack/svelte-stores';
  import { metersToMiles } from '$lib/utils.js';
  import { PeriodType } from '@layerstack/utils';

  export let data;

  const streamed = promiseStore(data.streamed.activities);
  $: streamed.setPromise(data.streamed.activities);

  $: activitiesBySportType = $streamed.data?.activitiesBySportType ?? [];
  $: startDateExtent = $streamed.data?.startDateExtent ?? [];
</script>

<div class="grid gap-4 p-4">
  {#each activitiesBySportType as [type, data]}
    <Card title={type} class="h-[300px]">
      <LineChart
        data={data.values}
        x="start_date"
        xDomain={startDateExtent}
        y={(d) => metersToMiles(d.totalDistance)}
        padding={{ left: 32, bottom: 24, right: 16 }}
        props={{
          xAxis: {
            format: PeriodType.CalendarYear,
            grid: { style: 'stroke-dasharray: 2' }
          },
          yAxis: {
            format: 'metric'
          },
          highlight: {
            points: {
              class: 'fill-blue-500'
            }
          }
        }}
      >
        {#snippet marks()}
          <LinearGradient class="from-blue-500/50 to-blue-500/1" vertical>
            {#snippet children({ gradient })}
              <Area line={{ class: 'stroke-blue-500 stroke-2' }} fill={gradient} />
            {/snippet}
          </LinearGradient>
        {/snippet}

        {#snippet tooltip({ context })}
          <Tooltip.Root x="data" y="data" xOffset={8} yOffset={8}>
            {@const data = context.tooltip.data}
            <Tooltip.Header>{format(data.start_date, 'eee, MMMM do')}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item
                label="Distance"
                value={metersToMiles(data.distance)}
                format="decimal"
                valueAlign="right"
              />
              <Tooltip.Item
                label="Total Distance"
                value={metersToMiles(data.totalDistance)}
                format="decimal"
                valueAlign="right"
              />
            </Tooltip.List>
          </Tooltip.Root>
        {/snippet}
      </LineChart>
    </Card>
  {/each}
</div>
