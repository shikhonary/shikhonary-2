"use client"

import { Skeleton } from "@workspace/ui/components/skeleton"
import { Badge } from "@workspace/ui/components/badge"
import { Users, BookOpen, Contact } from "lucide-react"

interface StudentStatsCardsProps {
  totalStudentsCount?: number
  offlineStudentsCount?: number
  onlineStudentsCount?: number
  linkedStudentsCount?: number
  isLoading?: boolean
}

export function StudentStatsCards({
  totalStudentsCount = 0,
  offlineStudentsCount = 0,
  onlineStudentsCount = 0,
  linkedStudentsCount = 0,
  isLoading = false,
}: StudentStatsCardsProps) {
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
      {/* Mobile View */}
      <div className="flex flex-wrap items-center gap-2 sm:hidden">
        <Badge variant="outline" className="rounded-md border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary normal-case tracking-normal">
          Total: {totalStudentsCount}
        </Badge>
        <Badge variant="outline" className="rounded-md border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-600 normal-case tracking-normal">
          Offline: {offlineStudentsCount}
        </Badge>
        <Badge variant="outline" className="rounded-md border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 normal-case tracking-normal">
          Online: {onlineStudentsCount}
        </Badge>
      </div>

      {/* Desktop/Tablet view */}
      <div className="hidden sm:grid grid-cols-3 gap-4 sm:gap-6">
        {/* Total Students */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Total Enrolled
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-on-surface">
              {totalStudentsCount}
            </h3>
            <p className="mt-0.5 text-xs text-outline">
              {linkedStudentsCount} Linked Users
            </p>
          </div>
        </div>

        {/* Offline Students */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Offline Students
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-amber-600">
              {offlineStudentsCount}
            </h3>
            <p className="mt-0.5 text-xs text-outline">
              Physical Batch
            </p>
          </div>
        </div>

        {/* Online Students */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
            <Contact className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              Online Students
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-emerald-600">
              {onlineStudentsCount}
            </h3>
            <p className="mt-0.5 text-xs text-outline">
              App Access batch
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
