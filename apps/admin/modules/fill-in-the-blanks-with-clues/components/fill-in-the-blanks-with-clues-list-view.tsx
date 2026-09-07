"use client"

import { useState } from "react"
import {
  useFillInTheBlanksWithCluesList,
  useFillInTheBlanksWithCluesStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
} from "../services/use-fill-in-the-blanks-with-clues"
import { useFillInTheBlanksWithCluesSearchParams } from "../hooks/use-fill-in-the-blanks-with-clues-search-params"
import { useDeleteFillInTheBlanksWithCluesModalStore } from "../store/use-delete-fill-in-the-blanks-with-clues-modal-store"
import { FillInTheBlanksWithCluesListHeader } from "./fill-in-the-blanks-with-clues-list-header"
import { FillInTheBlanksWithCluesStatsCards } from "./fill-in-the-blanks-with-clues-stats-cards"
import { FillInTheBlanksWithCluesFilters } from "./fill-in-the-blanks-with-clues-filters"
import { FillInTheBlanksWithCluesTable } from "./fill-in-the-blanks-with-clues-table"
import { DeleteFillInTheBlanksWithCluesModal } from "./delete-fill-in-the-blanks-with-clues-modal"

export function FillInTheBlanksWithCluesListView() {
  const [params, setParams] = useFillInTheBlanksWithCluesSearchParams()
  const { openModal, openBulkModal } = useDeleteFillInTheBlanksWithCluesModalStore()
  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState("All")

  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedAcademicClassId !== "All" ? { academicClassId: selectedAcademicClassId } : undefined
  )

  const { data: statsData, isLoading: isStatsLoading } = useFillInTheBlanksWithCluesStats(
    params.subjectId !== "All" ? { subjectId: params.subjectId } : undefined
  )

  const { data: listData, isLoading: isListLoading, isError } = useFillInTheBlanksWithCluesList({
    page: params.page,
    limit: params.limit,
    query: params.query || undefined,
    subjectId: params.subjectId !== "All" ? params.subjectId : undefined,
    difficulty: params.difficulty !== "All" ? params.difficulty : undefined,
    sort: params.sort !== "All" ? params.sort : undefined,
  })

  return (
    <div className="w-full space-y-6">
      <FillInTheBlanksWithCluesListHeader />

      <FillInTheBlanksWithCluesStatsCards
        totalCount={statsData?.totalCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isStatsLoading}
      />

      <FillInTheBlanksWithCluesFilters
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

      <FillInTheBlanksWithCluesTable
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

      <DeleteFillInTheBlanksWithCluesModal />
    </div>
  )
}
