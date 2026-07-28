"use client"

import { useRouter } from "next/navigation"
import { useUsersList, useUserStats } from "../services/use-user"
import { useDeleteUserModalStore } from "../store/use-delete-user-modal-store"
import { useChangeRoleModalStore } from "../store/use-change-role-modal-store"
import { UserPageHeader } from "./user-page-header"
import { UserStatsCards } from "./user-stats-cards"
import { UserFilterBar } from "./user-filter-bar"
import { UserDataTable, type UserItem } from "./user-data-table"
import { useUserSearchParams } from "../hooks/use-user-search-params"

export function UserManagementView() {
  const router = useRouter()
  const [
    { search: searchQuery, role: selectedRole, status: selectedStatus, sort: selectedSort, page: currentPage, limit },
    setSearchParams,
  ] = useUserSearchParams()

  const openDeleteModal = useDeleteUserModalStore((state) => state.openModal)
  const openChangeRoleModal = useChangeRoleModalStore((state) => state.openModal)

  const { data: usersData, isLoading, isError } = useUsersList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    roleName: selectedRole === "All" ? undefined : selectedRole,
    status: selectedStatus as any,
    sort: selectedSort as any,
  })

  const { data: statsData, isLoading: isStatsLoading } = useUserStats()

  const items = (usersData?.items as UserItem[]) ?? []
  const totalItems = usersData?.totalItems ?? items.length
  const totalPages = usersData?.totalPages ?? 1

  return (
    <div className="w-full">
      {/* Page Header */}
      <UserPageHeader />

      {/* Stats Cards */}
      <UserStatsCards
        totalUsers={statsData?.totalUsers}
        totalUsersChange={statsData?.totalUsersChange}
        verifiedTeachers={statsData?.verifiedTeachers}
        pendingRequests={statsData?.pendingRequests}
        systemHealth={statsData?.systemHealth}
        isLoading={isStatsLoading}
      />

      {/* Filter Bar */}
      <UserFilterBar
        searchQuery={searchQuery}
        onSearchChange={(search) => setSearchParams({ search, page: 1 })}
        selectedRole={selectedRole}
        onRoleChange={(role) => setSearchParams({ role, page: 1 })}
        selectedStatus={selectedStatus}
        onStatusChange={(status) => setSearchParams({ status, page: 1 })}
        selectedSort={selectedSort}
        onSortChange={(sort) => setSearchParams({ sort: sort as any, page: 1 })}
      />

      {/* Data Table with Pagination */}
      <UserDataTable
        items={items}
        isLoading={isLoading}
        isError={isError}
        isDeleting={false}
        onEdit={(item) => router.push(`/users/${item.id}/edit`)}
        onChangeRole={(item) => openChangeRoleModal(item.id, item.name || item.email || "User", item.roles.map((r) => r.id))}
        onDelete={(id, name) => openDeleteModal(id, name)}
        currentPage={currentPage}
        itemsPerPage={limit}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={(page) => setSearchParams({ page })}
        onLimitChange={(newLimit) => setSearchParams({ limit: newLimit, page: 1 })}
      />
    </div>
  )
}
