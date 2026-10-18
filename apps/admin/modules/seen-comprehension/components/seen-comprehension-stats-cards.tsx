"use client"

import { Skeleton } from "@workspace/ui/components/skeleton"
import { Badge } from "@workspace/ui/components/badge"
import { BookOpen, CheckCircle2, FileText, Layers } from "lucide-react"

interface SeenComprehensionStatsCardsProps {
  total?: number
  active?: number
  inactive?: number
  byType?: {
    seen1: number
    seen2: number
  }
  byDifficulty?: {
    easy: number
    medium: number
    hard: number
  }
  isLoading?: boolean
}

export function SeenComprehensionStatsCards({
  total = 0,
  active = 0,
  inactive = 0,
  byType = { seen1: 0, seen2: 0 },
  byDifficulty = { easy: 0, medium: 0, hard: 0 },
  isLoading = false,
}: SeenComprehensionStatsCardsProps) {
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
      {/* Mobile View (< sm): Direct Badges */}
      <div className="flex flex-wrap items-center gap-2 sm:hidden">
        <Badge variant="outline" className="rounded-md border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary normal-case tracking-normal">
          Total: {total ?? 0}
        </Badge>
        <Badge variant="outline" className="rounded-md border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 normal-case tracking-normal">
          Active: {active ?? 0}
        </Badge>
        <Badge variant="outline" className="rounded-md border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-indigo-600 normal-case tracking-normal">
          Seen 1: {byType?.seen1 ?? 0}
        </Badge>
        <Badge variant="outline" className="rounded-md border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-xs font-bold text-purple-600 normal-case tracking-normal">
          Seen 2: {byType?.seen2 ?? 0}
        </Badge>
      </div>

      {/* Desktop & Tablet View (>= sm): Full Cards */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Seen Comprehensions */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Total Comprehensions
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-on-surface">
              {total ?? 0}
            </h3>
            <p className="mt-0.5 text-xs text-outline">
              All Reading Passages
            </p>
          </div>
        </div>

        {/* Active Comprehensions */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Active Items
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-emerald-600">
              {active ?? 0}
            </h3>
            <p className="mt-0.5 text-xs text-outline">
              Live in Question Bank
            </p>
          </div>
        </div>

        {/* Seen Comprehension 1 */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 shrink-0">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Seen Comprehension 1
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-indigo-600">
              {byType?.seen1 ?? 0}
            </h3>
            <p className="mt-0.5 text-xs text-outline">
              MCQ + Short Questions
            </p>
          </div>
        </div>

        {/* Seen Comprehension 2 */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 shrink-0">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Seen Comprehension 2
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-purple-600">
              {byType?.seen2 ?? 0}
            </h3>
            <p className="mt-0.5 text-xs text-outline">
              Cloze / Flowchart / Transfer
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
