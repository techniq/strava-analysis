<script lang="ts">
  import { scaleThreshold } from 'd3-scale';
  import { endOfYear, startOfDay } from 'date-fns';
  import { flatRollup, range, sum } from 'd3-array';
  import { schemeGreens } from 'd3-scale-chromatic';

  import { Card, PeriodType, promiseStore, format, sortFunc } from 'svelte-ux';
  import { Calendar, Chart, Group, Svg, Text, Tooltip, TooltipItem } from 'layerchart';
  import { metersToMiles } from '$lib/utils.js';

  export let data;
  const streamed = promiseStore(data.streamed.activities);
  $: streamed.setPromise(data.streamed.activities);

  $: activitiesBySportType = $streamed.data?.activitiesBySportType ?? [];
  $: startDateExtent = $streamed.data?.startDateExtent ?? [];

  $: years = range(startDateExtent[0]?.getFullYear(), startDateExtent[1]?.getFullYear() + 1).sort(
    sortFunc((d) => d, 'desc')
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
    <Card
      title={type}
      subheading="{data.values.length} activities • {format(
        lastActivity.distance,
        'decimal'
      )} total miles"
      class="overflow-hidden"
      style="height: {years.length * 136 + 16 + 80}px"
    >
      <Chart
        data={chartData}
        x={(d) => d.date}
        r={(d) => d.distance}
        rScale={scaleThreshold().unknown('transparent')}
        rDomain={[1, 3, 6, 12]}
        rRange={schemeGreens[5]}
        padding={{ left: 40, top: 16 }}
        tooltip={{ mode: 'manual' }}
        let:tooltip
      >
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
              <Calendar {start} {end} {tooltip} cellSize={16} monthPath />
            </Group>
          {/each}
        </Svg>

        <Tooltip header={(d) => format(d.date, PeriodType.Day)} let:data>
          {#if data.distance != null}
            <TooltipItem label="miles" value={data.distance} format="decimal" valueAlign="right" />
          {/if}
        </Tooltip>
      </Chart>
    </Card>
  {/each}
</div>
