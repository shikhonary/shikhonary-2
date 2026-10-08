"use client"

import React from "react"
import Link from "next/link"
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Layers,
  Sparkles,
  Bookmark,
  PlusCircle,
  HelpCircle,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import type { SubjectDetailsData } from "../../../types"

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "০"
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
  return num
    .toString()
    .split("")
    .map((char) => (/\d/.test(char) ? bengaliDigits[parseInt(char)] : char))
    .join("")
}

interface SubjectExplorerHeaderProps {
  classId: string
  subjectId: string
  data?: SubjectDetailsData | null
  isLoading?: boolean
  bookmarkedCount?: number
}

export const SubjectExplorerHeader: React.FC<SubjectExplorerHeaderProps> = ({
  classId,
  subjectId,
  data,
  isLoading,
  bookmarkedCount = 0,
}) => {
  if (isLoading || !data) {
    return (
      <div className="bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-6 shadow-xs select-none">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-20 bg-slate-200/80 dark:bg-white/10 rounded animate-pulse" />
          <span className="text-slate-300 dark:text-muted-foreground/40">/</span>
          <div className="h-4 w-24 bg-slate-200/80 dark:bg-white/10 rounded animate-pulse" />
          <span className="text-slate-300 dark:text-muted-foreground/40">/</span>
          <div className="h-4 w-28 bg-slate-200/80 dark:bg-white/10 rounded animate-pulse" />
        </div>

        {/* Body Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100 dark:border-primary/20 shrink-0 animate-pulse" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-40 bg-slate-200/80 dark:bg-white/10 rounded-md animate-pulse" />
                <div className="h-5 w-12 bg-slate-100 dark:bg-white/[0.06] rounded animate-pulse" />
              </div>
              <div className="h-4 w-48 bg-slate-100 dark:bg-white/[0.06] rounded animate-pulse" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="h-9 w-28 bg-slate-100 dark:bg-white/[0.06] rounded-xl animate-pulse" />
            <div className="h-9 w-36 bg-slate-100 dark:bg-white/[0.06] rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  const { class: cls, subject, totalQuestions, totalChapters, totalQuestionTypes } = data

  return (
    <header className="bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-6 shadow-xs relative overflow-hidden">
      {/* Background soft ambient decoration */}
      <div className="absolute -top-16 -right-16 w-56 h-56 bg-indigo-500/5 dark:bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-body mb-4 flex-wrap">
        <Link
          href="/question-bank"
          className="text-slate-500 dark:text-muted-foreground hover:text-indigo-600 dark:hover:text-primary transition-colors flex items-center gap-1"
        >
          <span>প্রশ্ন ব্যাংক</span>
        </Link>
        <span className="text-slate-300 dark:text-muted-foreground/40">/</span>
        <Link
          href={`/question-bank/${classId}`}
          className="text-slate-500 dark:text-muted-foreground hover:text-indigo-600 dark:hover:text-primary transition-colors"
        >
          {cls?.nameBn || cls?.nameEn || "শ্রেণি বিবরণী"}
        </Link>
        <span className="text-slate-300 dark:text-muted-foreground/40">/</span>
        <span className="font-semibold text-slate-900 dark:text-foreground">
          {subject.nameBn}
        </span>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        {/* Left: Icon & Subject Details */}
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100 dark:border-primary/20 text-indigo-600 dark:text-primary flex items-center justify-center shrink-0 shadow-xs">
            <BookOpen className="w-7 h-7 stroke-[1.8]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold font-headline text-slate-900 dark:text-foreground truncate">
                {subject.nameBn}
              </h1>
              {subject.code && (
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-muted-foreground font-semibold">
                  {subject.code}
                </span>
              )}
              {cls && (
                <Badge variant="outline" className="text-xs font-semibold bg-indigo-50/50 dark:bg-primary/5 text-indigo-700 dark:text-primary border-indigo-200/60 dark:border-primary/20">
                  {cls.nameBn}
                </Badge>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-muted-foreground font-body mt-1">
              {subject.nameEn}
              {subject.group ? ` • বিভাগ: ${subject.group}` : ""}
            </p>

            {/* Quick Metrics Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs font-body">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50/80 dark:bg-primary/10 border border-indigo-100 dark:border-primary/20 text-indigo-700 dark:text-primary font-medium">
                <FileText className="w-3.5 h-3.5 stroke-[2]" />
                <span className="font-semibold font-headline">
                  {toBengaliDigits(totalQuestions)}টি
                </span>
                <span>প্রশ্ন সংরক্ষিত</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 font-medium">
                <Layers className="w-3.5 h-3.5 stroke-[2]" />
                <span className="font-semibold font-headline">
                  {toBengaliDigits(totalQuestionTypes)}টি
                </span>
                <span>ধরন অন্তর্ভুক্ত</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 font-medium">
                <BookOpen className="w-3.5 h-3.5 stroke-[2]" />
                <span className="font-semibold font-headline">
                  {toBengaliDigits(totalChapters)}টি
                </span>
                <span>অধ্যায়</span>
              </div>

              {bookmarkedCount > 0 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/40 text-rose-700 dark:text-rose-400 font-medium">
                  <Bookmark className="w-3.5 h-3.5 fill-rose-500 text-rose-500 stroke-[2]" />
                  <span className="font-semibold font-headline">
                    {toBengaliDigits(bookmarkedCount)}টি
                  </span>
                  <span>সংরক্ষিত</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-xs font-semibold h-10 px-4 cursor-pointer"
          >
            <Link href={`/question-bank/${classId}`}>
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>শ্রেণিতে ফিরুন</span>
            </Link>
          </Button>

          <Button
            asChild
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-xs cursor-pointer"
          >
            <Link
              href={`/question-papers/create?classId=${encodeURIComponent(classId)}&subjectId=${encodeURIComponent(subjectId)}`}
            >
              <PlusCircle className="w-4 h-4 mr-1.5 stroke-[2]" />
              <span>প্রশ্নপত্র তৈরি করুন</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
