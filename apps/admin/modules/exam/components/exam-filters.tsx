"use client"

import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Button } from "@workspace/ui/components/button"
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
  selectedLimit: number
  onLimitChange: (limit: number) => void
}

const statusOptions = [
  { label: "All Statuses", value: "All" },
  { label: "Pending / Draft", value: "Pending" },
  { label: "Published & Active", value: "Published" },
  { label: "Archived", value: "Archived" },
]

const typeOptions = [
  { label: "All Types", value: "All" },
  { label: "MCQ Exam", value: "MCQ" },
  { label: "Written Exam", value: "Written" },
  { label: "Model Test", value: "Model Test" },
  { label: "Weekly Exam", value: "Weekly" },
  { label: "Monthly Exam", value: "Monthly" },
]

const sortOptions = [
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
  selectedLimit,
  onLimitChange,
}: ExamFiltersProps) {
  const { data: classesData } = useAcademicClassesForSelection()
  const academicClasses = classesData ?? []

  const hasActiveFilters =
    searchQuery ||
    selectedStatus !== "All" ||
    selectedType !== "All" ||
    selectedAcademicClassId !== "All" ||
    (selectedSort !== "All" && selectedSort !== "newest")

  const handleClearFilters = () => {
    onSearchChange("")
    onStatusChange("All")
    onTypeChange("All")
    onAcademicClassChange("All")
    onSortChange("newest")
  }

  return (
    <div className="mb-6 flex flex-col items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 md:flex-row">
      <div className="flex w-full flex-1 flex-wrap items-center gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
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

        {/* Academic Class Filter */}
        <div className="min-w-[180px]">
          <Select value={selectedAcademicClassId} onValueChange={(val) => onAcademicClassChange(val ?? "All")}>
            <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between cursor-pointer">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
              <SelectItem value="All">All Classes</SelectItem>
              {academicClasses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="min-w-[160px]">
          <Select value={selectedStatus} onValueChange={(val) => onStatusChange(val ?? "All")}>
            <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between cursor-pointer">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type Filter */}
        <div className="min-w-[160px]">
          <Select value={selectedType} onValueChange={(val) => onTypeChange(val ?? "All")}>
            <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between cursor-pointer">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
              {typeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort Filter */}
        <div className="min-w-[160px]">
          <Select value={selectedSort} onValueChange={(val) => onSortChange(val ?? "newest")}>
            <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between cursor-pointer">
              <SelectValue placeholder="Sort by" />
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

        {/* Limit / Page size */}
        <div className="min-w-[140px]">
          <Select
            value={String(selectedLimit)}
            onValueChange={(val) => onLimitChange(Number(val) || 10)}
          >
            <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between cursor-pointer">
              <SelectValue placeholder="Items Per Page" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="20">20 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-xs text-outline hover:text-error hover:bg-error-container/20 rounded-lg cursor-pointer h-auto py-2.5 px-3"
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}
