import React from "react"

export default function ProfileLoading() {
  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
        <div className="space-y-2">
          <div className="h-8 w-60 rounded-lg bg-muted" />
          <div className="h-4 w-80 max-w-full rounded bg-muted/60" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-muted/70" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 border-b border-border/60 pb-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 w-32 rounded-xl bg-muted shrink-0" />
        ))}
      </div>

      {/* Form Card */}
      <div className="rounded-2xl bg-card border border-border/60 p-6 sm:p-8 space-y-6">
        <div className="h-6 w-44 bg-muted rounded" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-28 bg-muted rounded" />
              <div className="h-11 w-full rounded-xl bg-muted/40 border border-border/40" />
            </div>
          ))}
        </div>

        <div className="space-y-2 pt-2">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-24 w-full rounded-xl bg-muted/40 border border-border/40" />
        </div>

        <div className="flex justify-end pt-4 border-t border-border/40">
          <div className="h-11 w-32 rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  )
}
