import adapter from '@sveltejs/adapter-cloudflare'; //
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		// Replace adapter-auto with adapter-cloudflare
		adapter: adapter()
	}
};

export default config;