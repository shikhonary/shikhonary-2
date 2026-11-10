"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import Link from "next/link"
import {
  useApplicationsList,
  useApplicationStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useDeleteApplication,
  useBulkDeleteApplications,
  useResolveApplicationReport,
  useAssignApplicationReport,
} from "../services/use-application"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { ResolveReportDialog } from "@/components/shared/resolve-report-dialog"
import { AssignReportDialog } from "@/components/shared/assign-report-dialog"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { FileSignature, Plus, Upload } from "lucide-react"
import { ApplicationStatsCards } from "./application-stats-cards"
import { ApplicationFilters } from "./application-filters"
import { ApplicationTable, type ApplicationItem } from "./application-table"
import { useApplicationSearchParams } from "../hooks/use-application-search-params"

export function ApplicationListView() {
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
  ] = useApplicationSearchParams()

  const handleAcademicClassChange = (classId: string) => {
    setSelectedAcademicClassId(classId)
    setSearchParams({
      subjectId: "All",
      board: "All",
      page: 1,
    })
  }

  // Local state for delete dialogs & report dialogs
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; snippet: string } | null>(null)
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState<string[] | null>(null)
  const [resolveTarget, setResolveTarget] = useState<ApplicationItem | null>(null)
  const [assignTarget, setAssignTarget] = useState<ApplicationItem | null>(null)

  const deleteMutation = useDeleteApplication()
  const bulkDeleteMutation = useBulkDeleteApplications()
  const resolveReportMutation = useResolveApplicationReport()
  const assignReportMutation = useAssignApplicationReport()

  const handleConfirmResolve = async (resolvedNote?: string) => {
    if (!resolveTarget) return
    try {
      await resolveReportMutation.mutateAsync({
        applicationId: resolveTarget.id,
        resolvedNote,
      })
      toast.success("আবেদনপত্র রিপোর্টটি সফলভাবে সমাধান করা হয়েছে।")
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
        applicationId: assignTarget.id,
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
      toast.success("আবেদনপত্রটি সফলভাবে মুছে ফেলা হয়েছে।")
      setDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || "আবেদনপত্র ডিলিট করা সম্ভব হয়নি")
    }
  }

  const handleConfirmBulkDelete = async () => {
    if (!bulkDeleteTarget) return
    try {
      const res = await bulkDeleteMutation.mutateAsync({ ids: bulkDeleteTarget })
      toast.success(`সফলভাবে ${res.deletedCount}টি আবেদনপত্র মুছে ফেলা হয়েছে।`)
      setBulkDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || "আবেদনপত্র ডিলিট করা সম্ভব হয়নি")
    }
  }

  // Query Applications list with search & filters
  const { data: applicationsData, isLoading, isError } = useApplicationsList({
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

  // Fetch Board + Reference combinations (scoped by subject / academicClass if selected)
  const { data: boardYearsData } = useQuery({
    ...trpc.application.boardYears.queryOptions({
      subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
      academicClassId: selectedAcademicClassId !== "All" ? selectedAcademicClassId : undefined,
    }),
  })
  const boardYears = boardYearsData ?? []

  // Query Application stats
  const { data: statsData } = useApplicationStats(
    selectedAcademicClassId !== "All" || selectedSubjectId !== "All"
      ? {
          academicClassId:
            selectedAcademicClassId !== "All" ? selectedAcademicClassId : undefined,
          subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
        }
      : undefined
  )

  // Query subjects for dropdown filters
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedAcademicClassId !== "All" ? { academicClassId: selectedAcademicClassId } : undefined
  )

  const items = applicationsData?.items ?? []
  const totalItems = applicationsData?.totalItems ?? items.length
  const totalPages = applicationsData?.totalPages ?? 1

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Shared Page Header */}
      <PageHeader
        title="আবেদনপত্র ও দরখাস্ত প্রশ্ন ব্যাংক"
        description="শ্রেণি ও বিষয়ভিত্তিক আবেদনপত্র, দরখাস্ত ও প্রাতিষ্ঠানিক পত্রসমূহ এক জায়গায় পরিচালনা করুন।"
        icon={FileSignature}
        badge={{ label: "আবেদনপত্র মডিউল", variant: "indigo" }}
        action={{
          label: "নতুন আবেদনপত্র যোগ করুন",
          href: "/applications/create",
          icon: Plus,
        }}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-foreground font-semibold text-xs sm:text-sm gap-2"
        >
          <Link href="/applications/import" prefetch={true}>
            <Upload className="w-4 h-4" />
            <span>JSON ইমপোর্ট</span>
          </Link>
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <ApplicationStatsCards
        totalCount={statsData?.totalCount}
        activeCount={statsData?.activeCount}
        inactiveCount={statsData?.inactiveCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isLoading}
      />

      {/* Filters */}
      <ApplicationFilters
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
      />

      {/* Data Table / Question Cards */}
      <ApplicationTable
        items={items as any}
        isLoading={isLoading}
        isError={isError}
        onDelete={(id, titleSnippet) => setDeleteTarget({ id, snippet: titleSnippet })}
        onBulkDelete={(ids) => setBulkDeleteTarget(ids)}
        onResolveReport={(item) => setResolveTarget(item)}
        onAssignReport={(item) => setAssignTarget(item)}
        currentPage={currentPage}
        itemsPerPage={limit}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={(page) => setSearchParams({ page })}
        onLimitChange={(newLimit) => setSearchParams({ limit: newLimit, page: 1 })}
      />

      {/* Reusable Resolve Application Report Dialog */}
      <ResolveReportDialog
        isOpen={Boolean(resolveTarget)}
        onClose={() => setResolveTarget(null)}
        entityName="আবেদনপত্র"
        entityDetails={
          resolveTarget
            ? {
                className:
                  resolveTarget.subject?.classSubjects
                    ?.map((cs) => cs.academicClass?.nameBn || cs.academicClass?.nameEn)
                    .filter(Boolean)
                    .join(", ") || null,
                subjectName: resolveTarget.subject?.nameBn || resolveTarget.subject?.nameEn,
                clueText: resolveTarget.title,
                editHref: `/applications/${resolveTarget.id}/edit`,
                editLabel: "আবেদনপত্র এডিট পেজে যান",
              }
            : undefined
        }
        reports={resolveTarget?.reports}
        onConfirmResolve={handleConfirmResolve}
        isLoading={resolveReportMutation.isPending}
      />

      {/* Reusable Assign Application Report Dialog */}
      <AssignReportDialog
        isOpen={Boolean(assignTarget)}
        onClose={() => setAssignTarget(null)}
        entityName="আবেদনপত্র"
        entityDetails={
          assignTarget
            ? {
                className:
                  assignTarget.subject?.classSubjects
                    ?.map((cs) => cs.academicClass?.nameBn || cs.academicClass?.nameEn)
                    .filter(Boolean)
                    .join(", ") || null,
                subjectName: assignTarget.subject?.nameBn || assignTarget.subject?.nameEn,
                clueText: assignTarget.title,
                editHref: `/applications/${assignTarget.id}/edit`,
                editLabel: "আবেদনপত্র এডিট পেজে যান",
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
        title="আবেদনপত্র ডিলিট করতে চান?"
        itemName={deleteTarget?.snippet}
        warningText="এই আবেদনপত্রটি ডিলিট করলে এর সমস্ত সমাধান ও সংশ্লিষ্ট রেকর্ড প্রভাবিত হতে পারে।"
        isLoading={deleteMutation.isPending}
      />

      {/* Shared Bulk Delete Modal */}
      <ConfirmDeleteDialog
        isOpen={Boolean(bulkDeleteTarget && bulkDeleteTarget.length > 0)}
        onClose={() => setBulkDeleteTarget(null)}
        onConfirm={handleConfirmBulkDelete}
        title={`${bulkDeleteTarget?.length ?? 0}টি আবেদনপত্র ডিলিট নিশ্চিত করুন`}
        itemName={`${bulkDeleteTarget?.length ?? 0}টি নির্বাচিত আবেদনপত্র`}
        warningText="নির্বাচিত সকল আবেদনপত্র স্থায়ীভাবে মুছে যাবে। এটি আর ফেরানো সম্ভব নয়।"
        isLoading={bulkDeleteMutation.isPending}
      />
    </div>
  )
}
