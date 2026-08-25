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
import { X, RotateCcw, SlidersHorizontal, ArrowUpDown, Calendar, BookOpen, GraduationCap } from "lucide-react"
import {
  useAcademicYearsForSelection,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
} from "../services/use-chapter"

interface ChapterFilterBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedYear: string
  onYearChange: (value: string) => void
  selectedClass: string
  onClassChange: (value: string) => void
  selectedSubject: string
  onSubjectChange: (value: string) => void
  selectedSort: string
  onSortChange: (value: string) => void
  onResetAll?: () => void
}

export function ChapterFilterBar({
  searchQuery,
  onSearchChange,
  selectedYear,
  onYearChange,
  selectedClass,
  onClassChange,
  selectedSubject,
  onSubjectChange,
  selectedSort,
  onSortChange,
  onResetAll,
}: ChapterFilterBarProps) {
  const { data: yearsData } = useAcademicYearsForSelection()
  const years = yearsData?.academicYears ?? []

  const { data: classesData } = useAcademicClassesForSelection(
    selectedYear === "All" ? undefined : selectedYear
  )
  const classes = classesData?.academicClasses ?? []

  const { data: subjectsData } = useSubjectsForSelection(
    selectedYear === "All" ? undefined : selectedYear,
    selectedClass === "All" ? undefined : selectedClass
  )
  const subjects = subjectsData?.academicSubjects ?? []

  const hasActiveQuery = Boolean(searchQuery && searchQuery.trim() !== "")
  const hasActiveSort = Boolean(selectedSort && selectedSort !== "All")
  const hasActiveYear = Boolean(selectedYear && selectedYear !== "All")
  const hasActiveClass = Boolean(selectedClass && selectedClass !== "All")
  const hasActiveSubject = Boolean(selectedSubject && selectedSubject !== "All")
  const hasAnyFilter = hasActiveQuery || hasActiveSort || hasActiveYear || hasActiveClass || hasActiveSubject

  const activeFilterCount =
    (hasActiveSort ? 1 : 0) +
    (hasActiveYear ? 1 : 0) +
    (hasActiveClass ? 1 : 0) +
    (hasActiveSubject ? 1 : 0)

  const handleResetAll = () => {
    onSearchChange("")
    onYearChange("All")
    onClassChange("All")
    onSubjectChange("All")
    onSortChange("All")
    if (onResetAll) onResetAll()
  }

  const getSortLabel = (sort: string) => {
    switch (sort) {
      case "position_asc": return "Position (Ascending)"
      case "position_desc": return "Position (Descending)"
      case "name_asc": return "Name (A-Z)"
      case "name_desc": return "Name (Z-A)"
      default: return sort
    }
  }

  const getSelectedYearLabel = () => {
    if (selectedYear === "All") return "All Academic Years"
    const match = years.find((y) => y.id === selectedYear)
    return match ? match.nameEn : "Selected Year"
  }

  const getSelectedClassLabel = () => {
    if (selectedClass === "All") return "All Classes"
    const match = classes.find((c) => c.id === selectedClass)
    return match ? match.nameEn : "Selected Class"
  }

  const getSelectedSubjectLabel = () => {
    if (selectedSubject === "All") return "All Subjects"
    const match = subjects.find((s) => s.id === selectedSubject)
    return match ? match.nameEn : "Selected Subject"
  }

  const renderSelectFilters = (isMobile = false) => (
    <>
      {/* Academic Year Filter */}
      <div className={isMobile ? "space-y-1.5" : "min-w-[190px]"}>
        {isMobile && (
          <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            Academic Year
          </label>
        )}
        <Select
          value={selectedYear}
          onValueChange={(val) => {
            onYearChange(val ?? "All")
            onClassChange("All")
            onSubjectChange("All")
          }}
        >
          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between">
            <SelectValue placeholder="All Academic Years" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg max-h-[200px] overflow-y-auto">
            <SelectItem value="All">All Academic Years</SelectItem>
            {years.map((y) => (
              <SelectItem key={y.id} value={y.id}>
                {y.nameEn} ({y.nameBn})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Class Filter */}
      <div className={isMobile ? "space-y-1.5" : "min-w-[170px]"}>
        {isMobile && (
          <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5 text-primary" />
            Class
          </label>
        )}
        <Select
          value={selectedClass}
          onValueChange={(val) => {
            onClassChange(val ?? "All")
            onSubjectChange("All")
          }}
        >
          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg max-h-[200px] overflow-y-auto">
            <SelectItem value="All">All Classes</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nameEn} ({c.nameBn})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subject Filter */}
      <div className={isMobile ? "space-y-1.5" : "min-w-[190px]"}>
        {isMobile && (
          <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            Subject
          </label>
        )}
        <Select
          value={selectedSubject}
          onValueChange={(val) => onSubjectChange(val ?? "All")}
        >
          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg max-h-[200px] overflow-y-auto">
            <SelectItem value="All">All Subjects</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.nameEn} ({s.nameBn})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort Filter */}
      <div className={isMobile ? "space-y-1.5" : "min-w-[170px]"}>
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
            <SelectValue placeholder="Default Order" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
            <SelectItem value="All">Default Order</SelectItem>
            <SelectItem value="position_asc">Position (Ascending)</SelectItem>
            <SelectItem value="position_desc">Position (Descending)</SelectItem>
            <SelectItem value="name_asc">Name (A to Z)</SelectItem>
            <SelectItem value="name_desc">Name (Z to A)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  )

  return (
    <div className="mb-6 space-y-3">
      {/* Primary Filter Toolbar */}
      <div className="flex items-center gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-low p-3 sm:p-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
            filter_list
          </span>
          <Input
            type="text"
            placeholder="Filter by Chapter Name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-white py-2.5 pl-10 pr-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto"
          />
        </div>

        {/* Mobile Filter Drawer */}
        <Drawer>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className="md:hidden flex items-center gap-2 h-10 px-3.5 bg-white border-outline-variant/40 text-sm font-medium shrink-0 rounded-lg cursor-pointer"
            >
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              {activeFilterCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-white text-[11px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </DrawerTrigger>

          <DrawerContent className="p-6 space-y-5 bg-white border-t border-outline-variant/40">
            <DrawerHeader className="p-0 text-left">
              <DrawerTitle className="text-base font-bold text-on-surface flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-primary" />
                Filter Chapters
              </DrawerTitle>
              <DrawerDescription className="text-xs text-on-surface-variant">
                Select configurations to filter and order chapter data.
              </DrawerDescription>
            </DrawerHeader>

            <div className="space-y-4 pt-1">
              {renderSelectFilters(true)}
            </div>

            <DrawerFooter className="p-0 pt-3 flex flex-row items-center gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={handleResetAll}
                className="flex-1 h-10 text-xs font-bold border-outline-variant/40 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Reset
              </Button>
              <DrawerClose asChild>
                <Button className="flex-1 h-10 text-xs font-bold bg-primary text-white cursor-pointer">
                  Apply Filters
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Desktop Filter Selects */}
        <div className="hidden md:flex items-center gap-3">
          {renderSelectFilters(false)}
        </div>
      </div>

      {/* Active Filter Badges */}
      {hasAnyFilter && (
        <div className="flex flex-col gap-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3 text-xs sm:flex-row sm:items-center sm:justify-between sm:bg-transparent sm:border-0 sm:p-0 sm:px-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="font-semibold text-outline text-[11px] sm:text-xs uppercase tracking-wider">
              Active Filters:
            </span>

            {hasActiveQuery && (
              <Badge variant="secondary" className="inline-flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[11px] sm:text-xs font-medium text-on-surface hover:bg-surface-container-highest cursor-default normal-case tracking-normal max-w-[200px] truncate">
                <span className="truncate">Search: {searchQuery}</span>
                <button type="button" onClick={() => onSearchChange("")} className="rounded-full p-0.5 hover:bg-outline-variant/30 transition-colors cursor-pointer shrink-0">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {hasActiveYear && (
              <Badge variant="secondary" className="inline-flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[11px] sm:text-xs font-medium text-on-surface hover:bg-surface-container-highest cursor-default normal-case tracking-normal shrink-0">
                <span>Year: {getSelectedYearLabel()}</span>
                <button type="button" onClick={() => { onYearChange("All"); onClassChange("All"); onSubjectChange("All") }} className="rounded-full p-0.5 hover:bg-outline-variant/30 transition-colors cursor-pointer shrink-0">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {hasActiveClass && (
              <Badge variant="secondary" className="inline-flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[11px] sm:text-xs font-medium text-on-surface hover:bg-surface-container-highest cursor-default normal-case tracking-normal shrink-0">
                <span>Class: {getSelectedClassLabel()}</span>
                <button type="button" onClick={() => { onClassChange("All"); onSubjectChange("All") }} className="rounded-full p-0.5 hover:bg-outline-variant/30 transition-colors cursor-pointer shrink-0">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {hasActiveSubject && (
              <Badge variant="secondary" className="inline-flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[11px] sm:text-xs font-medium text-on-surface hover:bg-surface-container-highest cursor-default normal-case tracking-normal shrink-0">
                <span>Subject: {getSelectedSubjectLabel()}</span>
                <button type="button" onClick={() => onSubjectChange("All")} className="rounded-full p-0.5 hover:bg-outline-variant/30 transition-colors cursor-pointer shrink-0">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {hasActiveSort && (
              <Badge variant="secondary" className="inline-flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[11px] sm:text-xs font-medium text-on-surface hover:bg-surface-container-highest cursor-default normal-case tracking-normal shrink-0">
                <span>Sort: {getSortLabel(selectedSort)}</span>
                <button type="button" onClick={() => onSortChange("All")} className="rounded-full p-0.5 hover:bg-outline-variant/30 transition-colors cursor-pointer shrink-0">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>

          <div className="flex justify-end border-t border-outline-variant/20 pt-2 sm:border-0 sm:pt-0">
            <button type="button" onClick={handleResetAll} className="cursor-pointer focus:outline-hidden">
              <Badge variant="outline" className="inline-flex items-center gap-1 rounded-md border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] sm:text-xs font-bold text-primary hover:bg-primary/20 transition-colors normal-case tracking-normal">
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