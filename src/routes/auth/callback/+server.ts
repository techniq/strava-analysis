import { redirect } from '@sveltejs/kit';
import type { CookieSerializeOptions } from 'cookie';

import { baseUrl, clientId, clientSecret } from '../_config';

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
    secure: baseUrl.startsWith('https://')
  } as CookieSerializeOptions;

  cookies.set('athlete', athlete.id || '', cookieOptions);
  cookies.set('accessToken', access_token || '', cookieOptions);

  throw redirect(302, '/');
}

/**
 * Get accessToken from authorize code
 */
async function getAccessToken(code: string) {
  const response = await fetch(`https://www.strava.com/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code'
    })
  });
  const { token_type, expires_at, expires_in, refresh_token, access_token, athlete } =
    await response.json();
  return { access_token, athlete };
}
