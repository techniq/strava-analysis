import { parse } from 'svelte-ux';

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
};

// https://developers.strava.com/
export class Strava {
  accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async api<Data = any>(resource: string, options?: ApiOptions) {
    let url = `https://www.strava.com/api/v3${resource}`;
    const method = options?.method ?? 'GET';

    if (method === 'GET' && options?.data) {
      url += `?${new URLSearchParams(options.data)}`;
    }

    return fetch(url, {
      method: options?.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`
      },
      ...(method === 'POST' &&
        options?.data && {
          body: JSON.stringify(options.data)
        })
    }).then(async (response) => {
      const text = await response.text();
      return parse<Data>(text);
    });
  }
}
