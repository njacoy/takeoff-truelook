# CLAUDE.md

Operating manual for award-caliber, animation-heavy **Next.js landing pages**. Follow these rules unless a task explicitly overrides them. This file is the binding ruleset; rationale and the full launch/QA checklist live in the referenced doc at the bottom.

## Stack (locked — do not substitute)
- **Framework:** Next.js (App Router)
- **Language:** TypeScript, `strict: true`
- **Package manager:** pnpm — ALWAYS use `pnpm` for installs and scripts; NEVER npm or yarn
- **Styling:** Tailwind v4 for scaffolding/utility + CSS Modules (or vanilla CSS) with custom-property tokens for bespoke sections
- **Scroll animation:** GSAP + ScrollTrigger
- **Component transitions:** Motion (Framer Motion)
- **Smooth scroll:** Lenis, synced to GSAP's RAF / ScrollTrigger
- **SVG:** SVGR (import as React components) + SVGO
- **Hosting:** Vercel
- **Auth:** none (public landing pages)

## Architecture
- ALWAYS let React own structure/state and GSAP own animation. Drive timelines via `useRef`, not React state.
- ALWAYS wrap GSAP setup in `useGSAP()` for automatic cleanup.
- ALWAYS register GSAP plugins (e.g. ScrollTrigger) once, in a client component.
- ALWAYS run a single scroll loop — sync Lenis to ScrollTrigger; NEVER run two competing scroll/RAF loops.

## Animation
- ALWAYS animate only `transform` and `opacity`.
- NEVER animate layout-triggering properties (width, height, top, left, margin).
- ALWAYS gate non-essential motion behind `prefers-reduced-motion`.
- Scroll triggers use viewport-relative start/end (e.g. `start: "center center"`). Use `scrub` for scroll-linked, `toggleActions` for fire-once, `pin` for held sections.
- ALWAYS handle resize: set `invalidateOnRefresh` and/or call `ScrollTrigger.refresh()`.
- Pinned/scrubbed sections MUST remain keyboard-operable and must not strand assistive-tech users.

## Loading, transitions & app states
- Provide a **preloader / intro**: hold the reveal until critical assets are ready, then run the entrance animation. NEVER fire the hero animation on a half-painted page.
- Gate the entrance on asset readiness — `document.fonts.ready` plus hero image/video `load` — before the GSAP intro timeline.
- **Route transitions:** use the View Transitions API (App Router) or an `AnimatePresence`-based pattern for smooth page-to-page motion. Keep them short and `prefers-reduced-motion`-aware.
- Implement App Router state files: `loading.tsx` (Suspense fallback), `error.tsx` (segment error UI), `global-error.tsx` (root boundary), and a styled `not-found.tsx` (404).
- Preloader and transitions MUST respect `prefers-reduced-motion` — skip or curtail, never trap the user.

## 3D / WebGL (optional — NOT in base stack)
- Add ONLY when a project genuinely needs 3D. Default: **React Three Fiber** (`@react-three/fiber` + `@react-three/drei`); OGL for lighter custom work.
- ALWAYS dynamic-import the 3D canvas (`next/dynamic`, `ssr: false`) and lazy-load it; it must not block first paint.
- Provide a static/poster fallback for mobile and low-power devices, and honor `prefers-reduced-motion`.
- ALWAYS dispose geometries/materials/textures on unmount; cap pixel ratio (`dpr`) and pause the render loop when offscreen.

## Styling
- ALWAYS define design tokens as CSS custom properties (color, space, radius, easing, durations) as the single source of truth; map the Tailwind theme to them.
- Use Tailwind for layout/utility; reserve CSS Modules for art-directed/animated sections.
- NEVER use runtime CSS-in-JS near animated components.
- Use `clamp()` for fluid type.
- ALWAYS mix `rem` + `vw` in the clamp middle value (e.g. `clamp(2rem, 1rem + 4vw, 4.5rem)`); NEVER pure `vw` — it breaks browser zoom and fails WCAG.
- Fluid `clamp()` for headlines/display; fixed `rem` for body copy. Define fluid sizes as `@theme` tokens (e.g. `--text-hero`).

## SVG
- Import SVGs as React components via SVGR; run SVGO on all assets.
- Keep `viewBox`; drop fixed `width`/`height` for responsive scaling.
- Give animatable paths/groups stable IDs or classes for GSAP targeting.
- `aria-hidden` on decorative SVGs; `<title>` on meaningful ones.
- NEVER inline a multi-hundred-KB SVG into the document head — split or lazy-load.

## Video & media assets
- Next.js has **no built-in video optimization** (no `next/video`). Wire it manually.
- **Decorative / background loops:** self-host an optimized **WebM + MP4** pair, kept small. ALWAYS `muted autoplay loop playsInline` with a `poster`; the poster is the LCP element — NEVER block LCP on the video. Lazy-load if below the fold.
- **Substantial video (showreels, long or multiple clips):** use a video CDN — default `next-video` (Mux); Cloudflare Stream / Cloudinary / ImageKit are alternatives. Do NOT self-host large or streaming video.
- ALWAYS honor `prefers-reduced-motion`: do not autoplay; show the poster still instead.
- Decorative video → `aria-hidden`; meaningful video → captions via `<track>`.
- NEVER serve uncompressed multi-MB MP4s from `/public` as hero backgrounds.

## Asset storage
- **Small/static** (icons, small images, one short optimized hero loop): keep in `/public` — free, CDN-served by Vercel, simplest. Enough for most landing pages; don't over-engineer.
- **Large or many files, or anything that shouldn't bloat Git** (big videos, lots of images, dynamic/user uploads): use **Vercel Blob** (`@vercel/blob`) — object storage native to Vercel, CDN-served, referenced by URL. Requires `BLOB_READ_WRITE_TOKEN` (server-only secret — NEVER `NEXT_PUBLIC`).
- Blob is **dumb storage**: it stores/serves files but does NOT transcode video, stream adaptively, or generate posters. For real video optimization use a video CDN, not Blob.
- NEVER commit large binaries (video, large images) to the repo.

## Placeholders & missing assets
- When a section's image/media isn't explicitly provided, render a **local `<Placeholder>` component** — NEVER invent a real-looking asset path, and NEVER hotlink external/stock-image URLs.
- The placeholder MUST reserve the section's intended aspect ratio (keeps CLS ~0) and visibly read as a placeholder (label the intended dimensions, e.g. "16:9").
- Make every placeholder greppable (`data-placeholder` attribute + a `TODO:` marker) so all can be found and swapped before launch.
- Same for unwritten copy: clearly-marked placeholder text, never final-looking lorem.
- Pre-launch: zero placeholders may remain.

## Config & env (drop-in)
A single `site.config.ts` reads env vars and feeds metadata, sitemap, robots, llms.txt, and analytics. Per project, only values change.
- `NEXT_PUBLIC_SITE_URL` — keystone: canonical URLs, OG/Twitter URLs, sitemap, robots, and llms.txt all derive from it
- `NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_SITE_DESCRIPTION`, `NEXT_PUBLIC_OG_IMAGE`, `NEXT_PUBLIC_TWITTER_HANDLE`
- `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
- ALWAYS make analytics components no-op when their env var is empty (clean dev/staging).
- NEVER hardcode per-site URLs — derive from `SITE_URL`.
- NEVER expose secrets to the client; only `NEXT_PUBLIC_*` vars reach the browser.

## SEO
- Generate metadata via the Next Metadata API from `site.config.ts` (title template, description, OG/Twitter, canonical).
- Generate `robots.txt` and `sitemap.xml` as routes from `SITE_URL`.
- Include a dynamic OG image (`ImageResponse`) with a static fallback, plus JSON-LD (Organization/WebSite).
- `robots.txt` MUST include explicit AI-crawler rules (GPTBot, ClaudeBot, Google-Extended, PerplexityBot, CCBot) per the project's allow/block decision.
- Ship a minimal root `llms.txt` (single `#` H1, `>` blockquote summary, `##` link sections).

## Consent & privacy
- GA4 sets cookies — if the project targets EU/UK visitors, implement a **consent banner + Google Consent Mode v2** (default-deny analytics/ads storage until consent). Privacy-friendly analytics (Plausible/Fathom) need no banner.
- Load GA/GTM only after consent (or in Consent Mode default-denied state); NEVER set tracking cookies pre-consent.
- Keep a privacy-policy link in the footer whenever any analytics runs.

## Color & gradients
- Define custom colors in **OKLCH** in `@theme` (e.g. `--color-brand-500: oklch(0.64 0.18 260)`; L 0–1, C ~0–0.4, H 0–360). Tailwind v4's default palette is already OKLCH/P3 — wider gamut, more vivid on modern displays.
- Perceptual uniformity: equal L changes = equal perceived lightness, so scales and light/dark pairs stay predictable. Bigger L-difference ≈ better contrast (still verify with a tool for WCAG).
- Gradient utilities use v4 syntax: `bg-linear-*`, `bg-radial`, `bg-conic` — NOT `bg-gradient-to-*`.
- v4 interpolates in **OKLAB by default** (no muddy gray midpoint). Add `/oklch` for more vivid mid-hues when stops are far apart on the wheel: `bg-linear-to-r/oklch from-indigo-500 to-teal-400`. v4 emits `color-mix()` fallbacks for old browsers.
- Gradient text: `bg-clip-text text-transparent`.
- ALWAYS check text-over-gradient contrast at the worst point (contrast varies across the area).
- For banding on large smooth gradients, overlay a faint noise/grain texture.
- Animating gradient stops works (registered via `@property`) but is paint-heavy on large areas — animate a transformed gradient layer instead.

## Breakpoints
- Mobile-first: base styles target mobile; layer up with prefixes.
- Tier → Tailwind (v4 defaults, no custom config needed):
  - Mobile = base (`< 768px`)
  - Tablet = `md:` (768px)
  - Desktop = `lg:` (1024px)
  - Large monitor = `2xl:` (1536px)
- Add a custom `3xl: 1920px` ONLY for ultrawide refinement, in the v4 `@theme` block (`--breakpoint-3xl: 120rem`). `sm:`/`xl:` stay available for fine-tuning.
- Large monitors: cap content with a max-width (~1440–1600px) and center it; let margins grow. NEVER scale layouts infinitely.
- Add breakpoints where the layout/content breaks, not at arbitrary device widths.
- Prefer `clamp()` fluid type/spacing to minimize hard breakpoints.

## Mobile
- Treat mobile as the primary performance battleground — Lighthouse mobile is CPU/network-throttled, so this is where the animation and video budgets actually bite.
- ALWAYS use `gsap.matchMedia()` to serve lighter or different animations per breakpoint; reduce or drop expensive effects on small screens.
- Lenis: disable smooth scroll on touch and rely on native momentum scrolling. NEVER let Lenis fight native touch scroll.
- Pinned/scrubbed ScrollTrigger sections: use `dvh`/`svh` (NEVER `100vh`), handle address-bar resize (`invalidateOnRefresh`), and simplify or disable pins on small screens if they jank.
- Gate hover effects behind `@media (hover: hover)` and provide a tap equivalent for any hover-revealed content.
- Swap autoplay background video → static poster on mobile (data/battery/perf), or ship a smaller mobile encode.
- Form inputs MUST use ≥16px font (prevents iOS focus zoom).
- Mobile-first responsive; no horizontal overflow; fluid type via `clamp()` (see Styling); tap targets ≥44px (see Quality gates).
- ALWAYS test on real iOS Safari (quirkiest engine) and run Lighthouse in mobile mode, not just desktop.

## Quality gates (build to these)
- **Targets:** Accessibility 100, Best Practices 100, SEO 100 (hard requirements); Performance 90+ (push toward 100 only where it doesn't compromise the intended motion).
- ALWAYS: semantic HTML, one `h1`, logical heading order, labeled form controls, discernible link/button names, WCAG AA contrast, visible focus states, keyboard-operable interactions, `lang` set, zoom allowed (no `maximum-scale`).
- ALWAYS reserve space for media/animation to keep CLS ~0; set `priority` on the LCP image.
- ALWAYS use `next/image` (AVIF/WebP, correct `sizes`) and `next/font` (subset, preload, `display: swap`).
- Dynamic-import below-fold/heavy animation components and any WebGL.
- Keep main-thread work low (protect INP/TBT); zero console errors in production.
- Add resource hints: `preconnect`/`dns-prefetch` for fonts, GA/GTM, and any video/media CDN.
- CSP: the analytics + animation stack needs care — build a working Content-Security-Policy (nonces for inline) and verify zero CSP violations in the console.

## Commands
```bash
pnpm install   # install deps
pnpm dev       # local dev
pnpm build     # production build
pnpm lint      # lint + typecheck
```
Bootstrap a new project:
```bash
pnpm create next-app@latest . --ts --app --tailwind --eslint
pnpm add gsap @gsap/react motion lenis
pnpm add -D @svgr/webpack svgo
```

## First-run homepage (scaffold self-check)
- The default `app/page.tsx` MUST be a self-checking verification screen, not a blank/boilerplate page.
- It runs live checks and reports pass/warn/fail for: required env vars, GSAP + ScrollTrigger, Lenis, Motion, `prefers-reduced-motion`, web fonts, and whether `/robots.txt`, `/sitemap.xml`, `/llms.txt` resolve.
- Missing optional vars (e.g. `GA_ID`) and not-yet-generated SEO routes are **warn**, not **fail**.
- It shows a clear "Scaffold ready" state when all required checks pass.
- Mark it clearly as a placeholder to be replaced by the real homepage. Use the provided `page.tsx` as the reference implementation.

## Optional: headless CMS (content-only)
Add ONLY when content changes often (rotating testimonials, case studies, a blog). Default pick: Sanity. The CMS owns content only — expose just safe text/image fields in the schema; layout and animation stay in code. A new section/layout is a code change, not a CMS edit.

## Out of scope for the agent (human-only — do not attempt or simulate)
- Manual keyboard + screen-reader testing (VoiceOver / NVDA)
- Real-device cross-browser checks
- Submitting to Awwwards / design galleries
- Client handoff, Loom walkthroughs, pricing, domain/account setup
- Supplying secret/env values (the human provides these)

## Reference
Full rationale + the human launch/QA checklist: `@docs/website-scaffolding-checklist.md`
*(adjust the path to wherever the checklist lives in the repo; imports load on demand, so this stays out of the startup context until needed.)*
