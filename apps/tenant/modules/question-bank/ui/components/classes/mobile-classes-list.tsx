"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import {
  Search,
  GraduationCap,
  BookOpen,
  ChevronRight,
  X,
  Sparkles,
  Layers,
  Award,
  FileText,
  SlidersHorizontal,
  HelpCircle,
  Headphones,
  ArrowRight,
  Plus,
  LayoutGrid,
} from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { CurriculumGuideBanner } from "./curriculum-guide-banner"
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

interface MobileClassesListProps {
  classes: AcademicClassItem[]
  isLoading?: boolean
  search: string
  onSearchChange: (val: string) => void
  onSelectClass: (c: AcademicClassItem) => void
  totalClasses?: number
  totalSubjects?: number
}

export const MobileClassesList: React.FC<MobileClassesListProps> = ({
  classes,
  isLoading,
  search,
  onSearchChange,
  onSelectClass,
  totalClasses = 0,
  totalSubjects = 0,
}) => {
  const [activeLevel, setActiveLevel] = useState<EducationLevel>("all")

  // Filter classes by education level
  const filteredClasses = useMemo(() => {
    if (activeLevel === "all") return classes

    return classes.filter((cls) => {
      const pos = cls.position ?? 0
      if (activeLevel === "primary") return pos >= 1 && pos <= 5
      if (activeLevel === "lower_secondary") return pos >= 6 && pos <= 8
      if (activeLevel === "secondary") return pos >= 9
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
    <div className="bg-background text-foreground min-h-screen flex flex-col pb-28 relative w-full min-w-0 max-w-full overflow-x-hidden">
      {/* ── Top Header Section (with Search & Tune) ────────────────── */}
      <header className="sticky top-0 bg-background/90 backdrop-blur-xl z-40 border-b border-border/40 p-4 space-y-3.5 shadow-xs w-full min-w-0">
        <div className="flex items-center justify-between gap-2 min-w-0 w-full">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs shrink-0">
              <GraduationCap className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-bold font-headline text-foreground leading-tight truncate">
                  প্রশ্ন ব্যাংক
                </h1>
                <span className="px-1.5 py-0.2 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20 shrink-0">
                  লাইভ
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-body truncate">
                জাতীয় শিক্ষাক্রম অনুযায়ী শ্রেণিভিত্তিক প্রশ্নভাণ্ডার
              </p>
            </div>
          </div>

          <button
            type="button"
            className="w-9 h-9 rounded-full bg-muted/60 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
            title="ফিল্টার"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Pill Search Input Bar */}
        <div className="relative w-full min-w-0">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <Search className="w-4 h-4" />
          </div>
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="শ্রেণি বা বিষয় খুঁজুন..."
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
        {/* Interactive Quick Action Banner ("স্মার্ট প্রশ্নপত্র জেনারেটর") */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/95 to-primary/80 p-4 text-primary-foreground shadow-md">
          {/* Background decorative glow */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-2">
            <div className="inline-flex items-center gap-1.5 self-start px-2 py-0.5 rounded-full bg-white/15 text-primary-foreground text-[11px] font-bold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>স্মার্ট প্রশ্নপত্র জেনারেটর</span>
            </div>

            <h3 className="text-base font-bold font-headline leading-tight">
              নতুন প্রশ্নপত্র তৈরি করুন
            </h3>

            <p className="text-xs text-primary-foreground/90 font-body max-w-[280px]">
              সৃজনশীল (CQ), বহুনির্বাচনি (MCQ) ও নির্মিতি অংশ সহজে সাজান
            </p>

            <div className="pt-1">
              <Link
                href="/question-papers/create"
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
              সার্বিক পরিসংখ্যান
            </span>
            <span className="text-[11px] text-muted-foreground font-body">
              সংশোধিত ২০২৬
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Metric 1: মোট শ্রেণি */}
            <div className="bg-card rounded-2xl p-3.5 border border-border/50 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-body">
                  মোট শ্রেণি
                </span>
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
              </div>
              {isLoading ? (
                <div className="h-6 w-16 bg-muted/60 dark:bg-white/10 rounded-md animate-pulse my-0.5" />
              ) : (
                <div className="text-xl sm:text-2xl font-extrabold font-headline text-foreground leading-none">
                  {toBengaliDigits(totalClasses)}টি
                </div>
              )}
              <p className="text-[10px] text-muted-foreground font-body mt-1 truncate">
                প্রাথমিক ও মাধ্যমিক
              </p>
            </div>

            {/* Metric 2: পাঠ্য বিষয় */}
            <div className="bg-card rounded-2xl p-3.5 border border-border/50 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-body">
                  পাঠ্য বিষয়
                </span>
                <div className="w-7 h-7 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              {isLoading ? (
                <div className="h-6 w-16 bg-muted/60 dark:bg-white/10 rounded-md animate-pulse my-0.5" />
              ) : (
                <div className="text-xl sm:text-2xl font-extrabold font-headline text-foreground leading-none">
                  {toBengaliDigits(totalSubjects)}টি
                </div>
              )}
              <p className="text-[10px] text-muted-foreground font-body mt-1 truncate">
                বাছাইকৃত শিক্ষাক্রম বিষয়
              </p>
            </div>

            {/* Metric 3: প্রশ্ন ক্যাটাগরি */}
            <div className="bg-card rounded-2xl p-3.5 border border-border/50 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-body">
                  প্রশ্ন ক্যাটাগরি
                </span>
                <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold font-headline text-foreground leading-none">
                ৪০+ ধরন
              </div>
              <p className="text-[10px] text-muted-foreground font-body mt-1 truncate">
                সৃজনশীল ও বহুনির্বাচনি
              </p>
            </div>

            {/* Metric 4: শিক্ষাক্রম মান */}
            <div className="bg-card rounded-2xl p-3.5 border border-border/50 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-body">
                  শিক্ষাক্রম মান
                </span>
                <div className="w-7 h-7 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold font-headline text-foreground leading-none">
                এনসিটিবি
              </div>
              <p className="text-[10px] text-muted-foreground font-body mt-1 truncate">
                জাতীয় সিলেবাস অনুসারী
              </p>
            </div>
          </div>
        </div>

        {/* Filter Chips (Horizontal Slider) */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-headline text-foreground">
              শ্রেণিসমূহ
            </h3>
            {isLoading ? (
              <div className="h-4 w-16 bg-muted/60 dark:bg-white/10 rounded-full animate-pulse" />
            ) : (
              <span className="text-xs font-bold text-primary font-body">
                {toBengaliDigits(filteredClasses.length)}টি উপলব্ধ
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar select-none overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {levelTabs.map((tab) => {
              const isActive = activeLevel === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveLevel(tab.id)}
                  className={`h-9 px-4 rounded-full text-xs font-semibold font-body whitespace-nowrap shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ${isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card text-muted-foreground hover:text-foreground border border-border/50"
                    }`}
                >
                  {tab.id === "all" && <LayoutGrid className="w-3.5 h-3.5" />}
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Available Classes List (Vertical Stacking Cards) */}
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
                        <GraduationCap className="w-5 h-5 stroke-[1.8]" />
                      </div>
                      <div className="min-w-0">
                        <div className="h-5 w-24 bg-muted/70 dark:bg-white/10 rounded-md animate-pulse" />
                        <div className="h-3 w-16 bg-muted/40 dark:bg-white/5 rounded-md animate-pulse mt-1.5" />
                      </div>
                    </div>

                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted/60 text-primary border border-border/40 text-xs font-semibold shrink-0">
                      <BookOpen className="w-3.5 h-3.5" />
                      <div className="h-3.5 w-10 bg-primary/20 rounded-full animate-pulse" />
                    </div>
                  </div>

                  {/* Subject Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <div className="h-6 w-16 rounded-full bg-muted/50 border border-border/30 animate-pulse" />
                    <div className="h-6 w-20 rounded-full bg-muted/50 border border-border/30 animate-pulse" />
                    <div className="h-6 w-14 rounded-full bg-muted/50 border border-border/30 animate-pulse" />
                    <div className="h-6 w-12 rounded-full bg-muted/50 border border-border/30 animate-pulse" />
                  </div>

                  {/* Card Footer */}
                  <div className="pt-2.5 mt-0.5 flex items-center justify-between border-t border-border/40">
                    <span className="text-xs text-muted-foreground font-body flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      <span>পাঠ্যসূচি ও প্রশ্নভাণ্ডার</span>
                    </span>

                    <span className="inline-flex items-center gap-1 text-primary/70 text-xs font-bold">
                      <span>বিষয়সমূহ দেখুন</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center bg-card rounded-2xl border border-border/50 p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground font-headline">
                কোনো শ্রেণি মেলেনি
              </h3>
              <p className="text-xs text-muted-foreground font-body mt-1">
                অন্য ফিল্টার বা নাম লিখে অনুসন্ধান করুন
              </p>
            </div>
          ) : (
            filteredClasses.map((cls) => {
              const previewSubjects = cls.subjects.slice(0, 5)
              const remaining = cls.subjects.length - previewSubjects.length

              return (
                <Link
                  key={cls.id}
                  href={`/question-bank/${cls.id}`}
                  className="bg-card rounded-2xl p-4 border border-border/50 shadow-xs flex flex-col gap-3 transition-all hover:shadow-md active:border-primary/50 cursor-pointer select-none"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-xs shrink-0">
                        <GraduationCap className="w-5 h-5 stroke-[1.8]" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-base font-bold font-headline text-foreground leading-tight truncate">
                          {cls.nameBn}
                        </h4>
                        <span className="text-xs text-muted-foreground font-body leading-none truncate block mt-0.5">
                          Class {cls.nameEn}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted/60 text-primary border border-border/40 text-xs font-semibold shrink-0">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{toBengaliDigits(cls.subjectCount)} বিষয়</span>
                    </div>
                  </div>

                  {/* Subject Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {previewSubjects.map((sub) => (
                      <span
                        key={sub.id}
                        className="px-3 py-1 rounded-full bg-muted/50 text-foreground text-xs font-medium border border-border/30 font-body truncate max-w-[125px]"
                      >
                        {sub.nameBn}
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
                      <FileText className="w-3.5 h-3.5" />
                      <span>পাঠ্যসূচি ও প্রশ্নভাণ্ডার</span>
                    </span>

                    <span className="inline-flex items-center gap-1 text-primary text-xs font-bold group">
                      <span>বিষয়সমূহ দেখুন</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              )
            })
          )}
        </div>

        {/* Interactive Question Bank Tips Banner */}
        <CurriculumGuideBanner />
      </main>

      {/* ── Floating Action Button (FAB) ───────────────────────────── */}
      <div className="fixed bottom-20 right-4 z-40 pointer-events-none">
        <Link
          href="/question-papers/create"
          className="pointer-events-auto h-12 px-4 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 shadow-lg hover:opacity-95 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন প্রশ্নপত্র তৈরি</span>
        </Link>
      </div>
    </div>
  )
}
