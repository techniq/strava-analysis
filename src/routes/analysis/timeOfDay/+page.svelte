<script lang="ts">
  import { scaleBand, scaleSqrt } from 'd3-scale';
  import { getDay, getHours } from 'date-fns';
  import { flatRollup, max, mean, range, sum } from 'd3-array';

  import { Card, format, humanizeDuration, promiseStore } from 'svelte-ux';
  import {
    Axis,
    Bars,
    Chart,
    Circle,
    Highlight,
    Points,
    Svg,
    Text,
    Tooltip,
    TooltipItem,
    TooltipSeparator
  } from 'layerchart';
  import { metersToFeet, metersToMiles } from '$lib/utils.js';

  export let data;
  const streamed = promiseStore(data.streamed.activities);
  $: streamed.setPromise(data.streamed.activities);

  $: activitiesBySportType = $streamed.data?.activitiesBySportType ?? [];

  $: chartDataByType = activitiesBySportType.map((d) => {
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
  });

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
          let:xScale
          let:yScale
        >
          {@const minBandwidth = Math.min(xScale.bandwidth(), yScale.bandwidth())}
          {@const maxValue = max(valuesByDayOfWeekAndHours, (d) => d[2].count)}
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
            <Points let:points>
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
            </Points>
            <Highlight area axis="x" />
            <Highlight area axis="y" />
          </Svg>

          <Tooltip
            class="whitespace-nowrap"
            header={(d) => `${daysOfWeek[d[0]]} @ ${d[1]}:00`}
            let:data
          >
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
            <TooltipItem label="Count" value={count} valueAlign="right" />

            <TooltipSeparator />
            <TooltipItem
              label="Avg. Duration"
              value={avgDuration}
              valueAlign="right"
              format={(value) => humanizeDuration({ duration: { seconds: value } })}
            />
            <TooltipItem
              label="Total Duration"
              value={totalDuration}
              valueAlign="right"
              format={(value) => humanizeDuration({ duration: { seconds: value } })}
            />

            <TooltipSeparator />
            <TooltipItem
              label="Avg. Distance"
              value={avgDistance}
              valueAlign="right"
              format={(value) => format(metersToMiles(value), 'decimal') + ' mi'}
            />
            <TooltipItem
              label="Total Distance"
              value={totalDistance}
              valueAlign="right"
              format={(value) => format(metersToMiles(value), 'decimal') + ' mi'}
            />

            <TooltipSeparator />
            <TooltipItem
              label="Avg. Elevation"
              value={avgElevation}
              valueAlign="right"
              format={(value) => format(metersToFeet(value), 'integer') + ' ft'}
            />
            <TooltipItem
              label="Total Elevation"
              value={totalElevation}
              valueAlign="right"
              format={(value) => format(metersToFeet(value), 'integer') + ' ft'}
            />
          </Tooltip>
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
          r={(d) => d[1].count}
          padding={{ left: 48, bottom: 36 }}
          tooltip={{ mode: 'band' }}
          let:xScale
          let:yScale
        >
          {@const minBandwidth = Math.min(xScale.bandwidth(), yScale.bandwidth())}
          {@const maxValue = max(valuesByDayOfWeek, (d) => d[1].count)}
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
            <Axis placement="left" format={(d) => ''} tickSize={0} />
            <Points let:points>
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
            </Points>
            <Highlight area axis="x" />
            <Highlight area axis="y" />
          </Svg>

          <Tooltip class="whitespace-nowrap" header={(d) => daysOfWeek[d[0]]} let:data>
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
            <TooltipItem label="Count" value={count} valueAlign="right" />

            <TooltipSeparator />
            <TooltipItem
              label="Avg. Duration"
              value={avgDuration}
              valueAlign="right"
              format={(value) => humanizeDuration({ duration: { seconds: value } })}
            />
            <TooltipItem
              label="Total Duration"
              value={totalDuration}
              valueAlign="right"
              format={(value) => humanizeDuration({ duration: { seconds: value } })}
            />

            <TooltipSeparator />
            <TooltipItem
              label="Avg. Distance"
              value={avgDistance}
              valueAlign="right"
              format={(value) => format(metersToMiles(value), 'decimal') + ' mi'}
            />
            <TooltipItem
              label="Total Distance"
              value={totalDistance}
              valueAlign="right"
              format={(value) => format(metersToMiles(value), 'decimal') + ' mi'}
            />

            <TooltipSeparator />
            <TooltipItem
              label="Avg. Elevation"
              value={avgElevation}
              valueAlign="right"
              format={(value) => format(metersToFeet(value), 'integer') + ' ft'}
            />
            <TooltipItem
              label="Total Elevation"
              value={totalElevation}
              valueAlign="right"
              format={(value) => format(metersToFeet(value), 'integer') + ' ft'}
            />
          </Tooltip>
        </Chart>
      </div>
    </Card>
  {/each}
</div>
