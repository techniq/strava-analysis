<script lang="ts">
  import { scaleSequential, scaleTime } from 'd3-scale';
  import { interpolateTurbo } from 'd3-scale-chromatic';
  import { format, getDayOfYear } from 'date-fns';
  import { extent } from 'd3-array';

  import { Card, promiseStore, sortFunc } from 'svelte-ux';
  import { Axis, Chart, Highlight, Spline, Svg, Text, Tooltip, TooltipItem } from 'layerchart';
  import { metersToMiles } from '$lib/utils.js';

  export let data;
  const streamed = promiseStore(data.streamed.activities);
  $: streamed.setPromise(data.streamed.activities);

  $: activitiesBySportType = $streamed.data?.activitiesBySportType ?? [];

  $: yearsDomain = extent(
    activitiesBySportType
      .flatMap(([type, sportData]) => sportData)
      .flatMap((d) => d.valuesByYear)
      .flatMap((d) => d[0])
  );
  $: colorScale = scaleSequential(interpolateTurbo).domain(yearsDomain);
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
        tooltip={{ mode: 'voronoi', snapToDataX: true, snapToDataY: true }}
        let:tooltip
      >
        <Svg>
          <Axis placement="left" grid={{ style: 'stroke-dasharray: 2' }} rule format="metric" />
          <Axis placement="bottom" rule ticks={0} />
          {#each data.valuesByYear.sort(sortFunc((d) => d[0])) as [year, yearData], i}
            {@const color =
              tooltip.data == null || tooltip.data.start_date.getFullYear() === year
                ? colorScale(year)
                : '#ddd'}
            <Spline data={yearData.values} width={2} stroke={color}>
              <svelte:fragment slot="end">
                <circle r={3} fill={color} />
                <Text
                  verticalAnchor="middle"
                  value={year}
                  dx={4}
                  dy={-2}
                  class="text-xs stroke-white stroke-2"
                  style="fill:{color}"
                />
              </svelte:fragment>
            </Spline>
          {/each}
          <Highlight points={{ class: 'fill-black' }} lines />
        </Svg>
        <Tooltip header={(data) => format(data.start_date, 'MM/dd/yyyy')} let:data>
          <TooltipItem
            label="Distance"
            value={metersToMiles(data.distance)}
            format="decimal"
            valueAlign="right"
          />
          <TooltipItem
            label="Total Distance"
            value={metersToMiles(data.totalDistance)}
            format="decimal"
            valueAlign="right"
          />
        </Tooltip>
      </Chart>
    </Card>
  {/each}
</div>
