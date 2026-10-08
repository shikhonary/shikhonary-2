"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Search,
  BookOpen,
  ChevronRight,
  X,
  Sparkles,
  Layers,
  Award,
  FileText,
  GraduationCap,
  SlidersHorizontal,
  HelpCircle,
  Headphones,
  ArrowRight,
  Plus,
  LayoutGrid,
} from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { CurriculumGuideBanner } from "../classes/curriculum-guide-banner"
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

interface MobileClassDetailProps {
  classNameBn: string
  classNameEn: string
  classId: string
  totalSubjects: number
  totalChapters: number
  totalQuestions: number
  subjects: AcademicSubjectWithChapters[]
  isLoading?: boolean
  search: string
  onSearchChange: (val: string) => void
  onSelectSubject: (sub: AcademicSubjectWithChapters) => void
}

export const MobileClassDetail: React.FC<MobileClassDetailProps> = ({
  classNameBn,
  classNameEn,
  classId,
  totalSubjects,
  totalChapters,
  totalQuestions,
  subjects,
  isLoading,
  search,
  onSearchChange,
  onSelectSubject,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>("all")

  // Discover available groups
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
    <div className="bg-background text-foreground min-h-screen flex flex-col pb-28 relative w-full min-w-0 max-w-full overflow-x-hidden">
      {/* ── Top Header Section ─────────────────────────────────────── */}
      <header className="sticky top-0 bg-background/90 backdrop-blur-xl z-40 border-b border-border/40 p-4 space-y-3.5 shadow-xs w-full min-w-0">
        <div className="flex items-center justify-between gap-2 min-w-0 w-full">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <Link
              href="/question-bank"
              className="w-9 h-9 rounded-full bg-muted/60 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
              title="সকল শ্রেণি"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                {isLoading ? (
                  <div className="h-5 w-20 bg-muted/70 dark:bg-white/10 rounded-md animate-pulse" />
                ) : (
                  <h1 className="text-lg font-bold font-headline text-foreground leading-tight truncate">
                    {classNameBn}
                  </h1>
                )}
                <span className="px-1.5 py-0.2 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20 shrink-0">
                  সক্রিয়
                </span>
              </div>
              {isLoading ? (
                <div className="h-3 w-40 bg-muted/40 dark:bg-white/5 rounded-md animate-pulse mt-1" />
              ) : (
                <p className="text-[11px] text-muted-foreground font-body truncate">
                  Class {classNameEn} • {toBengaliDigits(totalSubjects)} বিষয় • {toBengaliDigits(totalChapters)} অধ্যায়
                </p>
              )}
            </div>
          </div>

          <Link
            href={`/question-papers/create?classId=${encodeURIComponent(classId)}`}
            className="h-8 px-2.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>প্রশ্নপত্র</span>
          </Link>
        </div>

        {/* Pill Search Input Bar */}
        <div className="relative w-full min-w-0">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <Search className="w-4 h-4" />
          </div>
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="বিষয় বা অধ্যায় খুঁজুন..."
            className="w-full h-11 pl-10 pr-9 bg-card border-border/60 text-foreground rounded-full shadow-xs placeholder:text-muted-foreground text-xs font-body focus:bg-card focus:border-primary/60 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* ── Main Stream Content ────────────────────────────────────── */}
      <main className="p-4 space-y-4">
        {/* Interactive Quick Action Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/95 to-primary/80 p-4 text-primary-foreground shadow-md">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-2">
            <div className="inline-flex items-center gap-1.5 self-start px-2 py-0.5 rounded-full bg-white/15 text-primary-foreground text-[11px] font-bold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{classNameBn} প্রশ্নপত্র জেনারেটর</span>
            </div>

            <h3 className="text-base font-bold font-headline leading-tight">
              এই শ্রেণির কাস্টম প্রশ্নপত্র সাজান
            </h3>

            <p className="text-xs text-primary-foreground/90 font-body max-w-[280px]">
              সৃজনশীল, বহুনির্বাচনি ও সংক্ষিপ্ত প্রশ্ন নির্বাচন করে ঝটপট প্রিন্ট রেডি করুন
            </p>

            <div className="pt-1">
              <Link
                href={`/question-papers/create?classId=${encodeURIComponent(classId)}`}
                className="inline-flex items-center gap-1.5 h-8 px-4 rounded-full bg-card text-foreground font-bold text-xs shadow-xs active:scale-95 transition-transform hover:bg-card/90"
              >
                <span>শুরু করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Key Statistics Metrics (2x2 Grid) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground font-headline">
              শ্রেণি পরিসংখ্যান
            </span>
            <span className="text-[11px] text-muted-foreground font-body">
              এনসিটিবি ২০২৪
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Metric 1: মোট বিষয় */}
            <div className="bg-card rounded-2xl p-3.5 border border-border/50 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-body">
                  পাঠ্য বিষয়
                </span>
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              {isLoading ? (
                <div className="h-6 w-14 bg-muted/60 dark:bg-white/10 rounded-md animate-pulse my-0.5" />
              ) : (
                <div className="text-xl sm:text-2xl font-extrabold font-headline text-foreground leading-none">
                  {toBengaliDigits(totalSubjects)}টি
                </div>
              )}
              <p className="text-[10px] text-muted-foreground font-body mt-1 truncate">
                অন্তর্ভুক্ত বিষয়
              </p>
            </div>

            {/* Metric 2: মোট অধ্যায় */}
            <div className="bg-card rounded-2xl p-3.5 border border-border/50 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-body">
                  মোট অধ্যায়
                </span>
                <div className="w-7 h-7 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              {isLoading ? (
                <div className="h-6 w-14 bg-muted/60 dark:bg-white/10 rounded-md animate-pulse my-0.5" />
              ) : (
                <div className="text-xl sm:text-2xl font-extrabold font-headline text-foreground leading-none">
                  {toBengaliDigits(totalChapters)}টি
                </div>
              )}
              <p className="text-[10px] text-muted-foreground font-body mt-1 truncate">
                অধ্যায় বিন্যাস
              </p>
            </div>

            {/* Metric 3: সংরক্ষিত প্রশ্ন */}
            <div className="bg-card rounded-2xl p-3.5 border border-border/50 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-body">
                  সংরক্ষিত প্রশ্ন
                </span>
                <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              {isLoading ? (
                <div className="h-6 w-14 bg-muted/60 dark:bg-white/10 rounded-md animate-pulse my-0.5" />
              ) : (
                <div className="text-xl sm:text-2xl font-extrabold font-headline text-foreground leading-none">
                  {toBengaliDigits(totalQuestions)}টি
                </div>
              )}
              <p className="text-[10px] text-muted-foreground font-body mt-1 truncate">
                প্রশ্নভাণ্ডার
              </p>
            </div>

            {/* Metric 4: শিক্ষাক্রম মান */}
            <div className="bg-card rounded-2xl p-3.5 border border-border/50 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-body">
                  কারিকুলাম মান
                </span>
                <div className="w-7 h-7 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold font-headline text-foreground leading-none">
                এনসিটিবি
              </div>
              <p className="text-[10px] text-muted-foreground font-body mt-1 truncate">
                জাতীয় সিলেবাস
              </p>
            </div>
          </div>
        </div>

        {/* Group Filter Chips */}
        {availableGroups.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-headline text-foreground">
                বিষয়সমূহ
              </h3>
              {isLoading ? (
                <div className="h-4 w-14 bg-muted/60 dark:bg-white/10 rounded-full animate-pulse" />
              ) : (
                <span className="text-xs font-bold text-primary font-body">
                  {toBengaliDigits(filteredSubjects.length)}টি উপলব্ধ
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar select-none overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => setSelectedGroup("all")}
                className={`h-9 px-4 rounded-full text-xs font-semibold font-body whitespace-nowrap shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedGroup === "all"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card text-muted-foreground hover:text-foreground border border-border/50"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>সকল বিষয়</span>
              </button>
              {availableGroups.map((grp) => {
                const isActive = selectedGroup === grp
                return (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => setSelectedGroup(grp)}
                    className={`h-9 px-4 rounded-full text-xs font-semibold font-body whitespace-nowrap shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-card text-muted-foreground hover:text-foreground border border-border/50"
                    }`}
                  >
                    <span>{grp}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Subject Cards Stream */}
        <div className="space-y-3 pt-1">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-card rounded-2xl p-4 border border-border/50 shadow-xs flex flex-col gap-3 select-none"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-xs shrink-0">
                        <BookOpen className="w-5 h-5 stroke-[1.8]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-24 bg-muted/70 dark:bg-white/10 rounded-md animate-pulse" />
                          <div className="h-3.5 w-10 bg-muted/50 dark:bg-white/5 rounded animate-pulse" />
                        </div>
                        <div className="h-3 w-16 bg-muted/40 dark:bg-white/5 rounded-md animate-pulse mt-1.5" />
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted/60 text-primary border border-border/40 text-xs font-semibold">
                        <FileText className="w-3.5 h-3.5" />
                        <div className="h-3.5 w-10 bg-primary/20 rounded-full animate-pulse" />
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-semibold">
                        <Layers className="w-3 h-3" />
                        <div className="h-3 w-8 bg-amber-500/20 rounded-full animate-pulse" />
                      </div>
                    </div>
                  </div>

                  {/* Chapters Preview Skeletons */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <div className="h-6 w-20 rounded-full bg-muted/50 border border-border/30 animate-pulse" />
                    <div className="h-6 w-24 rounded-full bg-muted/50 border border-border/30 animate-pulse" />
                    <div className="h-6 w-16 rounded-full bg-muted/50 border border-border/30 animate-pulse" />
                  </div>

                  {/* Card Footer */}
                  <div className="pt-2.5 mt-0.5 flex items-center justify-between border-t border-border/40">
                    <div className="h-3.5 w-24 bg-muted/40 dark:bg-white/5 rounded animate-pulse" />
                    <span className="inline-flex items-center gap-1 text-primary/70 text-xs font-bold">
                      <span>অধ্যায়সমূহ দেখুন</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center bg-card rounded-2xl border border-border/50 p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground font-headline">
                কোনো বিষয় মেলেনি
              </h3>
              <p className="text-xs text-muted-foreground font-body mt-1">
                অন্য নাম লিখে অনুসন্ধান করুন
              </p>
            </div>
          ) : (
            filteredSubjects.map((sub) => {
              const previewChapters = sub.chapters.slice(0, 3)
              const remaining = sub.chapters.length - previewChapters.length

              return (
                <Link
                  key={sub.id}
                  href={`/question-bank/${classId}/${sub.id}`}
                  className="block outline-hidden group"
                >
                  <article
                    className="bg-card rounded-2xl p-4 border border-border/50 shadow-xs flex flex-col gap-3 transition-all hover:shadow-md active:border-primary/50 cursor-pointer select-none"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-xs shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <BookOpen className="w-5 h-5 stroke-[1.8]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-base font-bold font-headline text-foreground leading-tight truncate group-hover:text-primary transition-colors">
                              {sub.nameBn}
                            </h4>
                            {sub.code && (
                              <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-muted/60 text-muted-foreground">
                                {sub.code}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground font-body leading-none truncate block mt-0.5">
                            {sub.nameEn}
                            {sub.group ? ` • ${sub.group}` : ""}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted/60 text-primary border border-border/40 text-xs font-semibold">
                          <FileText className="w-3.5 h-3.5" />
                          <span>{toBengaliDigits(sub.questionCount)} প্রশ্ন</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-semibold">
                          <Layers className="w-3 h-3" />
                          <span>{toBengaliDigits(sub.questionTypesCount ?? 0)} ধরণ প্রশ্ন</span>
                        </div>
                      </div>
                    </div>

                    {/* Chapters Preview Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {previewChapters.map((ch, idx) => (
                        <span
                          key={ch.id}
                          className="px-3 py-1 rounded-full bg-muted/50 text-foreground text-xs font-medium border border-border/30 font-body truncate max-w-[125px]"
                        >
                          {toBengaliDigits(idx + 1)}. {ch.nameBn}
                        </span>
                      ))}
                      {remaining > 0 && (
                        <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold font-body">
                          +{toBengaliDigits(remaining)}
                        </span>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="pt-2.5 mt-0.5 flex items-center justify-between border-t border-border/40">
                      <span className="text-xs text-muted-foreground font-body flex items-center gap-1">
                        <span>{toBengaliDigits(sub.chaptersCount)}টি অধ্যায় • {toBengaliDigits(sub.questionTypesCount ?? 0)} ধরণ প্রশ্ন</span>
                      </span>

                      <div
                        className="inline-flex items-center gap-1 text-primary text-xs font-bold group cursor-pointer"
                      >
                        <span>প্রশ্ন ভাণ্ডার অন্বেষণ করুন</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </article>
                </Link>
              )
            })
          )}
        </div>

        {/* Interactive Question Bank Tips Banner */}
        <CurriculumGuideBanner />
      </main>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-20 right-4 z-40 pointer-events-none">
        <Link
          href={`/question-papers/create?classId=${encodeURIComponent(classId)}`}
          className="pointer-events-auto h-12 px-4 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 shadow-lg hover:opacity-95 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন প্রশ্নপত্র তৈরি</span>
        </Link>
      </div>
    </div>
  )
}
