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
} from "../services/use-poem"

interface PoemFiltersProps {
  searchQuery: string
  onSearchChange: (val: string) => void
  classId: string
  onClassChange: (val: string) => void
  subjectId: string
  onSubjectChange: (val: string) => void
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
  title_asc: "কবিতা (A-Z)",
  title_desc: "কবিতা (Z-A)",
  popularity: "জনপ্রিয়তা অনুসারে",
}

export function PoemFilters({
  searchQuery,
  onSearchChange,
  classId,
  onClassChange,
  subjectId,
  onSubjectChange,
  difficulty,
  onDifficultyChange,
  sort,
  onSortChange,
  onReset,
}: PoemFiltersProps) {
  const { data: classesData } = useAcademicClassesForSelection()
  const { data: subjectsData } = useSubjectsForSelection(
    classId !== "All" ? { academicClassId: classId } : undefined
  )

  const classes = Array.isArray(classesData) ? classesData : []
  const subjects = Array.isArray(subjectsData) ? subjectsData : []

  const activeFilters: ActiveFilterChip[] = []

  if (classId !== "All") {
    const cls = classes.find((c: any) => c.id === classId)
    activeFilters.push({
      id: "classId",
      label: `শ্রেণি: ${cls?.nameBn || cls?.nameEn || classId}`,
      onRemove: () => {
        onClassChange("All")
        onSubjectChange("All")
      },
    })
  }

  if (subjectId !== "All") {
    const sub = subjects.find((s: any) => s.id === subjectId)
    activeFilters.push({
      id: "subjectId",
      label: `বিষয়: ${sub?.nameBn || sub?.nameEn || subjectId}`,
      onRemove: () => onSubjectChange("All"),
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
      searchPlaceholder="কবিতার চরণ বা রেফারেন্স দিয়ে খুঁজুন..."
      activeFilters={activeFilters}
      onResetAll={onReset}
      filterButtonLabel="ফিল্টার"
      filtersHeading="ফিল্টার করুন"
      activeFiltersLabel="সক্রিয় ফিল্টারসমূহ:"
      resetLabel="রিসেট করুন"
      resetAllLabel="সবগুলো রিসেট করুন"
      applyFiltersLabel="ফিল্টার প্রয়োগ করুন"
      refineDisplayLabel="কবিতাসমূহ ফিল্টার ও সাজান"
    >
      <div className="min-w-[130px]">
        <Select
          value={classId}
          onValueChange={(val) => {
            onClassChange(val)
            onSubjectChange("All")
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
        <Select value={subjectId} disabled={classId === "All"} onValueChange={onSubjectChange}>
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
            <SelectItem value="title_asc">কবিতা (A-Z)</SelectItem>
            <SelectItem value="title_desc">কবিতা (Z-A)</SelectItem>
            <SelectItem value="popularity">জনপ্রিয়তা অনুসারে</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </DataTableFilterBar>
  )
}
