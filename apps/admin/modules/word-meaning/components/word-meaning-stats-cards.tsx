"use client"

import { StatsCards, type StatCardItem } from "@/components/shared"
import { BookOpen, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface WordMeaningStatsCardsProps {
  totalCount?: number
  activeCount?: number
  inactiveCount?: number
  hardCount?: number
  isLoading?: boolean
}

export function WordMeaningStatsCards({
  totalCount,
  activeCount,
  inactiveCount,
  hardCount,
  isLoading,
}: WordMeaningStatsCardsProps) {
  const cards: StatCardItem[] = [
    {
      title: "মোট শব্দার্থ",
      value: totalCount,
      icon: BookOpen,
      iconColor: "text-indigo-600 dark:text-primary",
      iconBgColor: "bg-indigo-50 dark:bg-primary/10",
      description: "শব্দার্থ প্রশ্ন ব্যাংকে মোট শব্দ",
    },
    {
      title: "অ্যাক্টিভ শব্দার্থ",
      value: activeCount,
      icon: CheckCircle,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBgColor: "bg-emerald-50 dark:bg-emerald-500/10",
      description: "বর্তমানে ব্যবহারের জন্য সক্রিয়",
    },
    {
      title: "ইনঅ্যাক্টিভ শব্দার্থ",
      value: inactiveCount,
      icon: XCircle,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBgColor: "bg-amber-50 dark:bg-amber-500/10",
      description: "সাময়িকভাবে স্থগিত রাখা শব্দার্থ",
    },
    {
      title: "কঠিন স্তর (Hard)",
      value: hardCount,
      icon: AlertTriangle,
      iconColor: "text-rose-600 dark:text-rose-400",
      iconBgColor: "bg-rose-50 dark:bg-rose-500/10",
      description: "উচ্চতর দক্ষতার শব্দার্থ প্রশ্ন",
    },
  ]

  return <StatsCards cards={cards} isLoading={isLoading} />
}
