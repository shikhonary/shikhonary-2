"use client"

import { useDescriptiveQuestionSearchParams, type DescriptiveQuestionSortOption } from "../hooks/use-descriptive-question-search-params"
import {
  useDescriptiveQuestionsList,
  useDescriptiveQuestionStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-descriptive-question"
import { useDeleteDescriptiveQuestionModalStore } from "../store/use-delete-descriptive-question-modal-store"
import { DescriptiveQuestionListHeader } from "./descriptive-question-list-header"
import { DescriptiveQuestionStatsCards } from "./descriptive-question-stats-cards"
import { DescriptiveQuestionFilters } from "./descriptive-question-filters"
import { DescriptiveQuestionTable } from "./descriptive-question-table"
import { DeleteDescriptiveQuestionModal } from "./delete-descriptive-question-modal"

export function DescriptiveQuestionListView() {
  const [params, setParams] = useDescriptiveQuestionSearchParams()
  const { openModal, openBulkModal } = useDeleteDescriptiveQuestionModalStore()

  // Queries
  const { data: classes = [] } = useAcademicClassesForSelection()
  const { data: subjects = [] } = useSubjectsForSelection({
    academicClassId: params.classId === "All" ? undefined : params.classId,
  })
  const { data: chapters = [] } = useChaptersForSelection({
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
  })

  const { data: statsData, isLoading: isStatsLoading } = useDescriptiveQuestionStats({
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
    chapterId: params.chapterId === "All" ? undefined : params.chapterId,
  })

  const {
    data: listData,
    isLoading: isListLoading,
    isError,
  } = useDescriptiveQuestionsList({
    query: params.query || undefined,
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
    chapterId: params.chapterId === "All" ? undefined : params.chapterId,
    difficulty: params.difficulty === "All" ? undefined : params.difficulty,
    sort: params.sort === "All" ? undefined : params.sort,
    page: params.page,
    limit: params.limit,
  })

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <DescriptiveQuestionListHeader />

      <DescriptiveQuestionStatsCards
        totalCount={statsData?.totalCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isStatsLoading}
      />

      <DescriptiveQuestionFilters
        searchQuery={params.query}
        onSearchChange={(query) => setParams({ query, page: 1 })}
        selectedAcademicClassId={params.classId}
        onAcademicClassChange={(clsId) => setParams({ classId: clsId, subjectId: "All", chapterId: "All", page: 1 })}
        academicClasses={classes}
        selectedSubjectId={params.subjectId}
        onSubjectChange={(subjectId) => setParams({ subjectId, chapterId: "All", page: 1 })}
        subjects={subjects}
        selectedChapterId={params.chapterId}
        onChapterChange={(chapterId) => setParams({ chapterId, page: 1 })}
        chapters={chapters}
        selectedDifficulty={params.difficulty}
        onDifficultyChange={(difficulty) => setParams({ difficulty, page: 1 })}
        selectedSort={params.sort}
        onSortChange={(sort) => setParams({ sort: sort as DescriptiveQuestionSortOption, page: 1 })}
      />

      <DescriptiveQuestionTable
        items={listData?.items ?? []}
        isLoading={isListLoading}
        isError={isError}
        onDelete={(id, text) => openModal(id, text)}
        onBulkDelete={(ids) => openBulkModal(ids)}
        currentPage={listData?.page ?? params.page}
        itemsPerPage={listData?.limit ?? params.limit}
        totalItems={listData?.totalItems ?? 0}
        totalPages={listData?.totalPages ?? 1}
        onPageChange={(page) => setParams({ page })}
        onLimitChange={(limit) => setParams({ limit, page: 1 })}
      />

      <DeleteDescriptiveQuestionModal />
    </div>
  )
}
