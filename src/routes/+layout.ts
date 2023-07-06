import { Strava } from '$lib/api';
import { redirect } from '@sveltejs/kit';

export const ssr = false;

export async function load({ data }) {
  let athlete: any = null;
  if (data.accessToken) {
    const strava = new Strava(data.accessToken);
    athlete = await strava.api('/athlete');
    if (athlete.errors) {
      const [error] = athlete.errors;
      if (error.field === 'access_token' && error.code === 'invalid') {
        throw redirect(302, '/auth/login');
      }
    }
  }

  return {
    ...data,
    athlete
  };
}
