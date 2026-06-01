# Getting Started — Scaffold a New Site

The two-minute version of how to spin up a new landing page from this setup.

## 1. Set up the repo
- Create the project folder (or GitHub repo) and `cd` into it.
- Put **`CLAUDE.md` at the repo root** — exact name, capitalized. Claude Code auto-loads it at session start.
- Put `website-scaffolding-checklist.md` wherever you like (e.g. `/docs`), then **update the `@import` path** at the bottom of `CLAUDE.md` to match.

## 2. Open Claude Code in the folder
```bash
cd your-project
claude
```
It reads `CLAUDE.md` automatically — no need to paste it.

## 3. Kick off the scaffold
Paste this prompt:

> Read CLAUDE.md, then scaffold a new Next.js App Router landing-page project that follows it exactly. Run the bootstrap commands; set up `site.config.ts` reading the env vars and create `.env.example` with all keys; wire GSAP + ScrollTrigger + Lenis + Motion as a single synced scroll loop using `useGSAP`; configure SVGR + SVGO; generate metadata, `robots.txt`, `sitemap.xml`, and `llms.txt` from `SITE_URL`; add the `prefers-reduced-motion` guard; and set `next/image` + `next/font` defaults. Show me the plan and confirm before writing files.

*(The "show me the plan first" line is optional but worth keeping for the first few runs, so you can sanity-check before it touches the filesystem.)*

## 4. Fill in values + run
- Copy `.env.example` → `.env.local` and fill the values. **`NEXT_PUBLIC_SITE_URL` is the keystone** — most SEO/metadata flows from it.
- Leave `GA_ID` / `GTM_ID` blank in dev; analytics will no-op.
- `pnpm dev` and you're building.

---

**Files in this set**
- `CLAUDE.md` — the agent's binding ruleset (repo root)
- `website-scaffolding-checklist.md` — full human reference + launch/QA checklist
- `client-handoff-guide.md` — client-facing owner's guide (not for the repo's build context)
