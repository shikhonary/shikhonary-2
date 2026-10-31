"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { DataTableFilterBar, type ActiveFilterChip } from "@/components/shared/data-table-filter-bar"
import { toBengaliDigits, toEnglishDigits, extractReferenceYear } from "@workspace/utils"

interface SubjectOption {
  id: string
  nameEn: string
  nameBn?: string
}

interface ChapterOption {
  id: string
  nameEn: string
  nameBn?: string
  subjectId: string
}

interface AcademicClassOption {
  id: string
  nameEn: string
  nameBn?: string
}

interface McqFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedAcademicClassId: string
  onAcademicClassChange: (value: string) => void
  academicClasses?: AcademicClassOption[]
  selectedSubjectId: string
  onSubjectChange: (value: string) => void
  subjects?: SubjectOption[]
  selectedChapterId: string
  onChapterChange: (value: string) => void
  chapters?: ChapterOption[]
  selectedBoard: string
  onBoardChange: (value: string) => void
  boardYears?: any[]
  selectedType: string
  onTypeChange: (value: string) => void
  selectedSort: string
  onSortChange: (value: string) => void
  onResetAll?: () => void
}

export function McqFilters({
  searchQuery,
  onSearchChange,
  selectedAcademicClassId,
  onAcademicClassChange,
  academicClasses = [],
  selectedSubjectId,
  onSubjectChange,
  subjects = [],
  selectedChapterId,
  onChapterChange,
  chapters = [],
  selectedBoard,
  onBoardChange,
  boardYears = [],
  selectedType,
  onTypeChange,
  selectedSort,
  onSortChange,
  onResetAll,
}: McqFiltersProps) {
  const filteredChapters =
    selectedSubjectId !== "All"
      ? chapters.filter((c) => c.subjectId === selectedSubjectId)
      : chapters

  const isBoardDisabled = boardYears.length === 0

  const groupedReferencesByYear = React.useMemo(() => {
    const yearMap = new Map<string, Array<{ rawRef: string; count: number }>>()
    const noYearList: Array<{ rawRef: string; count: number }> = []

    for (const b of boardYears) {
      const rawRef = typeof b === "string" ? b : b.rawRef || b.boardName || b.board || ""
      if (!rawRef) continue
      const count = typeof b === "object" && typeof b.count === "number" ? b.count : 1

      const year = extractReferenceYear(rawRef)
      if (year) {
        if (!yearMap.has(year)) {
          yearMap.set(year, [])
        }
        yearMap.get(year)!.push({ rawRef, count })
      } else {
        noYearList.push({ rawRef, count })
      }
    }

    // Sort years descending (e.g. ২০২৬, ২০২৫, ২০২৪, ২০২৩...)
    const sortedYears = Array.from(yearMap.keys()).sort((a, b) => {
      const numA = Number(toEnglishDigits(a)) || 0
      const numB = Number(toEnglishDigits(b)) || 0
      return numB - numA
    })

    return {
      years: sortedYears.map((yr) => ({
        year: yr,
        items: yearMap.get(yr)!.sort((a, b) => b.count - a.count),
      })),
      noYear: noYearList.sort((a, b) => b.count - a.count),
    }
  }, [boardYears])

  const getSortLabel = (sort: string) => {
    switch (sort) {
      case "newest":
        return "নতুন যুক্ত"
      case "oldest":
        return "পুরাতন যুক্ত"
      case "question_asc":
        return "প্রশ্ন (A থেকে Z)"
      case "question_desc":
        return "প্রশ্ন (Z থেকে A)"
      default:
        return "ডিফল্ট ক্রম"
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
        onChapterChange("All")
      },
    })
  }

  if (selectedSubjectId && selectedSubjectId !== "All") {
    const subj = subjects.find((s) => s.id === selectedSubjectId)
    const label = subj ? (subj.nameBn || subj.nameEn) : selectedSubjectId
    activeFilterChips.push({
      id: "subject",
      label: `বিষয়: ${label}`,
      onRemove: () => {
        onSubjectChange("All")
        onChapterChange("All")
        onBoardChange("All")
      },
    })
  }

  if (selectedChapterId && selectedChapterId !== "All") {
    const ch = chapters.find((c) => c.id === selectedChapterId)
    const label = ch ? (ch.nameBn || ch.nameEn) : selectedChapterId
    activeFilterChips.push({
      id: "chapter",
      label: `অধ্যায়: ${label}`,
      onRemove: () => onChapterChange("All"),
    })
  }

  if (selectedBoard && selectedBoard !== "All") {
    activeFilterChips.push({
      id: "board",
      label: `বোর্ড / রেফারেন্স: ${selectedBoard}`,
      onRemove: () => onBoardChange("All"),
    })
  }

  if (selectedType && selectedType !== "All") {
    activeFilterChips.push({
      id: "type",
      label: `ধরন: ${selectedType}`,
      onRemove: () => onTypeChange("All"),
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
    onChapterChange("All")
    onBoardChange("All")
    onTypeChange("All")
    onSortChange("All")
    onResetAll?.()
  }

  return (
    <DataTableFilterBar
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder="MCQ প্রশ্নের টেক্সট বা কিওয়ার্ড দিয়ে অনুসন্ধান করুন..."
      activeFilters={activeFilterChips}
      onResetAll={handleReset}
      filterButtonLabel="ফিল্টার"
      filtersHeading="MCQ ফিল্টারসমূহ"
      activeFiltersLabel="অ্যাক্টিভ ফিল্টারসমূহ:"
      resetLabel="রিসেট"
      resetAllLabel="সব রিসেট"
      applyFiltersLabel="ফিল্টার প্রয়োগ করুন"
      refineDisplayLabel="নির্দিষ্ট বিষয় বা অধ্যায়ের প্রশ্ন খুঁজুন"
    >
      {/* 1. Academic Class Select */}
      <div className="min-w-[130px]">
        <Select
          value={selectedAcademicClassId}
          onValueChange={(val) => {
            onAcademicClassChange(val ?? "All")
            onSubjectChange("All")
            onChapterChange("All")
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
          onValueChange={(val) => {
            onSubjectChange(val ?? "All")
            onChapterChange("All")
            onBoardChange("All")
          }}
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

      {/* 3. Chapter Select */}
      <div className="min-w-[140px]">
        <Select
          value={selectedChapterId}
          onValueChange={(val) => {
            onChapterChange(val ?? "All")
            onBoardChange("All")
          }}
          disabled={!selectedSubjectId || selectedSubjectId === "All"}
        >
          <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground py-2 px-3 text-xs font-medium h-10 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer disabled:opacity-50">
            <SelectValue placeholder="সকল অধ্যায়" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl max-h-60 font-body">
            <SelectItem value="All">সকল অধ্যায়</SelectItem>
            {filteredChapters.map((ch) => (
              <SelectItem key={ch.id} value={ch.id}>
                {ch.nameBn || ch.nameEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 4. Board / Reference Select */}
      <div className="min-w-[155px]">
        <Select
          value={selectedBoard}
          onValueChange={(val) => onBoardChange(val ?? "All")}
          disabled={isBoardDisabled}
        >
          <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground py-2 px-3 text-xs font-medium h-10 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer disabled:opacity-50">
            <SelectValue placeholder="বোর্ড / রেফারেন্স" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl max-h-72 font-body">
            <SelectItem value="All">সকল প্রশ্ন / রেফারেন্স</SelectItem>

            {groupedReferencesByYear.years.map((yearGroup) => (
              <SelectGroup key={yearGroup.year}>
                <SelectLabel className="px-2 py-1.5 text-[11px] font-semibold text-primary uppercase tracking-wider bg-slate-50/70 dark:bg-white/[0.04] rounded-md my-0.5">
                  📅 {yearGroup.year} সাল
                </SelectLabel>
                {yearGroup.items.map((item) => (
                  <SelectItem key={item.rawRef} value={item.rawRef}>
                    {item.rawRef} ({toBengaliDigits(item.count)})
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}

            {groupedReferencesByYear.noYear.length > 0 && (
              <SelectGroup>
                <SelectLabel className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-slate-50/70 dark:bg-white/[0.04] rounded-md my-0.5">
                  📌 সাধারণ / প্রতিষ্ঠান রেফারেন্স
                </SelectLabel>
                {groupedReferencesByYear.noYear.map((item) => (
                  <SelectItem key={item.rawRef} value={item.rawRef}>
                    {item.rawRef} ({toBengaliDigits(item.count)})
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* 5. Sort Select */}
      <div className="min-w-[130px]">
        <Select value={selectedSort} onValueChange={(val) => onSortChange(val ?? "All")}>
          <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground py-2 px-3 text-xs font-medium h-10 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
            <SelectValue placeholder="সাজানো" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl font-body">
            <SelectItem value="All">ডিফল্ট ক্রম</SelectItem>
            <SelectItem value="newest">নতুন যুক্ত</SelectItem>
            <SelectItem value="oldest">পুরাতন যুক্ত</SelectItem>
            <SelectItem value="question_asc">প্রশ্ন (A থেকে Z)</SelectItem>
            <SelectItem value="question_desc">প্রশ্ন (Z থেকে A)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </DataTableFilterBar>
  )
}
