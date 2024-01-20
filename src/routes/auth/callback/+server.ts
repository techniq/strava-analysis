import { redirect } from '@sveltejs/kit';
import type { CookieSerializeOptions } from 'cookie';

import { BASE_URL, STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET } from '$env/static/private';

// https://developers.strava.com/docs/authentication

export async function GET({ url, locals, cookies }) {
  const code = url.searchParams.get('code');
  const { access_token, athlete } = await getAccessToken(code);

  // Set on request locals to be read in `handle` hook
  locals.accessToken = access_token;
  locals.athlete = athlete.id;

  const cookieOptions = {
    path: '/',
    httpOnly: true,
    secure: BASE_URL.startsWith('https://')
  } as CookieSerializeOptions;

  cookies.set('athlete', athlete.id || '', cookieOptions);
  cookies.set('accessToken', access_token || '', cookieOptions);

  redirect(302, '/');
}

/**
 * Get accessToken from authorize code
 */
async function getAccessToken(code: string) {
  const response = await fetch(`https://www.strava.com/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code'
    })
  });
  const { token_type, expires_at, expires_in, refresh_token, access_token, athlete } =
    await response.json();
  return { access_token, athlete };
}
