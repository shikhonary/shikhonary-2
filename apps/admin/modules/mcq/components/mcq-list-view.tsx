"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { useMcqsList, useMcqStats, useAcademicClassesForSelection, useSubjectsForSelection, useChaptersForSelection } from "../services/use-mcq"
import { useDeleteMcqModalStore } from "../store/use-delete-mcq-modal-store"
import { McqListHeader } from "./mcq-list-header"
import { McqStatsCards } from "./mcq-stats-cards"
import { McqFilters } from "./mcq-filters"
import { McqTable } from "./mcq-table"
import { DeleteMcqModal } from "./delete-mcq-modal"
import { useMcqSearchParams } from "../hooks/use-mcq-search-params"

export function McqListView() {
  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState<string>("All")
  const { data: academicClasses = [] } = useAcademicClassesForSelection()

  const [
    {
      query: searchQuery,
      subjectId: selectedSubjectId,
      chapterId: selectedChapterId,
      board: selectedBoard,
      type: selectedType,
      sort: selectedSort,
      page: currentPage,
      limit,
    },
    setSearchParams,
  ] = useMcqSearchParams()

  const handleAcademicClassChange = (classId: string) => {
    setSelectedAcademicClassId(classId)
    setSearchParams({
      subjectId: "All",
      chapterId: "All",
      board: "All",
      page: 1,
    })
  }

  const openDeleteModal = useDeleteMcqModalStore((state) => state.openModal)
  const openBulkDeleteModal = useDeleteMcqModalStore((state) => state.openBulkModal)

  // Query MCQs list with search & filters
  const { data: mcqsData, isLoading, isError } = useMcqsList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
    chapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
    board: selectedBoard !== "All" ? selectedBoard : undefined,
    type: selectedType !== "All" ? selectedType : undefined,
    sort: selectedSort,
  })

  // Fetch Board + Year combinations for this subject / chapter if selected
  const { data: boardYearsData } = useQuery({
    ...trpc.mcq.boardYears.queryOptions({
      subjectId: selectedSubjectId,
      chapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
    }),
    enabled: selectedSubjectId !== "All",
  })
  const boardYears = boardYearsData ?? []

  // Query MCQ stats
  const { data: statsData } = useMcqStats(
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

  const items = mcqsData?.items ?? []
  const totalItems = mcqsData?.totalItems ?? items.length
  const totalPages = mcqsData?.totalPages ?? 1

  return (
    <div className="w-full">
      {/* Header */}
      <McqListHeader />

      {/* Stats Cards */}
      <McqStatsCards
        totalCount={statsData?.totalCount}
        activeCount={statsData?.activeCount}
        inactiveCount={statsData?.inactiveCount}
        mathCount={statsData?.mathCount}
        typeCounts={statsData?.typeCounts}
        isLoading={isLoading}
      />

      {/* Filters */}
      <McqFilters
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
        selectedType={selectedType}
        onTypeChange={(type) => setSearchParams({ type, page: 1 })}
        selectedSort={selectedSort}
        onSortChange={(sort) => setSearchParams({ sort: sort as any, page: 1 })}
      />

      {/* Data Table */}
      <McqTable
        items={items as any}
        isLoading={isLoading}
        isError={isError}
        onDelete={(id, question) => openDeleteModal(id, question)}
        onBulkDelete={(selectedIds) => openBulkDeleteModal(selectedIds)}
        currentPage={currentPage}
        itemsPerPage={limit}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={(page) => setSearchParams({ page })}
        onLimitChange={(newLimit) => setSearchParams({ limit: newLimit, page: 1 })}
      />

      {/* Confirm Delete Modal */}
      <DeleteMcqModal />
    </div>
  )
}
