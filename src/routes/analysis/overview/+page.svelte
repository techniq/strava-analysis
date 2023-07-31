<script lang="ts">
  import { scaleBand } from 'd3-scale';
  import { timeMonth, timeYear } from 'd3-time';
  import { format } from 'date-fns';

  import { Card, PeriodType, formatDate } from 'svelte-ux';
  import { Axis, Bars, Chart, Highlight, Svg, Tooltip, TooltipItem } from 'layerchart';

  export let data;

  $: ({ activitiesBySportType, startDateExtent } = data);
</script>

<div class="grid gap-4 p-4">
  {#each [...activitiesBySportType] as [type, data]}
    <Card title={type} class="h-[300px]">
      <Chart
        data={data.values}
        x={(d) => timeMonth(d.start_date)}
        xScale={scaleBand().padding(0.1)}
        xDomain={timeMonth.range(...startDateExtent)}
        y={(d) => d.distance / 1609}
        yDomain={[0, null]}
        yNice
        padding={{ left: 32, bottom: 24, right: 16 }}
        tooltip={{ mode: 'voronoi', snapToDataX: true, snapToDataY: true }}
      >
        <Svg>
          <Axis placement="left" grid={{ style: 'stroke-dasharray: 2' }} rule format="metric" />
          <Axis
            placement="bottom"
            grid
            rule
            ticks={timeYear.range(...startDateExtent)}
            format={(d) => formatDate(d, PeriodType.CalendarYear)}
          />
          <Bars class="fill-blue-500/10" />
          <Highlight points={{ class: 'fill-blue-500' }} lines />
        </Svg>
        <Tooltip header={(data) => format(data.start_date, 'eee, MMMM do')} let:data>
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
