import { redirect } from '@sveltejs/kit';
import { baseUrl, clientId } from '../_config';

// https://developers.strava.com/docs/authentication/

export function GET() {
  const params = new URLSearchParams();
  params.append('client_id', clientId);
  params.append('response_type', 'code');
  params.append('redirect_uri', `${baseUrl}/auth/callback`);
  params.append('approval_prompt', 'auto');
  params.append('scope', 'read_all,profile:read_all,activity:read_all');

  throw redirect(302, `https://www.strava.com/oauth/authorize?${params}`);
}
