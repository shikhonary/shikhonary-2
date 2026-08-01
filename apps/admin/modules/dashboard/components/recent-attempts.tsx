"use client"

import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { Clock } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Skeleton } from "@workspace/ui/components/skeleton"

const statusStyle: Record<string, string> = {
  Submitted: "bg-emerald-500/10 text-emerald-700 border-emerald-400/30",
  "In Progress": "bg-amber-500/10 text-amber-700 border-amber-400/30",
  "Auto-Submitted": "bg-blue-500/10 text-blue-700 border-blue-400/30",
  Abandoned: "bg-destructive/10 text-destructive border-destructive/20",
}

const cardAccent: Record<string, string> = {
  Submitted: "border-l-emerald-500",
  "In Progress": "border-l-amber-500",
  "Auto-Submitted": "border-l-blue-500",
  Abandoned: "border-l-destructive",
}

export function RecentAttempts() {
  const { data: recentAttempts, isLoading } = useQuery(trpc.dashboard.getRecentAttempts.queryOptions())

  const items = recentAttempts ?? []

  return (
    <div className="bg-card text-card-foreground border border-border rounded-xl p-4 lg:p-6 shadow-level-1 overflow-hidden">
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-base lg:text-lg font-bold text-foreground leading-tight">
          Recent Exam Attempts
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Live submission feed and active sessions
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {/* Header skeleton */}
          <div className="hidden sm:grid grid-cols-5 gap-4 pb-2 border-b border-border">
            <Skeleton className="h-4 w-20 shrink-0" />
            <Skeleton className="h-4 w-32 shrink-0" />
            <Skeleton className="h-4 w-16 shrink-0" />
            <Skeleton className="h-4 w-12 shrink-0" />
            <Skeleton className="h-4 w-16 shrink-0 text-right ml-auto" />
          </div>
          {/* Rows */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex sm:grid sm:grid-cols-5 items-center gap-4 py-2.5 border-b border-border/40 last:border-0">
              {/* Student */}
              <div className="flex-1 sm:col-span-1 min-w-0">
                <Skeleton className="h-4 w-28 sm:w-24 shrink-0" />
              </div>
              {/* Exam */}
              <div className="hidden sm:block sm:col-span-1">
                <Skeleton className="h-4 w-36 shrink-0" />
              </div>
              {/* Status */}
              <div className="sm:col-span-1">
                <Skeleton className="h-5 w-20 rounded-full shrink-0" />
              </div>
              {/* Score */}
              <div className="sm:col-span-1">
                <Skeleton className="h-4 w-10 shrink-0" />
              </div>
              {/* Time */}
              <div className="hidden md:block md:col-span-1 text-right">
                <Skeleton className="h-4 w-16 shrink-0 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center gap-2 border border-dashed border-border rounded-lg bg-muted/20">
          <p className="text-sm font-semibold text-muted-foreground">No recent attempts found</p>
          <p className="text-xs text-muted-foreground/70">Candidate attempts will show up here live</p>
        </div>
      ) : (
        <>
          {/* ── Mobile card list (hidden on sm+) ── */}
          <div className="flex flex-col gap-3 sm:hidden">
            {items.map((a, i) => {
              const statusCls = statusStyle[a.status] ?? "bg-muted text-muted-foreground border-border"
              const accentCls = cardAccent[a.status] ?? "border-l-border"
              return (
                <div
                  key={i}
                  className={`flex flex-col gap-2 p-3 rounded-xl border border-border border-l-4 ${accentCls} bg-muted/30`}
                >
                  {/* Row 1: student name + time */}
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-foreground leading-tight">{a.student}</p>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-mono shrink-0 ${a.tabSwitches > 0 ? "text-destructive font-bold" : "text-muted-foreground"}`}>
                      <Clock className="h-3 w-3" />
                      {a.last}
                    </span>
                  </div>
                  {/* Row 2: exam name */}
                  <p className="text-[12px] text-muted-foreground leading-snug">{a.exam}</p>
                  {/* Row 3: status badge + score + tab-switch warning */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-bold rounded-full border ${statusCls}`}>
                      {a.status}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      {a.tabSwitches > 0 && (
                        <span className="text-[11px] font-bold font-mono text-destructive bg-destructive/10 border border-destructive/20 px-2 py-0.5 rounded-full">
                          ⚠ {a.tabSwitches} switches
                        </span>
                      )}
                      <span className="text-sm font-extrabold font-mono tabular-nums text-foreground">
                        {a.score !== null ? `${a.score}%` : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Desktop table (hidden below sm) ── */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-xs">Student</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Exam</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Score</TableHead>
                  <TableHead className="text-xs hidden md:table-cell text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((a, i) => {
                  const statusCls = statusStyle[a.status] ?? "bg-muted text-muted-foreground border-border"
                  return (
                    <TableRow key={i} className="hover:bg-muted/40 transition-colors border-border">
                      <TableCell className="py-3">
                        <p className="text-sm font-bold text-foreground leading-tight">{a.student}</p>
                      </TableCell>
                      <TableCell className="py-3 hidden sm:table-cell">
                        <p className="text-sm text-muted-foreground font-medium leading-tight">{a.exam}</p>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold rounded-full border ${statusCls}`}>
                          {a.status}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="font-mono text-sm font-bold tabular-nums">
                          {a.score !== null ? `${a.score}%` : "—"}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 hidden md:table-cell text-right">
                        <span className={`inline-flex items-center gap-1 text-xs font-mono ${a.tabSwitches > 0 ? "text-destructive font-bold" : "text-muted-foreground"}`}>
                          <Clock className="h-3 w-3" />
                          {a.last}
                          {a.tabSwitches > 0 && (
                            <span className="ml-1">· {a.tabSwitches}⚠</span>
                          )}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  )
}
