"use client"

import { useEssaysList, useEssayStats, useAcademicClassesForSelection, useSubjectsForSelection } from "../services/use-essay"
import { useDeleteEssayModalStore } from "../store/use-delete-essay-modal-store"
import { EssayListHeader } from "./essay-list-header"
import { EssayStatsCards } from "./essay-stats-cards"
import { EssayFilters } from "./essay-filters"
import { EssayTable } from "./essay-table"
import { DeleteEssayModal } from "./delete-essay-modal"
import { useEssaySearchParams } from "../hooks/use-essay-search-params"

export function EssayListView() {
  const [params, setParams] = useEssaySearchParams()
  const openDeleteModal = useDeleteEssayModalStore((state) => state.openModal)
  const openBulkDeleteModal = useDeleteEssayModalStore((state) => state.openBulkModal)

  // Query selection options
  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: subjects = [] } = useSubjectsForSelection(
    params.classId !== "All" ? { academicClassId: params.classId } : undefined
  )

  // Query Essays list with search & filters
  const { data: essaysData, isLoading, isError } = useEssaysList({
    limit: params.limit,
    page: params.page,
    query: params.query || undefined,
    subjectId: params.subjectId !== "All" ? params.subjectId : undefined,
    difficulty: params.difficulty !== "All" ? params.difficulty : undefined,
    sort: params.sort !== "All" ? params.sort : undefined,
  })

  // Query Essay stats
  const { data: statsData } = useEssayStats(
    params.subjectId !== "All"
      ? {
          subjectId: params.subjectId !== "All" ? params.subjectId : undefined,
        }
      : undefined
  )

  const items = essaysData?.items ?? []
  const totalItems = essaysData?.totalItems ?? items.length
  const totalPages = essaysData?.totalPages ?? 1

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <EssayListHeader />

      {/* Stats Cards */}
      <EssayStatsCards
        totalCount={statsData?.totalCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isLoading}
      />

      {/* Filters */}
      <EssayFilters
        searchQuery={params.query}
        onSearchChange={(query) => setParams({ query, page: 1 })}
        selectedAcademicClassId={params.classId}
        onAcademicClassChange={(classId) =>
          setParams({ classId, subjectId: "All", page: 1 })
        }
        academicClasses={academicClasses}
        selectedSubjectId={params.subjectId}
        onSubjectChange={(subjectId) => setParams({ subjectId, page: 1 })}
        subjects={subjects}
        selectedDifficulty={params.difficulty}
        onDifficultyChange={(difficulty) => setParams({ difficulty, page: 1 })}
        selectedSort={params.sort}
        onSortChange={(sort) => setParams({ sort: sort as any, page: 1 })}
      />

      {/* Data Table */}
      <EssayTable
        items={items as any}
        isLoading={isLoading}
        isError={isError}
        onDelete={(id, titleSnippet) => openDeleteModal(id, titleSnippet)}
        onBulkDelete={(ids) => openBulkDeleteModal(ids)}
        currentPage={params.page}
        itemsPerPage={params.limit}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={(page) => setParams({ page })}
        onLimitChange={(newLimit) => setParams({ limit: newLimit, page: 1 })}
      />

      {/* Delete Confirmation Modal */}
      <DeleteEssayModal />
    </div>
  )
}
