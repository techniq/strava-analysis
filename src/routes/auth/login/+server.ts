import { redirect } from '@sveltejs/kit';
import { BASE_URL, STRAVA_CLIENT_ID } from '$env/static/private';

// https://developers.strava.com/docs/authentication/

export function GET() {
  const params = new URLSearchParams();
  params.append('client_id', STRAVA_CLIENT_ID);
  params.append('response_type', 'code');
  params.append('redirect_uri', `${BASE_URL}/auth/callback`);
  params.append('approval_prompt', 'auto');
  params.append('scope', 'read_all,profile:read_all,activity:read_all');

  throw redirect(302, `https://www.strava.com/oauth/authorize?${params}`);
}
