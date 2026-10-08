"use client"

import React from "react"
import { Search, LayoutGrid, List, X, Filter } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { cn } from "@workspace/ui/lib/utils"
import type { QuestionBankViewMode } from "@/modules/question-bank/hooks/use-question-bank-search-params"

interface FilterOptionItem {
  id: string
  nameEn: string
  nameBn: string
  code?: string | null
}

interface DesktopFiltersProps {
  search: string
  onSearchChange: (val: string) => void
  classId: string
  onClassChange: (val: string) => void
  subjectId: string
  onSubjectChange: (val: string) => void
  chapterId: string
  onChapterChange: (val: string) => void
  category: string
  onCategoryChange: (val: string) => void
  difficulty: string
  onDifficultyChange: (val: string) => void
  sort: "newest" | "oldest"
  onSortChange: (val: "newest" | "oldest") => void
  viewMode: QuestionBankViewMode
  onViewModeChange: (val: QuestionBankViewMode) => void
  classes: FilterOptionItem[]
  subjects: FilterOptionItem[]
  chapters: FilterOptionItem[]
  categories: Array<{ code: string; nameEn: string; nameBn: string }>
  onResetFilters: () => void
  hasActiveFilters: boolean
}

export const DesktopFilters: React.FC<DesktopFiltersProps> = ({
  search,
  onSearchChange,
  classId,
  onClassChange,
  subjectId,
  onSubjectChange,
  chapterId,
  onChapterChange,
  category,
  onCategoryChange,
  difficulty,
  onDifficultyChange,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
  classes,
  subjects,
  chapters,
  categories,
  onResetFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="p-5 border-b border-white/[0.06] flex flex-col gap-4 bg-card/60">
      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = category.toUpperCase() === cat.code.toUpperCase()
          return (
            <button
              key={cat.code}
              type="button"
              onClick={() => onCategoryChange(cat.code)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer border select-none",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-xs font-bold"
                  : "bg-white/[0.03] text-muted-foreground hover:text-foreground hover:bg-white/[0.06] border-white/[0.06]"
              )}
            >
              <span>{cat.nameBn || cat.nameEn}</span>
            </button>
          )
        })}
      </div>

      {/* Main Filter Row: Cascading Selects + Search + View Mode */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search Input */}
        <div className="md:col-span-4 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="প্রশ্ন, উদ্দীপক বা কীওয়ার্ড লিখুন..."
            className="pl-9 pr-8 h-9 text-xs font-body bg-white/[0.03] border-white/[0.08] focus:border-primary/50 text-foreground"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Class Select */}
        <div className="md:col-span-2">
          <Select value={classId} onValueChange={onClassChange}>
            <SelectTrigger className="h-9 text-xs font-body bg-white/[0.03] border-white/[0.08] text-foreground">
              <SelectValue placeholder="সকল শ্রেণি" />
            </SelectTrigger>
            <SelectContent className="bg-card border-white/[0.08] text-foreground text-xs font-body">
              <SelectItem value="All">সকল শ্রেণি</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nameBn || c.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subject Select */}
        <div className="md:col-span-2">
          <Select value={subjectId} onValueChange={onSubjectChange}>
            <SelectTrigger className="h-9 text-xs font-body bg-white/[0.03] border-white/[0.08] text-foreground">
              <SelectValue placeholder="সকল বিষয়" />
            </SelectTrigger>
            <SelectContent className="bg-card border-white/[0.08] text-foreground text-xs font-body">
              <SelectItem value="All">সকল বিষয়</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.nameBn || s.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Chapter Select */}
        <div className="md:col-span-2">
          <Select
            value={chapterId}
            onValueChange={onChapterChange}
            disabled={!subjectId || subjectId === "All"}
          >
            <SelectTrigger className="h-9 text-xs font-body bg-white/[0.03] border-white/[0.08] text-foreground disabled:opacity-50">
              <SelectValue placeholder="সকল অধ্যায়" />
            </SelectTrigger>
            <SelectContent className="bg-card border-white/[0.08] text-foreground text-xs font-body">
              <SelectItem value="All">সকল অধ্যায়</SelectItem>
              {chapters.map((ch) => (
                <SelectItem key={ch.id} value={ch.id}>
                  {ch.nameBn || ch.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty Select */}
        <div className="md:col-span-1">
          <Select value={difficulty} onValueChange={onDifficultyChange}>
            <SelectTrigger className="h-9 text-xs font-body bg-white/[0.03] border-white/[0.08] text-foreground">
              <SelectValue placeholder="কাঠিন্য" />
            </SelectTrigger>
            <SelectContent className="bg-card border-white/[0.08] text-foreground text-xs font-body">
              <SelectItem value="All">সকল</SelectItem>
              <SelectItem value="EASY">সহজ</SelectItem>
              <SelectItem value="MEDIUM">মধ্যম</SelectItem>
              <SelectItem value="HARD">কঠিন</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Mode & Reset Controls */}
        <div className="md:col-span-1 flex items-center justify-end gap-1.5">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onResetFilters}
              title="ফিল্টার রিসেট করুন"
              className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-white/[0.06] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </Button>
          )}

          <div className="flex items-center border border-white/[0.08] rounded-lg p-0.5 bg-white/[0.02]">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={cn(
                "p-1.5 rounded-md transition-colors cursor-pointer",
                viewMode === "grid"
                  ? "bg-white/[0.10] text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="গ্রিড ভিউ"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("table")}
              className={cn(
                "p-1.5 rounded-md transition-colors cursor-pointer",
                viewMode === "table"
                  ? "bg-white/[0.10] text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="টেবিল ভিউ"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
