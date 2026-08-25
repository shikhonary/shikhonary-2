"use client"

import { Skeleton } from "@workspace/ui/components/skeleton"
import { Badge } from "@workspace/ui/components/badge"
import { ClipboardList, Calculator, CheckCircle2, AlertCircle } from "lucide-react"

interface McqStatsCardsProps {
  totalCount?: number
  activeCount?: number
  inactiveCount?: number
  mathCount?: number
  typeCounts?: Record<string, number>
  isLoading?: boolean
}

export function McqStatsCards({
  totalCount = 0,
  activeCount = 0,
  inactiveCount = 0,
  mathCount = 0,
  isLoading = false,
}: McqStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 sm:hidden">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-md bg-surface-container-high" />
          ))}
        </div>
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
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
          Total: {totalCount ?? 0}
        </Badge>
        <Badge variant="outline" className="rounded-md border-secondary/20 bg-secondary/10 px-3 py-1.5 text-xs font-bold text-secondary normal-case tracking-normal">
          Math: {mathCount ?? 0}
        </Badge>
        <Badge variant="outline" className="rounded-md border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 normal-case tracking-normal">
          Active: {activeCount ?? 0}
        </Badge>
        <Badge variant="outline" className="rounded-md border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-600 normal-case tracking-normal">
          Inactive: {inactiveCount ?? 0}
        </Badge>
      </div>

      {/* Desktop & Tablet View (>= sm): Full Cards */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total MCQs */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Total MCQs
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-on-surface">
              {totalCount ?? 0}
            </h3>
            <p className="mt-0.5 text-xs text-outline">
              All Question Bank
            </p>
          </div>
        </div>

        {/* Math Questions */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary shrink-0">
            <Calculator className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Math Questions
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-on-surface">
              {mathCount ?? 0}
            </h3>
            <p className="mt-0.5 text-xs text-outline">
              LaTeX Enabled
            </p>
          </div>
        </div>

        {/* Active MCQs */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Active MCQs
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-emerald-600">
              {activeCount ?? 0}
            </h3>
            <p className="mt-0.5 text-xs text-outline">
              Published & Live
            </p>
          </div>
        </div>

        {/* Inactive MCQs */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Inactive / Drafts
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-amber-600">
              {inactiveCount ?? 0}
            </h3>
            <p className="mt-0.5 text-xs text-outline">
              Hidden from Exams
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
