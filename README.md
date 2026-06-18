# DevNetAuto

A fast, static blog for production network-automation war stories.
Built with [Astro](https://astro.build). Deploys to Cloudflare Pages.

## First: edit these

1. **`src/site.ts`** — set your real LinkedIn + GitHub URLs, confirm name and
   prompt handle. This is the single source of truth for site-wide details.
2. **`astro.config.mjs`** — confirm `site: 'https://devnetauto.com'`.
3. **`public/robots.txt`** — confirm the sitemap URL matches your domain.

## Run it locally

```bash
npm install      # first time only
npm run dev      # http://localhost:4321
npm run build    # production build into dist/
npm run preview  # serve the built site locally
```

You need Node 22+.

## Write a post

Drop a Markdown (or `.mdx`) file in `src/content/posts/`. The filename becomes
the URL slug. Frontmatter:

```markdown
---
title: "The list insert that reversed every RADIUS method list"
description: "One sentence that makes someone want to read it."
pubDate: 2026-06-16
tags: ["python", "radius", "war-story"]
draft: false              # true = hidden from build and lists
canonicalUrl: ""          # optional: set if syndicated elsewhere first
---

Your post in Markdown. Fenced code blocks get syntax highlighting.
```

That's the whole workflow. Commit, push, it deploys.

## Deploy to Cloudflare Pages

You already own `devnetauto.com` in Cloudflare, so this is the clean path:

1. Push this folder to a new GitHub repo (e.g. `devnetauto`).
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git** → pick the repo.
3. Build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Deploy. You'll get a `*.pages.dev` URL to confirm it works.
5. In the Pages project → **Custom domains** → add `devnetauto.com` (and
   `www`). Because the domain is already in your Cloudflare account, the DNS
   records are created for you automatically.

Every `git push` to the main branch now publishes. Drafts (`draft: true`) stay
out of the build.

## The LinkedIn workflow (don't skip this)

LinkedIn throttles posts that link off-platform. So:

- Paste the **full post** natively into LinkedIn — the whole war story, in the
  post body, no link.
- Put the **link to the devnetauto.com version** in the **first comment**
  ("Full write-up with code + diagrams: …").
- The blog is your durable, searchable archive and portfolio. LinkedIn is the
  distribution. Same content, two surfaces.

## What's included as samples

- `hello-devnetauto.md` — a short framing post.
- `insert-negative-one-radius-ordering.md` — a full war story written to be
  IP-safe (patterns and lessons, no employer specifics). Edit or replace freely;
  it's there to show the format and the bar.
