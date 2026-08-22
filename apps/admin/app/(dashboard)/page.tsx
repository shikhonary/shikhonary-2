"use client"

import { StatsGrid } from "@/modules/dashboard/components/stats-grid"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-5 lg:gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Shikhonary Educational SaaS Overview</h1>
        <p className="text-muted-foreground text-sm">
          Platform-wide metrics, educational institutions, subscriptions, and administrative tools.
        </p>
      </div>

      {/* KPI Summary Cards */}
      <StatsGrid />
    </div>
  )
}
