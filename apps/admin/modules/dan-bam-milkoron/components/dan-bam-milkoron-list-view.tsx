"use client"

import { useDanBamMilkoronSearchParams } from "../hooks/use-dan-bam-milkoron-search-params"
import {
  useDanBamMilkoronList,
  useDanBamMilkoronStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-dan-bam-milkoron"
import { useDeleteDanBamMilkoronModalStore } from "../store/use-delete-dan-bam-milkoron-modal-store"
import { DanBamMilkoronListHeader } from "./dan-bam-milkoron-list-header"
import { DanBamMilkoronStatsCards } from "./dan-bam-milkoron-stats-cards"
import { DanBamMilkoronFilters } from "./dan-bam-milkoron-filters"
import { DanBamMilkoronTable } from "./dan-bam-milkoron-table"
import { DeleteDanBamMilkoronModal } from "./delete-dan-bam-milkoron-modal"

export function DanBamMilkoronListView() {
  const [params, setParams] = useDanBamMilkoronSearchParams()
  const { openModal, openBulkModal } = useDeleteDanBamMilkoronModalStore()

  // Queries
  const { data: classesData } = useAcademicClassesForSelection()
  const { data: subjectsData } = useSubjectsForSelection({
    academicClassId: params.classId === "All" ? undefined : params.classId,
  })
  const { data: chaptersData } = useChaptersForSelection({
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
  })

  const { data: statsData, isLoading: isStatsLoading } = useDanBamMilkoronStats({
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
    chapterId: params.chapterId === "All" ? undefined : params.chapterId,
  })

  const { data: listData, isLoading: isListLoading, isError } = useDanBamMilkoronList({
    page: params.page,
    limit: params.limit,
    query: params.query || undefined,
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
    chapterId: params.chapterId === "All" ? undefined : params.chapterId,
    difficulty: params.difficulty === "All" ? undefined : params.difficulty,
    sort: params.sort === "All" ? undefined : params.sort,
  })

  return (
    <div className="w-full space-y-6">
      <DanBamMilkoronListHeader />

      <DanBamMilkoronStatsCards
        totalCount={statsData?.totalCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isStatsLoading}
      />

      <DanBamMilkoronFilters
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

      <DanBamMilkoronTable
        items={listData?.items ?? []}
        isLoading={isListLoading}
        isError={isError}
        currentPage={params.page}
        itemsPerPage={params.limit}
        totalItems={listData?.totalItems ?? 0}
        totalPages={listData?.totalPages ?? 1}
        onPageChange={(page) => setParams({ page })}
        onLimitChange={(limit) => setParams({ limit, page: 1 })}
        onDelete={(id, text) => openModal(id, text)}
        onBulkDelete={(ids) => openBulkModal(ids)}
      />

      <DeleteDanBamMilkoronModal />
    </div>
  )
}
