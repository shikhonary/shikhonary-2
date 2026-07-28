"use client"

import { useRolesList } from "../services/use-role"
import { useDeleteRoleModalStore } from "../store/use-delete-role-modal-store"
import { RoleListHeader } from "./role-list-header"
import { RoleFilters } from "./role-filters"
import { RoleTable } from "./role-table"
import { DeleteRoleModal } from "./delete-role-modal"
import { CreateRoleModal } from "./create-role-modal"
import { EditRoleModal } from "./edit-role-modal"
import { useRoleSearchParams } from "../hooks/use-role-search-params"

export function RoleListView() {
  const [{ query: searchQuery, sort: selectedSort, page: currentPage, limit }, setSearchParams] =
    useRoleSearchParams()

  const openDeleteModal = useDeleteRoleModalStore((state) => state.openModal)

  const { data: rolesData, isLoading, isError } = useRolesList({
    limit,
    cursor: undefined, // trpc route uses cursor-based pagination
    query: searchQuery || undefined,
  })

  // Mocking offset pagination on top of cursor-based list or raw slice
  const allItems = rolesData?.roles ?? []
  
  // The backend return format is `{ roles: Role[], nextCursor?: string }`
  // We can calculate pages dynamically or handle it simply:
  const totalItems = allItems.length
  const totalPages = rolesData?.nextCursor ? currentPage + 1 : currentPage

  return (
    <div className="w-full">
      {/* Header */}
      <RoleListHeader />

      {/* Filters & Action Bar */}
      <RoleFilters
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
      <RoleTable
        items={allItems}
        isLoading={isLoading}
        isError={isError}
        isDeleting={false}
        onDelete={(id, name) => openDeleteModal(id, name)}
        currentPage={currentPage}
        itemsPerPage={limit}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={(page) => setSearchParams({ page })}
        onLimitChange={(newLimit) => {
          setSearchParams({ limit: newLimit, page: 1 })
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteRoleModal />

      {/* Create Modal */}
      <CreateRoleModal />

      {/* Edit Modal */}
      <EditRoleModal />
    </div>
  )
}
