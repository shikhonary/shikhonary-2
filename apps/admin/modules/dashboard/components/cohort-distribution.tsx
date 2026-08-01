"use client"

import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { Skeleton } from "@workspace/ui/components/skeleton"

export function CohortDistribution() {
  const { data: distribution, isLoading } = useQuery(trpc.dashboard.getCohortDistribution.queryOptions())

  const items = distribution ?? [
    { name: "SSC 2027", students: 412, color: "#af101a" },
    { name: "HSC 1st Yr", students: 356, color: "#2b6485" },
    { name: "HSC 2nd Yr", students: 298, color: "#2e5f61" },
    { name: "Admission Prep", students: 184, color: "#8f6f6c" },
  ]

  const totalStudents = items.reduce((sum, item) => sum + item.students, 0)

  return (
    <div className="bg-card text-card-foreground border border-border rounded-xl p-4 lg:p-6 shadow-level-1">
      <div className="mb-5">
        <h3 className="text-base lg:text-lg font-bold text-foreground leading-tight">
          Students by Cohort
        </h3>
        <div className="text-xs text-muted-foreground mt-0.5">
          {isLoading ? (
            <Skeleton className="h-3 w-40 mt-1" />
          ) : (
            `${totalStudents.toLocaleString()} total students across academic cohorts`
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 flex-1">
                  <Skeleton className="w-2 h-2 rounded-full shrink-0" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-3.5 w-16" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((c) => {
            const pct = totalStudents > 0 ? Math.round((c.students / totalStudents) * 100) : 0
            return (
              <div key={c.name}>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="text-sm font-semibold text-foreground truncate">{c.name}</span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground tabular-nums shrink-0 ml-2">
                    {c.students.toLocaleString()} · {pct}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: c.color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Total summary row */}
      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Total</span>
        {isLoading ? (
          <Skeleton className="h-5 w-16" />
        ) : (
          <span className="text-sm font-extrabold font-mono text-foreground">
            {totalStudents.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  )
}
