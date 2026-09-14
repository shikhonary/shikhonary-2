"use client"

import { useState } from "react"
import { usePoemsList, usePoemStats, useAcademicClassesForSelection, useSubjectsForSelection } from "../services/use-poem"
import { useDeletePoemModalStore } from "../store/use-delete-poem-modal-store"
import { PoemListHeader } from "./poem-list-header"
import { PoemStatsCards } from "./poem-stats-cards"
import { PoemFilters } from "./poem-filters"
import { PoemTable } from "./poem-table"
import { DeletePoemModal } from "./delete-poem-modal"
import { usePoemSearchParams } from "../hooks/use-poem-search-params"

export function PoemListView() {
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
  ] = usePoemSearchParams()

  const handleAcademicClassChange = (classId: string) => {
    setSelectedAcademicClassId(classId)
    setSearchParams({
      subjectId: "All",
      page: 1,
    })
  }

  const openDeleteModal = useDeletePoemModalStore((state) => state.openModal)
  const openBulkDeleteModal = useDeletePoemModalStore((state) => state.openBulkModal)

  // Query Poems list with search & filters
  const { data: poemsData, isLoading, isError } = usePoemsList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
    difficulty: selectedDifficulty !== "All" ? selectedDifficulty : undefined,
    sort: selectedSort,
  })

  // Query Poem stats
  const { data: statsData } = usePoemStats(
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

  const items = poemsData?.items ?? []
  const totalItems = poemsData?.totalItems ?? items.length
  const totalPages = poemsData?.totalPages ?? 1

  return (
    <div className="w-full">
      {/* Header */}
      <PoemListHeader />

      {/* Stats Cards */}
      <PoemStatsCards
        totalCount={statsData?.totalCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isLoading}
      />

      {/* Filters */}
      <PoemFilters
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
      <PoemTable
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
      <DeletePoemModal />
    </div>
  )
}
