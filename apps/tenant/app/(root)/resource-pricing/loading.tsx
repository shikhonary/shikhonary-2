import React from "react"

export default function ResourcePricingLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl space-y-8 animate-pulse w-full min-w-0">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
        <div className="space-y-2">
          <div className="h-8 w-64 rounded-lg bg-muted" />
          <div className="h-4 w-96 max-w-full rounded bg-muted/60" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-32 rounded-xl bg-muted/70" />
          <div className="h-10 w-28 rounded-xl bg-muted/50" />
        </div>
      </div>

      {/* Calculator Banner */}
      <div className="rounded-2xl bg-card border border-border/60 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="h-4 w-80 max-w-full bg-muted/60 rounded" />
        </div>
        <div className="h-12 w-48 bg-muted rounded-xl shrink-0" />
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-28 rounded-xl bg-muted shrink-0" />
          ))}
        </div>
        <div className="h-10 w-full sm:w-64 rounded-xl bg-muted/60" />
      </div>

      {/* Pricing Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="h-40 rounded-2xl bg-card border border-border/60 p-5 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <div className="h-5 w-32 bg-muted rounded" />
                <div className="h-3.5 w-44 bg-muted/60 rounded" />
              </div>
              <div className="h-7 w-16 bg-muted/70 rounded-lg shrink-0" />
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border/40">
              <div className="h-4 w-20 bg-muted/50 rounded" />
              <div className="h-6 w-24 bg-muted/70 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
