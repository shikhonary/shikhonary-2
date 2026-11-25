"use client"

import { FileText, BookOpen, Eye, BarChart2 } from "lucide-react"
import { StatsCards, type StatCardItem } from "@/components/shared/stats-cards"

interface PartsOfSpeechStatsCardsProps {
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

export function PartsOfSpeechStatsCards({ stats, isLoading }: PartsOfSpeechStatsCardsProps) {
  const cards: StatCardItem[] = [
    {
      title: "মোট Parts of Speech",
      value: stats?.totalCount ?? 0,
      icon: FileText,
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
