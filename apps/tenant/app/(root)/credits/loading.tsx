import React from "react"

export default function CreditsLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl space-y-10 animate-pulse w-full min-w-0">
      {/* Top Banner Wallet Skeleton */}
      <div className="rounded-3xl bg-muted/40 border border-border/60 p-6 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl">
          <div className="h-6 w-36 rounded-full bg-muted" />
          <div className="h-9 w-64 rounded-xl bg-muted" />
          <div className="h-4 w-80 max-w-full rounded bg-muted/60" />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="h-16 w-44 rounded-2xl bg-muted" />
          <div className="h-12 w-36 rounded-xl bg-muted/70" />
        </div>
      </div>

      {/* Credit Packs Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
          <div className="space-y-1">
            <div className="h-6 w-44 bg-muted rounded" />
            <div className="h-3.5 w-64 bg-muted/60 rounded" />
          </div>
          <div className="h-8 w-32 rounded-lg bg-muted/50" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-80 rounded-2xl bg-card border border-border/60 p-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-28 bg-muted rounded" />
                  <div className="h-5 w-16 bg-muted/60 rounded-full" />
                </div>
                <div className="h-10 w-32 bg-muted rounded" />
                <div className="space-y-2 pt-2">
                  <div className="h-4 w-full bg-muted/50 rounded" />
                  <div className="h-4 w-4/5 bg-muted/50 rounded" />
                  <div className="h-4 w-3/4 bg-muted/50 rounded" />
                </div>
              </div>
              <div className="h-11 w-full bg-muted rounded-xl mt-4" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="rounded-2xl bg-card border border-border/60 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <div className="h-5 w-40 bg-muted rounded" />
          <div className="h-4 w-24 bg-muted/60 rounded" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-muted/30 border border-border/40" />
          ))}
        </div>
      </div>
    </div>
  )
}
