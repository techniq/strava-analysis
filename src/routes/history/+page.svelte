<script lang="ts">
  import { cumsum, extent, flatRollup, group, rollup, zip } from 'd3-array';
  import { scaleBand, scaleTime } from 'd3-scale';
  import { format } from 'date-fns';

  import { AppBar, Card, PeriodType, ToggleGroup, ToggleOption, formatDate } from 'svelte-ux';
  import { createPropertySortFunc } from 'svelte-ux/utils/sort';
  import {
    Area,
    Axis,
    Bars,
    Chart,
    HighlightLine,
    Points,
    Svg,
    Tooltip,
    TooltipItem
  } from 'layerchart';

  export let data;

  let selectedTab = 'overview';

  $: activities = data.activities.sort(createPropertySortFunc('start_date'));
  $: startDateExtent = extent(activities, (d) => d.start_date);

  const sportTypeOrder = ['Run', 'Ride', 'VirtualRide', 'Walk', 'Workout'];

  function addTotalDistance(values: any[]) {
    return zip(
      values,
      cumsum(values, (d) => d.distance)
    ).map(([v1, v2]) => {
      return {
        ...v1,
        totalDistance: v2
      };
    });
  }

  $: activitiesBySportType = flatRollup(
    activities,
    (values) => {
      // Add cumulutive distance `totalDistance`
      return {
        values: addTotalDistance(values),
        valuesByYear: flatRollup(
          values,
          (yearlyValues) => {
            return {
              values: addTotalDistance(yearlyValues)
            };
          },
          (d) => d.start_date.getYear()
        )
      };
    },
    (d) => d.sport_type
  ).sort(createPropertySortFunc((d) => sportTypeOrder.indexOf(d[0])));
</script>

<AppBar title="Activities" />

<main>
  <div class="bg-white">
    <ToggleGroup
      bind:value={selectedTab}
      variant="underlined"
      classes={{ root: 'px-4', option: 'px-4' }}
    >
      <ToggleOption value="overview">Overview</ToggleOption>
      <ToggleOption value="cumulative">Cumulative</ToggleOption>
      <ToggleOption value="yearly">Yearly</ToggleOption>
    </ToggleGroup>
  </div>

  <div class="grid gap-4 p-4">
    {#each [...activitiesBySportType] as [type, data]}
      <Card title={type} class="h-[300px]">
        {#if selectedTab === 'yearly'}
          <Chart
            data={data.valuesByYear.flatMap((d) => d[1].values)}
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
              <Axis placement="left" grid rule format="metric" />
              <Axis placement="bottom" rule />
              {#each data.valuesByYear as [year, yearData]}
                <Area data={yearData.values} line={{ width: 2 }} tweened />
              {/each}
              <HighlightLine color="var(--color-blue-500)" />
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
        {:else}
          <Chart
            data={data.values}
            x="start_date"
            xScale={scaleTime()}
            _xScale={scaleBand().padding(0.4)}
            xDomain={startDateExtent}
            y={(d) => (selectedTab === 'overview' ? d.distance : d.totalDistance) / 1609}
            yDomain={[0, null]}
            yNice
            padding={{ left: 32, bottom: 24, right: 16 }}
            tooltip={{ mode: 'bisect-x', snapToDataX: true, snapToDataY: true }}
          >
            <Svg>
              <Axis placement="left" grid rule format="metric" />
              <Axis placement="bottom" rule />
              {console.log({ data })}
              <Area line={{ width: 2 }} tweened />
              <!-- <Bars /> -->
              <!-- <Points /> -->
              <HighlightLine color="var(--color-blue-500)" />
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
        {/if}
      </Card>
    {/each}
  </div>
</main>
