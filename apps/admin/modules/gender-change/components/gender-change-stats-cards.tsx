"use client"

import { FileText, BookOpen, Eye, BarChart2 } from "lucide-react"
import { StatsCards, type StatCardItem } from "@/components/shared/stats-cards"

interface GenderChangeStatsCardsProps {
  stats?: {
    total: number
    easyCount: number
    mediumCount: number
    hardCount: number
  }
  isLoading: boolean
}

export function GenderChangeStatsCards({ stats, isLoading }: GenderChangeStatsCardsProps) {
  const cards: StatCardItem[] = [
    {
      title: "মোট লিঙ্গান্তর",
      value: stats?.total ?? 0,
      icon: FileText,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      title: "সহজ প্রশ্ন",
      value: stats?.easyCount ?? 0,
      icon: BookOpen,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
    },
    {
      title: "মাঝারি প্রশ্ন",
      value: stats?.mediumCount ?? 0,
      icon: Eye,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
    },
    {
      title: "কঠিন প্রশ্ন",
      value: stats?.hardCount ?? 0,
      icon: BarChart2,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
    },
  ]

  return <StatsCards cards={cards} isLoading={isLoading} />
}
