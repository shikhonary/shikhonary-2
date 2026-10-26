"use client"

import * as React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { DataTableFilterBar, type ActiveFilterChip } from "@/components/shared/data-table-filter-bar"

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

interface WordMeaningFiltersProps {
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
  selectedSort: string
  onSortChange: (value: string) => void
  onResetAll?: () => void
}

export function WordMeaningFilters({
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
  selectedSort,
  onSortChange,
  onResetAll,
}: WordMeaningFiltersProps) {
  const filteredChapters =
    selectedSubjectId !== "All"
      ? chapters.filter((c) => c.subjectId === selectedSubjectId)
      : chapters

  const isBoardDisabled = !selectedSubjectId || selectedSubjectId === "All"

  const getSortLabel = (sort: string) => {
    switch (sort) {
      case "newest":
        return "নতুন যুক্ত"
      case "oldest":
        return "পুরাতন যুক্ত"
      case "word_asc":
        return "শব্দ (A থেকে Z)"
      case "word_desc":
        return "শব্দ (Z থেকে A)"
      case "popularity":
        return "জনপ্রিয়তা"
      default:
        return "ডিফল্ট ক্রম"
    }
  }

  // Construct Bengali active filter chips
  const activeFilterChips: ActiveFilterChip[] = []

  if (selectedAcademicClassId && selectedAcademicClassId !== "All") {
    const cls = academicClasses.find((c) => c.id === selectedAcademicClassId)
    const label = cls ? cls.nameBn || cls.nameEn : selectedAcademicClassId
    activeFilterChips.push({
      id: "class",
      label: `শ্রেণি: ${label}`,
      onRemove: () => {
        onAcademicClassChange("All")
        onSubjectChange("All")
        onChapterChange("All")
        onBoardChange("All")
      },
    })
  }

  if (selectedSubjectId && selectedSubjectId !== "All") {
    const sub = subjects.find((s) => s.id === selectedSubjectId)
    const label = sub ? sub.nameBn || sub.nameEn : selectedSubjectId
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
    const label = ch ? ch.nameBn || ch.nameEn : selectedChapterId
    activeFilterChips.push({
      id: "chapter",
      label: `অধ্যায়: ${label}`,
      onRemove: () => onChapterChange("All"),
    })
  }

  if (selectedBoard && selectedBoard !== "All") {
    activeFilterChips.push({
      id: "board",
      label: `বোর্ড: ${selectedBoard}`,
      onRemove: () => onBoardChange("All"),
    })
  }

  if (selectedSort && selectedSort !== "All") {
    activeFilterChips.push({
      id: "sort",
      label: `ক্রম: ${getSortLabel(selectedSort)}`,
      onRemove: () => onSortChange("All"),
    })
  }

  return (
    <DataTableFilterBar
      searchPlaceholder="শব্দার্থ, শব্দ, উৎস বা সাল দিয়ে খুঁজুন..."
      searchValue={searchQuery}
      onSearchChange={onSearchChange}
      activeFilterChips={activeFilterChips}
      onResetAll={onResetAll}
    >
      {/* 1. Academic Class Filter */}
      <Select
        value={selectedAcademicClassId}
        onValueChange={(val) => {
          onAcademicClassChange(val)
          onSubjectChange("All")
          onChapterChange("All")
          onBoardChange("All")
        }}
      >
        <SelectTrigger className="w-[140px] sm:w-[160px] h-9 text-xs rounded-xl bg-card border-slate-200 dark:border-white/[0.08] font-body">
          <SelectValue placeholder="সকল শ্রেণি" />
        </SelectTrigger>
        <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg">
          <SelectItem value="All">সকল শ্রেণি</SelectItem>
          {academicClasses.map((cls) => (
            <SelectItem key={cls.id} value={cls.id}>
              {cls.nameBn || cls.nameEn}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 2. Subject Filter */}
      <Select
        value={selectedSubjectId}
        onValueChange={(val) => {
          onSubjectChange(val)
          onChapterChange("All")
          onBoardChange("All")
        }}
        disabled={selectedAcademicClassId === "All"}
      >
        <SelectTrigger className="w-[140px] sm:w-[160px] h-9 text-xs rounded-xl bg-card border-slate-200 dark:border-white/[0.08] disabled:opacity-50 font-body">
          <SelectValue placeholder="সকল বিষয়" />
        </SelectTrigger>
        <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg">
          <SelectItem value="All">সকল বিষয়</SelectItem>
          {subjects.map((sub) => (
            <SelectItem key={sub.id} value={sub.id}>
              {sub.nameBn || sub.nameEn}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 3. Chapter Filter */}
      <Select
        value={selectedChapterId}
        onValueChange={onChapterChange}
        disabled={selectedSubjectId === "All"}
      >
        <SelectTrigger className="w-[140px] sm:w-[160px] h-9 text-xs rounded-xl bg-card border-slate-200 dark:border-white/[0.08] disabled:opacity-50 font-body">
          <SelectValue placeholder="সকল অধ্যায়" />
        </SelectTrigger>
        <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg">
          <SelectItem value="All">সকল অধ্যায়</SelectItem>
          {filteredChapters.map((ch) => (
            <SelectItem key={ch.id} value={ch.id}>
              {ch.nameBn || ch.nameEn}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 4. Board Filter */}
      <Select
        value={selectedBoard}
        onValueChange={onBoardChange}
        disabled={isBoardDisabled}
      >
        <SelectTrigger className="w-[130px] sm:w-[150px] h-9 text-xs rounded-xl bg-card border-slate-200 dark:border-white/[0.08] disabled:opacity-50 font-body">
          <SelectValue placeholder="সকল বোর্ড" />
        </SelectTrigger>
        <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg">
          <SelectItem value="All">সকল বোর্ড</SelectItem>
          {boardYears.map((b: any) => {
            const rawRef = typeof b === "string" ? b : b.rawRef
            const label = typeof b === "string" ? b : `${b.boardName} ${b.year > 0 ? `(${b.year})` : ""}`
            return (
              <SelectItem key={rawRef} value={rawRef}>
                {label}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      {/* 5. Sort Filter */}
      <Select value={selectedSort} onValueChange={onSortChange}>
        <SelectTrigger className="w-[130px] sm:w-[150px] h-9 text-xs rounded-xl bg-card border-slate-200 dark:border-white/[0.08] font-body">
          <SelectValue placeholder="বাছাই ক্রম" />
        </SelectTrigger>
        <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg">
          <SelectItem value="All">ডিফল্ট ক্রম</SelectItem>
          <SelectItem value="newest">নতুন যুক্ত</SelectItem>
          <SelectItem value="oldest">পুরাতন যুক্ত</SelectItem>
          <SelectItem value="word_asc">শব্দ (A থেকে Z)</SelectItem>
          <SelectItem value="word_desc">শব্দ (Z থেকে A)</SelectItem>
          <SelectItem value="popularity">জনপ্রিয়তা</SelectItem>
        </SelectContent>
      </Select>
    </DataTableFilterBar>
  )
}
