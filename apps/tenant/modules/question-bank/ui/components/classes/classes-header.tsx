"use client"

import React, { useEffect, useRef } from "react"
import Link from "next/link"
import { Database, Search, FileText, X } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"

interface ClassesHeaderProps {
  search: string
  onSearchChange: (val: string) => void
}

export const ClassesHeader: React.FC<ClassesHeaderProps> = ({
  search,
  onSearchChange,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Listen for Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <header className="w-full min-w-0 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">
      {/* Brand Icon, Title & Active Badge */}
      <div className="flex items-center gap-3.5 min-w-0 max-w-full">
        <div className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100/80 dark:border-primary/20 flex items-center justify-center text-indigo-600 dark:text-primary shadow-sm shadow-indigo-100/50 dark:shadow-none">
          <Database className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold font-headline tracking-tight text-slate-900 dark:text-foreground leading-none">
              প্রশ্ন ব্যাংক
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 shrink-0">
              সক্রিয় ভাণ্ডার
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-[13px] text-slate-500 dark:text-muted-foreground font-body line-clamp-1 max-w-2xl">
            জাতীয় শিক্ষাক্রম অনুযায়ী শ্রেণিভিত্তিক প্রশ্নভাণ্ডার — সংশ্লিষ্ট শ্রেণির পাঠ্যসূচি ও প্রশ্ন পর্যালোচনা করতে শ্রেণি নির্বাচন করুন
          </p>
        </div>
      </div>

      {/* Search Input with Kbd & Primary CTA */}
      <div className="flex items-center gap-2.5 sm:gap-3 w-full md:w-auto shrink-0 min-w-0">
        <div className="relative w-full sm:w-60 md:w-64 lg:w-80 min-w-0">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-muted-foreground">
            <Search className="w-4 h-4 stroke-[2]" />
          </div>
          <Input
            ref={searchInputRef}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="শ্রেণি বা বিষয় খুঁজুন..."
            className="w-full pl-10 pr-12 py-2.5 h-10 text-xs sm:text-sm bg-slate-50/90 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] text-foreground focus:border-indigo-600 dark:focus:border-primary focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-primary/20 rounded-xl placeholder:text-slate-400 dark:placeholder:text-muted-foreground font-body font-medium transition-colors"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center">
            {search ? (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-foreground cursor-pointer p-0.5"
                title="মুছে ফেলুন"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 border border-slate-200 dark:border-white/[0.08] rounded text-[10px] font-sans font-semibold text-slate-400 dark:text-muted-foreground bg-white dark:bg-white/[0.04] shadow-2xs pointer-events-none">
                ⌘K
              </kbd>
            )}
          </div>
        </div>

        <Button
          asChild
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs sm:text-sm h-10 px-4 rounded-xl shadow-sm shadow-indigo-200 dark:shadow-none transition-all cursor-pointer shrink-0"
        >
          <Link href="/question-papers/create">
            <FileText className="w-4 h-4 mr-1.5 stroke-[2.2]" />
            <span>নতুন প্রশ্নপত্র তৈরি</span>
          </Link>
        </Button>
      </div>
    </header>
  )
}

