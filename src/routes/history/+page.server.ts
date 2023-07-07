import { redirect } from '@sveltejs/kit';

export async function load({ url }) {
  if (url.pathname === '/history') {
    throw redirect(302, '/history/overview');
  }
}
