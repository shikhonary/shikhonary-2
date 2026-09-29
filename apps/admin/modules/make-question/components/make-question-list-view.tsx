"use client"

import { useState } from "react"
import {
  useMakeQuestionList,
  useMakeQuestionStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
  useEssencesForSelection,
} from "../services/use-make-question"
import { useDeleteMakeQuestionModalStore } from "../store/use-delete-make-question-modal-store"
import { MakeQuestionListHeader } from "./make-question-list-header"
import { MakeQuestionStatsCards } from "./make-question-stats-cards"
import { MakeQuestionFilters } from "./make-question-filters"
import { MakeQuestionTable } from "./make-question-table"
import { DeleteMakeQuestionModal } from "./delete-make-question-modal"
import { useMakeQuestionSearchParams } from "../hooks/use-make-question-search-params"

export function MakeQuestionListView() {
  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState<string>("All")
  const { data: academicClasses = [] } = useAcademicClassesForSelection()

  const [
    {
      query: searchQuery,
      subjectId: selectedSubjectId,
      chapterId: selectedChapterId,
      essenceId: selectedEssenceId,
      difficulty: selectedDifficulty,
      sort: selectedSort,
      page: currentPage,
      limit,
    },
    setSearchParams,
  ] = useMakeQuestionSearchParams()

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
      essenceId: "All",
      page: 1,
    })
  }

  const openDeleteModal = useDeleteMakeQuestionModalStore((state) => state.openModal)
  const openBulkDeleteModal = useDeleteMakeQuestionModalStore((state) => state.openBulkModal)

  // Query MakeQuestion list
  const { data: questionsData, isLoading, isError } = useMakeQuestionList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
    chapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
    academicChapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
    essenceId: selectedEssenceId !== "All" ? selectedEssenceId : undefined,
    difficulty: selectedDifficulty !== "All" ? selectedDifficulty : undefined,
    sort: selectedSort,
  })

  // Query Stats
  const { data: statsData } = useMakeQuestionStats(
    selectedSubjectId !== "All" || selectedChapterId !== "All" || selectedEssenceId !== "All"
      ? {
          subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
          chapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
          academicChapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
          essenceId: selectedEssenceId !== "All" ? selectedEssenceId : undefined,
        }
      : undefined
  )

  // Subjects dropdown
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedAcademicClassId !== "All" ? { academicClassId: selectedAcademicClassId } : undefined
  )

  // Chapters dropdown
  const { data: chapters = [] } = useChaptersForSelection(
    selectedSubjectId !== "All" ? { subjectId: selectedSubjectId } : undefined
  )

  // Essences dropdown
  const { data: essences = [] } = useEssencesForSelection(
    selectedSubjectId !== "All" ? { subjectId: selectedSubjectId } : undefined
  )

  const items = questionsData?.items ?? []
  const totalItems = questionsData?.totalItems ?? items.length
  const totalPages = questionsData?.totalPages ?? 1

  return (
    <div className="w-full">
      {/* Header */}
      <MakeQuestionListHeader />

      {/* Stats Cards */}
      <MakeQuestionStatsCards
        totalCount={statsData?.totalCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isLoading}
      />

      {/* Filters */}
      <MakeQuestionFilters
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
        selectedEssenceId={selectedEssenceId}
        onEssenceChange={(essenceId) => setSearchParams({ essenceId, page: 1 })}
        essences={essences}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={(difficulty) => setSearchParams({ difficulty, page: 1 })}
        selectedSort={selectedSort}
        onSortChange={(sort) => setSearchParams({ sort: sort as any, page: 1 })}
      />

      {/* Table */}
      <MakeQuestionTable
        items={items as any}
        isLoading={isLoading}
        isError={isError}
        onDelete={(id, statementSnippet) => openDeleteModal(id, statementSnippet)}
        onBulkDelete={(ids) => openBulkDeleteModal(ids)}
        currentPage={currentPage}
        itemsPerPage={limit}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={(page) => setSearchParams({ page })}
        onLimitChange={(newLimit) => setSearchParams({ limit: newLimit, page: 1 })}
      />

      {/* Delete Modal */}
      <DeleteMakeQuestionModal />
    </div>
  )
}
