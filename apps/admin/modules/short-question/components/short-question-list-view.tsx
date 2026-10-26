"use client"

import { useState } from "react"
import Link from "next/link"
import {
  useShortQuestionsList,
  useShortQuestionStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
  useDeleteShortQuestion,
  useBulkDeleteShortQuestions,
} from "../services/use-short-question"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { toBengaliDigits } from "@workspace/utils/helpers/bengali"
import { HelpCircle, Plus, Upload } from "lucide-react"
import { ShortQuestionStatsCards } from "./short-question-stats-cards"
import { ShortQuestionFilters } from "./short-question-filters"
import { ShortQuestionTable } from "./short-question-table"
import { useShortQuestionSearchParams, type ShortQuestionSortOption } from "../hooks/use-short-question-search-params"

export function ShortQuestionListView() {
  const [
    {
      query: searchQuery,
      classId: selectedAcademicClassId,
      subjectId: selectedSubjectId,
      chapterId: selectedChapterId,
      board: selectedBoard,
      sort: selectedSort,
      page: currentPage,
      limit,
    },
    setSearchParams,
  ] = useShortQuestionSearchParams()

  const { data: academicClasses = [] } = useAcademicClassesForSelection()

  const handleAcademicClassChange = (classId: string) => {
    setSearchParams({
      classId,
      subjectId: "All",
      chapterId: "All",
      board: "All",
      page: 1,
    })
  }

  // Local state for single & bulk delete (Zero Zustand stores)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; question: string } | null>(null)
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState<string[] | null>(null)

  const deleteMutation = useDeleteShortQuestion()
  const bulkDeleteMutation = useBulkDeleteShortQuestions()

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync({ id: deleteTarget.id })
      toast.success("সংক্ষিপ্ত প্রশ্নটি সফলভাবে মুছে ফেলা হয়েছে।")
      setDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || "সংক্ষিপ্ত প্রশ্ন ডিলিট করা সম্ভব হয়নি")
    }
  }

  const handleConfirmBulkDelete = async () => {
    if (!bulkDeleteTarget) return
    try {
      const res = await bulkDeleteMutation.mutateAsync({ ids: bulkDeleteTarget })
      toast.success(`সফলভাবে ${toBengaliDigits(res.deletedCount)}টি সংক্ষিপ্ত প্রশ্ন মুছে ফেলা হয়েছে।`)
      setBulkDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || "সংক্ষিপ্ত প্রশ্ন ডিলিট করা সম্ভব হয়নি")
    }
  }

  // Parse board / year
  let boardSource: string | undefined = undefined
  let boardYear: number | undefined = undefined
  if (selectedBoard && selectedBoard !== "All") {
    const parts = selectedBoard.split("-")
    const lastPart = parts[parts.length - 1]
    if (lastPart && /^\d+$/.test(lastPart) && parts.length > 1) {
      boardSource = parts.slice(0, -1).join("-")
      boardYear = parseInt(lastPart, 10)
    } else {
      boardSource = selectedBoard
    }
  }

  // Query subjects & chapters for dropdown filters
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedAcademicClassId !== "All" ? { academicClassId: selectedAcademicClassId } : undefined
  )
  const { data: chapters = [] } = useChaptersForSelection(
    selectedSubjectId !== "All" ? { subjectId: selectedSubjectId } : undefined
  )

  // Query stats
  const { data: statsData, isLoading: isStatsLoading } = useShortQuestionStats(
    selectedSubjectId !== "All" || selectedChapterId !== "All" || selectedAcademicClassId !== "All"
      ? {
          academicClassId: selectedAcademicClassId !== "All" ? selectedAcademicClassId : undefined,
          subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
          chapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
        }
      : undefined
  )

  // Query list
  const {
    data: listData,
    isLoading: isListLoading,
    isError,
  } = useShortQuestionsList({
    limit,
    page: currentPage,
    search: searchQuery || undefined,
    academicClassId: selectedAcademicClassId !== "All" ? selectedAcademicClassId : undefined,
    subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
    chapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
    source: boardSource,
    year: boardYear,
    sort: selectedSort === "All" ? undefined : selectedSort,
  })

  const items = listData?.items ?? []
  const totalItems = listData?.totalItems ?? items.length
  const totalPages = listData?.totalPages ?? 1

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Shared Page Header */}
      <PageHeader
        title="সংক্ষিপ্ত প্রশ্ন ব্যাংক (Short Question)"
        description="শ্রেণি, বিষয় ও অধ্যায়ভিত্তিক সংক্ষিপ্ত প্রশ্ন ও তথ্য পরিচালনা করুন।"
        icon={HelpCircle}
        badge={{ label: "সংক্ষিপ্ত প্রশ্ন", variant: "indigo" }}
        breadcrumbs={[
          { label: "সংক্ষিপ্ত প্রশ্ন ব্যাংক" },
        ]}
        action={{
          label: "নতুন প্রশ্ন যোগ করুন",
          href: "/short-questions/create",
          icon: Plus,
        }}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-foreground font-semibold text-xs sm:text-sm gap-2 font-headline"
        >
          <Link href="/short-questions/import" prefetch={true}>
            <Upload className="w-4 h-4" />
            <span>JSON ইমপোর্ট</span>
          </Link>
        </Button>
      </PageHeader>

      {/* Summary Counts Cards */}
      <ShortQuestionStatsCards
        totalCount={statsData?.totalCount}
        activeCount={statsData?.activeCount}
        inactiveCount={statsData?.inactiveCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isStatsLoading || isListLoading}
      />

      {/* Filters Form */}
      <ShortQuestionFilters
        searchQuery={searchQuery}
        onSearchChange={(query) => setSearchParams({ query, page: 1 })}
        selectedAcademicClassId={selectedAcademicClassId}
        onAcademicClassChange={handleAcademicClassChange}
        academicClasses={academicClasses}
        selectedSubjectId={selectedSubjectId}
        onSubjectChange={(subjectId) => setSearchParams({ subjectId, chapterId: "All", board: "All", page: 1 })}
        subjects={subjects}
        selectedChapterId={selectedChapterId}
        onChapterChange={(chapterId) => setSearchParams({ chapterId, board: "All", page: 1 })}
        chapters={chapters}
        selectedBoard={selectedBoard}
        onBoardChange={(board) => setSearchParams({ board, page: 1 })}
        selectedSort={selectedSort}
        onSortChange={(sort) => setSearchParams({ sort: sort as ShortQuestionSortOption, page: 1 })}
      />

      {/* Questions List Cards & Table */}
      <ShortQuestionTable
        items={items as any}
        isLoading={isListLoading}
        isError={isError}
        onDelete={(id, snippet) => setDeleteTarget({ id, question: snippet })}
        onBulkDelete={(ids) => setBulkDeleteTarget(ids)}
        currentPage={currentPage}
        itemsPerPage={limit}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={(page) => setSearchParams({ page })}
        onLimitChange={(newLimit) => setSearchParams({ limit: newLimit, page: 1 })}
      />

      {/* Shared Single Delete Modal */}
      <ConfirmDeleteDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="সংক্ষিপ্ত প্রশ্ন ডিলিট করতে চান?"
        itemName={deleteTarget?.question}
        warningText="এই সংক্ষিপ্ত প্রশ্নটি ডিলিট করলে এটি স্থায়ীভাবে মুছে যাবে।"
        isLoading={deleteMutation.isPending}
      />

      {/* Shared Bulk Delete Modal */}
      <ConfirmDeleteDialog
        isOpen={Boolean(bulkDeleteTarget && bulkDeleteTarget.length > 0)}
        onClose={() => setBulkDeleteTarget(null)}
        onConfirm={handleConfirmBulkDelete}
        title="নির্বাচিত সংক্ষিপ্ত প্রশ্নগুলো ডিলিট করতে চান?"
        itemName={bulkDeleteTarget ? `${toBengaliDigits(bulkDeleteTarget.length)}টি সংক্ষিপ্ত প্রশ্ন` : ""}
        warningText="নির্বাচিত সংক্ষিপ্ত প্রশ্নসমূহ স্থায়ীভাবে মুছে ফেলা হবে।"
        isLoading={bulkDeleteMutation.isPending}
      />
    </div>
  )
}
