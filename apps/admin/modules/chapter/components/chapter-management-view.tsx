"use client"

import { useRouter } from "next/navigation"
import { useChaptersList, useToggleChapterStatus } from "../services/use-chapter"
import { useDeleteChapterModalStore } from "../store/use-delete-chapter-modal-store"
import { ChapterPageHeader } from "./chapter-page-header"
import { ChapterFilterBar } from "./chapter-filter-bar"
import { ChapterDataTable, type ChapterItem } from "./chapter-data-table"
import { ChapterPagination } from "./chapter-pagination"
import { DeleteChapterModal } from "./delete-chapter-modal"
import { useChapterSearchParams } from "../hooks/use-chapter-search-params"

export function ChapterManagementView() {
  const router = useRouter()
  const [
    { query: searchQuery, sort: selectedSort, page: currentPage, limit, subjectId: selectedSubject, academicYearId: selectedYear, classId: selectedClass },
    setSearchParams,
  ] = useChapterSearchParams()

  const openDeleteModal = useDeleteChapterModalStore((state) => state.openModal)
  const toggleStatusMutation = useToggleChapterStatus()

  const { data: chaptersData, isLoading, isError } = useChaptersList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    subjectId: selectedSubject === "All" ? undefined : selectedSubject,
    academicYearId: selectedYear === "All" ? undefined : selectedYear,
    sort: selectedSort as any,
  })

  const items = (chaptersData?.academicChapters as ChapterItem[]) ?? []
  const totalItems = chaptersData?.totalItems ?? 0

  return (
    <div className="w-full">
      {/* Header */}
      <ChapterPageHeader />

      {/* Filter Bar */}
      <ChapterFilterBar
        searchQuery={searchQuery}
        onSearchChange={(query) => setSearchParams({ query, page: 1 })}
        selectedYear={selectedYear}
        onYearChange={(academicYearId) => setSearchParams({ academicYearId, classId: "All", subjectId: "All", page: 1 })}
        selectedClass={selectedClass}
        onClassChange={(classId) => setSearchParams({ classId, subjectId: "All", page: 1 })}
        selectedSubject={selectedSubject}
        onSubjectChange={(subjectId) => setSearchParams({ subjectId, page: 1 })}
        selectedSort={selectedSort}
        onSortChange={(sort) => setSearchParams({ sort: sort as any, page: 1 })}
      />

      {/* Data Table */}
      <ChapterDataTable
        items={items}
        isLoading={isLoading}
        isError={isError}
        onEdit={(item) => router.push(`/chapters/${item.id}/edit`)}
        onDelete={(id, name) => openDeleteModal(id, name)}
        onToggleActive={(id) => toggleStatusMutation.mutate({ id })}
      />

      {/* Pagination */}
      {!isLoading && !isError && totalItems > 0 && (
        <ChapterPagination totalItems={totalItems} />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteChapterModal />
    </div>
  )
}
