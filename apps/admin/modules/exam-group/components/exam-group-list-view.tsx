"use client"

import { useRouter } from "next/navigation"
import { toast } from "@workspace/ui/components/sonner"
import {
  useExamGroupsList,
  useExamGroupStats,
  useTogglePublishExamGroup,
  useCalculateExamGroupResults,
} from "../services/use-exam-group"
import { useDeleteExamGroupModalStore } from "../store/use-delete-exam-group-modal-store"
import { useExamGroupSearchParams } from "../hooks/use-exam-group-search-params"
import { ExamGroupListHeader } from "./exam-group-list-header"
import { ExamGroupStatsCards } from "./exam-group-stats-cards"
import { ExamGroupFilters } from "./exam-group-filters"
import { ExamGroupTable } from "./exam-group-table"
import { DeleteExamGroupModal } from "./delete-exam-group-modal"

export function ExamGroupListView() {
  const router = useRouter()
  const [
    { query, type, calculationType, academicClassId, isPublished, sort, page, limit },
    setSearchParams,
  ] = useExamGroupSearchParams()

  const openDeleteModal = useDeleteExamGroupModalStore((state) => state.openModal)
  const togglePublishMutation = useTogglePublishExamGroup()
  const calculateResultsMutation = useCalculateExamGroupResults()

  const parsedIsPublished =
    isPublished === "true" ? true : isPublished === "false" ? false : undefined

  const { data: listData, isLoading, isError } = useExamGroupsList({
    limit,
    page,
    query: query || undefined,
    type: type !== "All" ? type : undefined,
    academicClassId: academicClassId !== "All" ? academicClassId : undefined,
    isPublished: parsedIsPublished,
    sort: sort !== "All" ? (sort as any) : undefined,
  })

  const { data: statsData, isLoading: isStatsLoading } = useExamGroupStats({
    type: type !== "All" ? type : undefined,
    academicClassId: academicClassId !== "All" ? academicClassId : undefined,
  })

  const items = listData?.items ?? []
  const totalItems = listData?.totalItems ?? items.length
  const totalPages = listData?.totalPages ?? 1

  const handleTogglePublish = async (id: string, currentPublished: boolean) => {
    try {
      await togglePublishMutation.mutateAsync({ id, isPublished: !currentPublished })
      toast.success(
        `Exam group ${!currentPublished ? "published & active" : "moved to draft"}`
      )
    } catch (err: any) {
      toast.error(err.message || "Failed to update publication status")
    }
  }

  const handleCalculateResults = async (id: string) => {
    try {
      toast.loading("Calculating results & merit positions...", { id: "calc-toast" })
      const res = await calculateResultsMutation.mutateAsync({ examGroupId: id })
      toast.success(
        `Results calculated successfully for ${res.count} students!`,
        { id: "calc-toast" }
      )
    } catch (err: any) {
      toast.error(err.message || "Failed to calculate group results", { id: "calc-toast" })
    }
  }

  return (
    <div className="w-full">
      {/* Page Header */}
      <ExamGroupListHeader />

      {/* Summary Metrics */}
      <ExamGroupStatsCards
        totalCount={statsData?.totalCount}
        typeCounts={statsData?.typeCounts}
        publishedCount={statsData?.publishedCount}
        draftCount={statsData?.draftCount}
        isLoading={isStatsLoading}
      />

      {/* Filter Bar */}
      <ExamGroupFilters
        searchQuery={query}
        onSearchChange={(q) => setSearchParams({ query: q, page: 1 })}
        selectedAcademicClassId={academicClassId}
        onAcademicClassChange={(c) => setSearchParams({ academicClassId: c, page: 1 })}
        selectedIsPublished={isPublished}
        onIsPublishedChange={(p) => setSearchParams({ isPublished: p, page: 1 })}
        selectedSort={sort}
        onSortChange={(st) => setSearchParams({ sort: st as any, page: 1 })}
      />

      {/* Table Data */}
      <ExamGroupTable
        items={items as any}
        isLoading={isLoading}
        isError={isError}
        onEdit={(item) => router.push(`/exam-groups/${item.id}/edit`)}
        onDelete={(id, title) => openDeleteModal(id, title)}
        onTogglePublish={(id, pub) => handleTogglePublish(id, !pub)}
        onCalculateResults={handleCalculateResults}
        onViewDetails={(item) => router.push(`/exam-groups/${item.id}`)}
        currentPage={page}
        itemsPerPage={limit}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={(p) => setSearchParams({ page: p })}
        onLimitChange={(l) => setSearchParams({ limit: l, page: 1 })}
      />

      {/* Delete Confirmation Modal */}
      <DeleteExamGroupModal />
    </div>
  )
}
