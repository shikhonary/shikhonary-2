"use client"

import { useGrammarQuestionSearchParams, type GrammarQuestionSortOption } from "../hooks/use-grammar-question-search-params"
import {
  useGrammarQuestionsList,
  useGrammarQuestionStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-grammar-question"
import { useDeleteGrammarQuestionModalStore } from "../store/use-delete-grammar-question-modal-store"
import { GrammarQuestionListHeader } from "./grammar-question-list-header"
import { GrammarQuestionStatsCards } from "./grammar-question-stats-cards"
import { GrammarQuestionFilters } from "./grammar-question-filters"
import { GrammarQuestionTable } from "./grammar-question-table"
import { DeleteGrammarQuestionModal } from "./delete-grammar-question-modal"

export function GrammarQuestionListView() {
  const [params, setParams] = useGrammarQuestionSearchParams()
  const { openModal, openBulkModal } = useDeleteGrammarQuestionModalStore()

  // Queries
  const { data: classes = [] } = useAcademicClassesForSelection()
  const { data: subjects = [] } = useSubjectsForSelection({
    academicClassId: params.classId === "All" ? undefined : params.classId,
  })
  const { data: chapters = [] } = useChaptersForSelection({
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
  })

  const { data: statsData, isLoading: isStatsLoading } = useGrammarQuestionStats({
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
    academicChapterId: params.chapterId === "All" ? undefined : params.chapterId,
  })

  const {
    data: listData,
    isLoading: isListLoading,
    isError,
  } = useGrammarQuestionsList({
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
      <GrammarQuestionListHeader />

      <GrammarQuestionStatsCards
        totalCount={statsData?.totalCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isStatsLoading}
      />

      <GrammarQuestionFilters
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
        onSortChange={(sort) => setParams({ sort: sort as GrammarQuestionSortOption, page: 1 })}
      />

      <GrammarQuestionTable
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

      <DeleteGrammarQuestionModal />
    </div>
  )
}
