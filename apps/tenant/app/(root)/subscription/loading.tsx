import React from "react"

export default function SubscriptionLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl space-y-8 animate-pulse w-full min-w-0">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
        <div className="space-y-2">
          <div className="h-8 w-64 rounded-lg bg-muted" />
          <div className="h-4 w-96 max-w-full rounded bg-muted/60" />
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
            <div className="h-3 w-40 bg-muted/60 rounded" />
          </div>
        ))}
      </div>

      {/* Subscription Plans Grid (3 pricing cards) */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
          <div className="h-6 w-44 bg-muted rounded" />
          <div className="h-9 w-48 rounded-xl bg-muted" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-96 rounded-2xl bg-card border border-border/60 p-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-28 bg-muted rounded-md" />
                  <div className="h-5 w-16 bg-muted/70 rounded-full" />
                </div>
                <div className="h-10 w-36 bg-muted rounded-lg" />
                <div className="space-y-2.5 pt-2">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="h-4 w-full bg-muted/50 rounded" />
                  ))}
                </div>
              </div>
              <div className="h-11 w-full bg-muted rounded-xl mt-6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
