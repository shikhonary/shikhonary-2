"use client"

import { useState } from "react"
import {
  useRightFormOfVerbList,
  useRightFormOfVerbStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
} from "../services/use-right-form-of-verb"
import { useRightFormOfVerbSearchParams } from "../hooks/use-right-form-of-verb-search-params"
import { useDeleteRightFormOfVerbModalStore } from "../store/use-delete-right-form-of-verb-modal-store"
import { RightFormOfVerbListHeader } from "./right-form-of-verb-list-header"
import { RightFormOfVerbStatsCards } from "./right-form-of-verb-stats-cards"
import { RightFormOfVerbFilters } from "./right-form-of-verb-filters"
import { RightFormOfVerbTable } from "./right-form-of-verb-table"
import { DeleteRightFormOfVerbModal } from "./delete-right-form-of-verb-modal"

export function RightFormOfVerbListView() {
  const [params, setParams] = useRightFormOfVerbSearchParams()
  const { openModal, openBulkModal } = useDeleteRightFormOfVerbModalStore()
  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState("All")

  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedAcademicClassId !== "All" ? { academicClassId: selectedAcademicClassId } : undefined
  )

  const { data: statsData, isLoading: isStatsLoading } = useRightFormOfVerbStats(
    params.subjectId !== "All" ? { subjectId: params.subjectId } : undefined
  )

  const { data: listData, isLoading: isListLoading, isError } = useRightFormOfVerbList({
    page: params.page,
    limit: params.limit,
    query: params.query || undefined,
    subjectId: params.subjectId !== "All" ? params.subjectId : undefined,
    difficulty: params.difficulty !== "All" ? params.difficulty : undefined,
    sort: params.sort !== "All" ? params.sort : undefined,
  })

  return (
    <div className="w-full space-y-6">
      <RightFormOfVerbListHeader />

      <RightFormOfVerbStatsCards
        totalCount={statsData?.totalCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isStatsLoading}
      />

      <RightFormOfVerbFilters
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

      <RightFormOfVerbTable
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

      <DeleteRightFormOfVerbModal />
    </div>
  )
}
