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
  GraduationCap,
} from "lucide-react"

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

interface ShortCompositionFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedAcademicClassId: string
  onAcademicClassChange: (value: string) => void
  academicClasses?: AcademicClassOption[]
  selectedSubjectId: string
  onSubjectChange: (value: string) => void
  subjects?: SubjectOption[]
  selectedDifficulty: string
  onDifficultyChange: (value: string) => void
  selectedSort: string
  onSortChange: (value: string) => void
}

export function ShortCompositionFilters({
  searchQuery,
  onSearchChange,
  selectedAcademicClassId,
  onAcademicClassChange,
  academicClasses = [],
  selectedSubjectId,
  onSubjectChange,
  subjects = [],
  selectedDifficulty,
  onDifficultyChange,
  selectedSort,
  onSortChange,
}: ShortCompositionFiltersProps) {
  const hasActiveQuery = Boolean(searchQuery && searchQuery.trim() !== "")
  const hasActiveSubject = Boolean(selectedSubjectId && selectedSubjectId !== "All")
  const hasActiveDifficulty = Boolean(selectedDifficulty && selectedDifficulty !== "All")
  const hasActiveSort = Boolean(selectedSort && selectedSort !== "All")

  const hasAnyFilter =
    hasActiveQuery ||
    hasActiveSubject ||
    hasActiveDifficulty ||
    hasActiveSort ||
    selectedAcademicClassId !== "All"

  const activeFilterCount =
    (hasActiveSubject ? 1 : 0) +
    (hasActiveDifficulty ? 1 : 0) +
    (hasActiveSort ? 1 : 0) +
    (selectedAcademicClassId !== "All" ? 1 : 0)

  const handleResetAll = () => {
    onSearchChange("")
    onAcademicClassChange("All")
    onSubjectChange("All")
    onDifficultyChange("All")
    onSortChange("All")
  }

  const getSortLabel = (sort: string) => {
    switch (sort) {
      case "newest":
        return "Newest First"
      case "oldest":
        return "Oldest First"
      case "title_asc":
        return "Title (A to Z)"
      case "title_desc":
        return "Title (Z to A)"
      case "popularity":
        return "Most Popular"
      default:
        return "Default Order"
    }
  }

  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case "EASY":
        return "Easy"
      case "MEDIUM":
        return "Medium"
      case "HARD":
        return "Hard"
      default:
        return "All Difficulties"
    }
  }

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Search Input Bar */}
        <div className="relative flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search composition topics, references..."
            className="h-10 w-full rounded-xl border-outline-variant/40 bg-surface pl-4 pr-10 text-sm focus-visible:ring-primary"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Mobile Filter Drawer Trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 justify-between rounded-xl border-outline-variant/40 bg-surface h-10 px-4 text-xs font-semibold"
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters & Sort
                </span>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DrawerTrigger>
            <DrawerContent className="p-4 space-y-4">
              <DrawerHeader className="p-0">
                <DrawerTitle className="text-base font-bold text-on-surface">Filter Short Compositions</DrawerTitle>
                <DrawerDescription className="text-xs text-outline">Refine questions by class, subject, difficulty, or sort order.</DrawerDescription>
              </DrawerHeader>

              <div className="space-y-3 pt-2">
                {/* Academic Class */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5" /> Class
                  </label>
                  <Select value={selectedAcademicClassId} onValueChange={onAcademicClassChange}>
                    <SelectTrigger className="w-full rounded-xl border-outline-variant/40 bg-surface h-10 text-xs">
                      <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Classes</SelectItem>
                      {academicClasses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nameEn} {c.nameBn ? `(${c.nameBn})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" /> Subject
                  </label>
                  <Select value={selectedSubjectId} onValueChange={onSubjectChange}>
                    <SelectTrigger className="w-full rounded-xl border-outline-variant/40 bg-surface h-10 text-xs">
                      <SelectValue placeholder="All Subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Subjects</SelectItem>
                      {subjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.nameEn} {s.nameBn ? `(${s.nameBn})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant">Difficulty</label>
                  <Select value={selectedDifficulty} onValueChange={onDifficultyChange}>
                    <SelectTrigger className="w-full rounded-xl border-outline-variant/40 bg-surface h-10 text-xs">
                      <SelectValue placeholder="All Difficulties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Difficulties</SelectItem>
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HARD">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5">
                    <ArrowUpDown className="h-3.5 w-3.5" /> Sort Order
                  </label>
                  <Select value={selectedSort} onValueChange={onSortChange}>
                    <SelectTrigger className="w-full rounded-xl border-outline-variant/40 bg-surface h-10 text-xs">
                      <SelectValue placeholder="Default Order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">Default Order</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="title_asc">Title (A to Z)</SelectItem>
                      <SelectItem value="title_desc">Title (Z to A)</SelectItem>
                      <SelectItem value="popularity">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DrawerFooter className="p-0 pt-2 flex flex-row gap-2">
                <Button variant="outline" onClick={handleResetAll} className="flex-1 rounded-xl text-xs h-10">
                  Reset
                </Button>
                <DrawerClose asChild>
                  <Button className="flex-1 rounded-xl text-xs h-10">Done</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {hasAnyFilter && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleResetAll}
              className="h-10 w-10 shrink-0 text-outline hover:text-on-surface"
              title="Reset all filters"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Desktop Filter Controls (>= md) */}
        <div className="hidden md:flex md:flex-wrap md:items-center md:gap-2.5">
          {/* Class Selector */}
          <Select value={selectedAcademicClassId} onValueChange={onAcademicClassChange}>
            <SelectTrigger className="w-[150px] rounded-xl border-outline-variant/40 bg-surface h-10 text-xs font-medium">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Classes</SelectItem>
              {academicClasses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Subject Selector */}
          <Select value={selectedSubjectId} onValueChange={onSubjectChange}>
            <SelectTrigger className="w-[160px] rounded-xl border-outline-variant/40 bg-surface h-10 text-xs font-medium">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Subjects</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Difficulty Selector */}
          <Select value={selectedDifficulty} onValueChange={onDifficultyChange}>
            <SelectTrigger className="w-[130px] rounded-xl border-outline-variant/40 bg-surface h-10 text-xs font-medium">
              <SelectValue placeholder="All Difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Difficulties</SelectItem>
              <SelectItem value="EASY">Easy</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HARD">Hard</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Selector */}
          <Select value={selectedSort} onValueChange={onSortChange}>
            <SelectTrigger className="w-[140px] rounded-xl border-outline-variant/40 bg-surface h-10 text-xs font-medium">
              <SelectValue placeholder="Default Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Default Order</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="title_asc">Title (A to Z)</SelectItem>
              <SelectItem value="title_desc">Title (Z to A)</SelectItem>
              <SelectItem value="popularity">Most Popular</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters Button */}
          {hasAnyFilter && (
            <Button
              variant="ghost"
              onClick={handleResetAll}
              className="h-10 rounded-xl px-2.5 text-xs font-medium text-outline hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasAnyFilter && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-outline mr-1">Active Filters:</span>
          {hasActiveQuery && (
            <Badge variant="secondary" className="gap-1 px-2 py-0.5 text-[11px] rounded-md">
              Query: &quot;{searchQuery}&quot;
              <X className="h-3 w-3 cursor-pointer hover:text-on-surface" onClick={() => onSearchChange("")} />
            </Badge>
          )}
          {selectedAcademicClassId !== "All" && (
            <Badge variant="secondary" className="gap-1 px-2 py-0.5 text-[11px] rounded-md">
              Class: {academicClasses.find((c) => c.id === selectedAcademicClassId)?.nameEn || selectedAcademicClassId}
              <X className="h-3 w-3 cursor-pointer hover:text-on-surface" onClick={() => onAcademicClassChange("All")} />
            </Badge>
          )}
          {hasActiveSubject && (
            <Badge variant="secondary" className="gap-1 px-2 py-0.5 text-[11px] rounded-md">
              Subject: {subjects.find((s) => s.id === selectedSubjectId)?.nameEn || selectedSubjectId}
              <X className="h-3 w-3 cursor-pointer hover:text-on-surface" onClick={() => onSubjectChange("All")} />
            </Badge>
          )}
          {hasActiveDifficulty && (
            <Badge variant="secondary" className="gap-1 px-2 py-0.5 text-[11px] rounded-md">
              Difficulty: {getDifficultyLabel(selectedDifficulty)}
              <X className="h-3 w-3 cursor-pointer hover:text-on-surface" onClick={() => onDifficultyChange("All")} />
            </Badge>
          )}
          {hasActiveSort && (
            <Badge variant="secondary" className="gap-1 px-2 py-0.5 text-[11px] rounded-md">
              Sort: {getSortLabel(selectedSort)}
              <X className="h-3 w-3 cursor-pointer hover:text-on-surface" onClick={() => onSortChange("All")} />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
