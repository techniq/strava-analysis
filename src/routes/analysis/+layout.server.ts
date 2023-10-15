import { cumsum, extent, flatRollup, zip, range } from 'd3-array';
import { sortFunc } from 'svelte-ux';

import { Strava } from '$lib/api.js';

export async function load({ locals, setHeaders }) {
  const { accessToken, athlete } = locals;

  const strava = new Strava(accessToken);

  // Determine how many total pages of activities to fetch
  const stats = await strava.api(`/athletes/${athlete}/stats`);
  const totalActivities =
    stats.all_run_totals.count + stats.all_ride_totals.count + stats.all_swim_totals.count;
  const per_page = 200; // Strava limit
  const totalPages = Math.ceil(totalActivities / per_page);

  async function getActivities() {
    const activitiesResults = await Promise.allSettled(
      range(totalPages).map((x) =>
        strava.api('/athlete/activities', { data: { page: x + 1, per_page } })
      )
    );
    const activities = await activitiesResults.flatMap((r) => r.value).sort(sortFunc('start_date'));

    const startDateExtent = extent(activities, (d) => d.start_date);

    const sportTypeOrder = ['Run', 'Ride', 'VirtualRide', 'Walk', 'Workout'];
    const activitiesBySportType = flatRollup(
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
            (d) => d.start_date.getFullYear()
          )
        };
      },
      (d) => d.sport_type
    ).sort(sortFunc((d) => sportTypeOrder.indexOf(d[0])));

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

    return {
      activities,
      activitiesBySportType,
      startDateExtent
    };
  }

  setHeaders({
    'cache-control': `max-age=${60 * 5}` // 5 min
  });

  return {
    totalActivities,
    totalPages,
    streamed: {
      activities: getActivities()
    }
  };
}
