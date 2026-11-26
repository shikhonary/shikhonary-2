"use client"

import { ClipboardList, CheckCircle2, AlertCircle, BarChart2 } from "lucide-react"
import { StatsCards, type StatCardItem } from "@/components/shared/stats-cards"

interface RearrangeStatsCardsProps {
  stats?: {
    totalCount: number
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
  }
  isLoading: boolean
}

export function RearrangeStatsCards({ stats, isLoading }: RearrangeStatsCardsProps) {
  const hardCount = stats?.difficultyCounts?.hard ?? stats?.difficultyCounts?.HARD ?? 0

  const cards: StatCardItem[] = [
    {
      title: "মোট রিঅ্যারেঞ্জ",
      value: stats?.totalCount ?? 0,
      icon: ClipboardList,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      title: "সক্রিয় প্রশ্ন",
      value: stats?.activeCount ?? 0,
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
    },
    {
      title: "নিষ্ক্রিয় প্রশ্ন",
      value: stats?.inactiveCount ?? 0,
      icon: AlertCircle,
      iconColor: "text-slate-600",
      iconBg: "bg-slate-100",
    },
    {
      title: "কঠিন প্রশ্ন",
      value: hardCount,
      icon: BarChart2,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
    },
  ]

  return <StatsCards cards={cards} isLoading={isLoading} />
}
