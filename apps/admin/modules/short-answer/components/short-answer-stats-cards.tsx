"use client"

import * as React from "react"
import { ClipboardList, CheckCircle2, AlertCircle, BarChart2 } from "lucide-react"
import { StatsCards, type StatCardItem } from "@/components/shared/stats-cards"

interface ShortAnswerStatsCardsProps {
  totalCount?: number
  activeCount?: number
  inactiveCount?: number
  difficultyCounts?: {
    easy?: number
    medium?: number
    hard?: number
    EASY?: number
    MEDIUM?: number
    HARD?: number
  }
  isLoading?: boolean
}

export function ShortAnswerStatsCards({
  totalCount = 0,
  activeCount = 0,
  inactiveCount = 0,
  difficultyCounts = { easy: 0, medium: 0, hard: 0 },
  isLoading = false,
}: ShortAnswerStatsCardsProps) {
  const mediumCount = difficultyCounts?.MEDIUM ?? difficultyCounts?.medium ?? 0

  const cards: StatCardItem[] = [
    {
      title: "মোট সংক্ষিপ্ত উত্তর",
      value: totalCount,
      icon: ClipboardList,
      iconColor: "text-indigo-600 dark:text-primary",
      iconBg: "bg-indigo-50 dark:bg-primary/10 border border-indigo-100/80 dark:border-primary/20",
    },
    {
      title: "অ্যাক্টিভ প্রশ্ন",
      value: activeCount,
      icon: CheckCircle2,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40",
    },
    {
      title: "ইনঅ্যাক্টিভ প্রশ্ন",
      value: inactiveCount,
      icon: AlertCircle,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40",
    },
    {
      title: "মাঝারি মানের প্রশ্ন",
      value: mediumCount,
      icon: BarChart2,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40",
    },
  ]

  return (
    <StatsCards
      cards={cards}
      isLoading={isLoading}
    />
  )
}
