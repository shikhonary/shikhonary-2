"use client"

import { useState } from "react"
import {
  useVerbTensesList,
  useVerbTenseStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-verb-tense"
import { useDeleteVerbTenseModalStore } from "../store/use-delete-verb-tense-modal-store"
import { VerbTenseListHeader } from "./verb-tense-list-header"
import { VerbTenseStatsCards } from "./verb-tense-stats-cards"
import { VerbTenseFilters } from "./verb-tense-filters"
import { VerbTenseTable } from "./verb-tense-table"
import { DeleteVerbTenseModal } from "./delete-verb-tense-modal"
import { useVerbTenseSearchParams } from "../hooks/use-verb-tense-search-params"

export function VerbTenseListView() {
  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState<string>("All")
  const { data: academicClasses = [] } = useAcademicClassesForSelection()

  const [
    {
      query: searchQuery,
      subjectId: selectedSubjectId,
      chapterId: selectedChapterId,
      difficulty: selectedDifficulty,
      sort: selectedSort,
      page: currentPage,
      limit,
    },
    setSearchParams,
  ] = useVerbTenseSearchParams()

  const handleAcademicClassChange = (classId: string) => {
    setSelectedAcademicClassId(classId)
    setSearchParams({
      subjectId: "All",
      chapterId: "All",
      page: 1,
    })
  }

  const handleSubjectChange = (subjectId: string) => {
    setSearchParams({
      subjectId,
      chapterId: "All",
      page: 1,
    })
  }

  const openDeleteModal = useDeleteVerbTenseModalStore((state) => state.openModal)
  const openBulkDeleteModal = useDeleteVerbTenseModalStore((state) => state.openBulkModal)

  // Query Verb Tenses list with search & filters
  const { data: verbTenseData, isLoading, isError } = useVerbTensesList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
    academicChapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
    difficulty: selectedDifficulty !== "All" ? selectedDifficulty : undefined,
    sort: selectedSort,
  })

  // Query Verb Tense stats
  const { data: statsData } = useVerbTenseStats(
    selectedSubjectId !== "All" || selectedChapterId !== "All"
      ? {
          subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
          academicChapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
        }
      : undefined
  )

  // Query subjects for dropdown filters
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedAcademicClassId !== "All" ? { academicClassId: selectedAcademicClassId } : undefined
  )

  // Query chapters for dropdown filters
  const { data: chapters = [] } = useChaptersForSelection(
    selectedSubjectId !== "All" ? { subjectId: selectedSubjectId } : undefined
  )

  const items = verbTenseData?.items ?? []
  const totalItems = verbTenseData?.totalItems ?? items.length
  const totalPages = verbTenseData?.totalPages ?? 1

  return (
    <div className="w-full">
      {/* Header */}
      <VerbTenseListHeader />

      {/* Stats Cards */}
      <VerbTenseStatsCards
        totalCount={statsData?.totalCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isLoading}
      />

      {/* Filters */}
      <VerbTenseFilters
        searchQuery={searchQuery}
        onSearchChange={(query) => setSearchParams({ query, page: 1 })}
        selectedAcademicClassId={selectedAcademicClassId}
        onAcademicClassChange={handleAcademicClassChange}
        academicClasses={academicClasses}
        selectedSubjectId={selectedSubjectId}
        onSubjectChange={handleSubjectChange}
        subjects={subjects}
        selectedChapterId={selectedChapterId}
        onChapterChange={(chapterId) => setSearchParams({ chapterId, page: 1 })}
        chapters={chapters}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={(difficulty) => setSearchParams({ difficulty, page: 1 })}
        selectedSort={selectedSort}
        onSortChange={(sort) => setSearchParams({ sort: sort as any, page: 1 })}
      />

      {/* Data Table */}
      <VerbTenseTable
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
      <DeleteVerbTenseModal />
    </div>
  )
}
