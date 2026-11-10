"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import Link from "next/link"
import {
  useParagraphsList,
  useParagraphStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
  useDeleteParagraph,
  useBulkDeleteParagraphs,
  useResolveParagraphReport,
  useAssignParagraphReport,
} from "../services/use-paragraph"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { ResolveReportDialog } from "@/components/shared/resolve-report-dialog"
import { AssignReportDialog } from "@/components/shared/assign-report-dialog"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { BookOpen, Plus, Upload } from "lucide-react"
import { ParagraphStatsCards } from "./paragraph-stats-cards"
import { ParagraphFilters } from "./paragraph-filters"
import { ParagraphTable, type ParagraphItem } from "./paragraph-table"
import { useParagraphSearchParams } from "../hooks/use-paragraph-search-params"

export function ParagraphListView() {
  const [params, setParams] = useParagraphSearchParams()

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; snippet: string } | null>(null)
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState<string[] | null>(null)
  const [resolveTarget, setResolveTarget] = useState<ParagraphItem | null>(null)
  const [assignTarget, setAssignTarget] = useState<ParagraphItem | null>(null)

  const deleteMutation = useDeleteParagraph()
  const bulkDeleteMutation = useBulkDeleteParagraphs()
  const resolveParagraphMutation = useResolveParagraphReport()
  const assignParagraphMutation = useAssignParagraphReport()

  const handleConfirmAssign = async (assignedToId: string, note?: string) => {
    if (!assignTarget) return
    try {
      await assignParagraphMutation.mutateAsync({
        paragraphId: assignTarget.id,
        assignedToId,
        note,
      })
      toast.success("অনুচ্ছেদের দায়িত্ব সফলভাবে অর্পণ করা হয়েছে।")
      setAssignTarget(null)
    } catch (err: any) {
      toast.error(err.message || "দায়িত্ব অর্পণ করতে সমস্যা হয়েছে")
    }
  }

  // Query selection options
  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: subjects = [] } = useSubjectsForSelection(
    params.classId !== "All" ? { academicClassId: params.classId } : undefined
  )
  const { data: chapters = [] } = useChaptersForSelection(
    params.subjectId !== "All" ? { subjectId: params.subjectId } : undefined
  )

  // Fetch Board + Reference combinations (scoped by subject / chapter / class if selected)
  const { data: boardYearsData } = useQuery({
    ...trpc.paragraph.boardYears.queryOptions({
      academicClassId: params.classId !== "All" ? params.classId : undefined,
      subjectId: params.subjectId !== "All" ? params.subjectId : undefined,
      chapterId: params.chapterId !== "All" ? params.chapterId : undefined,
    }),
  })
  const boardYears = boardYearsData ?? []

  const handleAcademicClassChange = (classId: string) => {
    setParams({
      classId,
      subjectId: "All",
      chapterId: "All",
      board: "All",
      page: 1,
    })
  }

  const handleConfirmResolve = async (resolvedNote?: string) => {
    if (!resolveTarget) return
    try {
      await resolveParagraphMutation.mutateAsync({
        paragraphId: resolveTarget.id,
        resolvedNote,
      })
      toast.success("অনুচ্ছেদ রিপোর্টটি সফলভাবে সমাধান করা হয়েছে।")
      setResolveTarget(null)
    } catch (err: any) {
      toast.error(err.message || "রিপোর্ট সমাধান করতে সমস্যা হয়েছে")
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync({ id: deleteTarget.id })
      toast.success("অনুচ্ছেদটি সফলভাবে মুছে ফেলা হয়েছে।")
      setDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || "অনুচ্ছেদ ডিলিট করা সম্ভব হয়নি")
    }
  }

  const handleConfirmBulkDelete = async () => {
    if (!bulkDeleteTarget) return
    try {
      const res = await bulkDeleteMutation.mutateAsync({ ids: bulkDeleteTarget })
      toast.success(`সফলভাবে ${res.deletedCount}টি অনুচ্ছেদ মুছে ফেলা হয়েছে।`)
      setBulkDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || "অনুচ্ছেদ ডিলিট করা সম্ভব হয়নি")
    }
  }

  // Query Paragraphs list with search & filters
  const { data: paragraphsData, isLoading, isError } = useParagraphsList({
    limit: params.limit,
    page: params.page,
    query: params.query || undefined,
    academicClassId: params.classId !== "All" ? params.classId : undefined,
    subjectId: params.subjectId !== "All" ? params.subjectId : undefined,
    chapterId: params.chapterId !== "All" ? params.chapterId : undefined,
    board: params.board !== "All" ? params.board : undefined,
    isActive: params.isActive !== "All" ? params.isActive : undefined,
    hasReport: params.hasReport !== "All" ? params.hasReport : undefined,
    sort: params.sort !== "All" ? params.sort : undefined,
  })

  // Query Paragraph stats
  const { data: statsData } = useParagraphStats(
    params.classId !== "All" || params.subjectId !== "All" || params.chapterId !== "All"
      ? {
          academicClassId: params.classId !== "All" ? params.classId : undefined,
          subjectId: params.subjectId !== "All" ? params.subjectId : undefined,
          chapterId: params.chapterId !== "All" ? params.chapterId : undefined,
        }
      : undefined
  )

  const items = paragraphsData?.items ?? []
  const totalItems = paragraphsData?.totalItems ?? items.length
  const totalPages = paragraphsData?.totalPages ?? 1

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Shared Page Header */}
      <PageHeader
        title="অনুচ্ছেদ ও কম্প্রিহেনশন প্রশ্ন ব্যাংক"
        description="শ্রেণি, বিষয় ও অধ্যায়ভিত্তিক অনুচ্ছেদ ও পাঠ সংক্ষেপ এক জায়গায় পরিচালনা করুন।"
        icon={BookOpen}
        badge={{ label: "অনুচ্ছেদ মডিউল", variant: "indigo" }}
        action={{
          label: "নতুন অনুচ্ছেদ যোগ করুন",
          href: "/paragraphs/create",
          icon: Plus,
        }}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-foreground font-semibold text-xs sm:text-sm gap-2"
        >
          <Link href="/paragraphs/import" prefetch={true}>
            <Upload className="w-4 h-4" />
            <span>JSON ইমপোর্ট</span>
          </Link>
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <ParagraphStatsCards
        totalCount={statsData?.totalCount}
        activeCount={statsData?.activeCount}
        inactiveCount={statsData?.inactiveCount}
        referenceCount={(statsData as any)?.referenceCount}
        isLoading={isLoading}
      />

      {/* Filters */}
      <ParagraphFilters
        searchQuery={params.query}
        onSearchChange={(query) => setParams({ query, page: 1 })}
        selectedAcademicClassId={params.classId}
        onAcademicClassChange={handleAcademicClassChange}
        academicClasses={academicClasses}
        selectedSubjectId={params.subjectId}
        onSubjectChange={(subjectId) =>
          setParams({ subjectId, chapterId: "All", board: "All", page: 1 })
        }
        subjects={subjects}
        selectedChapterId={params.chapterId}
        onChapterChange={(chapterId) => setParams({ chapterId, board: "All", page: 1 })}
        chapters={chapters}
        selectedBoard={params.board}
        onBoardChange={(board) => setParams({ board, page: 1 })}
        boardYears={boardYears}
        selectedIsActive={params.isActive}
        onIsActiveChange={(isActive) => setParams({ isActive, page: 1 })}
        selectedHasReport={params.hasReport}
        onHasReportChange={(hasReport) => setParams({ hasReport, page: 1 })}
        selectedSort={params.sort}
        onSortChange={(sort) => setParams({ sort: sort as any, page: 1 })}
      />

      {/* Data Table / Question Cards */}
      <ParagraphTable
        items={items as any}
        isLoading={isLoading}
        isError={isError}
        onDelete={(id, nameSnippet) => setDeleteTarget({ id, snippet: nameSnippet })}
        onBulkDelete={(selectedIds) => setBulkDeleteTarget(selectedIds)}
        onResolveReport={(item) => setResolveTarget(item)}
        onAssignReport={(item) => setAssignTarget(item)}
        currentPage={params.page}
        itemsPerPage={params.limit}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={(page) => setParams({ page })}
        onLimitChange={(newLimit) => setParams({ limit: newLimit, page: 1 })}
      />

      {/* Assign Report Dialog */}
      <AssignReportDialog
        isOpen={Boolean(assignTarget)}
        onClose={() => setAssignTarget(null)}
        entityName="অনুচ্ছেদ"
        entityDetails={
          assignTarget
            ? {
                subjectName: assignTarget.subject?.nameBn || assignTarget.subject?.nameEn,
                chapterName:
                  assignTarget.academicChapter?.nameBn ||
                  assignTarget.academicChapter?.nameEn ||
                  assignTarget.chapter?.nameBn ||
                  assignTarget.chapter?.nameEn,
                clueText: assignTarget.name,
                editHref: `/paragraphs/${assignTarget.id}/edit`,
                editLabel: "অনুচ্ছেদ এডিট করে ঠিক করুন",
              }
            : undefined
        }
        reports={assignTarget?.reports}
        onConfirmAssign={handleConfirmAssign}
        isLoading={assignParagraphMutation.isPending}
      />

      {/* Resolve Report Dialog */}
      <ResolveReportDialog
        isOpen={Boolean(resolveTarget)}
        onClose={() => setResolveTarget(null)}
        entityName="অনুচ্ছেদ"
        entityDetails={
          resolveTarget
            ? {
                subjectName: resolveTarget.subject?.nameBn || resolveTarget.subject?.nameEn,
                chapterName:
                  resolveTarget.academicChapter?.nameBn ||
                  resolveTarget.academicChapter?.nameEn ||
                  resolveTarget.chapter?.nameBn ||
                  resolveTarget.chapter?.nameEn,
                clueText: resolveTarget.name,
                editHref: `/paragraphs/${resolveTarget.id}/edit`,
                editLabel: "অনুচ্ছেদ এডিট করে ঠিক করুন",
              }
            : undefined
        }
        reports={resolveTarget?.reports}
        onConfirmResolve={handleConfirmResolve}
        isLoading={resolveParagraphMutation.isPending}
      />

      {/* Shared Single Delete Modal */}
      <ConfirmDeleteDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="অনুচ্ছেদ ডিলিট করতে চান?"
        itemName={deleteTarget?.snippet}
        warningText="এই অনুচ্ছেদটি ডিলিট করলে এর সাথে সম্পর্কিত সমস্ত রেকর্ড ও প্রশ্নপত্র প্রভাবিত হতে পারে।"
        isLoading={deleteMutation.isPending}
      />

      {/* Shared Bulk Delete Modal */}
      <ConfirmDeleteDialog
        isOpen={Boolean(bulkDeleteTarget && bulkDeleteTarget.length > 0)}
        onClose={() => setBulkDeleteTarget(null)}
        onConfirm={handleConfirmBulkDelete}
        title={`${bulkDeleteTarget?.length ?? 0}টি অনুচ্ছেদ ডিলিট নিশ্চিত করুন`}
        itemName={`${bulkDeleteTarget?.length ?? 0}টি নির্বাচিত অনুচ্ছেদ`}
        warningText="নির্বাচিত সকল অনুচ্ছেদ স্থায়ীভাবে মুছে যাবে। এটি আর ফেরানো সম্ভব নয়।"
        isLoading={bulkDeleteMutation.isPending}
      />
    </div>
  )
}
