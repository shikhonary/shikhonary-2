"use client"

import { useRouter } from "next/navigation"
import { useStudentsList, useStudentStats } from "../services/use-student"
import { useDeleteStudentModalStore } from "../store/use-delete-student-modal-store"
import { StudentListHeader } from "./student-list-header"
import { StudentStatsCards } from "./student-stats-cards"
import { StudentFilters } from "./student-filters"
import { StudentTable } from "./student-table"
import { useStudentSearchParams } from "../hooks/use-student-search-params"

export function StudentListView() {
  const router = useRouter()
  const [
    {
      query: searchQuery,
      academicClassId: selectedClassId,
      status: selectedStatus,
      linked: selectedLinked,
      sort: selectedSort,
      page: currentPage,
      limit,
    },
    setSearchParams,
  ] = useStudentSearchParams()

  const openDeleteModal = useDeleteStudentModalStore((state) => state.openModal)

  const isOfflineFilter =
    selectedStatus === "offline"
      ? true
      : selectedStatus === "online"
      ? false
      : undefined

  const isLinkedFilter =
    selectedLinked === "linked"
      ? true
      : selectedLinked === "unlinked"
      ? false
      : undefined

  const { data: studentsData, isLoading, isError } = useStudentsList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    academicClassId: selectedClassId || undefined,
    isOfflineStudent: isOfflineFilter,
    isLinkedToUser: isLinkedFilter,
    sort: selectedSort as any,
  })

  const { data: statsData, isLoading: isStatsLoading } = useStudentStats()

  const items = studentsData?.items ?? []
  const totalItems = studentsData?.totalItems ?? items.length
  const totalPages = studentsData?.totalPages ?? 1

  return (
    <div className="w-full">
      {/* Header */}
      <StudentListHeader />

      {/* Stats Cards */}
      <StudentStatsCards
        totalStudentsCount={statsData?.totalStudentsCount ?? 0}
        offlineStudentsCount={statsData?.offlineStudentsCount ?? 0}
        onlineStudentsCount={statsData?.onlineStudentsCount ?? 0}
        linkedStudentsCount={statsData?.linkedStudentsCount ?? 0}
        isLoading={isStatsLoading}
      />

      {/* Filters & Action Bar */}
      <StudentFilters
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchParams({ query, page: 1 })
        }}
        selectedClassId={selectedClassId}
        onClassChange={(classId) => {
          setSearchParams({ academicClassId: classId, page: 1 })
        }}
        selectedStatus={selectedStatus}
        onStatusChange={(status) => {
          setSearchParams({ status: status as any, page: 1 })
        }}
        selectedLinked={selectedLinked}
        onLinkedChange={(linked) => {
          setSearchParams({ linked: linked as any, page: 1 })
        }}
        selectedSort={selectedSort}
        onSortChange={(sort) => {
          setSearchParams({ sort: sort as any, page: 1 })
        }}
      />

      {/* Data Table */}
      <StudentTable
        items={items as any}
        isLoading={isLoading}
        isError={isError}
        isDeleting={false}
        onEdit={(item) => router.push(`/students/${item.id}/edit`)}
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
