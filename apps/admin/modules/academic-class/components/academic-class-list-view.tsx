"use client"

import { useRouter } from "next/navigation"
import {
  useAcademicClassesList,
  useAcademicClassStats,
} from "../services/use-academic-class"
import { useDeleteAcademicClassModalStore } from "../store/use-delete-academic-class-modal-store"
import { AcademicClassListHeader } from "./academic-class-list-header"
import { AcademicClassStatsCards } from "./academic-class-stats-cards"
import { AcademicClassFilters } from "./academic-class-filters"
import { AcademicClassTable } from "./academic-class-table"
import { useAcademicClassSearchParams } from "../hooks/use-academic-class-search-params"

export function AcademicClassListView() {
  const router = useRouter()
  const [{ query: searchQuery, status: selectedStatus, sort: selectedSort, page: currentPage, limit }, setSearchParams] =
    useAcademicClassSearchParams()

  const openDeleteModal = useDeleteAcademicClassModalStore((state) => state.openModal)

  const isActiveFilter = selectedStatus === "active" ? true : selectedStatus === "inactive" ? false : undefined

  const { data: classesData, isLoading, isError } = useAcademicClassesList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    isActive: isActiveFilter,
    sort: selectedSort,
  })

  const { data: statsData, isLoading: isStatsLoading } = useAcademicClassStats()

  const items = classesData?.items ?? []
  const totalItems = classesData?.totalItems ?? items.length
  const totalPages = classesData?.totalPages ?? 1

  return (
    <div className="w-full">
      {/* Header */}
      <AcademicClassListHeader />

      {/* Stats Cards */}
      <AcademicClassStatsCards
        totalClassesCount={statsData?.totalClassesCount ?? 0}
        activeClassesCount={statsData?.activeClassesCount ?? 0}
        inactiveClassesCount={statsData?.inactiveClassesCount ?? 0}
        isLoading={isStatsLoading}
      />

      {/* Filters & Action Bar */}
      <AcademicClassFilters
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchParams({ query, page: 1 })
        }}
        selectedStatus={selectedStatus}
        onStatusChange={(status) => {
          setSearchParams({ status, page: 1 })
        }}
        selectedSort={selectedSort}
        onSortChange={(sort) => {
          setSearchParams({ sort: sort as any, page: 1 })
        }}
      />

      {/* Data Table */}
      <AcademicClassTable
        items={items}
        isLoading={isLoading}
        isError={isError}
        isDeleting={false}
        onEdit={(item) => router.push(`/academic-classes/${item.id}/edit`)}
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
    </div>
  )
}

