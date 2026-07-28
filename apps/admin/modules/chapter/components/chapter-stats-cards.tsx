"use client"

import { Skeleton } from "@workspace/ui/components/skeleton"
import { Badge } from "@workspace/ui/components/badge"
import { BookOpen, CheckCircle2, Bookmark } from "lucide-react"

interface ChapterStatsCardsProps {
  totalChaptersCount?: number
  activeSubjectsCount?: number
  isLoading?: boolean
}

export function ChapterStatsCards({
  totalChaptersCount = 0,
  activeSubjectsCount = 0,
  isLoading = false,
}: ChapterStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 sm:hidden">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-md bg-surface-container-high" />
          ))}
        </div>
        <div className="hidden sm:grid grid-cols-3 gap-4 sm:gap-6 md:max-w-4xl">
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
          Total Chapters: {totalChaptersCount}
        </Badge>
        <Badge variant="outline" className="rounded-md border-secondary/20 bg-secondary/10 px-3 py-1.5 text-xs font-bold text-secondary normal-case tracking-normal">
          Active Subjects: {activeSubjectsCount}
        </Badge>
        <Badge variant="outline" className="rounded-md border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 normal-case tracking-normal">
          Coverage: Configured
        </Badge>
      </div>

      {/* Desktop & Tablet View (>= sm): Full Cards */}
      <div className="hidden sm:grid grid-cols-3 gap-4 sm:gap-6 md:max-w-4xl">
        {/* Total Chapters */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Bookmark className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Total Chapters
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-on-surface">
              {totalChaptersCount}
            </h3>
            <p className="mt-0.5 text-xs text-outline">
              All Configured Chapters
            </p>
          </div>
        </div>

        {/* Active Subjects */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary shrink-0">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Active Subjects
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-on-surface">
              {activeSubjectsCount}
            </h3>
            <p className="mt-0.5 text-xs text-outline">
              Subjects with Chapters
            </p>
          </div>
        </div>

        {/* Coverage Status */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Chapter Coverage
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-emerald-600">
              Configured
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
