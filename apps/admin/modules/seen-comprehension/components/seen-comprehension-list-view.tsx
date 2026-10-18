"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import {
  useSeenComprehensionsList,
  useSeenComprehensionStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-seen-comprehension"
import { useDeleteSeenComprehensionModalStore } from "../store/use-delete-seen-comprehension-modal-store"
import { SeenComprehensionListHeader } from "./seen-comprehension-list-header"
import { SeenComprehensionStatsCards } from "./seen-comprehension-stats-cards"
import { SeenComprehensionFilters } from "./seen-comprehension-filters"
import { SeenComprehensionTable } from "./seen-comprehension-table"
import { DeleteSeenComprehensionModal } from "./delete-seen-comprehension-modal"
import {
  useSeenComprehensionSearchParams,
  type SeenComprehensionSortOption,
} from "../hooks/use-seen-comprehension-search-params"

export function SeenComprehensionListView() {
  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState<string>("All")
  const { data: academicClasses = [] } = useAcademicClassesForSelection()

  const [
    {
      query: searchQuery,
      subjectId: selectedSubjectId,
      chapterId: selectedChapterId,
      comprehensionType: selectedComprehensionType,
      board: selectedBoard,
      difficulty: selectedDifficulty,
      sort: selectedSort,
      page: currentPage,
      limit,
    },
    setSearchParams,
  ] = useSeenComprehensionSearchParams()

  const handleAcademicClassChange = (classId: string) => {
    setSelectedAcademicClassId(classId)
    setSearchParams({
      subjectId: "All",
      chapterId: "All",
      board: "All",
      page: 1,
    })
  }

  const openDeleteModal = useDeleteSeenComprehensionModalStore((state) => state.openModal)
  const openBulkDeleteModal = useDeleteSeenComprehensionModalStore((state) => state.openBulkModal)

  // Query Seen Comprehensions list with search & filters
  const { data: listData, isLoading, isError } = useSeenComprehensionsList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
    chapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
    comprehensionType: selectedComprehensionType !== "All" ? selectedComprehensionType : undefined,
    board: selectedBoard !== "All" ? selectedBoard : undefined,
    difficulty: selectedDifficulty !== "All" ? selectedDifficulty : undefined,
    sort: selectedSort,
  })

  // Fetch Board + Year combinations for this subject / chapter if selected
  const { data: boardYearsData } = useQuery({
    ...trpc.seenComprehension.boardYears.queryOptions({
      subjectId: selectedSubjectId,
      chapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
      comprehensionType: selectedComprehensionType !== "All" ? selectedComprehensionType : undefined,
    }),
    enabled: selectedSubjectId !== "All",
  })
  const boardYears = boardYearsData ?? []

  // Query stats
  const { data: statsData } = useSeenComprehensionStats(
    selectedSubjectId !== "All" || selectedChapterId !== "All" || selectedComprehensionType !== "All"
      ? {
          subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
          chapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
          comprehensionType: selectedComprehensionType !== "All" ? selectedComprehensionType : undefined,
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

  const items = listData?.items ?? []
  const totalItems = listData?.totalItems ?? items.length
  const totalPages = listData?.totalPages ?? 1

  return (
    <div className="w-full">
      {/* Header */}
      <SeenComprehensionListHeader />

      {/* Stats Cards */}
      <SeenComprehensionStatsCards
        total={statsData?.total}
        active={statsData?.active}
        inactive={statsData?.inactive}
        byType={statsData?.byType}
        byDifficulty={statsData?.byDifficulty}
      />

      {/* Filters */}
      <SeenComprehensionFilters
        searchQuery={searchQuery}
        onSearchChange={(query) => setSearchParams({ query, page: 1 })}
        selectedAcademicClassId={selectedAcademicClassId}
        onAcademicClassChange={handleAcademicClassChange}
        academicClasses={academicClasses}
        selectedSubjectId={selectedSubjectId}
        onSubjectChange={(subjectId) => setSearchParams({ subjectId, page: 1 })}
        subjects={subjects}
        selectedChapterId={selectedChapterId}
        onChapterChange={(chapterId) => setSearchParams({ chapterId, page: 1 })}
        chapters={chapters}
        selectedComprehensionType={selectedComprehensionType}
        onComprehensionTypeChange={(comprehensionType) => setSearchParams({ comprehensionType, page: 1 })}
        selectedBoard={selectedBoard}
        onBoardChange={(board) => setSearchParams({ board, page: 1 })}
        boardYears={boardYears}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={(difficulty) => setSearchParams({ difficulty, page: 1 })}
        selectedSort={selectedSort}
        onSortChange={(sort) => setSearchParams({ sort: sort as SeenComprehensionSortOption, page: 1 })}
      />

      {/* Table */}
      <SeenComprehensionTable
        items={items as any}
        isLoading={isLoading}
        isError={isError}
        onDelete={openDeleteModal}
        onBulkDelete={openBulkDeleteModal}
        currentPage={currentPage}
        itemsPerPage={limit}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={(page) => setSearchParams({ page })}
        onLimitChange={(newLimit) => setSearchParams({ limit: newLimit, page: 1 })}
      />

      {/* Delete Confirmation Modal */}
      <DeleteSeenComprehensionModal />
    </div>
  )
}
