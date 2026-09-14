"use client"

import { useShortQuestionSearchParams, type ShortQuestionSortOption } from "../hooks/use-short-question-search-params"
import {
  useShortQuestionsList,
  useShortQuestionStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-short-question"
import { useDeleteShortQuestionModalStore } from "../store/use-delete-short-question-modal-store"
import { ShortQuestionListHeader } from "./short-question-list-header"
import { ShortQuestionStatsCards } from "./short-question-stats-cards"
import { ShortQuestionFilters } from "./short-question-filters"
import { ShortQuestionTable } from "./short-question-table"
import { DeleteShortQuestionModal } from "./delete-short-question-modal"

export function ShortQuestionListView() {
  const [params, setParams] = useShortQuestionSearchParams()
  const { openModal, openBulkModal } = useDeleteShortQuestionModalStore()

  // Queries
  const { data: classes = [] } = useAcademicClassesForSelection()
  const { data: subjects = [] } = useSubjectsForSelection({
    academicClassId: params.subjectId !== "All" ? undefined : undefined,
  })
  const { data: chapters = [] } = useChaptersForSelection({
    subjectId: params.subjectId !== "All" ? params.subjectId : undefined,
  })

  const { data: statsData, isLoading: isStatsLoading } = useShortQuestionStats({
    subjectId: params.subjectId !== "All" ? params.subjectId : undefined,
    chapterId: params.chapterId !== "All" ? params.chapterId : undefined,
  })

  const {
    data: listData,
    isLoading: isListLoading,
    isError,
  } = useShortQuestionsList({
    query: params.query || undefined,
    subjectId: params.subjectId !== "All" ? params.subjectId : undefined,
    chapterId: params.chapterId !== "All" ? params.chapterId : undefined,
    difficulty: params.difficulty !== "All" ? params.difficulty : undefined,
    sort: params.sort !== "All" ? params.sort : "newest",
    page: params.page,
    limit: params.limit,
  })

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <ShortQuestionListHeader />

      <ShortQuestionStatsCards
        totalCount={statsData?.totalCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isStatsLoading}
      />

      <ShortQuestionFilters
        searchQuery={params.query}
        onSearchChange={(query) => setParams({ query, page: 1 })}
        selectedAcademicClassId={"All"}
        onAcademicClassChange={() => {}}
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
        onSortChange={(sort) => setParams({ sort: sort as ShortQuestionSortOption, page: 1 })}
      />

      <ShortQuestionTable
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

      <DeleteShortQuestionModal />
    </div>
  )
}
