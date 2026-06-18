// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { remarkReadingTime } from './src/lib/reading-time.mjs';

// IMPORTANT: set `site` to your real domain before deploying.
export default defineConfig({
  site: 'https://devnetauto.com',
  integrations: [mdx(), sitemap()],
  markdown: {
    remarkPlugins: [remarkReadingTime],
    shikiConfig: {
      // Theme used for fenced code blocks in posts.
      theme: 'github-dark-dimmed',
      wrap: false,
    },
  },
});
