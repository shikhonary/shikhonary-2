"use client"

import { useState } from "react"
import {
  useRearrangeList,
  useRearrangeStats,
  useRearrangeBoardYears,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-rearrange"
import { RearrangeListHeader } from "./rearrange-list-header"
import { RearrangeStatsCards } from "./rearrange-stats-cards"
import { RearrangeFilters } from "./rearrange-filters"
import { RearrangeTable } from "./rearrange-table"
import { DeleteRearrangeModal } from "./delete-rearrange-modal"
import { useRearrangeSearchParams } from "../hooks/use-rearrange-search-params"
import { useDeleteRearrangeModalStore } from "../store/use-delete-rearrange-modal-store"

export function RearrangeListView() {
  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState<string>("All")
  const { data: academicClasses = [] } = useAcademicClassesForSelection()

  const [
    {
      query: searchQuery,
      subjectId: selectedSubjectId,
      chapterId: selectedChapterId,
      board: selectedBoard,
      difficulty: selectedDifficulty,
      sort: selectedSort,
      page: currentPage,
      limit,
    },
    setSearchParams,
  ] = useRearrangeSearchParams()

  const handleAcademicClassChange = (classId: string) => {
    setSelectedAcademicClassId(classId)
    setSearchParams({
      subjectId: "All",
      chapterId: "All",
      board: "All",
      page: 1,
    })
  }

  const openDeleteModal = useDeleteRearrangeModalStore((state) => state.openModal)
  const openBulkDeleteModal = useDeleteRearrangeModalStore((state) => state.openBulkModal)

  // Parse filters
  let boardSource: string | undefined = undefined
  let boardYear: number | undefined = undefined
  if (selectedBoard && selectedBoard !== "All") {
    const parts = selectedBoard.split("-")
    const yearPart = parts[parts.length - 1]
    const sourcePart = parts.slice(0, parts.length - 1).join("-")
    if (sourcePart && yearPart && !isNaN(Number(yearPart))) {
      boardSource = sourcePart
      boardYear = Number(yearPart)
    } else {
      boardSource = selectedBoard
    }
  }

  const { data: rearrangeData, isLoading, isError } = useRearrangeList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
    chapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
    source: boardSource,
    year: boardYear,
    difficulty: selectedDifficulty !== "All" ? (selectedDifficulty as any) : undefined,
    sort: selectedSort as any,
  })

  // Fetch Board + Year combinations for this subject / chapter if selected
  const { data: boardYears = [] } = useRearrangeBoardYears({
    subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
    chapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
  })

  // Query stats
  const { data: statsData, isLoading: isStatsLoading } = useRearrangeStats(
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

  const items = rearrangeData?.items ?? []
  const totalItems = rearrangeData?.totalItems ?? items.length
  const totalPages = rearrangeData?.totalPages ?? 1

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <RearrangeListHeader />

      {/* Summary Counts Cards */}
      <RearrangeStatsCards
        totalCount={statsData?.totalCount}
        activeCount={statsData?.activeCount}
        inactiveCount={statsData?.inactiveCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isLoading || isStatsLoading}
      />

      {/* Filters Form */}
      <RearrangeFilters
        searchQuery={searchQuery}
        onSearchChange={(query) => setSearchParams({ query, page: 1 })}
        selectedAcademicClassId={selectedAcademicClassId}
        onAcademicClassChange={handleAcademicClassChange}
        academicClasses={academicClasses}
        selectedSubjectId={selectedSubjectId}
        onSubjectChange={(subjectId) => setSearchParams({ subjectId, chapterId: "All", board: "All", page: 1 })}
        subjects={subjects}
        selectedChapterId={selectedChapterId}
        onChapterChange={(chapterId) => setSearchParams({ chapterId, board: "All", page: 1 })}
        chapters={chapters}
        selectedBoard={selectedBoard}
        onBoardChange={(board) => setSearchParams({ board, page: 1 })}
        boardYears={boardYears}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={(difficulty) => setSearchParams({ difficulty, page: 1 })}
        selectedSort={selectedSort}
        onSortChange={(sort) => setSearchParams({ sort, page: 1 })}
      />

      {/* Questions List Cards & Table */}
      <RearrangeTable
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

      {/* Confirm Deletion Modal */}
      <DeleteRearrangeModal />
    </div>
  )
}
