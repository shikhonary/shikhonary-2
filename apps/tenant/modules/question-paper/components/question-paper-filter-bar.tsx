"use client"

import React from "react"
import { Input } from "@workspace/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { Search, X, RotateCcw, SlidersHorizontal, ArrowUpDown, Filter, BookOpen, List, LayoutGrid, Check } from "lucide-react"
import type { QuestionPaperViewMode } from "../hooks/use-question-paper-search-params"

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "০"
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
  return num
    .toString()
    .split("")
    .map((char) => (/\d/.test(char) ? bengaliDigits[parseInt(char)] : char))
    .join("")
}

interface QuestionPaperFilterBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedClassId: string
  onClassChange: (value: string) => void
  selectedStatus: string
  onStatusChange: (value: string) => void
  selectedSort: string
  onSortChange: (value: string) => void
  viewMode?: QuestionPaperViewMode
  onViewModeChange?: (mode: QuestionPaperViewMode) => void
  onResetAll?: () => void
  classes?: { id: string; nameEn: string; nameBn: string }[]
}

export function QuestionPaperFilterBar({
  searchQuery,
  onSearchChange,
  selectedClassId,
  onClassChange,
  selectedStatus,
  onStatusChange,
  selectedSort,
  onSortChange,
  viewMode = "table",
  onViewModeChange,
  onResetAll,
  classes = [],
}: QuestionPaperFilterBarProps) {
  const [mobileFilterOpen, setMobileFilterOpen] = React.useState(false)

  const hasActiveQuery = Boolean(searchQuery && searchQuery.trim() !== "")
  const hasActiveClass = Boolean(selectedClassId && selectedClassId !== "All")
  const hasActiveStatus = Boolean(selectedStatus && selectedStatus !== "All")
  const hasActiveSort = Boolean(selectedSort && selectedSort !== "All")
  const hasAnyFilter = hasActiveQuery || hasActiveClass || hasActiveStatus || hasActiveSort

  const activeFilterCount =
    (hasActiveClass ? 1 : 0) +
    (hasActiveStatus ? 1 : 0) +
    (hasActiveSort ? 1 : 0)

  const handleResetAll = () => {
    onSearchChange("")
    onClassChange("All")
    onStatusChange("All")
    onSortChange("All")
    if (onResetAll) onResetAll()
  }

  const getSortLabel = (sort: string) => {
    switch (sort) {
      case "newest":
        return "নতুন তৈরি"
      case "oldest":
        return "পুরাতন তৈরি"
      case "title_asc":
        return "শিরোনাম (A-Z)"
      case "title_desc":
        return "শিরোনাম (Z-A)"
      default:
        return sort
    }
  }

  const getClassName = (classId: string) => {
    const cls = classes.find((c) => c.id === classId)
    return cls ? (cls.nameBn || cls.nameEn) : classId
  }

  const renderSelectFilters = () => (
    <>
      {/* Class Filter */}
      <div className="min-w-[150px]">
        <Select
          value={selectedClassId}
          onValueChange={(val) => onClassChange(val ?? "All")}
        >
          <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground py-2 px-3.5 text-xs font-medium outline-hidden hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors h-10 justify-between">
            <SelectValue placeholder="সব শ্রেণি" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl">
            <SelectItem value="All">সব শ্রেণি</SelectItem>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.nameBn || cls.nameEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status Filter */}
      <div className="min-w-[140px]">
        <Select
          value={selectedStatus}
          onValueChange={(val) => onStatusChange(val ?? "All")}
        >
          <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground py-2 px-3.5 text-xs font-medium outline-hidden hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors h-10 justify-between">
            <SelectValue placeholder="সব স্ট্যাটাস" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl">
            <SelectItem value="All">সব স্ট্যাটাস</SelectItem>
            <SelectItem value="Draft">ড্রাফট</SelectItem>
            <SelectItem value="Published">পাবলিশড</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort Filter */}
      <div className="min-w-[140px]">
        <Select
          value={selectedSort}
          onValueChange={(val) => onSortChange(val ?? "All")}
        >
          <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground py-2 px-3.5 text-xs font-medium outline-hidden hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors h-10 justify-between">
            <SelectValue placeholder="সাজানো" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl">
            <SelectItem value="All">স্বাভাবিক ক্রম</SelectItem>
            <SelectItem value="newest">নতুন তৈরি</SelectItem>
            <SelectItem value="oldest">পুরাতন তৈরি</SelectItem>
            <SelectItem value="title_asc">শিরোনাম (A to Z)</SelectItem>
            <SelectItem value="title_desc">শিরোনাম (Z to A)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  )

  return (
    <div className="space-y-3">
      {/* Primary Filter Toolbar */}
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-card p-3 sm:p-4 shadow-xs">
        {/* Search Input Filter */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="পরীক্ষার নাম বা প্রশ্নপত্র শিরোনাম দিয়ে অনুসন্ধান করুন..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-9 h-10 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-xs sm:text-sm text-foreground focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500/50 transition-all font-body"
          />
          {hasActiveQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-foreground rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="অনুসন্ধান মুছুন"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mobile Filter Sheet Trigger Button & Content (Exact Question Bank Design) */}
        <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className={`md:hidden h-10 px-3 rounded-xl border flex items-center gap-1.5 text-xs font-bold font-body transition-all shrink-0 cursor-pointer active:scale-95 ${
                activeFilterCount > 0
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-card border-border/60 text-foreground hover:bg-muted/60 shadow-2xs"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>ফিল্টার</span>
              {activeFilterCount > 0 && (
                <span className="w-4.5 h-4.5 rounded-full bg-white text-indigo-700 text-[10px] font-bold flex items-center justify-center ml-0.5">
                  {toBengaliDigits(activeFilterCount)}
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

            {/* Sheet Header */}
            <SheetHeader className="px-4 py-3 border-b border-border/40 text-left shrink-0">
              <SheetTitle className="text-base font-bold font-headline flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span>ফিল্টারসমূহ</span>
                      {activeFilterCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                          {toBengaliDigits(activeFilterCount)}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-normal text-muted-foreground font-body leading-none mt-0.5">
                      {activeFilterCount > 0
                        ? `${toBengaliDigits(activeFilterCount)}টি ফিল্টার সক্রিয় রয়েছে`
                        : "পছন্দমতো ফিল্টার নির্বাচন করুন"}
                    </p>
                  </div>
                </div>

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 font-body cursor-pointer transition-all active:scale-95"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>সব মুছুন</span>
                  </button>
                )}
              </SheetTitle>
            </SheetHeader>

            {/* Sheet Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto px-3.5 py-3.5 space-y-3.5 font-body text-xs">
              {/* Active Filter Chips Strip inside Drawer */}
              {activeFilterCount > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pb-2 border-b border-border/40">
                  <span className="text-[10px] font-semibold text-muted-foreground">সক্রিয়:</span>
                  {hasActiveClass && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium text-[11px] border border-indigo-200 dark:border-indigo-800/60">
                      <span>শ্রেণি: {getClassName(selectedClassId)}</span>
                      <button
                        type="button"
                        onClick={() => onClassChange("All")}
                        className="hover:opacity-75 cursor-pointer ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {hasActiveStatus && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium text-[11px] border border-indigo-200 dark:border-indigo-800/60">
                      <span>স্ট্যাটাস: {selectedStatus === "Draft" ? "ড্রাফট" : "পাবলিশড"}</span>
                      <button
                        type="button"
                        onClick={() => onStatusChange("All")}
                        className="hover:opacity-75 cursor-pointer ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {hasActiveSort && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium text-[11px] border border-indigo-200 dark:border-indigo-800/60">
                      <span>সাজানো: {getSortLabel(selectedSort)}</span>
                      <button
                        type="button"
                        onClick={() => onSortChange("All")}
                        className="hover:opacity-75 cursor-pointer ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* Section: Class Selection */}
              <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/40 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-foreground flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>শ্রেণি নির্বাচন</span>
                  </label>
                  {hasActiveClass && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
                      সক্রিয়
                    </span>
                  )}
                </div>
                <Select
                  value={selectedClassId}
                  onValueChange={(val) => onClassChange(val ?? "All")}
                >
                  <SelectTrigger className="w-full h-11 px-3.5 rounded-xl bg-background border border-border/60 text-xs shadow-2xs focus:ring-1 focus:ring-indigo-500">
                    <div className="flex items-center gap-2 truncate pl-1">
                      <BookOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <SelectValue placeholder="সকল শ্রেণি" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-64 font-body">
                    <SelectItem value="All">সকল শ্রেণি</SelectItem>
                    {classes.map((cls, idx) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        <span
                          className="font-solaiman font-semibold text-indigo-600 dark:text-indigo-400"
                          style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                        >
                          {toBengaliDigits(idx + 1)}.
                        </span>{" "}
                        {cls.nameBn || cls.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Section: Status Selection (Pill Buttons) */}
              <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-foreground flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>স্ট্যাটাস</span>
                  </label>
                  {hasActiveStatus && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
                      সক্রিয়
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => onStatusChange("All")}
                    className={`py-2.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer active:scale-95 ${
                      selectedStatus === "All"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-background text-foreground border border-border/60 hover:bg-muted/60"
                    }`}
                  >
                    সকল
                  </button>
                  <button
                    type="button"
                    onClick={() => onStatusChange("Draft")}
                    className={`py-2.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer active:scale-95 ${
                      selectedStatus === "Draft"
                        ? "bg-amber-600 text-white shadow-xs font-bold"
                        : "bg-background text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                    }`}
                  >
                    ড্রাফট
                  </button>
                  <button
                    type="button"
                    onClick={() => onStatusChange("Published")}
                    className={`py-2.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer active:scale-95 ${
                      selectedStatus === "Published"
                        ? "bg-emerald-600 text-white shadow-xs font-bold"
                        : "bg-background text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                    }`}
                  >
                    পাবলিশড
                  </button>
                </div>
              </div>

              {/* Section: Sort Order Toggle */}
              <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-foreground flex items-center gap-2">
                    <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>ক্রমবিন্যাস</span>
                  </label>
                  {hasActiveSort && (
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
                    নতুন তৈরি আগে
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
                    পুরাতন তৈরি আগে
                  </button>
                  <button
                    type="button"
                    onClick={() => onSortChange("title_asc")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer active:scale-95 ${
                      selectedSort === "title_asc"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-background text-muted-foreground border border-border/60 hover:bg-muted/60"
                    }`}
                  >
                    শিরোনাম (A to Z)
                  </button>
                  <button
                    type="button"
                    onClick={() => onSortChange("title_desc")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer active:scale-95 ${
                      selectedSort === "title_desc"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-background text-muted-foreground border border-border/60 hover:bg-muted/60"
                    }`}
                  >
                    শিরোনাম (Z to A)
                  </button>
                </div>
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="px-3.5 py-3 bg-background/95 backdrop-blur-md border-t border-border/50 flex items-center gap-2.5 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetAll}
                disabled={activeFilterCount === 0}
                className="h-11 px-4 rounded-xl font-bold flex items-center gap-1.5 border-border text-foreground shrink-0 disabled:opacity-40 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>রিসেট</span>
              </Button>

              <Button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] transition-transform cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>ফলাফল দেখুন</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Filter Selects & View Toggle */}
        <div className="hidden md:flex items-center gap-3">
          {renderSelectFilters()}

          {/* View Mode Toggle: Table vs Card Grid */}
          {onViewModeChange && (
            <div className="flex items-center p-1 bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => onViewModeChange("table")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-card text-primary shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="টেবিল ভিউ"
                aria-label="টেবিল ভিউ"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange("grid")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-card text-primary shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="কার্ড ভিউ"
                aria-label="কার্ড ভিউ"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Filter Badges & Reset Row */}
      {hasAnyFilter && (
        <div className="flex flex-col gap-2 rounded-xl bg-slate-50/70 dark:bg-card/60 border border-slate-200/60 dark:border-white/[0.04] p-3 text-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="font-semibold text-slate-500 dark:text-muted-foreground text-[11px] sm:text-xs font-headline">
              সক্রিয় ফিল্টারসমূহ:
            </span>

            {/* Search Query Badge */}
            {hasActiveQuery && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-slate-100 dark:hover:bg-white/[0.04] cursor-default normal-case tracking-normal max-w-[220px] truncate font-body"
              >
                <span className="truncate">অনুসন্ধান: &quot;{searchQuery}&quot;</span>
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="rounded-full p-0.5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                  title="অনুসন্ধান ফিল্টার বাদ দিন"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {/* Class Filter Badge */}
            {hasActiveClass && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-slate-100 dark:hover:bg-white/[0.04] cursor-default normal-case tracking-normal shrink-0 font-body"
              >
                <span>শ্রেণি: {getClassName(selectedClassId)}</span>
                <button
                  type="button"
                  onClick={() => onClassChange("All")}
                  className="rounded-full p-0.5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                  title="শ্রেণি ফিল্টার বাদ দিন"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {/* Status Filter Badge */}
            {hasActiveStatus && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-slate-100 dark:hover:bg-white/[0.04] cursor-default normal-case tracking-normal shrink-0 font-body"
              >
                <span>স্ট্যাটাস: {selectedStatus === "Draft" ? "ড্রাফট" : "পাবলিশড"}</span>
                <button
                  type="button"
                  onClick={() => onStatusChange("All")}
                  className="rounded-full p-0.5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                  title="স্ট্যাটাস ফিল্টার বাদ দিন"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {/* Sort Filter Badge */}
            {hasActiveSort && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-slate-100 dark:hover:bg-white/[0.04] cursor-default normal-case tracking-normal shrink-0 font-body"
              >
                <span>সাজানো: {getSortLabel(selectedSort)}</span>
                <button
                  type="button"
                  onClick={() => onSortChange("All")}
                  className="rounded-full p-0.5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                  title="সাজানো বাতিল করুন"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>

          {/* Reset All */}
          <div className="flex justify-end pt-1 sm:pt-0">
            <button
              type="button"
              onClick={handleResetAll}
              className="cursor-pointer focus:outline-hidden"
              title="সব ফিল্টার বাতিল করুন"
            >
              <Badge
                variant="outline"
                className="inline-flex items-center gap-1 rounded-lg border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/20 transition-colors normal-case tracking-normal font-headline cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>সব ফিল্টার রিসেট</span>
              </Badge>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
