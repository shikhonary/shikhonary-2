"use client"

import React from "react"
import {
  Search,
  X,
  RotateCcw,
  BookOpen,
  Tag,
  Library,
  ArrowUpDown,
} from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { cn } from "@workspace/ui/lib/utils"
import type { AcademicChapterBrief } from "../../../types"

const DIFFICULTIES = [
  { value: "All", label: "সকল মান" },
  { value: "EASY", label: "সহজ" },
  { value: "MEDIUM", label: "মধ্যম" },
  { value: "HARD", label: "কঠিন" },
]

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "০"
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
  return num
    .toString()
    .split("")
    .map((char) => (/\d/.test(char) ? bengaliDigits[parseInt(char)] : char))
    .join("")
}

interface SubjectExplorerFiltersProps {
  search: string
  onSearchChange: (search: string) => void
  selectedChapterId: string
  onChapterChange: (chapterId: string) => void
  chapters: AcademicChapterBrief[]
  selectedBoard: string
  onBoardChange: (board: string) => void
  boardYears?: { rawRef: string; count: number }[]
  selectedSource: string
  onSourceChange: (source: string) => void
  sources?: { rawSource: string; count: number }[]
  selectedDifficulty: string
  onDifficultyChange: (difficulty: string) => void
  selectedSort: "newest" | "oldest"
  onSortChange: (sort: "newest" | "oldest") => void
  onResetFilters: () => void
  activeFiltersCount: number
  isLoading?: boolean
}

export const SubjectExplorerFilters: React.FC<SubjectExplorerFiltersProps> = ({
  search,
  onSearchChange,
  selectedChapterId,
  onChapterChange,
  chapters,
  selectedBoard,
  onBoardChange,
  boardYears = [],
  selectedSource,
  onSourceChange,
  sources = [],
  selectedDifficulty,
  onDifficultyChange,
  selectedSort,
  onSortChange,
  onResetFilters,
  activeFiltersCount,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-4 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="h-10 bg-slate-200/70 dark:bg-white/10 rounded-xl animate-pulse" />
          <div className="h-10 bg-slate-100 dark:bg-white/[0.06] rounded-xl animate-pulse" />
          <div className="h-10 bg-slate-100 dark:bg-white/[0.06] rounded-xl animate-pulse" />
          <div className="h-10 bg-slate-100 dark:bg-white/[0.06] rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  const hasSources = sources.length > 0

  return (
    <div className="bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-4 shadow-xs space-y-4">
      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 gap-3",
          hasSources ? "md:grid-cols-3 xl:grid-cols-5" : "lg:grid-cols-4"
        )}
      >
        {/* 1. Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="প্রশ্ন বা প্রাসঙ্গিক বিষয় খুঁজুন..."
            className="pl-10 pr-9 h-10 rounded-xl bg-slate-50/70 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] focus-visible:ring-indigo-500 text-xs font-body"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-foreground cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 2. Chapter Filter */}
        <div>
          <Select value={selectedChapterId} onValueChange={onChapterChange}>
            <SelectTrigger className="w-full h-10 px-3 rounded-xl bg-slate-50/70 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] text-xs font-body">
              <div className="flex items-center gap-2 truncate pl-1.5 sm:pl-2">
                <BookOpen className="w-3.5 h-3.5 text-slate-400 dark:text-muted-foreground shrink-0" />
                <SelectValue placeholder="সকল অধ্যায়" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-card border-slate-200 dark:border-white/[0.08] max-h-64 font-body">
              <SelectItem value="All">সকল অধ্যায়</SelectItem>
              {chapters.map((ch, idx) => (
                <SelectItem key={ch.id} value={ch.id}>
                  <span
                    className="font-solaiman font-medium"
                    style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                  >
                    {toBengaliDigits(idx + 1)}.
                  </span>{" "}
                  {ch.nameBn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 3. Reference Filter */}
        <div>
          <Select value={selectedBoard} onValueChange={onBoardChange}>
            <SelectTrigger className="w-full h-10 px-3 rounded-xl bg-slate-50/70 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] text-xs font-body">
              <div className="flex items-center gap-2 truncate pl-1.5 sm:pl-2">
                <Tag className="w-3.5 h-3.5 text-slate-400 dark:text-muted-foreground shrink-0" />
                <SelectValue placeholder="সকল রেফারেন্স" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-card border-slate-200 dark:border-white/[0.08] max-h-64 font-body">
              <SelectItem value="All">সকল রেফারেন্স</SelectItem>
              {boardYears.map((item) => (
                <SelectItem key={item.rawRef} value={item.rawRef}>
                  🏷️ {item.rawRef}{" "}
                  <span
                    className="font-solaiman font-medium text-slate-500 dark:text-muted-foreground"
                    style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                  >
                    ({toBengaliDigits(item.count)})
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 4. Source Filter (Conditional) */}
        {hasSources && (
          <div>
            <Select value={selectedSource} onValueChange={onSourceChange}>
              <SelectTrigger className="w-full h-10 px-3 rounded-xl bg-slate-50/70 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] text-xs font-body">
                <div className="flex items-center gap-2 truncate pl-1.5 sm:pl-2">
                  <Library className="w-3.5 h-3.5 text-slate-400 dark:text-muted-foreground shrink-0" />
                  <SelectValue placeholder="সকল উৎস" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-card border-slate-200 dark:border-white/[0.08] max-h-64 font-body">
                <SelectItem value="All">সকল উৎস</SelectItem>
                {sources.map((item) => (
                  <SelectItem key={item.rawSource} value={item.rawSource}>
                    📚 {item.rawSource}{" "}
                    <span
                      className="font-solaiman font-medium text-slate-500 dark:text-muted-foreground"
                      style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                    >
                      ({toBengaliDigits(item.count)})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* 5. Sort Selector */}
        <div>
          <Select value={selectedSort} onValueChange={(val: any) => onSortChange(val)}>
            <SelectTrigger className="w-full h-10 px-3 rounded-xl bg-slate-50/70 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] text-xs font-body">
              <div className="flex items-center gap-2 truncate pl-1.5 sm:pl-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 dark:text-muted-foreground shrink-0" />
                <SelectValue placeholder="ক্রমবিন্যাস" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-card border-slate-200 dark:border-white/[0.08]">
              <SelectItem value="newest">সর্বশেষ প্রশ্ন আগে</SelectItem>
              <SelectItem value="oldest">পূর্ববর্তী প্রশ্ন আগে</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filter Badges */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.06] text-xs font-body">
          <span className="text-slate-400 dark:text-muted-foreground font-semibold text-[11px] uppercase tracking-wider mr-1">
            সক্রিয় ফিল্টার:
          </span>
          {search.trim() !== "" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-medium">
              <span>খোঁজ: "{search}"</span>
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="hover:text-indigo-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedChapterId !== "All" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-medium">
              <span>
                অধ্যায়: {chapters.find((c) => c.id === selectedChapterId)?.nameBn || "অধ্যায়"}
              </span>
              <button
                type="button"
                onClick={() => onChapterChange("All")}
                className="hover:text-indigo-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedBoard !== "All" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-medium">
              <span>রেফারেন্স: {selectedBoard}</span>
              <button
                type="button"
                onClick={() => onBoardChange("All")}
                className="hover:text-indigo-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedSource !== "All" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-medium">
              <span>উৎস: {selectedSource}</span>
              <button
                type="button"
                onClick={() => onSourceChange("All")}
                className="hover:text-indigo-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedDifficulty !== "All" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-medium">
              <span>কঠিনতা: {DIFFICULTIES.find((d) => d.value === selectedDifficulty)?.label}</span>
              <button
                type="button"
                onClick={() => onDifficultyChange("All")}
                className="hover:text-indigo-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedSort !== "newest" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-medium">
              <span>সর্ট: পুরাতন আগে</span>
              <button
                type="button"
                onClick={() => onSortChange("newest")}
                className="hover:text-indigo-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Secondary Bar: Difficulty Pills & Reset */}
      <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-white/[0.06] flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-muted-foreground font-body font-medium mr-1">
            কঠিনতার মাত্রা:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {DIFFICULTIES.map((d) => {
              const isActive = selectedDifficulty === d.value
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => onDifficultyChange(d.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium font-body transition-colors cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-muted-foreground hover:bg-slate-200/80 dark:hover:bg-white/[0.08]"
                  }`}
                >
                  {d.label}
                </button>
              )
            })}
          </div>
        </div>

        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-primary font-medium font-body transition-colors cursor-pointer ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ফিল্টার রিসেট ({activeFiltersCount})</span>
          </button>
        )}
      </div>
    </div>
  )
}
