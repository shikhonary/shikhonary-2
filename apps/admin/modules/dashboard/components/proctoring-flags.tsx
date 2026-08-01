"use client"

import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { ShieldAlert, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Skeleton } from "@workspace/ui/components/skeleton"

const severityColor = (switches: number) => {
  if (switches >= 5) return { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20" }
  if (switches >= 2) return { bg: "bg-orange-500/10", text: "text-orange-600", border: "border-orange-400/20" }
  return { bg: "bg-yellow-500/10", text: "text-yellow-600", border: "border-yellow-400/20" }
}

export function ProctoringFlags() {
  const { data: proctoringFlags, isLoading } = useQuery(trpc.dashboard.getProctoringFlags.queryOptions())

  const items = proctoringFlags ?? [
    { student: "Imran Kabir", exam: "HSC Model Test — Series 3", tabSwitches: 3, status: "In Progress" },
    { student: "Nusrat Jahan", exam: "Chemistry — Bonding MCQ", tabSwitches: 1, status: "Auto-Submitted" },
    { student: "Tanvir Ahmed", exam: "HSC Model Test — Series 3", tabSwitches: 6, status: "Abandoned" },
  ]

  return (
    <div className="bg-card text-card-foreground border border-border rounded-xl p-4 lg:p-6 shadow-level-1">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base lg:text-lg font-bold text-foreground leading-tight">
            Proctoring Flags
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Active focus-loss warnings
          </p>
        </div>
        {isLoading ? (
          <Skeleton className="h-6 w-16 rounded-full" />
        ) : (
          <span className="flex items-center gap-1 text-xs font-bold text-destructive bg-destructive/10 border border-destructive/20 rounded-full px-2.5 py-1">
            <ShieldAlert className="h-3 w-3" />
            {items.length} active
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-muted/30"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              <Skeleton className="h-6 w-8 rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((f, i) => {
            const c = severityColor(f.tabSwitches)
            return (
              <div
                key={i}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-muted/30"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`h-8 w-8 rounded-full ${c.bg} text-destructive flex items-center justify-center shrink-0`}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{f.student}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{f.exam}</p>
                  </div>
                </div>
                <span className={`shrink-0 text-xs font-bold font-mono px-2.5 py-1 rounded-full border ${c.bg} ${c.text} ${c.border}`}>
                  {f.tabSwitches}×
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* All-clear state (shown when no flags) */}
      {!isLoading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
          <p className="text-sm font-semibold text-muted-foreground">All clear — no flags</p>
        </div>
      )}
    </div>
  )
}
