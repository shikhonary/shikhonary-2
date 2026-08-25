"use client"

import { useAcademicYearsList, useToggleAcademicYearStatus } from "../services/use-academic-year"
import { useDeleteAcademicYearModalStore } from "../store/use-delete-academic-year-modal-store"
import { AcademicYearListHeader } from "./academic-year-list-header"
import { AcademicYearFilters } from "./academic-year-filters"
import { AcademicYearTable } from "./academic-year-table"
import { Pagination } from "./pagination"
import { DeleteAcademicYearModal } from "./delete-academic-year-modal"
import { CreateAcademicYearModal } from "./create-academic-year-modal"
import { EditAcademicYearModal } from "./edit-academic-year-modal"
import { useAcademicYearSearchParams } from "../hooks/use-academic-year-search-params"

export function AcademicYearListView() {
  const [{ query: searchQuery, sort: selectedSort, page: currentPage, limit }, setSearchParams] =
    useAcademicYearSearchParams()

  const openDeleteModal = useDeleteAcademicYearModalStore((state) => state.openModal)
  const toggleStatusMutation = useToggleAcademicYearStatus()

  const { data: academicYearsData, isLoading, isError } = useAcademicYearsList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    sort: selectedSort || undefined,
  })

  const displayItems = academicYearsData?.academicYears ?? []
  const totalItems = academicYearsData?.totalItems ?? 0


  return (
    <div className="w-full">
      {/* Header */}
      <AcademicYearListHeader />

      {/* Filters & Action Bar */}
      <AcademicYearFilters
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchParams({ query, page: 1 })
        }}
        selectedSort={selectedSort}
        onSortChange={(sort) => {
          setSearchParams({ sort: sort as any, page: 1 })
        }}
      />

      {/* Data Table */}
      <AcademicYearTable
        items={displayItems}
        isLoading={isLoading}
        isError={isError}
        onDelete={(id, name) => openDeleteModal(id, name)}
        onToggleActive={(id) => toggleStatusMutation.mutate({ id })}
      />

      {/* Pagination */}
      {!isLoading && !isError && totalItems > 0 && (
        <Pagination totalItems={totalItems} />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteAcademicYearModal />

      {/* Create Modal */}
      <CreateAcademicYearModal />

      {/* Edit Modal */}
      <EditAcademicYearModal />
    </div>
  )
}

