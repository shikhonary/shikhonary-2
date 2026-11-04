"use client"
import * as React from "react"
import { Calendar, CalendarCheck, Check, AlertCircle } from "lucide-react"
import { StatsCards, type StatCardItem } from "@/components/shared/stats-cards"

interface AcademicYearStatsCardsProps {
  totalCount?: number
  activeCount?: number
  inactiveCount?: number
  currentYearName?: string | null
  isLoading?: boolean
}

export function AcademicYearStatsCards({
  totalCount = 0,
  activeCount = 0,
  inactiveCount = 0,
  currentYearName,
  isLoading = false,
}: AcademicYearStatsCardsProps) {
  const cards: StatCardItem[] = [
    {
      title: "মোট শিক্ষাবর্ষ",
      value: totalCount,
      icon: Calendar,
      iconColor: "text-indigo-600 dark:text-primary",
      iconBg: "bg-indigo-50 dark:bg-primary/10 border border-indigo-100/80 dark:border-primary/20",
    },
    {
      title: "বর্তমান শিক্ষাবর্ষ",
      value: currentYearName || "নির্ধারিত নেই",
      icon: CalendarCheck,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40",
    },
    {
      title: "সক্রিয় শিক্ষাবর্ষ",
      value: activeCount,
      icon: Check,
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40",
    },
    {
      title: "নিষ্ক্রিয় শিক্ষাবর্ষ",
      value: inactiveCount,
      icon: AlertCircle,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40",
    },
  ]

  return (
    <StatsCards
      cards={cards}
      isLoading={isLoading}
      ariaLabel="শিক্ষাবর্ষ পরিসংখ্যান ওভারভিউ"
    />
  )
}
