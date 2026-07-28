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
import { X, RotateCcw, SlidersHorizontal, ArrowUpDown, Filter, GraduationCap, BookOpen } from "lucide-react"
import { useAcademicClassesForSelection } from "../../academic-class/services/use-academic-class"

interface ExamFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedStatus: string
  onStatusChange: (status: string) => void
  selectedType: string
  onTypeChange: (type: string) => void
  selectedAcademicClassId: string
  onAcademicClassChange: (classId: string) => void
  selectedSort: string
  onSortChange: (sort: string) => void
}

const statusOptions = [
  { label: "Pending / Draft", value: "Pending" },
  { label: "Published & Active", value: "Published" },
  { label: "Archived", value: "Archived" },
]

const typeOptions = [
  { label: "MCQ Exam", value: "MCQ" },
  { label: "Written Exam", value: "Written" },
  { label: "Model Test", value: "Model Test" },
  { label: "Weekly Exam", value: "Weekly" },
  { label: "Monthly Exam", value: "Monthly" },
]

const sortOptions = [
  { label: "All Sorts", value: "All" },
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Title (A-Z)", value: "title_asc" },
  { label: "Title (Z-A)", value: "title_desc" },
]

export function ExamFilters({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedType,
  onTypeChange,
  selectedAcademicClassId,
  onAcademicClassChange,
  selectedSort,
  onSortChange,
}: ExamFiltersProps) {
  const { data: classesData } = useAcademicClassesForSelection()
  const academicClasses = classesData ?? []

  const hasActiveQuery = Boolean(searchQuery && searchQuery.trim() !== "")
  const hasActiveStatus = Boolean(selectedStatus && selectedStatus !== "All")
  const hasActiveType = Boolean(selectedType && selectedType !== "All")
  const hasActiveAcademicClass = Boolean(selectedAcademicClassId && selectedAcademicClassId !== "All")
  const hasActiveSort = Boolean(selectedSort && selectedSort !== "All")
  const hasAnyFilter = hasActiveQuery || hasActiveStatus || hasActiveType || hasActiveAcademicClass || hasActiveSort

  const activeFilterCount =
    (hasActiveStatus ? 1 : 0) +
    (hasActiveType ? 1 : 0) +
    (hasActiveAcademicClass ? 1 : 0) +
    (hasActiveSort ? 1 : 0)

  const handleResetAll = () => {
    onSearchChange("")
    onStatusChange("All")
    onTypeChange("All")
    onAcademicClassChange("All")
    onSortChange("All")
  }

  const getStatusLabel = (val: string) => {
    return statusOptions.find((o) => o.value === val)?.label ?? val
  }

  const getTypeLabel = (val: string) => {
    return typeOptions.find((o) => o.value === val)?.label ?? val
  }

  const getSortLabel = (val: string) => {
    return sortOptions.find((o) => o.value === val)?.label ?? val
  }

  const getClassName = (id: string) => {
    return academicClasses.find((c) => c.id === id)?.name ?? id
  }

  const renderSelectFilters = (isMobile = false) => (
    <>
      {/* Academic Class Filter */}
      <div className={isMobile ? "space-y-1.5" : "min-w-[140px] max-w-[200px]"}>
        {isMobile && (
          <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5 text-primary" />
            Academic Class
          </label>
        )}
        <Select
          value={selectedAcademicClassId}
          onValueChange={(val) => onAcademicClassChange(val ?? "All")}
        >
          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between cursor-pointer">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
            <SelectItem value="All">All Classes</SelectItem>
            {academicClasses.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status Filter */}
      <div className={isMobile ? "space-y-1.5" : "min-w-[130px] max-w-[180px]"}>
        {isMobile && (
          <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-primary" />
            Status
          </label>
        )}
        <Select
          value={selectedStatus}
          onValueChange={(val) => onStatusChange(val ?? "All")}
        >
          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between cursor-pointer">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
            <SelectItem value="All">All Statuses</SelectItem>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Type Filter */}
      <div className={isMobile ? "space-y-1.5" : "min-w-[130px] max-w-[180px]"}>
        {isMobile && (
          <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            Exam Type
          </label>
        )}
        <Select
          value={selectedType}
          onValueChange={(val) => onTypeChange(val ?? "All")}
        >
          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between cursor-pointer">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
            <SelectItem value="All">All Types</SelectItem>
            {typeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort Filter */}
      <div className={isMobile ? "space-y-1.5" : "min-w-[130px] max-w-[180px]"}>
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
          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between cursor-pointer">
            <SelectValue placeholder="All Sorts" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
            {sortOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  )

  return (
    <div className="mb-6 space-y-3">
      {/* Primary Filter Toolbar */}
      <div className="flex items-center gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-low p-3 sm:p-4">
        {/* Search Input Filter */}
        <div className="relative flex-1 min-w-0">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
            filter_list
          </span>
          <Input
            type="text"
            placeholder="Filter by Exam Title..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-white py-2.5 pl-10 pr-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto"
          />
        </div>

        {/* Mobile Filter Drawer Button (Visible ONLY on mobile: lg:hidden) */}
        <Drawer>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className="lg:hidden flex items-center gap-2 h-10 px-3.5 bg-white border-outline-variant/40 text-sm font-medium shrink-0 rounded-lg cursor-pointer"
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
                Filter Exams
              </DrawerTitle>
              <DrawerDescription className="text-xs text-on-surface-variant">
                Select status, type, class and sorting options to refine exams.
              </DrawerDescription>
            </DrawerHeader>

            {/* Stacked Filter Selects */}
            <div className="space-y-4 pt-1 max-h-[50vh] overflow-y-auto pr-1">
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

        {/* Desktop Filter Selects (Visible ONLY on desktop: hidden lg:flex) */}
        <div className="hidden lg:flex items-center gap-3 flex-wrap">
          {renderSelectFilters(false)}
        </div>
      </div>

      {/* Active Filter Badges & Reset Row */}
      {hasAnyFilter && (
        <div className="flex flex-col gap-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3 text-xs sm:flex-row sm:items-center sm:justify-between sm:bg-transparent sm:border-0 sm:p-0 sm:px-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="font-semibold text-outline text-[11px] sm:text-xs uppercase tracking-wider">
              Active Filters:
            </span>

            {/* Search Query Badge */}
            {hasActiveQuery && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[11px] sm:text-xs font-medium text-on-surface hover:bg-surface-container-highest cursor-default normal-case tracking-normal max-w-[200px] truncate"
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

            {/* Academic Class Badge */}
            {hasActiveAcademicClass && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[11px] sm:text-xs font-medium text-on-surface hover:bg-surface-container-highest cursor-default normal-case tracking-normal shrink-0"
              >
                <span>Class: {getClassName(selectedAcademicClassId)}</span>
                <button
                  type="button"
                  onClick={() => onAcademicClassChange("All")}
                  className="rounded-full p-0.5 hover:bg-outline-variant/30 transition-colors cursor-pointer shrink-0"
                  title="Remove class filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {/* Status Filter Badge */}
            {hasActiveStatus && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[11px] sm:text-xs font-medium text-on-surface hover:bg-surface-container-highest cursor-default normal-case tracking-normal shrink-0"
              >
                <span>Status: {getStatusLabel(selectedStatus)}</span>
                <button
                  type="button"
                  onClick={() => onStatusChange("All")}
                  className="rounded-full p-0.5 hover:bg-outline-variant/30 transition-colors cursor-pointer shrink-0"
                  title="Remove status filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {/* Type Filter Badge */}
            {hasActiveType && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[11px] sm:text-xs font-medium text-on-surface hover:bg-surface-container-highest cursor-default normal-case tracking-normal shrink-0"
              >
                <span>Type: {getTypeLabel(selectedType)}</span>
                <button
                  type="button"
                  onClick={() => onTypeChange("All")}
                  className="rounded-full p-0.5 hover:bg-outline-variant/30 transition-colors cursor-pointer shrink-0"
                  title="Remove type filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {/* Sort Filter Badge */}
            {hasActiveSort && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[11px] sm:text-xs font-medium text-on-surface hover:bg-surface-container-highest cursor-default normal-case tracking-normal shrink-0"
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
                className="inline-flex items-center gap-1 rounded-md border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] sm:text-xs font-bold text-primary hover:bg-primary/20 transition-colors normal-case tracking-normal"
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
