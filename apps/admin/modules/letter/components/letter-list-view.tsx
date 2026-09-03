"use client"

import { useState } from "react"
import { useLettersList, useLetterStats, useAcademicClassesForSelection, useSubjectsForSelection } from "../services/use-letter"
import { useDeleteLetterModalStore } from "../store/use-delete-letter-modal-store"
import { LetterListHeader } from "./letter-list-header"
import { LetterStatsCards } from "./letter-stats-cards"
import { LetterFilters } from "./letter-filters"
import { LetterTable } from "./letter-table"
import { DeleteLetterModal } from "./delete-letter-modal"
import { useLetterSearchParams } from "../hooks/use-letter-search-params"

export function LetterListView() {
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
  ] = useLetterSearchParams()

  const handleAcademicClassChange = (classId: string) => {
    setSelectedAcademicClassId(classId)
    setSearchParams({
      subjectId: "All",
      page: 1,
    })
  }

  const openDeleteModal = useDeleteLetterModalStore((state) => state.openModal)
  const openBulkDeleteModal = useDeleteLetterModalStore((state) => state.openBulkModal)

  // Query Letters list with search & filters
  const { data: lettersData, isLoading, isError } = useLettersList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
    difficulty: selectedDifficulty !== "All" ? selectedDifficulty : undefined,
    sort: selectedSort,
  })

  // Query Letter stats
  const { data: statsData } = useLetterStats(
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

  const items = lettersData?.items ?? []
  const totalItems = lettersData?.totalItems ?? items.length
  const totalPages = lettersData?.totalPages ?? 1

  return (
    <div className="w-full">
      {/* Header */}
      <LetterListHeader />

      {/* Stats Cards */}
      <LetterStatsCards
        totalCount={statsData?.totalCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isLoading}
      />

      {/* Filters */}
      <LetterFilters
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
      <LetterTable
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
      <DeleteLetterModal />
    </div>
  )
}
