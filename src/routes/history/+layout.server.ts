import { cumsum, extent, flatRollup, zip, range } from 'd3-array';
import { createPropertySortFunc } from 'svelte-ux/utils/sort';

import { Strava } from '$lib/api.js';
import { redirect } from '@sveltejs/kit';

export async function load({ parent, setHeaders, url }) {
  if (url.pathname === '/history') {
    throw redirect(302, '/history/overview');
  }

  const { accessToken, athlete } = await parent();

  const strava = new Strava(accessToken);

  // Determine how many total pages of activities to fetch
  const stats = await strava.api(`/athletes/${athlete}/stats`);
  const totalActivities =
    stats.all_run_totals.count + stats.all_ride_totals.count + stats.all_swim_totals.count;
  const per_page = 200; // Strava limit
  const totalPages = Math.ceil(totalActivities / per_page);

  const activitiesResults = await Promise.allSettled(
    range(totalPages).map((x) =>
      strava.api('/athlete/activities', { data: { page: x + 1, per_page } })
    )
  );
  const activities = await activitiesResults
    .flatMap((r) => r.value)
    .sort(createPropertySortFunc('start_date'));

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
          (d) => d.start_date.getYear()
        )
      };
    },
    (d) => d.sport_type
  ).sort(createPropertySortFunc((d) => sportTypeOrder.indexOf(d[0])));

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

  setHeaders({
    'cache-control': `max-age=${60 * 5}` // 5 min
  });

  return {
    activities,
    activitiesBySportType,
    startDateExtent
  };
}
