<script lang="ts">
  import { linear } from 'svelte/easing';
  import { scaleSequential, scaleTime } from 'd3-scale';
  import { interpolateTurbo } from 'd3-scale-chromatic';
  import { getDayOfYear } from 'date-fns';
  import { extent, range } from 'd3-array';

  import { Card } from 'svelte-ux';
  import { Axis, Chart, Highlight, Spline, Svg, Text, Tooltip } from 'layerchart';
  import { PeriodType, sortFunc, format } from '@layerstack/utils';
  import { promiseStore } from '@layerstack/svelte-stores';
  import { metersToMiles } from '$lib/utils.js';

  let { data } = $props();
  const streamed = promiseStore(data.streamed.activities);
  $effect(() => {
    streamed.setPromise(data.streamed.activities);
  });

  let activitiesBySportType = $derived($streamed.data?.activitiesBySportType ?? []);

  let yearsDomain = $derived(
    extent(
      activitiesBySportType
        .flatMap(([type, sportData]) => sportData)
        .flatMap((d) => d.valuesByYear)
        .flatMap((d) => d[0])
    )
  );
  // Remove year to skip black color
  let colorScale = $derived(
    scaleSequential(interpolateTurbo).domain([yearsDomain[0] - 1, yearsDomain[1]])
  );
</script>

<div class="grid gap-4 p-4">
  {#each activitiesBySportType as [type, data]}
    <Card title={type} class="h-[300px]">
      <Chart
        data={data.valuesByYear.flatMap((d) => d[1].values)}
        x={(d) => getDayOfYear(d.start_date)}
        xScale={scaleTime()}
        xDomain={[1, 366]}
        y={(d) => metersToMiles(d.totalDistance)}
        yDomain={[0, null]}
        yNice
        padding={{ left: 32, bottom: 24, right: 32 }}
        tooltip={{ mode: 'voronoi' }}
      >
        {#snippet children({ context })}
          <Svg>
            <Axis placement="left" grid={{ style: 'stroke-dasharray: 2' }} rule format="metric" />
            <Axis
              placement="bottom"
              rule
              ticks={range(0, 12).map((m) => getDayOfYear(new Date(2024, m, 1)))}
              format={(v) => format(new Date(2024, 0, v), PeriodType.Month)}
            />
            {#each data.valuesByYear.sort(sortFunc((d) => d[0])) as [year, yearData], i}
              {@const color =
                context.tooltip.data == null ||
                context.tooltip.data.start_date.getFullYear() === year
                  ? colorScale(year)
                  : 'color-mix(in oklab, var(--color-surface-content) 20%, transparent)'}
              <Spline
                data={yearData.values}
                width={2}
                stroke={color}
                draw={{ duration: 8000, easing: linear }}
              >
                {#snippet endContent()}
                  <circle r={3} fill={color} />
                  <Text
                    verticalAnchor="middle"
                    value={year}
                    dx={4}
                    dy={-2}
                    class="text-xs stroke-surface-100 stroke-2"
                    style="fill:{color}"
                  />
                {/snippet}
              </Spline>
            {/each}
            <Highlight lines />
          </Svg>

          <Tooltip.Root x="data" y="data" xOffset={8}>
            <Tooltip.Header
              >{format(context.tooltip.data.start_date, PeriodType.Day)}</Tooltip.Header
            >
            <Tooltip.List>
              <Tooltip.Item
                label="Distance"
                value={metersToMiles(context.tooltip.data.distance)}
                format="decimal"
                valueAlign="right"
              />
              <Tooltip.Item
                label="Total Distance"
                value={metersToMiles(context.tooltip.data.totalDistance)}
                format="decimal"
                valueAlign="right"
              />
            </Tooltip.List>
          </Tooltip.Root>
        {/snippet}
      </Chart>
    </Card>
  {/each}
</div>
