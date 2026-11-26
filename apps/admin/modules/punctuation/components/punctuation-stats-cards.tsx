"use client"

import { Quote, BookOpen, Eye, BarChart2 } from "lucide-react"
import { StatsCards, type StatCardItem } from "@/components/shared/stats-cards"

interface PunctuationStatsCardsProps {
  stats?: {
    total: number
    easy: number
    medium: number
    hard: number
  }
  isLoading: boolean
}

export function PunctuationStatsCards({ stats, isLoading }: PunctuationStatsCardsProps) {
  const cards: StatCardItem[] = [
    {
      title: "মোট বিরামচিহ্ন",
      value: stats?.total ?? 0,
      icon: Quote,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      title: "সহজ প্রশ্ন",
      value: stats?.easy ?? 0,
      icon: BookOpen,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
    },
    {
      title: "মাঝারি প্রশ্ন",
      value: stats?.medium ?? 0,
      icon: Eye,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
    },
    {
      title: "কঠিন প্রশ্ন",
      value: stats?.hard ?? 0,
      icon: BarChart2,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
    },
  ]

  return <StatsCards cards={cards} isLoading={isLoading} />
}
