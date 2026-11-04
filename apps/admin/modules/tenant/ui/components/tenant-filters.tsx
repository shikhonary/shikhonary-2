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

interface TenantFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedStatus: string
  onStatusChange: (value: string) => void
  selectedType: string
  onTypeChange: (value: string) => void
  selectedSort: string
  onSortChange: (value: string) => void
  onResetAll?: () => void
}

const STATUS_LABELS: Record<string, string> = {
  active: "সক্রিয়",
  inactive: "নিষ্ক্রিয়",
  suspended: "স্থগিত",
}

const TYPE_LABELS: Record<string, string> = {
  SCHOOL: "বিদ্যালয়",
  COLLEGE: "কলেজ",
  MADRASAH: "মাদ্রাসা",
  UNIVERSITY: "বিশ্ববিদ্যালয়",
}

const SORT_LABELS: Record<string, string> = {
  newest: "নতুনতম আগে",
  oldest: "পুরাতনতম আগে",
  name_asc: "নাম (A-Z)",
  name_desc: "নাম (Z-A)",
}

export function TenantFilters({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedType,
  onTypeChange,
  selectedSort,
  onSortChange,
  onResetAll,
}: TenantFiltersProps) {
  // Build active filter chips matching MCQ style
  const activeFilterChips: ActiveFilterChip[] = []

  if (selectedStatus && selectedStatus !== "all") {
    activeFilterChips.push({
      id: "status",
      label: `স্ট্যাটাস: ${STATUS_LABELS[selectedStatus] || selectedStatus}`,
      onRemove: () => onStatusChange("all"),
    })
  }

  if (selectedType && selectedType !== "all") {
    activeFilterChips.push({
      id: "type",
      label: `ধরণ: ${TYPE_LABELS[selectedType] || selectedType}`,
      onRemove: () => onTypeChange("all"),
    })
  }

  if (selectedSort && selectedSort !== "All" && selectedSort !== "newest") {
    activeFilterChips.push({
      id: "sort",
      label: `সর্টিং: ${SORT_LABELS[selectedSort] || selectedSort}`,
      onRemove: () => onSortChange("newest"),
    })
  }

  const handleResetAllFilters = () => {
    onSearchChange("")
    onStatusChange("all")
    onTypeChange("all")
    onSortChange("newest")
    if (onResetAll) onResetAll()
  }

  return (
    <DataTableFilterBar
      searchPlaceholder="প্রতিষ্ঠানের নাম, কোড বা স্লাগ দিয়ে খুঁজুন..."
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      activeFilters={activeFilterChips}
      onResetAll={activeFilterChips.length > 0 || searchQuery ? handleResetAllFilters : undefined}
      filterButtonLabel="ফিল্টার"
      filtersHeading="প্রতিষ্ঠান ফিল্টারসমূহ"
      activeFiltersLabel="অ্যাক্টিভ ফিল্টারসমূহ:"
      resetLabel="রিসেট"
      resetAllLabel="সব রিসেট"
      applyFiltersLabel="ফিল্টার প্রয়োগ করুন"
      refineDisplayLabel="প্রতিষ্ঠান ধরণ, স্ট্যাটাস ও সর্টিং ফিল্টার করুন"
    >
      {/* Status Filter */}
      <Select value={selectedStatus} onValueChange={(val) => onStatusChange(val || "all")}>
        <SelectTrigger className="w-full sm:w-[150px] rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-card text-foreground font-medium text-xs sm:text-sm h-10 px-3">
          <SelectValue placeholder="সকল স্ট্যাটাস" />
        </SelectTrigger>
        <SelectContent className="bg-popover text-popover-foreground border border-slate-200 dark:border-white/[0.08] rounded-xl shadow-lg">
          <SelectItem value="all">সকল স্ট্যাটাস</SelectItem>
          <SelectItem value="active">সক্রিয় (Active)</SelectItem>
          <SelectItem value="inactive">নিষ্ক্রিয় (Inactive)</SelectItem>
          <SelectItem value="suspended">স্থগিত (Suspended)</SelectItem>
        </SelectContent>
      </Select>

      {/* Type Filter */}
      <Select value={selectedType} onValueChange={(val) => onTypeChange(val || "all")}>
        <SelectTrigger className="w-full sm:w-[160px] rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-card text-foreground font-medium text-xs sm:text-sm h-10 px-3">
          <SelectValue placeholder="সকল প্রতিষ্ঠান" />
        </SelectTrigger>
        <SelectContent className="bg-popover text-popover-foreground border border-slate-200 dark:border-white/[0.08] rounded-xl shadow-lg">
          <SelectItem value="all">সকল প্রতিষ্ঠান</SelectItem>
          <SelectItem value="SCHOOL">বিদ্যালয় (School)</SelectItem>
          <SelectItem value="COLLEGE">কলেজ (College)</SelectItem>
          <SelectItem value="MADRASAH">মাদ্রাসা (Madrasah)</SelectItem>
          <SelectItem value="UNIVERSITY">বিশ্ববিদ্যালয় (University)</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort Filter */}
      <Select value={selectedSort} onValueChange={(val) => onSortChange(val || "newest")}>
        <SelectTrigger className="w-full sm:w-[160px] rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-card text-foreground font-medium text-xs sm:text-sm h-10 px-3">
          <SelectValue placeholder="সর্টিং নির্বাচন" />
        </SelectTrigger>
        <SelectContent className="bg-popover text-popover-foreground border border-slate-200 dark:border-white/[0.08] rounded-xl shadow-lg">
          <SelectItem value="newest">নতুনতম আগে</SelectItem>
          <SelectItem value="oldest">পুরাতনতম আগে</SelectItem>
          <SelectItem value="name_asc">নাম (A to Z)</SelectItem>
          <SelectItem value="name_desc">নাম (Z to A)</SelectItem>
        </SelectContent>
      </Select>
    </DataTableFilterBar>
  )
}
