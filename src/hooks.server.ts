export async function handle({ event, resolve }) {
  // Before each endpoint or page, read cookies into request.locals to access in +layout.server.ts / +layout.svelte
  event.locals.user = event.cookies.get('user');
  event.locals.accessToken = event.cookies.get('accessToken');

  const response = await resolve(event);

  return response;
}
