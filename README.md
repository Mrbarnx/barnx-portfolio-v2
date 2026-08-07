# Barnx Portfolio V2

Production portfolio for Barnabas Mikel.

This repository deploys a real **Next.js App Router** application using TypeScript, Tailwind CSS, Framer Motion, GSAP/ScrollTrigger, Lenis, Lucide icons and Zod.

## Experiences

- Home — premium hero, floating technology cards, scroll-story About section, experience and featured work
- Projects — full project library and dynamic `/projects/[slug]` case studies
- Barnx Studio — resources, downloads, workflow/templates and dynamic resource details
- Résumé — downloadable PDF from `/resume`

## Source payload

The generated application source and optimized assets are stored in `.barnx-v2/chunk-*.txt`. `bootstrap.mjs` expands the source automatically before install/build. This keeps the deployment commit compact while still producing the full Next.js project in the build workspace.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

Import this repository into Vercel. Framework preset: **Next.js**. No environment variables are required in this phase.

## Future phase

PostgreSQL, Prisma, authentication, admin CMS, newsletter backend, analytics and AI-assisted publishing are intentionally deferred.
