<script lang="ts">
  import { scaleTime } from 'd3-scale';
  import { format } from 'date-fns';

  import { Card } from 'svelte-ux';
  import { Area, Axis, Chart, Highlight, LinearGradient, Svg, Tooltip } from 'layerchart';
  import { promiseStore } from '@layerstack/svelte-stores';

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
        data={data.valuesByYear.flatMap((d) => d[1].values)}
        x="start_date"
        xScale={scaleTime()}
        xDomain={startDateExtent}
        y={(d) => metersToMiles(d.totalDistance)}
        yDomain={[0, null]}
        yNice
        padding={{ left: 32, bottom: 24, right: 16 }}
        tooltip={{ mode: 'bisect-x' }}
      >
        <Svg>
          <Axis placement="left" grid={{ style: 'stroke-dasharray: 2' }} rule format="metric" />
          <Axis placement="bottom" grid rule />
          <LinearGradient class="from-blue-500/50 to-blue-500/10" vertical let:gradient>
            {#each data.valuesByYear as [year, yearData]}
              <Area
                data={yearData.values}
                line={{ class: 'stroke-2 stroke-blue-500' }}
                fill={gradient}
              />
            {/each}
          </LinearGradient>
          <Highlight points={{ class: 'fill-blue-500' }} lines />
        </Svg>
        <Tooltip.Root x="data" y="data" let:data>
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
      </Chart>
    </Card>
  {/each}
</div>
