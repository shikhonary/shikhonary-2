"use client"

import { Input } from "@workspace/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"

interface AcademicClassOption {
  id: string
  name: string
  isActive?: boolean
}

interface SubjectFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedLevel: string
  onLevelChange: (value: string) => void
  selectedGroup: string
  onGroupChange: (value: string) => void
  selectedAcademicClassId: string
  onAcademicClassChange: (value: string) => void
  academicClasses?: AcademicClassOption[]
  selectedSort: string
  onSortChange: (value: string) => void
  selectedLimit: number
  onLimitChange: (value: number) => void
}

export function SubjectFilters({
  searchQuery,
  onSearchChange,
  selectedLevel,
  onLevelChange,
  selectedGroup,
  onGroupChange,
  selectedAcademicClassId,
  onAcademicClassChange,
  academicClasses = [],
  selectedSort,
  onSortChange,
  selectedLimit,
  onLimitChange,
}: SubjectFiltersProps) {
  return (
    <div className="mb-6 flex flex-col items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 md:flex-row">
      <div className="flex w-full flex-1 flex-wrap items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
            filter_list
          </span>
          <Input
            type="text"
            placeholder="Search Subject Name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-white py-2.5 pl-10 pr-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto"
          />
        </div>

        {/* Level Filter */}
        <div className="min-w-[160px]">
          <Select
            value={selectedLevel}
            onValueChange={(val) => onLevelChange(val ?? "All")}
          >
            <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
              <SelectItem value="All" label="All Levels">All Levels</SelectItem>
              <SelectItem value="Primary" label="Primary">Primary</SelectItem>
              <SelectItem value="Secondary" label="Secondary">Secondary</SelectItem>
              <SelectItem
                value="Higher Secondary (HSC)"
                label="Higher Secondary (HSC)"
              >
                Higher Secondary (HSC)
              </SelectItem>
              <SelectItem value="Undergraduate" label="Undergraduate">Undergraduate</SelectItem>
              <SelectItem value="Graduate" label="Graduate">Graduate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Group Filter */}
        <div className="min-w-[160px]">
          <Select
            value={selectedGroup}
            onValueChange={(val) => onGroupChange(val ?? "All")}
          >
            <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between">
              <SelectValue placeholder="All Groups" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
              <SelectItem value="All" label="All Groups">All Groups</SelectItem>
              <SelectItem value="General" label="General / General Studies">General / General Studies</SelectItem>
              <SelectItem value="Science" label="Science">Science</SelectItem>
              <SelectItem value="Commerce" label="Commerce / Business">Commerce / Business</SelectItem>
              <SelectItem value="Humanities" label="Humanities / Arts">Humanities / Arts</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Academic Class Filter */}
        {academicClasses.length > 0 && (
          <div className="min-w-[180px]">
            <Select
              value={selectedAcademicClassId}
              onValueChange={(val) => onAcademicClassChange(val ?? "All")}
            >
              <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
                <SelectItem value="All" label="All Classes">All Classes</SelectItem>
                {academicClasses.map((ac) => (
                  <SelectItem
                    key={ac.id}
                    value={ac.id}
                    label={ac.name}
                  >
                    {ac.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Sort Select */}
        <div className="min-w-[160px]">
          <Select
            value={selectedSort}
            onValueChange={(val) => onSortChange(val ?? "All")}
          >
            <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between">
              <SelectValue placeholder="All Sorts" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
              <SelectItem value="All" label="Default Order">Default Order</SelectItem>
              <SelectItem value="position_asc" label="Position (Low to High)">Position (Low to High)</SelectItem>
              <SelectItem value="position_desc" label="Position (High to Low)">Position (High to Low)</SelectItem>
              <SelectItem value="name_asc" label="Name (A to Z)">Name (A to Z)</SelectItem>
              <SelectItem value="name_desc" label="Name (Z to A)">Name (Z to A)</SelectItem>
              <SelectItem value="newest" label="Newest Added">Newest Added</SelectItem>
              <SelectItem value="oldest" label="Oldest Added">Oldest Added</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Limit Select */}
        <div className="min-w-[130px]">
          <Select
            value={String(selectedLimit)}
            onValueChange={(val) => onLimitChange(Number(val) || 5)}
          >
            <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between">
              <SelectValue placeholder="Items Per Page" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
              <SelectItem value="5" label="5 per page">5 per page</SelectItem>
              <SelectItem value="10" label="10 per page">10 per page</SelectItem>
              <SelectItem value="20" label="20 per page">20 per page</SelectItem>
              <SelectItem value="50" label="50 per page">50 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
