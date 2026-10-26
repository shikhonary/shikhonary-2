"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import {
  usePbqsList,
  usePbqStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
  useDeletePbq,
  useBulkDeletePbqs,
} from "../services/use-pbq"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { toBengaliDigits } from "@workspace/utils/helpers/bengali"
import { BookOpen, Plus, Upload } from "lucide-react"
import { PbqStatsCards } from "./pbq-stats-cards"
import { PbqFilters } from "./pbq-filters"
import { PbqTable } from "./pbq-table"
import { usePbqSearchParams } from "../hooks/use-pbq-search-params"

export function PbqListView() {
  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState<string>("All")
  const { data: academicClasses = [] } = useAcademicClassesForSelection()

  const [
    {
      query: searchQuery,
      subjectId: selectedSubjectId,
      chapterId: selectedChapterId,
      board: selectedBoard,
      difficulty: selectedDifficulty,
      sort: selectedSort,
      page: currentPage,
      limit,
    },
    setSearchParams,
  ] = usePbqSearchParams()

  const handleAcademicClassChange = (classId: string) => {
    setSelectedAcademicClassId(classId)
    setSearchParams({
      subjectId: "All",
      chapterId: "All",
      board: "All",
      page: 1,
    })
  }

  // Local state for single & bulk delete (Zero Zustand stores)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; question: string } | null>(null)
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState<string[] | null>(null)

  const deleteMutation = useDeletePbq()
  const bulkDeleteMutation = useBulkDeletePbqs()

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync({ id: deleteTarget.id })
      toast.success("PBQ প্রশ্নটি সফলভাবে মুছে ফেলা হয়েছে।")
      setDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || "PBQ ডিলিট করা সম্ভব হয়নি")
    }
  }

  const handleConfirmBulkDelete = async () => {
    if (!bulkDeleteTarget) return
    try {
      const res = await bulkDeleteMutation.mutateAsync({ ids: bulkDeleteTarget })
      toast.success(`সফলভাবে ${res.deletedCount}টি PBQ মুছে ফেলা হয়েছে।`)
      setBulkDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || "PBQ ডিলিট করা সম্ভব হয়নি")
    }
  }

  // Parse filters
  let boardSource: string | undefined = undefined
  let boardYear: number | undefined = undefined
  if (selectedBoard && selectedBoard !== "All") {
    const parts = selectedBoard.split("_")
    if (parts.length > 1) {
      boardSource = parts[0]
      const yr = Number(parts[1])
      if (!isNaN(yr)) boardYear = yr
    }
  }

  // Query PBQs list with search & filters
  const { data: pbqsData, isLoading, isError } = usePbqsList({
    limit,
    page: currentPage,
    query: searchQuery || undefined,
    subjectId: selectedSubjectId !== "All" ? selectedSubjectId : undefined,
    chapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
    board: selectedBoard !== "All" ? selectedBoard : undefined,
    source: boardSource,
    year: boardYear,
    difficulty: selectedDifficulty !== "All" ? selectedDifficulty : undefined,
    sort: selectedSort,
  })

  // Fetch Board + Year combinations for this subject / chapter if selected
  const { data: boardYearsData } = useQuery({
    ...trpc.pbq.boardYears.queryOptions({
      subjectId: selectedSubjectId,
      chapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
    }),
    enabled: selectedSubjectId !== "All",
  })
  const boardYears = boardYearsData ?? []

  // Query PBQ stats
  const { data: statsData } = usePbqStats(
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

  const items = pbqsData?.items ?? []
  const totalItems = pbqsData?.totalItems ?? items.length
  const totalPages = pbqsData?.totalPages ?? 1

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Shared Page Header */}
      <PageHeader
        title="অনুচ্ছেদভিত্তিক প্রশ্ন ব্যাংক (PBQ)"
        description="শ্রেণি, বিষয় ও অধ্যায়ভিত্তিক উদ্দীপক/অনুচ্ছেদ, উপ-প্রশ্ন (ক, খ, গ, ঘ, ঙ) ও মূল্যায়ন নম্বর পরিচালনা করুন।"
        icon={BookOpen}
        badge={{ label: "PBQ মডিউল", variant: "indigo" }}
        action={{
          label: "নতুন PBQ যোগ করুন",
          href: "/pbqs/create",
          icon: Plus,
        }}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-foreground font-semibold text-xs sm:text-sm gap-2"
        >
          <Link href="/pbqs/import" prefetch={true}>
            <Upload className="w-4 h-4" />
            <span>JSON ইমপোর্ট</span>
          </Link>
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <PbqStatsCards
        totalCount={statsData?.totalCount}
        activeCount={statsData?.activeCount}
        inactiveCount={statsData?.inactiveCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isLoading}
      />

      {/* Filters */}
      <PbqFilters
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
        onSortChange={(sort) => setSearchParams({ sort: sort as any, page: 1 })}
      />

      {/* Data Table / Question Cards */}
      <PbqTable
        items={items as any}
        isLoading={isLoading}
        isError={isError}
        onDelete={(id, question) => setDeleteTarget({ id, question })}
        onBulkDelete={(selectedIds) => setBulkDeleteTarget(selectedIds)}
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
        title="PBQ প্রশ্ন ডিলিট করতে চান?"
        itemName={deleteTarget?.question}
        warningText="এই অনুচ্ছেদভিত্তিক প্রশ্নটি ডিলিট করলে এর উদ্দীপক এবং সমস্ত উপ-প্রশ্ন (ক, খ, গ, ঘ, ঙ) মুছে যাবে।"
        isLoading={deleteMutation.isPending}
      />

      {/* Shared Bulk Delete Modal */}
      <ConfirmDeleteDialog
        isOpen={Boolean(bulkDeleteTarget && bulkDeleteTarget.length > 0)}
        onClose={() => setBulkDeleteTarget(null)}
        onConfirm={handleConfirmBulkDelete}
        title="নির্বাচিত PBQ প্রশ্নগুলো ডিলিট করতে চান?"
        itemName={bulkDeleteTarget ? `${toBengaliDigits(bulkDeleteTarget.length)}টি অনুচ্ছেদভিত্তিক প্রশ্ন` : ""}
        warningText="নির্বাচিত প্রশ্নসমূহ স্থায়ীভাবে মুছে ফেলা হবে এবং এর সাথে সংশ্লিষ্ট সমস্ত উপ-প্রশ্ন ও উদ্দীপক মুছে যাবে।"
        isLoading={bulkDeleteMutation.isPending}
      />
    </div>
  )
}
