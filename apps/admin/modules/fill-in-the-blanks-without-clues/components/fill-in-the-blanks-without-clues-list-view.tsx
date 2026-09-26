"use client"

import { useState } from "react"
import {
  useFillInTheBlanksWithoutCluesList,
  useFillInTheBlanksWithoutCluesStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
} from "../services/use-fill-in-the-blanks-without-clues"
import { useFillInTheBlanksWithoutCluesSearchParams } from "../hooks/use-fill-in-the-blanks-without-clues-search-params"
import { useDeleteFillInTheBlanksWithoutCluesModalStore } from "../store/use-delete-fill-in-the-blanks-without-clues-modal-store"
import { FillInTheBlanksWithoutCluesListHeader } from "./fill-in-the-blanks-without-clues-list-header"
import { FillInTheBlanksWithoutCluesStatsCards } from "./fill-in-the-blanks-without-clues-stats-cards"
import { FillInTheBlanksWithoutCluesFilters } from "./fill-in-the-blanks-without-clues-filters"
import { FillInTheBlanksWithoutCluesTable } from "./fill-in-the-blanks-without-clues-table"
import { DeleteFillInTheBlanksWithoutCluesModal } from "./delete-fill-in-the-blanks-without-clues-modal"

export function FillInTheBlanksWithoutCluesListView() {
  const [params, setParams] = useFillInTheBlanksWithoutCluesSearchParams()
  const { openModal, openBulkModal } = useDeleteFillInTheBlanksWithoutCluesModalStore()
  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState("All")

  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedAcademicClassId !== "All" ? { academicClassId: selectedAcademicClassId } : undefined
  )

  const { data: statsData, isLoading: isStatsLoading } = useFillInTheBlanksWithoutCluesStats(
    params.subjectId !== "All" ? { subjectId: params.subjectId } : undefined
  )

  const { data: listData, isLoading: isListLoading, isError } = useFillInTheBlanksWithoutCluesList({
    page: params.page,
    limit: params.limit,
    query: params.query || undefined,
    subjectId: params.subjectId !== "All" ? params.subjectId : undefined,
    difficulty: params.difficulty !== "All" ? params.difficulty : undefined,
    sort: params.sort !== "All" ? params.sort : undefined,
  })

  return (
    <div className="w-full space-y-6">
      <FillInTheBlanksWithoutCluesListHeader />

      <FillInTheBlanksWithoutCluesStatsCards
        totalCount={statsData?.totalCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isStatsLoading}
      />

      <FillInTheBlanksWithoutCluesFilters
        searchQuery={params.query}
        onSearchChange={(query) => setParams({ query, page: 1 })}
        selectedAcademicClassId={selectedAcademicClassId}
        onAcademicClassChange={(clsId) => {
          setSelectedAcademicClassId(clsId)
          setParams({ subjectId: "All", page: 1 })
        }}
        academicClasses={academicClasses}
        selectedSubjectId={params.subjectId}
        onSubjectChange={(subjectId) => setParams({ subjectId, page: 1 })}
        subjects={subjects}
        selectedDifficulty={params.difficulty}
        onDifficultyChange={(difficulty) => setParams({ difficulty, page: 1 })}
        selectedSort={params.sort}
        onSortChange={(sort) => setParams({ sort: sort as any, page: 1 })}
      />

      <FillInTheBlanksWithoutCluesTable
        items={listData?.items ?? []}
        isLoading={isListLoading}
        isError={isError}
        currentPage={params.page}
        itemsPerPage={params.limit}
        totalItems={listData?.totalItems ?? 0}
        totalPages={listData?.totalPages ?? 1}
        onPageChange={(page) => setParams({ page })}
        onLimitChange={(limit) => setParams({ limit, page: 1 })}
        onDelete={(id, contentSnippet) => openModal(id, contentSnippet)}
        onBulkDelete={(ids) => openBulkModal(ids)}
      />

      <DeleteFillInTheBlanksWithoutCluesModal />
    </div>
  )
}
