"use client"

import { useRouter } from "next/navigation"
import {
  useSubjectsList,
  useSubjectStats,
} from "../services/use-subject"
import { useAcademicClassesForSelection } from "@/modules/academic-class/services/use-academic-class"
import { useDeleteSubjectModalStore } from "../store/use-delete-subject-modal-store"
import { SubjectListHeader } from "./subject-list-header"
import { SubjectStatsCards } from "./subject-stats-cards"
import { SubjectFilters } from "./subject-filters"
import { SubjectTable } from "./subject-table"
import { useSubjectSearchParams } from "../hooks/use-subject-search-params"

export function SubjectListView() {
  const router = useRouter()
  const [
    {
      query: searchQuery,
      level: selectedLevel,
      group: selectedGroup,
      academicClassId: selectedAcademicClassId,
      sort: selectedSort,
      page: currentPage,
      limit,
    },
    setSearchParams,
  ] = useSubjectSearchParams()

  const openDeleteModal = useDeleteSubjectModalStore((state) => state.openModal)

  // Query subject data with filters
  const { data: subjectsData, isLoading, isError } = useSubjectsList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    level: selectedLevel !== "All" ? selectedLevel : undefined,
    group: selectedGroup !== "All" ? selectedGroup : undefined,
    academicClassId: selectedAcademicClassId !== "All" ? selectedAcademicClassId : undefined,
    sort: selectedSort,
  })

  // Query subject stats
  const { data: statsData } = useSubjectStats()

  // Query academic classes for filter dropdown
  const { data: academicClasses = [] } = useAcademicClassesForSelection(true)

  const items = subjectsData?.items ?? []
  const totalItems = subjectsData?.totalItems ?? items.length
  const totalPages = subjectsData?.totalPages ?? 1

  return (
    <div className="w-full">
      {/* Header */}
      <SubjectListHeader />

      {/* Stats Cards */}
      <SubjectStatsCards
        totalSubjectsCount={statsData.totalSubjectsCount}
        activeLevelsCount={statsData.activeLevelsCount}
        activeGroupsCount={statsData.activeGroupsCount}
      />

      {/* Filters & Action Bar */}
      <SubjectFilters
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchParams({ query, page: 1 })
        }}
        selectedLevel={selectedLevel}
        onLevelChange={(level) => {
          setSearchParams({ level, page: 1 })
        }}
        selectedGroup={selectedGroup}
        onGroupChange={(group) => {
          setSearchParams({ group, page: 1 })
        }}
        selectedAcademicClassId={selectedAcademicClassId}
        onAcademicClassChange={(academicClassId) => {
          setSearchParams({ academicClassId, page: 1 })
        }}
        academicClasses={academicClasses}
        selectedSort={selectedSort}
        onSortChange={(sort) => {
          setSearchParams({ sort: sort as any, page: 1 })
        }}
        selectedLimit={limit}
        onLimitChange={(newLimit) => {
          setSearchParams({ limit: newLimit, page: 1 })
        }}
      />

      {/* Data Table */}
      <SubjectTable
        items={items}
        isLoading={isLoading}
        isError={isError}
        onEdit={(item) => router.push(`/subjects/${item.id}/edit`)}
        onDelete={(id, name) => openDeleteModal(id, name)}
        currentPage={currentPage}
        itemsPerPage={limit}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={(page) => setSearchParams({ page })}
      />
    </div>
  )
}
