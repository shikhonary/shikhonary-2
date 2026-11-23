"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@workspace/ui/components/sonner"
import { useQuestionPapersList, useQuestionPaperStats, useGenerateAnswerPaper } from "../services/use-question-paper"
import { useDeleteQuestionPaperModalStore } from "../store/use-delete-question-paper-modal-store"
import { useDuplicateQuestionPaperModalStore } from "../store/use-duplicate-question-paper-modal-store"
import { QuestionPaperPageHeader } from "./question-paper-page-header"
import { QuestionPaperStatsCards } from "./question-paper-stats-cards"
import { QuestionPaperFilterBar } from "./question-paper-filter-bar"
import { QuestionPaperDataTable, type QuestionPaperItem } from "./question-paper-data-table"
import { QuestionPaperPagination } from "./question-paper-pagination"
import { useQuestionPaperSearchParams } from "../hooks/use-question-paper-search-params"
import { DeleteQuestionPaperModal } from "./delete-question-paper-modal"
import { DuplicateQuestionPaperModal } from "./duplicate-question-paper-modal"
import { trpc } from "@/trpc/client"
import { useQuery } from "@tanstack/react-query"

export function QuestionPaperManagementView() {
  const router = useRouter()
  const [
    { search: searchQuery, classId: selectedClassId, status: selectedStatus, sort: selectedSort, viewMode, page: currentPage, limit },
    setSearchParams,
  ] = useQuestionPaperSearchParams()

  const openDeleteModal = useDeleteQuestionPaperModalStore((state) => state.openModal)
  const openDuplicateModal = useDuplicateQuestionPaperModalStore((state) => state.openModal)
  const generateAnswerMutation = useGenerateAnswerPaper()
  const [generatingAnswerId, setGeneratingAnswerId] = useState<string | null>(null)

  const handleGenerateAnswer = async (id: string, title: string) => {
    setGeneratingAnswerId(id)
    try {
      await generateAnswerMutation.mutateAsync({ id })
      toast.success(`"${title}"-এর উত্তরপত্র সফলভাবে তৈরি হয়েছে।`)
    } catch (err: any) {
      toast.error(err?.message || "উত্তরপত্র তৈরি করা যায়নি।")
    } finally {
      setGeneratingAnswerId(null)
    }
  }

  // Fetch paginated, sorted, and filtered question papers for the table
  const { data: listData, isLoading, isError } = useQuestionPapersList({
    limit,
    page: currentPage,
    search: searchQuery || undefined,
    classId: selectedClassId === "All" ? undefined : selectedClassId,
    status: selectedStatus === "All" ? undefined : (selectedStatus as any),
    sort: selectedSort,
  })

  // Fetch global stats via dedicated optimized stats query
  const { data: statsData, isLoading: isStatsLoading } = useQuestionPaperStats()

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
  const totalPapers = statsData?.totalPapers ?? 0
  const publishedPapers = statsData?.publishedPapers ?? 0
  const templatePapers = statsData?.templatePapers ?? 0
  const averageMarks = statsData?.averageMarks ?? 0

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Header */}
      <QuestionPaperPageHeader />

      {/* Stats cards */}
      <QuestionPaperStatsCards
        totalPapers={totalPapers}
        publishedPapers={publishedPapers}
        templatePapers={templatePapers}
        averageMarks={averageMarks}
        isLoading={isLoading || isStatsLoading}
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
        viewMode={viewMode}
        onViewModeChange={(mode) => setSearchParams({ viewMode: mode })}
        classes={classes}
      />

      {/* Data Table / Card Grid */}
      <QuestionPaperDataTable
        items={pagedItems}
        isLoading={isLoading}
        isError={isError}
        viewMode={viewMode}
        onEdit={(item) => router.push(`/question-papers/${item.id}/edit`)}
        onDuplicate={(id, title) => openDuplicateModal(id, title)}
        onGenerateAnswer={handleGenerateAnswer}
        generatingAnswerId={generatingAnswerId}
        onDelete={(id, title) => openDeleteModal(id, title)}
      />

      {/* Pagination - Separated and styled like Subject Details View */}
      {!isLoading && !isError && totalItems > 0 && (
        <QuestionPaperPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          limit={limit}
          onPageChange={(page) => setSearchParams({ page })}
          onLimitChange={(newLimit) => setSearchParams({ limit: newLimit, page: 1 })}
        />
      )}

      {/* Modals */}
      <DeleteQuestionPaperModal />
      <DuplicateQuestionPaperModal />
    </div>
  )
}
