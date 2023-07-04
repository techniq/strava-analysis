export async function load({ locals }) {
  return {
    accessToken: locals.accessToken,
    athlete: locals.athlete
  };
}
