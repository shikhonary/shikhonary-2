"use client"

import { useState } from "react"
import {
  useSubstitutionTablesList,
  useSubstitutionTablesStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
} from "../services/use-substitution-tables"
import { useSubstitutionTablesSearchParams } from "../hooks/use-substitution-tables-search-params"
import { useDeleteSubstitutionTableModalStore } from "../store/use-delete-substitution-table-modal-store"
import { SubstitutionTablesListHeader } from "./substitution-tables-list-header"
import { SubstitutionTablesStatsCards } from "./substitution-tables-stats-cards"
import { SubstitutionTablesFilters } from "./substitution-tables-filters"
import { SubstitutionTablesTable } from "./substitution-tables-table"
import { DeleteSubstitutionTableModal } from "./delete-substitution-table-modal"

export function SubstitutionTablesListView() {
  const [params, setParams] = useSubstitutionTablesSearchParams()
  const { openModal, openBulkModal } = useDeleteSubstitutionTableModalStore()
  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState("All")

  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedAcademicClassId !== "All" ? { academicClassId: selectedAcademicClassId } : undefined
  )

  const { data: statsData, isLoading: isStatsLoading } = useSubstitutionTablesStats(
    params.subjectId !== "All" ? { subjectId: params.subjectId } : undefined
  )

  const { data: listData, isLoading: isListLoading, isError } = useSubstitutionTablesList({
    page: params.page,
    limit: params.limit,
    query: params.query || undefined,
    subjectId: params.subjectId !== "All" ? params.subjectId : undefined,
    difficulty: params.difficulty !== "All" ? params.difficulty : undefined,
    sort: params.sort !== "All" ? params.sort : undefined,
  })

  return (
    <div className="w-full space-y-6">
      <SubstitutionTablesListHeader />

      <SubstitutionTablesStatsCards
        totalCount={statsData?.totalCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isStatsLoading}
      />

      <SubstitutionTablesFilters
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

      <SubstitutionTablesTable
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

      <DeleteSubstitutionTableModal />
    </div>
  )
}
