"use client"

import { useState } from "react"
import {
  usePunctuationList,
  usePunctuationStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
} from "../services/use-punctuation"
import { usePunctuationSearchParams } from "../hooks/use-punctuation-search-params"
import { useDeletePunctuationModalStore } from "../store/use-delete-punctuation-modal-store"
import { PunctuationListHeader } from "./punctuation-list-header"
import { PunctuationStatsCards } from "./punctuation-stats-cards"
import { PunctuationFilters } from "./punctuation-filters"
import { PunctuationTable } from "./punctuation-table"
import { DeletePunctuationModal } from "./delete-punctuation-modal"

export function PunctuationListView() {
  const [params, setParams] = usePunctuationSearchParams()
  const { openModal, openBulkModal } = useDeletePunctuationModalStore()
  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState("All")

  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedAcademicClassId !== "All" ? { academicClassId: selectedAcademicClassId } : undefined
  )

  const { data: statsData, isLoading: isStatsLoading } = usePunctuationStats(
    params.subjectId !== "All" ? { subjectId: params.subjectId } : undefined
  )

  const { data: listData, isLoading: isListLoading, isError } = usePunctuationList({
    page: params.page,
    limit: params.limit,
    query: params.query || undefined,
    subjectId: params.subjectId !== "All" ? params.subjectId : undefined,
    difficulty: params.difficulty !== "All" ? params.difficulty : undefined,
    sort: params.sort !== "All" ? params.sort : undefined,
  })

  return (
    <div className="w-full space-y-6">
      <PunctuationListHeader />

      <PunctuationStatsCards
        totalCount={statsData?.total}
        difficultyCounts={{
          EASY: statsData?.easy ?? 0,
          MEDIUM: statsData?.medium ?? 0,
          HARD: statsData?.hard ?? 0,
        }}
        isLoading={isStatsLoading}
      />

      <PunctuationFilters
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

      <PunctuationTable
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

      <DeletePunctuationModal />
    </div>
  )
}
