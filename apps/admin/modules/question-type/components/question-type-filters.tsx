"use client"

import { Input } from "@workspace/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { X, RotateCcw } from "lucide-react"

interface QuestionTypeFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedSort: string
  onSortChange: (value: string) => void
  onResetAll?: () => void
}

export function QuestionTypeFilters({
  searchQuery,
  onSearchChange,
  selectedSort,
  onSortChange,
  onResetAll,
}: QuestionTypeFiltersProps) {
  const hasActiveQuery = Boolean(searchQuery && searchQuery.trim() !== "")
  const hasActiveSort = Boolean(selectedSort && selectedSort !== "All")
  const hasAnyFilter = hasActiveQuery || hasActiveSort

  const handleResetAll = () => {
    onSearchChange("")
    onSortChange("All")
    if (onResetAll) onResetAll()
  }

  return (
    <div className="mb-6 space-y-3">
      {/* Primary Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-low p-3 sm:p-4">
        {/* Search Input Filter */}
        <div className="relative flex-1 min-w-0">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
            search
          </span>
          <Input
            type="text"
            placeholder="Search by name or label..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10 rounded-lg border border-outline-variant bg-white py-2.5 outline-hidden focus:ring-2 focus:ring-primary/10 h-auto font-body-md text-sm text-on-surface"
          />
          {hasActiveQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-outline hover:bg-surface-variant hover:text-on-surface"
              title="Clear search"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          )}
        </div>

        {/* Sort Filter */}
        <div className="min-w-[180px]">
          <Select
            value={selectedSort}
            onValueChange={(val) => onSortChange(val ?? "All")}
          >
            <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
              <SelectItem value="All">Position (Asc)</SelectItem>
              <SelectItem value="name_asc">Name (A to Z)</SelectItem>
              <SelectItem value="name_desc">Name (Z to A)</SelectItem>
              <SelectItem value="position_desc">Position (Desc)</SelectItem>
              <SelectItem value="mark_asc">Mark (Asc)</SelectItem>
              <SelectItem value="mark_desc">Mark (Desc)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reset Button (only shown when filters active) */}
        {hasAnyFilter && (
          <Button
            variant="outline"
            onClick={handleResetAll}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-outline-variant bg-white px-4 py-2 text-sm font-medium hover:bg-surface-variant cursor-pointer h-auto"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        )}
      </div>

      {/* Active Filter Badges */}
      {hasAnyFilter && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          <span className="text-xs font-semibold text-outline">Active Filters:</span>
          {hasActiveQuery && (
            <Badge variant="secondary" className="gap-1 rounded-md bg-surface-container-high px-2 py-0.5 text-xs text-on-surface-variant border border-outline-variant">
              Query: &quot;{searchQuery}&quot;
              <X className="h-3 w-3 cursor-pointer hover:text-error" onClick={() => onSearchChange("")} />
            </Badge>
          )}
          {hasActiveSort && (
            <Badge variant="secondary" className="gap-1 rounded-md bg-surface-container-high px-2 py-0.5 text-xs text-on-surface-variant border border-outline-variant">
              Sort: {selectedSort.replace("_", " ")}
              <X className="h-3 w-3 cursor-pointer hover:text-error" onClick={() => onSortChange("All")} />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
