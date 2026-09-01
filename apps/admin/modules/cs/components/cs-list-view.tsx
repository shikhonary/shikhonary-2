"use client"

import { useState } from "react"
import { useCsList, useCsStats, useAcademicClassesForSelection, useSubjectsForSelection, useChaptersForSelection } from "../services/use-cs"
import { useDeleteCsModalStore } from "../store/use-delete-cs-modal-store"
import { CsListHeader } from "./cs-list-header"
import { CsStatsCards } from "./cs-stats-cards"
import { CsFilters } from "./cs-filters"
import { CsTable } from "./cs-table"
import { DeleteCsModal } from "./delete-cs-modal"
import { useCsSearchParams } from "../hooks/use-cs-search-params"

export function CsListView() {
  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState<string>("All")
  const { data: academicClasses = [] } = useAcademicClassesForSelection()

  const [
    {
      query: searchQuery,
      subjectId: selectedSubjectId,
      chapterId: selectedChapterId,
      difficulty: selectedDifficulty,
      sort: selectedSort,
      page: currentPage,
      limit,
    },
    setSearchParams,
  ] = useCsSearchParams()

  const handleAcademicClassChange = (classId: string) => {
    setSelectedAcademicClassId(classId)
    setSearchParams({
      subjectId: "All",
      chapterId: "All",
      page: 1,
    })
  }

  const openDeleteModal = useDeleteCsModalStore((state) => state.openModal)
  const openBulkDeleteModal = useDeleteCsModalStore((state) => state.openBulkModal)

  // Query CS list with search & filters
  const { data: csData, isLoading, isError } = useCsList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
    chapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
    difficulty: selectedDifficulty !== "All" ? selectedDifficulty : undefined,
    sort: selectedSort,
  })

  // Query CS stats
  const { data: statsData } = useCsStats(
    selectedSubjectId !== "All" || selectedChapterId !== "All"
      ? {
          subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
          chapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
        }
      : undefined
  )

  // Query subjects & chapters for dropdown filters
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedAcademicClassId !== "All" ? { academicClassId: selectedAcademicClassId } : undefined
  )
  const { data: chapters = [] } = useChaptersForSelection(
    selectedSubjectId !== "All" ? { subjectId: selectedSubjectId } : undefined
  )

  const items = csData?.items ?? []
  const totalItems = csData?.totalItems ?? items.length
  const totalPages = csData?.totalPages ?? 1

  return (
    <div className="w-full">
      {/* Header */}
      <CsListHeader />

      {/* Stats Cards */}
      <CsStatsCards
        totalCount={statsData?.totalCount}
        activeCount={statsData?.activeCount}
        inactiveCount={statsData?.inactiveCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isLoading}
      />

      {/* Filters */}
      <CsFilters
        searchQuery={searchQuery}
        onSearchChange={(query) => setSearchParams({ query, page: 1 })}
        selectedAcademicClassId={selectedAcademicClassId}
        onAcademicClassChange={handleAcademicClassChange}
        academicClasses={academicClasses}
        selectedSubjectId={selectedSubjectId}
        onSubjectChange={(subjectId) => setSearchParams({ subjectId, chapterId: "All", page: 1 })}
        subjects={subjects}
        selectedChapterId={selectedChapterId}
        onChapterChange={(chapterId) => setSearchParams({ chapterId, page: 1 })}
        chapters={chapters}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={(difficulty) => setSearchParams({ difficulty, page: 1 })}
        selectedSort={selectedSort}
        onSortChange={(sort) => setSearchParams({ sort: sort as any, page: 1 })}
      />

      {/* Data Table */}
      <CsTable
        items={items as any}
        isLoading={isLoading}
        isError={isError}
        onDelete={(id, snippet) => openDeleteModal(id, snippet)}
        onBulkDelete={(selectedIds) => openBulkDeleteModal(selectedIds)}
        currentPage={currentPage}
        itemsPerPage={limit}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={(page) => setSearchParams({ page })}
        onLimitChange={(newLimit) => setSearchParams({ limit: newLimit, page: 1 })}
      />

      {/* Confirm Delete Modal */}
      <DeleteCsModal />
    </div>
  )
}
