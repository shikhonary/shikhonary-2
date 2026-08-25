"use client"

import { useFiscalYearsList } from "../services/use-fiscal-year"
import { useDeleteFiscalYearModalStore } from "../store/use-delete-fiscal-year-modal-store"
import { FiscalYearListHeader } from "./fiscal-year-list-header"
import { FiscalYearFilters } from "./fiscal-year-filters"
import { FiscalYearTable } from "./fiscal-year-table"
import { Pagination } from "./pagination"
import { DeleteFiscalYearModal } from "./delete-fiscal-year-modal"
import { CreateFiscalYearModal } from "./create-fiscal-year-modal"
import { EditFiscalYearModal } from "./edit-fiscal-year-modal"
import { useFiscalYearSearchParams } from "../hooks/use-fiscal-year-search-params"

export function FiscalYearListView() {
  const [{ query: searchQuery, sort: selectedSort, page: currentPage, limit }, setSearchParams] =
    useFiscalYearSearchParams()

  const openDeleteModal = useDeleteFiscalYearModalStore((state) => state.openModal)

  const { data: fiscalYearData, isLoading, isError } = useFiscalYearsList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    sort: selectedSort || undefined,
  })

  const displayItems = fiscalYearData?.fiscalYears ?? []
  const totalItems = fiscalYearData?.totalItems ?? 0

  return (
    <div className="w-full">
      {/* Header */}
      <FiscalYearListHeader />

      {/* Filters & Action Bar */}
      <FiscalYearFilters
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
      <FiscalYearTable
        items={displayItems}
        isLoading={isLoading}
        isError={isError}
        onDelete={(id, name) => openDeleteModal(id, name)}
      />

      {/* Pagination */}
      {!isLoading && !isError && totalItems > 0 && (
        <Pagination totalItems={totalItems} />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteFiscalYearModal />

      {/* Create Modal */}
      <CreateFiscalYearModal />

      {/* Edit Modal */}
      <EditFiscalYearModal />
    </div>
  )
}
