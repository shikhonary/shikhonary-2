"use client"

import { useState } from "react"
import Link from "next/link"
import {
  useFillInTheBlanksWithoutCluesList,
  useFillInTheBlanksWithoutCluesStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
  useDeleteFillInTheBlanksWithoutClues,
  useBulkDeleteFillInTheBlanksWithoutClues,
} from "../services/use-fill-in-the-blanks-without-clues"
import { useFillInTheBlanksWithoutCluesSearchParams } from "../hooks/use-fill-in-the-blanks-without-clues-search-params"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { HelpCircle, Plus, Upload } from "lucide-react"
import { FillInTheBlanksWithoutCluesStatsCards } from "./fill-in-the-blanks-without-clues-stats-cards"
import { FillInTheBlanksWithoutCluesFilters } from "./fill-in-the-blanks-without-clues-filters"
import { FillInTheBlanksWithoutCluesTable } from "./fill-in-the-blanks-without-clues-table"

export function FillInTheBlanksWithoutCluesListView() {
  const [params, setParams] = useFillInTheBlanksWithoutCluesSearchParams()
  const selectedAcademicClassId = params.classId || "All"

  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedAcademicClassId !== "All" ? { academicClassId: selectedAcademicClassId } : undefined
  )
  const { data: chapters = [] } = useChaptersForSelection(
    params.subjectId !== "All" ? { subjectId: params.subjectId } : undefined
  )

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; snippet: string } | null>(null)
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState<string[] | null>(null)

  const deleteMutation = useDeleteFillInTheBlanksWithoutClues()
  const bulkDeleteMutation = useBulkDeleteFillInTheBlanksWithoutClues()

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync({ id: deleteTarget.id })
      toast.success("শূন্যস্থান প্রশ্নটি সফলভাবে মুছে ফেলা হয়েছে।")
      setDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || "প্রশ্নটি ডিলিট করা সম্ভব হয়নি")
    }
  }

  const handleConfirmBulkDelete = async () => {
    if (!bulkDeleteTarget) return
    try {
      const res = await bulkDeleteMutation.mutateAsync({ ids: bulkDeleteTarget })
      toast.success(`সফলভাবে ${res.deletedCount}টি প্রশ্ন মুছে ফেলা হয়েছে।`)
      setBulkDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || "প্রশ্ন ডিলিট করা সম্ভব হয়নি")
    }
  }

  const { data: statsData, isLoading: isStatsLoading } = useFillInTheBlanksWithoutCluesStats(
    params.subjectId !== "All" || params.chapterId !== "All"
      ? {
          subjectId: params.subjectId !== "All" ? params.subjectId : undefined,
          chapterId: params.chapterId !== "All" ? params.chapterId : undefined,
        }
      : undefined
  )

  const { data: listData, isLoading: isListLoading, isError } = useFillInTheBlanksWithoutCluesList({
    page: params.page,
    limit: params.limit,
    query: params.query || undefined,
    subjectId: params.subjectId !== "All" ? params.subjectId : undefined,
    chapterId: params.chapterId !== "All" ? params.chapterId : undefined,
    difficulty: params.difficulty !== "All" ? params.difficulty : undefined,
    sort: params.sort !== "All" ? params.sort : undefined,
  })

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      <PageHeader
        title="শূন্যস্থান পূরণ (ক্লু ছাড়া)"
        description="শ্রেণি, বিষয় ও অধ্যায়ভিত্তিক ক্লু ছাড়া শূন্যস্থান পূরণ প্রশ্ন ও অনুচ্ছেদ পরিচালনা করুন।"
        icon={HelpCircle}
        badge={{ label: "Without Clues", variant: "indigo" }}
        action={{
          label: "নতুন প্রশ্ন যোগ করুন",
          href: "/fill-in-the-blanks-without-clues/create",
          icon: Plus,
        }}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-foreground font-semibold text-xs sm:text-sm gap-2"
        >
          <Link href="/fill-in-the-blanks-without-clues/import" prefetch={true}>
            <Upload className="w-4 h-4" />
            <span>JSON ইমপোর্ট</span>
          </Link>
        </Button>
      </PageHeader>

      <FillInTheBlanksWithoutCluesStatsCards
        totalCount={statsData?.totalCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isStatsLoading}
      />

      <FillInTheBlanksWithoutCluesFilters
        searchQuery={params.query}
        onSearchChange={(query) => setParams({ query, page: 1 })}
        selectedAcademicClassId={selectedAcademicClassId}
        onAcademicClassChange={(clsId) => {
          setParams({ classId: clsId, subjectId: "All", chapterId: "All", page: 1 })
        }}
        academicClasses={academicClasses}
        selectedSubjectId={params.subjectId}
        onSubjectChange={(subjectId) => setParams({ subjectId, chapterId: "All", page: 1 })}
        subjects={subjects}
        selectedChapterId={params.chapterId}
        onChapterChange={(chapterId) => setParams({ chapterId, page: 1 })}
        chapters={chapters}
        selectedDifficulty={params.difficulty}
        onDifficultyChange={(difficulty) => setParams({ difficulty, page: 1 })}
        selectedSort={params.sort}
        onSortChange={(sort) => setParams({ sort: sort as any, page: 1 })}
      />

      <FillInTheBlanksWithoutCluesTable
        items={(listData?.items ?? []) as any}
        isLoading={isListLoading}
        isError={isError}
        currentPage={params.page}
        itemsPerPage={params.limit}
        totalItems={listData?.totalItems ?? 0}
        totalPages={listData?.totalPages ?? 1}
        onPageChange={(page) => setParams({ page })}
        onLimitChange={(limit) => setParams({ limit, page: 1 })}
        onDelete={(id, snippet) => setDeleteTarget({ id, snippet })}
        onBulkDelete={(ids) => setBulkDeleteTarget(ids)}
      />

      <ConfirmDeleteDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="শূন্যস্থান প্রশ্ন ডিলিট করতে চান?"
        itemName={deleteTarget?.snippet}
        warningText="এই প্রশ্নটি ডিলিট করলে এটি প্রশ্ন ব্যাংক থেকে স্থায়ীভাবে মুছে যাবে।"
        isLoading={deleteMutation.isPending}
      />

      <ConfirmDeleteDialog
        isOpen={Boolean(bulkDeleteTarget && bulkDeleteTarget.length > 0)}
        onClose={() => setBulkDeleteTarget(null)}
        onConfirm={handleConfirmBulkDelete}
        title={`${bulkDeleteTarget?.length ?? 0}টি প্রশ্ন ডিলিট নিশ্চিত করুন`}
        itemName={`${bulkDeleteTarget?.length ?? 0}টি নির্বাচিত প্রশ্ন`}
        warningText="নির্বাচিত সকল প্রশ্ন স্থায়ীভাবে মুছে যাবে। এটি আর ফেরানো সম্ভব নয়।"
        isLoading={bulkDeleteMutation.isPending}
      />
    </div>
  )
}
