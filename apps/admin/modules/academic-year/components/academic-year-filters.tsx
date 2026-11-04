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

interface AcademicYearFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedIsCurrent: string
  onIsCurrentChange: (value: string) => void
  selectedIsActive: string
  onIsActiveChange: (value: string) => void
  selectedSort: string
  onSortChange: (value: string) => void
  onResetAll?: () => void
}

export function AcademicYearFilters({
  searchQuery,
  onSearchChange,
  selectedIsCurrent,
  onIsCurrentChange,
  selectedIsActive,
  onIsActiveChange,
  selectedSort,
  onSortChange,
  onResetAll,
}: AcademicYearFiltersProps) {
  const getSortLabel = (sort: string) => {
    switch (sort) {
      case "newest":
        return "নতুনতম আগে"
      case "oldest":
        return "পুরাতনতম আগে"
      case "name_asc":
        return "নাম (A-Z)"
      case "name_desc":
        return "নাম (Z-A)"
      default:
        return sort
    }
  }

  // Build active filter chips matching MCQ style
  const activeFilterChips: ActiveFilterChip[] = []

  if (selectedIsCurrent && selectedIsCurrent !== "All") {
    activeFilterChips.push({
      id: "isCurrent",
      label: `বর্তমান বছর: ${selectedIsCurrent === "CURRENT" ? "শুধুমাত্র বর্তমান" : "আর্কাইভকৃত"}`,
      onRemove: () => onIsCurrentChange("All"),
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
    onIsCurrentChange("All")
    onIsActiveChange("All")
    onSortChange("All")
    if (onResetAll) onResetAll()
  }

  return (
    <DataTableFilterBar
      searchPlaceholder="শিক্ষাবর্ষের নাম দিয়ে খুঁজুন..."
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      activeFilters={activeFilterChips}
      onResetAll={activeFilterChips.length > 0 || searchQuery ? handleResetAllFilters : undefined}
      filterButtonLabel="ফিল্টার"
      filtersHeading="শিক্ষাবর্ষ ফিল্টারসমূহ"
      activeFiltersLabel="অ্যাক্টিভ ফিল্টারসমূহ:"
      resetLabel="রিসেট"
      resetAllLabel="সব রিসেট"
      applyFiltersLabel="ফিল্টার প্রয়োগ করুন"
      refineDisplayLabel="বর্তমান বা সক্রিয় শিক্ষাবর্ষ ফিল্টার করুন"
    >
      {/* Current Year Filter */}
      <Select value={selectedIsCurrent} onValueChange={(val) => onIsCurrentChange(val || "All")}>
        <SelectTrigger className="w-full sm:w-[160px] rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-card text-foreground font-medium text-xs sm:text-sm h-10 px-3">
          <SelectValue placeholder="সকল শিক্ষাবর্ষ" />
        </SelectTrigger>
        <SelectContent className="bg-popover text-popover-foreground border border-slate-200 dark:border-white/[0.08] rounded-xl shadow-lg">
          <SelectItem value="All">সকল শিক্ষাবর্ষ</SelectItem>
          <SelectItem value="CURRENT">শুধুমাত্র বর্তমান শিক্ষাবর্ষ</SelectItem>
          <SelectItem value="NOT_CURRENT">আর্কাইভকৃত শিক্ষাবর্ষ</SelectItem>
        </SelectContent>
      </Select>

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
          <SelectItem value="All">ডিফল্ট (নতুনতম আগে)</SelectItem>
          <SelectItem value="newest">নতুনতম আগে</SelectItem>
          <SelectItem value="oldest">পুরাতনতম আগে</SelectItem>
          <SelectItem value="name_asc">নাম (A to Z)</SelectItem>
          <SelectItem value="name_desc">নাম (Z to A)</SelectItem>
        </SelectContent>
      </Select>
    </DataTableFilterBar>
  )
}
