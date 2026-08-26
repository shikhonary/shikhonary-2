"use client"

import { useRouter } from "next/navigation"
import { useQuestionPapersList } from "../services/use-question-paper"
import { useDeleteQuestionPaperModalStore } from "../store/use-delete-question-paper-modal-store"
import { useDuplicateQuestionPaperModalStore } from "../store/use-duplicate-question-paper-modal-store"
import { QuestionPaperPageHeader } from "./question-paper-page-header"
import { QuestionPaperStatsCards } from "./question-paper-stats-cards"
import { QuestionPaperFilterBar } from "./question-paper-filter-bar"
import { QuestionPaperDataTable, type QuestionPaperItem } from "./question-paper-data-table"
import { useQuestionPaperSearchParams } from "../hooks/use-question-paper-search-params"
import { DeleteQuestionPaperModal } from "./delete-question-paper-modal"
import { DuplicateQuestionPaperModal } from "./duplicate-question-paper-modal"
import { trpc } from "@/trpc/client"
import { useQuery } from "@tanstack/react-query"

export function QuestionPaperManagementView() {
  const router = useRouter()
  const [
    { search: searchQuery, classId: selectedClassId, status: selectedStatus, sort: selectedSort, page: currentPage, limit },
    setSearchParams,
  ] = useQuestionPaperSearchParams()

  const openDeleteModal = useDeleteQuestionPaperModalStore((state) => state.openModal)
  const openDuplicateModal = useDuplicateQuestionPaperModalStore((state) => state.openModal)

  // Fetch paginated, sorted, and filtered question papers for the table
  const { data: listData, isLoading, isError } = useQuestionPapersList({
    limit,
    page: currentPage,
    search: searchQuery || undefined,
    classId: selectedClassId === "All" ? undefined : selectedClassId,
    status: selectedStatus === "All" ? undefined : (selectedStatus as any),
    sort: selectedSort,
  })

  // Fetch all question papers for global stats
  const { data: statsData } = useQuestionPapersList({
    limit: 1000,
  })

  // Safely fetch classes list (using try-catch/fallback if the user is not superadmin)
  const { data: classesData } = useQuery({
    ...trpc.academicClass.list.queryOptions({ limit: 100 }),
    retry: false,
    refetchOnWindowFocus: false,
  })
  const classes = classesData?.academicClasses ?? []

  const pagedItems = (listData?.papers as QuestionPaperItem[]) ?? []
  const totalItems = listData?.totalItems ?? 0
  const totalPages = Math.ceil(totalItems / limit) || 1

  // Stats
  const allPapers = statsData?.papers ?? []
  const totalPapers = allPapers.length
  const publishedPapers = allPapers.filter((p) => p.status === "Published").length
  const templatePapers = allPapers.filter((p) => p.isTemplate).length
  const averageMarks = allPapers.length > 0 ? Math.round(allPapers.reduce((sum, p) => sum + p.total, 0) / allPapers.length) : 0

  return (
    <div className="w-full">
      {/* Header */}
      <QuestionPaperPageHeader />

      {/* Stats cards */}
      <QuestionPaperStatsCards
        totalPapers={totalPapers}
        publishedPapers={publishedPapers}
        templatePapers={templatePapers}
        averageMarks={averageMarks}
        isLoading={isLoading}
      />

      {/* Filters */}
      <QuestionPaperFilterBar
        searchQuery={searchQuery}
        onSearchChange={(search) => setSearchParams({ search, page: 1 })}
        selectedClassId={selectedClassId}
        onClassChange={(classId) => setSearchParams({ classId, page: 1 })}
        selectedStatus={selectedStatus}
        onStatusChange={(status) => setSearchParams({ status, page: 1 })}
        selectedSort={selectedSort}
        onSortChange={(sort) => setSearchParams({ sort: sort as any, page: 1 })}
        classes={classes}
      />

      {/* Data Table */}
      <QuestionPaperDataTable
        items={pagedItems}
        isLoading={isLoading}
        isError={isError}
        onEdit={(item) => router.push(`/question-papers/${item.id}/edit`)}
        onDuplicate={(id, title) => openDuplicateModal(id, title)}
        onDelete={(id, title) => openDeleteModal(id, title)}
        currentPage={currentPage}
        itemsPerPage={limit}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={(page) => setSearchParams({ page })}
        onLimitChange={(newLimit) => setSearchParams({ limit: newLimit, page: 1 })}
      />

      {/* Modals */}
      <DeleteQuestionPaperModal />
      <DuplicateQuestionPaperModal />
    </div>
  )
}
