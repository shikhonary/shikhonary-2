"use client"

import React from "react"
import { trpc } from "@/trpc/client"
import { useQuery } from "@tanstack/react-query"
import { DashboardHero } from "../components/dashboard-hero"
import { DashboardStatCards } from "../components/dashboard-stat-cards"
import { RecentQuestionPapers } from "../components/recent-question-papers"
import { ClassDistributionChart } from "../components/class-distribution-chart"
import { CreditPlanCard } from "../components/credit-plan-card"
import { RecentActivityTimeline } from "../components/recent-activity-timeline"
import { Skeleton } from "@workspace/ui/components/skeleton"

export function DashboardOverview() {
  const { data, isLoading, error } = useQuery(
    trpc.tenantDashboard.stats.queryOptions()
  )

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        {/* Hero skeleton */}
        <Skeleton className="h-44 w-full rounded-3xl" />

        {/* Stat cards skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>

        {/* Content grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-80 rounded-3xl" />
            <Skeleton className="h-60 rounded-3xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
          </div>
        </div>
      </div>
    )
  }

  const metrics = data?.metrics || {
    totalPapers: 0,
    publishedPapers: 0,
    draftPapers: 0,
    totalQuestions: 0,
    creditBalance: 0,
    lifetimeCreditsSpent: 0,
  }

  const recentPapers = data?.recentPapers || []
  const classDistribution = data?.classDistribution || []
  const recentHistory = data?.recentHistory || []
  const subscription = data?.subscription || null

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Hero / Header Banner */}
      <DashboardHero />

      {/* 2. Key Metrics Row */}
      <DashboardStatCards metrics={metrics} />

      {/* 3. Main Operational Grid: 2/3 and 1/3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Question Papers */}
          <RecentQuestionPapers papers={recentPapers} />

          {/* Class-wise Question Paper Breakdown */}
          <ClassDistributionChart data={classDistribution} />
        </div>

        {/* Right Column (1/3 width on desktop) */}
        <div className="space-y-6">
          {/* AI Credits & Subscription Tier */}
          <CreditPlanCard
            creditBalance={metrics.creditBalance}
            subscription={subscription}
          />

          {/* Audit History & AI Action Timeline */}
          <RecentActivityTimeline history={recentHistory} />
        </div>
      </div>
    </div>
  )
}

