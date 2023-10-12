<script lang="ts">
  import { scaleBand, scaleTime } from 'd3-scale';
  import { format } from 'date-fns';

  import { Card, promiseStore } from 'svelte-ux';
  import {
    Area,
    Axis,
    Chart,
    Highlight,
    LinearGradient,
    Svg,
    Tooltip,
    TooltipItem
  } from 'layerchart';
  import { metersToMiles } from '$lib/utils.js';

  export let data;

  const streamed = promiseStore(data.streamed.activities);
  $: streamed.setPromise(data.streamed.activities);

  $: activitiesBySportType = $streamed.data?.activitiesBySportType ?? [];
  $: startDateExtent = $streamed.data?.startDateExtent ?? [];
</script>

<div class="grid gap-4 p-4">
  {#each activitiesBySportType as [type, data]}
    <Card title={type} class="h-[300px]">
      <Chart
        data={data.values}
        x="start_date"
        xScale={scaleTime()}
        _xScale={scaleBand().padding(0.4)}
        xDomain={startDateExtent}
        y={(d) => metersToMiles(d.totalDistance)}
        yDomain={[0, null]}
        yNice
        padding={{ left: 32, bottom: 24, right: 16 }}
        tooltip={{ mode: 'bisect-x', snapToDataX: true, snapToDataY: true }}
      >
        <Svg>
          <Axis placement="left" grid={{ style: 'stroke-dasharray: 2' }} rule format="metric" />
          <Axis placement="bottom" grid rule />
          <LinearGradient class="from-blue-500/50 to-blue-500/0" vertical let:url>
            <Area line={{ class: 'stroke-blue-500 stroke-2' }} fill={url} />
          </LinearGradient>
          <Highlight points={{ class: 'fill-blue-500' }} lines />
        </Svg>
        <Tooltip header={(data) => format(data.start_date, 'eee, MMMM do')} let:data>
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
