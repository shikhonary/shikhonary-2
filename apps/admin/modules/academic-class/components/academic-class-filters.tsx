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

interface OptionItem {
  id: string
  nameEn: string
  nameBn?: string
}

interface AcademicClassFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedYear: string
  onYearChange: (value: string) => void
  academicYears?: OptionItem[]
  selectedIsActive: string
  onIsActiveChange: (value: string) => void
  selectedSort: string
  onSortChange: (value: string) => void
  onResetAll?: () => void
}

export function AcademicClassFilters({
  searchQuery,
  onSearchChange,
  selectedYear,
  onYearChange,
  academicYears = [],
  selectedIsActive,
  onIsActiveChange,
  selectedSort,
  onSortChange,
  onResetAll,
}: AcademicClassFiltersProps) {
  const getSortLabel = (sort: string) => {
    switch (sort) {
      case "position_asc":
        return "ক্রম (ছোট থেকে বড়)"
      case "position_desc":
        return "ক্রম (বড় থেকে ছোট)"
      case "name_asc":
        return "নাম (A-Z)"
      case "name_desc":
        return "নাম (Z-A)"
      case "newest":
        return "নতুনতম আগে"
      case "oldest":
        return "পুরাতনতম আগে"
      default:
        return sort
    }
  }

  // Build active filter chips matching MCQ style
  const activeFilterChips: ActiveFilterChip[] = []

  if (selectedYear && selectedYear !== "All") {
    const yr = academicYears.find((y) => y.id === selectedYear)
    activeFilterChips.push({
      id: "year",
      label: `শিক্ষাবর্ষ: ${yr?.nameBn || yr?.nameEn || selectedYear}`,
      onRemove: () => onYearChange("All"),
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
    onYearChange("All")
    onIsActiveChange("All")
    onSortChange("All")
    if (onResetAll) onResetAll()
  }

  return (
    <DataTableFilterBar
      searchPlaceholder="শ্রেণির নাম দিয়ে খুঁজুন..."
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      activeFilters={activeFilterChips}
      onResetAll={activeFilterChips.length > 0 || searchQuery ? handleResetAllFilters : undefined}
      filterButtonLabel="ফিল্টার"
      filtersHeading="শ্রেণি ফিল্টারসমূহ"
      activeFiltersLabel="অ্যাক্টিভ ফিল্টারসমূহ:"
      resetLabel="রিসেট"
      resetAllLabel="সব রিসেট"
      applyFiltersLabel="ফিল্টার প্রয়োগ করুন"
      refineDisplayLabel="নির্দিষ্ট শিক্ষাবর্ষ বা স্ট্যাটাসের শ্রেণি খুঁজুন"
    >
      {/* Academic Year Filter */}
      {academicYears.length > 0 && (
        <Select value={selectedYear} onValueChange={(val) => onYearChange(val || "All")}>
          <SelectTrigger className="w-full sm:w-[160px] rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-card text-foreground font-medium text-xs sm:text-sm h-10 px-3">
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
      )}

      {/* Status Filter */}
      <Select value={selectedIsActive} onValueChange={(val) => onIsActiveChange(val || "All")}>
        <SelectTrigger className="w-full sm:w-[140px] rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-card text-foreground font-medium text-xs sm:text-sm h-10 px-3">
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
        <SelectTrigger className="w-full sm:w-[160px] rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-card text-foreground font-medium text-xs sm:text-sm h-10 px-3">
          <SelectValue placeholder="সর্টিং নির্বাচন" />
        </SelectTrigger>
        <SelectContent className="bg-popover text-popover-foreground border border-slate-200 dark:border-white/[0.08] rounded-xl shadow-lg">
          <SelectItem value="All">ডিফল্ট (ক্রম অনুযায়ী)</SelectItem>
          <SelectItem value="position_asc">ক্রম (ছোট থেকে বড়)</SelectItem>
          <SelectItem value="position_desc">ক্রম (বড় থেকে ছোট)</SelectItem>
          <SelectItem value="name_asc">নাম (A to Z)</SelectItem>
          <SelectItem value="name_desc">নাম (Z to A)</SelectItem>
          <SelectItem value="newest">নতুনতম আগে</SelectItem>
          <SelectItem value="oldest">পুরাতনতম আগে</SelectItem>
        </SelectContent>
      </Select>
    </DataTableFilterBar>
  )
}
