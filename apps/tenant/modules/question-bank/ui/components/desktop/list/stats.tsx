"use client"

import React from "react"
import { Database, CheckSquare, Layers, FileQuestion, BookOpen } from "lucide-react"
import { Skeleton } from "@workspace/ui/components/skeleton"
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

interface DesktopStatsProps {
  stats?: QuestionBankStats
  isLoading?: boolean
}

export const DesktopStats: React.FC<DesktopStatsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-card rounded-xl border border-white/[0.06] p-5 flex flex-col justify-between h-[104px]"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 bg-white/[0.06]" />
              <Skeleton className="h-8 w-8 rounded-lg bg-white/[0.06]" />
            </div>
            <Skeleton className="h-7 w-16 bg-white/[0.06]" />
          </div>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: "সর্বমোট প্রশ্ন",
      value: toBengaliDigits(stats?.totalQuestions ?? 0),
      subtitle: "জাতীয় শিক্ষাক্রম ভিত্তিক সংকলন",
      icon: Database,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      title: "বহুনির্বাচনি (MCQ)",
      value: toBengaliDigits(stats?.totalMcqs ?? 0),
      subtitle: "চার বিকল্প ও সঠিক উত্তরসহ",
      icon: CheckSquare,
      iconColor: "text-sky-400",
      iconBg: "bg-sky-400/10",
    },
    {
      title: "সৃজনশীল (CQ)",
      value: toBengaliDigits(stats?.totalCqs ?? 0),
      subtitle: "উদ্দীপক ও ক-খ-গ-ঘ প্রশ্ন",
      icon: Layers,
      iconColor: "text-amber-400",
      iconBg: "bg-amber-400/10",
    },
    {
      title: "সংক্ষিপ্ত ও অনুচ্ছেদ",
      value: toBengaliDigits((stats?.totalShortAnswers ?? 0) + (stats?.totalPbqs ?? 0)),
      subtitle: `${toBengaliDigits(stats?.totalSubjects ?? 0)}টি বিষয় ও অধ্যায় অন্তর্ভুক্ত`,
      icon: BookOpen,
      iconColor: "text-purple-400",
      iconBg: "bg-purple-400/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <div
            key={idx}
            className="bg-card rounded-xl border border-white/[0.06] p-5 hover:border-white/[0.12] transition-colors relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground font-body">
                {card.title}
              </span>
              <div
                className={`w-8 h-8 rounded-lg ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold font-headline text-foreground">
                {card.value}
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground/80 mt-1 font-body truncate">
              {card.subtitle}
            </p>
          </div>
        )
      })}
    </div>
  )
}
