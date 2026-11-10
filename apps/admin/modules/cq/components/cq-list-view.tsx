"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import {
  useCqsList,
  useCqStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
  useDeleteCq,
  useBulkDeleteCqs,
  useResolveCqReport,
  useAssignCqReport,
} from "../services/use-cq"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { ResolveReportDialog } from "@/components/shared/resolve-report-dialog"
import { AssignReportDialog } from "@/components/shared/assign-report-dialog"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { BookOpen, Plus, Upload } from "lucide-react"
import { CqStatsCards } from "./cq-stats-cards"
import { CqFilters } from "./cq-filters"
import { CqTable, type CqItem } from "./cq-table"
import { useCqSearchParams } from "../hooks/use-cq-search-params"

export function CqListView() {
  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState<string>("All")
  const { data: academicClasses = [] } = useAcademicClassesForSelection()

  const [
    {
      query: searchQuery,
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
  ] = useCqSearchParams()

  const handleAcademicClassChange = (classId: string) => {
    setSelectedAcademicClassId(classId)
    setSearchParams({
      subjectId: "All",
      chapterId: "All",
      board: "All",
      page: 1,
    })
  }

  // Local state for single & bulk delete
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; question: string } | null>(null)
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState<string[] | null>(null)
  const [resolveTarget, setResolveTarget] = useState<CqItem | null>(null)
  const [assignTarget, setAssignTarget] = useState<CqItem | null>(null)

  const deleteMutation = useDeleteCq()
  const bulkDeleteMutation = useBulkDeleteCqs()
  const resolveCqMutation = useResolveCqReport()
  const assignCqMutation = useAssignCqReport()

  const handleConfirmResolve = async (resolvedNote?: string) => {
    if (!resolveTarget) return
    try {
      await resolveCqMutation.mutateAsync({
        cqId: resolveTarget.id,
        resolvedNote,
      })
      toast.success("CQ রিপোর্টটি সফলভাবে সমাধান করা হয়েছে।")
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
      await assignCqMutation.mutateAsync({
        cqId: assignTarget.id,
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
      toast.success("CQ প্রশ্নটি সফলভাবে মুছে ফেলা হয়েছে।")
      setDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || "CQ ডিলিট করা সম্ভব হয়নি")
    }
  }

  const handleConfirmBulkDelete = async () => {
    if (!bulkDeleteTarget) return
    try {
      const res = await bulkDeleteMutation.mutateAsync({ ids: bulkDeleteTarget })
      toast.success(`সফলভাবে ${res.deletedCount}টি CQ মুছে ফেলা হয়েছে।`)
      setBulkDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || "CQ ডিলিট করা সম্ভব হয়নি")
    }
  }

  // Query CQs list with search & filters
  const { data: cqsData, isLoading, isError } = useCqsList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
    chapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
    board: selectedBoard !== "All" ? selectedBoard : undefined,
    isActive: selectedIsActive !== "All" ? selectedIsActive : undefined,
    hasReport: selectedHasReport !== "All" ? selectedHasReport : undefined,
    sort: selectedSort,
  })

  // Fetch Board + Reference combinations (scoped by subject / chapter if selected)
  const { data: boardYearsData } = useQuery({
    ...trpc.cq.boardYears.queryOptions({
      subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
      chapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
    }),
  })
  const boardYears = boardYearsData ?? []

  // Query CQ stats
  const { data: statsData } = useCqStats(
    selectedSubjectId !== "All" || selectedChapterId !== "All"
      ? {
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

  const items = cqsData?.items ?? []
  const totalItems = cqsData?.totalItems ?? items.length
  const totalPages = cqsData?.totalPages ?? 1

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Shared Page Header */}
      <PageHeader
        title="সৃজনশীল প্রশ্ন ব্যাংক (CQ)"
        description="শ্রেণি, বিষয় ও অধ্যায়ভিত্তিক সৃজনশীল প্রশ্ন, উদ্দীপক, ক/খ/গ/ঘ উপ-প্রশ্ন ও সমাধান পরিচালনা করুন।"
        icon={BookOpen}
        badge={{ label: "CQ মডিউল", variant: "indigo" }}
        action={{
          label: "নতুন CQ যোগ করুন",
          href: "/cqs/create",
          icon: Plus,
        }}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-foreground font-semibold text-xs sm:text-sm gap-2"
        >
          <Link href="/cqs/import" prefetch={true}>
            <Upload className="w-4 h-4" />
            <span>JSON ইমপোর্ট</span>
          </Link>
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <CqStatsCards
        totalCount={statsData?.totalCount}
        activeCount={statsData?.activeCount}
        inactiveCount={statsData?.inactiveCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isLoading}
      />

      {/* Filters */}
      <CqFilters
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
        selectedIsActive={selectedIsActive}
        onIsActiveChange={(isActive) => setSearchParams({ isActive, page: 1 })}
        selectedHasReport={selectedHasReport}
        onHasReportChange={(hasReport) => setSearchParams({ hasReport, page: 1 })}
        selectedSort={selectedSort}
        onSortChange={(sort) => setSearchParams({ sort: sort as any, page: 1 })}
      />

      {/* Data Table / Question Cards */}
      <CqTable
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

      {/* Reusable Resolve CQ Report Dialog */}
      <ResolveReportDialog
        isOpen={Boolean(resolveTarget)}
        onClose={() => setResolveTarget(null)}
        entityName="CQ প্রশ্ন"
        entityDetails={
          resolveTarget
            ? {
                subjectName: resolveTarget.subject?.nameBn || resolveTarget.subject?.nameEn,
                chapterName: resolveTarget.chapter?.nameBn || resolveTarget.chapter?.nameEn,
                clueText: resolveTarget.context ? `উদ্দীপক: ${resolveTarget.context}` : `ক: ${resolveTarget.questionA}`,
                editHref: `/cqs/${resolveTarget.id}/edit`,
                editLabel: "CQ এডিট পেজে যান",
              }
            : undefined
        }
        reports={resolveTarget?.reports}
        onConfirmResolve={handleConfirmResolve}
        isLoading={resolveCqMutation.isPending}
      />

      {/* Reusable Assign CQ Report Dialog */}
      <AssignReportDialog
        isOpen={Boolean(assignTarget)}
        onClose={() => setAssignTarget(null)}
        entityName="CQ প্রশ্ন"
        entityDetails={
          assignTarget
            ? {
                subjectName: assignTarget.subject?.nameBn || assignTarget.subject?.nameEn,
                chapterName: assignTarget.chapter?.nameBn || assignTarget.chapter?.nameEn,
                clueText: assignTarget.context ? `উদ্দীপক: ${assignTarget.context}` : `ক: ${assignTarget.questionA}`,
                editHref: `/cqs/${assignTarget.id}/edit`,
                editLabel: "CQ এডিট পেজে যান",
              }
            : undefined
        }
        reports={assignTarget?.reports}
        onConfirmAssign={handleConfirmAssign}
        isLoading={assignCqMutation.isPending}
      />

      {/* Shared Single Delete Modal */}
      <ConfirmDeleteDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="CQ প্রশ্ন ডিলিট করতে চান?"
        itemName={deleteTarget?.question}
        warningText="এই সৃজনশীল প্রশ্নটি ডিলিট করলে এর সমস্ত উদ্দীপক, উপ-প্রশ্ন (ক, খ, গ, ঘ) ও সমাধান মুছে যাবে।"
        isLoading={deleteMutation.isPending}
      />

      {/* Shared Bulk Delete Modal */}
      <ConfirmDeleteDialog
        isOpen={Boolean(bulkDeleteTarget && bulkDeleteTarget.length > 0)}
        onClose={() => setBulkDeleteTarget(null)}
        onConfirm={handleConfirmBulkDelete}
        title="নির্বাচিত CQ প্রশ্নগুলো ডিলিট করতে চান?"
        itemName={bulkDeleteTarget ? `${bulkDeleteTarget.length}টি সৃজনশীল প্রশ্ন` : ""}
        warningText="নির্বাচিত প্রশ্নসমূহ স্থায়ীভাবে মুছে ফেলা হবে এবং এর সাথে সংশ্লিষ্ট সমস্ত উপ-প্রশ্ন ও সমাধান মুছে যাবে।"
        isLoading={bulkDeleteMutation.isPending}
      />
    </div>
  )
}
