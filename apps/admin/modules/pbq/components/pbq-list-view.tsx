"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { usePbqsList, usePbqStats, useAcademicClassesForSelection, useSubjectsForSelection, useChaptersForSelection } from "../services/use-pbq"
import { useDeletePbqModalStore } from "../store/use-delete-pbq-modal-store"
import { PbqListHeader } from "./pbq-list-header"
import { PbqStatsCards } from "./pbq-stats-cards"
import { PbqFilters } from "./pbq-filters"
import { PbqTable } from "./pbq-table"
import { DeletePbqModal } from "./delete-pbq-modal"
import { usePbqSearchParams } from "../hooks/use-pbq-search-params"

export function PbqListView() {
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
  ] = usePbqSearchParams()

  const handleAcademicClassChange = (classId: string) => {
    setSelectedAcademicClassId(classId)
    setSearchParams({
      subjectId: "All",
      chapterId: "All",
      board: "All",
      page: 1,
    })
  }

  const openDeleteModal = useDeletePbqModalStore((state) => state.openModal)
  const openBulkDeleteModal = useDeletePbqModalStore((state) => state.openBulkModal)

  // Query PBQs list with search & filters
  const { data: pbqsData, isLoading, isError } = usePbqsList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
    chapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
    board: selectedBoard !== "All" ? selectedBoard : undefined,
    difficulty: selectedDifficulty !== "All" ? selectedDifficulty : undefined,
    sort: selectedSort,
  })

  // Fetch Board + Year combinations for this subject / chapter if selected
  const { data: boardYearsData } = useQuery({
    ...trpc.pbq.boardYears.queryOptions({
      subjectId: selectedSubjectId,
      chapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
    }),
    enabled: selectedSubjectId !== "All",
  })
  const boardYears = boardYearsData ?? []

  // Query PBQ stats
  const { data: statsData } = usePbqStats(
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

  const items = pbqsData?.items ?? []
  const totalItems = pbqsData?.totalItems ?? items.length
  const totalPages = pbqsData?.totalPages ?? 1

  return (
    <div className="w-full">
      {/* Header */}
      <PbqListHeader />

      {/* Stats Cards */}
      <PbqStatsCards
        totalCount={statsData?.totalCount}
        activeCount={statsData?.activeCount}
        inactiveCount={statsData?.inactiveCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isLoading}
      />

      {/* Filters */}
      <PbqFilters
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
        onSortChange={(sort) => setSearchParams({ sort: sort as any, page: 1 })}
      />

      {/* Data Table */}
      <PbqTable
        items={items as any}
        isLoading={isLoading}
        isError={isError}
        onDelete={(id, contextSnippet) => openDeleteModal(id, contextSnippet)}
        onBulkDelete={(selectedIds) => openBulkDeleteModal(selectedIds)}
        currentPage={currentPage}
        itemsPerPage={limit}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={(page) => setSearchParams({ page })}
        onLimitChange={(newLimit) => setSearchParams({ limit: newLimit, page: 1 })}
      />

      {/* Confirm Delete Modal */}
      <DeletePbqModal />
    </div>
  )
}
