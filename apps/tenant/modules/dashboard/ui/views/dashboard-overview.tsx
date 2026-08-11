"use client"

import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Button } from "@workspace/ui/components/button"

import { FiscalYearBanner } from "../components/fiscal-year-banner"
import { KpiCards } from "../components/kpi-cards"
import { CollectionProgress } from "../components/collection-progress"
import { WardCollectionChart } from "../components/ward-collection-chart"
import { QuickActions } from "../components/quick-actions"
import { RecentPaymentsList } from "../components/recent-payments-list"

// ─── Formatters ──────────────────────────────────────────────────────────────

function formatTaka(amount: number): string {
  if (amount >= 100000) return `৳${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `৳${(amount / 1000).toFixed(1)}K`
  return `৳${amount.toLocaleString()}`
}

function formatFullTaka(amount: number): string {
  return `৳${amount.toLocaleString()}`
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function DashboardOverview() {
  const { data, isLoading } = useQuery(trpc.tenantDashboard.stats.queryOptions())

  if (isLoading) {
    return (
      <div className="w-full space-y-6 font-body p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto pb-24 lg:pb-8">
        {/* Header skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-xl" />
        </div>
        {/* Fiscal year skeleton */}
        <Skeleton className="h-16 w-full rounded-xl" />
        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px] rounded-xl" />
          ))}
        </div>
        {/* Chart + actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <Skeleton className="lg:col-span-2 h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
        {/* Recent payments */}
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  if (!data) return null

  const {
    currentFiscalYear,
    totalTaxPayers,
    totalAssessedTax,
    totalCollectedTax,
    paidPaymentCount,
    collectionRate,
    recentPayments,
    wardBreakdown,
  } = data

  return (
    <div className="w-full space-y-6 font-body p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto pb-24 lg:pb-8">
      {/* ── Section Heading ─────────────────────────────────────────── */}
      <section className="flex flex-col justify-between gap-4 sm:gap-6 md:flex-row md:items-end">
        <div>
          <h2 className="mb-1 font-display text-2xl sm:text-3xl font-extrabold text-foreground md:text-4xl">
            ড্যাশবোর্ড সারসংক্ষেপ
          </h2>
          <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-muted-foreground">
            ইউনিয়ন পরিষদের করদাতা, ধার্যকৃত কর ও আদায়ের সার্বিক চিত্র এক জায়গায় দেখুন।
          </p>
        </div>
        <Button
          asChild
          className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 sm:py-3 font-display text-sm sm:text-base font-bold text-primary-foreground shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 cursor-pointer overflow-hidden h-auto"
        >
          <Link href="/tax-payers/new">
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 ease-out group-hover:scale-110" />
            <span className="relative z-10">নতুন করদাতা নিবন্ধন</span>
          </Link>
        </Button>
      </section>

      {/* ── Fiscal Year Banner ──────────────────────────────────────── */}
      <FiscalYearBanner currentFiscalYear={currentFiscalYear} formatDate={formatDate} />

      {/* ── KPI Stat Cards ──────────────────────────────────────────── */}
      <KpiCards
        totalTaxPayers={totalTaxPayers}
        paidPaymentCount={paidPaymentCount}
        totalAssessedTax={totalAssessedTax}
        totalCollectedTax={totalCollectedTax}
        collectionRate={collectionRate}
        currentFiscalYear={currentFiscalYear}
        formatFullTaka={formatFullTaka}
      />

      {/* ── Collection Progress ─────────────────────────────────────── */}
      <CollectionProgress
        collectionRate={collectionRate}
        totalAssessedTax={totalAssessedTax}
        currentFiscalYear={currentFiscalYear}
        formatFullTaka={formatFullTaka}
      />

      {/* ── Chart + Quick Actions ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <WardCollectionChart
            wardBreakdown={wardBreakdown}
            formatTaka={formatTaka}
            formatFullTaka={formatFullTaka}
          />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>

      {/* ── Recent Payments ─────────────────────────────────────────── */}
      <RecentPaymentsList
        recentPayments={recentPayments}
        formatFullTaka={formatFullTaka}
        formatDate={formatDate}
      />
    </div>
  )
}
