import { range } from 'd3-array';
import { Strava } from '$lib/api.js';

export async function load({ parent, url, setHeaders }) {
  const { accessToken, athlete } = await parent();

  const athleteId = Number(url.searchParams.get('athlete')) || athlete;

  const strava = new Strava(accessToken);

  // Determine how many total pages of activities to fetch
  const stats = await strava.api(`/athletes/${athleteId}/stats`);
  const totalActivities =
    stats.all_run_totals.count + stats.all_ride_totals.count + stats.all_swim_totals.count;
  const per_page = 200; // Strava limit
  const totalPages = Math.ceil(totalActivities / per_page);

  setHeaders({
    'cache-control': `max-age=${60 * 5}` // 5 min
  });

  return {
    activities: Promise.allSettled(
      range(totalPages).map((x) =>
        strava.api('/athlete/activities', { data: { page: x + 1, per_page } })
      )
    ).then((results) => results.flatMap((r) => r.value))
  };
}
