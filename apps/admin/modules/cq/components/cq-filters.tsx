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
  GraduationCap,
  Award,
} from "lucide-react"

interface SubjectOption {
  id: string
  name: string
}

interface ChapterOption {
  id: string
  name: string
  subjectId: string
}

interface AcademicClassOption {
  id: string
  name: string
}

interface CqFiltersProps {
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
}

export function CqFilters({
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
}: CqFiltersProps) {
  const filteredChapters = selectedSubjectId !== "All"
    ? chapters.filter((c) => c.subjectId === selectedSubjectId)
    : chapters

  const isBoardDisabled = !selectedSubjectId || selectedSubjectId === "All"

  const hasActiveQuery = Boolean(searchQuery && searchQuery.trim() !== "")
  const hasActiveSubject = Boolean(selectedSubjectId && selectedSubjectId !== "All")
  const hasActiveChapter = Boolean(selectedChapterId && selectedChapterId !== "All")
  const hasActiveBoard = Boolean(selectedBoard && selectedBoard !== "All")
  const hasActiveSort = Boolean(selectedSort && selectedSort !== "All")

  const hasAnyFilter =
    hasActiveQuery ||
    hasActiveSubject ||
    hasActiveChapter ||
    hasActiveBoard ||
    hasActiveSort ||
    selectedAcademicClassId !== "All"

  const activeFilterCount =
    (hasActiveSubject ? 1 : 0) +
    (hasActiveChapter ? 1 : 0) +
    (hasActiveBoard ? 1 : 0) +
    (hasActiveSort ? 1 : 0)

  const handleResetAll = () => {
    onSearchChange("")
    onAcademicClassChange("All")
    onSubjectChange("All")
    onChapterChange("All")
    onBoardChange("All")
    onSortChange("All")
  }

  const getSortLabel = (sort: string) => {
    switch (sort) {
      case "newest":
        return "Newest First"
      case "oldest":
        return "Oldest First"
      case "question_asc":
        return "Question (A to Z)"
      case "question_desc":
        return "Question (Z to A)"
      default:
        return "Default Sort"
    }
  }

  const renderSelectFilters = (isMobile = false) => (
    <>
      {/* Class Filter */}
      <div className={isMobile ? "space-y-1.5" : "min-w-[150px] flex-1 md:flex-none"}>
        {isMobile && (
          <label className="text-xs font-bold text-on-surface flex items-center gap-1.5 font-solaiman">
            <GraduationCap className="h-3.5 w-3.5 text-primary" />
            Class
          </label>
        )}
        <Select
          value={selectedAcademicClassId}
          onValueChange={(val) => {
            onAcademicClassChange(val ?? "All")
            onSubjectChange("All")
            onChapterChange("All")
          }}
        >
          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between font-solaiman">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg max-h-64 font-solaiman">
            <SelectItem value="All">All Classes</SelectItem>
            {academicClasses.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subject Filter */}
      <div className={isMobile ? "space-y-1.5" : "min-w-[180px] flex-1 md:flex-none"}>
        {isMobile && (
          <label className="text-xs font-bold text-on-surface flex items-center gap-1.5 font-solaiman">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            Subject
          </label>
        )}
        <Select
          value={selectedSubjectId}
          onValueChange={(val) => {
            onSubjectChange(val ?? "All")
            onChapterChange("All")
          }}
          disabled={selectedAcademicClassId === "All"}
        >
          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between disabled:opacity-50 disabled:cursor-not-allowed font-solaiman">
            <SelectValue placeholder={selectedAcademicClassId === "All" ? "Select Class First" : "All Subjects"} />
          </SelectTrigger>
          <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg max-h-64 font-solaiman">
            <SelectItem value="All">All Subjects</SelectItem>
            {subjects.map((sub) => (
              <SelectItem key={sub.id} value={sub.id}>
                {sub.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Chapter Filter */}
      <div className={isMobile ? "space-y-1.5" : "min-w-[180px] flex-1 md:flex-none"}>
        {isMobile && (
          <label className="text-xs font-bold text-on-surface flex items-center gap-1.5 font-solaiman">
            <Bookmark className="h-3.5 w-3.5 text-primary" />
            Chapter
          </label>
        )}
        <Select
          value={selectedChapterId}
          onValueChange={(val) => onChapterChange(val ?? "All")}
          disabled={selectedSubjectId === "All"}
        >
          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between disabled:opacity-50 disabled:cursor-not-allowed font-solaiman">
            <SelectValue placeholder={selectedSubjectId === "All" ? "Select Subject First" : "All Chapters"} />
          </SelectTrigger>
          <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg max-h-64 font-solaiman">
            <SelectItem value="All">All Chapters</SelectItem>
            {filteredChapters.map((ch) => (
              <SelectItem key={ch.id} value={ch.id}>
                {ch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Board Filter */}
      <div className={isMobile ? "space-y-1.5" : "min-w-[150px] flex-1 md:flex-none"}>
        {isMobile && (
          <label className="text-xs font-bold text-on-surface flex items-center gap-1.5 font-solaiman">
            <Award className="h-3.5 w-3.5 text-primary" />
            Board / Year
          </label>
        )}
        <Select
          value={selectedBoard}
          onValueChange={(val) => onBoardChange(val ?? "All")}
          disabled={isBoardDisabled}
        >
          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between disabled:opacity-50 disabled:cursor-not-allowed font-solaiman">
            <SelectValue placeholder={isBoardDisabled ? "Select Subject First" : "All Boards"} />
          </SelectTrigger>
          <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg max-h-64 font-solaiman">
            <SelectItem value="All">All Boards</SelectItem>
            {boardYears.map((item: any) => (
              <SelectItem key={item.rawRef} value={item.rawRef}>
                🎓 {item.boardName} ২০{item.year} ({item.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort Select */}
      <div className={isMobile ? "space-y-1.5" : "min-w-[160px] flex-1 md:flex-none"}>
        {isMobile && (
          <label className="text-xs font-bold text-on-surface flex items-center gap-1.5 font-solaiman">
            <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
            Sort Order
          </label>
        )}
        <Select
          value={selectedSort}
          onValueChange={(val) => onSortChange(val ?? "All")}
        >
          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between font-solaiman">
            <SelectValue placeholder="Default Sort" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg font-solaiman">
            <SelectItem value="All">Default Sort</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="question_asc">Question (A to Z)</SelectItem>
            <SelectItem value="question_desc">Question (Z to A)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  )

  return (
    <div className="mb-6 space-y-3 font-solaiman">
      {/* Primary Filter Toolbar */}
      <div className="flex items-center gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-low p-3 sm:p-4">
        {/* Search Input Filter */}
        <div className="relative flex-1 min-w-0">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
            filter_list
          </span>
          <Input
            type="text"
            placeholder="Search by questions, context, explanation..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-white py-2.5 pl-10 pr-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto font-solaiman"
          />
        </div>

        {/* Mobile Filter Drawer Button */}
        <Drawer>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className="md:hidden flex items-center gap-2 h-10 px-3.5 bg-white border-outline-variant/40 text-sm font-medium shrink-0 rounded-lg cursor-pointer"
              type="button"
            >
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              {activeFilterCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-white text-[11px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </DrawerTrigger>

          <DrawerContent className="p-6 space-y-5 bg-white border-t border-outline-variant/40 max-h-[90vh] overflow-y-auto font-solaiman">
            <DrawerHeader className="p-0 text-left">
              <DrawerTitle className="text-base font-bold text-on-surface flex items-center gap-2 font-solaiman">
                <SlidersHorizontal className="h-5 w-5 text-primary" />
                Filter Creative Questions
              </DrawerTitle>
              <DrawerDescription className="text-xs text-on-surface-variant font-solaiman">
                Select filters and sorting options to refine CQ records.
              </DrawerDescription>
            </DrawerHeader>

            {/* Stacked Filter Selects */}
            <div className="space-y-4 pt-1">
              {renderSelectFilters(true)}
            </div>

            <DrawerFooter className="p-0 pt-3 flex flex-row items-center gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={handleResetAll}
                className="flex-1 h-10 text-xs font-bold border-outline-variant/40 cursor-pointer font-solaiman"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Reset
              </Button>
              <DrawerClose asChild>
                <Button className="flex-1 h-10 text-xs font-bold bg-primary text-white cursor-pointer font-solaiman" type="button">
                  Apply Filters
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Desktop Filter Selects */}
        <div className="hidden md:flex flex-wrap items-center gap-3">
          {renderSelectFilters(false)}
        </div>
      </div>

      {/* Active Filter Badges & Reset Row */}
      {hasAnyFilter && (
        <div className="flex flex-col gap-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3 text-xs sm:flex-row sm:items-center sm:justify-between sm:bg-transparent sm:border-0 sm:p-0 sm:px-1 font-solaiman">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="font-semibold text-outline text-[11px] sm:text-xs uppercase tracking-wider font-solaiman">
              Active Filters:
            </span>

            {/* Search Query Badge */}
            {hasActiveQuery && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[11px] sm:text-xs font-medium text-on-surface hover:bg-surface-container-highest cursor-default normal-case tracking-normal max-w-[200px] truncate font-solaiman"
              >
                <span className="truncate">Search: &quot;{searchQuery}&quot;</span>
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="rounded-full p-0.5 hover:bg-outline-variant/30 transition-colors cursor-pointer shrink-0"
                  title="Remove search filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {/* Subject Badge */}
            {hasActiveSubject && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[11px] sm:text-xs font-medium text-on-surface hover:bg-surface-container-highest cursor-default normal-case tracking-normal shrink-0 font-solaiman"
              >
                <span>Subject: {subjects.find(s => s.id === selectedSubjectId)?.name || selectedSubjectId}</span>
                <button
                  type="button"
                  onClick={() => {
                    onSubjectChange("All")
                    onChapterChange("All")
                  }}
                  className="rounded-full p-0.5 hover:bg-outline-variant/30 transition-colors cursor-pointer shrink-0"
                  title="Remove subject filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {/* Chapter Badge */}
            {hasActiveChapter && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[11px] sm:text-xs font-medium text-on-surface hover:bg-surface-container-highest cursor-default normal-case tracking-normal shrink-0 font-solaiman"
              >
                <span>Chapter: {chapters.find(c => c.id === selectedChapterId)?.name || selectedChapterId}</span>
                <button
                  type="button"
                  onClick={() => onChapterChange("All")}
                  className="rounded-full p-0.5 hover:bg-outline-variant/30 transition-colors cursor-pointer shrink-0"
                  title="Remove chapter filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {/* Board Badge */}
            {hasActiveBoard && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[11px] sm:text-xs font-medium text-on-surface hover:bg-surface-container-highest cursor-default normal-case tracking-normal shrink-0 font-solaiman"
              >
                <span>
                  Board:{" "}
                  {(() => {
                    const matched = boardYears.find((item: any) => item.rawRef === selectedBoard)
                    return matched ? `${matched.boardName} ২০${matched.year}` : selectedBoard
                  })()}
                </span>
                <button
                  type="button"
                  onClick={() => onBoardChange("All")}
                  className="rounded-full p-0.5 hover:bg-outline-variant/30 transition-colors cursor-pointer shrink-0"
                  title="Remove board filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {/* Sort Badge */}
            {hasActiveSort && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[11px] sm:text-xs font-medium text-on-surface hover:bg-surface-container-highest cursor-default normal-case tracking-normal shrink-0 font-solaiman"
              >
                <span>Sort: {getSortLabel(selectedSort)}</span>
                <button
                  type="button"
                  onClick={() => onSortChange("All")}
                  className="rounded-full p-0.5 hover:bg-outline-variant/30 transition-colors cursor-pointer shrink-0"
                  title="Remove sort filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

          </div>

          {/* Reset All Badge */}
          <div className="flex justify-end border-t border-outline-variant/20 pt-2 sm:border-0 sm:pt-0">
            <button
              type="button"
              onClick={handleResetAll}
              className="cursor-pointer focus:outline-hidden"
              title="Reset all active filters"
            >
              <Badge
                variant="outline"
                className="inline-flex items-center gap-1 rounded-md border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] sm:text-xs font-bold text-primary hover:bg-primary/20 transition-colors normal-case tracking-normal font-solaiman"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset All</span>
              </Badge>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
