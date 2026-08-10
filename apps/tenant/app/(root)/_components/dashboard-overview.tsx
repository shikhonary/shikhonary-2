"use client"

import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import Link from "next/link"
import { useState } from "react"
import {
  Users,
  Banknote,
  TrendingUp,
  BarChart3,
  ArrowRight,
  Plus,
  Receipt,
  FileText,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  UserPlus,
  Loader2,
} from "lucide-react"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Button } from "@workspace/ui/components/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

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

// ─── Chart Tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number; name: string; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border/60 rounded-xl shadow-lg p-3 text-xs space-y-1.5">
      <p className="font-display font-semibold text-foreground mb-1">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color }} />
          <span className="text-muted-foreground font-body">{entry.name}:</span>
          <span className="font-bold text-foreground">{formatFullTaka(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Quick Actions ────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  {
    href: "/tax-payers/new",
    icon: UserPlus,
    label: "নতুন করদাতা নিবন্ধন",
    desc: "নতুন হোল্ডিং করদাতা যোগ করুন",
    iconBg: "bg-primary/10 text-primary",
    borderColor: "border-primary/20",
  },
  {
    href: "/tax-collection?new=true",
    icon: Coins,
    label: "কর আদায়",
    desc: "বকেয়া করের পরিশোধ রেকর্ড করুন",
    iconBg: "bg-emerald-500/10 text-emerald-600",
    borderColor: "border-emerald-500/20",
  },
  {
    href: "/generate-tax-payment",
    icon: FileText,
    label: "বাৎসরিক কর জেনারেশন",
    desc: "অর্থবছর ভিত্তিক বাৎসরিক কর নির্ধারণ ও রসিদ তৈরি",
    iconBg: "bg-violet-500/10 text-violet-600",
    borderColor: "border-violet-500/20",
  },
  {
    href: "/wards?new=true",
    icon: Building2,
    label: "ওয়ার্ড ব্যবস্থাপনা",
    desc: "ওয়ার্ড তথ্য পরিচালনা করুন",
    iconBg: "bg-orange-500/10 text-orange-600",
    borderColor: "border-orange-500/20",
  },
]

// ─── Dashboard View ───────────────────────────────────────────────────────────

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

  const ASSESSED_COLOR = "hsl(217, 91%, 60%)"
  const COLLECTED_COLOR = "hsl(142, 71%, 45%)"

  const kpiStats = [
    {
      label: "মোট নিবন্ধিত করদাতা",
      value: `${totalTaxPayers.toLocaleString()} জন`,
      sub: `${paidPaymentCount} জন পরিশোধ করেছেন`,
      icon: Users,
      iconBg: "bg-primary/10 text-primary",
    },
    {
      label: "প্রাক্কলিত বাৎসরিক ধার্যকৃত কর",
      value: formatFullTaka(totalAssessedTax),
      sub: "সকল হোল্ডিংয়ের মোট ধার্যকৃত কর",
      icon: Banknote,
      iconBg: "bg-emerald-500/10 text-emerald-600",
      valueColor: "text-emerald-600",
    },
    {
      label: currentFiscalYear ? `${currentFiscalYear.year} অর্থবছরে মোট আদায়` : "মোট আদায়কৃত কর",
      value: formatFullTaka(totalCollectedTax),
      sub: `আদায় হার: ${collectionRate}%`,
      icon: TrendingUp,
      iconBg: "bg-blue-500/10 text-blue-600",
      valueColor: "text-blue-600",
    },
  ]

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
        <Button asChild className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 sm:py-3 font-display text-sm sm:text-base font-bold text-primary-foreground shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 cursor-pointer overflow-hidden h-auto">
          <Link href="/tax-payers/new">
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 ease-out group-hover:scale-110" />
            <span className="relative z-10">নতুন করদাতা নিবন্ধন</span>
          </Link>
        </Button>
      </section>

      {/* ── Fiscal Year Banner ──────────────────────────────────────── */}
      {currentFiscalYear ? (
        <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Calendar className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              চলতি অর্থবছর
            </p>
            <h3 className="text-2xl font-bold text-foreground">{currentFiscalYear.year}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {formatDate(currentFiscalYear.startDate)} — {formatDate(currentFiscalYear.endDate)}
            </p>
          </div>
          <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary text-xs font-bold shrink-0">
            সক্রিয়
          </Badge>
        </div>
      ) : (
        <div className="flex items-center gap-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">অর্থবছর</p>
            <h3 className="text-base font-bold text-foreground">কোনো সক্রিয় অর্থবছর নেই</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              <Link href="/fiscal-years" className="text-amber-600 underline underline-offset-2 font-semibold">
                এখানে ক্লিক করে একটি অর্থবছর তৈরি করুন
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* ── KPI Stat Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {kpiStats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:shadow-sm"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl shrink-0 ${stat.iconBg}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
              <h3 className={`text-2xl font-bold ${stat.valueColor ?? "text-foreground"}`}>
                {stat.value}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Collection Progress ─────────────────────────────────────── */}
      <div className="rounded-xl border border-border/60 bg-card p-4 sm:p-5 transition-all hover:shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">আদায় অগ্রগতি</p>
            <p className="text-sm font-semibold text-foreground mt-0.5">
              ধার্যকৃত করের বিপরীতে {currentFiscalYear ? `${currentFiscalYear.year} অর্থবছরের` : ""} আদায়ের হার
            </p>
          </div>
          <span className="text-2xl font-bold text-primary font-display">{collectionRate}%</span>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-700 ease-out"
            style={{ width: `${Math.min(collectionRate, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5 font-mono">
          <span>৳০</span>
          <span>{formatFullTaka(totalAssessedTax)}</span>
        </div>
      </div>

      {/* ── Chart + Quick Actions ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

        {/* Ward-wise Bar Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xs shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-display font-bold text-foreground">ওয়ার্ড-ভিত্তিক কর আদায়</h3>
                <p className="text-[10px] text-muted-foreground">ধার্যকৃত ও আদায়কৃত করের তুলনামূলক চিত্র</p>
              </div>
            </div>
          </div>
          <div className="p-4">
            {wardBreakdown.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium">কোনো ওয়ার্ড ডেটা পাওয়া যায়নি</p>
                <p className="text-xs text-center max-w-xs">প্রথমে করদাতা যোগ করুন, তারপর ওয়ার্ড-ভিত্তিক চিত্র এখানে দেখা যাবে।</p>
              </div>
            ) : (
              <>
                <div style={{ height: Math.max(200, wardBreakdown.length * 56) }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={wardBreakdown}
                      layout="vertical"
                      margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
                      barGap={4}
                    >
                      <XAxis
                        type="number"
                        tick={{ fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
                        tickFormatter={(v) => formatTaka(v as number)}
                        axisLine={false}
                        tickLine={false}
                        className="text-muted-foreground"
                      />
                      <YAxis
                        type="category"
                        dataKey="wardName"
                        width={80}
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        content={<ChartTooltip />}
                        cursor={{ fill: "hsl(var(--muted))", opacity: 0.6, radius: 4 }}
                      />
                      <Bar dataKey="assessedAmount" name="ধার্যকৃত" radius={[0, 4, 4, 0]} maxBarSize={12}>
                        {wardBreakdown.map((_item, i) => (
                          <Cell key={i} fill={ASSESSED_COLOR} fillOpacity={0.3} />
                        ))}
                      </Bar>
                      <Bar dataKey="collectedAmount" name="আদায়" radius={[0, 4, 4, 0]} maxBarSize={12}>
                        {wardBreakdown.map((_item, i) => (
                          <Cell key={i} fill={COLLECTED_COLOR} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="flex items-center gap-4 pt-2 border-t border-border/40 mt-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ background: ASSESSED_COLOR, opacity: 0.3 }} />
                    <span className="text-xs text-muted-foreground">ধার্যকৃত</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ background: COLLECTED_COLOR }} />
                    <span className="text-xs text-muted-foreground">আদায়</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick Actions — desktop sidebar */}
        <div className="hidden lg:flex flex-col gap-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground px-1">
            দ্রুত কার্যক্রম
          </p>
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.href} href={action.href}>
              <div className={`flex items-center gap-3.5 rounded-xl border ${action.borderColor} bg-card p-4 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 cursor-pointer`}>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${action.iconBg}`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-display font-bold text-foreground leading-none">{action.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-snug font-body">{action.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Recent Payments ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xs shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <Receipt className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-display font-bold text-foreground">সাম্প্রতিক কর আদায়</h3>
              <p className="text-[10px] text-muted-foreground">সর্বশেষ পরিশোধসমূহ</p>
            </div>
          </div>
          <Link
            href="/tax-collection"
            className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline underline-offset-2"
          >
            সব দেখুন
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* List */}
        {recentPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium">কোনো পরিশোধ রেকর্ড পাওয়া যায়নি</p>
            <p className="text-xs text-center max-w-xs">
              কর আদায় করলে এখানে সর্বশেষ পরিশোধের তালিকা দেখা যাবে।
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {(recentPayments as any[]).map((payment: any) => (
              <div
                key={payment.id}
                className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-muted/40 transition-colors duration-150"
              >
                {/* Icon */}
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                  <CheckCircle2 className="h-4.5 w-4.5" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 shrink-0">
                      #{payment.taxPayer.holding}
                    </span>
                    <p className="text-sm font-display font-bold text-foreground truncate">
                      {payment.taxPayer.name}
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate font-body">
                    {payment.taxPayer.ward?.nameBn || payment.taxPayer.ward?.name}
                    {payment.receiptNo && ` · রসিদ: ${payment.receiptNo}`}
                  </p>
                </div>

                {/* Amount + Date */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-emerald-600">
                    {formatFullTaka(payment.amount)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {formatDate(payment.paymentDate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
