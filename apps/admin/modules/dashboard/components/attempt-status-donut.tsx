"use client"

import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Skeleton } from "@workspace/ui/components/skeleton"

export function AttemptStatusDonut() {
  const { data: attemptStatus, isLoading } = useQuery(trpc.dashboard.getAttemptStatus.queryOptions())

  const items = attemptStatus ?? []

  return (
    <div className="bg-card text-card-foreground border border-border rounded-xl p-4 lg:p-6 shadow-level-1">
      <div className="mb-5">
        <h3 className="text-base lg:text-lg font-bold text-foreground leading-tight">
          Exam Attempt Status
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Submission breakdown · last 30 days
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col sm:flex-row xl:flex-col items-center gap-5">
          {/* Circular Skeleton for Chart */}
          <div className="w-[160px] h-[160px] flex items-center justify-center shrink-0">
            <div className="w-28 h-28 rounded-full border-[12px] border-muted animate-pulse" />
          </div>
          {/* Legend Skeletons */}
          <div className="flex flex-col gap-3 w-full">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <Skeleton className="w-2.5 h-2.5 rounded-full shrink-0" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="h-[200px] flex flex-col items-center justify-center text-center gap-2 border border-dashed border-border rounded-lg bg-muted/20 p-4">
          <p className="text-sm font-semibold text-muted-foreground">No attempts found</p>
          <p className="text-xs text-muted-foreground/70">Metrics appear here once exams start</p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row xl:flex-col items-center gap-5">
          {/* Donut chart */}
          <div className="w-full max-w-[180px] sm:max-w-[160px] xl:max-w-[180px] h-[160px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={items}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="55%"
                  outerRadius="80%"
                  paddingAngle={3}
                  startAngle={90}
                  endAngle={-270}
                >
                  {items.map((s, i) => (
                    <Cell key={i} fill={s.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--card)",
                    color: "var(--foreground)",
                    fontSize: 12,
                    fontFamily: "Plus Jakarta Sans",
                  }}
                  formatter={(value) => [`${value}%`, "Share"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-3 w-full">
            {items.map((s) => (
              <div key={s.name} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-sm text-muted-foreground font-medium truncate">{s.name}</span>
                </div>
                <span
                  className="text-sm font-bold font-mono tabular-nums shrink-0"
                  style={{ color: s.color }}
                >
                  {s.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
