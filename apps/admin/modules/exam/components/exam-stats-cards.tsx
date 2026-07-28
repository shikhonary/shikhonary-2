"use client"

import { Skeleton } from "@workspace/ui/components/skeleton"
import { Badge } from "@workspace/ui/components/badge"
import { ClipboardList, CheckCircle2, Clock, Archive } from "lucide-react"

interface ExamStatsCardsProps {
  totalCount?: number
  statusCounts?: Record<string, number>
  typeCounts?: Record<string, number>
  isLoading?: boolean
}

export function ExamStatsCards({
  totalCount = 0,
  statusCounts = {},
  typeCounts = {},
  isLoading = false,
}: ExamStatsCardsProps) {
  const publishedCount = statusCounts["Published"] ?? 0
  const pendingCount = statusCounts["Pending"] ?? 0
  const archivedCount = statusCounts["Archived"] ?? 0

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
          Total: {totalCount}
        </Badge>
        <Badge variant="outline" className="rounded-md border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 normal-case tracking-normal">
          Active: {publishedCount}
        </Badge>
        <Badge variant="outline" className="rounded-md border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-600 normal-case tracking-normal">
          Pending: {pendingCount}
        </Badge>
        <Badge variant="outline" className="rounded-md border-outline-variant bg-surface-container-low px-3 py-1.5 text-xs font-bold text-on-surface-variant normal-case tracking-normal">
          Archived: {archivedCount}
        </Badge>
      </div>

      {/* Desktop & Tablet View (>= sm): Full Cards */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Exams */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Total Exams
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-on-surface">
              {totalCount}
            </h3>
            <p className="mt-0.5 text-xs text-outline">
              Configured in system
            </p>
          </div>
        </div>

        {/* Published Exams */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Published & Active
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-emerald-600">
              {publishedCount}
            </h3>
            <p className="mt-0.5 text-xs text-outline">
              Available to students
            </p>
          </div>
        </div>

        {/* Pending Exams */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Draft / Pending
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-amber-600">
              {pendingCount}
            </h3>
            <p className="mt-0.5 text-xs text-outline">
              In prep or scheduled
            </p>
          </div>
        </div>

        {/* Archived Exams */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-high text-on-surface-variant shrink-0">
            <Archive className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Archived
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-on-surface-variant">
              {archivedCount}
            </h3>
            <p className="mt-0.5 text-xs text-outline">
              Past assessments
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
