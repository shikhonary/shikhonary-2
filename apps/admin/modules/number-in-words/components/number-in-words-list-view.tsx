"use client"

import { useNumberInWordsSearchParams } from "../hooks/use-number-in-words-search-params"
import {
  useNumberInWordsList,
  useNumberInWordsStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-number-in-words"
import { useDeleteNumberInWordsModalStore } from "../store/use-delete-number-in-words-modal-store"
import { NumberInWordsListHeader } from "./number-in-words-list-header"
import { NumberInWordsStatsCards } from "./number-in-words-stats-cards"
import { NumberInWordsFilters } from "./number-in-words-filters"
import { NumberInWordsTable } from "./number-in-words-table"
import { DeleteNumberInWordsModal } from "./delete-number-in-words-modal"

export function NumberInWordsListView() {
  const [params, setParams] = useNumberInWordsSearchParams()
  const { openModal, openBulkModal } = useDeleteNumberInWordsModalStore()

  // Queries
  const { data: classesData } = useAcademicClassesForSelection()
  const { data: subjectsData } = useSubjectsForSelection({
    academicClassId: params.classId === "All" ? undefined : params.classId,
  })
  const { data: chaptersData } = useChaptersForSelection({
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
  })

  const { data: listData, isLoading, isError } = useNumberInWordsList({
    page: params.page,
    limit: params.limit,
    query: params.query,
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
    chapterId: params.chapterId === "All" ? undefined : params.chapterId,
    difficulty: params.difficulty === "All" ? undefined : params.difficulty,
    sort: params.sort === "All" ? undefined : params.sort,
  })

  const { data: statsData } = useNumberInWordsStats({
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
    chapterId: params.chapterId === "All" ? undefined : params.chapterId,
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <NumberInWordsListHeader />

      <NumberInWordsStatsCards
        totalCount={statsData?.totalCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isLoading}
      />

      <NumberInWordsFilters
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

      <NumberInWordsTable
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

      <DeleteNumberInWordsModal />
    </div>
  )
}
