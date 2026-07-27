"use client"

import { Skeleton } from "@workspace/ui/components/skeleton"
import { Badge } from "@workspace/ui/components/badge"
import { School, CheckCircle2, XCircle } from "lucide-react"

interface AcademicClassStatsCardsProps {
  totalClassesCount?: number
  activeClassesCount?: number
  inactiveClassesCount?: number
  isLoading?: boolean
}

export function AcademicClassStatsCards({
  totalClassesCount = 0,
  activeClassesCount = 0,
  inactiveClassesCount = 0,
  isLoading = false,
}: AcademicClassStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 sm:hidden">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-md bg-surface-container-high" />
          ))}
        </div>
        <div className="hidden sm:grid grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl bg-surface-container-high" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      {/* Mobile View (< sm): Direct Shadcn UI Badges */}
      <div className="flex flex-wrap items-center gap-2 sm:hidden">
        <Badge variant="outline" className="rounded-md border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary normal-case tracking-normal">
          Total: {totalClassesCount ?? 0}
        </Badge>
        <Badge variant="outline" className="rounded-md border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 normal-case tracking-normal">
          Active: {activeClassesCount ?? 0}
        </Badge>
        <Badge variant="outline" className="rounded-md border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-600 normal-case tracking-normal">
          Inactive: {inactiveClassesCount ?? 0}
        </Badge>
      </div>

      {/* Desktop & Tablet View (>= sm): Full Cards */}
      <div className="hidden sm:grid grid-cols-3 gap-4 sm:gap-6">
        {/* Total Classes */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <School className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Total Classes
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-on-surface">
              {totalClassesCount ?? 0}
            </h3>
            <p className="mt-0.5 text-xs text-outline">
              All System Classes
            </p>
          </div>
        </div>

        {/* Active Classes */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Active Classes
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-emerald-600">
              {activeClassesCount ?? 0}
            </h3>
            <p className="mt-0.5 text-xs text-outline">
              Operational
            </p>
          </div>
        </div>

        {/* Inactive Classes */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Inactive Classes
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-amber-600">
              {inactiveClassesCount ?? 0}
            </h3>
            <p className="mt-0.5 text-xs text-outline">
              Disabled / Archival
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}



