"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { useCqsList } from "../services/use-cq"
import { useAcademicClassesForSelection } from "@/modules/academic-class/services/use-academic-class"
import { useSubjectsForSelection } from "@/modules/subject/services/use-subject"
import { useChaptersForSelection } from "@/modules/chapter/services/use-chapter"
import { useDeleteCqModalStore } from "../store/use-delete-cq-modal-store"
import { CqListHeader } from "./cq-list-header"
import { CqFilters } from "./cq-filters"
import { CqTable } from "./cq-table"
import { DeleteCqModal } from "./delete-cq-modal"
import { useCqSearchParams } from "../hooks/use-cq-search-params"

export function CqListView() {
  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState<string>("All")
  const { data: academicClasses = [] } = useAcademicClassesForSelection()

  const [
    {
      query: searchQuery,
      subjectId: selectedSubjectId,
      chapterId: selectedChapterId,
      board: selectedBoard,
      sort: selectedSort,
      page: currentPage,
      limit,
    },
    setSearchParams,
  ] = useCqSearchParams()

  const openDeleteModal = useDeleteCqModalStore((state) => state.openModal)
  const openBulkDeleteModal = useDeleteCqModalStore((state) => state.openBulkModal)

  // Query CQs list with search & filters
  const { data: cqsData, isLoading, isError } = useCqsList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
    chapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
    board: selectedBoard !== "All" ? selectedBoard : undefined,
    sort: selectedSort,
  })

  // Fetch Board + Year combinations for this subject / chapter if selected
  const { data: boardYearsData } = useQuery({
    ...trpc.cq.boardYears.queryOptions({
      subjectId: selectedSubjectId,
      chapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
    }),
    enabled: selectedSubjectId !== "All",
  })
  const boardYears = boardYearsData ?? []

  // Query subjects & chapters for dropdown filters
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedAcademicClassId !== "All" ? { academicClassId: selectedAcademicClassId } : undefined
  )
  const { data: chapters = [] } = useChaptersForSelection(
    selectedSubjectId !== "All" ? { subjectId: selectedSubjectId } : undefined
  )

  const items = cqsData?.items ?? []
  const totalItems = cqsData?.totalItems ?? items.length
  const totalPages = cqsData?.totalPages ?? 1

  return (
    <div className="w-full">
      {/* Header */}
      <CqListHeader />

      {/* Filters */}
      <CqFilters
        searchQuery={searchQuery}
        onSearchChange={(query) => setSearchParams({ query, page: 1 })}
        selectedAcademicClassId={selectedAcademicClassId}
        onAcademicClassChange={setSelectedAcademicClassId}
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
        selectedSort={selectedSort}
        onSortChange={(sort) => setSearchParams({ sort: sort as any, page: 1 })}
      />

      {/* Data Table */}
      <CqTable
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
      <DeleteCqModal />
    </div>
  )
}
