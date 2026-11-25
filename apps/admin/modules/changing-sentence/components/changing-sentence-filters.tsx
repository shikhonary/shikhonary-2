"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { DataTableFilterBar, type ActiveFilterChip } from "@/components/shared/data-table-filter-bar"
import { QUESTION_DIFFICULTY_OPTIONS } from "@workspace/utils"

interface SubjectOption {
  id: string
  nameEn: string
  nameBn?: string
}

interface AcademicClassOption {
  id: string
  nameEn: string
  nameBn?: string
}

interface ChangingSentenceFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedAcademicClassId: string
  onAcademicClassChange: (value: string) => void
  academicClasses?: AcademicClassOption[]
  selectedSubjectId: string
  onSubjectChange: (value: string) => void
  subjects?: SubjectOption[]
  selectedDifficulty: string
  onDifficultyChange: (value: string) => void
  selectedSort: string
  onSortChange: (value: string) => void
  onResetAll?: () => void
}

export function ChangingSentenceFilters({
  searchQuery,
  onSearchChange,
  selectedAcademicClassId,
  onAcademicClassChange,
  academicClasses = [],
  selectedSubjectId,
  onSubjectChange,
  subjects = [],
  selectedDifficulty,
  onDifficultyChange,
  selectedSort,
  onSortChange,
  onResetAll,
}: ChangingSentenceFiltersProps) {
  const getSortLabel = (sort: string) => {
    switch (sort) {
      case "newest":
        return "নতুন যুক্ত"
      case "oldest":
        return "পুরাতন যুক্ত"
      case "content_asc":
        return "বিবরণ (A থেকে Z)"
      case "content_desc":
        return "বিবরণ (Z থেকে A)"
      case "popularity":
        return "জনপ্রিয়তা অনুযায়ী"
      default:
        return "ডিফল্ট ক্রম"
    }
  }

  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case "EASY":
        return "সহজ (Easy)"
      case "MEDIUM":
        return "মাঝারি (Medium)"
      case "HARD":
        return "কঠিন (Hard)"
      default:
        return diff
    }
  }

  const activeFilterChips: ActiveFilterChip[] = []

  if (selectedAcademicClassId && selectedAcademicClassId !== "All") {
    const cls = academicClasses.find((c) => c.id === selectedAcademicClassId)
    const label = cls ? (cls.nameBn || cls.nameEn) : selectedAcademicClassId
    activeFilterChips.push({
      id: "class",
      label: `শ্রেণি: ${label}`,
      onRemove: () => {
        onAcademicClassChange("All")
        onSubjectChange("All")
      },
    })
  }

  if (selectedSubjectId && selectedSubjectId !== "All") {
    const subj = subjects.find((s) => s.id === selectedSubjectId)
    const label = subj ? (subj.nameBn || subj.nameEn) : selectedSubjectId
    activeFilterChips.push({
      id: "subject",
      label: `বিষয়: ${label}`,
      onRemove: () => onSubjectChange("All"),
    })
  }

  if (selectedDifficulty && selectedDifficulty !== "All") {
    activeFilterChips.push({
      id: "difficulty",
      label: `কঠিনতা: ${getDifficultyLabel(selectedDifficulty)}`,
      onRemove: () => onDifficultyChange("All"),
    })
  }

  if (selectedSort && selectedSort !== "All") {
    activeFilterChips.push({
      id: "sort",
      label: `সাজানো: ${getSortLabel(selectedSort)}`,
      onRemove: () => onSortChange("All"),
    })
  }

  const handleReset = () => {
    onSearchChange("")
    onAcademicClassChange("All")
    onSubjectChange("All")
    onDifficultyChange("All")
    onSortChange("All")
    onResetAll?.()
  }

  return (
    <DataTableFilterBar
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder="বাক্য রূপান্তরের প্রশ্ন, নির্দেশনা বা রেফারেন্স দিয়ে খুঁজুন..."
      activeFilters={activeFilterChips}
      onResetAll={handleReset}
      filterButtonLabel="ফিল্টার"
      filtersHeading="বাক্য রূপান্তর ফিল্টারসমূহ"
      activeFiltersLabel="অ্যাক্টিভ ফিল্টারসমূহ:"
      resetLabel="রিসেট"
      resetAllLabel="সব রিসেট"
      applyFiltersLabel="ফিল্টার প্রয়োগ করুন"
      refineDisplayLabel="নির্দিষ্ট শ্রেণি বা বিষয়ের প্রশ্ন খুঁজুন"
    >
      <div className="min-w-[130px]">
        <Select
          value={selectedAcademicClassId}
          onValueChange={(val) => {
            onAcademicClassChange(val ?? "All")
            onSubjectChange("All")
          }}
        >
          <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground py-2 px-3 text-xs font-medium h-10 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
            <SelectValue placeholder="সকল শ্রেণি" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl max-h-60 font-body">
            <SelectItem value="All">সকল শ্রেণি</SelectItem>
            {academicClasses.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.nameBn || cls.nameEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[140px]">
        <Select
          value={selectedSubjectId}
          onValueChange={(val) => onSubjectChange(val ?? "All")}
        >
          <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground py-2 px-3 text-xs font-medium h-10 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
            <SelectValue placeholder="সকল বিষয়" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl max-h-60 font-body">
            <SelectItem value="All">সকল বিষয়</SelectItem>
            {subjects.map((subj) => (
              <SelectItem key={subj.id} value={subj.id}>
                {subj.nameBn || subj.nameEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[130px]">
        <Select
          value={selectedDifficulty}
          onValueChange={(val) => onDifficultyChange(val ?? "All")}
        >
          <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground py-2 px-3 text-xs font-medium h-10 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
            <SelectValue placeholder="সকল কঠিনতা" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl font-body">
            <SelectItem value="All">সকল কঠিনতা</SelectItem>
            {QUESTION_DIFFICULTY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {getDifficultyLabel(opt.value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[130px]">
        <Select
          value={selectedSort}
          onValueChange={(val) => onSortChange(val ?? "All")}
        >
          <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground py-2 px-3 text-xs font-medium h-10 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
            <SelectValue placeholder="ডিফল্ট ক্রম" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl font-body">
            <SelectItem value="All">ডিফল্ট ক্রম</SelectItem>
            <SelectItem value="newest">নতুন যুক্ত</SelectItem>
            <SelectItem value="oldest">পুরাতন যুক্ত</SelectItem>
            <SelectItem value="content_asc">বিবরণ (A থেকে Z)</SelectItem>
            <SelectItem value="content_desc">বিবরণ (Z থেকে A)</SelectItem>
            <SelectItem value="popularity">জনপ্রিয়তা অনুযায়ী</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </DataTableFilterBar>
  )
}
