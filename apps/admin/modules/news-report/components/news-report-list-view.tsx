"use client"

import { useState } from "react"
import { useNewsReportsList, useNewsReportStats, useAcademicClassesForSelection, useSubjectsForSelection } from "../services/use-news-report"
import { useDeleteNewsReportModalStore } from "../store/use-delete-news-report-modal-store"
import { NewsReportListHeader } from "./news-report-list-header"
import { NewsReportStatsCards } from "./news-report-stats-cards"
import { NewsReportFilters } from "./news-report-filters"
import { NewsReportTable } from "./news-report-table"
import { DeleteNewsReportModal } from "./delete-news-report-modal"
import { useNewsReportSearchParams } from "../hooks/use-news-report-search-params"

export function NewsReportListView() {
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
  ] = useNewsReportSearchParams()

  const handleAcademicClassChange = (classId: string) => {
    setSelectedAcademicClassId(classId)
    setSearchParams({
      subjectId: "All",
      page: 1,
    })
  }

  const openDeleteModal = useDeleteNewsReportModalStore((state) => state.openModal)
  const openBulkDeleteModal = useDeleteNewsReportModalStore((state) => state.openBulkModal)

  // Query News Reports list with search & filters
  const { data: newsReportsData, isLoading, isError } = useNewsReportsList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
    difficulty: selectedDifficulty !== "All" ? selectedDifficulty : undefined,
    sort: selectedSort,
  })

  // Query News Report stats
  const { data: statsData } = useNewsReportStats(
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

  const items = newsReportsData?.items ?? []
  const totalItems = newsReportsData?.totalItems ?? items.length
  const totalPages = newsReportsData?.totalPages ?? 1

  return (
    <div className="w-full">
      {/* Header */}
      <NewsReportListHeader />

      {/* Stats Cards */}
      <NewsReportStatsCards
        totalCount={statsData?.totalCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isLoading}
      />

      {/* Filters */}
      <NewsReportFilters
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
      <NewsReportTable
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
      <DeleteNewsReportModal />
    </div>
  )
}
