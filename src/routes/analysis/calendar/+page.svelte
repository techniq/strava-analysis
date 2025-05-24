<script lang="ts">
  import { scaleThreshold } from 'd3-scale';
  import { endOfYear, startOfDay } from 'date-fns';
  import { flatRollup, range, sum } from 'd3-array';
  import { schemeGreens } from 'd3-scale-chromatic';

  import { Card, Lazy } from 'svelte-ux';
  import { Calendar, Chart, Group, Svg, Text, Tooltip } from 'layerchart';
  import { format, PeriodType, sortFunc } from '@layerstack/utils';
  import { promiseStore } from '@layerstack/svelte-stores';

  import { metersToMiles } from '$lib/utils.js';

  let { data } = $props();
  const streamed = promiseStore(data.streamed.activities);
  $effect(() => {
    streamed.setPromise(data.streamed.activities);
  });

  let activitiesBySportType = $derived($streamed.data?.activitiesBySportType ?? []);
  let startDateExtent = $derived($streamed.data?.startDateExtent ?? []);

  let years = $derived(
    range(startDateExtent[0]?.getFullYear(), startDateExtent[1]?.getFullYear() + 1).sort(
      sortFunc((d) => d, 'desc')
    )
  );

  // Rollup by day
  function rollupActivites(values: any[]) {
    return flatRollup(
      values,
      (activities) => {
        return {
          distance: sum(activities, (d) => metersToMiles(d.distance)),
          activities
        };
      },
      (d) => startOfDay(d.start_date)
    ).map(([key, value]) => {
      return {
        date: key,
        ...value
      };
    });
  }
</script>

<div class="grid gap-4 p-4">
  {#each activitiesBySportType as [type, data]}
    {@const lastActivity = data.values.at(-1)}
    {@const chartData = rollupActivites(data.values)}
    {@const height = years.length * 136 + 16 + 80}
    <Lazy {height}>
      <Card
        title={type}
        subheading="{data.values.length} activities • {format(
          lastActivity.distance,
          'decimal'
        )} total miles"
        class="overflow-hidden"
        style="height: {height}px"
      >
        <Chart
          data={chartData}
          x={(d) => d.date}
          c={(d) => d.distance}
          cScale={scaleThreshold().unknown('transparent')}
          cDomain={[1, 3, 6, 12]}
          cRange={[
            'var(--color-secondary-100)',
            'var(--color-secondary-300)',
            'var(--color-secondary-500)',
            'var(--color-secondary-700)',
            'var(--color-secondary-900)'
          ]}
          padding={{ left: 40, top: 16 }}
        >
          {#snippet children({ context })}
            <Svg>
              {#each years as year, i}
                {@const start = new Date(year, 0, 1)}
                {@const end = endOfYear(start)}
                <Group y={136 * i}>
                  <Text
                    value={year}
                    class="text-xs"
                    rotate={270}
                    x={-20}
                    y={(16 * 7) / 2}
                    textAnchor="middle"
                    verticalAnchor="start"
                  />
                  <Calendar
                    {start}
                    {end}
                    tooltipContext={context.tooltip}
                    cellSize={16}
                    monthPath
                  />
                </Group>
              {/each}
            </Svg>

            <Tooltip.Root>
              {@const data = context.tooltip.data}
              {format(data.date, PeriodType.Day)}

              {#if data.distance != null}
                <Tooltip.List>
                  <Tooltip.Item
                    label="miles"
                    value={data.distance}
                    format="decimal"
                    valueAlign="right"
                  />
                </Tooltip.List>
              {/if}
            </Tooltip.Root>
          {/snippet}
        </Chart>
      </Card>
    </Lazy>
  {/each}
</div>
