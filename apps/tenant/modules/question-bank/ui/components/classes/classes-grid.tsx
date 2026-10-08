"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { GraduationCap, BookOpen, ArrowRight, Sparkles } from "lucide-react"
import type { AcademicClassItem } from "../../../types"

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "০"
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
  return num
    .toString()
    .split("")
    .map((char) => (/\d/.test(char) ? bengaliDigits[parseInt(char)] : char))
    .join("")
}

type EducationLevel = "all" | "primary" | "lower_secondary" | "secondary"

interface ClassesGridProps {
  classes: AcademicClassItem[]
  isLoading?: boolean
  onSelectClass: (c: AcademicClassItem) => void
}

export const ClassesGrid: React.FC<ClassesGridProps> = ({
  classes,
  isLoading,
  onSelectClass,
}) => {
  const [activeLevel, setActiveLevel] = useState<EducationLevel>("all")

  // Filter classes by education level
  const filteredClasses = useMemo(() => {
    if (activeLevel === "all") return classes

    return classes.filter((cls) => {
      const pos = cls.position ?? 0
      if (activeLevel === "primary") {
        // Class 1 to 5
        return pos >= 1 && pos <= 5
      }
      if (activeLevel === "lower_secondary") {
        // Class 6 to 8
        return pos >= 6 && pos <= 8
      }
      if (activeLevel === "secondary") {
        // Class 9 to 12
        return pos >= 9
      }
      return true
    })
  }, [classes, activeLevel])

  const levelTabs: { id: EducationLevel; label: string }[] = [
    { id: "all", label: "সকল শ্রেণি" },
    { id: "primary", label: "প্রাথমিক" },
    { id: "lower_secondary", label: "নিম্ন মাধ্যমিক" },
    { id: "secondary", label: "মাধ্যমিক" },
  ]

  return (
    <section aria-labelledby="classes-heading" className="space-y-4">
      {/* Sub-header with filter tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <h2
            id="classes-heading"
            className="text-lg font-bold font-headline text-slate-900 dark:text-foreground"
          >
            উপলব্ধ শ্রেণিসমূহ
          </h2>
          <p className="text-xs text-slate-500 dark:text-muted-foreground font-body">
            যেকোনো শ্রেণির প্রশ্নসমূহ এক্সপ্লোর বা তৈরি করতে বিষয় নির্বাচন করুন
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {levelTabs.map((tab) => {
            const isActive = activeLevel === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveLevel(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-body transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground hover:bg-slate-100/80 dark:hover:bg-white/[0.04]"
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex flex-col justify-between overflow-hidden select-none"
            >
              {/* Upper Body */}
              <div className="p-6 pb-4">
                {/* Header: Icon, Class Name Skeleton & Subject Count Badge Skeleton */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100 dark:border-primary/20 text-indigo-600 dark:text-primary flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5 stroke-[1.8]" />
                    </div>
                    <div>
                      {/* Class Name BN Skeleton */}
                      <div className="h-6 w-24 bg-slate-200/80 dark:bg-white/10 rounded-md animate-pulse" />
                      {/* Class Name EN Skeleton */}
                      <div className="h-3.5 w-16 bg-slate-100 dark:bg-white/[0.06] rounded-md animate-pulse mt-1.5" />
                    </div>
                  </div>

                  {/* Subject Count Badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-indigo-700 dark:text-primary bg-indigo-50/80 dark:bg-primary/10 border border-indigo-100 dark:border-primary/20 shrink-0">
                    <BookOpen className="w-3.5 h-3.5 stroke-[2]" />
                    <div className="h-3.5 w-10 bg-indigo-200/70 dark:bg-primary/20 rounded-full animate-pulse" />
                  </div>
                </div>

                {/* Subject Badges List Skeletons */}
                <div className="pt-2 min-h-[58px] flex flex-wrap gap-1.5 items-center">
                  <div className="h-6 w-16 bg-slate-100 dark:bg-white/[0.06] rounded-lg animate-pulse" />
                  <div className="h-6 w-24 bg-slate-100 dark:bg-white/[0.06] rounded-lg animate-pulse" />
                  <div className="h-6 w-20 bg-slate-100 dark:bg-white/[0.06] rounded-lg animate-pulse" />
                  <div className="h-6 w-14 bg-slate-100 dark:bg-white/[0.06] rounded-lg animate-pulse" />
                  <div className="h-6 w-12 bg-slate-100 dark:bg-white/[0.06] rounded-lg animate-pulse" />
                </div>
              </div>

              {/* Footer Link & Action */}
              <div className="px-6 py-3.5 bg-slate-50/60 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-muted-foreground font-body">
                  পাঠ্যসূচি ও প্রশ্নভাণ্ডার
                </span>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600/70 dark:text-primary/70">
                  <span>বিষয়সমূহ দেখুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.06] p-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-white/[0.04] border border-indigo-100 dark:border-white/[0.08] flex items-center justify-center text-indigo-600 dark:text-muted-foreground mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-foreground font-headline">
            কোনো শ্রেণি পাওয়া যায়নি
          </h3>
          <p className="text-xs text-slate-500 dark:text-muted-foreground font-body mt-1 max-w-sm">
            নির্বাচিত ফিল্টার বা অনুসন্ধান অনুযায়ী কোনো শ্রেণি মেলেনি। অনুগ্রহ করে ফিল্টার পরিবর্তন করুন।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map((cls) => {
            const previewSubjects = cls.subjects.slice(0, 5)
            const remainingCount = cls.subjects.length - previewSubjects.length

            return (
              <Link
                key={cls.id}
                href={`/question-bank/${cls.id}`}
                className="bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-primary/40 transition-all duration-200 flex flex-col justify-between overflow-hidden group cursor-pointer select-none"
              >
                {/* Upper Body */}
                <div className="p-6 pb-4">
                  {/* Header: Icon, Class Name, Index Tag & Subject Count */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100 dark:border-primary/20 text-indigo-600 dark:text-primary flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-primary dark:group-hover:text-primary-foreground transition-colors duration-200 shrink-0">
                        <GraduationCap className="w-5 h-5 stroke-[1.8]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold font-headline text-slate-900 dark:text-foreground group-hover:text-indigo-600 dark:group-hover:text-primary transition-colors">
                          {cls.nameBn}
                        </h3>
                        <p className="text-xs font-medium text-slate-400 dark:text-muted-foreground font-body mt-0.5">
                          {cls.nameEn}
                        </p>
                      </div>
                    </div>

                    {/* Subject Count Badge */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-indigo-700 dark:text-primary bg-indigo-50/80 dark:bg-primary/10 border border-indigo-100 dark:border-primary/20 shrink-0">
                      <BookOpen className="w-3.5 h-3.5 stroke-[2]" />
                      <span className="font-semibold font-headline">
                        {toBengaliDigits(cls.subjectCount)} বিষয়
                      </span>
                    </div>
                  </div>

                  {/* Subject Badges List */}
                  <div className="pt-2 min-h-[58px] flex flex-wrap gap-1.5 items-center">
                    {previewSubjects.map((sub) => (
                      <span
                        key={sub.id}
                        className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-white/[0.1] transition-colors font-body truncate max-w-[130px]"
                      >
                        {sub.nameBn}
                      </span>
                    ))}
                    {remainingCount > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40 font-body">
                        +{toBengaliDigits(remainingCount)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer CTA */}
                <div className="px-6 py-4 bg-slate-50/60 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs font-body">
                  <span className="text-slate-400 dark:text-muted-foreground font-medium">
                    পাঠ্যসূচি ও প্রশ্নভাণ্ডার
                  </span>
                  <div className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-primary group-hover:text-indigo-700 dark:group-hover:text-primary/90 group-hover:translate-x-0.5 transition-all">
                    <span>বিষয়সমূহ দেখুন</span>
                    <span aria-hidden="true">→</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}

