"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  BookOpen,
  Search,
  X,
  SlidersHorizontal,
  Bookmark,
  PlusCircle,
  FileText,
  Layers,
  ChevronRight,
  RotateCcw,
  Tag,
  Library,
  Check,
  Sparkles,
  ArrowUpDown,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { SubjectExplorerGrid } from "./subject-explorer-grid"
import type { SubjectDetailsData, AcademicChapterBrief } from "../../../types"
import type { QuestionTypeCode } from "@workspace/utils"

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

interface MobileSubjectExplorerProps {
  classId: string
  subjectId: string
  data?: SubjectDetailsData | null
  isLoading?: boolean
  activeCategory: string
  onSelectCategory: (category: string) => void
  search: string
  onSearchChange: (search: string) => void
  selectedChapterId: string
  onChapterChange: (chapterId: string) => void
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
  bookmarkedCount: number
  isBookmarkedOnly: boolean
  onToggleBookmarkedOnly: () => void
  page: number
  onPageChange: (page: number) => void
}

export const MobileSubjectExplorer: React.FC<MobileSubjectExplorerProps> = ({
  classId,
  subjectId,
  data,
  isLoading,
  activeCategory,
  onSelectCategory,
  search,
  onSearchChange,
  selectedChapterId,
  onChapterChange,
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
  bookmarkedCount,
  isBookmarkedOnly,
  onToggleBookmarkedOnly,
  page,
  onPageChange,
}) => {
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  const subject = data?.subject
  const cls = data?.class
  const chapters = data?.chapters || []
  const questionTypes = data?.questionTypes || []
  const totalQuestions = data?.totalQuestions || 0

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background pb-12">
      {/* ── Mobile Sticky Top Header Section (like mobile-classes-list) ── */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-xl z-40 border-b border-border/40 px-2.5 pt-3 pb-2.5 space-y-2.5 shadow-2xs w-full min-w-0">
        {/* Row 1: Back Button, Subject Title, Class/Count Badges & CTA */}
        <div className="flex items-center justify-between gap-2 min-w-0 w-full">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <Link
              href={`/question-bank/${classId}`}
              className="w-9 h-9 rounded-xl bg-muted/50 hover:bg-muted border border-border/40 flex items-center justify-center text-foreground transition-all shrink-0 shadow-2xs active:scale-95"
              title="বিষয় তালিকায় ফিরুন"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-bold font-headline text-foreground truncate leading-tight">
                {subject?.nameBn || "বিষয় বিবরণী"}
              </h1>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-body truncate mt-0.5">
                <span className="px-1.5 py-0.2 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20 text-[10px] shrink-0">
                  {cls?.nameBn}
                </span>
                <span className="text-muted-foreground/40">•</span>
                <span className="truncate">{toBengaliDigits(totalQuestions)}টি প্রশ্ন</span>
                {chapters.length > 0 && (
                  <>
                    <span className="text-muted-foreground/40">•</span>
                    <span className="truncate">{toBengaliDigits(chapters.length)}টি অধ্যায়</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <Button
            asChild
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-8.5 px-3 rounded-xl shadow-xs shrink-0 active:scale-95 transition-all"
          >
            <Link
              href={`/question-papers/create?classId=${encodeURIComponent(classId)}&subjectId=${encodeURIComponent(subjectId)}`}
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1 stroke-[2]" />
              <span>প্রশ্ন তৈরি</span>
            </Link>
          </Button>
        </div>

        {/* Row 2: Question Types Select & Bookmark Toggle */}
        <div className="w-full min-w-0">
          {isLoading ? (
            <div className="h-10 w-full bg-muted/60 dark:bg-white/5 rounded-xl animate-pulse" />
          ) : (
            <div className="flex items-center gap-2 w-full min-w-0">
              <div className="flex-1 min-w-0">
                <Select
                  value={isBookmarkedOnly ? "ALL" : activeCategory}
                  onValueChange={(val) => {
                    if (isBookmarkedOnly && onToggleBookmarkedOnly) {
                      onToggleBookmarkedOnly()
                    }
                    onSelectCategory(val)
                  }}
                >
                  <SelectTrigger className="w-full h-10 px-3 rounded-xl bg-card border border-border/60 hover:border-border text-xs font-body justify-between shadow-2xs focus:ring-1 focus:ring-indigo-500">
                    <div className="flex items-center gap-2 truncate pl-0.5">
                      <div className="w-5 h-5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <Layers className="w-3 h-3" />
                      </div>
                      <SelectValue placeholder="সকল প্রশ্নের ধরন" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-64 font-body">
                    <SelectItem value="ALL">
                      <span>সকল ধরন</span>{" "}
                      <span
                        className="font-solaiman font-medium text-muted-foreground"
                        style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                      >
                        ({toBengaliDigits(totalQuestions)})
                      </span>
                    </SelectItem>
                    {questionTypes.map((qt) => (
                      <SelectItem key={qt.code} value={qt.code}>
                        <span>{qt.nameBn}</span>{" "}
                        <span
                          className="font-solaiman font-medium text-muted-foreground"
                          style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                        >
                          ({toBengaliDigits(qt.count)})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {onToggleBookmarkedOnly && (
                <button
                  type="button"
                  onClick={onToggleBookmarkedOnly}
                  className={`h-10 px-3 rounded-xl border flex items-center gap-1.5 text-xs font-bold font-body transition-all shrink-0 cursor-pointer shadow-2xs active:scale-95 ${
                    isBookmarkedOnly
                      ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                      : "bg-card border-border/60 text-foreground hover:bg-muted/60"
                  }`}
                  title="বুকমার্ককৃত প্রশ্ন"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isBookmarkedOnly ? "fill-white text-white" : "fill-rose-500 text-rose-500"}`} />
                  <span>বুকমার্ক</span>
                  <span
                    className="font-solaiman font-medium"
                    style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                  >
                    ({toBengaliDigits(bookmarkedCount)})
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Row 3: Search Bar & Filter Sheet Trigger */}
        <div className="flex items-center gap-2 pt-0.5 w-full min-w-0">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="প্রশ্ন বা টপিক খুঁজুন..."
              className="pl-9 pr-8 h-9.5 rounded-xl bg-card border-border/60 text-xs font-body w-full shadow-2xs focus-visible:ring-1 focus-visible:ring-indigo-500 placeholder:text-muted-foreground/70"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                title="মুছুন"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Sheet Trigger Button */}
          <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className={`h-9.5 px-3 rounded-xl border flex items-center gap-1.5 text-xs font-bold font-body transition-all shrink-0 cursor-pointer active:scale-95 ${
                  activeFiltersCount > 0
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-card border-border/60 text-foreground hover:bg-muted/60 shadow-2xs"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>ফিল্টার</span>
                {activeFiltersCount > 0 && (
                  <span className="w-4.5 h-4.5 rounded-full bg-white text-indigo-700 text-[10px] font-bold flex items-center justify-center ml-0.5">
                    {toBengaliDigits(activeFiltersCount)}
                  </span>
                )}
              </button>
            </SheetTrigger>

            <SheetContent
              side="bottom"
              className="rounded-t-3xl max-h-[88vh] flex flex-col p-0 border-t border-border/50 bg-card text-foreground shadow-2xl focus:outline-hidden overflow-hidden"
            >
              {/* Grab Handle */}
              <div className="w-12 h-1.5 rounded-full bg-muted-foreground/25 mx-auto mt-3 mb-1 shrink-0" />

              {/* Drawer Header */}
              <SheetHeader className="px-4 py-3 border-b border-border/40 text-left shrink-0">
                <SheetTitle className="text-base font-bold font-headline flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <SlidersHorizontal className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span>ফিল্টারসমূহ</span>
                        {activeFiltersCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                            {toBengaliDigits(activeFiltersCount)}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-normal text-muted-foreground font-body leading-none mt-0.5">
                        {activeFiltersCount > 0
                          ? `${toBengaliDigits(activeFiltersCount)}টি ফিল্টার সক্রিয় রয়েছে`
                          : "পছন্দমতো ফিল্টার নির্বাচন করুন"}
                      </p>
                    </div>
                  </div>

                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={() => onResetFilters()}
                      className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 font-body cursor-pointer transition-all active:scale-95"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>সব মুছুন</span>
                    </button>
                  )}
                </SheetTitle>
              </SheetHeader>

              {/* Drawer Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto px-3.5 py-3.5 space-y-3.5 font-body text-xs">
                {/* Active Filter Chips Strip */}
                {activeFiltersCount > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pb-2 border-b border-border/40">
                    <span className="text-[10px] font-semibold text-muted-foreground">সক্রিয়:</span>
                    {selectedChapterId !== "All" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium text-[11px] border border-indigo-200 dark:border-indigo-800/60">
                        <span>অধ্যায়: {chapters.find((c) => c.id === selectedChapterId)?.nameBn || "নির্বাচিত"}</span>
                        <button
                          type="button"
                          onClick={() => onChapterChange("All")}
                          className="hover:opacity-75 cursor-pointer ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {selectedBoard !== "All" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium text-[11px] border border-indigo-200 dark:border-indigo-800/60">
                        <span>রেফ: {selectedBoard}</span>
                        <button
                          type="button"
                          onClick={() => onBoardChange("All")}
                          className="hover:opacity-75 cursor-pointer ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {selectedSource !== "All" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium text-[11px] border border-indigo-200 dark:border-indigo-800/60">
                        <span>উৎস: {selectedSource}</span>
                        <button
                          type="button"
                          onClick={() => onSourceChange("All")}
                          className="hover:opacity-75 cursor-pointer ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {selectedDifficulty !== "All" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium text-[11px] border border-indigo-200 dark:border-indigo-800/60">
                        <span>মান: {DIFFICULTIES.find((d) => d.value === selectedDifficulty)?.label}</span>
                        <button
                          type="button"
                          onClick={() => onDifficultyChange("All")}
                          className="hover:opacity-75 cursor-pointer ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {selectedSort !== "newest" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium text-[11px] border border-indigo-200 dark:border-indigo-800/60">
                        <span>পূর্ববর্তী আগে</span>
                        <button
                          type="button"
                          onClick={() => onSortChange("newest")}
                          className="hover:opacity-75 cursor-pointer ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                )}

                {/* Section: Chapter Selection */}
                <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-foreground flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>অধ্যায় নির্বাচন</span>
                    </label>
                    {selectedChapterId !== "All" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
                        সক্রিয়
                      </span>
                    )}
                  </div>
                  <Select
                    value={selectedChapterId}
                    onValueChange={(val) => onChapterChange(val)}
                  >
                    <SelectTrigger className="w-full h-11 px-3.5 rounded-xl bg-background border border-border/60 text-xs shadow-2xs focus:ring-1 focus:ring-indigo-500">
                      <div className="flex items-center gap-2 truncate pl-1">
                        <BookOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <SelectValue placeholder="সকল অধ্যায়" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-64 font-body">
                      <SelectItem value="All">সকল অধ্যায়</SelectItem>
                      {chapters.map((ch, idx) => (
                        <SelectItem key={ch.id} value={ch.id}>
                          <span
                            className="font-solaiman font-semibold text-indigo-600 dark:text-indigo-400"
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

                {/* Section: Reference Selection */}
                <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-foreground flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>রেফারেন্স ও সাল</span>
                    </label>
                    {selectedBoard !== "All" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
                        সক্রিয়
                      </span>
                    )}
                  </div>
                  <Select
                    value={selectedBoard}
                    onValueChange={(val) => onBoardChange(val)}
                  >
                    <SelectTrigger className="w-full h-11 px-3.5 rounded-xl bg-background border border-border/60 text-xs shadow-2xs focus:ring-1 focus:ring-indigo-500">
                      <div className="flex items-center gap-2 truncate pl-1">
                        <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <SelectValue placeholder="সকল রেফারেন্স" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-64 font-body">
                      <SelectItem value="All">সকল রেফারেন্স</SelectItem>
                      {boardYears.map((item) => (
                        <SelectItem key={item.rawRef} value={item.rawRef}>
                          🏷️ {item.rawRef}{" "}
                          <span
                            className="font-solaiman font-medium text-muted-foreground"
                            style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                          >
                            ({toBengaliDigits(item.count)})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Section: Source Selection (Conditional) */}
                {sources.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-foreground flex items-center gap-2">
                        <Library className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>উৎস ও গ্রন্থ</span>
                      </label>
                      {selectedSource !== "All" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
                          সক্রিয়
                        </span>
                      )}
                    </div>
                    <Select
                      value={selectedSource}
                      onValueChange={(val) => onSourceChange(val)}
                    >
                      <SelectTrigger className="w-full h-11 px-3.5 rounded-xl bg-background border border-border/60 text-xs shadow-2xs focus:ring-1 focus:ring-indigo-500">
                        <div className="flex items-center gap-2 truncate pl-1">
                          <Library className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <SelectValue placeholder="সকল উৎস" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="max-h-64 font-body">
                        <SelectItem value="All">সকল উৎস</SelectItem>
                        {sources.map((item) => (
                          <SelectItem key={item.rawSource} value={item.rawSource}>
                            📚 {item.rawSource}{" "}
                            <span
                              className="font-solaiman font-medium text-muted-foreground"
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

                {/* Section: Difficulty Pills */}
                <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>কঠিনতার মান</span>
                    </label>
                    {selectedDifficulty !== "All" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
                        সক্রিয়
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {DIFFICULTIES.map((d) => {
                      const isActive = selectedDifficulty === d.value
                      let activeStyle = "bg-indigo-600 text-white shadow-xs"
                      let inactiveStyle = "bg-background text-foreground border border-border/60 hover:bg-muted/60"

                      if (d.value === "EASY") {
                        if (isActive) activeStyle = "bg-emerald-600 text-white shadow-xs font-bold"
                        else inactiveStyle = "bg-background text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                      } else if (d.value === "MEDIUM") {
                        if (isActive) activeStyle = "bg-amber-600 text-white shadow-xs font-bold"
                        else inactiveStyle = "bg-background text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                      } else if (d.value === "HARD") {
                        if (isActive) activeStyle = "bg-rose-600 text-white shadow-xs font-bold"
                        else inactiveStyle = "bg-background text-rose-700 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      }

                      return (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => onDifficultyChange(d.value)}
                          className={`py-2.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer active:scale-95 ${
                            isActive ? activeStyle : inactiveStyle
                          }`}
                        >
                          {d.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Section: Sort Order Toggle */}
                <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-foreground flex items-center gap-2">
                      <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>ক্রমবিন্যাস</span>
                    </label>
                    {selectedSort !== "newest" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
                        পরিবর্তিত
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onSortChange("newest")}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer active:scale-95 ${
                        selectedSort === "newest"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-background text-muted-foreground border border-border/60 hover:bg-muted/60"
                      }`}
                    >
                      সর্বশেষ প্রশ্ন আগে
                    </button>
                    <button
                      type="button"
                      onClick={() => onSortChange("oldest")}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer active:scale-95 ${
                        selectedSort === "oldest"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-background text-muted-foreground border border-border/60 hover:bg-muted/60"
                      }`}
                    >
                      পূর্ববর্তী প্রশ্ন আগে
                    </button>
                  </div>
                </div>
              </div>

              {/* Sticky Action Footer */}
              <div className="px-3.5 py-3 bg-background/95 backdrop-blur-md border-t border-border/50 flex items-center gap-2.5 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onResetFilters()}
                  disabled={activeFiltersCount === 0}
                  className="h-11 px-4 rounded-xl font-bold flex items-center gap-1.5 border-border text-foreground shrink-0 disabled:opacity-40 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>রিসেট</span>
                </Button>

                <Button
                  type="button"
                  onClick={() => setFilterSheetOpen(false)}
                  className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] transition-transform cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>ফলাফল দেখুন</span>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Row 4: Quick Active Filter Chips Strip (Shown dynamically when filters are active) */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[11px] border-t border-border/30 pt-2">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0 flex items-center gap-1">
              <SlidersHorizontal className="w-2.5 h-2.5" />
              <span>ফিল্টার:</span>
            </span>
            {selectedChapterId !== "All" && (
              <button
                type="button"
                onClick={() => onChapterChange("All")}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-medium shrink-0 border border-indigo-500/20 cursor-pointer transition-colors"
              >
                <span className="truncate max-w-[110px]">
                  {chapters.find((c) => c.id === selectedChapterId)?.nameBn || "অধ্যায়"}
                </span>
                <X className="w-2.5 h-2.5 opacity-70" />
              </button>
            )}
            {selectedBoard !== "All" && (
              <button
                type="button"
                onClick={() => onBoardChange("All")}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-medium shrink-0 border border-indigo-500/20 cursor-pointer transition-colors"
              >
                <span className="truncate max-w-[90px]">{selectedBoard}</span>
                <X className="w-2.5 h-2.5 opacity-70" />
              </button>
            )}
            {selectedSource !== "All" && (
              <button
                type="button"
                onClick={() => onSourceChange("All")}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-medium shrink-0 border border-indigo-500/20 cursor-pointer transition-colors"
              >
                <span className="truncate max-w-[90px]">{selectedSource}</span>
                <X className="w-2.5 h-2.5 opacity-70" />
              </button>
            )}
            {selectedDifficulty !== "All" && (
              <button
                type="button"
                onClick={() => onDifficultyChange("All")}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-medium shrink-0 border border-indigo-500/20 cursor-pointer transition-colors"
              >
                <span>{DIFFICULTIES.find((d) => d.value === selectedDifficulty)?.label}</span>
                <X className="w-2.5 h-2.5 opacity-70" />
              </button>
            )}
            {selectedSort !== "newest" && (
              <button
                type="button"
                onClick={() => onSortChange("newest")}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-medium shrink-0 border border-indigo-500/20 cursor-pointer transition-colors"
              >
                <span>পূর্ববর্তী আগে</span>
                <X className="w-2.5 h-2.5 opacity-70" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onResetFilters()}
              className="text-[10px] text-rose-600 dark:text-rose-400 hover:underline font-bold shrink-0 ml-auto cursor-pointer"
            >
              সব মুছুন
            </button>
          </div>
        )}
      </header>

      {/* ── Main Questions Content Stream ─────────────────────────── */}
      <main className="px-2.5 py-3 space-y-3">
        {/* Question Cards Grid */}
        <SubjectExplorerGrid
          subjectId={subjectId}
          category={activeCategory as QuestionTypeCode}
          search={search}
          chapterId={selectedChapterId}
          board={selectedBoard}
          source={selectedSource}
          difficulty={selectedDifficulty}
          sort={selectedSort}
          page={page}
          limit={15}
          onPageChange={onPageChange}
          isBookmarkedOnly={isBookmarkedOnly}
        />
      </main>
    </div>
  )
}
