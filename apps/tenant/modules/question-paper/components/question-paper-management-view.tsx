"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@workspace/ui/components/sonner"
import { useQuestionPapersList, useQuestionPaperStats, useGenerateAnswerPaper } from "../services/use-question-paper"
import { useDeleteQuestionPaperModalStore } from "../store/use-delete-question-paper-modal-store"
import { useRenameQuestionPaperModalStore } from "../store/use-rename-question-paper-modal-store"
import { usePublishQuestionPaperModalStore } from "../store/use-publish-question-paper-modal-store"
import { useSaveAsTemplateModalStore } from "../store/use-save-as-template-modal-store"
import { QuestionPaperPageHeader } from "./question-paper-page-header"
import { QuestionPaperStatsCards } from "./question-paper-stats-cards"
import { QuestionPaperFilterBar } from "./question-paper-filter-bar"
import { QuestionPaperDataTable, type QuestionPaperItem } from "./question-paper-data-table"
import { QuestionPaperPagination } from "./question-paper-pagination"
import { QuestionPaperTemplatesTab } from "./question-paper-templates-tab"
import { useQuestionPaperSearchParams } from "../hooks/use-question-paper-search-params"
import { DeleteQuestionPaperModal } from "./delete-question-paper-modal"
import { RenameQuestionPaperModal } from "./rename-question-paper-modal"
import { PublishQuestionPaperModal } from "./publish-question-paper-modal"
import { trpc } from "@/trpc/client"
import { useQuery } from "@tanstack/react-query"
import { FileText, Bookmark } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

export function QuestionPaperManagementView() {
  const router = useRouter()
  const [
    { search: searchQuery, classId: selectedClassId, status: selectedStatus, sort: selectedSort, viewMode, page: currentPage, limit },
    setSearchParams,
  ] = useQuestionPaperSearchParams()

  const openDeleteModal = useDeleteQuestionPaperModalStore((state) => state.openModal)
  const openRenameModal = useRenameQuestionPaperModalStore((state) => state.openModal)
  const openPublishModal = usePublishQuestionPaperModalStore((state) => state.openModal)
  const openSaveAsTemplateModal = useSaveAsTemplateModalStore((state) => state.openModal)
  const [activeMainTab, setActiveMainTab] = useState<"papers" | "templates">("papers")
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

      {/* View Tabs: All Question Papers vs Saved Blueprint Templates */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <button
          type="button"
          onClick={() => setActiveMainTab("papers")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-headline transition-all cursor-pointer flex items-center gap-2 border",
            activeMainTab === "papers"
              ? "bg-primary text-primary-foreground border-primary shadow-xs"
              : "bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50"
          )}
        >
          <FileText className="w-4 h-4" />
          <span>সকল প্রশ্নপত্র</span>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[11px] font-headline",
              activeMainTab === "papers" ? "bg-primary-foreground/20 text-inherit" : "bg-muted text-muted-foreground"
            )}
          >
            {totalPapers}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("templates")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-headline transition-all cursor-pointer flex items-center gap-2 border",
            activeMainTab === "templates"
              ? "bg-primary text-primary-foreground border-primary shadow-xs"
              : "bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50"
          )}
        >
          <Bookmark className="w-4 h-4" />
          <span>ব্লুপ্রিন্ট টেমপ্লেটসমূহ</span>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[11px] font-headline",
              activeMainTab === "templates" ? "bg-primary-foreground/20 text-inherit" : "bg-muted text-muted-foreground"
            )}
          >
            {templatePapers}
          </span>
        </button>
      </div>

      {activeMainTab === "papers" ? (
        <>
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
            onRename={(id, title) => openRenameModal(id, title)}
            onPublish={(id, title) => openPublishModal(id, title)}
            onSaveAsTemplate={(id, title) =>
              openSaveAsTemplateModal({ paperId: id, initialTitle: `${title} - ব্লুপ্রিন্ট টেমপ্লেট` })
            }
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
        </>
      ) : (
        <QuestionPaperTemplatesTab />
      )}

      {/* Modals */}
      <DeleteQuestionPaperModal />
      <RenameQuestionPaperModal />
      <PublishQuestionPaperModal />
    </div>
  )
}
