"use client"

import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { ChevronRight } from "lucide-react"
import { BubbleGrid } from "./bubble-grid"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Skeleton } from "@workspace/ui/components/skeleton"

const rankMedal = (rank: number) => {
  if (rank === 1) return "🥇"
  if (rank === 2) return "🥈"
  if (rank === 3) return "🥉"
  return null
}

const gradeColor = (pct: number): string => {
  if (pct >= 90) return "bg-emerald-500/10 text-emerald-700 border-emerald-400/30"
  if (pct >= 80) return "bg-primary/10 text-primary border-primary/20"
  return "bg-muted text-muted-foreground border-border"
}

export function MeritList() {
  const { data: meritList, isLoading } = useQuery(trpc.dashboard.getMeritList.queryOptions())

  const items = meritList ?? []

  return (
    <div className="bg-card text-card-foreground border border-border rounded-xl p-4 lg:p-6 shadow-level-1 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base lg:text-lg font-bold text-foreground leading-tight">
            HSC Model Test · Series 3 Merit List
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Live leaderboard sorted by cumulative marks percentage
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-1 text-xs font-semibold text-primary border border-primary/20 hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors shrink-0 self-start sm:self-auto"
        >
          Full Results <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {/* Header skeleton */}
          <div className="hidden sm:grid grid-cols-7 gap-4 pb-2 border-b border-border">
            <Skeleton className="h-4 w-8 shrink-0" />
            <Skeleton className="h-4 w-24 shrink-0" />
            <Skeleton className="h-4 w-12 shrink-0" />
            <Skeleton className="h-4 w-12 shrink-0" />
            <Skeleton className="h-4 w-16 shrink-0" />
            <Skeleton className="h-4 w-16 shrink-0" />
            <Skeleton className="h-4 w-12 shrink-0 text-right ml-auto" />
          </div>
          {/* Rows */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex sm:grid sm:grid-cols-7 items-center gap-4 py-2.5 border-b border-border/40 last:border-0">
              {/* Rank */}
              <div className="sm:col-span-1 shrink-0">
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
              {/* Student */}
              <div className="flex-1 sm:col-span-1 min-w-0 space-y-1.5">
                <Skeleton className="h-4 w-28 sm:w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              {/* Marks */}
              <div className="hidden sm:block sm:col-span-1">
                <Skeleton className="h-4 w-12 shrink-0" />
              </div>
              {/* Score */}
              <div className="sm:col-span-1">
                <Skeleton className="h-4 w-10 shrink-0" />
              </div>
              {/* Grade */}
              <div className="hidden md:block md:col-span-1">
                <Skeleton className="h-5 w-16 rounded-full shrink-0" />
              </div>
              {/* OMR (BubbleGrid) */}
              <div className="hidden lg:block lg:col-span-1">
                <Skeleton className="h-4 w-20 shrink-0" />
              </div>
              {/* Exams */}
              <div className="hidden xl:block xl:col-span-1 text-right">
                <Skeleton className="h-4 w-8 shrink-0 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center gap-2 border border-dashed border-border rounded-lg bg-muted/20">
          <p className="text-sm font-semibold text-muted-foreground">No merit results calculated yet</p>
          <p className="text-xs text-muted-foreground/70">Calculated ranking lists will appear here</p>
        </div>
      ) : (
        <>
          {/* ── Mobile card list (hidden on sm+) ── */}
          <div className="flex flex-col gap-3 sm:hidden">
            {items.map((m) => (
              <div
                key={m.rank}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                {/* Rank badge */}
                <div className="shrink-0 w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center">
                  {rankMedal(m.rank) ? (
                    <span className="text-lg leading-none">{rankMedal(m.rank)}</span>
                  ) : (
                    <span className="text-xs font-extrabold font-mono text-muted-foreground">#{m.rank}</span>
                  )}
                </div>

                {/* Name + roll */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground leading-tight truncate">{m.name}</p>
                  <p className="text-[11px] font-mono text-muted-foreground mt-0.5">Roll {m.roll} · {m.cls}</p>
                </div>

                {/* Score + grade */}
                <div className="shrink-0 text-right flex flex-col items-end gap-1">
                  <span className="text-sm font-extrabold font-mono tabular-nums text-foreground">
                    {m.pct}%
                  </span>
                  <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold rounded-full border ${gradeColor(m.pct)}`}>
                    {m.grade} · {m.gpa.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Desktop table (hidden below sm) ── */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="w-14 text-xs">Rank</TableHead>
                  <TableHead className="text-xs">Student</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Marks</TableHead>
                  <TableHead className="text-xs">Score</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Grade</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">OMR</TableHead>
                  <TableHead className="text-xs hidden xl:table-cell text-right">Exams</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((m) => (
                  <TableRow key={m.rank} className="hover:bg-muted/40 transition-colors border-border">
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1.5">
                        {rankMedal(m.rank) ? (
                          <span className="text-base leading-none">{rankMedal(m.rank)}</span>
                        ) : (
                          <span className="text-sm font-bold font-mono text-muted-foreground">#{m.rank}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <p className="text-sm font-bold text-foreground leading-tight">{m.name}</p>
                      <p className="text-[11px] font-mono text-muted-foreground mt-0.5">Roll {m.roll}</p>
                    </TableCell>
                    <TableCell className="py-3 hidden sm:table-cell font-mono text-sm tabular-nums">
                      {m.obtained}/{m.total}
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="font-mono text-sm font-bold tabular-nums">{m.pct}%</span>
                    </TableCell>
                    <TableCell className="py-3 hidden md:table-cell">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold rounded-full border ${gradeColor(m.pct)}`}>
                        {m.grade} · {m.gpa.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 hidden lg:table-cell">
                      <BubbleGrid
                        pct={m.pct}
                        cols={5}
                        rows={2}
                        size={6}
                        gap={2.5}
                        fill={m.pct >= 90 ? "#1e9e6b" : "var(--primary)"}
                      />
                    </TableCell>
                    <TableCell className="py-3 hidden xl:table-cell text-right font-mono text-xs text-muted-foreground">
                      {m.attempted}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  )
}
