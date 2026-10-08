"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { BookOpen, Sparkles, ArrowRight, FileText, Layers } from "lucide-react"
import type { AcademicSubjectWithChapters } from "../../../types"

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "০"
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
  return num
    .toString()
    .split("")
    .map((char) => (/\d/.test(char) ? bengaliDigits[parseInt(char)] : char))
    .join("")
}

interface SubjectsGridProps {
  subjects: AcademicSubjectWithChapters[]
  classId: string
  onSelectSubject: (subject: AcademicSubjectWithChapters) => void
  isLoading?: boolean
}

export const SubjectsGrid: React.FC<SubjectsGridProps> = ({
  subjects,
  classId,
  onSelectSubject,
  isLoading,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>("all")

  // Discover available groups across subjects
  const availableGroups = useMemo(() => {
    const groups = new Set<string>()
    subjects.forEach((s) => {
      if (s.group && s.group.trim()) {
        groups.add(s.group.trim())
      }
    })
    return Array.from(groups)
  }, [subjects])

  // Filter subjects by group
  const filteredSubjects = useMemo(() => {
    if (selectedGroup === "all") return subjects
    return subjects.filter((s) => (s.group?.trim() || "") === selectedGroup)
  }, [subjects, selectedGroup])

  return (
    <section aria-labelledby="subjects-heading" className="space-y-4">
      {/* Sub-header with filter tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <h2
            id="subjects-heading"
            className="text-lg font-bold font-headline text-slate-900 dark:text-foreground"
          >
            পাঠ্য বিষয়সমূহ
          </h2>
          <p className="text-xs text-slate-500 dark:text-muted-foreground font-body">
            যেকোনো বিষয়ের অধ্যায় ও প্রশ্ন পর্যালোচনা করতে বিষয় নির্বাচন করুন
          </p>
        </div>

        {/* Group filter pills if groups exist */}
        {availableGroups.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setSelectedGroup("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-body transition-all cursor-pointer whitespace-nowrap ${
                selectedGroup === "all"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground hover:bg-slate-100/80 dark:hover:bg-white/[0.04]"
              }`}
            >
              সকল বিষয়
            </button>
            {availableGroups.map((grp) => {
              const isActive = selectedGroup === grp
              return (
                <button
                  key={grp}
                  type="button"
                  onClick={() => setSelectedGroup(grp)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-body transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground hover:bg-slate-100/80 dark:hover:bg-white/[0.04]"
                  }`}
                >
                  {grp}
                </button>
              )
            })}
          </div>
        )}
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
                {/* Header: Icon, Subject Name Skeleton, Code Skeleton & Question Count Skeleton */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100 dark:border-primary/20 text-indigo-600 dark:text-primary flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 stroke-[1.8]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Subject Name Skeleton */}
                        <div className="h-6 w-28 bg-slate-200/80 dark:bg-white/10 rounded-md animate-pulse" />
                        {/* Code Skeleton */}
                        <div className="h-4 w-10 bg-slate-100 dark:bg-white/[0.06] rounded animate-pulse" />
                      </div>
                      {/* English name / group skeleton */}
                      <div className="h-3.5 w-20 bg-slate-100 dark:bg-white/[0.06] rounded-md animate-pulse mt-1.5" />
                    </div>
                  </div>

                  {/* Question Count & Question Types Badges Skeleton */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium text-indigo-700 dark:text-primary bg-indigo-50/80 dark:bg-primary/10 border border-indigo-100 dark:border-primary/20 shrink-0">
                      <FileText className="w-3.5 h-3.5 stroke-[2]" />
                      <div className="h-3.5 w-10 bg-indigo-200/70 dark:bg-primary/20 rounded-full animate-pulse" />
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 shrink-0">
                      <Layers className="w-3 h-3 stroke-[2]" />
                      <div className="h-3 w-12 bg-amber-200/70 dark:bg-amber-800/30 rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Chapters Preview Chips Skeletons */}
                <div className="pt-2 min-h-[58px] flex flex-wrap gap-1.5 items-center">
                  <div className="h-6 w-20 bg-slate-100 dark:bg-white/[0.06] rounded-lg animate-pulse" />
                  <div className="h-6 w-24 bg-slate-100 dark:bg-white/[0.06] rounded-lg animate-pulse" />
                  <div className="h-6 w-16 bg-slate-100 dark:bg-white/[0.06] rounded-lg animate-pulse" />
                  <div className="h-6 w-14 bg-slate-100 dark:bg-white/[0.06] rounded-lg animate-pulse" />
                </div>
              </div>

              {/* Card Footer CTA */}
              <div className="px-6 py-4 bg-slate-50/60 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs font-body">
                <div className="h-3.5 w-24 bg-slate-100 dark:bg-white/[0.06] rounded animate-pulse" />
                <div className="inline-flex items-center gap-1 font-semibold text-indigo-600/70 dark:text-primary/70">
                  <span>অধ্যায়সমূহ দেখুন</span>
                  <span aria-hidden="true">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.06] p-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-white/[0.04] border border-indigo-100 dark:border-white/[0.08] flex items-center justify-center text-indigo-600 dark:text-muted-foreground mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-foreground font-headline">
            কোনো বিষয় পাওয়া যায়নি
          </h3>
          <p className="text-xs text-slate-500 dark:text-muted-foreground font-body mt-1 max-w-sm">
            অনুসন্ধান বা নির্বাচিত বিভাগের সাথে মিল রেখে কোনো বিষয় মেলেনি।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map((sub) => {
            const previewChapters = sub.chapters.slice(0, 4)
            const remainingCount = sub.chapters.length - previewChapters.length

            return (
              <Link
                key={sub.id}
                href={`/question-bank/${classId}/${sub.id}`}
                className="block outline-hidden group"
              >
                <article
                  className="bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-primary/40 transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer select-none h-full"
                >
                  {/* Upper Body */}
                  <div className="p-6 pb-4">
                    {/* Header: Icon, Subject Name, Code & Question Count */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100 dark:border-primary/20 text-indigo-600 dark:text-primary flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-primary dark:group-hover:text-primary-foreground transition-colors duration-200 shrink-0">
                          <BookOpen className="w-5 h-5 stroke-[1.8]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-lg font-bold font-headline text-slate-900 dark:text-foreground group-hover:text-indigo-600 dark:group-hover:text-primary transition-colors truncate">
                              {sub.nameBn}
                            </h3>
                            {sub.code && (
                              <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-muted-foreground">
                                {sub.code}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-medium text-slate-400 dark:text-muted-foreground font-body mt-0.5 truncate">
                            {sub.nameEn}
                            {sub.group ? ` • ${sub.group}` : ""}
                          </p>
                        </div>
                      </div>

                      {/* Badges: Question Count & Question Types */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium text-indigo-700 dark:text-primary bg-indigo-50/80 dark:bg-primary/10 border border-indigo-100 dark:border-primary/20 shrink-0">
                          <FileText className="w-3.5 h-3.5 stroke-[2]" />
                          <span className="font-semibold font-headline">
                            {toBengaliDigits(sub.questionCount)} প্রশ্ন
                          </span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 shrink-0">
                          <Layers className="w-3 h-3 stroke-[2]" />
                          <span className="font-semibold font-headline">
                            {toBengaliDigits(sub.questionTypesCount ?? 0)} ধরনের প্রশ্ন
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Chapters Preview Chips */}
                    <div className="pt-2 min-h-[58px] flex flex-wrap gap-1.5 items-center">
                      {previewChapters.length > 0 ? (
                        previewChapters.map((ch, idx) => (
                          <span
                            key={ch.id}
                            className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-white/[0.1] transition-colors font-body truncate max-w-[140px]"
                          >
                            {toBengaliDigits(idx + 1)}. {ch.nameBn}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-muted-foreground font-body italic">
                          অধ্যায় তালিকা প্রক্রিয়াকরণাধীন
                        </span>
                      )}
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
                      {toBengaliDigits(sub.chaptersCount)}টি অধ্যায় • {toBengaliDigits(sub.questionTypesCount ?? 0)} ধরনের প্রশ্ন
                    </span>
                    <div className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-primary group-hover:text-indigo-700 dark:group-hover:text-primary/90 group-hover:translate-x-0.5 transition-all">
                      <span>প্রশ্ন ভাণ্ডার অন্বেষণ করুন</span>
                      <span aria-hidden="true">→</span>
                    </div>
                  </div>
                </article>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
