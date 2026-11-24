import React from "react"

export default function ClassDetailLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl space-y-8 animate-pulse w-full min-w-0">
      {/* Header skeleton with back button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-muted shrink-0" />
          <div className="space-y-2">
            <div className="h-8 w-48 rounded-lg bg-muted" />
            <div className="h-4 w-72 max-w-full rounded bg-muted/60" />
          </div>
        </div>
        <div className="h-10 w-full sm:w-64 rounded-xl bg-muted/70" />
      </div>

      {/* 3 KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-card border border-border/60 p-5 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-3.5 w-24 bg-muted rounded" />
                <div className="h-7 w-16 bg-muted rounded" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-muted" />
            </div>
            <div className="h-3 w-36 bg-muted/60 rounded" />
          </div>
        ))}
      </div>

      {/* Subjects Grid Section */}
      <div className="space-y-4">
        <div className="h-6 w-36 bg-muted rounded" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-44 rounded-2xl bg-card border border-border/60 p-6 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-6 w-36 bg-muted rounded" />
                  <div className="h-4 w-28 bg-muted/60 rounded" />
                </div>
                <div className="w-11 h-11 rounded-2xl bg-muted" />
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border/40">
                <div className="h-4 w-20 bg-muted/50 rounded" />
                <div className="h-8 w-28 bg-muted rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
