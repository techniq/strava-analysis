<script lang="ts">
  import { mdiAccount, mdiPlay } from '@mdi/js';

  import {
    AppBar,
    Button,
    Card,
    Duration,
    PeriodType,
    Table,
    TextField,
    dateDisplay,
    format,
    tableCell
  } from 'svelte-ux';
  import { getCellValue, getCellContent } from 'svelte-ux/utils/table';

  import { goto } from '$app/navigation';

  export let data;

  let athlete = data.variables.athlete;

  function run() {
    const params = new URLSearchParams();
    params.set('athlete', athlete);
    goto(`?${params}`);
  }
</script>

<AppBar title="Activities" />

<main>
  <form class="flex gap-2 bg-white border-b p-4" on:submit|preventDefault={run}>
    <TextField
      label="Athlete"
      bind:value={athlete}
      icon={mdiAccount}
      dense
      placeholder="Pick an athlete"
      shrinkLabel
      class="flex-1"
    />
    <Button type="submit" icon={mdiPlay} variant="fill" color="blue">Run</Button>
  </form>

  <div class="relative min-h-[56px] p-4">
    <Card class="px-3">
      <Table
        data={data.activities}
        columns={[
          // {
          //   name: 'id'
          // },
          // {
          //   name: 'type'
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
            header: 'Name'
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
                format: (value) => `${value} bpm`,
                align: 'right',
                class: {
                  data: 'w-[100px]'
                },
                dataBackground: {
                  color: 'var(--color-red-100)',
                  inset: [1, 2],
                  tweened: { duration: 300 }
                }
              },
              {
                name: 'max_heartrate',
                header: 'Max',
                format: (value) => `${value} bpm`,
                align: 'right',
                class: {
                  data: 'w-[100px]'
                },
                dataBackground: {
                  color: 'var(--color-red-100)',
                  inset: [1, 2],
                  tweened: { duration: 300 }
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
          th: 'px-2',
          td: 'px-2'
        }}
      >
        <tbody slot="data" let:columns let:data>
          {#each data ?? [] as rowData, rowIndex}
            <tr>
              {#each columns as column (column.name)}
                {@const value = getCellValue(column, rowData, rowIndex)}
                {@const content = getCellContent(column, rowData, rowIndex)}

                {#if column.name === 'moving_time' || column.name === 'elapsed_time'}
                  <td use:tableCell={{ column, rowData, rowIndex, tableData: data }}>
                    <Duration duration={{ seconds: value }} />
                  </td>
                {:else}
                  <td use:tableCell={{ column, rowData, rowIndex, tableData: data }}>
                    {content}
                  </td>
                {/if}
              {/each}
            </tr>
          {/each}
        </tbody>
      </Table>
    </Card>
  </div>
</main>
