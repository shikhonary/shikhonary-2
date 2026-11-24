import React from "react"

export default function QuestionBankLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl space-y-8 animate-pulse w-full">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
        <div className="space-y-2">
          <div className="h-8 w-56 rounded-lg bg-muted" />
          <div className="h-4 w-80 rounded bg-muted/60" />
        </div>
        <div className="h-10 w-full sm:w-64 rounded-xl bg-muted/70" />
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
                <div className="h-3.5 w-20 bg-muted rounded" />
                <div className="h-7 w-16 bg-muted rounded" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-muted" />
            </div>
            <div className="h-3 w-36 bg-muted/60 rounded" />
          </div>
        ))}
      </div>

      {/* Classes Grid Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
          <div className="h-6 w-36 bg-muted rounded" />
          <div className="flex gap-2 overflow-x-auto py-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 w-20 rounded-lg bg-muted shrink-0" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-2xl bg-card border border-border/60 p-6 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-6 w-32 bg-muted rounded" />
                  <div className="h-4 w-24 bg-muted/60 rounded" />
                </div>
                <div className="w-12 h-12 rounded-2xl bg-muted" />
              </div>
              <div className="h-4 w-full bg-muted/40 rounded mt-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
