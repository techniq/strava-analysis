import { Strava } from '$lib/api.js';

export async function load({ parent, url }) {
  const { accessToken, athlete } = await parent();

  const athleteId = Number(url.searchParams.get('athlete')) || athlete.id;
  const per_page = url.searchParams.get('per_page') ?? 25;
  const page = url.searchParams.get('page') ?? 1;

  const strava = new Strava(accessToken);

  return {
    activities: strava.api('/athlete/activities', { data: { per_page, page } }),
    stats: strava.api(`/athletes/${athleteId}/stats`),
    params: {
      athleteId,
      per_page,
      page
    }
  };
}
