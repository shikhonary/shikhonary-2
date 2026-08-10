"use client"

import { StatsGrid } from "@/modules/dashboard/components/stats-grid"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-5 lg:gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Union Porishod SaaS Overview</h1>
        <p className="text-muted-foreground text-sm">
          Platform-wide metrics, tenants, subscriptions, and administrative tools.
        </p>
      </div>

      {/* KPI Summary Cards */}
      <StatsGrid />
    </div>
  )
}
