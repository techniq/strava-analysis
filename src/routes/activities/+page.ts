import { Strava } from '$lib/api.js';

export async function load({ parent, url }) {
  const { accessToken } = await parent();

  const athlete = url.searchParams.get('athlete') ?? 'techniq';

  const variables = { athlete };

  return {
    activities: fetchActivities(accessToken, variables),
    variables
  };
}

async function fetchActivities(accessToken: string, variables: { athlete: string }) {
  const strava = new Strava(accessToken);
  // return strava.api('/athlete/activities', { data: { per_page: 200 } });
  return strava.api('/athlete/activities', { data: { per_page: 50 } });
}
