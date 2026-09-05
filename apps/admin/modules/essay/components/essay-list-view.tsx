"use client"

import { useState } from "react"
import { useEssaysList, useEssayStats, useAcademicClassesForSelection, useSubjectsForSelection } from "../services/use-essay"
import { useDeleteEssayModalStore } from "../store/use-delete-essay-modal-store"
import { EssayListHeader } from "./essay-list-header"
import { EssayStatsCards } from "./essay-stats-cards"
import { EssayFilters } from "./essay-filters"
import { EssayTable } from "./essay-table"
import { DeleteEssayModal } from "./delete-essay-modal"
import { useEssaySearchParams } from "../hooks/use-essay-search-params"

export function EssayListView() {
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
  ] = useEssaySearchParams()

  const handleAcademicClassChange = (classId: string) => {
    setSelectedAcademicClassId(classId)
    setSearchParams({
      subjectId: "All",
      page: 1,
    })
  }

  const openDeleteModal = useDeleteEssayModalStore((state) => state.openModal)
  const openBulkDeleteModal = useDeleteEssayModalStore((state) => state.openBulkModal)

  // Query Essays list with search & filters
  const { data: essaysData, isLoading, isError } = useEssaysList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
    difficulty: selectedDifficulty !== "All" ? selectedDifficulty : undefined,
    sort: selectedSort,
  })

  // Query Essay stats
  const { data: statsData } = useEssayStats(
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

  const items = essaysData?.items ?? []
  const totalItems = essaysData?.totalItems ?? items.length
  const totalPages = essaysData?.totalPages ?? 1

  return (
    <div className="w-full">
      {/* Header */}
      <EssayListHeader />

      {/* Stats Cards */}
      <EssayStatsCards
        totalCount={statsData?.totalCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isLoading}
      />

      {/* Filters */}
      <EssayFilters
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
      <EssayTable
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
      <DeleteEssayModal />
    </div>
  )
}
