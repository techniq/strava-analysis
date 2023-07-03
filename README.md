# strava-analysis

## Environment

- Create [Strava app](https://www.strava.com/settings/api)
  - Set `Authorization Callback Domain` to `{VITE_BASE_URL}`
  - Capture `Client ID` and `Client secret` to be used next step
- Local development
  - Create `.env` file in root of project with the following keys:
    - `VITE_BASE_URL` (ex. `http://localhost:3000`)
    - `VITE_GITHUB_CLIENT_ID` (see above)
    - `VITE_GITHUB_CLIENT_SECRET` (see above)
- Vercel
  - Add to `Environment Variables` via interface
    - `VITE_BASE_URL` (ex. `https://commit-analyzer.vercel.app`)
    - `VITE_GITHUB_CLIENT_ID` (see above)
    - `VITE_GITHUB_CLIENT_SECRET` (see above)
