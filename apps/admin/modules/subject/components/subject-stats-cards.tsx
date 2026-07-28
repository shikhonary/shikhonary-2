"use client"

import { Skeleton } from "@workspace/ui/components/skeleton"
import { Badge } from "@workspace/ui/components/badge"
import { BookOpen, CheckCircle2 } from "lucide-react"

interface SubjectStatsCardsProps {
  totalSubjectsCount?: number
  activeLevelsCount?: number
  activeGroupsCount?: number
  isLoading?: boolean
}

export function SubjectStatsCards({
  totalSubjectsCount = 0,
  isLoading = false,
}: SubjectStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 sm:hidden">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-md bg-surface-container-high" />
          ))}
        </div>
        <div className="hidden sm:grid grid-cols-2 gap-4 sm:gap-6 md:max-w-2xl">
          {[1, 2].map((i) => (
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
          Total Subjects: {totalSubjectsCount ?? 0}
        </Badge>
        <Badge variant="outline" className="rounded-md border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 normal-case tracking-normal">
          Status: Active
        </Badge>
      </div>

      {/* Desktop & Tablet View (>= sm): Full Cards */}
      <div className="hidden sm:grid grid-cols-2 gap-4 sm:gap-6 md:max-w-2xl">
        {/* Total Subjects */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Total Subjects
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-on-surface">
              {totalSubjectsCount ?? 0}
            </h3>
            <p className="mt-0.5 text-xs text-outline">
              All System Subjects
            </p>
          </div>
        </div>

        {/* Curriculum Status */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Curriculum Status
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-emerald-600">
              Active
            </h3>
            <p className="mt-0.5 text-xs text-outline">
              Operational
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
