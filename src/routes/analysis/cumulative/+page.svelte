<script lang="ts">
  import { scaleBand, scaleTime } from 'd3-scale';
  import { format } from 'date-fns';

  import { Card } from 'svelte-ux';
  import { Area, Axis, Chart, Highlight, Svg, Tooltip, TooltipItem } from 'layerchart';

  export let data;

  $: ({ activitiesBySportType, startDateExtent } = data);
</script>

<div class="grid gap-4 p-4">
  {#each [...activitiesBySportType] as [type, data]}
    <Card title={type} class="h-[300px]">
      <Chart
        data={data.values}
        x="start_date"
        xScale={scaleTime()}
        _xScale={scaleBand().padding(0.4)}
        xDomain={startDateExtent}
        y={(d) => d.totalDistance / 1609}
        yDomain={[0, null]}
        yNice
        padding={{ left: 32, bottom: 24, right: 16 }}
        tooltip={{ mode: 'bisect-x', snapToDataX: true, snapToDataY: true }}
      >
        <Svg>
          <Axis placement="left" grid={{ style: 'stroke-dasharray: 2' }} rule format="metric" />
          <Axis placement="bottom" grid rule />
          <Area line={{ class: 'stroke-blue-500 stroke-2' }} class="fill-blue-500/30" />
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
