<script lang="ts">
  import { scaleBand } from 'd3-scale';
  import { timeMonth, timeYear } from 'd3-time';
  import { format as dateFormat } from 'date-fns';

  import { Card } from 'svelte-ux';
  import { Axis, Bars, Chart, Highlight, Svg, Tooltip } from 'layerchart';
  import { format, formatDate, PeriodType } from '@layerstack/utils';
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
    {@const lastActivity = data.values.at(-1)}
    <Card
      title={type}
      subheading="{data.values.length} activities • {format(
        metersToMiles(lastActivity.totalDistance),
        'decimal'
      )} total miles"
      class="h-[300px]"
    >
      <Chart
        data={data.values}
        x={(d) => timeMonth(d.start_date)}
        xScale={scaleBand().padding(0.1)}
        xDomain={timeMonth.range(...startDateExtent)}
        y={(d) => metersToMiles(d.distance)}
        yDomain={[0, null]}
        yNice
        padding={{ left: 32, bottom: 24, right: 16 }}
        tooltip={{ mode: 'voronoi' }}
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
        <Tooltip.Root x="data" y="data" let:data>
          <Tooltip.Header>{dateFormat(data.start_date, 'eee, MMMM do')}</Tooltip.Header>
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
