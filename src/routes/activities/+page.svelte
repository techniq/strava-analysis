<script lang="ts">
  import { mdiFlagCheckered } from '@mdi/js';

  import {
    Card,
    Duration,
    Pagination,
    Table,
    format,
    tableCell,
    paginationStore,
    changeStore,
    Icon,
    promiseStore,
    PeriodType
  } from 'svelte-ux';

  import { goto } from '$app/navigation';
  import { metersToFeet, metersToMiles } from '$lib/utils.js';

  export let data;

  let athleteId = data.params.athleteId;

  const pagination = paginationStore({
    total:
      data.stats.all_run_totals.count +
      data.stats.all_ride_totals.count +
      data.stats.all_swim_totals.count,
    page: Number(data.params.page),
    perPage: Number(data.params.per_page)
  });

  function run() {
    const params = new URLSearchParams();
    // params.set('athlete', athleteId);
    params.set('page', $pagination.page.toString());
    params.set('per_page', $pagination.perPage.toString());
    goto(`?${params}`);
  }

  const paginationChange = changeStore(pagination, run);
  $paginationChange; // must subscribe to fire change events

  const streamed = promiseStore(data.streamed.activities);
  $: streamed.setPromise(data.streamed.activities);
</script>

<main>
  <!-- <form class="flex gap-2 bg-white border-b p-4" on:submit|preventDefault={run}>
    <TextField
      label="Athlete"
      bind:value={athleteId}
      icon={mdiAccount}
      dense
      placeholder="Pick an athlete"
      class="flex-1"
    />
    <Button type="submit" icon={mdiPlay} variant="fill" color="blue">Run</Button>
  </form> -->

  <div class="relative min-h-[56px] p-4">
    <Card class="overflow-auto" loading={$streamed.loading}>
      <Table
        data={$streamed.data ?? []}
        columns={[
          {
            name: 'sport_type',
            header: 'Type',
            class: {
              data: 'w-[80px]'
            }
          },
          {
            name: 'name',
            header: 'Name',
            format: (value, rowData) => {
              return `<a href="https://www.strava.com/activities/${rowData.id}" target="_blank" class="underline">${value}</a>`;
            },
            html: true
          },
          {
            name: 'start_date',
            header: 'Date',
            format: (value) => format(value, PeriodType.Day),
            align: 'right',
            class: {
              data: 'w-[100px]'
            }
          },
          {
            name: 'start_date-time',
            header: 'Time',
            value: (d) => d.start_date,
            format: (value) => format(value, PeriodType.TimeOnly),
            align: 'right',
            class: {
              data: 'w-[100px]'
            }
          },
          {
            name: 'distance',
            header: 'Distance',
            format: (value) => format(metersToMiles(value), 'decimal') + ' mi',
            align: 'right',
            dataBackground: {
              color: 'hsl(var(--color-secondary) / 10%)',
              inset: [1, 2],
              tweened: { duration: 300 }
            }
          },
          {
            name: 'total_elevation_gain',
            header: 'Elevation',
            format: (value) => format(metersToFeet(value), 'integer') + ' ft',
            align: 'right',
            dataBackground: {
              color: 'hsl(var(--color-secondary) / 10%)',
              inset: [1, 2],
              tweened: { duration: 300 }
            }
          },
          {
            name: 'moving_time',
            header: 'Duration',
            dataBackground: {
              color: 'hsl(var(--color-secondary) / 10%)',
              inset: [1, 2],
              tweened: { duration: 300 }
            }
          },
          {
            name: 'pace',
            header: 'Pace',
            value: (d) =>
              d.distance ? Math.round(d.moving_time / metersToMiles(d.distance)) : null,
            dataBackground: {
              color: 'hsl(var(--color-secondary) / 10%)',
              inset: [1, 2],
              tweened: { duration: 300 }
            }
          },

          // {
          //   name: 'average_speed'
          // },
          // {
          //   name: 'average_cadence'
          // },
          // {
          //   name: 'start_latlng'
          // },
          // {
          //   name: 'end_latlng'
          // },

          {
            name: 'Heartrate',
            align: 'center',
            columns: [
              {
                name: 'average_heartrate',
                header: 'Avg',
                format: (value) => (value ? `${value} bpm` : ''),
                class: {
                  data: 'w-[100px]'
                },
                dataBackground: {
                  color: 'hsl(var(--color-danger) / 10%)',
                  inset: [1, 2],
                  tweened: { duration: 300 },
                  domain: [120, 160]
                }
              },
              {
                name: 'max_heartrate',
                header: 'Max',
                format: (value) => (value ? `${value} bpm` : ''),
                class: {
                  data: 'w-[100px]'
                },
                dataBackground: {
                  color: 'hsl(var(--color-danger) / 10%)',
                  inset: [1, 2],
                  tweened: { duration: 300 },
                  domain: [150, 180]
                }
              }
            ]
          },
          {
            name: 'kudos_count',
            header: 'Kudos',
            align: 'right',
            dataBackground: {
              color: 'hsl(var(--color-primary) / 10%)',
              inset: [1, 2],
              tweened: { duration: 300 }
            }
          }
        ]}
        classes={{
          th: 'px-2 bg-primary/10 border-b border-r border-primary/20 text-primary-800 text-sm',
          td: 'px-2 whitespace-nowrap tabular-nums'
        }}
      >
        <tbody slot="data" let:columns let:data let:getCellValue let:getCellContent>
          {#each data ?? [] as rowData, rowIndex}
            <tr>
              {#each columns as column (column.name)}
                {@const value = getCellValue(column, rowData, rowIndex)}
                {@const content = getCellContent(column, rowData, rowIndex)}

                {#if column.name === 'moving_time' || column.name === 'elapsed_time' || column.name === 'pace'}
                  <td use:tableCell={{ column, rowData, rowIndex, tableData: data }}>
                    {#if value}
                      <Duration duration={{ seconds: value }} />
                    {/if}
                  </td>
                {:else if column.name === 'sport_type'}
                  <td use:tableCell={{ column, rowData, rowIndex, tableData: data }}>
                    {@html content}
                    {#if rowData.workout_type === 1}
                      <Icon data={mdiFlagCheckered} />
                    {/if}
                  </td>
                {:else}
                  <td use:tableCell={{ column, rowData, rowIndex, tableData: data }}>
                    {@html content}
                  </td>
                {/if}
              {/each}
            </tr>
          {/each}
        </tbody>
      </Table>
      <Pagination
        {pagination}
        perPageOptions={[10, 25, 100, 200]}
        show={['perPage', 'pagination', 'prevPage', 'nextPage']}
        classes={{ root: 'border-t py-1 mt-2', perPage: 'flex-1 text-right', pagination: 'px-8' }}
      />
    </Card>
  </div>
</main>
