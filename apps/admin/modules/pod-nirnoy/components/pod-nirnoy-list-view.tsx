"use client"

import { useState } from "react"
import {
  usePodNirnoysList,
  usePodNirnoyStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-pod-nirnoy"
import { useDeletePodNirnoyModalStore } from "../store/use-delete-pod-nirnoy-modal-store"
import { PodNirnoyListHeader } from "./pod-nirnoy-list-header"
import { PodNirnoyStatsCards } from "./pod-nirnoy-stats-cards"
import { PodNirnoyFilters } from "./pod-nirnoy-filters"
import { PodNirnoyTable } from "./pod-nirnoy-table"
import { DeletePodNirnoyModal } from "./delete-pod-nirnoy-modal"
import { usePodNirnoySearchParams } from "../hooks/use-pod-nirnoy-search-params"

export function PodNirnoyListView() {
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
  ] = usePodNirnoySearchParams()

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

  const openDeleteModal = useDeletePodNirnoyModalStore((state) => state.openModal)
  const openBulkDeleteModal = useDeletePodNirnoyModalStore((state) => state.openBulkModal)

  // Query Pod Nirnoys list with search & filters
  const { data: podNirnoyData, isLoading, isError } = usePodNirnoysList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
    academicChapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
    difficulty: selectedDifficulty !== "All" ? selectedDifficulty : undefined,
    sort: selectedSort,
  })

  // Query Pod Nirnoy stats
  const { data: statsData } = usePodNirnoyStats(
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

  const items = podNirnoyData?.items ?? []
  const totalItems = podNirnoyData?.totalItems ?? items.length
  const totalPages = podNirnoyData?.totalPages ?? 1

  return (
    <div className="w-full">
      {/* Header */}
      <PodNirnoyListHeader />

      {/* Stats Cards */}
      <PodNirnoyStatsCards
        totalCount={statsData?.totalCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isLoading}
      />

      {/* Filters */}
      <PodNirnoyFilters
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
      <PodNirnoyTable
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
      <DeletePodNirnoyModal />
    </div>
  )
}
