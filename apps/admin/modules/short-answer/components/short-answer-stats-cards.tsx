"use client"

import { Skeleton } from "@workspace/ui/components/skeleton"
import { Badge } from "@workspace/ui/components/badge"
import { ClipboardList, CheckCircle2, AlertCircle, BarChart2 } from "lucide-react"

interface ShortAnswerStatsCardsProps {
  totalCount?: number
  activeCount?: number
  inactiveCount?: number
  difficultyCounts?: {
    easy: number
    medium: number
    hard: number
  }
  isLoading?: boolean
}

export function ShortAnswerStatsCards({
  totalCount = 0,
  activeCount = 0,
  inactiveCount = 0,
  difficultyCounts = { easy: 0, medium: 0, hard: 0 },
  isLoading = false,
}: ShortAnswerStatsCardsProps) {
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
        <Badge variant="outline" className="rounded-md border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 normal-case tracking-normal">
          Active: {activeCount ?? 0}
        </Badge>
        <Badge variant="outline" className="rounded-md border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-600 normal-case tracking-normal">
          Inactive: {inactiveCount ?? 0}
        </Badge>
        <Badge variant="outline" className="rounded-md border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-600 normal-case tracking-normal">
          Medium: {difficultyCounts?.medium ?? 0}
        </Badge>
      </div>

      {/* Desktop & Tablet View (>= sm): Full Cards */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total SAs */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Total SAs
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-on-surface">
              {totalCount ?? 0}
            </h3>
            <p className="mt-0.5 text-xs text-outline">
              All Question Bank
            </p>
          </div>
        </div>

        {/* Active SAs */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Active SAs
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-emerald-600">
              {activeCount ?? 0}
            </h3>
            <p className="mt-0.5 text-xs text-outline">
              Published & Live
            </p>
          </div>
        </div>

        {/* Inactive SAs */}
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

        {/* Difficulty Breakdown */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 shrink-0">
            <BarChart2 className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Difficulty Levels
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-bold text-emerald-600">{difficultyCounts?.easy}E</span>
              <span className="text-sm font-bold text-amber-600">{difficultyCounts?.medium}M</span>
              <span className="text-xs font-bold text-red-600">{difficultyCounts?.hard}H</span>
            </div>
            <p className="mt-0.5 text-xs text-outline">
              Easy, Medium, Hard
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
