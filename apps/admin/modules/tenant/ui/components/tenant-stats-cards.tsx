"use client"

import * as React from "react"
import { Building2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react"
import { StatsCards, type StatCardItem } from "@/components/shared/stats-cards"

interface TenantStatsCardsProps {
  totalCount?: number
  total?: number
  activeCount?: number
  active?: number
  suspendedCount?: number
  suspended?: number
  inactiveCount?: number
  inactive?: number
  isLoading?: boolean
}

export function TenantStatsCards({
  totalCount,
  total,
  activeCount,
  active,
  suspendedCount,
  suspended,
  inactiveCount,
  inactive,
  isLoading = false,
}: TenantStatsCardsProps) {
  const displayTotal = totalCount ?? total ?? 0
  const displayActive = activeCount ?? active ?? 0
  const displaySuspended = suspendedCount ?? suspended ?? 0
  const displayInactive = inactiveCount ?? inactive ?? 0

  const cards: StatCardItem[] = [
    {
      title: "মোট প্রতিষ্ঠান",
      value: displayTotal,
      subtitle: "নিবন্ধিত শিক্ষা প্রতিষ্ঠান",
      icon: Building2,
      iconColor: "text-indigo-600 dark:text-primary",
      iconBg: "bg-indigo-50 dark:bg-primary/10 border border-indigo-100/80 dark:border-primary/20",
    },
    {
      title: "সক্রিয় প্রতিষ্ঠান",
      value: displayActive,
      subtitle: "লাইভ ও এক্সেসযোগ্য পোর্টাল",
      icon: CheckCircle2,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40",
    },
    {
      title: "স্থগিত প্রতিষ্ঠান",
      value: displaySuspended,
      subtitle: "সাময়িকভাবে স্থগিত পোর্টাল",
      icon: AlertTriangle,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40",
    },
    {
      title: "নিষ্ক্রিয় প্রতিষ্ঠান",
      value: displayInactive,
      subtitle: "অননুমোদিত বা নিষ্ক্রিয়",
      icon: XCircle,
      iconColor: "text-rose-600 dark:text-rose-400",
      iconBg: "bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/40",
    },
  ]

  return (
    <StatsCards
      cards={cards}
      isLoading={isLoading}
      ariaLabel="শিক্ষা প্রতিষ্ঠান পরিসংখ্যান ওভারভিউ"
    />
  )
}
