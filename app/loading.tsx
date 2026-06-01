export default function Loading() {
  return (
    <main
      aria-live="polite"
      aria-busy="true"
      className="grid min-h-dvh place-items-center bg-neutral-950 text-neutral-400"
    >
      <div className="flex items-center gap-3 text-sm">
        <span
          aria-hidden
          className="inline-block h-2 w-2 animate-pulse rounded-full bg-neutral-500"
        />
        Loading…
      </div>
    </main>
  );
}
