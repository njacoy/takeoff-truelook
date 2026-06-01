# Landing Page Scaffold — Decided Stack

Opinionated scaffold for **Awwwards-caliber, animation-heavy Next.js landing pages**. Decisions are locked (✅). This is the "spin up a new client site" reference.

---

## 🔒 Locked Stack Decisions
| Layer | Decision |
|---|---|
| Framework | **Next.js (App Router)** |
| Language | **TypeScript** (`strict: true`) |
| UI library | **React** — structure/state only; keep it out of the animation loop |
| Package manager | **pnpm** |
| Styling | **Tailwind v4** (scaffolding) + **CSS Modules / vanilla CSS** w/ custom-property tokens (bespoke sections) |
| Animation | **GSAP + ScrollTrigger** (DOM-level motion via refs) |
| Micro-interactions | **Motion** (Framer Motion) for component-level transitions |
| Smooth scroll | **Lenis** (pair with ScrollTrigger) |
| Illustrations | **Inline SVG as React components** via SVGR + SVGO |
| Auth | None — public landing pages |
| Hosting | **Vercel** |

> Architecture rule: React renders the skeleton, **GSAP owns the animation**. Don't drive heavy timelines through React state — grab nodes with `useRef` and animate directly. Wrap GSAP setup in `useGSAP()` (the official React hook) for clean cleanup.

---

## 1. Project & Repo Setup
- [ ] Repo created (GitHub), name + description
- [ ] `.gitignore` (node_modules, .env*, .next, .DS_Store)
- [ ] **Push directly to `main`** — solo dev, no branch protection
- [ ] Preview deploys still on per-commit (Vercel) for client review links
- [ ] README with setup/run
- [ ] `.nvmrc` + `engines` pinned
- [ ] `pnpm-lock.yaml` committed
- [ ] ESLint + Prettier configured

## 2. Bootstrapping Commands
```bash
pnpm create next-app@latest my-site --ts --app --tailwind --eslint
cd my-site
pnpm add gsap @gsap/react motion lenis
pnpm add -D @svgr/webpack svgo
```
- [ ] Configure SVGR in `next.config` (see §6)
- [ ] Add Lenis provider + ScrollTrigger sync (see §7)

## 3. Environment Variables & Config
- [ ] `.env.local` (gitignored)
- [ ] `.env.example` committed (keys only, no values)
- [ ] Public vars prefixed `NEXT_PUBLIC_*`
- [ ] Secrets in Vercel dashboard, not in code
- [ ] Separate dev / preview / production values
- [ ] Runtime validation (zod / t3-env) — optional for a landing page

### 🔌 Drop-in config (provide value → it works)
A single `site.config.ts` reads these env vars and feeds the Metadata API, sitemap route, robots route, and analytics components. Per new site you fill in values, nothing else.

| Env var | Powers | Example |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, OG/Twitter URLs, `sitemap.xml`, `robots.txt`, `llms.txt` | `https://clientsite.com` |
| `NEXT_PUBLIC_SITE_NAME` | `<title>` template, OG site name, JSON-LD | `Client Co.` |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | Default meta description, OG description | `We do X.` |
| `NEXT_PUBLIC_OG_IMAGE` | Default social share image (or dynamic OG fallback) | `/og.png` |
| `NEXT_PUBLIC_TWITTER_HANDLE` | Twitter card `creator`/`site` | `@client` |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 (GA4) | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager (optional, if using GTM) | `GTM-XXXXXXX` |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Search Console verification meta tag | token string |

> Rule of thumb: **`SITE_URL` is the keystone** — canonical, OG, sitemap, and robots all generate from it, so you never hand-edit URLs per site. Leave a GA/GTM var blank and the analytics component simply no-ops (no broken tags).

## 4. Design System & Styling Foundations
- [ ] Design tokens as CSS custom properties (color, space, radius, easing, durations)
- [ ] **Animation tokens too** — standard easings + durations so motion feels cohesive
- [ ] Typography scale + `next/font` (self-host, preload, `display: swap`)
- [ ] Fluid type (`clamp()`) for headlines/display; fixed `rem` for body copy
- [ ] **Clamp middle value MUST mix `rem` + `vw`** (e.g. `clamp(2rem, 1rem + 4vw, 4.5rem)`) — never pure `vw`, or zoom breaks (WCAG fail). Tool: utopia.fyi for the scale
- [ ] Light/dark tokens if needed
- [ ] Tailwind v4 theme mapped to the same tokens (single source of truth)
- [ ] CSS Modules reserved for art-directed / animated sections
- [ ] `prefers-reduced-motion` fallback baked into the system early

### Breakpoints (mobile-first)
| Tier | Range | Tailwind |
|---|---|---|
| Mobile | < 768px | base (no prefix) |
| Tablet | 768–1023px | `md:` |
| Desktop | 1024–1535px | `lg:` |
| Large monitor | 1536px+ | `2xl:` |

- [ ] Core four map to Tailwind v4 defaults — no custom config needed
- [ ] (Optional) custom `3xl: 1920px` for ultrawide, via `@theme { --breakpoint-3xl: 120rem; }`
- [ ] Large-monitor strategy decided: **cap content** (~1440–1600px max-width, centered) — don't stretch layouts infinitely
- [ ] Add breakpoints where the layout breaks, not at arbitrary device widths
- [ ] Lean on `clamp()` so type/spacing scale *between* breakpoints (fewer hard jumps)

### Color & gradients
- [ ] Custom colors in **OKLCH** in `@theme` (`oklch(L C H)`); v4's default palette is already OKLCH/P3 (wider gamut, more vivid)
- [ ] Gradients use v4 syntax: `bg-linear-*` / `bg-radial` / `bg-conic` (not `bg-gradient-to-*`)
- [ ] OKLAB interpolation by default (no muddy midpoint); `/oklch` modifier for vivid mid-hues on far-apart stops
- [ ] Text-over-gradient contrast checked at the worst point (WCAG AA)
- [ ] Faint noise overlay on large gradients to kill banding
- [ ] Animated gradient stops kept off large areas (paint cost) — animate a transformed layer instead

## 5. Animation Layer (the showpiece)
- [ ] GSAP core + ScrollTrigger registered once (client component)
- [ ] `useGSAP()` hook used for all GSAP setup (auto-cleanup)
- [ ] Lenis initialized + RAF loop synced to GSAP ScrollTrigger
- [ ] Motion (Framer Motion) for enter/exit + layout transitions
- [ ] Reduced-motion guard wraps non-essential motion
- [ ] Animations tested on a mid-tier device, not just desktop
- [ ] No layout thrash — animate transform/opacity, avoid animating layout props
- [ ] Pin/scrub sections debounced + `invalidateOnRefresh` on resize

## ✨ Loading, Transitions & App States
- [ ] **Preloader / intro** — hold the reveal until critical assets are ready, then run the entrance
- [ ] Entrance gated on `document.fonts.ready` + hero image/video `load` (never fire on a half-painted page)
- [ ] **Route transitions** — View Transitions API (App Router) or `AnimatePresence`; short + reduced-motion-aware
- [ ] `loading.tsx` (Suspense fallback)
- [ ] `error.tsx` (segment error UI) + `global-error.tsx` (root boundary)
- [ ] Styled `not-found.tsx` (404)
- [ ] Preloader + transitions respect `prefers-reduced-motion`

## 🧊 3D / WebGL (optional — not in base stack)
> Add only when a project genuinely needs 3D. Many Awwwards winners use it, but it's heavy — a per-project decision, not a default.
- [ ] React Three Fiber (`@react-three/fiber` + `@react-three/drei`), or OGL for lighter custom work
- [ ] 3D canvas dynamic-imported (`next/dynamic`, `ssr: false`) + lazy-loaded; never blocks first paint
- [ ] Static/poster fallback for mobile + low-power devices; honors reduced-motion
- [ ] Dispose geometries/materials/textures on unmount; cap `dpr`; pause render loop offscreen

## 6. SVG Illustration Workflow
- [ ] SVGR configured so `.svg` imports become React components
- [ ] SVGO pass on all assets (strip metadata, round coords, keep IDs you animate)
- [ ] Keep `viewBox`, drop fixed width/height for responsive scaling
- [ ] Decorative SVGs get `aria-hidden`; meaningful ones get `<title>`/role
- [ ] Animatable paths/groups have stable IDs or classes for GSAP targeting
- [ ] Heavy/static illustrations: consider inlining critical, lazy-loading the rest
- [ ] Don't ship a 2MB inline SVG into the document head — split or defer

## 🎬 Media & Asset Storage

### Video
> Next.js has no `next/video` — video optimization is on you, and it's the most common thing that wrecks Performance/LCP on award sites. Spec it deliberately.
- [ ] **Background/decorative loops:** optimized WebM + MP4 pair, kept small
- [ ] `muted autoplay loop playsInline` + `poster` (poster = LCP element, not the video)
- [ ] Lazy-load video below the fold
- [ ] **`prefers-reduced-motion`:** don't autoplay — show the poster still instead
- [ ] Decorative → `aria-hidden`; meaningful → captions via `<track>`
- [ ] **Substantial video:** use a CDN — `next-video` (Mux) default, or Cloudflare Stream / Cloudinary / ImageKit. Don't self-host streaming video.

### Where assets live (pick per project)
| Tier | Use for | Notes |
|---|---|---|
| **`/public`** | Icons, small images, one short hero loop | Free, CDN-served, simplest. Enough for most landing pages. |
| **Vercel Blob** | Large/many files, dynamic or user-uploaded media | `@vercel/blob` + `BLOB_READ_WRITE_TOKEN` (server-only). Storage + CDN, by URL. |
| **Video CDN** | Real video optimization / adaptive streaming | Mux / Cloudflare Stream / Cloudinary / ImageKit. |

> Blob is **dumb storage** — it serves files but doesn't transcode, stream, or generate posters. It's not a video CDN. And never commit large binaries to Git.

## 🗂️ Optional Module — Headless CMS (content-only)
> Add **only when content changes often** — rotating testimonials, case studies, a simple blog. For ship-and-sit landing pages, skip it; dev-managed is simpler and cheaper for everyone.

**Pick:** **Sanity** (default — flexible, great DX, generous free tier) · **Storyblok** (if the client wants visual click-on-the-page editing) · **Payload** (if they must self-host / own the database).

**Principle:** the CMS owns *content only*. You expose just the safe text/image fields in the schema — layout, spacing, and animation stay in code and stay untouchable. A brand-new section or layout is still you (new schema field + component), not the client.

**Wiring (the flow):**
- [ ] Define schema — only editable fields (e.g. Hero: `headline`, `subhead`, `ctaText`)
- [ ] Add CMS env vars (project ID / dataset / read token) to the §3 config
- [ ] Fetch in server components (GROQ for Sanity; GraphQL/REST otherwise)
- [ ] Pipe CMS images through `next/image` + the CMS CDN
- [ ] Webhook on publish → Next.js ISR revalidation (or Vercel redeploy)
- [ ] Hand off a 2-min Loom of their editing dashboard at launch

> Matches the "CMS escape hatch" note in the client handoff guide.

## 7. SEO & Metadata
> All of this generates from the §3 env vars — set the values once per site, no per-page URL editing.
- [ ] Next.js Metadata API: title template + default description from config
- [ ] Open Graph + Twitter card tags (auto-built from config)
- [ ] Dynamic OG image (Next `ImageResponse`) with static fallback
- [ ] `robots.txt` route — generated from `SITE_URL` (+ AI-crawler rules, §9)
- [ ] `sitemap.xml` route — generated from `SITE_URL`
- [ ] Canonical URLs derived from `SITE_URL`
- [ ] `google-site-verification` meta from `GOOGLE_SITE_VERIFICATION`
- [ ] JSON-LD (Organization / WebSite) populated from config
- [ ] Favicon + apple-touch + `manifest.json`
- [ ] Semantic HTML + `lang` attribute

## 8. Analytics
> Google Analytics drops in via `@next/third-parties/google` — pass `NEXT_PUBLIC_GA_ID` to a `<GoogleAnalytics>` component in the root layout and it's live. Blank var = component no-ops, so dev/staging stay clean.
- [ ] Google Analytics 4 wired via `@next/third-parties` (`GoogleAnalytics`) from `GA_ID`
- [ ] Google Tag Manager via `GoogleTagManager` from `GTM_ID` (optional)
- [ ] Search Console verified (`GOOGLE_SITE_VERIFICATION` meta — see §7)
- [ ] Vercel Speed Insights (Web Vitals — quality signal)
- [ ] (Optional privacy-friendly alt) Plausible / Fathom for a marketing site
- [ ] Key events tracked (CTA clicks, hero scroll-depth, form submit)
- [ ] **Consent (EU/UK):** GA4 sets cookies → consent banner + **Google Consent Mode v2** (default-deny until consent); load GA/GTM only after consent. Plausible/Fathom need no banner.
- [ ] UTM convention documented

## 9. AI Discoverability
- [ ] **`robots.txt` AI-crawler decision made** — allow or block `GPTBot`, `ClaudeBot`, `Google-Extended`, `PerplexityBot`, `CCBot`. This is the one that actually has teeth right now.
- [ ] `llms.txt` at site root — single `#` H1, `>` blockquote summary, `##` sections w/ links. Served as `text/plain`, HTTP 200, UTF-8.
- [ ] (Optional) `llms-full.txt` for fuller context
- [ ] Validate against the llmstxt.org spec
> Reality check: marginal payoff for a single landing page (it shines on docs/content-heavy sites and isn't reliably consumed by LLMs yet). It's cheap and low-risk, so include a minimal one — but `robots.txt` crawler rules are the higher-leverage decision.

## 10. Performance & Lighthouse Targets
**Targets:** Accessibility **100** · Best Practices **100** · SEO **100** · Performance **90+ (100 best-effort)**.

> Honest caveat: Performance 100 fights rich motion. GSAP plugins, Lenis, large inline SVGs, and WebGL cost main-thread time (TBT/INP) and can hurt LCP. Optimize aggressively, but don't gut the showpiece for the last few points. Also: a lab 100 ≠ good real-world UX — watch field Core Web Vitals (CrUX), not just local runs.

### Best Practices → 100
- [ ] HTTPS enforced, no mixed content
- [ ] Zero console errors/warnings in production
- [ ] Images served at correct aspect ratio (no distortion)
- [ ] No deprecated/2022-era APIs
- [ ] No known-vulnerable libraries (`pnpm audit`)
- [ ] Valid source maps; `rel="noopener"` on external links
- [ ] CSP / security headers present — needs care with GA/GTM + animation (use nonces); verify zero console violations

### Performance → 90+ (chase 100 where it doesn't cost the design)
- [ ] Core Web Vitals budget set (LCP < 2.5s, CLS < 0.1, INP < 200ms)
- [ ] LCP element identified + prioritized (hero text/image, `priority` on the image)
- [ ] Reserve space for media/animation to keep CLS ~0
- [ ] Images via `next/image`, AVIF/WebP, correct `sizes`
- [ ] Fonts subset + preloaded, `display: swap`
- [ ] Dynamic-import heavy/below-fold animation + any WebGL
- [ ] Defer non-critical JS; keep main-thread work low for INP/TBT
- [ ] Resource hints: `preconnect`/`dns-prefetch` for fonts, GA/GTM, and any video/media CDN
- [ ] Bundle analyzed (GSAP plugins + Three.js add up fast)
- [ ] Animate only `transform`/`opacity` (no layout-triggering props)
- [ ] Hydration cost checked — heavy client components are the usual culprit
- [ ] Lighthouse run on hero + key pages (mobile throttling, not just desktop)

## 📱 Mobile optimization
> Where animation-heavy sites fail. Lighthouse audits mobile *throttled*, so this is where Performance is won or lost — and where your GSAP/Lenis/video choices bite hardest.

- [ ] **`gsap.matchMedia()`** — lighter or different animations per breakpoint; drop heavy effects on small screens
- [ ] **Lenis off on touch** — rely on native momentum scroll; don't let it fight the browser
- [ ] **Viewport units:** `dvh`/`svh`, never `100vh` (address-bar resize breaks it)
- [ ] Pinned/scrubbed sections verified on mobile; resize handled (`invalidateOnRefresh`); simplified/disabled if janky
- [ ] **Hover gated** behind `@media (hover: hover)` + tap equivalent for hover-revealed content
- [ ] Autoplay background video → **static poster on mobile** (or smaller mobile encode)
- [ ] Form inputs ≥16px font (stops iOS focus zoom)
- [ ] Mobile-first responsive; no horizontal overflow; fluid type via `clamp()`
- [ ] Tap targets ≥44px (also in §11)
- [ ] Tested on **real iOS Safari**; Lighthouse run in mobile mode, not just desktop

## 11. Accessibility → Lighthouse 100 + real WCAG AA
> Lighthouse a11y is automated and catches only ~30% of issues. **100 is the floor, not "compliant."** The manual passes below are what get you to real WCAG AA.

### Catches the Lighthouse 100 (automated)
- [ ] WCAG AA color contrast (4.5:1 text / 3:1 large + UI)
- [ ] All meaningful images/SVGs have alt/`<title>`; decorative ones `aria-hidden`
- [ ] Every form control has an associated label
- [ ] Links + buttons have discernible names (no bare icon buttons)
- [ ] Valid ARIA (only where native HTML can't do the job)
- [ ] `lang` attribute set; viewport allows zoom (no `maximum-scale`)
- [ ] Logical heading order (one h1, no skipped levels)
- [ ] List/landmark structure valid

### Manual passes (the other ~70% — required for real compliance)
- [ ] Full keyboard nav: every interactive element reachable + operable
- [ ] Visible focus states everywhere (don't let the design remove them)
- [ ] Focus order is logical; focus trapped correctly in any modal/menu
- [ ] Screen reader pass (VoiceOver / NVDA) on key flows
- [ ] `prefers-reduced-motion` honored — non-essential motion off (from §4/§5)
- [ ] Animations don't convey info by motion/color alone
- [ ] Scroll-jacked sections still usable via keyboard + don't strand AT users
- [ ] Tap targets ≥ 44px; legible base font sizes (also helps SEO 100)

## 12. Forms & Email (if there's a contact/lead form)
- [ ] Handler (server action / Vercel function / Formspree)
- [ ] Spam protection (honeypot / Cloudflare Turnstile)
- [ ] Email provider (Resend) + DKIM/SPF/DMARC on domain
- [ ] Accessible labels + success/error states

## 13. Legal
- [ ] Privacy policy (even a landing page collecting an email needs one)
- [ ] Cookie notice only if cookies are set

## 14. QA & Deployment
- [ ] Lint + typecheck pass
- [ ] **Zero placeholders remain** — grep `data-placeholder` / `TODO:`; all images & copy swapped for real content
- [ ] Cross-browser + real mobile device check (Safari iOS especially — scroll/animation quirks)
- [ ] Styled 404 + error page
- [ ] Custom domain + DNS + SSL
- [ ] Redirects/rewrites (www, trailing slash)
- [ ] Production QA pass on live URL

## 15. Post-Launch
- [ ] Error tracking (Sentry)
- [ ] Uptime monitor (optional for landing pages)
- [ ] Analytics dashboard bookmarked
- [ ] (If it's Awwwards-bound) submit + line up your "Site of the Day" assets/preview

---

### Minimum viable scaffold
§§1–2 (bootstrap), §4 (tokens), §5 (animation), §6 (SVG), §7 (SEO basics), §11 (a11y basics), §14 (deploy). Layer the rest as the project earns it.
