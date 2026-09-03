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
  Layers,
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

interface ApplicationFiltersProps {
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

export function ApplicationFilters({
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
}: ApplicationFiltersProps) {
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
    (hasActiveSort ? 1 : 0)

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
      case "name_asc":
        return "Title (A to Z)"
      case "title_desc":
      case "name_desc":
        return "Title (Z to A)"
      case "popularity":
        return "Popularity"
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

      {/* Difficulty Filter */}
      <div className={isMobile ? "space-y-1.5" : "min-w-[140px] flex-1 md:flex-none"}>
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
          <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
            <SelectItem value="All">All Difficulties</SelectItem>
            <SelectItem value="EASY">EASY</SelectItem>
            <SelectItem value="MEDIUM">MEDIUM</SelectItem>
            <SelectItem value="HARD">HARD</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort Select */}
      <div className={isMobile ? "space-y-1.5" : "min-w-[160px] flex-1 md:flex-none"}>
        {isMobile && (
          <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
            Sort Order
          </label>
        )}
        <Select
          value={selectedSort}
          onValueChange={(val) => onSortChange(val ?? "All")}
        >
          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between">
            <SelectValue placeholder="Default Sort" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
            <SelectItem value="All">Default Sort</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="title_asc">Title (A to Z)</SelectItem>
            <SelectItem value="title_desc">Title (Z to A)</SelectItem>
            <SelectItem value="popularity">Popularity</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  )

  return (
    <div className="mb-6 space-y-3">
      {/* Main Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-low p-3 sm:p-4">
        {/* Search Input with Clear Button */}
        <div className="relative flex-1">
          <Input
            placeholder="Search applications by title or reference citation..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-white py-2.5 pl-4 pr-10 font-body-md text-sm outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/10 h-auto"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container-high transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Desktop Selects */}
        <div className="hidden md:flex flex-wrap items-center gap-3">
          {renderSelectFilters(false)}
        </div>

        {/* Mobile Filter Button (Drawer Trigger) */}
        <div className="flex md:hidden items-center gap-2">
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm font-bold text-on-surface hover:bg-surface-container-high h-auto justify-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                <span>Filters & Sorting</span>
                {activeFilterCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-primary text-white">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DrawerTrigger>
            <DrawerContent className="px-4 pb-8 max-h-[85vh]">
              <DrawerHeader className="text-left px-0 pb-4 border-b border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <DrawerTitle className="font-headline-sm text-lg font-bold text-on-surface">
                    Filters & Sorting
                  </DrawerTitle>
                  {hasAnyFilter && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetAll}
                      className="h-8 px-2 text-xs font-bold text-primary hover:bg-primary/10"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Reset All
                    </Button>
                  )}
                </div>
                <DrawerDescription className="text-xs text-on-surface-variant">
                  Refine the application list by class, subject, difficulty, and order.
                </DrawerDescription>
              </DrawerHeader>

              <div className="py-4 space-y-4 overflow-y-auto">
                {renderSelectFilters(true)}
              </div>

              <DrawerFooter className="px-0 pt-4 border-t border-outline-variant/30">
                <DrawerClose asChild>
                  <Button className="w-full bg-primary text-white font-bold rounded-lg py-2.5">
                    Apply Filters
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {hasAnyFilter && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleResetAll}
              className="h-10 w-10 shrink-0 text-on-surface-variant hover:text-primary rounded-lg border border-outline-variant bg-white"
              title="Reset all filters"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasAnyFilter && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-on-surface-variant mr-1">
            Active Filters:
          </span>

          {selectedAcademicClassId !== "All" && (
            <Badge
              variant="secondary"
              className="rounded-md border border-outline-variant/40 bg-white py-1 pl-2.5 pr-1.5 text-xs font-bold text-on-surface flex items-center gap-1.5 shadow-2xs"
            >
              <span>
                Class: {academicClasses.find((c) => c.id === selectedAcademicClassId)?.nameEn || selectedAcademicClassId}
              </span>
              <button
                onClick={() => {
                  onAcademicClassChange("All")
                  onSubjectChange("All")
                }}
                className="rounded-full p-0.5 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {selectedSubjectId !== "All" && (
            <Badge
              variant="secondary"
              className="rounded-md border border-outline-variant/40 bg-white py-1 pl-2.5 pr-1.5 text-xs font-bold text-on-surface flex items-center gap-1.5 shadow-2xs"
            >
              <span>
                Subject: {subjects.find((s) => s.id === selectedSubjectId)?.nameEn || selectedSubjectId}
              </span>
              <button
                onClick={() => onSubjectChange("All")}
                className="rounded-full p-0.5 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {selectedDifficulty !== "All" && (
            <Badge
              variant="secondary"
              className="rounded-md border border-outline-variant/40 bg-white py-1 pl-2.5 pr-1.5 text-xs font-bold text-on-surface flex items-center gap-1.5 shadow-2xs"
            >
              <span>Difficulty: {selectedDifficulty}</span>
              <button
                onClick={() => onDifficultyChange("All")}
                className="rounded-full p-0.5 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {selectedSort !== "All" && (
            <Badge
              variant="secondary"
              className="rounded-md border border-outline-variant/40 bg-white py-1 pl-2.5 pr-1.5 text-xs font-bold text-on-surface flex items-center gap-1.5 shadow-2xs"
            >
              <span>Sort: {getSortLabel(selectedSort)}</span>
              <button
                onClick={() => onSortChange("All")}
                className="rounded-full p-0.5 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {hasActiveQuery && (
            <Badge
              variant="secondary"
              className="rounded-md border border-outline-variant/40 bg-white py-1 pl-2.5 pr-1.5 text-xs font-bold text-on-surface flex items-center gap-1.5 shadow-2xs"
            >
              <span className="truncate max-w-[150px]">Query: {searchQuery}</span>
              <button
                onClick={() => onSearchChange("")}
                className="rounded-full p-0.5 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetAll}
            className="h-6 px-2 text-xs font-bold text-primary hover:bg-primary/10 ml-auto"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  )
}
