"use client"

import * as React from "react"
import { Quote, BarChart2, CheckCircle2, AlertCircle } from "lucide-react"
import { StatsCards, type StatCardItem } from "@/components/shared/stats-cards"

interface ThoughtExpansionStatsCardsProps {
  totalCount?: number
  activeCount?: number
  inactiveCount?: number
  difficultyCounts?: {
    EASY?: number
    MEDIUM?: number
    HARD?: number
  }
  isLoading?: boolean
}

export function ThoughtExpansionStatsCards({
  totalCount = 0,
  activeCount,
  inactiveCount,
  difficultyCounts = { EASY: 0, MEDIUM: 0, HARD: 0 },
  isLoading = false,
}: ThoughtExpansionStatsCardsProps) {
  const cards: StatCardItem[] = [
    {
      title: "মোট ভাব-সম্প্রসারণ",
      value: totalCount,
      icon: Quote,
      iconColor: "text-indigo-600 dark:text-primary",
      iconBg: "bg-indigo-50 dark:bg-primary/10 border border-indigo-100/80 dark:border-primary/20",
    },
    {
      title: activeCount !== undefined ? "অ্যাক্টিভ ভাব-সম্প্রসারণ" : "সহজ (Easy)",
      value: activeCount !== undefined ? activeCount : (difficultyCounts?.EASY ?? 0),
      icon: CheckCircle2,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40",
    },
    {
      title: inactiveCount !== undefined ? "ইনঅ্যাক্টিভ ভাব-সম্প্রসারণ" : "মাঝারি (Medium)",
      value: inactiveCount !== undefined ? inactiveCount : (difficultyCounts?.MEDIUM ?? 0),
      icon: inactiveCount !== undefined ? AlertCircle : BarChart2,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40",
    },
    {
      title: "মাঝারি মানের ভাব-সম্প্রসারণ",
      value: difficultyCounts?.MEDIUM ?? 0,
      icon: BarChart2,
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40",
    },
  ]

  return (
    <StatsCards
      cards={cards}
      isLoading={isLoading}
      ariaLabel="ভাব-সম্প্রসারণ পরিসংখ্যান ওভারভিউ"
    />
  )
}
