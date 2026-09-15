"use client"

import { useWordMeaningSearchParams } from "../hooks/use-word-meaning-search-params"
import {
  useWordMeaningList,
  useWordMeaningStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-word-meaning"
import { useDeleteWordMeaningModalStore } from "../store/use-delete-word-meaning-modal-store"
import { WordMeaningListHeader } from "./word-meaning-list-header"
import { WordMeaningStatsCards } from "./word-meaning-stats-cards"
import { WordMeaningFilters } from "./word-meaning-filters"
import { WordMeaningTable } from "./word-meaning-table"
import { DeleteWordMeaningModal } from "./delete-word-meaning-modal"

export function WordMeaningListView() {
  const [params, setParams] = useWordMeaningSearchParams()
  const { openModal, openBulkModal } = useDeleteWordMeaningModalStore()

  // Queries
  const { data: classesData } = useAcademicClassesForSelection()
  const { data: subjectsData } = useSubjectsForSelection({
    academicClassId: params.classId === "All" ? undefined : params.classId,
  })
  const { data: chaptersData } = useChaptersForSelection({
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
  })

  const { data: listData, isLoading, isError } = useWordMeaningList({
    page: params.page,
    limit: params.limit,
    query: params.query,
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
    chapterId: params.chapterId === "All" ? undefined : params.chapterId,
    difficulty: params.difficulty === "All" ? undefined : params.difficulty,
    sort: params.sort === "All" ? undefined : params.sort,
  })

  const { data: statsData } = useWordMeaningStats({
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
    chapterId: params.chapterId === "All" ? undefined : params.chapterId,
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <WordMeaningListHeader />

      <WordMeaningStatsCards
        totalCount={statsData?.totalCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isLoading}
      />

      <WordMeaningFilters
        searchQuery={params.query}
        onSearchChange={(q) => setParams({ query: q, page: 1 })}
        selectedAcademicClassId={params.classId}
        onAcademicClassChange={(clsId) => setParams({ classId: clsId, subjectId: "All", chapterId: "All", page: 1 })}
        academicClasses={classesData}
        selectedSubjectId={params.subjectId}
        onSubjectChange={(subId) => setParams({ subjectId: subId, chapterId: "All", page: 1 })}
        subjects={subjectsData}
        selectedChapterId={params.chapterId}
        onChapterChange={(chId) => setParams({ chapterId: chId, page: 1 })}
        chapters={chaptersData}
        selectedDifficulty={params.difficulty}
        onDifficultyChange={(diff) => setParams({ difficulty: diff, page: 1 })}
        selectedSort={params.sort}
        onSortChange={(sort) => setParams({ sort: sort as any, page: 1 })}
      />

      <WordMeaningTable
        items={listData?.items ?? []}
        isLoading={isLoading}
        isError={isError}
        onDelete={(id, text) => openModal(id, text)}
        onBulkDelete={(ids) => openBulkModal(ids)}
        currentPage={params.page}
        itemsPerPage={params.limit}
        totalItems={listData?.totalItems ?? 0}
        totalPages={listData?.totalPages ?? 1}
        onPageChange={(page) => setParams({ page })}
        onLimitChange={(limit) => setParams({ limit, page: 1 })}
      />

      <DeleteWordMeaningModal />
    </div>
  )
}
