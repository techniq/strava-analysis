import { Strava } from '$lib/api.js';

export async function load({ locals, url, setHeaders }) {
  const { accessToken, athlete } = locals;

  const athleteId = Number(url.searchParams.get('athlete')) || athlete;
  const per_page = url.searchParams.get('per_page') ?? 25;
  const page = url.searchParams.get('page') ?? 1;

  const strava = new Strava(accessToken);

  setHeaders({
    'cache-control': `max-age=${60 * 5}` // 5 min
  });

  return {
    streamed: {
      activities: await strava.api('/athlete/activities', { data: { per_page, page } })
    },
    stats: await strava.api(`/athletes/${athleteId}/stats`),
    params: {
      athleteId,
      per_page,
      page
    }
  };
}
