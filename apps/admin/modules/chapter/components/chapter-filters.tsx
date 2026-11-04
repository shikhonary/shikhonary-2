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

interface ChapterFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedYear: string
  onYearChange: (value: string) => void
  academicYears?: OptionItem[]
  selectedClass: string
  onClassChange: (value: string) => void
  academicClasses?: OptionItem[]
  selectedSubject: string
  onSubjectChange: (value: string) => void
  subjects?: OptionItem[]
  selectedIsActive: string
  onIsActiveChange: (value: string) => void
  selectedSort: string
  onSortChange: (value: string) => void
  onResetAll?: () => void
}

export function ChapterFilters({
  searchQuery,
  onSearchChange,
  selectedYear,
  onYearChange,
  academicYears = [],
  selectedClass,
  onClassChange,
  academicClasses = [],
  selectedSubject,
  onSubjectChange,
  subjects = [],
  selectedIsActive,
  onIsActiveChange,
  selectedSort,
  onSortChange,
  onResetAll,
}: ChapterFiltersProps) {
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

  if (selectedClass && selectedClass !== "All") {
    const cls = academicClasses.find((c) => c.id === selectedClass)
    activeFilterChips.push({
      id: "class",
      label: `শ্রেণি: ${cls?.nameBn || cls?.nameEn || selectedClass}`,
      onRemove: () => {
        onClassChange("All")
        onSubjectChange("All")
      },
    })
  }

  if (selectedSubject && selectedSubject !== "All") {
    const sub = subjects.find((s) => s.id === selectedSubject)
    activeFilterChips.push({
      id: "subject",
      label: `বিষয়: ${sub?.nameBn || sub?.nameEn || selectedSubject}`,
      onRemove: () => onSubjectChange("All"),
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

  if (selectedIsActive && selectedIsActive !== "All") {
    const label = selectedIsActive === "ACTIVE" ? "শুধুমাত্র সক্রিয়" : "শুধুমাত্র নিষ্ক্রিয়"
    activeFilterChips.push({
      id: "isActive",
      label: `স্ট্যাটাস: ${label}`,
      onRemove: () => onIsActiveChange("All"),
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
    onClassChange("All")
    onSubjectChange("All")
    onYearChange("All")
    onIsActiveChange("All")
    onSortChange("All")
    onResetAll?.()
  }

  return (
    <DataTableFilterBar
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder="অধ্যায়ের নাম (বাংলা/ইংরেজি) দিয়ে অনুসন্ধান করুন..."
      activeFilters={activeFilterChips}
      onResetAll={handleReset}
      filterButtonLabel="ফিল্টার"
      filtersHeading="অধ্যায় ফিল্টারসমূহ"
      activeFiltersLabel="অ্যাক্টিভ ফিল্টারসমূহ:"
      resetLabel="রিসেট"
      resetAllLabel="সব রিসেট"
      applyFiltersLabel="ফিল্টার প্রয়োগ করুন"
      refineDisplayLabel="নির্দিষ্ট শ্রেণি, বিষয় বা শিক্ষাবর্ষের অধ্যায় খুঁজুন"
    >
      {/* 1. Academic Class Select */}
      <div className="min-w-[130px]">
        <Select
          value={selectedClass}
          onValueChange={(val) => {
            onClassChange(val ?? "All")
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
          value={selectedSubject}
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

      {/* 3. Academic Year Select */}
      <div className="min-w-[130px]">
        <Select
          value={selectedYear}
          onValueChange={(val) => onYearChange(val ?? "All")}
        >
          <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground py-2 px-3 text-xs font-medium h-10 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
            <SelectValue placeholder="সকল শিক্ষাবর্ষ" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl max-h-60 font-body">
            <SelectItem value="All">সকল শিক্ষাবর্ষ</SelectItem>
            {academicYears.map((yr) => (
              <SelectItem key={yr.id} value={yr.id}>
                {yr.nameBn || yr.nameEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 4. Active Status Select */}
      <div className="min-w-[130px]">
        <Select
          value={selectedIsActive}
          onValueChange={(val) => onIsActiveChange(val ?? "All")}
        >
          <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground py-2 px-3 text-xs font-medium h-10 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
            <SelectValue placeholder="সকল স্ট্যাটাস" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl max-h-60 font-body">
            <SelectItem value="All">সকল স্ট্যাটাস</SelectItem>
            <SelectItem value="ACTIVE">সক্রিয় (Active)</SelectItem>
            <SelectItem value="INACTIVE">নিষ্ক্রিয় (Inactive)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 5. Sort Select */}
      <div className="min-w-[150px]">
        <Select
          value={selectedSort}
          onValueChange={(val) => onSortChange(val ?? "All")}
        >
          <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground py-2 px-3 text-xs font-medium h-10 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
            <SelectValue placeholder="সাজানোর ক্রম" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl max-h-60 font-body">
            <SelectItem value="All">ডিফল্ট ক্রম</SelectItem>
            <SelectItem value="position_asc">ক্রম (ছোট থেকে বড়)</SelectItem>
            <SelectItem value="position_desc">ক্রম (বড় থেকে ছোট)</SelectItem>
            <SelectItem value="name_asc">নাম (A-Z)</SelectItem>
            <SelectItem value="name_desc">নাম (Z-A)</SelectItem>
            <SelectItem value="newest">নতুনতম আগে</SelectItem>
            <SelectItem value="oldest">পুরাতনতম আগে</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </DataTableFilterBar>
  )
}
