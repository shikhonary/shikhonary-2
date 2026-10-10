"use client"

import React from "react"
import Link from "next/link"
import {
  FileText,
  Clock,
  Sparkles,
  Pen,
  Copy,
  Trash,
  MoreVertical,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import type { QuestionPaperItem } from "./question-paper-data-table"

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "০"
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
  return num
    .toString()
    .split("")
    .map((char) => (/\d/.test(char) ? bengaliDigits[parseInt(char)] : char))
    .join("")
}

function formatDurationBn(minutes: number): string {
  if (!minutes) return "০ মিনিট"
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0 && mins > 0) {
    return `${toBengaliDigits(hours)} ঘণ্টা ${toBengaliDigits(mins)} মিনিট`
  } else if (hours > 0) {
    return `${toBengaliDigits(hours)} ঘণ্টা`
  } else {
    return `${toBengaliDigits(mins)} মিনিট`
  }
}

interface QuestionPaperCardGridProps {
  items: QuestionPaperItem[]
  isLoading?: boolean
  onEdit?: (item: QuestionPaperItem) => void
  onDuplicate: (id: string, title: string) => void
  onDelete: (id: string, title: string) => void
}

export const QuestionPaperCardGrid: React.FC<QuestionPaperCardGridProps> = ({
  items,
  isLoading,
  onDuplicate,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex flex-col justify-between overflow-hidden animate-pulse select-none"
          >
            {/* Upper Content */}
            <div className="p-6 pb-4 space-y-4">
              {/* Header: Icon box + Title & subtitle */}
              <div className="flex items-start justify-between gap-3 mb-3.5">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100 dark:border-primary/20 shrink-0 mt-0.5" />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="h-5 w-3/4 bg-slate-200/80 dark:bg-white/10 rounded-md" />
                    <div className="h-3.5 w-1/2 bg-slate-100 dark:bg-white/[0.06] rounded" />
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/[0.06] shrink-0" />
              </div>

              {/* Badges Row Skeleton */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <div className="h-6 w-16 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg border border-indigo-100 dark:border-indigo-800/30" />
                <div className="h-6 w-20 bg-slate-100 dark:bg-white/[0.06] rounded-lg" />
                <div className="h-6 w-16 bg-slate-100 dark:bg-white/[0.06] rounded-lg" />
              </div>

              {/* Status and Created Date Row Skeleton */}
              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.04]">
                <div className="h-5 w-16 bg-slate-100 dark:bg-white/[0.06] rounded-full" />
                <div className="h-3.5 w-20 bg-slate-100 dark:bg-white/[0.04] rounded" />
              </div>
            </div>

            {/* Bottom Card Footer Action Bar Skeleton */}
            <div className="px-6 py-3.5 bg-slate-50/60 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
              <div className="h-3.5 w-20 bg-slate-200/60 dark:bg-white/[0.04] rounded" />
              <div className="h-4 w-24 bg-indigo-200/60 dark:bg-primary/20 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="py-16 px-6 text-center bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.06] p-8 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-4 border border-indigo-100 dark:border-indigo-800/40">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-foreground font-headline">
          কোনো প্রশ্নপত্র পাওয়া যায়নি
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-muted-foreground max-w-md mx-auto font-body">
          নতুন একটি প্রশ্নপত্র তৈরি করে বা কোনো পূর্ববর্তী টেমপ্লেট ডুপ্লিকেট করে শুরু করতে পারেন।
        </p>
        <div className="mt-6">
          <Button asChild className="rounded-xl bg-primary text-primary-foreground font-bold h-10 px-5 gap-2 shadow-xs hover:shadow-md transition-all font-headline">
            <Link href="/question-papers/create">
              <span>নতুন প্রশ্নপত্র তৈরি করুন</span>
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((item) => {
        const isPublished = item.status === "Published"

        return (
          <article
            key={item.id}
            className="bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-primary/40 transition-all duration-200 flex flex-col justify-between overflow-hidden group select-none relative"
          >
            {/* Top Container */}
            <div className="p-6 pb-4">
              {/* Header: Icon, Title, Exam Name & Dropdown Actions */}
              <div className="flex items-start justify-between gap-3 mb-3.5">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100 dark:border-primary/20 text-indigo-600 dark:text-primary flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-primary dark:group-hover:text-primary-foreground transition-colors duration-200 shrink-0 mt-0.5">
                    <FileText className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold font-headline text-slate-900 dark:text-foreground group-hover:text-indigo-600 dark:group-hover:text-primary transition-colors truncate">
                      {item.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-muted-foreground font-body mt-0.5 truncate">
                      {item.examName}
                    </p>
                  </div>
                </div>

                {/* More Action Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer h-8 w-8 shrink-0"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl p-1.5 min-w-[150px] font-headline"
                  >
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10"
                    >
                      <Link href={`/question-papers/${item.id}/builder`}>
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>বিল্ডার ওপেন করুন</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-slate-100 dark:hover:bg-white/[0.06]"
                    >
                      <Link href={`/question-papers/${item.id}/edit`}>
                        <Pen className="h-3.5 w-3.5" />
                        <span>সম্পাদনা করুন</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDuplicate(item.id, item.title)}
                      className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-slate-100 dark:hover:bg-white/[0.06]"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>ডুপ্লিকেট করুন</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete(item.id, item.title)}
                      className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <Trash className="h-3.5 w-3.5" />
                      <span>মুছে ফেলুন</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Badges Row: Class, Marks, Duration, Template */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <Badge
                  variant="outline"
                  className="rounded-lg px-2.5 py-0.5 border border-indigo-200 dark:border-indigo-800/40 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold font-headline"
                >
                  <BookOpen className="w-3 h-3 mr-1" />
                  {item.className}
                </Badge>

                <Badge
                  variant="outline"
                  className="rounded-lg px-2 py-0.5 border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03] text-muted-foreground text-xs font-medium font-body"
                >
                  পূর্ণমান: {toBengaliDigits(item.total)}
                </Badge>

                <Badge
                  variant="outline"
                  className="rounded-lg px-2 py-0.5 border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03] text-muted-foreground text-xs font-medium font-body"
                >
                  {formatDurationBn(item.timeInMinutes)}
                </Badge>

                {item.isTemplate && (
                  <Badge
                    variant="outline"
                    className="rounded-lg px-2 py-0.5 border border-teal-200 dark:border-teal-800/40 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-xs font-semibold font-headline"
                  >
                    টেমপ্লেট
                  </Badge>
                )}
              </div>

              {/* Status and Created Date Row */}
              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.04]">
                {isPublished ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40 font-headline">
                    <CheckCircle className="h-3 w-3 shrink-0" />
                    <span>পাবলিশড</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40 font-headline">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    <span>ড্রাফট</span>
                  </span>
                )}

                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-body">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span>
                    {new Date(item.createdAt).toLocaleDateString("bn-BD", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Footer CTA Button */}
            <div className="px-6 py-3 bg-slate-50/60 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs font-body">
              <span className="text-slate-400 dark:text-muted-foreground font-medium">
                প্রশ্নপত্র প্রণেতা
              </span>
              <Button
                size="sm"
                variant="ghost"
                asChild
                className="h-8 px-3 rounded-lg text-xs font-bold text-primary hover:bg-primary/10 hover:text-primary gap-1.5 group-hover:translate-x-0.5 transition-all cursor-pointer font-headline"
              >
                <Link href={`/question-papers/${item.id}/builder`}>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>বিল্ডারে যান</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </Button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
