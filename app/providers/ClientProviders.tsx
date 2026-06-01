'use client';

import { SmoothScrollProvider } from './SmoothScrollProvider';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <SmoothScrollProvider>{children}</SmoothScrollProvider>;
}
