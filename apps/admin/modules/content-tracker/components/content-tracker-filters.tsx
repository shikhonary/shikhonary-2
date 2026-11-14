"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  DataTableFilterBar,
  type ActiveFilterChip,
} from "@/components/shared/data-table-filter-bar"

interface SubjectOption {
  id: string
  nameBn?: string
  nameEn?: string
}

interface ChapterOption {
  id: string
  nameBn?: string
  nameEn?: string
}

interface AcademicClassOption {
  id: string
  nameBn?: string
  nameEn?: string
}

interface ContentTrackerFiltersProps {
  selectedClassId: string
  onClassChange: (value: string) => void
  academicClasses?: AcademicClassOption[]
  selectedSubjectId: string
  onSubjectChange: (value: string) => void
  subjects?: SubjectOption[]
  selectedChapterId: string
  onChapterChange: (value: string) => void
  chapters?: ChapterOption[]
  selectedStatus?: string
  onStatusChange?: (value: string) => void
  showStatusFilter?: boolean
  isSubjectDisabled?: boolean
  isChapterDisabled?: boolean
  onResetAll?: () => void
}

export function ContentTrackerFilters({
  selectedClassId,
  onClassChange,
  academicClasses = [],
  selectedSubjectId,
  onSubjectChange,
  subjects = [],
  selectedChapterId,
  onChapterChange,
  chapters = [],
  selectedStatus = "All",
  onStatusChange,
  showStatusFilter = false,
  isSubjectDisabled = false,
  isChapterDisabled = false,
  onResetAll,
}: ContentTrackerFiltersProps) {
  // Generate active chips
  const activeFilterChips: ActiveFilterChip[] = []

  if (selectedClassId && selectedClassId !== "All") {
    const cls = academicClasses.find((c) => c.id === selectedClassId)
    const label = cls ? cls.nameBn || cls.nameEn : selectedClassId
    activeFilterChips.push({
      id: "class",
      label: `শ্রেণি: ${label}`,
      onRemove: () => {
        onClassChange("All")
        onSubjectChange("All")
        onChapterChange("All")
      },
    })
  }

  if (selectedSubjectId && selectedSubjectId !== "All") {
    const subj = subjects.find((s) => s.id === selectedSubjectId)
    const label = subj ? subj.nameBn || subj.nameEn : selectedSubjectId
    activeFilterChips.push({
      id: "subject",
      label: `বিষয়: ${label}`,
      onRemove: () => {
        onSubjectChange("All")
        onChapterChange("All")
      },
    })
  }

  if (selectedChapterId && selectedChapterId !== "All") {
    const ch = chapters.find((c) => c.id === selectedChapterId)
    const label = ch ? ch.nameBn || ch.nameEn : selectedChapterId
    activeFilterChips.push({
      id: "chapter",
      label: `অধ্যায়: ${label}`,
      onRemove: () => onChapterChange("All"),
    })
  }

  if (showStatusFilter && selectedStatus && selectedStatus !== "All" && onStatusChange) {
    const label =
      selectedStatus === "INACTIVE"
        ? "নিষ্ক্রিয় প্রশ্ন"
        : selectedStatus === "FLAGGED"
          ? "রিপোর্টকৃত প্রশ্ন"
          : selectedStatus
    activeFilterChips.push({
      id: "status",
      label: `স্ট্যাটাস: ${label}`,
      onRemove: () => onStatusChange("All"),
    })
  }

  const handleReset = () => {
    onClassChange("All")
    onSubjectChange("All")
    onChapterChange("All")
    if (onStatusChange) onStatusChange("All")
    if (onResetAll) onResetAll()
  }

  return (
    <DataTableFilterBar
      showSearch={false}
      activeFilters={activeFilterChips}
      onResetAll={handleReset}
      filterButtonLabel="ফিল্টার"
      filtersHeading="শ্রেণি ও বিষয় নির্বাচন"
      activeFiltersLabel="অ্যাক্টিভ ফিল্টারসমূহ:"
      resetLabel="রিসেট"
      resetAllLabel="সব রিসেট"
      applyFiltersLabel="প্রয়োগ করুন"
      refineDisplayLabel="শ্রেণি ও বিষয় বেছে নিন"
    >
      {/* 1. Academic Class Select */}
      <div className="w-full sm:min-w-[160px] sm:w-auto">
        <Select
          value={selectedClassId}
          onValueChange={(val) => {
            onClassChange(val ?? "All")
            onSubjectChange("All")
            onChapterChange("All")
          }}
        >
          <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground py-2 px-3.5 text-xs font-semibold h-10 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
            <SelectValue placeholder="শ্রেণি নির্বাচন করুন" />
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
      <div className="w-full sm:min-w-[180px] sm:w-auto">
        <Select
          value={selectedSubjectId}
          onValueChange={(val) => {
            onSubjectChange(val ?? "All")
            onChapterChange("All")
          }}
          disabled={isSubjectDisabled}
        >
          <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground py-2 px-3.5 text-xs font-semibold h-10 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer disabled:opacity-50">
            <SelectValue
              placeholder={
                selectedClassId === "All"
                  ? "প্রথমে শ্রেণি নির্বাচন করুন"
                  : "বিষয় নির্বাচন করুন"
              }
            />
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

      {/* 3. Chapter Select */}
      <div className="w-full sm:min-w-[180px] sm:w-auto">
        <Select
          value={selectedChapterId}
          onValueChange={(val) => onChapterChange(val ?? "All")}
          disabled={isChapterDisabled}
        >
          <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground py-2 px-3.5 text-xs font-semibold h-10 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer disabled:opacity-50">
            <SelectValue placeholder="সকল অধ্যায়" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl max-h-60 font-body">
            <SelectItem value="All">সকল অধ্যায়</SelectItem>
            {chapters.map((ch) => (
              <SelectItem key={ch.id} value={ch.id}>
                {ch.nameBn || ch.nameEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 4. Status Filter for Proofing Tab */}
      {showStatusFilter && onStatusChange && (
        <div className="w-full sm:min-w-[140px] sm:w-auto">
          <Select
            value={selectedStatus}
            onValueChange={(val) => onStatusChange(val ?? "All")}
          >
            <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground py-2 px-3.5 text-xs font-semibold h-10 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
              <SelectValue placeholder="সকল স্ট্যাটাস" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl max-h-60 font-body">
              <SelectItem value="All">সকল স্ট্যাটাস</SelectItem>
              <SelectItem value="INACTIVE">নিষ্ক্রিয় প্রশ্ন</SelectItem>
              <SelectItem value="FLAGGED">রিপোর্টকৃত প্রশ্ন</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </DataTableFilterBar>
  )
}
