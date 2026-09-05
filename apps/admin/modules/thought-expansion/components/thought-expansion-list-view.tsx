"use client"

import { useState } from "react"
import { useThoughtExpansionsList, useThoughtExpansionStats, useAcademicClassesForSelection, useSubjectsForSelection } from "../services/use-thought-expansion"
import { useDeleteThoughtExpansionModalStore } from "../store/use-delete-thought-expansion-modal-store"
import { ThoughtExpansionListHeader } from "./thought-expansion-list-header"
import { ThoughtExpansionStatsCards } from "./thought-expansion-stats-cards"
import { ThoughtExpansionFilters } from "./thought-expansion-filters"
import { ThoughtExpansionTable } from "./thought-expansion-table"
import { DeleteThoughtExpansionModal } from "./delete-thought-expansion-modal"
import { useThoughtExpansionSearchParams } from "../hooks/use-thought-expansion-search-params"

export function ThoughtExpansionListView() {
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
  ] = useThoughtExpansionSearchParams()

  const handleAcademicClassChange = (classId: string) => {
    setSelectedAcademicClassId(classId)
    setSearchParams({
      subjectId: "All",
      page: 1,
    })
  }

  const openDeleteModal = useDeleteThoughtExpansionModalStore((state) => state.openModal)
  const openBulkDeleteModal = useDeleteThoughtExpansionModalStore((state) => state.openBulkModal)

  // Query Thought Expansions list with search & filters
  const { data: thoughtExpansionsData, isLoading, isError } = useThoughtExpansionsList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
    difficulty: selectedDifficulty !== "All" ? selectedDifficulty : undefined,
    sort: selectedSort,
  })

  // Query Thought Expansion stats
  const { data: statsData } = useThoughtExpansionStats(
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

  const items = thoughtExpansionsData?.items ?? []
  const totalItems = thoughtExpansionsData?.totalItems ?? items.length
  const totalPages = thoughtExpansionsData?.totalPages ?? 1

  return (
    <div className="w-full">
      {/* Header */}
      <ThoughtExpansionListHeader />

      {/* Stats Cards */}
      <ThoughtExpansionStatsCards
        totalCount={statsData?.totalCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isLoading}
      />

      {/* Filters */}
      <ThoughtExpansionFilters
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
      <ThoughtExpansionTable
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
      <DeleteThoughtExpansionModal />
    </div>
  )
}
