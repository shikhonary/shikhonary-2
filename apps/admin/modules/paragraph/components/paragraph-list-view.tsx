"use client"

import {
  useParagraphsList,
  useParagraphStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-paragraph"
import { useDeleteParagraphModalStore } from "../store/use-delete-paragraph-modal-store"
import { ParagraphListHeader } from "./paragraph-list-header"
import { ParagraphStatsCards } from "./paragraph-stats-cards"
import { ParagraphFilters } from "./paragraph-filters"
import { ParagraphTable } from "./paragraph-table"
import { DeleteParagraphModal } from "./delete-paragraph-modal"
import { useParagraphSearchParams } from "../hooks/use-paragraph-search-params"

export function ParagraphListView() {
  const [params, setParams] = useParagraphSearchParams()
  const openDeleteModal = useDeleteParagraphModalStore((state) => state.openModal)
  const openBulkDeleteModal = useDeleteParagraphModalStore((state) => state.openBulkModal)

  // Query selection options
  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: subjects = [] } = useSubjectsForSelection(
    params.classId !== "All" ? { academicClassId: params.classId } : undefined
  )
  const { data: chapters = [] } = useChaptersForSelection(
    params.subjectId !== "All" ? { subjectId: params.subjectId } : undefined
  )

  // Query Paragraphs list with search & filters
  const { data: paragraphsData, isLoading, isError } = useParagraphsList({
    limit: params.limit,
    page: params.page,
    query: params.query || undefined,
    subjectId: params.subjectId !== "All" ? params.subjectId : undefined,
    chapterId: params.chapterId !== "All" ? params.chapterId : undefined,
    difficulty: params.difficulty !== "All" ? params.difficulty : undefined,
    sort: params.sort !== "All" ? params.sort : undefined,
  })

  // Query Paragraph stats
  const { data: statsData } = useParagraphStats(
    params.subjectId !== "All" || params.chapterId !== "All"
      ? {
          subjectId: params.subjectId !== "All" ? params.subjectId : undefined,
          chapterId: params.chapterId !== "All" ? params.chapterId : undefined,
        }
      : undefined
  )

  const items = paragraphsData?.items ?? []
  const totalItems = paragraphsData?.totalItems ?? items.length
  const totalPages = paragraphsData?.totalPages ?? 1

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <ParagraphListHeader />

      {/* Stats Cards */}
      <ParagraphStatsCards
        totalCount={statsData?.totalCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isLoading}
      />

      {/* Filters */}
      <ParagraphFilters
        searchQuery={params.query}
        onSearchChange={(query) => setParams({ query, page: 1 })}
        selectedAcademicClassId={params.classId}
        onAcademicClassChange={(classId) =>
          setParams({ classId, subjectId: "All", chapterId: "All", page: 1 })
        }
        academicClasses={academicClasses}
        selectedSubjectId={params.subjectId}
        onSubjectChange={(subjectId) =>
          setParams({ subjectId, chapterId: "All", page: 1 })
        }
        subjects={subjects}
        selectedChapterId={params.chapterId}
        onChapterChange={(chapterId) => setParams({ chapterId, page: 1 })}
        chapters={chapters}
        selectedDifficulty={params.difficulty}
        onDifficultyChange={(difficulty) => setParams({ difficulty, page: 1 })}
        selectedSort={params.sort}
        onSortChange={(sort) => setParams({ sort: sort as any, page: 1 })}
      />

      {/* Data Table */}
      <ParagraphTable
        items={items as any}
        isLoading={isLoading}
        isError={isError}
        onDelete={(id, nameSnippet) => openDeleteModal(id, nameSnippet)}
        onBulkDelete={(selectedIds) => openBulkDeleteModal(selectedIds)}
        currentPage={params.page}
        itemsPerPage={params.limit}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={(page) => setParams({ page })}
        onLimitChange={(newLimit) => setParams({ limit: newLimit, page: 1 })}
      />

      {/* Confirm Delete Modal */}
      <DeleteParagraphModal />
    </div>
  )
}
