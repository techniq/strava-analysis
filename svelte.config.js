import preprocess from 'svelte-preprocess';
import cloudflare from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: preprocess(),

  kit: {
    adapter: cloudflare()
  }
};

export default config;
