"use client"

import { useRouter } from "next/navigation"
import { toast } from "@workspace/ui/components/sonner"
import {
  useExamsList,
  useExamStats,
  useToggleExamStatus,
} from "../services/use-exam"
import { useDeleteExamModalStore } from "../store/use-delete-exam-modal-store"
import { useExamSearchParams } from "../hooks/use-exam-search-params"
import { ExamListHeader } from "./exam-list-header"
import { ExamStatsCards } from "./exam-stats-cards"
import { ExamFilters } from "./exam-filters"
import { ExamTable } from "./exam-table"
import { DeleteExamModal } from "./delete-exam-modal"

export function ExamListView() {
  const router = useRouter()
  const [
    { query, status, type, academicClassId, sort, page, limit },
    setSearchParams,
  ] = useExamSearchParams()

  const openDeleteModal = useDeleteExamModalStore((state) => state.openModal)
  const toggleStatusMutation = useToggleExamStatus()

  const { data: examsData, isLoading, isError } = useExamsList({
    limit,
    page,
    query: query || undefined,
    status: status !== "All" ? status : undefined,
    type: type !== "All" ? type : undefined,
    academicClassId: academicClassId !== "All" ? academicClassId : undefined,
    sort: sort !== "All" ? sort : undefined,
  })

  const { data: statsData, isLoading: isStatsLoading } = useExamStats({
    status: status !== "All" ? status : undefined,
    type: type !== "All" ? type : undefined,
    academicClassId: academicClassId !== "All" ? academicClassId : undefined,
  })

  const items = examsData?.items ?? []
  const totalItems = examsData?.totalItems ?? items.length
  const totalPages = examsData?.totalPages ?? 1

  const handleToggleStatus = async (id: string, newStatus: string) => {
    try {
      await toggleStatusMutation.mutateAsync({ id, status: newStatus })
      toast.success(`Exam status updated to ${newStatus}`)
    } catch (err: any) {
      toast.error(err.message || "Failed to update exam status")
    }
  }

  return (
    <div className="w-full">
      {/* List Header */}
      <ExamListHeader />

      {/* Summary Stats */}
      <ExamStatsCards
        totalCount={statsData?.totalCount}
        statusCounts={statsData?.statusCounts}
        typeCounts={statsData?.typeCounts}
        isLoading={isStatsLoading}
      />

      {/* Filter Toolbar */}
      <ExamFilters
        searchQuery={query}
        onSearchChange={(q) => setSearchParams({ query: q, page: 1 })}
        selectedStatus={status}
        onStatusChange={(s) => setSearchParams({ status: s, page: 1 })}
        selectedType={type}
        onTypeChange={(t) => setSearchParams({ type: t, page: 1 })}
        selectedAcademicClassId={academicClassId}
        onAcademicClassChange={(c) => setSearchParams({ academicClassId: c, page: 1 })}
        selectedSort={sort}
        onSortChange={(st) => setSearchParams({ sort: st as any, page: 1 })}
      />

      {/* View Data (Table View Only) */}
      <ExamTable
        items={items as any}
        isLoading={isLoading}
        isError={isError}
        onEdit={(item) => router.push(`/exams/${item.id}/edit`)}
        onDelete={(id, title) => openDeleteModal(id, title)}
        onToggleStatus={handleToggleStatus}
        onViewDetails={(item) => router.push(`/exams/${item.id}`)}
        currentPage={page}
        itemsPerPage={limit}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={(p) => setSearchParams({ page: p })}
        onLimitChange={(l) => setSearchParams({ limit: l, page: 1 })}
      />

      {/* Global Delete Confirmation Dialog */}
      <DeleteExamModal />
    </div>
  )
}
