"use client"

import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts"
import { Skeleton } from "@workspace/ui/components/skeleton"

export function PerformanceBarChart() {
  const { data: subjectPerf, isLoading } = useQuery(trpc.dashboard.getSubjectPerformance.queryOptions())

  const items = subjectPerf ?? []

  return (
    <div className="bg-card text-card-foreground border border-border rounded-xl p-4 lg:p-6 shadow-level-1">
      <div className="mb-5">
        <h3 className="text-base lg:text-lg font-bold text-foreground leading-tight">
          Subject-wise Average Score
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Across all attempted exams this term
        </p>
      </div>

      {isLoading ? (
        <div className="w-full h-52 lg:h-60 flex flex-col justify-end gap-4 p-2">
          {/* Legend skeleton */}
          <div className="flex gap-4 mb-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Skeleton className="w-2.5 h-2.5 rounded-sm shrink-0" />
                <Skeleton className="h-3.5 w-12" />
              </div>
            ))}
          </div>
          {/* Bars */}
          <div className="flex items-end justify-between h-full px-2 border-b border-border pb-2">
            <Skeleton className="w-8 sm:w-12 h-[60%] rounded-t-md shrink-0" />
            <Skeleton className="w-8 sm:w-12 h-[85%] rounded-t-md shrink-0" />
            <Skeleton className="w-8 sm:w-12 h-[45%] rounded-t-md shrink-0" />
            <Skeleton className="w-8 sm:w-12 h-[75%] rounded-t-md shrink-0" />
            <Skeleton className="w-8 sm:w-12 h-[90%] rounded-t-md shrink-0" />
          </div>
          {/* X axis labels */}
          <div className="flex justify-between px-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-3 w-8 sm:w-12 shrink-0" />
            ))}
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="w-full h-52 lg:h-60 flex flex-col items-center justify-center text-center gap-2 border border-dashed border-border rounded-lg bg-muted/20">
          <p className="text-sm font-semibold text-muted-foreground">No subject performance data available</p>
          <p className="text-xs text-muted-foreground/70">Averages will populate once students submit exams</p>
        </div>
      ) : (
        <>
          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4">
            {items.map((s) => (
              <div key={s.subject} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
                {s.subject}
              </div>
            ))}
          </div>

          <div className="w-full h-52 lg:h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={items}
                margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
                barCategoryGap="30%"
              >
                <CartesianGrid
                  vertical={false}
                  stroke="var(--border)"
                  strokeOpacity={0.5}
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="subject"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontFamily: "Plus Jakarta Sans" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontFamily: "Plus Jakarta Sans" }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}`}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.4, radius: 6 }}
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--card)",
                    color: "var(--foreground)",
                    fontSize: 12,
                    fontFamily: "Plus Jakarta Sans",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  }}
                  formatter={(value) => [`${value}%`, "Avg Score"]}
                />
                <Bar dataKey="avg" radius={[6, 6, 0, 0]} maxBarSize={44}>
                  {items.map((s, i) => (
                    <Cell key={i} fill={s.color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
