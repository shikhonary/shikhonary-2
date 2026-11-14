"use client"

import * as React from "react"
import {
  Layers,
  CheckCircle2,
  Image as ImageIcon,
  AlertTriangle,
} from "lucide-react"
import { StatsCards, type StatCardItem } from "@/components/shared/stats-cards"
import { toBengaliDigits } from "@workspace/utils"

interface ContentTrackerStatsCardsProps {
  totalQuestions?: number
  mcqCount?: number
  cqCount?: number
  shortAnswerCount?: number
  activeCount?: number
  inactiveCount?: number
  activeRate?: number
  totalVisual?: number
  uploadedVisual?: number
  missingVisual?: number
  attachmentRate?: number
  pendingReports?: number
  totalTables?: number
  isLoading?: boolean
}

export function ContentTrackerStatsCards({
  totalQuestions = 0,
  mcqCount = 0,
  cqCount = 0,
  shortAnswerCount = 0,
  activeCount = 0,
  inactiveCount = 0,
  activeRate = 100,
  totalVisual = 0,
  uploadedVisual = 0,
  missingVisual = 0,
  attachmentRate = 100,
  pendingReports = 0,
  totalTables = 0,
  isLoading = false,
}: ContentTrackerStatsCardsProps) {
  const cards: StatCardItem[] = [
    {
      title: "মোট ইনজেস্টেড প্রশ্ন",
      value: totalQuestions,
      subtitle: `MCQ: ${toBengaliDigits(mcqCount)} | CQ: ${toBengaliDigits(cqCount)} | SA: ${toBengaliDigits(shortAnswerCount)}`,
      icon: Layers,
      iconColor: "text-indigo-600 dark:text-primary",
      iconBg:
        "bg-indigo-50 dark:bg-primary/10 border border-indigo-100/80 dark:border-primary/20",
    },
    {
      title: "সক্রিয় / অনুমোদিত অনুপাত",
      value: `${toBengaliDigits(activeRate)}%`,
      subtitle: `সক্রিয়: ${toBengaliDigits(activeCount)} | নিষ্ক্রিয়: ${toBengaliDigits(inactiveCount)}টি`,
      icon: CheckCircle2,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg:
        "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40",
    },
    {
      title: "চিত্র ও মিডিয়া সংযুক্তি",
      value: `${toBengaliDigits(attachmentRate)}%`,
      subtitle:
        missingVisual > 0
          ? `আপলোড: ${toBengaliDigits(uploadedVisual)}/${toBengaliDigits(totalVisual)} (বাকি: ${toBengaliDigits(missingVisual)}টি)`
          : `সকল চিত্র ক্লাউডে সংযুক্ত (${toBengaliDigits(uploadedVisual)}টি)`,
      icon: ImageIcon,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg:
        "bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40",
    },
    {
      title: "কোয়ালিটি ও রিপোর্ট",
      value: pendingReports + inactiveCount,
      subtitle: `রিপোর্ট: ${toBengaliDigits(pendingReports)}টি | ছক/সারণি: ${toBengaliDigits(totalTables)}টি`,
      icon: AlertTriangle,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg:
        "bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40",
    },
  ]

  return (
    <StatsCards
      cards={cards}
      isLoading={isLoading}
      ariaLabel="কনটেন্ট পাইপলাইন ওভারভিউ"
    />
  )
}
