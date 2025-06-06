<script lang="ts">
  import { scaleBand, scaleSqrt } from 'd3-scale';
  import { getDay, getHours } from 'date-fns';
  import { flatRollup, max, mean, range, sum } from 'd3-array';

  import { Card } from 'svelte-ux';
  import { Axis, Chart, Circle, Highlight, Points, Svg, Text, Tooltip } from 'layerchart';
  import { format, Duration } from '@layerstack/utils';
  import { promiseStore } from '@layerstack/svelte-stores';
  import { metersToFeet, metersToMiles } from '$lib/utils.js';

  let { data } = $props();
  const streamed = promiseStore(data.streamed.activities);
  $effect(() => {
    streamed.setPromise(data.streamed.activities);
  });

  let activitiesBySportType = $derived($streamed.data?.activitiesBySportType ?? []);

  let chartDataByType = $derived(
    activitiesBySportType.map((d) => {
      const [sportType, { values }] = d;

      const valuesByDayOfWeek = flatRollup(
        values,
        (items) => {
          return {
            count: items.length,
            avgDuration: Math.round(mean(items, (d) => d.moving_time)),
            totalDuration: Math.round(sum(items, (d) => d.moving_time)),
            avgDistance: mean(items, (d) => d.distance),
            totalDistance: sum(items, (d) => d.distance),
            avgElevation: mean(items, (d) => d.total_elevation_gain),
            totalElevation: sum(items, (d) => d.total_elevation_gain)
          };
        },
        (d) => getDay(d.start_date)
      );

      const valuesByDayOfWeekAndHours = flatRollup(
        values,
        (items) => {
          return {
            count: items.length,
            avgDuration: Math.round(mean(items, (d) => d.moving_time)),
            totalDuration: Math.round(sum(items, (d) => d.moving_time)),
            avgDistance: mean(items, (d) => d.distance),
            totalDistance: sum(items, (d) => d.distance),
            avgElevation: mean(items, (d) => d.total_elevation_gain),
            totalElevation: sum(items, (d) => d.total_elevation_gain)
          };
        },
        (d) => getDay(d.start_date),
        (d) => getHours(d.start_date)
      );
      return [sportType, valuesByDayOfWeek, valuesByDayOfWeekAndHours];
    })
  );

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
</script>

<div class="grid gap-4 p-4">
  {#each [...chartDataByType] as [type, valuesByDayOfWeek, valuesByDayOfWeekAndHours]}
    <Card title={type} class="group z-auto">
      <div class="h-[700px]">
        <Chart
          data={valuesByDayOfWeekAndHours}
          x={(d) => d[0]}
          xScale={scaleBand()}
          xDomain={range(7)}
          y={(d) => d[1]}
          yScale={scaleBand()}
          yDomain={range(24)}
          r={(d) => d[2].count}
          padding={{ left: 48 }}
          tooltip={{ mode: 'band' }}
        >
          {#snippet children({ context })}
            {@const minBandwidth = Math.min(context.xScale.bandwidth(), context.yScale.bandwidth())}
            {@const maxValue = max(valuesByDayOfWeekAndHours, (d) => d[2].count as number)}
            {@const rScale = scaleSqrt()
              .domain([0, maxValue])
              .range([0, minBandwidth / 2 - 5])}
            <Svg>
              <Axis
                placement="bottom"
                format={(d) => ''}
                grid={{ style: 'stroke-dasharray: 2' }}
                rule
              />
              <Axis placement="left" format={(d) => d + ':00'} grid />
              <Points>
                {#snippet children({ points })}
                  {#each points as point, index}
                    {@const [dayOfWeek, timeOfDay, { count }] = point.data}
                    <Circle
                      cx={point.x}
                      cy={point.y}
                      r={rScale(count)}
                      class="fill-secondary stroke-secondary-600"
                    />
                    <Text
                      x={point.x}
                      y={point.y}
                      value={count}
                      textAnchor="middle"
                      verticalAnchor="middle"
                      class="stroke-secondary-800 fill-white text-xs stroke-2 transition-all opacity-0 group-hover:opacity-100"
                      capHeight=".6rem"
                    />
                  {/each}
                {/snippet}
              </Points>
              <Highlight area axis="x" />
              <Highlight area axis="y" />
            </Svg>

            <Tooltip.Root class="whitespace-nowrap">
              {@const data = context.tooltip.data}
              {@const [
                dayOfWeek,
                timeOfDay,
                {
                  count,
                  avgDuration,
                  totalDuration,
                  avgDistance,
                  totalDistance,
                  avgElevation,
                  totalElevation
                }
              ] = data}

              <Tooltip.Header>
                {daysOfWeek[data[0]]} @ {data[1]}:00
              </Tooltip.Header>

              <Tooltip.List>
                <Tooltip.Item label="Count" value={count} valueAlign="right" />

                <Tooltip.Separator />
                <Tooltip.Item
                  label="Avg. Duration"
                  value={avgDuration}
                  valueAlign="right"
                  format={(value) => new Duration({ duration: { seconds: value } }).format()}
                />
                <Tooltip.Item
                  label="Total Duration"
                  value={totalDuration}
                  valueAlign="right"
                  format={(value) => new Duration({ duration: { seconds: value } }).format()}
                />

                <Tooltip.Separator />
                <Tooltip.Item
                  label="Avg. Distance"
                  value={avgDistance}
                  valueAlign="right"
                  format={(value) => format(metersToMiles(value), 'decimal') + ' mi'}
                />
                <Tooltip.Item
                  label="Total Distance"
                  value={totalDistance}
                  valueAlign="right"
                  format={(value) => format(metersToMiles(value), 'decimal') + ' mi'}
                />

                <Tooltip.Separator />
                <Tooltip.Item
                  label="Avg. Elevation"
                  value={avgElevation}
                  valueAlign="right"
                  format={(value) => format(metersToFeet(value), 'integer') + ' ft'}
                />
                <Tooltip.Item
                  label="Total Elevation"
                  value={totalElevation}
                  valueAlign="right"
                  format={(value) => format(metersToFeet(value), 'integer') + ' ft'}
                />
              </Tooltip.List>
            </Tooltip.Root>
          {/snippet}
        </Chart>
      </div>

      <div class="h-[80px]">
        <Chart
          data={valuesByDayOfWeek}
          x={(d) => d[0]}
          xScale={scaleBand()}
          xDomain={range(7)}
          y={(d) => 0}
          yScale={scaleBand()}
          c={(d) => d[1].count}
          padding={{ left: 48, bottom: 36 }}
          tooltip={{ mode: 'band' }}
        >
          {#snippet children({ context })}
            {@const minBandwidth = Math.min(context.xScale.bandwidth(), context.yScale.bandwidth())}
            {@const maxValue = max(valuesByDayOfWeek, (d) => d[1].count as number)}
            {@const rScale = scaleSqrt()
              .domain([0, maxValue])
              .range([0, minBandwidth / 2 - 5])}
            <Svg>
              <Axis
                placement="bottom"
                format={(d) => daysOfWeek[d]}
                grid={{ style: 'stroke-dasharray: 2' }}
                rule
              />
              <Points>
                {#snippet children({ points })}
                  {#each points as point, index}
                    {@const [dayOfWeek, { count }] = point.data}
                    <Circle
                      cx={point.x}
                      cy={point.y}
                      r={rScale(count)}
                      class="fill-secondary-500 stroke-secondary-600"
                    />
                    <Text
                      x={point.x}
                      y={point.y}
                      value={count}
                      textAnchor="middle"
                      verticalAnchor="middle"
                      class="stroke-secondary-800 fill-white text-xs stroke-2 transition-all opacity-0 group-hover:opacity-100"
                      capHeight=".6rem"
                    />
                  {/each}
                {/snippet}
              </Points>
              <Highlight area axis="x" />
            </Svg>

            <Tooltip.Root class="whitespace-nowrap">
              {@const data = context.tooltip.data}
              {@const [
                dayOfWeek,
                {
                  count,
                  avgDuration,
                  totalDuration,
                  avgDistance,
                  totalDistance,
                  avgElevation,
                  totalElevation
                }
              ] = data}
              <Tooltip.Header>{daysOfWeek[data[0]]}</Tooltip.Header>
              <Tooltip.List>
                <Tooltip.Item label="Count" value={count} valueAlign="right" />

                <Tooltip.Separator />
                <Tooltip.Item
                  label="Avg. Duration"
                  value={avgDuration}
                  valueAlign="right"
                  format={(value) => new Duration({ duration: { seconds: value } }).format()}
                />
                <Tooltip.Item
                  label="Total Duration"
                  value={totalDuration}
                  valueAlign="right"
                  format={(value) => new Duration({ duration: { seconds: value } }).format()}
                />

                <Tooltip.Separator />
                <Tooltip.Item
                  label="Avg. Distance"
                  value={avgDistance}
                  valueAlign="right"
                  format={(value) => format(metersToMiles(value), 'decimal') + ' mi'}
                />
                <Tooltip.Item
                  label="Total Distance"
                  value={totalDistance}
                  valueAlign="right"
                  format={(value) => format(metersToMiles(value), 'decimal') + ' mi'}
                />

                <Tooltip.Separator />
                <Tooltip.Item
                  label="Avg. Elevation"
                  value={avgElevation}
                  valueAlign="right"
                  format={(value) => format(metersToFeet(value), 'integer') + ' ft'}
                />
                <Tooltip.Item
                  label="Total Elevation"
                  value={totalElevation}
                  valueAlign="right"
                  format={(value) => format(metersToFeet(value), 'integer') + ' ft'}
                />
              </Tooltip.List>
            </Tooltip.Root>
          {/snippet}
        </Chart>
      </div>
    </Card>
  {/each}
</div>
