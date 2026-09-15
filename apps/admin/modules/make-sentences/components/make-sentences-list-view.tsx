"use client"

import { useMakeSentencesSearchParams } from "../hooks/use-make-sentences-search-params"
import {
  useMakeSentencesList,
  useMakeSentencesStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-make-sentences"
import { useDeleteMakeSentencesModalStore } from "../store/use-delete-make-sentences-modal-store"
import { MakeSentencesListHeader } from "./make-sentences-list-header"
import { MakeSentencesStatsCards } from "./make-sentences-stats-cards"
import { MakeSentencesFilters } from "./make-sentences-filters"
import { MakeSentencesTable } from "./make-sentences-table"
import { DeleteMakeSentencesModal } from "./delete-make-sentences-modal"

export function MakeSentencesListView() {
  const [params, setParams] = useMakeSentencesSearchParams()
  const { openModal, openBulkModal } = useDeleteMakeSentencesModalStore()

  // Queries
  const { data: classesData } = useAcademicClassesForSelection()
  const { data: subjectsData } = useSubjectsForSelection({
    academicClassId: params.classId === "All" ? undefined : params.classId,
  })
  const { data: chaptersData } = useChaptersForSelection({
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
  })

  const { data: listData, isLoading, isError } = useMakeSentencesList({
    page: params.page,
    limit: params.limit,
    query: params.query,
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
    chapterId: params.chapterId === "All" ? undefined : params.chapterId,
    difficulty: params.difficulty === "All" ? undefined : params.difficulty,
    sort: params.sort === "All" ? undefined : params.sort,
  })

  const { data: statsData } = useMakeSentencesStats({
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
    chapterId: params.chapterId === "All" ? undefined : params.chapterId,
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <MakeSentencesListHeader />

      <MakeSentencesStatsCards
        totalCount={statsData?.totalCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isLoading}
      />

      <MakeSentencesFilters
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

      <MakeSentencesTable
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

      <DeleteMakeSentencesModal />
    </div>
  )
}
