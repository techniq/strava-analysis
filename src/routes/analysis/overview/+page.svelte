<script lang="ts">
  import { timeMonth, timeYear } from 'd3-time';
  import { format as dateFormat } from 'date-fns';

  import { Card } from 'svelte-ux';
  import { BarChart, Tooltip } from 'layerchart';
  import { format, PeriodType } from '@layerstack/utils';
  import { promiseStore } from '@layerstack/svelte-stores';

  import { metersToMiles } from '$lib/utils.js';

  let { data } = $props();

  const streamed = promiseStore(data.streamed.activities);
  $effect(() => {
    streamed.setPromise(data.streamed.activities);
  });

  let activitiesBySportType = $derived($streamed.data?.activitiesBySportType ?? []);
  let startDateExtent = $derived<Date[]>($streamed.data?.startDateExtent ?? []);
</script>

<div class="grid gap-4 p-4">
  {#each activitiesBySportType as [type, data]}
    {@const lastActivity = data.values.at(-1)}
    <Card
      title={type}
      subheading="{data.values.length} activities • {format(
        metersToMiles(lastActivity.totalDistance),
        'decimal'
      )} total miles"
      class="h-[300px]"
    >
      <BarChart
        data={data.values}
        x={(d) => timeMonth(d.start_date)}
        bandPadding={0.1}
        xDomain={timeMonth.range(startDateExtent[0], startDateExtent[1])}
        y={(d) => metersToMiles(d.distance)}
        padding={{ left: 32, bottom: 24, right: 16 }}
        props={{
          xAxis: {
            grid: true,
            ticks: timeYear.range(startDateExtent[0], startDateExtent[1]),
            format: PeriodType.CalendarYear
          },
          yAxis: {
            format: 'metric'
          },
          grid: {
            y: { style: 'stroke-dasharray: 2' }
          },
          bars: {
            rounded: 'none',
            class: 'fill-blue-500/10 stroke-none'
          },
          highlight: {
            points: { class: 'fill-blue-500' }
          },
          tooltip: {
            context: { mode: 'voronoi' }
          }
        }}
      >
        {#snippet tooltip({ context })}
          {@const data = context.tooltip.data}
          <Tooltip.Root x="data" y="data" xOffset={8} yOffset={8}>
            <Tooltip.Header>{dateFormat(data.start_date, 'eee, MMMM do')}</Tooltip.Header>
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
      </BarChart>
    </Card>
  {/each}
</div>
