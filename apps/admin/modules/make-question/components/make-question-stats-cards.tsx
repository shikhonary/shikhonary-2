"use client"

import * as React from "react"
import { BookOpen, CheckCircle2, AlertCircle, Sparkles } from "lucide-react"
import { StatsCards, type StatCardItem } from "@/components/shared/stats-cards"

interface MakeQuestionStatsCardsProps {
  totalCount?: number
  activeCount?: number
  inactiveCount?: number
  hardCount?: number
  isLoading?: boolean
}

export function MakeQuestionStatsCards({
  totalCount = 0,
  activeCount = 0,
  inactiveCount = 0,
  hardCount = 0,
  isLoading = false,
}: MakeQuestionStatsCardsProps) {
  const cards: StatCardItem[] = [
    {
      title: "মোট প্রশ্ন তৈরির এন্ট্রি",
      value: totalCount,
      icon: BookOpen,
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
      title: "কঠিন প্রশ্ন",
      value: hardCount,
      icon: Sparkles,
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40",
    },
  ]

  return (
    <StatsCards
      cards={cards}
      isLoading={isLoading}
      ariaLabel="প্রশ্ন তৈরি পরিসংখ্যান ওভারভিউ"
    />
  )
}
