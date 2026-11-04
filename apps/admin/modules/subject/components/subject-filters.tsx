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
import { ACADEMIC_SUBJECT_GROUP_OPTIONS } from "@workspace/utils"

interface OptionItem {
  id: string
  nameEn: string
  nameBn?: string
}

interface SubjectFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedClass: string
  onClassChange: (value: string) => void
  academicClasses?: OptionItem[]
  selectedYear: string
  onYearChange: (value: string) => void
  academicYears?: OptionItem[]
  selectedGroup: string
  onGroupChange: (value: string) => void
  selectedIsActive: string
  onIsActiveChange: (value: string) => void
  selectedSort: string
  onSortChange: (value: string) => void
  onResetAll?: () => void
}

export function SubjectFilters({
  searchQuery,
  onSearchChange,
  selectedClass,
  onClassChange,
  academicClasses = [],
  selectedYear,
  onYearChange,
  academicYears = [],
  selectedGroup,
  onGroupChange,
  selectedIsActive,
  onIsActiveChange,
  selectedSort,
  onSortChange,
  onResetAll,
}: SubjectFiltersProps) {
  const getSortLabel = (sort: string) => {
    switch (sort) {
      case "name_asc":
        return "নাম (A-Z)"
      case "name_desc":
        return "নাম (Z-A)"
      case "code_asc":
        return "কোড (ছোট থেকে বড়)"
      case "code_desc":
        return "কোড (বড় থেকে ছোট)"
      case "newest":
        return "নতুনতম আগে"
      case "oldest":
        return "পুরাতনতম আগে"
      default:
        return sort
    }
  }

  const getGroupLabel = (group: string) => {
    switch (group) {
      case "General":
        return "সাধারণ (General)"
      case "Science":
        return "বিজ্ঞান (Science)"
      case "Humanities":
        return "মানবিক (Humanities)"
      case "Commerce":
        return "ব্যবসায় শিক্ষা (Commerce)"
      default:
        return group
    }
  }

  // Build active filter chips matching MCQ style
  const activeFilterChips: ActiveFilterChip[] = []

  if (selectedClass && selectedClass !== "All") {
    const cls = academicClasses.find((c) => c.id === selectedClass)
    activeFilterChips.push({
      id: "class",
      label: `শ্রেণি: ${cls?.nameBn || cls?.nameEn || selectedClass}`,
      onRemove: () => onClassChange("All"),
    })
  }

  if (selectedYear && selectedYear !== "All") {
    const yr = academicYears.find((y) => y.id === selectedYear)
    activeFilterChips.push({
      id: "year",
      label: `শিক্ষাবর্ষ: ${yr?.nameBn || yr?.nameEn || selectedYear}`,
      onRemove: () => onYearChange("All"),
    })
  }

  if (selectedGroup && selectedGroup !== "All") {
    activeFilterChips.push({
      id: "group",
      label: `বিভাগ: ${getGroupLabel(selectedGroup)}`,
      onRemove: () => onGroupChange("All"),
    })
  }

  if (selectedIsActive && selectedIsActive !== "All") {
    activeFilterChips.push({
      id: "status",
      label: `স্ট্যাটাস: ${selectedIsActive === "ACTIVE" ? "সক্রিয়" : "নিষ্ক্রিয়"}`,
      onRemove: () => onIsActiveChange("All"),
    })
  }

  if (selectedSort && selectedSort !== "All") {
    activeFilterChips.push({
      id: "sort",
      label: `সর্টিং: ${getSortLabel(selectedSort)}`,
      onRemove: () => onSortChange("All"),
    })
  }

  const handleResetAllFilters = () => {
    onSearchChange("")
    onClassChange("All")
    onYearChange("All")
    onGroupChange("All")
    onIsActiveChange("All")
    onSortChange("All")
    if (onResetAll) onResetAll()
  }

  return (
    <DataTableFilterBar
      searchPlaceholder="বিষয় নাম, কোড বা বিভাগ দিয়ে খুঁজুন..."
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      activeFilters={activeFilterChips}
      onResetAll={activeFilterChips.length > 0 || searchQuery ? handleResetAllFilters : undefined}
      filterButtonLabel="ফিল্টার"
      filtersHeading="বিষয় ফিল্টারসমূহ"
      activeFiltersLabel="অ্যাক্টিভ ফিল্টারসমূহ:"
      resetLabel="রিসেট"
      resetAllLabel="সব রিসেট"
      applyFiltersLabel="ফিল্টার প্রয়োগ করুন"
      refineDisplayLabel="নির্দিষ্ট শ্রেণি, শিক্ষাবর্ষ বা বিভাগের বিষয় খুঁজুন"
    >
      {/* Class Filter */}
      <Select value={selectedClass} onValueChange={(val) => onClassChange(val || "All")}>
        <SelectTrigger className="w-full sm:w-[150px] rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-card text-foreground font-medium text-xs sm:text-sm h-10 px-3">
          <SelectValue placeholder="সকল শ্রেণি" />
        </SelectTrigger>
        <SelectContent className="bg-popover text-popover-foreground border border-slate-200 dark:border-white/[0.08] rounded-xl shadow-lg">
          <SelectItem value="All">সকল শ্রেণি</SelectItem>
          {academicClasses.map((cls) => (
            <SelectItem key={cls.id} value={cls.id}>
              {cls.nameBn || cls.nameEn}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Academic Year Filter */}
      <Select value={selectedYear} onValueChange={(val) => onYearChange(val || "All")}>
        <SelectTrigger className="w-full sm:w-[150px] rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-card text-foreground font-medium text-xs sm:text-sm h-10 px-3">
          <SelectValue placeholder="সকল শিক্ষাবর্ষ" />
        </SelectTrigger>
        <SelectContent className="bg-popover text-popover-foreground border border-slate-200 dark:border-white/[0.08] rounded-xl shadow-lg">
          <SelectItem value="All">সকল শিক্ষাবর্ষ</SelectItem>
          {academicYears.map((yr) => (
            <SelectItem key={yr.id} value={yr.id}>
              {yr.nameBn || yr.nameEn}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Group Filter */}
      <Select value={selectedGroup} onValueChange={(val) => onGroupChange(val || "All")}>
        <SelectTrigger className="w-full sm:w-[140px] rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-card text-foreground font-medium text-xs sm:text-sm h-10 px-3">
          <SelectValue placeholder="সকল বিভাগ" />
        </SelectTrigger>
        <SelectContent className="bg-popover text-popover-foreground border border-slate-200 dark:border-white/[0.08] rounded-xl shadow-lg">
          <SelectItem value="All">সকল বিভাগ</SelectItem>
          {ACADEMIC_SUBJECT_GROUP_OPTIONS.map((g) => (
            <SelectItem key={g.value} value={g.value}>
              {getGroupLabel(g.value)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select value={selectedIsActive} onValueChange={(val) => onIsActiveChange(val || "All")}>
        <SelectTrigger className="w-full sm:w-[130px] rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-card text-foreground font-medium text-xs sm:text-sm h-10 px-3">
          <SelectValue placeholder="সকল স্ট্যাটাস" />
        </SelectTrigger>
        <SelectContent className="bg-popover text-popover-foreground border border-slate-200 dark:border-white/[0.08] rounded-xl shadow-lg">
          <SelectItem value="All">সকল স্ট্যাটাস</SelectItem>
          <SelectItem value="ACTIVE">সক্রিয় (Active)</SelectItem>
          <SelectItem value="INACTIVE">নিষ্ক্রিয় (Inactive)</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort Filter */}
      <Select value={selectedSort} onValueChange={(val) => onSortChange(val || "All")}>
        <SelectTrigger className="w-full sm:w-[150px] rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-card text-foreground font-medium text-xs sm:text-sm h-10 px-3">
          <SelectValue placeholder="সর্টিং নির্বাচন" />
        </SelectTrigger>
        <SelectContent className="bg-popover text-popover-foreground border border-slate-200 dark:border-white/[0.08] rounded-xl shadow-lg">
          <SelectItem value="All">ডিফল্ট সর্টিং</SelectItem>
          <SelectItem value="newest">নতুনতম আগে</SelectItem>
          <SelectItem value="oldest">পুরাতনতম আগে</SelectItem>
          <SelectItem value="name_asc">নাম (A to Z)</SelectItem>
          <SelectItem value="name_desc">নাম (Z to A)</SelectItem>
          <SelectItem value="code_asc">কোড (ছোট থেকে বড়)</SelectItem>
          <SelectItem value="code_desc">কোড (বড় থেকে ছোট)</SelectItem>
        </SelectContent>
      </Select>
    </DataTableFilterBar>
  )
}
