"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  useShortAnswersList,
  useShortAnswerStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
  useDeleteShortAnswer,
  useBulkDeleteShortAnswers,
  useResolveShortAnswerReport,
  useAssignShortAnswerReport,
} from "../services/use-short-answer"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { ResolveReportDialog } from "@/components/shared/resolve-report-dialog"
import { AssignReportDialog } from "@/components/shared/assign-report-dialog"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { HelpCircle, Plus, Upload } from "lucide-react"
import { ShortAnswerStatsCards } from "./short-answer-stats-cards"
import { ShortAnswerFilters } from "./short-answer-filters"
import { ShortAnswerTable, type ShortAnswerItem } from "./short-answer-table"
import { useShortAnswerSearchParams } from "../hooks/use-short-answer-search-params"

export function ShortAnswerListView() {
  const { data: academicClasses = [] } = useAcademicClassesForSelection()

  const [
    {
      query: searchQuery,
      academicClassId: selectedAcademicClassId,
      subjectId: selectedSubjectId,
      chapterId: selectedChapterId,
      board: selectedBoard,
      isActive: selectedIsActive,
      hasReport: selectedHasReport,
      sort: selectedSort,
      page: currentPage,
      limit,
    },
    setSearchParams,
  ] = useShortAnswerSearchParams()

  const searchParams = useSearchParams()
  const queryString = searchParams?.toString()
  const buildEditHref = (id: string) =>
    queryString ? `/short-answers/${id}/edit?${queryString}` : `/short-answers/${id}/edit`

  const handleAcademicClassChange = (academicClassId: string) => {
    setSearchParams({
      academicClassId,
      subjectId: "All",
      chapterId: "All",
      board: "All",
      page: 1,
    })
  }

  // Local state for delete & report dialogs
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; question: string } | null>(null)
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState<string[] | null>(null)
  const [resolveTarget, setResolveTarget] = useState<ShortAnswerItem | null>(null)
  const [assignTarget, setAssignTarget] = useState<ShortAnswerItem | null>(null)

  const deleteMutation = useDeleteShortAnswer()
  const bulkDeleteMutation = useBulkDeleteShortAnswers()
  const resolveReportMutation = useResolveShortAnswerReport()
  const assignReportMutation = useAssignShortAnswerReport()

  const handleConfirmResolve = async (resolvedNote?: string) => {
    if (!resolveTarget) return
    try {
      await resolveReportMutation.mutateAsync({
        shortAnswerId: resolveTarget.id,
        resolvedNote,
      })
      toast.success("সংক্ষিপ্ত উত্তর রিপোর্টটি সফলভাবে সমাধান করা হয়েছে।")
      setResolveTarget(null)
    } catch (err: any) {
      toast.error(err.message || "রিপোর্ট সমাধান করতে সমস্যা হয়েছে")
    }
  }

  const handleConfirmAssign = async ({
    assigneeId,
    note,
    reportId,
  }: {
    assigneeId: string
    note?: string
    reportId?: string
  }) => {
    if (!assignTarget) return
    try {
      await assignReportMutation.mutateAsync({
        shortAnswerId: assignTarget.id,
        assignedToId: assigneeId,
        reportId,
        note,
      })
      toast.success("রিপোর্টের দায়িত্ব সফলভাবে অর্পণ (Assign) করা হয়েছে।")
      setAssignTarget(null)
    } catch (err: any) {
      toast.error(err.message || "রিপোর্ট অ্যাসাইন করতে সমস্যা হয়েছে")
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync({ id: deleteTarget.id })
      toast.success("সংক্ষিপ্ত উত্তর প্রশ্নটি সফলভাবে মুছে ফেলা হয়েছে।")
      setDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || "সংক্ষিপ্ত উত্তর ডিলিট করা সম্ভব হয়নি")
    }
  }

  const handleConfirmBulkDelete = async () => {
    if (!bulkDeleteTarget) return
    try {
      const res = await bulkDeleteMutation.mutateAsync({ ids: bulkDeleteTarget })
      toast.success(`সফলভাবে ${res.deletedCount}টি সংক্ষিপ্ত উত্তর প্রশ্ন মুছে ফেলা হয়েছে।`)
      setBulkDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || "সংক্ষিপ্ত উত্তর ডিলিট করা সম্ভব হয়নি")
    }
  }

  // Query Short Answers list with search & filters
  const { data: shortAnswersData, isLoading, isError } = useShortAnswersList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    academicClassId: selectedAcademicClassId !== "All" ? selectedAcademicClassId : undefined,
    subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
    chapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
    board: selectedBoard !== "All" ? selectedBoard : undefined,
    isActive: selectedIsActive !== "All" ? selectedIsActive : undefined,
    hasReport: selectedHasReport !== "All" ? selectedHasReport : undefined,
    sort: selectedSort,
  })

  // Fetch Board + Reference combinations (scoped by class / subject / chapter if selected)
  const { data: boardYearsData } = useQuery({
    ...trpc.shortAnswer.boardYears.queryOptions({
      academicClassId: selectedAcademicClassId !== "All" ? selectedAcademicClassId : undefined,
      subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
      chapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
    }),
  })
  const boardYears = boardYearsData ?? []

  // Query Short Answer stats
  const { data: statsData } = useShortAnswerStats(
    selectedAcademicClassId !== "All" || selectedSubjectId !== "All" || selectedChapterId !== "All"
      ? {
          academicClassId:
            selectedAcademicClassId !== "All" ? selectedAcademicClassId : undefined,
          subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
          chapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
        }
      : undefined
  )

  // Query subjects & chapters for dropdown filters
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedAcademicClassId !== "All" ? { academicClassId: selectedAcademicClassId } : undefined
  )
  const { data: chapters = [] } = useChaptersForSelection(
    selectedSubjectId !== "All" ? { subjectId: selectedSubjectId } : undefined
  )

  const items = shortAnswersData?.items ?? []
  const totalItems = shortAnswersData?.totalItems ?? items.length
  const totalPages = shortAnswersData?.totalPages ?? 1

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Shared Page Header */}
      <PageHeader
        title="সংক্ষিপ্ত উত্তর প্রশ্ন ব্যাংক"
        description="শ্রেণি, বিষয় ও অধ্যায়ভিত্তিক সংক্ষিপ্ত উত্তর প্রশ্ন, অপশন, আদর্শ উত্তর ও ব্যাখ্যা পরিচালনা করুন।"
        icon={HelpCircle}
        badge={{ label: "সংক্ষিপ্ত উত্তর মডিউল", variant: "indigo" }}
        action={{
          label: "নতুন প্রশ্ন যোগ করুন",
          href: "/short-answers/create",
          icon: Plus,
        }}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-foreground font-semibold text-xs sm:text-sm gap-2"
        >
          <Link href="/short-answers/import" prefetch={true}>
            <Upload className="w-4 h-4" />
            <span>JSON ইমপোর্ট</span>
          </Link>
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <ShortAnswerStatsCards
        totalCount={statsData?.totalCount}
        activeCount={statsData?.activeCount}
        inactiveCount={statsData?.inactiveCount}
        mathCount={statsData?.mathCount}
        isLoading={isLoading}
      />

      {/* Filters */}
      <ShortAnswerFilters
        searchQuery={searchQuery}
        onSearchChange={(query) => setSearchParams({ query, page: 1 })}
        selectedAcademicClassId={selectedAcademicClassId}
        onAcademicClassChange={handleAcademicClassChange}
        academicClasses={academicClasses}
        selectedSubjectId={selectedSubjectId}
        onSubjectChange={(subjectId) =>
          setSearchParams({ subjectId, chapterId: "All", board: "All", page: 1 })
        }
        subjects={subjects}
        selectedChapterId={selectedChapterId}
        onChapterChange={(chapterId) => setSearchParams({ chapterId, board: "All", page: 1 })}
        chapters={chapters}
        selectedBoard={selectedBoard}
        onBoardChange={(board) => setSearchParams({ board, page: 1 })}
        boardYears={boardYears}
        selectedIsActive={selectedIsActive}
        onIsActiveChange={(isActive) => setSearchParams({ isActive, page: 1 })}
        selectedHasReport={selectedHasReport}
        onHasReportChange={(hasReport) => setSearchParams({ hasReport, page: 1 })}
        selectedSort={selectedSort}
        onSortChange={(sort) => setSearchParams({ sort: sort as any, page: 1 })}
      />

      {/* Data Table / Question Cards */}
      <ShortAnswerTable
        items={items as any}
        isLoading={isLoading}
        isError={isError}
        onDelete={(id, question) => setDeleteTarget({ id, question })}
        onBulkDelete={(selectedIds) => setBulkDeleteTarget(selectedIds)}
        onResolveReport={(item) => setResolveTarget(item)}
        onAssignReport={(item) => setAssignTarget(item)}
        currentPage={currentPage}
        itemsPerPage={limit}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={(page) => setSearchParams({ page })}
        onLimitChange={(newLimit) => setSearchParams({ limit: newLimit, page: 1 })}
      />

      {/* Reusable Resolve Report Dialog */}
      <ResolveReportDialog
        isOpen={Boolean(resolveTarget)}
        onClose={() => setResolveTarget(null)}
        entityName="সংক্ষিপ্ত উত্তর প্রশ্ন"
        entityDetails={
          resolveTarget
            ? {
                subjectName: resolveTarget.subject?.nameBn || resolveTarget.subject?.nameEn,
                chapterName: resolveTarget.chapter?.nameBn || resolveTarget.chapter?.nameEn,
                clueText: resolveTarget.question,
                editHref: buildEditHref(resolveTarget.id),
                editLabel: "প্রশ্ন এডিট পেজে যান",
              }
            : undefined
        }
        reports={resolveTarget?.reports}
        onConfirmResolve={handleConfirmResolve}
        isLoading={resolveReportMutation.isPending}
      />

      {/* Reusable Assign Report Dialog */}
      <AssignReportDialog
        isOpen={Boolean(assignTarget)}
        onClose={() => setAssignTarget(null)}
        entityName="সংক্ষিপ্ত উত্তর প্রশ্ন"
        entityDetails={
          assignTarget
            ? {
                subjectName: assignTarget.subject?.nameBn || assignTarget.subject?.nameEn,
                chapterName: assignTarget.chapter?.nameBn || assignTarget.chapter?.nameEn,
                clueText: assignTarget.question,
                editHref: buildEditHref(assignTarget.id),
                editLabel: "প্রশ্ন এডিট পেজে যান",
              }
            : undefined
        }
        reports={assignTarget?.reports}
        onConfirmAssign={handleConfirmAssign}
        isLoading={assignReportMutation.isPending}
      />

      {/* Shared Single Delete Modal */}
      <ConfirmDeleteDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="সংক্ষিপ্ত উত্তর প্রশ্ন ডিলিট করতে চান?"
        itemName={deleteTarget?.question}
        warningText="এই প্রশ্নটি ডিলিট করলে এর সমস্ত সমাধান ও পরীক্ষা সংশ্লিষ্ট রেকর্ড প্রভাবিত হতে পারে।"
        isLoading={deleteMutation.isPending}
      />

      {/* Shared Bulk Delete Modal */}
      <ConfirmDeleteDialog
        isOpen={Boolean(bulkDeleteTarget && bulkDeleteTarget.length > 0)}
        onClose={() => setBulkDeleteTarget(null)}
        onConfirm={handleConfirmBulkDelete}
        title={`${bulkDeleteTarget?.length ?? 0}টি সংক্ষিপ্ত উত্তর ডিলিট নিশ্চিত করুন`}
        itemName={`${bulkDeleteTarget?.length ?? 0}টি নির্বাচিত প্রশ্ন`}
        warningText="নির্বাচিত সকল প্রশ্ন স্থায়ীভাবে মুছে যাবে। এটি আর ফেরানো সম্ভব নয়।"
        isLoading={bulkDeleteMutation.isPending}
      />
    </div>
  )
}
