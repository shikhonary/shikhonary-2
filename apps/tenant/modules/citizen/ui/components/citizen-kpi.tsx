"use client"

import { Users, UserCheck, UserPlus } from "lucide-react"

interface CitizenKpiProps {
  totalCount: number
  permanentCount: number
  temporaryCount: number
}

export function CitizenKpi({
  totalCount,
  permanentCount,
  temporaryCount,
}: CitizenKpiProps) {
  return (
    <div className="mb-6 font-body">
      {/* Mobile View (< sm): Compact Badges */}
      <div className="flex flex-wrap items-center gap-2 sm:hidden">
        <div className="px-3 py-1.5 text-xs font-bold rounded-md border border-primary/20 bg-primary/10 text-primary">
          মোট নাগরিক: {totalCount}
        </div>
        <div className="px-3 py-1.5 text-xs font-bold rounded-md border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450">
          স্থায়ী বাসিন্দা: {permanentCount}
        </div>
        <div className="px-3 py-1.5 text-xs font-bold rounded-md border border-yellow-500/20 bg-yellow-500/10 text-yellow-600 dark:text-yellow-450">
          অস্থায়ী বাসিন্দা: {temporaryCount}
        </div>
      </div>

      {/* Desktop & Tablet View (>= sm): Cards Layout */}
      <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Citizens */}
        <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              মোট নিবন্ধিত নাগরিক
            </p>
            <h3 className="text-2xl font-bold text-foreground mt-0.5">
              {totalCount} জন
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              ইউনিয়নের সর্বমোট নাগরিক
            </p>
          </div>
        </div>

        {/* Permanent Citizens */}
        <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              স্থায়ী বাসিন্দা
            </p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-0.5">
              {permanentCount} জন
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              ইউনিয়নের স্থায়ী বাসিন্দা
            </p>
          </div>
        </div>

        {/* Temporary Citizens */}
        <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-450 shrink-0">
            <UserPlus className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              অস্থায়ী বাসিন্দা
            </p>
            <h3 className="text-2xl font-bold text-yellow-600 mt-0.5">
              {temporaryCount} জন
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              অন্যান্য ইউনিয়ন/সাময়িক বাসিন্দা
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
