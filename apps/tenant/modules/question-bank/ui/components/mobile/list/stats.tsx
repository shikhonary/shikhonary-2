"use client"

import React from "react"
import type { QuestionBankStats } from "@/modules/question-bank/types"

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "০"
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
  return num
    .toString()
    .split("")
    .map((char) => (/\d/.test(char) ? bengaliDigits[parseInt(char)] : char))
    .join("")
}

interface MobileStatsProps {
  stats?: QuestionBankStats
  isLoading?: boolean
}

export const MobileStats: React.FC<MobileStatsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto px-4 py-1 scrollbar-none">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-8 w-24 bg-white/[0.04] animate-pulse rounded-full shrink-0"
          />
        ))}
      </div>
    )
  }

  const items = [
    { label: "মোট প্রশ্ন", val: stats?.totalQuestions ?? 0, color: "text-primary" },
    { label: "MCQ", val: stats?.totalMcqs ?? 0, color: "text-sky-400" },
    { label: "CQ", val: stats?.totalCqs ?? 0, color: "text-amber-400" },
    {
      label: "অন্যান্য",
      val: (stats?.totalShortAnswers ?? 0) + (stats?.totalPbqs ?? 0),
      color: "text-purple-400",
    },
  ]

  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-1 scrollbar-none">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-white/[0.06] text-xs shrink-0 select-none font-body"
        >
          <span className="text-muted-foreground">{item.label}:</span>
          <span className={`font-bold font-headline ${item.color}`}>
            {toBengaliDigits(item.val)}
          </span>
        </div>
      ))}
    </div>
  )
}
