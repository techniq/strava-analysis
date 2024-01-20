import { redirect } from '@sveltejs/kit';

export async function GET({ cookies }) {
  cookies.delete('user', { path: '/' });
  cookies.delete('accessToken', { path: '/' });

  redirect(302, '/');
}
