"use client"

import React from "react"
import { FileText, CheckCircle2, Copy, BookOpen } from "lucide-react"

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "০"
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
  return num
    .toString()
    .split("")
    .map((char) => (/\d/.test(char) ? bengaliDigits[parseInt(char)] : char))
    .join("")
}

interface QuestionPaperStatsCardsProps {
  totalPapers?: number
  publishedPapers?: number
  templatePapers?: number
  averageMarks?: number
  isLoading?: boolean
}

export function QuestionPaperStatsCards({
  totalPapers = 0,
  publishedPapers = 0,
  templatePapers = 0,
  averageMarks = 0,
  isLoading = false,
}: QuestionPaperStatsCardsProps) {
  const cards = [
    {
      title: "মোট প্রশ্নপত্র",
      value: `${toBengaliDigits(totalPapers)}টি`,
      subtitle: "ড্রাফট ও প্রস্তুতকৃত প্রশ্নপত্র",
      icon: FileText,
      iconColor: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/40",
    },
    {
      title: "প্রকাশিত প্রশ্নপত্র",
      value: `${toBengaliDigits(publishedPapers)}টি`,
      subtitle: "পরীক্ষার জন্য সক্রিয় ও প্রস্তুত",
      icon: CheckCircle2,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/40",
    },
    {
      title: "টেমপ্লেট প্রশ্নপত্র",
      value: `${toBengaliDigits(templatePapers)}টি`,
      subtitle: "পুনরায় ব্যবহারযোগ্য প্রশ্ন কাঠামো",
      icon: Copy,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-800/40",
    },
    {
      title: "গড় পূর্ণমান",
      value: `${toBengaliDigits(averageMarks)} নম্বর`,
      subtitle: "প্রতিটি প্রশ্নপত্রের গড় মান",
      icon: BookOpen,
      iconColor: "text-teal-600 dark:text-teal-400",
      iconBg: "bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-800/40",
    },
  ]

  if (isLoading) {
    return (
      <div>
        {/* Mobile Minimal Skeleton */}
        <div className="grid grid-cols-2 gap-2 sm:hidden">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-card rounded-xl p-2.5 border border-slate-200/80 dark:border-white/[0.06] shadow-2xs flex items-center gap-2.5 animate-pulse"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-white/10 shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="h-2.5 w-14 bg-slate-200 dark:bg-white/10 rounded" />
                <div className="h-4 w-10 bg-slate-200 dark:bg-white/10 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Skeleton */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-card rounded-2xl p-5 border border-slate-200/80 dark:border-white/[0.06] shadow-xs flex flex-col justify-between animate-pulse select-none"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-slate-200 dark:bg-white/10 rounded" />
                  <div className="h-7 w-24 bg-slate-200 dark:bg-white/10 rounded-md" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/10" />
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                <div className="h-3 w-32 bg-slate-200 dark:bg-white/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <section aria-label="প্রশ্নপত্র পরিসংখ্যান">
      {/* ── Mobile View: Ultra Minimal Compact 2x2 Grid ── */}
      <div className="grid grid-cols-2 gap-2 sm:hidden">
        {cards.map((card, idx) => {
          const Icon = card.icon
          return (
            <div
              key={idx}
              className="bg-card rounded-xl p-2.5 border border-slate-200/80 dark:border-white/[0.06] shadow-2xs flex items-center gap-2.5 min-w-0"
            >
              <div
                className={`w-8 h-8 rounded-lg ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0`}
              >
                <Icon className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-slate-500 dark:text-muted-foreground truncate font-body leading-tight">
                  {card.title}
                </p>
                <p className="text-base font-bold font-headline text-slate-900 dark:text-foreground tracking-tight font-solaiman leading-tight mt-0.5">
                  {card.value}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Desktop & Tablet View: Full KPI Cards ── */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4.5">
        {cards.map((card, idx) => {
          const Icon = card.icon
          return (
            <article
              key={idx}
              className="bg-card rounded-2xl p-5 border border-slate-200/80 dark:border-white/[0.06] shadow-xs hover:shadow-md transition-all duration-200 relative group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-muted-foreground font-body">
                    {card.title}
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-bold font-headline text-slate-900 dark:text-foreground mt-1.5 tracking-tight font-solaiman">
                    {card.value}
                  </h3>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200`}
                >
                  <Icon className="w-5 h-5 stroke-[1.8]" />
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-muted-foreground/80 mt-3 font-body font-normal border-t border-slate-100 dark:border-white/[0.06] pt-3 truncate">
                {card.subtitle}
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
