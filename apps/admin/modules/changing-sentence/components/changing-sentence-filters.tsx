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

interface ChangingSentenceFiltersProps {
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

export function ChangingSentenceFilters({
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
}: ChangingSentenceFiltersProps) {
  const hasActiveQuery = Boolean(searchQuery && searchQuery.trim() !== "")
  const hasActiveClass = Boolean(selectedAcademicClassId && selectedAcademicClassId !== "All")
  const hasActiveSubject = Boolean(selectedSubjectId && selectedSubjectId !== "All")
  const hasActiveDifficulty = Boolean(selectedDifficulty && selectedDifficulty !== "All")
  const hasActiveSort = Boolean(selectedSort && selectedSort !== "All")
  const hasActiveFilters = hasActiveQuery || hasActiveClass || hasActiveSubject || hasActiveDifficulty || hasActiveSort

  const handleReset = () => {
    onSearchChange("")
    onAcademicClassChange("All")
    onSubjectChange("All")
    onDifficultyChange("All")
    onSortChange("All")
  }

  const activeFilterCount = [
    hasActiveQuery,
    hasActiveClass,
    hasActiveSubject,
    hasActiveDifficulty,
    hasActiveSort,
  ].filter(Boolean).length

  return (
    <div className="mb-6 space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Input
            placeholder="Search questions, directives, or reference..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-surface-container-lowest pr-8"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Mobile Filter Drawer (< md) */}
        <div className="flex md:hidden items-center gap-2">
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 justify-center gap-2 border-outline-variant bg-surface-container-lowest"
              >
                <SlidersHorizontal className="h-4 w-4 text-outline" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs bg-primary/10 text-primary">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DrawerTrigger>
            <DrawerContent className="px-4 pb-6 max-h-[85vh]">
              <DrawerHeader className="px-0">
                <DrawerTitle>Filter Questions</DrawerTitle>
                <DrawerDescription>Narrow down question items by class, subject, difficulty, and sort order.</DrawerDescription>
              </DrawerHeader>

              <div className="space-y-4 py-4 overflow-y-auto">
                {/* Academic Class */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-outline flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5" /> Class
                  </label>
                  <Select value={selectedAcademicClassId} onValueChange={onAcademicClassChange}>
                    <SelectTrigger className="w-full bg-surface-container-lowest">
                      <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
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
                  <label className="text-xs font-semibold uppercase text-outline flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" /> Subject
                  </label>
                  <Select value={selectedSubjectId} onValueChange={onSubjectChange}>
                    <SelectTrigger className="w-full bg-surface-container-lowest">
                      <SelectValue placeholder="All Subjects" />
                    </SelectTrigger>
                    <SelectContent>
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
                  <label className="text-xs font-semibold uppercase text-outline">Difficulty</label>
                  <Select value={selectedDifficulty} onValueChange={onDifficultyChange}>
                    <SelectTrigger className="w-full bg-surface-container-lowest">
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
                  <label className="text-xs font-semibold uppercase text-outline flex items-center gap-1.5">
                    <ArrowUpDown className="h-3.5 w-3.5" /> Sort Order
                  </label>
                  <Select value={selectedSort} onValueChange={onSortChange}>
                    <SelectTrigger className="w-full bg-surface-container-lowest">
                      <SelectValue placeholder="Default (Newest)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">Default (Newest)</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="content_asc">Content (A-Z)</SelectItem>
                      <SelectItem value="content_desc">Content (Z-A)</SelectItem>
                      <SelectItem value="popularity">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DrawerFooter className="px-0 pt-2 flex flex-row gap-2">
                <Button variant="outline" onClick={handleReset} className="flex-1">
                  Reset All
                </Button>
                <DrawerClose asChild>
                  <Button className="flex-1">Apply Filters</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              className="text-outline hover:text-on-surface cursor-pointer"
              title="Reset filters"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Desktop Filters (>= md) */}
        <div className="hidden md:flex items-center gap-2.5 flex-wrap">
          {/* Class Selector */}
          <Select value={selectedAcademicClassId} onValueChange={onAcademicClassChange}>
            <SelectTrigger className="w-[150px] bg-surface-container-lowest text-xs">
              <SelectValue placeholder="Class: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Class: All</SelectItem>
              {academicClasses.map((ac) => (
                <SelectItem key={ac.id} value={ac.id}>
                  {ac.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Subject Selector */}
          <Select value={selectedSubjectId} onValueChange={onSubjectChange}>
            <SelectTrigger className="w-[160px] bg-surface-container-lowest text-xs">
              <SelectValue placeholder="Subject: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Subject: All</SelectItem>
              {subjects.map((sub) => (
                <SelectItem key={sub.id} value={sub.id}>
                  {sub.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Difficulty */}
          <Select value={selectedDifficulty} onValueChange={onDifficultyChange}>
            <SelectTrigger className="w-[130px] bg-surface-container-lowest text-xs">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Difficulty: All</SelectItem>
              <SelectItem value="EASY">Easy</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HARD">Hard</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={selectedSort} onValueChange={onSortChange}>
            <SelectTrigger className="w-[140px] bg-surface-container-lowest text-xs">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Sort: Newest</SelectItem>
              <SelectItem value="oldest">Sort: Oldest</SelectItem>
              <SelectItem value="content_asc">Sort: A-Z</SelectItem>
              <SelectItem value="content_desc">Sort: Z-A</SelectItem>
              <SelectItem value="popularity">Sort: Popular</SelectItem>
            </SelectContent>
          </Select>

          {/* Reset Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs text-outline hover:text-on-surface flex items-center gap-1 h-9 px-2.5 cursor-pointer"
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
