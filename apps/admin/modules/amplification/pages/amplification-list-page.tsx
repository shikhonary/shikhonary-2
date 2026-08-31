"use client"

import { useState } from "react"
import { useAmplificationsList, useAmplificationStats } from "../services/use-amplification"
import { useAcademicClassesForSelection, useSubjectsForSelection } from "../../paragraph/services/use-paragraph"
import { useDeleteAmplificationModalStore } from "../store/use-delete-amplification-modal-store"
import { AmplificationListHeader } from "../components/amplification-list-header"
import { AmplificationStatsCards } from "../components/amplification-stats-cards"
import { AmplificationFilters } from "../components/amplification-filters"
import { AmplificationTable } from "../components/amplification-table"
import { DeleteAmplificationModal } from "../components/delete-amplification-modal"
import { useAmplificationSearchParams } from "../hooks/use-amplification-search-params"

export function AmplificationListPage() {
  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState<string>("All")
  const { data: academicClasses = [] } = useAcademicClassesForSelection()

  const [
    {
      query: searchQuery,
      subjectId: selectedSubjectId,
      difficulty: selectedDifficulty,
      sort: selectedSort,
      page: currentPage,
      limit,
    },
    setSearchParams,
  ] = useAmplificationSearchParams()

  const handleAcademicClassChange = (classId: string) => {
    setSelectedAcademicClassId(classId)
    setSearchParams({
      subjectId: "All",
      page: 1,
    })
  }

  const openDeleteModal = useDeleteAmplificationModalStore((state) => state.openModal)
  const openBulkDeleteModal = useDeleteAmplificationModalStore((state) => state.openBulkModal)

  // Query Amplifications list with search & filters
  const { data: amplificationsData, isLoading, isError } = useAmplificationsList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
    difficulty: selectedDifficulty !== "All" ? selectedDifficulty : undefined,
    sort: selectedSort,
  })

  // Query stats
  const { data: statsData } = useAmplificationStats(
    selectedSubjectId !== "All"
      ? {
          subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
        }
      : undefined
  )

  // Query subjects for dropdown filters
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedAcademicClassId !== "All" ? { academicClassId: selectedAcademicClassId } : undefined
  )

  const items = amplificationsData?.items ?? []
  const totalItems = amplificationsData?.totalItems ?? items.length
  const totalPages = amplificationsData?.totalPages ?? 1

  return (
    <div className="w-full">
      {/* Header */}
      <AmplificationListHeader />

      {/* Stats Cards */}
      <AmplificationStatsCards
        totalCount={statsData?.totalCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isLoading}
      />

      {/* Filters */}
      <AmplificationFilters
        searchQuery={searchQuery}
        onSearchChange={(query) => setSearchParams({ query, page: 1 })}
        selectedAcademicClassId={selectedAcademicClassId}
        onAcademicClassChange={handleAcademicClassChange}
        academicClasses={academicClasses}
        selectedSubjectId={selectedSubjectId}
        onSubjectChange={(subjectId) => setSearchParams({ subjectId, page: 1 })}
        subjects={subjects}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={(difficulty) => setSearchParams({ difficulty, page: 1 })}
        selectedSort={selectedSort}
        onSortChange={(sort) => setSearchParams({ sort: sort as any, page: 1 })}
      />

      {/* Data Table */}
      <AmplificationTable
        items={items as any}
        isLoading={isLoading}
        isError={isError}
        onDelete={(id, nameSnippet) => openDeleteModal(id, nameSnippet)}
        onBulkDelete={(selectedIds) => openBulkDeleteModal(selectedIds)}
        currentPage={currentPage}
        itemsPerPage={limit}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={(page) => setSearchParams({ page })}
        onLimitChange={(newLimit) => setSearchParams({ limit: newLimit, page: 1 })}
      />

      {/* Confirm Delete Modal */}
      <DeleteAmplificationModal />
    </div>
  )
}
