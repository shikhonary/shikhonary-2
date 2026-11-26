"use client"

import { ScrollText, BookOpen, Eye, BarChart2 } from "lucide-react"
import { StatsCards, type StatCardItem } from "@/components/shared/stats-cards"

interface ProseEssenceStatsCardsProps {
  stats?: {
    totalCount: number
    difficultyCounts: {
      EASY: number
      MEDIUM: number
      HARD: number
    }
  }
  isLoading: boolean
}

export function ProseEssenceStatsCards({ stats, isLoading }: ProseEssenceStatsCardsProps) {
  const cards: StatCardItem[] = [
    {
      title: "মোট গদ্যের সারমর্ম",
      value: stats?.totalCount ?? 0,
      icon: ScrollText,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      title: "সহজ প্রশ্ন",
      value: stats?.difficultyCounts?.EASY ?? 0,
      icon: BookOpen,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
    },
    {
      title: "মাঝারি প্রশ্ন",
      value: stats?.difficultyCounts?.MEDIUM ?? 0,
      icon: Eye,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
    },
    {
      title: "কঠিন প্রশ্ন",
      value: stats?.difficultyCounts?.HARD ?? 0,
      icon: BarChart2,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
    },
  ]

  return <StatsCards cards={cards} isLoading={isLoading} />
}
