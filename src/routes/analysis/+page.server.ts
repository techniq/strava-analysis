import { redirect } from '@sveltejs/kit';

export async function load({ url }) {
  if (url.pathname === '/analysis') {
    throw redirect(302, '/analysis/overview');
  }
}
