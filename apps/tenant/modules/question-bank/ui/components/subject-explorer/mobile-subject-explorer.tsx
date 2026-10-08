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
import { QuestionTypesTabs } from "./question-types-tabs"
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
      <header className="sticky top-0 bg-background/90 backdrop-blur-xl z-40 border-b border-border/40 px-4 pt-3 pb-2.5 space-y-2 shadow-xs w-full min-w-0">
        {/* Row 1: Back Button, Title, Subtitle & Action */}
        <div className="flex items-center justify-between gap-2.5 min-w-0 w-full">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href={`/question-bank/${classId}`}
              className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center text-foreground hover:bg-muted shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <h2 className="text-sm font-bold font-headline text-foreground truncate leading-tight">
                {subject?.nameBn || "বিষয় বিবরণী"}
              </h2>
              <p className="text-[11px] text-muted-foreground font-body truncate leading-none mt-0.5">
                {cls?.nameBn} • {toBengaliDigits(totalQuestions)}টি প্রশ্ন
              </p>
            </div>
          </div>

          <Button
            asChild
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-8 px-3 rounded-xl shrink-0"
          >
            <Link
              href={`/question-papers/create?classId=${encodeURIComponent(classId)}&subjectId=${encodeURIComponent(subjectId)}`}
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1 stroke-[2]" />
              <span>প্রশ্নপত্র তৈরি</span>
            </Link>
          </Button>
        </div>

        {/* Row 2: Question Types Tabs */}
        <div className="w-full min-w-0">
          <QuestionTypesTabs
            questionTypes={questionTypes}
            activeCategory={activeCategory}
            onSelectCategory={onSelectCategory}
            totalQuestions={totalQuestions}
            bookmarkedCount={bookmarkedCount}
            isBookmarkedOnly={isBookmarkedOnly}
            onToggleBookmarkedOnly={onToggleBookmarkedOnly}
            isLoading={isLoading}
            isSticky={false}
          />
        </div>

        {/* Row 3: Search Bar & Filter Sheet Trigger (minimal gap directly below tabs) */}
        <div className="flex items-center gap-2 pt-0.5 w-full min-w-0">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="প্রশ্ন খুঁজুন..."
              className="pl-9 pr-8 h-9 rounded-xl bg-card border-border/50 text-xs font-body w-full"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer"
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
                className={`h-9 px-3 rounded-xl border flex items-center gap-1.5 text-xs font-medium font-body transition-colors shrink-0 cursor-pointer ${
                  activeFiltersCount > 0
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-card border-border/50 text-foreground hover:bg-muted/60"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>ফিল্টার</span>
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-white text-indigo-700 text-[10px] font-bold flex items-center justify-center ml-0.5">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </SheetTrigger>

            <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto p-5 space-y-4">
              <SheetHeader className="text-left pb-2 border-b border-border/40">
                <SheetTitle className="text-base font-bold font-headline flex items-center justify-between">
                  <span>ফিল্টারসমূহ</span>
                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        onResetFilters()
                        setFilterSheetOpen(false)
                      }}
                      className="text-xs text-indigo-600 dark:text-primary font-medium flex items-center gap-1 font-body cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>রিসেট করুন</span>
                    </button>
                  )}
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-4 pt-1 font-body text-xs">
                {/* Chapter Selection */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">অধ্যায় নির্বাচন:</label>
                  <Select
                    value={selectedChapterId}
                    onValueChange={(val) => {
                      onChapterChange(val)
                      setFilterSheetOpen(false)
                    }}
                  >
                    <SelectTrigger className="w-full h-10 px-3 rounded-xl bg-muted/40 text-xs">
                      <div className="flex items-center gap-2 truncate pl-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <SelectValue placeholder="সকল অধ্যায়" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-60 font-body">
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

                {/* Reference Selection */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">রেফারেন্স নির্বাচন:</label>
                  <Select
                    value={selectedBoard}
                    onValueChange={(val) => {
                      onBoardChange(val)
                      setFilterSheetOpen(false)
                    }}
                  >
                    <SelectTrigger className="w-full h-10 px-3 rounded-xl bg-muted/40 text-xs">
                      <div className="flex items-center gap-2 truncate pl-1.5">
                        <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <SelectValue placeholder="সকল রেফারেন্স" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-60 font-body">
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

                {/* Source Selection (Conditional) */}
                {sources.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">উৎস নির্বাচন:</label>
                    <Select
                      value={selectedSource}
                      onValueChange={(val) => {
                        onSourceChange(val)
                        setFilterSheetOpen(false)
                      }}
                    >
                      <SelectTrigger className="w-full h-10 px-3 rounded-xl bg-muted/40 text-xs">
                        <div className="flex items-center gap-2 truncate pl-1.5">
                          <Library className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <SelectValue placeholder="সকল উৎস" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="max-h-60 font-body">
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

                {/* Difficulty Pills */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">কঠিনতার মান:</label>
                  <div className="grid grid-cols-4 gap-2">
                    {DIFFICULTIES.map((d) => {
                      const isActive = selectedDifficulty === d.value
                      return (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => {
                            onDifficultyChange(d.value)
                            setFilterSheetOpen(false)
                          }}
                          className={`py-2 rounded-xl text-xs font-semibold text-center transition-colors cursor-pointer ${
                            isActive
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "bg-muted/50 text-foreground hover:bg-muted"
                          }`}
                        >
                          {d.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Sort Order */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">ক্রমবিন্যাস:</label>
                  <Select
                    value={selectedSort}
                    onValueChange={(val: any) => {
                      onSortChange(val)
                      setFilterSheetOpen(false)
                    }}
                  >
                    <SelectTrigger className="w-full h-10 rounded-xl bg-muted/40 text-xs">
                      <SelectValue placeholder="ক্রমবিন্যাস" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">সর্বশেষ প্রশ্ন আগে</SelectItem>
                      <SelectItem value="oldest">পূর্ববর্তী প্রশ্ন আগে</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={() => setFilterSheetOpen(false)}
                  className="w-full h-11 rounded-xl bg-indigo-600 text-white font-bold mt-2"
                >
                  ফলাফল দেখুন
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* ── Main Questions Content Stream ─────────────────────────── */}
      <main className="px-4 py-3 space-y-3">
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
