<script lang="ts">
  import { scaleTime } from 'd3-scale';
  import { format } from 'date-fns';

  import { Card } from 'svelte-ux';
  import { Area, Axis, Chart, Highlight, LinearGradient, Svg, Tooltip } from 'layerchart';
  import { promiseStore } from '@layerstack/svelte-stores';

  import { metersToMiles } from '$lib/utils.js';

  let { data } = $props();

  const streamed = promiseStore(data.streamed.activities);
  $effect(() => {
    streamed.setPromise(data.streamed.activities);
  });

  let activitiesBySportType = $derived($streamed.data?.activitiesBySportType ?? []);
  let startDateExtent = $derived($streamed.data?.startDateExtent ?? []);
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
          <LinearGradient class="from-blue-500/50 to-blue-500/10" vertical>
            {#snippet children({ gradient })}
              {#each data.valuesByYear as [year, yearData]}
                <Area
                  data={yearData.values}
                  line={{ class: 'stroke-2 stroke-blue-500' }}
                  fill={gradient}
                />
              {/each}
            {/snippet}
          </LinearGradient>
          <Highlight points={{ class: 'fill-blue-500' }} lines />
        </Svg>

        <Tooltip.Root x="data" y="data" xOffset={8} yOffset={8}>
          {#snippet children({ data })}
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
          {/snippet}
        </Tooltip.Root>
      </Chart>
    </Card>
  {/each}
</div>
