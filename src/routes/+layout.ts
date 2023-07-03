import { Strava } from '$lib/api';

export const ssr = false;

export async function load({ data }) {
  return {
    ...data,
    athlete: data.accessToken ? fetchAthlete(data.accessToken) : null
  };
}

async function fetchAthlete(accessToken: string) {
  const strava = new Strava(accessToken);
  const athlete = await strava.api('/athlete');
  return athlete;
}
