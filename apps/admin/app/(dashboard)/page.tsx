"use client"

import { StatsGrid } from "@/modules/dashboard/components/stats-grid"
import { PerformanceBarChart } from "@/modules/dashboard/components/performance-bar-chart"
import { AttemptStatusDonut } from "@/modules/dashboard/components/attempt-status-donut"
import { CohortDistribution } from "@/modules/dashboard/components/cohort-distribution"
import { ProctoringFlags } from "@/modules/dashboard/components/proctoring-flags"
import { MeritList } from "@/modules/dashboard/components/merit-list"
import { RecentAttempts } from "@/modules/dashboard/components/recent-attempts"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-5 lg:gap-6">
      {/* ── Row 1: KPI Summary Cards ── */}
      <StatsGrid />

      {/*
       * ── Row 2: Main content canvas ──
       *
       * Mobile (< xl):  Single column — each widget stacks vertically in reading order:
       *   PerformanceBarChart → AttemptStatusDonut → CohortDistribution →
       *   ProctoringFlags → MeritList → RecentAttempts
       *
       * Desktop (≥ xl): 3-column grid
       *   Left col  (col-span-2): PerformanceBarChart, MeritList, RecentAttempts
       *   Right col (col-span-1): AttemptStatusDonut, CohortDistribution, ProctoringFlags
       *
       * The sidebar widgets are pulled to the top on mobile via `order` utilities so
       * the status donut and proctoring flags aren't buried below the large tables.
       */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 lg:gap-6 items-start">

        {/* ─ Sidebar column (on mobile: shown after bar chart, before tables) ─ */}
        <div className="xl:col-span-1 xl:row-start-1 flex flex-col gap-5 lg:gap-6 order-2 xl:order-last">
          <AttemptStatusDonut />
          <CohortDistribution />
          <ProctoringFlags />
        </div>

        {/* ─ Primary column (bar chart + tables) ─ */}
        <div className="xl:col-span-2 xl:row-start-1 flex flex-col gap-5 lg:gap-6 order-1">
          <PerformanceBarChart />
          <MeritList />
          <RecentAttempts />
        </div>

      </div>
    </div>
  )
}
