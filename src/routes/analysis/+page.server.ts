import { redirect } from '@sveltejs/kit';

export async function load({ url }) {
  redirect(302, '/analysis/overview');
}
