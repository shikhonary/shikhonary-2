import React from "react"

/**
 * Root layout loading skeleton — benchmark fallback for root routes without dedicated loading UI.
 * Completely free of duplicate sidebar/header skeletons.
 */
export default function Loading() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse min-w-0">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
        <div className="space-y-2">
          <div className="h-8 w-56 rounded-lg bg-muted" />
          <div className="h-4 w-80 max-w-full rounded bg-muted/60" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-muted/70" />
      </div>

      {/* 4 Stats KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-card border border-border/60 p-5 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-3.5 w-24 bg-muted rounded" />
                <div className="h-7 w-20 bg-muted rounded" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-muted" />
            </div>
            <div className="h-3 w-36 bg-muted/60 rounded" />
          </div>
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-72 rounded-2xl bg-card border border-border/60 p-6" />
          <div className="h-56 rounded-2xl bg-card border border-border/60 p-6" />
        </div>
        <div className="space-y-6">
          <div className="h-64 rounded-2xl bg-card border border-border/60 p-6" />
          <div className="h-64 rounded-2xl bg-card border border-border/60 p-6" />
        </div>
      </div>
    </div>
  )
}
