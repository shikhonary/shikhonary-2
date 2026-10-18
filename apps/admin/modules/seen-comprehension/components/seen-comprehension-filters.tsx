"use client"

import { Input } from "@workspace/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@workspace/ui/components/drawer"
import {
  X,
  RotateCcw,
  SlidersHorizontal,
  ArrowUpDown,
  BookOpen,
  Bookmark,
  Layers,
  Award,
  GraduationCap,
  Filter,
} from "lucide-react"

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

interface SeenComprehensionFiltersProps {
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
  selectedComprehensionType: string
  onComprehensionTypeChange: (value: string) => void
  selectedBoard: string
  onBoardChange: (value: string) => void
  boardYears?: any[]
  selectedDifficulty: string
  onDifficultyChange: (value: string) => void
  selectedSort: string
  onSortChange: (value: string) => void
}

export function SeenComprehensionFilters({
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
  selectedComprehensionType,
  onComprehensionTypeChange,
  selectedBoard,
  onBoardChange,
  boardYears = [],
  selectedDifficulty,
  onDifficultyChange,
  selectedSort,
  onSortChange,
}: SeenComprehensionFiltersProps) {
  const filteredChapters = selectedSubjectId !== "All"
    ? chapters.filter((c) => c.subjectId === selectedSubjectId)
    : chapters

  const isBoardDisabled = !selectedSubjectId || selectedSubjectId === "All"

  const hasActiveQuery = Boolean(searchQuery && searchQuery.trim() !== "")
  const hasActiveSubject = Boolean(selectedSubjectId && selectedSubjectId !== "All")
  const hasActiveChapter = Boolean(selectedChapterId && selectedChapterId !== "All")
  const hasActiveType = Boolean(selectedComprehensionType && selectedComprehensionType !== "All")
  const hasActiveBoard = Boolean(selectedBoard && selectedBoard !== "All")
  const hasActiveDifficulty = Boolean(selectedDifficulty && selectedDifficulty !== "All")
  const hasActiveSort = Boolean(selectedSort && selectedSort !== "All")
  const hasActiveFilters =
    hasActiveQuery ||
    hasActiveSubject ||
    hasActiveChapter ||
    hasActiveType ||
    hasActiveBoard ||
    hasActiveDifficulty ||
    hasActiveSort

  const activeFilterCount =
    (hasActiveSubject ? 1 : 0) +
    (hasActiveChapter ? 1 : 0) +
    (hasActiveType ? 1 : 0) +
    (hasActiveBoard ? 1 : 0) +
    (hasActiveDifficulty ? 1 : 0) +
    (hasActiveSort ? 1 : 0)

  const handleReset = () => {
    onSearchChange("")
    onSubjectChange("All")
    onChapterChange("All")
    onComprehensionTypeChange("All")
    onBoardChange("All")
    onDifficultyChange("All")
    onSortChange("All")
  }

  const renderSelectFilters = () => (
    <>
      {/* Class Filter */}
      <div className="w-full sm:w-[160px]">
        <Select
          value={selectedAcademicClassId}
          onValueChange={(val) => onAcademicClassChange(val || "All")}
        >
          <SelectTrigger className="w-full rounded-xl border border-outline-variant/60 bg-surface-container-low px-3 py-2 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-primary h-10 shadow-xs">
            <div className="flex items-center gap-2 truncate">
              <GraduationCap className="h-4 w-4 shrink-0 text-outline" />
              <SelectValue placeholder="All Classes" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl border border-outline-variant/60 bg-surface shadow-md">
            <SelectItem value="All">All Classes</SelectItem>
            {academicClasses.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.nameEn} {cls.nameBn ? `(${cls.nameBn})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subject Filter */}
      <div className="w-full sm:w-[170px]">
        <Select
          value={selectedSubjectId}
          onValueChange={(val) => {
            onSubjectChange(val || "All")
            onChapterChange("All")
            onBoardChange("All")
          }}
        >
          <SelectTrigger className="w-full rounded-xl border border-outline-variant/60 bg-surface-container-low px-3 py-2 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-primary h-10 shadow-xs">
            <div className="flex items-center gap-2 truncate">
              <BookOpen className="h-4 w-4 shrink-0 text-outline" />
              <SelectValue placeholder="All Subjects" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl border border-outline-variant/60 bg-surface shadow-md">
            <SelectItem value="All">All Subjects</SelectItem>
            {subjects.map((sub) => (
              <SelectItem key={sub.id} value={sub.id}>
                {sub.nameEn} {sub.nameBn ? `(${sub.nameBn})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Chapter Filter */}
      <div className="w-full sm:w-[170px]">
        <Select
          value={selectedChapterId}
          onValueChange={(val) => {
            onChapterChange(val || "All")
            onBoardChange("All")
          }}
          disabled={!selectedSubjectId || selectedSubjectId === "All"}
        >
          <SelectTrigger className="w-full rounded-xl border border-outline-variant/60 bg-surface-container-low px-3 py-2 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-primary h-10 shadow-xs disabled:opacity-50">
            <div className="flex items-center gap-2 truncate">
              <Layers className="h-4 w-4 shrink-0 text-outline" />
              <SelectValue placeholder="All Chapters" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl border border-outline-variant/60 bg-surface shadow-md">
            <SelectItem value="All">All Chapters</SelectItem>
            {filteredChapters.map((ch) => (
              <SelectItem key={ch.id} value={ch.id}>
                {ch.nameEn} {ch.nameBn ? `(${ch.nameBn})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Comprehension Type Filter */}
      <div className="w-full sm:w-[180px]">
        <Select
          value={selectedComprehensionType}
          onValueChange={(val) => onComprehensionTypeChange(val || "All")}
        >
          <SelectTrigger className="w-full rounded-xl border border-outline-variant/60 bg-surface-container-low px-3 py-2 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-primary h-10 shadow-xs">
            <div className="flex items-center gap-2 truncate">
              <Filter className="h-4 w-4 shrink-0 text-outline" />
              <SelectValue placeholder="All Types" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl border border-outline-variant/60 bg-surface shadow-md">
            <SelectItem value="All">All Types</SelectItem>
            <SelectItem value="SEEN_COMPREHENSION_1">Seen Comprehension 1</SelectItem>
            <SelectItem value="SEEN_COMPREHENSION_2">Seen Comprehension 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Board & Year Filter */}
      <div className="w-full sm:w-[160px]">
        <Select
          value={selectedBoard}
          onValueChange={(val) => onBoardChange(val || "All")}
          disabled={isBoardDisabled}
        >
          <SelectTrigger className="w-full rounded-xl border border-outline-variant/60 bg-surface-container-low px-3 py-2 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-primary h-10 shadow-xs disabled:opacity-50">
            <div className="flex items-center gap-2 truncate">
              <Bookmark className="h-4 w-4 shrink-0 text-outline" />
              <SelectValue placeholder="Board / Year" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl border border-outline-variant/60 bg-surface shadow-md">
            <SelectItem value="All">All Boards / Years</SelectItem>
            {boardYears.map((ref: any) => {
              const str = typeof ref === "string" ? ref : ref.rawRef || ref.boardName || ""
              return (
                <SelectItem key={str} value={str}>
                  {str}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Difficulty Filter */}
      <div className="w-full sm:w-[140px]">
        <Select
          value={selectedDifficulty}
          onValueChange={(val) => onDifficultyChange(val || "All")}
        >
          <SelectTrigger className="w-full rounded-xl border border-outline-variant/60 bg-surface-container-low px-3 py-2 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-primary h-10 shadow-xs">
            <div className="flex items-center gap-2 truncate">
              <Award className="h-4 w-4 shrink-0 text-outline" />
              <SelectValue placeholder="Difficulty" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl border border-outline-variant/60 bg-surface shadow-md">
            <SelectItem value="All">All Difficulties</SelectItem>
            <SelectItem value="EASY">Easy</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HARD">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort Filter */}
      <div className="w-full sm:w-[140px]">
        <Select
          value={selectedSort}
          onValueChange={(val) => onSortChange(val || "All")}
        >
          <SelectTrigger className="w-full rounded-xl border border-outline-variant/60 bg-surface-container-low px-3 py-2 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-primary h-10 shadow-xs">
            <div className="flex items-center gap-2 truncate">
              <ArrowUpDown className="h-4 w-4 shrink-0 text-outline" />
              <SelectValue placeholder="Sort" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl border border-outline-variant/60 bg-surface shadow-md">
            <SelectItem value="All">Sort: Default</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="title_asc">Title (A-Z)</SelectItem>
            <SelectItem value="title_desc">Title (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  )

  return (
    <div className="mb-6 space-y-4">
      {/* Search Bar + Mobile Drawer Button + Desktop Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title, passage text, question, or board..."
            className="w-full rounded-xl border border-outline-variant/60 bg-surface-container-low pl-4 pr-10 py-2 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-primary h-10 shadow-xs"
          />
          {hasActiveQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Mobile: Filter Drawer Trigger */}
        <div className="flex items-center gap-2 sm:hidden">
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 rounded-xl border border-outline-variant/60 bg-surface-container-low h-10 px-4 text-xs font-bold gap-2 text-on-surface"
              >
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                Filters & Sorting
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="rounded-full px-1.5 py-0 text-[10px]">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DrawerTrigger>
            <DrawerContent className="px-4 pb-6">
              <DrawerHeader className="text-left px-0">
                <DrawerTitle className="text-base font-bold">Filters & Sorting</DrawerTitle>
                <DrawerDescription className="text-xs text-outline">
                  Filter questions by class, subject, chapter, type, and difficulty.
                </DrawerDescription>
              </DrawerHeader>
              <div className="space-y-3 py-2 overflow-y-auto max-h-[60vh]">
                {renderSelectFilters()}
              </div>
              <DrawerFooter className="px-0 pt-4 flex flex-row gap-2">
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="flex-1 rounded-xl h-10 text-xs font-bold gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </Button>
                )}
                <DrawerClose asChild>
                  <Button className="flex-1 rounded-xl h-10 text-xs font-bold">Apply</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              className="h-10 w-10 shrink-0 rounded-xl border border-outline-variant/40 hover:bg-surface-container-low text-destructive"
              title="Reset all filters"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Desktop Filter Row */}
        <div className="hidden sm:flex flex-wrap items-center gap-2">
          {renderSelectFilters()}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="rounded-xl h-10 px-3 text-xs font-bold text-destructive hover:bg-destructive/10 gap-1.5 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
