import React from "react"

export default function SubjectResourceExplorerLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl space-y-6 animate-pulse w-full min-w-0">
      {/* Header skeleton with back button and title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-muted shrink-0" />
          <div className="space-y-1.5">
            <div className="h-7 w-52 rounded-lg bg-muted" />
            <div className="h-4 w-72 max-w-full rounded bg-muted/60" />
          </div>
        </div>
        <div className="h-9 w-36 rounded-xl bg-muted/70" />
      </div>

      {/* Question Types Tabs Skeleton */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar border-b border-border/40 pb-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-9 w-28 rounded-xl bg-muted shrink-0" />
        ))}
      </div>

      {/* Filters Bar Skeleton */}
      <div className="rounded-2xl bg-card border border-border/60 p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-muted/60" />
          ))}
        </div>
      </div>

      {/* Question Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-64 rounded-2xl bg-card border border-border/60 p-5 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-8 bg-muted rounded" />
                  <div className="h-5 w-24 bg-muted/70 rounded-md" />
                </div>
              </div>
              <div className="h-4 w-full bg-muted/70 rounded" />
              <div className="h-4 w-4/5 bg-muted/60 rounded" />
              <div className="grid grid-cols-2 gap-2 pt-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-7 rounded-lg bg-muted/40" />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/40">
              <div className="h-4 w-28 bg-muted/50 rounded" />
              <div className="h-7 w-24 bg-muted/70 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
