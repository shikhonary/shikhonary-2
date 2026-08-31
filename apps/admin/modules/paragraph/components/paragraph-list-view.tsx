"use client"

import { useState } from "react"
import { useParagraphsList, useParagraphStats, useAcademicClassesForSelection, useSubjectsForSelection } from "../services/use-paragraph"
import { useDeleteParagraphModalStore } from "../store/use-delete-paragraph-modal-store"
import { ParagraphListHeader } from "./paragraph-list-header"
import { ParagraphStatsCards } from "./paragraph-stats-cards"
import { ParagraphFilters } from "./paragraph-filters"
import { ParagraphTable } from "./paragraph-table"
import { DeleteParagraphModal } from "./delete-paragraph-modal"
import { useParagraphSearchParams } from "../hooks/use-paragraph-search-params"

export function ParagraphListView() {
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
  ] = useParagraphSearchParams()

  const handleAcademicClassChange = (classId: string) => {
    setSelectedAcademicClassId(classId)
    setSearchParams({
      subjectId: "All",
      page: 1,
    })
  }

  const openDeleteModal = useDeleteParagraphModalStore((state) => state.openModal)
  const openBulkDeleteModal = useDeleteParagraphModalStore((state) => state.openBulkModal)

  // Query Paragraphs list with search & filters
  const { data: paragraphsData, isLoading, isError } = useParagraphsList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
    difficulty: selectedDifficulty !== "All" ? selectedDifficulty : undefined,
    sort: selectedSort,
  })

  // Query Paragraph stats
  const { data: statsData } = useParagraphStats(
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

  const items = paragraphsData?.items ?? []
  const totalItems = paragraphsData?.totalItems ?? items.length
  const totalPages = paragraphsData?.totalPages ?? 1

  return (
    <div className="w-full">
      {/* Header */}
      <ParagraphListHeader />

      {/* Stats Cards */}
      <ParagraphStatsCards
        totalCount={statsData?.totalCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isLoading}
      />

      {/* Filters */}
      <ParagraphFilters
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
      <ParagraphTable
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
      <DeleteParagraphModal />
    </div>
  )
}
