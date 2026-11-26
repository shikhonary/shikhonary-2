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
} from "../services/use-poem-essence"

interface PoemEssenceFiltersProps {
  searchQuery: string
  onSearchChange: (val: string) => void
  classId: string
  onClassChange: (val: string) => void
  subjectId: string
  onSubjectChange: (val: string) => void
  chapterId: string
  onChapterChange: (val: string) => void
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
  newest: "নতুন থেকে পুরাতন",
  oldest: "পুরাতন থেকে নতুন",
  title_asc: "শিরোনাম (A-Z)",
  title_desc: "শিরোনাম (Z-A)",
  popularity: "জনপ্রিয়তা অনুসারে",
}

export function PoemEssenceFilters({
  searchQuery,
  onSearchChange,
  classId,
  onClassChange,
  subjectId,
  onSubjectChange,
  chapterId,
  onChapterChange,
  difficulty,
  onDifficultyChange,
  sort,
  onSortChange,
  onReset,
}: PoemEssenceFiltersProps) {
  const { data: classesData } = useAcademicClassesForSelection()
  const { data: subjectsData } = useSubjectsForSelection(
    classId !== "All" ? { academicClassId: classId } : undefined
  )
  const { data: chaptersData } = useChaptersForSelection(
    subjectId !== "All" ? { subjectId } : undefined
  )

  const classes = Array.isArray(classesData) ? classesData : []
  const subjects = Array.isArray(subjectsData) ? subjectsData : []
  const chapters = Array.isArray(chaptersData) ? chaptersData : []

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
      },
    })
  }

  if (chapterId !== "All") {
    const ch = chapters.find((c: any) => c.id === chapterId)
    activeFilters.push({
      id: "chapterId",
      label: `অধ্যায়: ${ch?.nameBn || ch?.nameEn || chapterId}`,
      onRemove: () => onChapterChange("All"),
    })
  }

  if (difficulty !== "All") {
    activeFilters.push({
      id: "difficulty",
      label: `কঠিন্য: ${difficultyLabels[difficulty] || difficulty}`,
      onRemove: () => onDifficultyChange("All"),
    })
  }

  if (sort !== "All") {
    activeFilters.push({
      id: "sort",
      label: `সাজান: ${sortLabels[sort] || sort}`,
      onRemove: () => onSortChange("All"),
    })
  }

  return (
    <DataTableFilterBar
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder="শিরোনাম, স্তবক, মূলভাব বা রেফারেন্স দিয়ে খুঁজুন..."
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
        <Select value={chapterId} disabled={subjectId === "All"} onValueChange={onChapterChange}>
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
            <SelectItem value="All">ডিফল্ট (নতুন আগে)</SelectItem>
            <SelectItem value="newest">নতুন থেকে পুরাতন</SelectItem>
            <SelectItem value="oldest">পুরাতন থেকে নতুন</SelectItem>
            <SelectItem value="title_asc">শিরোনাম (A-Z)</SelectItem>
            <SelectItem value="title_desc">শিরোনাম (Z-A)</SelectItem>
            <SelectItem value="popularity">জনপ্রিয়তা অনুসারে</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </DataTableFilterBar>
  )
}
