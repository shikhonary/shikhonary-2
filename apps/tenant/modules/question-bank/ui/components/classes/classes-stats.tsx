"use client"

import React from "react"
import { GraduationCap, BookOpen, Layers, Award } from "lucide-react"

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "০"
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
  return num
    .toString()
    .split("")
    .map((char) => (/\d/.test(char) ? bengaliDigits[parseInt(char)] : char))
    .join("")
}

interface ClassesStatsProps {
  totalClasses?: number
  totalSubjects?: number
  isLoading?: boolean
}

export const ClassesStats: React.FC<ClassesStatsProps> = ({
  totalClasses = 0,
  totalSubjects = 0,
  isLoading,
}) => {

  const cards = [
    {
      title: "মোট শ্রেণি",
      value: `${toBengaliDigits(totalClasses)}টি`,
      subtitle: "প্রাথমিক, মাধ্যমিক ও উচ্চ মাধ্যমিক",
      icon: GraduationCap,
      iconColor: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/40",
      isDynamic: true,
    },
    {
      title: "পাঠ্য বিষয়",
      value: `${toBengaliDigits(totalSubjects)}টি`,
      subtitle: "বাছাইকৃত জাতীয় শিক্ষাক্রম বিষয়",
      icon: BookOpen,
      iconColor: "text-sky-600 dark:text-sky-400",
      iconBg: "bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800/40",
      isDynamic: true,
    },
    {
      title: "প্রশ্ন ক্যাটাগরি",
      value: "৪০+ ধরন",
      subtitle: "সৃজনশীল, বহুনির্বাচনি ও নির্মিতি",
      icon: Layers,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-800/40",
      isDynamic: false,
    },
    {
      title: "শিক্ষাক্রম মান",
      value: "এনসিটিবি",
      subtitle: "নতুন জাতীয় শিক্ষাক্রম অনুসারী",
      icon: Award,
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-800/40",
      isDynamic: false,
    },
  ]

  return (
    <section aria-label="পরিসংখ্যান সারসংক্ষেপ" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
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
                {isLoading && card.isDynamic ? (
                  <div className="h-8 w-16 bg-slate-200/80 dark:bg-white/10 rounded-md animate-pulse mt-1.5" />
                ) : (
                  <h3 className="text-2xl sm:text-3xl font-bold font-headline text-slate-900 dark:text-foreground mt-1.5 tracking-tight">
                    {card.value}
                  </h3>
                )}
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
    </section>
  )
}

