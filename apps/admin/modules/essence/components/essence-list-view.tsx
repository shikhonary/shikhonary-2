"use client"

import { useState } from "react"
import { useEssencesList, useEssenceStats, useAcademicClassesForSelection, useSubjectsForSelection } from "../services/use-essence"
import { useDeleteEssenceModalStore } from "../store/use-delete-essence-modal-store"
import { EssenceListHeader } from "./essence-list-header"
import { EssenceStatsCards } from "./essence-stats-cards"
import { EssenceFilters } from "./essence-filters"
import { EssenceTable } from "./essence-table"
import { DeleteEssenceModal } from "./delete-essence-modal"
import { useEssenceSearchParams } from "../hooks/use-essence-search-params"

export function EssenceListView() {
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
  ] = useEssenceSearchParams()

  const handleAcademicClassChange = (classId: string) => {
    setSelectedAcademicClassId(classId)
    setSearchParams({
      subjectId: "All",
      page: 1,
    })
  }

  const openDeleteModal = useDeleteEssenceModalStore((state) => state.openModal)
  const openBulkDeleteModal = useDeleteEssenceModalStore((state) => state.openBulkModal)

  // Query Essences list with search & filters
  const { data: essencesData, isLoading, isError } = useEssencesList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
    difficulty: selectedDifficulty !== "All" ? selectedDifficulty : undefined,
    sort: selectedSort,
  })

  // Query Essence stats
  const { data: statsData } = useEssenceStats(
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

  const items = essencesData?.items ?? []
  const totalItems = essencesData?.totalItems ?? items.length
  const totalPages = essencesData?.totalPages ?? 1

  return (
    <div className="w-full">
      {/* Header */}
      <EssenceListHeader />

      {/* Stats Cards */}
      <EssenceStatsCards
        totalCount={statsData?.totalCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isLoading}
      />

      {/* Filters */}
      <EssenceFilters
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
      <EssenceTable
        items={items as any}
        isLoading={isLoading}
        isError={isError}
        onDelete={(id, titleSnippet) => openDeleteModal(id, titleSnippet)}
        onBulkDelete={(ids) => openBulkDeleteModal(ids)}
        currentPage={currentPage}
        itemsPerPage={limit}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={(page) => setSearchParams({ page })}
        onLimitChange={(newLimit) => setSearchParams({ limit: newLimit, page: 1 })}
      />

      {/* Delete Confirmation Modal */}
      <DeleteEssenceModal />
    </div>
  )
}
