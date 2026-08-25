"use client"

import { useAcademicClassesList, useToggleAcademicClassStatus } from "../services/use-academic-class"
import { useDeleteAcademicClassModalStore } from "../store/use-delete-academic-class-modal-store"
import { AcademicClassListHeader } from "./academic-class-list-header"
import { AcademicClassFilters } from "./academic-class-filters"
import { AcademicClassTable } from "./academic-class-table"
import { Pagination } from "./pagination"
import { DeleteAcademicClassModal } from "./delete-academic-class-modal"
import { CreateAcademicClassModal } from "./create-academic-class-modal"
import { EditAcademicClassModal } from "./edit-academic-class-modal"
import { useAcademicClassSearchParams } from "../hooks/use-academic-class-search-params"

export function AcademicClassListView() {
  const [{ query: searchQuery, sort: selectedSort, page: currentPage, limit }, setSearchParams] =
    useAcademicClassSearchParams()

  const openDeleteModal = useDeleteAcademicClassModalStore((state) => state.openModal)
  const toggleStatusMutation = useToggleAcademicClassStatus()

  const { data: classesData, isLoading, isError } = useAcademicClassesList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    sort: selectedSort || undefined,
  })

  const displayItems = classesData?.academicClasses ?? []
  const totalItems = classesData?.totalItems ?? 0

  return (
    <div className="w-full">
      {/* Header */}
      <AcademicClassListHeader />

      {/* Filters & Action Bar */}
      <AcademicClassFilters
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
      <AcademicClassTable
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
      <DeleteAcademicClassModal />

      {/* Create Modal */}
      <CreateAcademicClassModal />

      {/* Edit Modal */}
      <EditAcademicClassModal />
    </div>
  )
}
