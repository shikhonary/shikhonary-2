"use client"

import * as React from "react"
import { ArrowRightLeft, Sparkles, BarChart2, Flame } from "lucide-react"
import { StatsCards, type StatCardItem } from "@/components/shared/stats-cards"

interface DanBamMilkoronStatsCardsProps {
  totalCount?: number
  difficultyCounts?: {
    EASY?: number
    MEDIUM?: number
    HARD?: number
  }
  isLoading?: boolean
}

export function DanBamMilkoronStatsCards({
  totalCount = 0,
  difficultyCounts = { EASY: 0, MEDIUM: 0, HARD: 0 },
  isLoading = false,
}: DanBamMilkoronStatsCardsProps) {
  const cards: StatCardItem[] = [
    {
      title: "মোট ডান-বাম মিলকরণ",
      value: totalCount,
      icon: ArrowRightLeft,
      iconColor: "text-indigo-600 dark:text-primary",
      iconBg: "bg-indigo-50 dark:bg-primary/10 border border-indigo-100/80 dark:border-primary/20",
    },
    {
      title: "সহজ (Easy)",
      value: difficultyCounts?.EASY ?? 0,
      icon: Sparkles,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40",
    },
    {
      title: "মাঝারি (Medium)",
      value: difficultyCounts?.MEDIUM ?? 0,
      icon: BarChart2,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40",
    },
    {
      title: "কঠিন (Hard)",
      value: difficultyCounts?.HARD ?? 0,
      icon: Flame,
      iconColor: "text-rose-600 dark:text-rose-400",
      iconBg: "bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/40",
    },
  ]

  return (
    <StatsCards
      cards={cards}
      isLoading={isLoading}
      ariaLabel="ডান-বাম মিলকরণ পরিসংখ্যান ওভারভিউ"
    />
  )
}
