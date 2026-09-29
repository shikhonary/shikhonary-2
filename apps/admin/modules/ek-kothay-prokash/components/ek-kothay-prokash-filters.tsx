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
  GraduationCap,
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

interface EkKothayProkashFiltersProps {
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
  selectedDifficulty: string
  onDifficultyChange: (value: string) => void
  selectedSort: string
  onSortChange: (value: string) => void
}

export function EkKothayProkashFilters({
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
  selectedDifficulty,
  onDifficultyChange,
  selectedSort,
  onSortChange,
}: EkKothayProkashFiltersProps) {
  const filteredChapters = selectedSubjectId !== "All"
    ? chapters.filter((c) => c.subjectId === selectedSubjectId)
    : chapters

  const hasActiveQuery = Boolean(searchQuery && searchQuery.trim() !== "")
  const hasActiveSubject = Boolean(selectedSubjectId && selectedSubjectId !== "All")
  const hasActiveChapter = Boolean(selectedChapterId && selectedChapterId !== "All")
  const hasActiveDifficulty = Boolean(selectedDifficulty && selectedDifficulty !== "All")
  const hasActiveSort = Boolean(selectedSort && selectedSort !== "newest" && selectedSort !== "All")

  const hasAnyFilter =
    hasActiveQuery ||
    hasActiveSubject ||
    hasActiveChapter ||
    hasActiveDifficulty ||
    hasActiveSort ||
    selectedAcademicClassId !== "All"

  const activeFilterCount =
    (hasActiveSubject ? 1 : 0) +
    (hasActiveChapter ? 1 : 0) +
    (hasActiveDifficulty ? 1 : 0) +
    (hasActiveSort ? 1 : 0)

  const handleResetAll = () => {
    onSearchChange("")
    onAcademicClassChange("All")
    onSubjectChange("All")
    onChapterChange("All")
    onDifficultyChange("All")
    onSortChange("newest")
  }

  const getSortLabel = (sort: string) => {
    switch (sort) {
      case "newest":
        return "Newest First"
      case "oldest":
        return "Oldest First"
      case "phrase_asc":
        return "Phrase (A to Z)"
      case "phrase_desc":
        return "Phrase (Z to A)"
      case "popularity":
        return "Most Popular"
      default:
        return "Default Sort"
    }
  }

  const renderSelectFilters = (isMobile = false) => (
    <>
      {/* Class Filter */}
      <div className={isMobile ? "space-y-1.5" : "min-w-[150px] flex-1 md:flex-none"}>
        {isMobile && (
          <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
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
          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent className="bg-white text-neutral-900 border border-outline-variant shadow-md rounded-lg max-h-64">
            <SelectItem value="All" className="text-neutral-900">All Classes</SelectItem>
            {academicClasses.map((cls) => (
              <SelectItem key={cls.id} value={cls.id} className="text-neutral-900">
                {cls.nameEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subject Filter */}
      <div className={isMobile ? "space-y-1.5" : "min-w-[180px] flex-1 md:flex-none"}>
        {isMobile && (
          <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
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
          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between disabled:opacity-50 disabled:cursor-not-allowed">
            <SelectValue placeholder={selectedAcademicClassId === "All" ? "Select Class First" : "All Subjects"} />
          </SelectTrigger>
          <SelectContent className="bg-white text-neutral-900 border border-outline-variant shadow-md rounded-lg max-h-64">
            <SelectItem value="All" className="text-neutral-900">All Subjects</SelectItem>
            {subjects.map((sub) => (
              <SelectItem key={sub.id} value={sub.id} className="text-neutral-900">
                {sub.nameEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Chapter Filter */}
      <div className={isMobile ? "space-y-1.5" : "min-w-[180px] flex-1 md:flex-none"}>
        {isMobile && (
          <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
            <Bookmark className="h-3.5 w-3.5 text-primary" />
            Chapter
          </label>
        )}
        <Select
          value={selectedChapterId}
          onValueChange={(val) => onChapterChange(val ?? "All")}
          disabled={selectedSubjectId === "All"}
        >
          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between disabled:opacity-50 disabled:cursor-not-allowed">
            <SelectValue placeholder={selectedSubjectId === "All" ? "Select Subject First" : "All Chapters"} />
          </SelectTrigger>
          <SelectContent className="bg-white text-neutral-900 border border-outline-variant shadow-md rounded-lg max-h-64">
            <SelectItem value="All" className="text-neutral-900">All Chapters</SelectItem>
            {filteredChapters.map((ch) => (
              <SelectItem key={ch.id} value={ch.id} className="text-neutral-900">
                {ch.nameBn || ch.nameEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Difficulty Filter */}
      <div className={isMobile ? "space-y-1.5" : "min-w-[150px] flex-1 md:flex-none"}>
        {isMobile && (
          <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-primary" />
            Difficulty
          </label>
        )}
        <Select
          value={selectedDifficulty}
          onValueChange={(val) => onDifficultyChange(val ?? "All")}
        >
          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between">
            <SelectValue placeholder="All Difficulties" />
          </SelectTrigger>
          <SelectContent className="bg-white text-neutral-900 border border-outline-variant shadow-md rounded-lg">
            <SelectItem value="All" className="text-neutral-900">All Difficulties</SelectItem>
            <SelectItem value="EASY" className="text-neutral-900">Easy</SelectItem>
            <SelectItem value="MEDIUM" className="text-neutral-900">Medium</SelectItem>
            <SelectItem value="HARD" className="text-neutral-900">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort Filter */}
      <div className={isMobile ? "space-y-1.5" : "min-w-[160px] flex-1 md:flex-none"}>
        {isMobile && (
          <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
            Sort By
          </label>
        )}
        <Select
          value={selectedSort}
          onValueChange={(val) => onSortChange(val ?? "newest")}
        >
          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent className="bg-white text-neutral-900 border border-outline-variant shadow-md rounded-lg">
            <SelectItem value="newest" className="text-neutral-900">Newest First</SelectItem>
            <SelectItem value="oldest" className="text-neutral-900">Oldest First</SelectItem>
            <SelectItem value="phrase_asc" className="text-neutral-900">Phrase (A to Z)</SelectItem>
            <SelectItem value="phrase_desc" className="text-neutral-900">Phrase (Z to A)</SelectItem>
            <SelectItem value="popularity" className="text-neutral-900">Most Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  )

  return (
    <div className="space-y-4 mb-6">
      {/* Main Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Input
            type="text"
            placeholder="Search phrase or word..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-white py-2.5 pl-4 pr-10 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Desktop Filters (>= md) */}
        <div className="hidden md:flex items-center gap-3 flex-wrap">
          {renderSelectFilters(false)}

          {hasAnyFilter && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetAll}
              className="rounded-lg border border-outline-variant bg-white text-xs font-bold text-outline hover:bg-surface-container-high hover:text-on-surface h-auto py-2.5 px-3 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
          )}
        </div>

        {/* Mobile Filter Button (< md) */}
        <div className="flex md:hidden items-center justify-between gap-2 pt-2 border-t border-outline-variant/30">
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 rounded-lg border border-outline-variant bg-white py-2.5 font-headline-md text-xs font-bold text-on-surface justify-center gap-2 h-auto"
              >
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <Badge variant="default" className="bg-primary text-white text-[10px] rounded-full px-1.5 py-0.2 min-w-[18px] text-center">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DrawerTrigger>
            <DrawerContent className="bg-white">
              <DrawerHeader className="border-b border-outline-variant/30 pb-4">
                <DrawerTitle className="font-headline-md text-lg font-bold text-primary flex items-center justify-between">
                  <span>Filter Entries</span>
                  {hasAnyFilter && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetAll}
                      className="text-xs font-bold text-outline hover:text-on-surface h-auto py-1 px-2"
                    >
                      Reset All
                    </Button>
                  )}
                </DrawerTitle>
                <DrawerDescription className="text-xs text-on-surface-variant">
                  Narrow down the Ek Kothay Prokash bank by class, subject, chapter, or difficulty.
                </DrawerDescription>
              </DrawerHeader>

              <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                {renderSelectFilters(true)}
              </div>

              <DrawerFooter className="border-t border-outline-variant/30 pt-4">
                <DrawerClose asChild>
                  <Button className="w-full bg-primary text-white font-bold rounded-xl py-3">
                    Apply Filters
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {hasAnyFilter && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleResetAll}
              className="rounded-lg border border-outline-variant bg-white text-outline hover:text-on-surface h-[38px] w-[38px] shrink-0"
              title="Reset All Filters"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Active Filter Chips Row */}
      {hasAnyFilter && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-bold text-outline uppercase tracking-wider mr-1">Active:</span>

          {selectedAcademicClassId !== "All" && (
            <Badge variant="outline" className="rounded-lg bg-surface-container-high border-outline-variant/50 text-xs font-medium text-on-surface gap-1 py-1 px-2.5">
              <span>Class: {academicClasses.find((c) => c.id === selectedAcademicClassId)?.nameEn || selectedAcademicClassId}</span>
              <button onClick={() => onAcademicClassChange("All")} className="hover:text-error ml-1 cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {hasActiveSubject && (
            <Badge variant="outline" className="rounded-lg bg-surface-container-high border-outline-variant/50 text-xs font-medium text-on-surface gap-1 py-1 px-2.5">
              <span>Subject: {subjects.find((s) => s.id === selectedSubjectId)?.nameEn || selectedSubjectId}</span>
              <button onClick={() => onSubjectChange("All")} className="hover:text-error ml-1 cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {hasActiveChapter && (
            <Badge variant="outline" className="rounded-lg bg-surface-container-high border-outline-variant/50 text-xs font-medium text-on-surface gap-1 py-1 px-2.5">
              <span>Chapter: {chapters.find((c) => c.id === selectedChapterId)?.nameBn || selectedChapterId}</span>
              <button onClick={() => onChapterChange("All")} className="hover:text-error ml-1 cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {hasActiveDifficulty && (
            <Badge variant="outline" className="rounded-lg bg-surface-container-high border-outline-variant/50 text-xs font-medium text-on-surface gap-1 py-1 px-2.5">
              <span>Difficulty: {selectedDifficulty}</span>
              <button onClick={() => onDifficultyChange("All")} className="hover:text-error ml-1 cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {hasActiveSort && (
            <Badge variant="outline" className="rounded-lg bg-surface-container-high border-outline-variant/50 text-xs font-medium text-on-surface gap-1 py-1 px-2.5">
              <span>Sort: {getSortLabel(selectedSort)}</span>
              <button onClick={() => onSortChange("newest")} className="hover:text-error ml-1 cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
