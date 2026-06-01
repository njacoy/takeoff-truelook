'use client';

/**
 * Scaffold verification homepage.
 * Drop in at `app/page.tsx`. On first build it runs live checks and confirms the
 * stack is wired correctly. REPLACE THIS FILE with your real homepage once green.
 */

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { motion } from 'motion/react';
import Lenis from 'lenis';

type Status = 'checking' | 'ok' | 'warn' | 'fail';
type Group = 'Environment' | 'Animation' | 'SEO routes' | 'System';
type Check = { label: string; group: Group; status: Status; detail?: string };

// NEXT_PUBLIC_* vars are inlined at build time, so reference them statically.
const ENV: Record<string, string | undefined> = {
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
  NEXT_PUBLIC_SITE_DESCRIPTION: process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
};

const INITIAL: Check[] = [
  { label: 'NEXT_PUBLIC_SITE_URL', group: 'Environment', status: 'checking' },
  { label: 'NEXT_PUBLIC_SITE_NAME', group: 'Environment', status: 'checking' },
  { label: 'NEXT_PUBLIC_SITE_DESCRIPTION', group: 'Environment', status: 'checking' },
  { label: 'NEXT_PUBLIC_GA_ID (optional)', group: 'Environment', status: 'checking' },
  { label: 'GSAP + ScrollTrigger', group: 'Animation', status: 'checking' },
  { label: 'Lenis smooth scroll', group: 'Animation', status: 'checking' },
  { label: 'Motion (Framer Motion)', group: 'Animation', status: 'checking' },
  { label: 'prefers-reduced-motion', group: 'System', status: 'checking' },
  { label: 'Web fonts loaded', group: 'System', status: 'checking' },
  { label: '/robots.txt', group: 'SEO routes', status: 'checking' },
  { label: '/sitemap.xml', group: 'SEO routes', status: 'checking' },
  { label: '/llms.txt', group: 'SEO routes', status: 'checking' },
];

export default function Home() {
  const [checks, setChecks] = useState<Check[]>(INITIAL);
  const containerRef = useRef<HTMLDivElement>(null);

  const set = (label: string, status: Status, detail?: string) =>
    setChecks((prev) =>
      prev.map((c) => (c.label === label ? { ...c, status, detail } : c)),
    );

  // GSAP confirms by running a staggered reveal on the rows.
  useGSAP(
    () => {
      try {
        gsap.registerPlugin(ScrollTrigger);
        gsap.from('.scaffold-row', {
          opacity: 0,
          y: 8,
          stagger: 0.03,
          duration: 0.4,
          ease: 'power2.out',
        });
        set('GSAP + ScrollTrigger', 'ok', 'registered + tween ran');
      } catch (e) {
        set('GSAP + ScrollTrigger', 'fail', String(e));
      }
    },
    { scope: containerRef },
  );

  useEffect(() => {
    // Motion: reaching this effect means the import + render succeeded.
    set('Motion (Framer Motion)', 'ok', 'rendered');

    // Lenis
    let lenis: Lenis | null = null;
    try {
      lenis = new Lenis();
      const raf = (time: number) => {
        lenis?.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
      lenis.on('scroll', ScrollTrigger.update);
      set('Lenis smooth scroll', 'ok', 'instance + RAF active');
    } catch (e) {
      set('Lenis smooth scroll', 'fail', String(e));
    }

    // Environment
    set('NEXT_PUBLIC_SITE_URL', ENV.NEXT_PUBLIC_SITE_URL ? 'ok' : 'fail',
      ENV.NEXT_PUBLIC_SITE_URL ?? 'missing — set in .env.local');
    set('NEXT_PUBLIC_SITE_NAME', ENV.NEXT_PUBLIC_SITE_NAME ? 'ok' : 'fail',
      ENV.NEXT_PUBLIC_SITE_NAME ?? 'missing');
    set('NEXT_PUBLIC_SITE_DESCRIPTION', ENV.NEXT_PUBLIC_SITE_DESCRIPTION ? 'ok' : 'fail',
      ENV.NEXT_PUBLIC_SITE_DESCRIPTION ?? 'missing');
    set('NEXT_PUBLIC_GA_ID (optional)', ENV.NEXT_PUBLIC_GA_ID ? 'ok' : 'warn',
      ENV.NEXT_PUBLIC_GA_ID ? 'set' : 'blank — analytics will no-op (fine in dev)');

    // System
    try {
      const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
      set('prefers-reduced-motion', 'ok', rm.matches ? 'reduce' : 'no-preference');
    } catch {
      set('prefers-reduced-motion', 'warn', 'matchMedia unavailable');
    }
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(() => set('Web fonts loaded', 'ok', 'fonts ready'));
    } else {
      set('Web fonts loaded', 'warn', 'Font Loading API unavailable');
    }

    // SEO routes — warn (not fail) if missing, since they may not be generated yet.
    (['/robots.txt', '/sitemap.xml', '/llms.txt'] as const).forEach(async (route) => {
      try {
        const res = await fetch(route, { cache: 'no-store' });
        set(route, res.ok ? 'ok' : 'warn',
          res.ok ? `${res.status} OK` : `${res.status} — not generated yet?`);
      } catch {
        set(route, 'warn', 'unreachable');
      }
    });

    return () => lenis?.destroy();
  }, []);

  const hasFail = checks.some((c) => c.status === 'fail');
  const stillChecking = checks.some((c) => c.status === 'checking');
  const overall: Status = hasFail ? 'fail' : stillChecking ? 'checking' : 'ok';

  const headline =
    overall === 'fail' ? 'Setup incomplete'
    : overall === 'checking' ? 'Running checks…'
    : 'Scaffold ready';

  const groups: Group[] = ['Environment', 'Animation', 'SEO routes', 'System'];

  return (
    <main className="min-h-dvh bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
      <div ref={containerRef} className="w-full max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8 backdrop-blur"
        >
          <div className="flex items-center gap-3">
            <Dot status={overall} large />
            <h1 className="text-xl font-semibold tracking-tight">{headline}</h1>
          </div>
          <p className="mt-2 text-sm text-neutral-400">
            {overall === 'ok'
              ? 'Every system is wired correctly. Replace app/page.tsx with your real homepage.'
              : 'This page verifies the scaffold. Fix anything red, then replace it with your content.'}
          </p>

          <div className="mt-6 space-y-5">
            {groups.map((group) => (
              <div key={group}>
                <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-500">
                  {group}
                </h2>
                <ul className="space-y-1.5">
                  {checks.filter((c) => c.group === group).map((c) => (
                    <li
                      key={c.label}
                      className="scaffold-row flex items-center justify-between gap-4 rounded-lg px-3 py-2 text-sm odd:bg-neutral-900/40"
                    >
                      <span className="flex items-center gap-2.5">
                        <Dot status={c.status} />
                        <span className="font-mono text-[13px] text-neutral-200">{c.label}</span>
                      </span>
                      {c.detail && (
                        <span className="truncate text-right text-xs text-neutral-500">{c.detail}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>
        <p className="mt-4 text-center text-xs text-neutral-600">
          Crazy Creative Design · scaffold self-check
        </p>
      </div>
    </main>
  );
}

function Dot({ status, large }: { status: Status; large?: boolean }) {
  const color =
    status === 'ok' ? 'bg-emerald-400'
    : status === 'warn' ? 'bg-amber-400'
    : status === 'fail' ? 'bg-rose-400'
    : 'bg-neutral-500 animate-pulse';
  return (
    <span
      aria-hidden
      className={`inline-block rounded-full ${color} ${large ? 'h-3 w-3' : 'h-2 w-2'}`}
    />
  );
}
