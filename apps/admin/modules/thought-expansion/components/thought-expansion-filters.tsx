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
import {
  toBengaliDigits,
  toEnglishDigits,
  extractReferenceYear,
  categorizeReference,
  isIgnoredReference,
} from "@workspace/utils"

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

interface ThoughtExpansionFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedAcademicClassId: string
  onAcademicClassChange: (value: string) => void
  academicClasses?: AcademicClassOption[]
  selectedSubjectId: string
  onSubjectChange: (value: string) => void
  subjects?: SubjectOption[]
  selectedBoard: string
  onBoardChange: (value: string) => void
  boardYears?: any[]
  selectedIsActive: string
  onIsActiveChange: (value: string) => void
  selectedHasReport: string
  onHasReportChange: (value: string) => void
  selectedSort: string
  onSortChange: (value: string) => void
  onResetAll?: () => void
}

export function ThoughtExpansionFilters({
  searchQuery,
  onSearchChange,
  selectedAcademicClassId,
  onAcademicClassChange,
  academicClasses = [],
  selectedSubjectId,
  onSubjectChange,
  subjects = [],
  selectedBoard,
  onBoardChange,
  boardYears = [],
  selectedIsActive,
  onIsActiveChange,
  selectedHasReport,
  onHasReportChange,
  selectedSort,
  onSortChange,
  onResetAll,
}: ThoughtExpansionFiltersProps) {
  const isBoardDisabled = boardYears.length === 0

  const { groupedReferences, totalSchoolCount } = React.useMemo(() => {
    const yearMap = new Map<string, Array<{ rawRef: string; count: number }>>()
    const noYearList: Array<{ rawRef: string; count: number }> = []
    let schoolCount = 0

    for (const b of boardYears) {
      const rawRef = typeof b === "string" ? b : b.rawRef || b.boardName || b.board || ""
      if (!rawRef || isIgnoredReference(rawRef)) continue
      const count = typeof b === "object" && typeof b.count === "number" ? b.count : 1

      const category = typeof b === "object" && b.category ? b.category : categorizeReference(rawRef)

      if (category === "SCHOOL") {
        schoolCount += count
        continue
      }

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
      groupedReferences: {
        years: sortedYears.map((yr) => ({
          year: yr,
          items: yearMap.get(yr)!.sort((a, b) => b.count - a.count),
        })),
        noYear: noYearList.sort((a, b) => b.count - a.count),
      },
      totalSchoolCount: schoolCount,
    }
  }, [boardYears])

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
        onBoardChange("All")
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
        onBoardChange("All")
      },
    })
  }

  if (selectedBoard && selectedBoard !== "All") {
    const label =
      selectedBoard === "SCHOOL_ALL"
        ? "শীর্ষস্থানীয় সকল বিদ্যালয় ও কলেজ"
        : selectedBoard
    activeFilterChips.push({
      id: "board",
      label: `বোর্ড / রেফারেন্স: ${label}`,
      onRemove: () => onBoardChange("All"),
    })
  }

  if (selectedIsActive && selectedIsActive !== "All") {
    const label = selectedIsActive === "ACTIVE" ? "অ্যাক্টিভ" : "ইনঅ্যাক্টিভ"
    activeFilterChips.push({
      id: "isActive",
      label: `স্ট্যাটাস: ${label}`,
      onRemove: () => onIsActiveChange("All"),
    })
  }

  if (selectedHasReport && selectedHasReport !== "All") {
    const label = selectedHasReport === "YES" ? "রিপোর্ট আছে" : "রিপোর্ট ছাড়া"
    activeFilterChips.push({
      id: "hasReport",
      label: `রিপোর্ট: ${label}`,
      onRemove: () => onHasReportChange("All"),
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
    onBoardChange("All")
    onIsActiveChange("All")
    onHasReportChange("All")
    onSortChange("All")
    onResetAll?.()
  }

  return (
    <DataTableFilterBar
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder="ভাব-সম্প্রসারণের মূলভাব, চরণ বা কিওয়ার্ড দিয়ে অনুসন্ধান করুন..."
      activeFilters={activeFilterChips}
      onResetAll={handleReset}
      filterButtonLabel="ফিল্টার"
      filtersHeading="ভাব-সম্প্রসারণ ফিল্টারসমূহ"
      activeFiltersLabel="অ্যাক্টিভ ফিল্টারসমূহ:"
      resetLabel="রিসেট"
      resetAllLabel="সব রিসেট"
      applyFiltersLabel="ফিল্টার প্রয়োগ করুন"
      refineDisplayLabel="নির্দিষ্ট শ্রেণি, বিষয় বা রেফারেন্সের ভাব-সম্প্রসারণ খুঁজুন"
    >
      {/* 1. Academic Class Select */}
      <div className="min-w-[130px]">
        <Select
          value={selectedAcademicClassId}
          onValueChange={(val) => {
            onAcademicClassChange(val ?? "All")
            onSubjectChange("All")
            onBoardChange("All")
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

      {/* 3. Board / Reference Select */}
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
            <SelectItem value="All">সকল ভাব-সম্প্রসারণ / রেফারেন্স</SelectItem>

            {(totalSchoolCount > 0 || selectedBoard === "SCHOOL_ALL") && (
              <SelectItem value="SCHOOL_ALL" className="font-medium text-primary">
                🏫 শীর্ষস্থানীয় সকল বিদ্যালয় ও কলেজ ({toBengaliDigits(totalSchoolCount)})
              </SelectItem>
            )}

            {groupedReferences.years.map((yearGroup) => (
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

            {groupedReferences.noYear.length > 0 && (
              <SelectGroup>
                <SelectLabel className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-slate-50/70 dark:bg-white/[0.04] rounded-md my-0.5">
                  📌 অন্যান্য রেফারেন্স
                </SelectLabel>
                {groupedReferences.noYear.map((item) => (
                  <SelectItem key={item.rawRef} value={item.rawRef}>
                    {item.rawRef} ({toBengaliDigits(item.count)})
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* 4. Active/Inactive Status Select */}
      <div className="min-w-[120px]">
        <Select value={selectedIsActive} onValueChange={(val) => onIsActiveChange(val ?? "All")}>
          <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground py-2 px-3 text-xs font-medium h-10 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
            <SelectValue placeholder="সকল স্ট্যাটাস" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl font-body">
            <SelectItem value="All">সকল স্ট্যাটাস</SelectItem>
            <SelectItem value="ACTIVE">অ্যাক্টিভ</SelectItem>
            <SelectItem value="INACTIVE">ইনঅ্যাক্টিভ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 5. Has Report Select */}
      <div className="min-w-[125px]">
        <Select value={selectedHasReport} onValueChange={(val) => onHasReportChange(val ?? "All")}>
          <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground py-2 px-3 text-xs font-medium h-10 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
            <SelectValue placeholder="রিপোর্ট স্ট্যাটাস" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl font-body">
            <SelectItem value="All">সকল ভাব-সম্প্রসারণ</SelectItem>
            <SelectItem value="YES">⚠️ রিপোর্ট আছে</SelectItem>
            <SelectItem value="NO">✅ রিপোর্ট ছাড়া</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 6. Sort Select */}
      <div className="min-w-[130px]">
        <Select value={selectedSort} onValueChange={(val) => onSortChange(val ?? "All")}>
          <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground py-2 px-3 text-xs font-medium h-10 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
            <SelectValue placeholder="সাজানো" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl font-body">
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
