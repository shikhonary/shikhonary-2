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

interface SummaryFiltersProps {
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

export function SummaryFilters({
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
}: SummaryFiltersProps) {
  const getSortLabel = (sort: string) => {
    switch (sort) {
      case "newest":
        return "নতুন যুক্ত"
      case "oldest":
        return "পুরাতন যুক্ত"
      case "title_asc":
        return "শিরোনাম (A থেকে Z)"
      case "title_desc":
        return "শিরোনাম (Z থেকে A)"
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

  // Construct Bengali active filter chips
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
      label: `কাঠিন্য: ${getDifficultyLabel(selectedDifficulty)}`,
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
      searchPlaceholder="সারাংশ বা সারমর্মের বিবরণ বা কিওয়ার্ড দিয়ে অনুসন্ধান করুন..."
      activeFilters={activeFilterChips}
      onResetAll={handleReset}
      filterButtonLabel="ফিল্টার"
      filtersHeading="সারাংশ ও সারমর্ম ফিল্টারসমূহ"
      activeFiltersLabel="অ্যাক্টিভ ফিল্টারসমূহ:"
      resetLabel="রিসেট"
      resetAllLabel="সব রিসেট"
      applyFiltersLabel="ফিল্টার প্রয়োগ করুন"
      refineDisplayLabel="নির্দিষ্ট শ্রেণি, বিষয় বা কাঠিন্যের প্রশ্ন খুঁজুন"
    >
      {/* 1. Academic Class Select */}
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

      {/* 2. Subject Select */}
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

      {/* 3. Difficulty Select */}
      <div className="min-w-[130px]">
        <Select
          value={selectedDifficulty}
          onValueChange={(val) => onDifficultyChange(val ?? "All")}
        >
          <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground py-2 px-3 text-xs font-medium h-10 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
            <SelectValue placeholder="সকল কাঠিন্য" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl max-h-60 font-body">
            <SelectItem value="All">সকল কাঠিন্য</SelectItem>
            <SelectItem value="EASY">সহজ (Easy)</SelectItem>
            <SelectItem value="MEDIUM">মাঝারি (Medium)</SelectItem>
            <SelectItem value="HARD">কঠিন (Hard)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 4. Sort Select */}
      <div className="min-w-[130px]">
        <Select
          value={selectedSort}
          onValueChange={(val) => onSortChange(val ?? "All")}
        >
          <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground py-2 px-3 text-xs font-medium h-10 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
            <SelectValue placeholder="সাজানো" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl max-h-60 font-body">
            <SelectItem value="All">ডিফল্ট ক্রম</SelectItem>
            <SelectItem value="newest">নতুন যুক্ত</SelectItem>
            <SelectItem value="oldest">পুরাতন যুক্ত</SelectItem>
            <SelectItem value="title_asc">শিরোনাম (A থেকে Z)</SelectItem>
            <SelectItem value="title_desc">শিরোনাম (Z থেকে A)</SelectItem>
            <SelectItem value="popularity">জনপ্রিয়তা অনুযায়ী</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </DataTableFilterBar>
  )
}
