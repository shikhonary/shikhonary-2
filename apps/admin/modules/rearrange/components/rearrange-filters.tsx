"use client"

import { DataTableFilterBar, type ActiveFilterChip } from "@/components/shared/data-table-filter-bar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { QUESTION_DIFFICULTY_OPTIONS } from "@workspace/utils"
import {
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
  useRearrangeBoardYears,
} from "../services/use-rearrange"

interface RearrangeFiltersProps {
  searchQuery: string
  onSearchChange: (val: string) => void
  classId: string
  onClassChange: (val: string) => void
  subjectId: string
  onSubjectChange: (val: string) => void
  chapterId: string
  onChapterChange: (val: string) => void
  board: string
  onBoardChange: (val: string) => void
  difficulty: string
  onDifficultyChange: (val: string) => void
  sort: string
  onSortChange: (val: string) => void
  onReset: () => void
}

const difficultyLabels: Record<string, string> = {
  EASY: "সহজ (Easy)",
  MEDIUM: "মাঝারি (Medium)",
  HARD: "কঠিন (Hard)",
}

const sortLabels: Record<string, string> = {
  createdAt_desc: "নতুন থেকে পুরাতন",
  createdAt_asc: "পুরাতন থেকে নতুন",
  popularity_desc: "জনপ্রিয়তা অনুসারে",
}

export function RearrangeFilters({
  searchQuery,
  onSearchChange,
  classId,
  onClassChange,
  subjectId,
  onSubjectChange,
  chapterId,
  onChapterChange,
  board,
  onBoardChange,
  difficulty,
  onDifficultyChange,
  sort,
  onSortChange,
  onReset,
}: RearrangeFiltersProps) {
  const { data: classesData } = useAcademicClassesForSelection()
  const { data: subjectsData } = useSubjectsForSelection(
    classId !== "All" ? { academicClassId: classId } : undefined
  )
  const { data: chaptersData } = useChaptersForSelection(
    subjectId !== "All" ? { subjectId } : undefined
  )
  const { data: boardYearsData } = useRearrangeBoardYears({
    subjectId: subjectId !== "All" ? subjectId : undefined,
    chapterId: chapterId !== "All" ? chapterId : undefined,
  })

  const classes = Array.isArray(classesData) ? classesData : []
  const subjects = Array.isArray(subjectsData) ? subjectsData : []
  const chapters = Array.isArray(chaptersData) ? chaptersData : []
  const boardYears = Array.isArray(boardYearsData) ? boardYearsData : []

  const activeFilters: ActiveFilterChip[] = []

  if (classId !== "All") {
    const cls = classes.find((c: any) => c.id === classId)
    activeFilters.push({
      id: "classId",
      label: `শ্রেণি: ${cls?.nameBn || cls?.nameEn || classId}`,
      onRemove: () => {
        onClassChange("All")
        onSubjectChange("All")
        onChapterChange("All")
        onBoardChange("All")
      },
    })
  }

  if (subjectId !== "All") {
    const sub = subjects.find((s: any) => s.id === subjectId)
    activeFilters.push({
      id: "subjectId",
      label: `বিষয়: ${sub?.nameBn || sub?.nameEn || subjectId}`,
      onRemove: () => {
        onSubjectChange("All")
        onChapterChange("All")
        onBoardChange("All")
      },
    })
  }

  if (chapterId !== "All") {
    const ch = chapters.find((c: any) => c.id === chapterId)
    activeFilters.push({
      id: "chapterId",
      label: `অধ্যায়: ${ch?.nameBn || ch?.nameEn || chapterId}`,
      onRemove: () => {
        onChapterChange("All")
        onBoardChange("All")
      },
    })
  }

  if (board !== "All") {
    activeFilters.push({
      id: "board",
      label: `বোর্ড/সাল: ${board}`,
      onRemove: () => onBoardChange("All"),
    })
  }

  if (difficulty !== "All") {
    activeFilters.push({
      id: "difficulty",
      label: `কঠিন্য: ${difficultyLabels[difficulty] || difficulty}`,
      onRemove: () => onDifficultyChange("All"),
    })
  }

  if (sort !== "createdAt_desc" && sort !== "All") {
    activeFilters.push({
      id: "sort",
      label: `সাজান: ${sortLabels[sort] || sort}`,
      onRemove: () => onSortChange("createdAt_desc"),
    })
  }

  return (
    <DataTableFilterBar
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder="বাক্য, উত্তর বা রেফারেন্স দিয়ে খুঁজুন..."
      activeFilters={activeFilters}
      onResetAll={onReset}
      filterButtonLabel="ফিল্টার"
      filtersHeading="ফিল্টার করুন"
      activeFiltersLabel="সক্রিয় ফিল্টারসমূহ:"
      resetLabel="রিসেট করুন"
      resetAllLabel="সবগুলো রিসেট করুন"
      applyFiltersLabel="ফিল্টার প্রয়োগ করুন"
      refineDisplayLabel="প্রশ্নসমূহ ফিল্টার ও সাজান"
    >
      <div className="min-w-[130px]">
        <Select
          value={classId}
          onValueChange={(val) => {
            onClassChange(val)
            onSubjectChange("All")
            onChapterChange("All")
            onBoardChange("All")
          }}
        >
          <SelectTrigger className="h-9 bg-background border-input text-xs font-medium rounded-lg">
            <SelectValue placeholder="শ্রেণি" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">সকল শ্রেণি</SelectItem>
            {classes.map((cls: any) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.nameBn || cls.nameEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[130px]">
        <Select
          value={subjectId}
          disabled={classId === "All"}
          onValueChange={(val) => {
            onSubjectChange(val)
            onChapterChange("All")
            onBoardChange("All")
          }}
        >
          <SelectTrigger className="h-9 bg-background border-input text-xs font-medium rounded-lg">
            <SelectValue placeholder="বিষয়" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">সকল বিষয়</SelectItem>
            {subjects.map((sub: any) => (
              <SelectItem key={sub.id} value={sub.id}>
                {sub.nameBn || sub.nameEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[130px]">
        <Select
          value={chapterId}
          disabled={subjectId === "All"}
          onValueChange={(val) => {
            onChapterChange(val)
            onBoardChange("All")
          }}
        >
          <SelectTrigger className="h-9 bg-background border-input text-xs font-medium rounded-lg">
            <SelectValue placeholder="অধ্যায়" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">সকল অধ্যায়</SelectItem>
            {chapters.map((ch: any) => (
              <SelectItem key={ch.id} value={ch.id}>
                {ch.nameBn || ch.nameEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[130px]">
        <Select value={board} disabled={subjectId === "All"} onValueChange={onBoardChange}>
          <SelectTrigger className="h-9 bg-background border-input text-xs font-medium rounded-lg">
            <SelectValue placeholder="বোর্ড / সাল" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">সকল বোর্ড/সাল</SelectItem>
            {boardYears.map((by: any) => {
              const val = typeof by === "string" ? by : by.value || `${by.source}-${by.year}`
              const label = typeof by === "string" ? by : by.label || val
              return (
                <SelectItem key={val} value={val}>
                  {label}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[130px]">
        <Select value={difficulty} onValueChange={onDifficultyChange}>
          <SelectTrigger className="h-9 bg-background border-input text-xs font-medium rounded-lg">
            <SelectValue placeholder="কঠিন্য" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">সকল কঠিন্য</SelectItem>
            {QUESTION_DIFFICULTY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {difficultyLabels[opt.value] || opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[130px]">
        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className="h-9 bg-background border-input text-xs font-medium rounded-lg">
            <SelectValue placeholder="সাজান" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt_desc">নতুন থেকে পুরাতন</SelectItem>
            <SelectItem value="createdAt_asc">পুরাতন থেকে নতুন</SelectItem>
            <SelectItem value="popularity_desc">জনপ্রিয়তা অনুসারে</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </DataTableFilterBar>
  )
}
