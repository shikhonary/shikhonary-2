"use client"

import { useRouter } from "next/navigation"
import { useSubjectsList, useToggleSubjectStatus } from "../services/use-subject"
import { useDeleteSubjectModalStore } from "../store/use-delete-subject-modal-store"
import { SubjectPageHeader } from "./subject-page-header"
import { SubjectFilterBar } from "./subject-filter-bar"
import { SubjectDataTable, type SubjectItem } from "./subject-data-table"
import { SubjectPagination } from "./subject-pagination"
import { DeleteSubjectModal } from "./delete-subject-modal"
import { useSubjectSearchParams } from "../hooks/use-subject-search-params"

export function SubjectManagementView() {
  const router = useRouter()
  const [
    { query: searchQuery, sort: selectedSort, page: currentPage, limit, academicYearId: selectedYear, classId: selectedClass },
    setSearchParams,
  ] = useSubjectSearchParams()

  const openDeleteModal = useDeleteSubjectModalStore((state) => state.openModal)
  const toggleStatusMutation = useToggleSubjectStatus()

  const { data: subjectsData, isLoading, isError } = useSubjectsList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    academicYearId: selectedYear === "All" ? undefined : selectedYear,
    classId: selectedClass === "All" ? undefined : selectedClass,
    sort: selectedSort as any,
  })

  const items = (subjectsData?.academicSubjects as SubjectItem[]) ?? []
  const totalItems = subjectsData?.totalItems ?? 0

  return (
    <div className="w-full">
      {/* Header */}
      <SubjectPageHeader />

      {/* Filter Bar */}
      <SubjectFilterBar
        searchQuery={searchQuery}
        onSearchChange={(query) => setSearchParams({ query, page: 1 })}
        selectedYear={selectedYear}
        onYearChange={(academicYearId) => setSearchParams({ academicYearId, page: 1 })}
        selectedClass={selectedClass}
        onClassChange={(classId) => setSearchParams({ classId, page: 1 })}
        selectedSort={selectedSort}
        onSortChange={(sort) => setSearchParams({ sort: sort as any, page: 1 })}
      />

      {/* Data Table */}
      <SubjectDataTable
        items={items}
        isLoading={isLoading}
        isError={isError}
        onEdit={(item) => router.push(`/subjects/${item.id}/edit`)}
        onDelete={(id, name) => openDeleteModal(id, name)}
        onToggleActive={(id) => toggleStatusMutation.mutate({ id })}
      />

      {/* Pagination */}
      {!isLoading && !isError && totalItems > 0 && (
        <SubjectPagination totalItems={totalItems} />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteSubjectModal />
    </div>
  )
}
