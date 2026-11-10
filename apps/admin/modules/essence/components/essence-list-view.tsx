"use client"

import { useState } from "react"
import Link from "next/link"
import {
  useEssencesList,
  useEssenceStats,
  useEssenceBoardYears,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useDeleteEssence,
  useBulkDeleteEssences,
  useResolveEssenceReport,
  useAssignEssenceReport,
} from "../services/use-essence"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { ResolveReportDialog } from "@/components/shared/resolve-report-dialog"
import { AssignReportDialog } from "@/components/shared/assign-report-dialog"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { Feather, Plus, Upload } from "lucide-react"
import { EssenceStatsCards } from "./essence-stats-cards"
import { EssenceFilters } from "./essence-filters"
import { EssenceTable, type EssenceItem } from "./essence-table"
import { useEssenceSearchParams } from "../hooks/use-essence-search-params"

export function EssenceListView() {
  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState<string>("All")
  const { data: academicClasses = [] } = useAcademicClassesForSelection()

  const [
    {
      query: searchQuery,
      subjectId: selectedSubjectId,
      board: selectedBoard,
      isActive: selectedIsActive,
      hasReport: selectedHasReport,
      sort: selectedSort,
      page: currentPage,
      limit,
    },
    setSearchParams,
  ] = useEssenceSearchParams()

  const handleAcademicClassChange = (classId: string) => {
    setSelectedAcademicClassId(classId)
    setSearchParams({
      subjectId: "All",
      board: "All",
      page: 1,
    })
  }

  // Local state for delete dialogs & resolve dialog
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; snippet: string } | null>(null)
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState<string[] | null>(null)
  const [resolveTarget, setResolveTarget] = useState<EssenceItem | null>(null)
  const [assignTarget, setAssignTarget] = useState<EssenceItem | null>(null)

  const deleteMutation = useDeleteEssence()
  const bulkDeleteMutation = useBulkDeleteEssences()
  const resolveEssenceMutation = useResolveEssenceReport()
  const assignEssenceMutation = useAssignEssenceReport()

  const handleConfirmResolve = async (resolvedNote?: string) => {
    if (!resolveTarget) return
    try {
      await resolveEssenceMutation.mutateAsync({
        essenceId: resolveTarget.id,
        resolvedNote,
      })
      toast.success("সারমর্ম রিপোর্টটি সফলভাবে সমাধান করা হয়েছে।")
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
      await assignEssenceMutation.mutateAsync({
        essenceId: assignTarget.id,
        assignedToId: assigneeId,
        reportId,
        note,
      })
      toast.success("রিপোর্টের দায়িত্ব সফলভাবে অর্পণ (Assign) করা হয়েছে।")
      setAssignTarget(null)
    } catch (err: any) {
      toast.error(err.message || "দায়িত্ব অর্পণ করতে সমস্যা হয়েছে")
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync({ id: deleteTarget.id })
      toast.success("সারমর্মটি সফলভাবে মুছে ফেলা হয়েছে।")
      setDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || "সারমর্ম ডিলিট করা সম্ভব হয়নি")
    }
  }

  const handleConfirmBulkDelete = async () => {
    if (!bulkDeleteTarget) return
    try {
      const res = await bulkDeleteMutation.mutateAsync({ ids: bulkDeleteTarget })
      toast.success(`সফলভাবে ${res.deletedCount}টি সারমর্ম মুছে ফেলা হয়েছে।`)
      setBulkDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || "সারমর্ম ডিলিট করা সম্ভব হয়নি")
    }
  }

  // Query Essences list with search & filters
  const { data: essencesData, isLoading, isError } = useEssencesList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    academicClassId: selectedAcademicClassId !== "All" ? selectedAcademicClassId : undefined,
    subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
    board: selectedBoard !== "All" ? selectedBoard : undefined,
    isActive: selectedIsActive !== "All" ? selectedIsActive : undefined,
    hasReport: selectedHasReport !== "All" ? selectedHasReport : undefined,
    sort: selectedSort,
  })

  // Fetch Board + Reference combinations (scoped by subject / class if selected)
  const { data: boardYearsData } = useEssenceBoardYears({
    academicClassId: selectedAcademicClassId !== "All" ? selectedAcademicClassId : undefined,
    subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
  })
  const boardYears = boardYearsData ?? []

  // Query Essence stats
  const { data: statsData } = useEssenceStats(
    selectedSubjectId !== "All" || selectedAcademicClassId !== "All"
      ? {
          academicClassId: selectedAcademicClassId !== "All" ? selectedAcademicClassId : undefined,
          subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
        }
      : undefined
  )

  // Query subjects for dropdown filters
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedAcademicClassId !== "All" ? { academicClassId: selectedAcademicClassId } : undefined
  )

  const items = essencesData?.items ?? []
  const totalItems = essencesData?.totalItems ?? items.length
  const totalPages = essencesData?.totalPages ?? 1

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Shared Page Header */}
      <PageHeader
        title="সারমর্ম ও মূলভাব প্রশ্ন ব্যাংক"
        description="শ্রেণি ও বিষয়ভিত্তিক সারমর্ম ও মূলভাব অনুচ্ছেদ এক জায়গায় পরিচালনা করুন।"
        icon={Feather}
        badge={{ label: "সারমর্ম মডিউল", variant: "indigo" }}
        action={{
          label: "নতুন সারমর্ম যোগ করুন",
          href: "/essences/create",
          icon: Plus,
        }}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Link href="/essences/import" prefetch={true}>
            <Upload className="w-4 h-4" />
            <span>JSON ইমপোর্ট</span>
          </Link>
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <EssenceStatsCards
        totalCount={statsData?.totalCount}
        activeCount={statsData?.activeCount}
        inactiveCount={statsData?.inactiveCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isLoading}
      />

      {/* Filters */}
      <EssenceFilters
        searchQuery={searchQuery}
        onSearchChange={(query) => setSearchParams({ query, page: 1 })}
        selectedAcademicClassId={selectedAcademicClassId}
        onAcademicClassChange={handleAcademicClassChange}
        academicClasses={academicClasses}
        selectedSubjectId={selectedSubjectId}
        onSubjectChange={(subjectId) => setSearchParams({ subjectId, board: "All", page: 1 })}
        subjects={subjects}
        selectedBoard={selectedBoard}
        onBoardChange={(board) => setSearchParams({ board, page: 1 })}
        boardYears={boardYears}
        selectedIsActive={selectedIsActive}
        onIsActiveChange={(isActive) => setSearchParams({ isActive, page: 1 })}
        selectedHasReport={selectedHasReport}
        onHasReportChange={(hasReport) => setSearchParams({ hasReport, page: 1 })}
        selectedSort={selectedSort}
        onSortChange={(sort) => setSearchParams({ sort: sort as any, page: 1 })}
        onResetAll={() =>
          setSearchParams({
            subjectId: "All",
            board: "All",
            isActive: "All",
            hasReport: "All",
            sort: "All",
            query: "",
            page: 1,
          })
        }
      />

      {/* Data Table / Question Cards */}
      <EssenceTable
        items={items as any}
        isLoading={isLoading}
        isError={isError}
        onDelete={(id, titleSnippet) => setDeleteTarget({ id, snippet: titleSnippet })}
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

      {/* Reusable Assign Essence Report Dialog */}
      <AssignReportDialog
        isOpen={Boolean(assignTarget)}
        onClose={() => setAssignTarget(null)}
        entityName="সারমর্ম ও মূলভাব"
        entityDetails={
          assignTarget
            ? {
                subjectName: assignTarget.subject?.nameBn || assignTarget.subject?.nameEn,
                clueText: assignTarget.title,
                editHref: `/essences/${assignTarget.id}/edit`,
                editLabel: "সারমর্ম এডিট পেজে যান",
              }
            : undefined
        }
        reports={assignTarget?.reports}
        onConfirmAssign={({ assigneeId, note, reportId }) =>
          handleConfirmAssign({ assigneeId, note, reportId })
        }
        isLoading={assignEssenceMutation.isPending}
      />

      {/* Reusable Resolve Essence Report Dialog */}
      <ResolveReportDialog
        isOpen={Boolean(resolveTarget)}
        onClose={() => setResolveTarget(null)}
        entityName="সারমর্ম ও মূলভাব"
        entityDetails={
          resolveTarget
            ? {
                subjectName: resolveTarget.subject?.nameBn || resolveTarget.subject?.nameEn,
                clueText: resolveTarget.title,
                editHref: `/essences/${resolveTarget.id}/edit`,
                editLabel: "সারমর্ম এডিট পেজে যান",
              }
            : undefined
        }
        reports={resolveTarget?.reports}
        onConfirmResolve={handleConfirmResolve}
        isLoading={resolveEssenceMutation.isPending}
      />

      {/* Shared Single Delete Modal */}
      <ConfirmDeleteDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="সারমর্ম ডিলিট করতে চান?"
        itemName={deleteTarget?.snippet}
        warningText="এই সারমর্ম বা মূলভাবটি ডিলিট করলে এর সমস্ত রেকর্ড ও রেফারেন্স স্থায়ীভাবে মুছে যাবে।"
        isLoading={deleteMutation.isPending}
      />

      {/* Shared Bulk Delete Modal */}
      <ConfirmDeleteDialog
        isOpen={Boolean(bulkDeleteTarget && bulkDeleteTarget.length > 0)}
        onClose={() => setBulkDeleteTarget(null)}
        onConfirm={handleConfirmBulkDelete}
        title="নির্বাচিত সারমর্মগুলো ডিলিট করতে চান?"
        itemName={bulkDeleteTarget ? `${bulkDeleteTarget.length}টি সারমর্ম` : ""}
        warningText="নির্বাচিত সারমর্মসমূহ স্থায়ীভাবে মুছে ফেলা হবে এবং এটি আর পুনরুদ্ধার করা সম্ভব হবে না।"
        isLoading={bulkDeleteMutation.isPending}
      />
    </div>
  )
}
