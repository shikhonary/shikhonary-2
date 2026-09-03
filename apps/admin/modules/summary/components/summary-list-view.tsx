"use client"

import { useState } from "react"
import { useSummariesList, useSummaryStats, useAcademicClassesForSelection, useSubjectsForSelection } from "../services/use-summary"
import { useDeleteSummaryModalStore } from "../store/use-delete-summary-modal-store"
import { SummaryListHeader } from "./summary-list-header"
import { SummaryStatsCards } from "./summary-stats-cards"
import { SummaryFilters } from "./summary-filters"
import { SummaryTable } from "./summary-table"
import { DeleteSummaryModal } from "./delete-summary-modal"
import { useSummarySearchParams } from "../hooks/use-summary-search-params"

export function SummaryListView() {
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
  ] = useSummarySearchParams()

  const handleAcademicClassChange = (classId: string) => {
    setSelectedAcademicClassId(classId)
    setSearchParams({
      subjectId: "All",
      page: 1,
    })
  }

  const openDeleteModal = useDeleteSummaryModalStore((state) => state.openModal)
  const openBulkDeleteModal = useDeleteSummaryModalStore((state) => state.openBulkModal)

  // Query Summaries list with search & filters
  const { data: summariesData, isLoading, isError } = useSummariesList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
    difficulty: selectedDifficulty !== "All" ? selectedDifficulty : undefined,
    sort: selectedSort,
  })

  // Query Summary stats
  const { data: statsData } = useSummaryStats(
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

  const items = summariesData?.items ?? []
  const totalItems = summariesData?.totalItems ?? items.length
  const totalPages = summariesData?.totalPages ?? 1

  return (
    <div className="w-full">
      {/* Header */}
      <SummaryListHeader />

      {/* Stats Cards */}
      <SummaryStatsCards
        totalCount={statsData?.totalCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isLoading}
      />

      {/* Filters */}
      <SummaryFilters
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
      <SummaryTable
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
      <DeleteSummaryModal />
    </div>
  )
}
