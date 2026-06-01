# Website Starter Kit

Opinionated scaffold for award-caliber, animation-heavy **Next.js landing pages**.
Follow the binding rules in [`CLAUDE.md`](./CLAUDE.md); the full launch checklist
lives in [`docs/website-scaffolding-checklist.md`](./docs/website-scaffolding-checklist.md).

## Stack (locked)

| Concern              | Choice                                   |
| -------------------- | ---------------------------------------- |
| Framework            | Next.js (App Router) + TypeScript strict |
| Package manager      | **pnpm** (never npm/yarn)                |
| Styling              | Tailwind v4 + CSS Modules                |
| Scroll animation     | GSAP + ScrollTrigger (via `useGSAP`)     |
| Component transitions| Motion (Framer Motion)                   |
| Smooth scroll        | Lenis (single RAF, synced to GSAP)       |
| SVG                  | SVGR + SVGO                              |
| Hosting              | Vercel                                   |

## Quick start

```bash
pnpm install
cp .env.example .env.local   # fill in NEXT_PUBLIC_SITE_URL/NAME/DESCRIPTION
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The default `app/page.tsx`
is a **scaffold self-check** — it verifies env vars, animation libs, fonts, and
SEO routes (`/robots.txt`, `/sitemap.xml`, `/llms.txt`). Replace it with your
real homepage once everything is green.

## Scripts

```bash
pnpm dev      # local dev (Turbopack)
pnpm build    # production build
pnpm lint     # eslint
```

## What's wired up

- **Animation:** `app/providers/SmoothScrollProvider.tsx` sets up a single RAF
  loop — Lenis driven by GSAP's ticker, with ScrollTrigger updates and
  `prefers-reduced-motion` disabling smooth scroll.
- **SEO:** `site.config.ts` is the single source. `app/robots.ts`,
  `app/sitemap.ts`, `app/llms.txt/route.ts`, and `app/opengraph-image.tsx` all
  derive from `NEXT_PUBLIC_SITE_URL`.
- **Analytics:** `components/Analytics.tsx` no-ops when `NEXT_PUBLIC_GA_ID` /
  `NEXT_PUBLIC_GTM_ID` are empty — keeps dev/staging clean.
- **SVGR:** `*.svg` imports become React components (Turbopack + Webpack
  configured in `next.config.ts`).
- **Tokens:** CSS custom properties in `app/globals.css` (OKLCH brand scale,
  easing, durations, fluid type via `clamp(rem + vw)`).
- **Placeholders:** `<Placeholder />` in `components/` reserves aspect ratio
  and is greppable by `data-placeholder` / `TODO: placeholder asset`.

## Before launch

- Replace `app/page.tsx` with the real homepage.
- Replace every `<Placeholder />` and `TODO: placeholder asset` with real media.
- Fill `.env.local`; ensure `NEXT_PUBLIC_SITE_URL` is the production canonical.
- Decide the AI-crawler policy in `app/robots.ts` (currently **allow all**).
- If targeting EU/UK with GA/GTM, add a consent banner + Consent Mode v2.
- Run Lighthouse mobile; meet the targets in `CLAUDE.md`.
