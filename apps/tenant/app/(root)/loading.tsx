/**
 * Root layout loading skeleton — shown while the DB tenant membership query runs.
 * Prevents blank screens on slow connections or DB cold starts.
 */
export default function Loading() {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar skeleton */}
      <div className="w-64 shrink-0 border-r border-border bg-card h-screen flex flex-col gap-4 p-4">
        {/* Logo area */}
        <div className="h-12 rounded-lg bg-muted animate-pulse" />
        <div className="h-px bg-border" />
        {/* Nav items */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-9 rounded-md bg-muted animate-pulse" style={{ opacity: 1 - i * 0.1 }} />
        ))}
        <div className="flex-1" />
        {/* User area */}
        <div className="h-12 rounded-lg bg-muted animate-pulse" />
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="h-16 border-b border-border bg-card flex items-center gap-4 px-6">
          <div className="h-6 w-48 rounded bg-muted animate-pulse" />
          <div className="flex-1" />
          <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
        </div>

        {/* Page content */}
        <div className="flex-1 p-6 space-y-6">
          <div className="h-8 w-64 rounded-lg bg-muted animate-pulse" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
          <div className="h-64 rounded-xl bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  );
}
