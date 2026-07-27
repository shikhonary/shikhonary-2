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
import { Search, RotateCcw } from "lucide-react"

interface ExamGroupFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedType: string
  onTypeChange: (type: string) => void
  selectedCalculationType: string
  onCalculationTypeChange: (calcType: string) => void
  selectedAcademicClassId: string
  onAcademicClassChange: (classId: string) => void
  selectedIsPublished: string
  onIsPublishedChange: (published: string) => void
  selectedSort: string
  onSortChange: (sort: string) => void
  selectedLimit: number
  onLimitChange: (limit: number) => void
}

const typeOptions = [
  { label: "All Types", value: "All" },
  { label: "Model Test", value: "MODEL_TEST" },
  { label: "Term Exam", value: "TERM_EXAM" },
  { label: "Weekly Series", value: "WEEKLY_SERIES" },
  { label: "Subject Combo", value: "SUBJECT_COMBO" },
]

const calculationTypeOptions = [
  { label: "All Calc Modes", value: "All" },
  { label: "Sum (Total)", value: "SUM" },
  { label: "Average", value: "AVERAGE" },
  { label: "Weighted Avg", value: "WEIGHTED_AVERAGE" },
  { label: "Best of N", value: "BEST_OF_N" },
]

const publishOptions = [
  { label: "All Statuses", value: "All" },
  { label: "Published Only", value: "true" },
  { label: "Draft Only", value: "false" },
]

const sortOptions = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Title (A-Z)", value: "title_asc" },
  { label: "Title (Z-A)", value: "title_desc" },
]

export function ExamGroupFilters({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedCalculationType,
  onCalculationTypeChange,
  selectedAcademicClassId,
  onAcademicClassChange,
  selectedIsPublished,
  onIsPublishedChange,
  selectedSort,
  onSortChange,
  selectedLimit,
  onLimitChange,
}: ExamGroupFiltersProps) {
  const { data: classesData } = useAcademicClassesForSelection()
  const academicClasses = classesData ?? []

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedType !== "All" ||
    selectedCalculationType !== "All" ||
    selectedAcademicClassId !== "All" ||
    selectedIsPublished !== "All" ||
    (selectedSort !== "All" && selectedSort !== "newest")

  const handleClearFilters = () => {
    onSearchChange("")
    onTypeChange("All")
    onCalculationTypeChange("All")
    onAcademicClassChange("All")
    onIsPublishedChange("All")
    onSortChange("newest")
  }

  return (
    <div className="mb-6 flex flex-col items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 md:flex-row">
      <div className="flex w-full flex-1 flex-wrap items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline" />
          <Input
            type="text"
            placeholder="Search Exam Groups..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-white py-2.5 pl-9 pr-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto"
          />
        </div>

        {/* Academic Class Filter */}
        <div className="min-w-[160px]">
          <Select value={selectedAcademicClassId} onValueChange={(val) => onAcademicClassChange(val ?? "All")}>
            <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-3 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between cursor-pointer">
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

        {/* Group Type Filter */}
        <div className="min-w-[150px]">
          <Select value={selectedType} onValueChange={(val) => onTypeChange(val ?? "All")}>
            <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-3 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between cursor-pointer">
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

        {/* Calculation Type Filter */}
        <div className="min-w-[150px]">
          <Select value={selectedCalculationType} onValueChange={(val) => onCalculationTypeChange(val ?? "All")}>
            <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-3 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between cursor-pointer">
              <SelectValue placeholder="Calc Mode" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
              {calculationTypeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Publish Status Filter */}
        <div className="min-w-[140px]">
          <Select value={selectedIsPublished} onValueChange={(val) => onIsPublishedChange(val ?? "All")}>
            <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-3 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between cursor-pointer">
              <SelectValue placeholder="Published" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
              {publishOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort Filter */}
        <div className="min-w-[140px]">
          <Select value={selectedSort} onValueChange={(val) => onSortChange(val ?? "newest")}>
            <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-3 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between cursor-pointer">
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
        <div className="min-w-[120px]">
          <Select
            value={String(selectedLimit)}
            onValueChange={(val) => onLimitChange(Number(val) || 10)}
          >
            <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-3 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between cursor-pointer">
              <SelectValue placeholder="Per Page" />
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
            className="text-xs text-outline hover:text-error hover:bg-error-container/20 rounded-lg cursor-pointer h-auto py-2.5 px-3 flex items-center gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </Button>
        )}
      </div>
    </div>
  )
}
