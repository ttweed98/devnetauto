import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    // Set draft: true to keep a post out of the build / lists.
    draft: z.boolean().default(false),
    // Optional: where the syndicated copy lives, e.g. a LinkedIn post URL.
    canonicalUrl: z.string().url().optional(),
  }),
});

export const collections = { posts };
