"use client"

import { useState } from "react"
import {
  useChangingSentenceList,
  useChangingSentenceStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
} from "../services/use-changing-sentence"
import { useChangingSentenceSearchParams } from "../hooks/use-changing-sentence-search-params"
import { useDeleteChangingSentenceModalStore } from "../store/use-delete-changing-sentence-modal-store"
import { ChangingSentenceListHeader } from "./changing-sentence-list-header"
import { ChangingSentenceStatsCards } from "./changing-sentence-stats-cards"
import { ChangingSentenceFilters } from "./changing-sentence-filters"
import { ChangingSentenceTable } from "./changing-sentence-table"
import { DeleteChangingSentenceModal } from "./delete-changing-sentence-modal"

export function ChangingSentenceListView() {
  const [params, setParams] = useChangingSentenceSearchParams()
  const { openSingleModal, openBulkModal } = useDeleteChangingSentenceModalStore()
  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState(params.classId || "All")

  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedAcademicClassId !== "All" ? { academicClassId: selectedAcademicClassId } : undefined
  )

  const { data: statsData, isLoading: isStatsLoading } = useChangingSentenceStats(
    params.subjectId !== "All" ? { subjectId: params.subjectId } : undefined
  )

  const { data: listData, isLoading: isListLoading, isError } = useChangingSentenceList({
    page: params.page,
    limit: params.limit,
    query: params.query || undefined,
    subjectId: params.subjectId !== "All" ? params.subjectId : undefined,
    difficulty: params.difficulty !== "All" ? params.difficulty : undefined,
    sort: params.sort !== "All" ? params.sort : undefined,
  })

  return (
    <div className="w-full space-y-6">
      <ChangingSentenceListHeader />

      <ChangingSentenceStatsCards
        totalCount={statsData?.totalCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isStatsLoading}
      />

      <ChangingSentenceFilters
        searchQuery={params.query}
        onSearchChange={(query) => setParams({ query, page: 1 })}
        selectedAcademicClassId={selectedAcademicClassId}
        onAcademicClassChange={(clsId) => {
          setSelectedAcademicClassId(clsId)
          setParams({ classId: clsId, subjectId: "All", page: 1 })
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

      <ChangingSentenceTable
        items={listData?.items ?? []}
        isLoading={isListLoading}
        isError={isError}
        currentPage={params.page}
        itemsPerPage={params.limit}
        totalItems={listData?.totalItems ?? 0}
        totalPages={listData?.totalPages ?? 1}
        onPageChange={(page) => setParams({ page })}
        onLimitChange={(limit) => setParams({ limit, page: 1 })}
        onDelete={(id, contentSnippet) => openSingleModal(id, contentSnippet)}
        onBulkDelete={(ids) => openBulkModal(ids)}
      />

      <DeleteChangingSentenceModal />
    </div>
  )
}
