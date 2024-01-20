import posthog from 'posthog-js';
import { redirect } from '@sveltejs/kit';

import { browser, dev } from '$app/environment';
import { Strava } from '$lib/api';

export const ssr = false;

export async function load({ data }) {
  // Setup Posthog
  if (browser && !dev) {
    posthog.init('phc_2DlGpLLUesUDo4WL3HtGQoGkS49m3fOVjThufrAP2pV', {
      api_host: 'https://app.posthog.com',
      capture_pageview: false,
      capture_pageleave: false
    });
  }

  let athlete: any = null;
  if (data.accessToken) {
    const strava = new Strava(data.accessToken);
    athlete = await strava.api('/athlete');
    if (athlete.errors) {
      const [error] = athlete.errors;
      if (error.field === 'access_token' && error.code === 'invalid') {
        redirect(302, '/auth/login');
      }
    }
  }

  return {
    ...data,
    athlete
  };
}
