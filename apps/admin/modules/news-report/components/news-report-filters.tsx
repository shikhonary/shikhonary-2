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

interface NewsReportFiltersProps {
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

export function NewsReportFilters({
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
}: NewsReportFiltersProps) {
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
        return "Title (A-Z)"
      case "title_desc":
      case "name_desc":
        return "Title (Z-A)"
      case "popularity":
        return "Most Popular"
      default:
        return "Default Order"
    }
  }

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Easy</Badge>
      case "MEDIUM":
        return <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">Medium</Badge>
      case "HARD":
        return <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 border-red-500/20">Hard</Badge>
      default:
        return null
    }
  }

  return (
    <div className="mb-6 space-y-3">
      {/* Main Filter Bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search input with reset cross */}
        <div className="relative flex-1">
          <Input
            placeholder="Search news reports by prompt topic, keyword, or reference..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-sm outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/10 h-auto"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-outline hover:bg-surface-container hover:text-on-surface cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Desktop Filter Dropdowns (>= lg) */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Class selector */}
          <div className="w-[180px]">
            <Select
              value={selectedAcademicClassId}
              onValueChange={onAcademicClassChange}
            >
              <SelectTrigger className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto">
                <div className="flex items-center gap-2 truncate">
                  <GraduationCap className="h-4 w-4 text-outline shrink-0" />
                  <SelectValue placeholder="All Classes" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-surface-container-lowest border border-outline-variant shadow-md rounded-lg max-h-60">
                <SelectItem value="All">All Classes</SelectItem>
                {academicClasses.map((ac) => (
                  <SelectItem key={ac.id} value={ac.id}>
                    {ac.nameEn} {ac.nameBn ? `(${ac.nameBn})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject selector */}
          <div className="w-[180px]">
            <Select
              value={selectedSubjectId}
              onValueChange={onSubjectChange}
            >
              <SelectTrigger className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto">
                <div className="flex items-center gap-2 truncate">
                  <BookOpen className="h-4 w-4 text-outline shrink-0" />
                  <SelectValue placeholder="All Subjects" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-surface-container-lowest border border-outline-variant shadow-md rounded-lg max-h-60">
                <SelectItem value="All">All Subjects</SelectItem>
                {subjects.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.nameEn} {sub.nameBn ? `(${sub.nameBn})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty selector */}
          <div className="w-[140px]">
            <Select
              value={selectedDifficulty}
              onValueChange={onDifficultyChange}
            >
              <SelectTrigger className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto">
                <div className="flex items-center gap-2 truncate">
                  <Layers className="h-4 w-4 text-outline shrink-0" />
                  <SelectValue placeholder="Difficulty" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-surface-container-lowest border border-outline-variant shadow-md rounded-lg">
                <SelectItem value="All">All Difficulties</SelectItem>
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort selector */}
          <div className="w-[160px]">
            <Select
              value={selectedSort}
              onValueChange={onSortChange}
            >
              <SelectTrigger className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto">
                <div className="flex items-center gap-2 truncate">
                  <ArrowUpDown className="h-4 w-4 text-outline shrink-0" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-surface-container-lowest border border-outline-variant shadow-md rounded-lg">
                <SelectItem value="All">Default Order</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title_asc">Title (A-Z)</SelectItem>
                <SelectItem value="title_desc">Title (Z-A)</SelectItem>
                <SelectItem value="popularity">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reset Filters */}
          {hasAnyFilter && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetAll}
              className="rounded-xl border-outline-variant font-label-md text-xs font-semibold text-outline hover:text-on-surface h-[42px] px-3 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
          )}
        </div>

        {/* Mobile Filter Button (< lg) */}
        <div className="flex items-center gap-2 lg:hidden">
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 rounded-xl border-outline-variant bg-surface-container-lowest py-2.5 font-label-md text-sm font-semibold text-on-surface h-auto flex items-center justify-center gap-2 cursor-pointer"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <Badge className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-white">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DrawerTrigger>

            <DrawerContent className="p-4 bg-surface-container-lowest">
              <DrawerHeader className="px-0">
                <DrawerTitle className="font-headline-md text-lg font-bold">Filters</DrawerTitle>
                <DrawerDescription className="text-xs text-outline">
                  Refine the news report list by class, subject, difficulty, or sort order.
                </DrawerDescription>
              </DrawerHeader>

              <div className="space-y-4 py-4">
                {/* Academic Class */}
                <div className="space-y-1.5">
                  <label className="font-label-md text-xs font-semibold text-outline">Academic Class</label>
                  <Select
                    value={selectedAcademicClassId}
                    onValueChange={onAcademicClassChange}
                  >
                    <SelectTrigger className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-body-md text-sm h-auto">
                      <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-container-lowest border border-outline-variant shadow-md rounded-lg max-h-52">
                      <SelectItem value="All">All Classes</SelectItem>
                      {academicClasses.map((ac) => (
                        <SelectItem key={ac.id} value={ac.id}>
                          {ac.nameEn} {ac.nameBn ? `(${ac.nameBn})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="font-label-md text-xs font-semibold text-outline">Subject</label>
                  <Select
                    value={selectedSubjectId}
                    onValueChange={onSubjectChange}
                  >
                    <SelectTrigger className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-body-md text-sm h-auto">
                      <SelectValue placeholder="All Subjects" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-container-lowest border border-outline-variant shadow-md rounded-lg max-h-52">
                      <SelectItem value="All">All Subjects</SelectItem>
                      {subjects.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.nameEn} {sub.nameBn ? `(${sub.nameBn})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty */}
                <div className="space-y-1.5">
                  <label className="font-label-md text-xs font-semibold text-outline">Difficulty</label>
                  <Select
                    value={selectedDifficulty}
                    onValueChange={onDifficultyChange}
                  >
                    <SelectTrigger className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-body-md text-sm h-auto">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-container-lowest border border-outline-variant shadow-md rounded-lg">
                      <SelectItem value="All">All Difficulties</SelectItem>
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HARD">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Order */}
                <div className="space-y-1.5">
                  <label className="font-label-md text-xs font-semibold text-outline">Sort By</label>
                  <Select
                    value={selectedSort}
                    onValueChange={onSortChange}
                  >
                    <SelectTrigger className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-body-md text-sm h-auto">
                      <SelectValue placeholder="Sort order" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-container-lowest border border-outline-variant shadow-md rounded-lg">
                      <SelectItem value="All">Default Order</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="title_asc">Title (A-Z)</SelectItem>
                      <SelectItem value="title_desc">Title (Z-A)</SelectItem>
                      <SelectItem value="popularity">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DrawerFooter className="px-0 pt-2 flex flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={handleResetAll}
                  className="flex-1 rounded-xl border-outline-variant font-label-md text-sm font-semibold text-outline"
                >
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  Reset
                </Button>
                <DrawerClose asChild>
                  <Button className="flex-1 rounded-xl bg-primary font-label-md text-sm font-semibold text-white">
                    Apply
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {hasAnyFilter && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetAll}
              className="rounded-xl border-outline-variant font-label-md text-xs font-semibold text-outline hover:text-on-surface h-[42px] px-3 cursor-pointer shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Active Filter Badges */}
      {hasAnyFilter && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="font-label-sm text-xs font-medium text-outline">Active filters:</span>

          {hasActiveQuery && (
            <Badge variant="secondary" className="gap-1 rounded-md px-2 py-0.5 text-xs font-normal">
              Search: &quot;{searchQuery}&quot;
              <X
                className="h-3 w-3 cursor-pointer text-outline hover:text-on-surface"
                onClick={() => onSearchChange("")}
              />
            </Badge>
          )}

          {selectedAcademicClassId !== "All" && (
            <Badge variant="secondary" className="gap-1 rounded-md px-2 py-0.5 text-xs font-normal">
              Class: {academicClasses.find((ac) => ac.id === selectedAcademicClassId)?.nameEn || selectedAcademicClassId}
              <X
                className="h-3 w-3 cursor-pointer text-outline hover:text-on-surface"
                onClick={() => onAcademicClassChange("All")}
              />
            </Badge>
          )}

          {hasActiveSubject && (
            <Badge variant="secondary" className="gap-1 rounded-md px-2 py-0.5 text-xs font-normal">
              Subject: {subjects.find((s) => s.id === selectedSubjectId)?.nameEn || selectedSubjectId}
              <X
                className="h-3 w-3 cursor-pointer text-outline hover:text-on-surface"
                onClick={() => onSubjectChange("All")}
              />
            </Badge>
          )}

          {hasActiveDifficulty && (
            <Badge variant="secondary" className="gap-1 rounded-md px-2 py-0.5 text-xs font-normal">
              Difficulty: {selectedDifficulty}
              <X
                className="h-3 w-3 cursor-pointer text-outline hover:text-on-surface"
                onClick={() => onDifficultyChange("All")}
              />
            </Badge>
          )}

          {hasActiveSort && (
            <Badge variant="secondary" className="gap-1 rounded-md px-2 py-0.5 text-xs font-normal">
              Sort: {getSortLabel(selectedSort)}
              <X
                className="h-3 w-3 cursor-pointer text-outline hover:text-on-surface"
                onClick={() => onSortChange("All")}
              />
            </Badge>
          )}

          <button
            onClick={handleResetAll}
            className="font-label-sm text-xs text-primary hover:underline ml-1 cursor-pointer font-semibold"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}
