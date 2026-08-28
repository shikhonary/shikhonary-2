"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import {
  useShortAnswersList,
  useShortAnswerStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-short-answer"
import { ShortAnswerListHeader } from "./short-answer-list-header"
import { ShortAnswerStatsCards } from "./short-answer-stats-cards"
import { ShortAnswerFilters } from "./short-answer-filters"
import { ShortAnswerTable } from "./short-answer-table"
import { DeleteShortAnswerModal } from "./delete-short-answer-modal"
import { useShortAnswerSearchParams } from "../hooks/use-short-answer-search-params"
import { useDeleteShortAnswerModalStore } from "../store/use-delete-short-answer-modal-store"

export function ShortAnswerListView() {
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
  ] = useShortAnswerSearchParams()

  const handleAcademicClassChange = (classId: string) => {
    setSelectedAcademicClassId(classId)
    setSearchParams({
      subjectId: "All",
      chapterId: "All",
      board: "All",
      page: 1,
    })
  }

  const openDeleteModal = useDeleteShortAnswerModalStore((state) => state.openModal)
  const openBulkDeleteModal = useDeleteShortAnswerModalStore((state) => state.openBulkModal)

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

  const { data: shortAnswersData, isLoading, isError } = useShortAnswersList({
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
  const { data: boardYearsData } = useQuery({
    ...trpc.shortAnswer.boardYears.queryOptions({
      subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
      chapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
    }),
    enabled: selectedSubjectId !== "All",
  })
  const boardYears = boardYearsData ?? []

  // Query stats
  const { data: statsData } = useShortAnswerStats(
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

  const items = shortAnswersData?.items ?? []
  const totalItems = shortAnswersData?.totalItems ?? items.length
  const totalPages = shortAnswersData?.totalPages ?? 1

  return (
    <div className="w-full">
      {/* Page Header */}
      <ShortAnswerListHeader />

      {/* Summary Counts Cards */}
      <ShortAnswerStatsCards
        totalCount={statsData?.totalCount}
        activeCount={statsData?.activeCount}
        inactiveCount={statsData?.inactiveCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isLoading}
      />

      {/* Filters Form */}
      <ShortAnswerFilters
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
      <ShortAnswerTable
        items={items as any}
        isLoading={isLoading}
        isError={isError}
        onDelete={(id, questionSnippet) => openDeleteModal(id, questionSnippet)}
        onBulkDelete={(selectedIds) => openBulkDeleteModal(selectedIds)}
        currentPage={currentPage}
        itemsPerPage={limit}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={(page) => setSearchParams({ page })}
        onLimitChange={(newLimit) => setSearchParams({ limit: newLimit, page: 1 })}
      />

      {/* Confirm Deletion Drawer Dialog */}
      <DeleteShortAnswerModal />
    </div>
  )
}
