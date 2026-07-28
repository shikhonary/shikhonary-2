"use client"

import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

interface SubjectOption {
  id: string
  name: string
}

interface ChapterOption {
  id: string
  name: string
  subjectId: string
}

interface QuestionBankFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedSubjectId: string
  onSubjectChange: (value: string) => void
  subjects?: SubjectOption[]
  selectedChapterId: string
  onChapterChange: (value: string) => void
  chapters?: ChapterOption[]
  selectedType: string
  onTypeChange: (value: string) => void
  selectedIsMath: string
  onIsMathChange: (value: string) => void
  selectedSort: string
  onSortChange: (value: string) => void
  selectedLimit: number
  onLimitChange: (value: number) => void
}

const MCQ_TYPES = [
  "Standard",
  "Statement Based",
  "Multiple True/False",
  "Scenario Based",
]

export function QuestionBankFilters({
  searchQuery,
  onSearchChange,
  selectedSubjectId,
  onSubjectChange,
  subjects = [],
  selectedChapterId,
  onChapterChange,
  chapters = [],
  selectedType,
  onTypeChange,
  selectedIsMath,
  onIsMathChange,
  selectedSort,
  onSortChange,
  selectedLimit,
  onLimitChange,
}: QuestionBankFiltersProps) {
  const filteredChapters =
    selectedSubjectId !== "All"
      ? chapters.filter((c) => c.subjectId === selectedSubjectId)
      : chapters

  return (
    <div className="mb-6 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-xs space-y-4">
      {/* Search */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base text-outline pointer-events-none">
          search
        </span>
        <Input
          placeholder="Search questions, explanations, context…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-10 rounded-xl border-outline-variant/40 bg-white text-sm"
        />
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-3">
        {/* Subject */}
        <Select value={selectedSubjectId} onValueChange={onSubjectChange}>
          <SelectTrigger className="h-9 w-44 rounded-lg border-outline-variant/40 text-xs">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Subjects</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Chapter — only shown when a subject is selected */}
        {selectedSubjectId !== "All" && (
          <Select value={selectedChapterId} onValueChange={onChapterChange}>
            <SelectTrigger className="h-9 w-48 rounded-lg border-outline-variant/40 text-xs">
              <SelectValue placeholder="All Chapters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Chapters</SelectItem>
              {filteredChapters.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Type */}
        <Select value={selectedType} onValueChange={onTypeChange}>
          <SelectTrigger className="h-9 w-44 rounded-lg border-outline-variant/40 text-xs">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            {MCQ_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Math filter */}
        <Select value={selectedIsMath} onValueChange={onIsMathChange}>
          <SelectTrigger className="h-9 w-36 rounded-lg border-outline-variant/40 text-xs">
            <SelectValue placeholder="All Questions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Questions</SelectItem>
            <SelectItem value="true">Math / LaTeX</SelectItem>
            <SelectItem value="false">Text Only</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={selectedSort} onValueChange={onSortChange}>
          <SelectTrigger className="h-9 w-36 rounded-lg border-outline-variant/40 text-xs">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Default</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="question_asc">Question A→Z</SelectItem>
            <SelectItem value="question_desc">Question Z→A</SelectItem>
          </SelectContent>
        </Select>

        {/* Per-page limit */}
        <Select
          value={String(selectedLimit)}
          onValueChange={(v) => onLimitChange(Number(v))}
        >
          <SelectTrigger className="h-9 w-24 rounded-lg border-outline-variant/40 text-xs">
            <SelectValue placeholder="20 / page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 / page</SelectItem>
            <SelectItem value="20">20 / page</SelectItem>
            <SelectItem value="50">50 / page</SelectItem>
            <SelectItem value="100">100 / page</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
