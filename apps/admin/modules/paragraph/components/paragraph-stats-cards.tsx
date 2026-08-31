"use client"

import { Skeleton } from "@workspace/ui/components/skeleton"
import { Badge } from "@workspace/ui/components/badge"
import { ClipboardList, BarChart2 } from "lucide-react"

interface ParagraphStatsCardsProps {
  totalCount?: number
  difficultyCounts?: {
    EASY: number
    MEDIUM: number
    HARD: number
  }
  isLoading?: boolean
}

export function ParagraphStatsCards({
  totalCount = 0,
  difficultyCounts = { EASY: 0, MEDIUM: 0, HARD: 0 },
  isLoading = false,
}: ParagraphStatsCardsProps) {
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
          Easy: {difficultyCounts?.EASY ?? 0}
        </Badge>
        <Badge variant="outline" className="rounded-md border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-600 normal-case tracking-normal">
          Medium: {difficultyCounts?.MEDIUM ?? 0}
        </Badge>
        <Badge variant="outline" className="rounded-md border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-600 normal-case tracking-normal">
          Hard: {difficultyCounts?.HARD ?? 0}
        </Badge>
      </div>

      {/* Desktop & Tablet View (>= sm): Full Cards */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Paragraphs */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Total Paragraphs
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-on-surface">
              {totalCount ?? 0}
            </h3>
            <p className="mt-0.5 text-xs text-outline">
              Comprehensions Bank
            </p>
          </div>
        </div>

        {/* Easy Paragraphs */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
            <BarChart2 className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Easy Difficulty
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-emerald-600">
              {difficultyCounts?.EASY ?? 0}
            </h3>
            <p className="mt-0.5 text-xs text-outline">
              Simple comprehensions
            </p>
          </div>
        </div>

        {/* Medium Paragraphs */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
            <BarChart2 className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Medium Difficulty
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-amber-600">
              {difficultyCounts?.MEDIUM ?? 0}
            </h3>
            <p className="mt-0.5 text-xs text-outline">
              Average difficulty
            </p>
          </div>
        </div>

        {/* Hard Paragraphs */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-600 shrink-0">
            <BarChart2 className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Hard Difficulty
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-red-600">
              {difficultyCounts?.HARD ?? 0}
            </h3>
            <p className="mt-0.5 text-xs text-outline">
              Complex comprehensions
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
