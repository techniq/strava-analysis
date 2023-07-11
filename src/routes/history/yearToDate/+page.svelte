<script lang="ts">
  import { scaleSequential, scaleTime } from 'd3-scale';
  import { interpolateTurbo } from 'd3-scale-chromatic';
  import { format, getDayOfYear } from 'date-fns';

  import { Card } from 'svelte-ux';
  import {
    Axis,
    Chart,
    HighlightLine,
    Point,
    Spline,
    Svg,
    Text,
    Tooltip,
    TooltipItem
  } from 'layerchart';
  import { createPropertySortFunc } from 'svelte-ux/utils/sort';
  import { extent } from 'd3-array';

  export let data;
  $: ({ activitiesBySportType } = data);

  $: yearsDomain = extent(
    activitiesBySportType
      .flatMap(([type, sportData]) => sportData)
      .flatMap((d) => d.valuesByYear)
      .flatMap((d) => d[0])
  );
  $: colorScale = scaleSequential(interpolateTurbo).domain(yearsDomain);
</script>

<div class="grid gap-4 p-4">
  {#each [...activitiesBySportType] as [type, data]}
    <Card title={type} class="h-[300px]">
      <Chart
        data={data.valuesByYear.flatMap((d) => d[1].values)}
        x={(d) => getDayOfYear(d.start_date)}
        xScale={scaleTime()}
        xDomain={[1, 366]}
        y={(d) => d.totalDistance / 1609}
        yDomain={[0, null]}
        yNice
        padding={{ left: 32, bottom: 24, right: 32 }}
        tooltip={{ mode: 'voronoi', snapToDataX: true, snapToDataY: true }}
      >
        <Svg>
          <Axis placement="left" grid={{ style: 'stroke-dasharray: 2' }} rule format="metric" />
          <Axis placement="bottom" rule ticks={0} />
          {#each data.valuesByYear.sort(createPropertySortFunc((d) => d[0])) as [year, yearData], i}
            {@const color = colorScale(year)}
            <Spline data={yearData.values} width={2} stroke={color} />
            <Point d={yearData.values[yearData.values.length - 1]} let:x let:y>
              <circle cx={x} cy={y} r={3} fill={color} />
              <Text
                {x}
                {y}
                verticalAnchor="middle"
                value={year}
                dx={4}
                dy={-2}
                class="text-xs stroke-white stroke-2"
                style="fill:{color}"
              />
            </Point>
          {/each}
          <HighlightLine color="var(--color-blue-500)" />
        </Svg>
        <Tooltip header={(data) => format(data.start_date, 'MM/dd/yyyy')} let:data>
          <TooltipItem
            label="Distance"
            value={data.distance / 1609}
            format="decimal"
            valueAlign="right"
          />
          <TooltipItem
            label="Total Distance"
            value={data.totalDistance / 1609}
            format="decimal"
            valueAlign="right"
          />
        </Tooltip>
      </Chart>
    </Card>
  {/each}
</div>
