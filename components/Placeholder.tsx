import type { CSSProperties } from 'react';

type Props = {
  /** e.g. "16/9", "4/3", "1/1" — keeps CLS at zero. */
  aspect?: string;
  /** Short label shown in the placeholder (e.g. "Hero video"). */
  label?: string;
  /** Optional dimensions hint (e.g. "1920×1080"). */
  dimensions?: string;
  className?: string;
};

// TODO: replace all <Placeholder /> usages with real assets before launch.
// Greppable: `data-placeholder` + `TODO: placeholder asset`.
export function Placeholder({ aspect = '16/9', label = 'Placeholder', dimensions, className = '' }: Props) {
  const style: CSSProperties = { aspectRatio: aspect };
  return (
    <div
      data-placeholder="true"
      role="img"
      aria-label={`${label} placeholder${dimensions ? ` (${dimensions})` : ''}`}
      style={style}
      className={`relative w-full overflow-hidden rounded-lg border border-dashed border-neutral-700 bg-[repeating-linear-gradient(45deg,transparent_0_10px,rgba(255,255,255,0.04)_10px_20px)] text-neutral-400 ${className}`}
    >
      {/* TODO: placeholder asset */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center font-mono text-xs">
        <span className="uppercase tracking-wider">{label}</span>
        <span className="text-neutral-500">
          {aspect}
          {dimensions ? ` · ${dimensions}` : ''}
        </span>
      </div>
    </div>
  );
}
