<script lang="ts">
  import { mdiAccount, mdiFlagCheckered, mdiPlay } from '@mdi/js';

  import {
    AppBar,
    Button,
    Card,
    Duration,
    Pagination,
    PeriodType,
    Table,
    TextField,
    dateDisplay,
    format,
    tableCell,
    paginationStore,
    changeStore,
    Icon
  } from 'svelte-ux';
  import { getCellValue, getCellContent } from 'svelte-ux/utils/table';

  import { goto } from '$app/navigation';

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
</script>

<AppBar title="Activities" />

<main>
  <!-- <form class="flex gap-2 bg-white border-b p-4" on:submit|preventDefault={run}>
    <TextField
      label="Athlete"
      bind:value={athleteId}
      icon={mdiAccount}
      dense
      placeholder="Pick an athlete"
      shrinkLabel
      class="flex-1"
    />
    <Button type="submit" icon={mdiPlay} variant="fill" color="blue">Run</Button>
  </form> -->

  <div class="relative min-h-[56px] p-4">
    <Card class="overflow-auto">
      <Table
        data={data.activities}
        columns={[
          // {
          //   name: 'id'
          // },
          {
            name: 'sport_type',
            header: 'Type'
          },
          // {
          //   name: 'workout_type'
          // },
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
            format: (value) => dateDisplay(value, { format: 'M/d/yy' }),
            align: 'right'
          },
          {
            name: 'start_date-time',
            header: 'Time',
            value: (d) => d.start_date,
            format: (value) => dateDisplay(value, { format: 'h:mm a' }),
            align: 'right'
          },
          {
            name: 'distance',
            header: 'Distance',
            format: (value) => format(value / 1609, 'decimal') + 'mi',
            align: 'right',
            dataBackground: {
              color: 'var(--color-blue-100)',
              inset: [1, 2],
              tweened: { duration: 300 }
            }
          },
          {
            name: 'moving_time',
            header: 'Duration',
            dataBackground: {
              color: 'var(--color-blue-100)',
              inset: [1, 2],
              tweened: { duration: 300 }
            }
          },
          {
            name: 'pace',
            header: 'Pace',
            value: (d) => (d.distance ? Math.round(d.moving_time / (d.distance / 1609)) : null),
            dataBackground: {
              color: 'var(--color-blue-100)',
              inset: [1, 2],
              tweened: { duration: 300 }
            }
          },
          // {
          //   name: 'elapsed_time'
          // },
          // {
          //   name: 'total_elevation_gain'
          // },

          // {
          //   name: 'start_latlng'
          // },
          // {
          //   name: 'end_latlng'
          // },

          // {
          //   name: 'average_speed'
          // },
          // {
          //   name: 'average_cadence'
          // },
          {
            name: 'Heartrate',
            align: 'center',
            columns: [
              {
                name: 'average_heartrate',
                header: 'Avg',
                format: (value) => (value ? `${value} bpm` : ''),
                align: 'right',
                class: {
                  data: 'w-[100px]'
                },
                dataBackground: {
                  color: 'var(--color-red-100)',
                  inset: [1, 2],
                  tweened: { duration: 300 },
                  domain: [120, 160]
                }
              },
              {
                name: 'max_heartrate',
                header: 'Max',
                format: (value) => (value ? `${value} bpm` : ''),
                align: 'right',
                class: {
                  data: 'w-[100px]'
                },
                dataBackground: {
                  color: 'var(--color-red-100)',
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
              color: 'var(--color-orange-100)',
              inset: [1, 2],
              tweened: { duration: 300 }
            }
          }
        ]}
        classes={{
          th: 'px-2 bg-orange-100 border-b border-r border-orange-200 text-orange-800 text-sm',
          td: 'px-2 whitespace-nowrap tabular-nums'
        }}
      >
        <tbody slot="data" let:columns let:data>
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
