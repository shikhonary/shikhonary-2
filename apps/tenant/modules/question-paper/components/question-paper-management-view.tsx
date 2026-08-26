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

  // Fetch all question papers (we set a higher limit to handle client-side sorting/filtering)
  const { data: listData, isLoading, isError } = useQuestionPapersList({
    limit: 100,
    search: undefined,
  })

  // Safely fetch classes list (using try-catch/fallback if the user is not superadmin)
  const { data: classesData } = useQuery({
    ...trpc.academicClass.list.queryOptions({ limit: 100 }),
    retry: false,
    refetchOnWindowFocus: false,
  })
  const classes = classesData?.academicClasses ?? []

  const papers = (listData?.papers as QuestionPaperItem[]) ?? []

  // Process items (filter, sort) client-side
  const processedItems = papers
    .filter((item) => {
      const matchesSearch = searchQuery
        ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.examName.toLowerCase().includes(searchQuery.toLowerCase())
        : true
      const matchesClass = selectedClassId && selectedClassId !== "All" ? item.classId === selectedClassId : true
      const matchesStatus = selectedStatus && selectedStatus !== "All" ? item.status === selectedStatus : true
      return matchesSearch && matchesClass && matchesStatus
    })
    .sort((a, b) => {
      if (selectedSort === "title_asc") return a.title.localeCompare(b.title)
      if (selectedSort === "title_desc") return b.title.localeCompare(a.title)
      if (selectedSort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (selectedSort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() // default newest
    })

  // Pagination calculations
  const totalItems = processedItems.length
  const totalPages = Math.ceil(totalItems / limit) || 1
  const pagedItems = processedItems.slice((currentPage - 1) * limit, currentPage * limit)

  // Stats
  const totalPapers = papers.length
  const publishedPapers = papers.filter((p) => p.status === "Published").length
  const templatePapers = papers.filter((p) => p.isTemplate).length
  const averageMarks = papers.length > 0 ? Math.round(papers.reduce((sum, p) => sum + p.total, 0) / papers.length) : 0

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
