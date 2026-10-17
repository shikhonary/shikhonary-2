"use client"

import { useMathQuestionSearchParams, type MathQuestionSortOption } from "../hooks/use-math-question-search-params"
import {
  useMathQuestionsList,
  useMathQuestionStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-math-question"
import { useDeleteMathQuestionModalStore } from "../store/use-delete-math-question-modal-store"
import { MathQuestionListHeader } from "./math-question-list-header"
import { MathQuestionStatsCards } from "./math-question-stats-cards"
import { MathQuestionFilters } from "./math-question-filters"
import { MathQuestionTable } from "./math-question-table"
import { DeleteMathQuestionModal } from "./delete-math-question-modal"

export function MathQuestionListView() {
  const [params, setParams] = useMathQuestionSearchParams()
  const { openModal, openBulkModal } = useDeleteMathQuestionModalStore()

  // Queries
  const { data: classes = [] } = useAcademicClassesForSelection()
  const { data: subjects = [] } = useSubjectsForSelection({
    academicClassId: params.classId === "All" ? undefined : params.classId,
  })
  const { data: chapters = [] } = useChaptersForSelection({
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
  })

  const { data: statsData, isLoading: isStatsLoading } = useMathQuestionStats({
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
    academicChapterId: params.chapterId === "All" ? undefined : params.chapterId,
  })

  const {
    data: listData,
    isLoading: isListLoading,
    isError,
  } = useMathQuestionsList({
    query: params.query || undefined,
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
    academicChapterId: params.chapterId === "All" ? undefined : params.chapterId,
    difficulty: params.difficulty === "All" ? undefined : params.difficulty,
    sort: params.sort === "All" ? undefined : params.sort,
    page: params.page,
    limit: params.limit,
  })

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <MathQuestionListHeader />

      <MathQuestionStatsCards
        totalCount={statsData?.totalCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isStatsLoading}
      />

      <MathQuestionFilters
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
        onSortChange={(sort) => setParams({ sort: sort as MathQuestionSortOption, page: 1 })}
      />

      <MathQuestionTable
        items={(listData?.items as any) ?? []}
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

      <DeleteMathQuestionModal />
    </div>
  )
}
