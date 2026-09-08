"use client"

import { useState } from "react"
import {
  useShortCompositionsList,
  useShortCompositionStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
} from "../services/use-short-composition"
import { useDeleteShortCompositionModalStore } from "../store/use-delete-short-composition-modal-store"
import { ShortCompositionListHeader } from "./short-composition-list-header"
import { ShortCompositionStatsCards } from "./short-composition-stats-cards"
import { ShortCompositionFilters } from "./short-composition-filters"
import { ShortCompositionTable } from "./short-composition-table"
import { DeleteShortCompositionModal } from "./delete-short-composition-modal"
import { useShortCompositionSearchParams } from "../hooks/use-short-composition-search-params"

export function ShortCompositionListView() {
  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState<string>("All")
  const { data: academicClasses = [] } = useAcademicClassesForSelection()

  const [
    {
      query: searchQuery,
      subjectId: selectedSubjectId,
      difficulty: selectedDifficulty,
      sort: selectedSort,
      page: currentPage,
      limit,
    },
    setSearchParams,
  ] = useShortCompositionSearchParams()

  const handleAcademicClassChange = (classId: string) => {
    setSelectedAcademicClassId(classId)
    setSearchParams({
      subjectId: "All",
      page: 1,
    })
  }

  const openDeleteModal = useDeleteShortCompositionModalStore((state) => state.openModal)
  const openBulkDeleteModal = useDeleteShortCompositionModalStore((state) => state.openBulkModal)

  // Query Short Compositions list with search & filters
  const { data: shortCompositionsData, isLoading, isError } = useShortCompositionsList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
    difficulty: selectedDifficulty !== "All" ? selectedDifficulty : undefined,
    sort: selectedSort,
  })

  // Query stats
  const { data: statsData } = useShortCompositionStats(
    selectedSubjectId !== "All"
      ? {
          subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
        }
      : undefined
  )

  // Query subjects for dropdown filters
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedAcademicClassId !== "All" ? { academicClassId: selectedAcademicClassId } : undefined
  )

  const items = shortCompositionsData?.items ?? []
  const totalItems = shortCompositionsData?.pagination?.totalItems ?? items.length
  const totalPages = shortCompositionsData?.pagination?.totalPages ?? 1

  return (
    <div className="w-full">
      {/* Header */}
      <ShortCompositionListHeader />

      {/* Stats Cards */}
      <ShortCompositionStatsCards
        totalCount={statsData?.total}
        difficultyCounts={{
          EASY: statsData?.easy ?? 0,
          MEDIUM: statsData?.medium ?? 0,
          HARD: statsData?.hard ?? 0,
        }}
        isLoading={isLoading}
      />

      {/* Filters */}
      <ShortCompositionFilters
        searchQuery={searchQuery}
        onSearchChange={(query) => setSearchParams({ query, page: 1 })}
        selectedAcademicClassId={selectedAcademicClassId}
        onAcademicClassChange={handleAcademicClassChange}
        academicClasses={academicClasses}
        selectedSubjectId={selectedSubjectId}
        onSubjectChange={(subjectId) => setSearchParams({ subjectId, page: 1 })}
        subjects={subjects}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={(difficulty) => setSearchParams({ difficulty, page: 1 })}
        selectedSort={selectedSort}
        onSortChange={(sort) => setSearchParams({ sort: sort as any, page: 1 })}
      />

      {/* Data Table */}
      <ShortCompositionTable
        items={items as any}
        isLoading={isLoading}
        isError={isError}
        onDelete={(id, titleSnippet) => openDeleteModal(id, titleSnippet)}
        onBulkDelete={(ids) => openBulkDeleteModal(ids)}
        currentPage={currentPage}
        itemsPerPage={limit}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={(page) => setSearchParams({ page })}
        onLimitChange={(newLimit) => setSearchParams({ limit: newLimit, page: 1 })}
      />

      {/* Delete Confirmation Modal */}
      <DeleteShortCompositionModal />
    </div>
  )
}
