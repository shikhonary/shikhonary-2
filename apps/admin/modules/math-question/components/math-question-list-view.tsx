"use client"

import { useState } from "react"
import Link from "next/link"
import {
  useMathQuestionsList,
  useMathQuestionStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
  useBoardYearsForSelection,
  useDeleteMathQuestion,
  useBulkDeleteMathQuestions,
} from "../services/use-math-question"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { toBengaliDigits } from "@workspace/utils/helpers/bengali"
import { Calculator, Plus, Upload } from "lucide-react"
import { MathQuestionStatsCards } from "./math-question-stats-cards"
import { MathQuestionFilters } from "./math-question-filters"
import { MathQuestionTable } from "./math-question-table"
import { useMathQuestionSearchParams, type MathQuestionSortOption } from "../hooks/use-math-question-search-params"

export function MathQuestionListView() {
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
  ] = useMathQuestionSearchParams()

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

  const deleteMutation = useDeleteMathQuestion()
  const bulkDeleteMutation = useBulkDeleteMathQuestions()

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync({ id: deleteTarget.id })
      toast.success("গণিত প্রশ্নটি সফলভাবে মুছে ফেলা হয়েছে।")
      setDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || "গণিত প্রশ্ন ডিলিট করা সম্ভব হয়নি")
    }
  }

  const handleConfirmBulkDelete = async () => {
    if (!bulkDeleteTarget) return
    try {
      const res = await bulkDeleteMutation.mutateAsync({ ids: bulkDeleteTarget })
      toast.success(`সফলভাবে ${toBengaliDigits(res.deletedCount)}টি গণিত প্রশ্ন মুছে ফেলা হয়েছে।`)
      setBulkDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || "গণিত প্রশ্ন ডিলিট করা সম্ভব হয়নি")
    }
  }

  // Parse board / year
  let boardSource: string | undefined = undefined
  let boardYear: number | undefined = undefined
  if (selectedBoard !== "All") {
    const parts = selectedBoard.split("-")
    const possibleYear = Number(parts[parts.length - 1])
    if (!isNaN(possibleYear) && parts.length > 1) {
      boardYear = possibleYear
      boardSource = parts.slice(0, parts.length - 1).join("-")
    } else {
      boardSource = selectedBoard
    }
  }

  // Dependent queries
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedAcademicClassId && selectedAcademicClassId !== "All"
      ? { academicClassId: selectedAcademicClassId }
      : undefined
  )

  const { data: chapters = [] } = useChaptersForSelection(
    selectedSubjectId && selectedSubjectId !== "All"
      ? { subjectId: selectedSubjectId }
      : undefined
  )

  const { data: boardYears = [] } = useBoardYearsForSelection(
    selectedSubjectId && selectedSubjectId !== "All"
      ? {
          subjectId: selectedSubjectId,
          chapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
        }
      : undefined
  )

  // Primary list query
  const {
    data: listData,
    isLoading: isListLoading,
    isError,
  } = useMathQuestionsList({
    query: searchQuery || undefined,
    academicClassId: selectedAcademicClassId === "All" ? undefined : selectedAcademicClassId,
    subjectId: selectedSubjectId === "All" ? undefined : selectedSubjectId,
    academicChapterId: selectedChapterId === "All" ? undefined : selectedChapterId,
    source: boardSource,
    year: boardYear,
    sort: selectedSort === "All" ? undefined : selectedSort,
    page: currentPage,
    limit,
  })

  // Summary statistics query
  const { data: statsData, isLoading: isStatsLoading } = useMathQuestionStats({
    academicClassId: selectedAcademicClassId === "All" ? undefined : selectedAcademicClassId,
    subjectId: selectedSubjectId === "All" ? undefined : selectedSubjectId,
    academicChapterId: selectedChapterId === "All" ? undefined : selectedChapterId,
  })

  const items = listData?.items ?? []
  const totalItems = listData?.totalItems ?? 0
  const totalPages = listData?.totalPages ?? 1

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Shared Page Header matching MCQ Blueprint */}
      <PageHeader
        title="গণিত প্রশ্ন ব্যাংক (Math Question)"
        description="প্রাথমিক ও মাধ্যমিক শ্রেণির অধ্যায়ভিত্তিক গণিত সমস্যা ও সমাধান ব্যবস্থাপনা করুন।"
        badge={{ label: "Math Question মডিউল", variant: "indigo" }}
        icon={Calculator}
        action={{
          label: "নতুন গণিত প্রশ্ন যোগ করুন",
          href: "/math-questions/create",
          icon: Plus,
        }}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-foreground font-semibold text-xs sm:text-sm gap-2 font-headline"
        >
          <Link href="/math-questions/import" prefetch={true}>
            <Upload className="w-4 h-4" />
            <span>JSON ইমপোর্ট</span>
          </Link>
        </Button>
      </PageHeader>

      {/* Summary Counts Cards */}
      <MathQuestionStatsCards
        totalCount={statsData?.totalCount}
        activeCount={statsData?.activeCount}
        inactiveCount={statsData?.inactiveCount}
        mathCount={statsData?.mathCount}
        isLoading={isStatsLoading || isListLoading}
      />

      {/* Filters Form */}
      <MathQuestionFilters
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
        boardYears={boardYears}
        selectedSort={selectedSort}
        onSortChange={(sort) => setSearchParams({ sort: sort as MathQuestionSortOption, page: 1 })}
      />

      {/* Questions List Cards & Table */}
      <MathQuestionTable
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
        title="গণিত প্রশ্ন ডিলিট করতে চান?"
        itemName={deleteTarget?.question}
        warningText="এই গণিত প্রশ্নটি ডিলিট করলে এটি স্থায়ীভাবে মুছে যাবে।"
        isLoading={deleteMutation.isPending}
      />

      {/* Shared Bulk Delete Modal */}
      <ConfirmDeleteDialog
        isOpen={Boolean(bulkDeleteTarget && bulkDeleteTarget.length > 0)}
        onClose={() => setBulkDeleteTarget(null)}
        onConfirm={handleConfirmBulkDelete}
        title="নির্বাচিত গণিত প্রশ্নগুলো ডিলিট করতে চান?"
        itemName={bulkDeleteTarget ? `${toBengaliDigits(bulkDeleteTarget.length)}টি গণিত প্রশ্ন` : ""}
        warningText="নির্বাচিত গণিত প্রশ্নসমূহ স্থায়ীভাবে মুছে ফেলা হবে।"
        isLoading={bulkDeleteMutation.isPending}
      />
    </div>
  )
}
