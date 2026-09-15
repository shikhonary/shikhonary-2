"use client"

import { useGenderChangeSearchParams } from "../hooks/use-gender-change-search-params"
import {
  useGenderChangeList,
  useGenderChangeStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-gender-change"
import { useDeleteGenderChangeModalStore } from "../store/use-delete-gender-change-modal-store"
import { GenderChangeListHeader } from "./gender-change-list-header"
import { GenderChangeStatsCards } from "./gender-change-stats-cards"
import { GenderChangeFilters } from "./gender-change-filters"
import { GenderChangeTable } from "./gender-change-table"
import { DeleteGenderChangeModal } from "./delete-gender-change-modal"

export function GenderChangeListView() {
  const [params, setParams] = useGenderChangeSearchParams()
  const { openModal, openBulkModal } = useDeleteGenderChangeModalStore()

  // Queries
  const { data: classesData } = useAcademicClassesForSelection()
  const { data: subjectsData } = useSubjectsForSelection({
    academicClassId: params.classId === "All" ? undefined : params.classId,
  })
  const { data: chaptersData } = useChaptersForSelection({
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
  })

  const { data: listData, isLoading, isError } = useGenderChangeList({
    page: params.page,
    limit: params.limit,
    query: params.query,
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
    chapterId: params.chapterId === "All" ? undefined : params.chapterId,
    difficulty: params.difficulty === "All" ? undefined : params.difficulty,
    sort: params.sort === "All" ? undefined : params.sort,
  })

  const { data: statsData } = useGenderChangeStats({
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
    chapterId: params.chapterId === "All" ? undefined : params.chapterId,
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <GenderChangeListHeader />

      <GenderChangeStatsCards
        totalCount={statsData?.total}
        difficultyCounts={
          statsData
            ? {
                EASY: statsData.easyCount,
                MEDIUM: statsData.mediumCount,
                HARD: statsData.hardCount,
              }
            : undefined
        }
        isLoading={isLoading}
      />

      <GenderChangeFilters
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

      <GenderChangeTable
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

      <DeleteGenderChangeModal />
    </div>
  )
}
