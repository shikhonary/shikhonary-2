"use client"

import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { FileText, Plus, Sparkles } from "lucide-react"

export function QuestionPaperPageHeader() {
  return (
    <header className="w-full min-w-0 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-border/50">
      {/* Brand Icon, Title & Active Badge */}
      <div className="flex items-center gap-3.5 min-w-0 max-w-full">
        <div className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100/80 dark:border-primary/20 flex items-center justify-center text-indigo-600 dark:text-primary shadow-xs">
          <FileText className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold font-headline tracking-tight text-foreground leading-none">
              প্রশ্নপত্র ব্যবস্থাপনা
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 shrink-0">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span>এআই সম্বলিত বিল্ডার</span>
            </span>
          </div>
          <p className="mt-1.5 text-xs sm:text-[13px] text-muted-foreground font-body line-clamp-1 max-w-2xl">
            প্রতিষ্ঠানের সকল পরীক্ষা ও বিষয়ের প্রশ্নপত্র প্রণয়ন, এআই অ্যাসিস্ট্যান্ট সম্পাদনা ও প্রিন্ট ব্যবস্থাপনা
          </p>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="flex items-center gap-3 shrink-0">
        <Button
          asChild
          className="group relative h-11 px-5 rounded-2xl bg-primary hover:bg-primary/95 text-white font-bold text-sm shadow-md shadow-primary/25 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <Link href="/question-papers/create">
            <Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
            <span>নতুন প্রশ্নপত্র তৈরি করুন</span>
          </Link>
        </Button>
      </div>
    </header>
  )
}
