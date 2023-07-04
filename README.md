# strava-analysis

## Environment

- Create [Strava app](https://www.strava.com/settings/api)
  - Set `Authorization Callback Domain` to `{BASE_URL}` (without protocol)
  - Capture `Client ID` and `Client secret` to be used next step
- Local development
  - Create `.env` file in root of project with the following keys:
    - `BASE_URL` (ex. `http://localhost:3000`)
    - `GITHUB_CLIENT_ID` (see above)
    - `GITHUB_CLIENT_SECRET` (see above)
- Vercel
  - Add to `Environment Variables` via interface
    - `BASE_URL` (ex. `https://strava.techniq.dev`)
    - `GITHUB_CLIENT_ID` (see above)
    - `GITHUB_CLIENT_SECRET` (see above)
