"use client"

import { useState } from "react"
import Link from "next/link"
import { useDanBamMilkoronSearchParams } from "../hooks/use-dan-bam-milkoron-search-params"
import {
  useDanBamMilkoronList,
  useDanBamMilkoronStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
  useDeleteDanBamMilkoron,
  useBulkDeleteDanBamMilkoron,
} from "../services/use-dan-bam-milkoron"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { ArrowRightLeft, Plus, Upload } from "lucide-react"
import { DanBamMilkoronStatsCards } from "./dan-bam-milkoron-stats-cards"
import { DanBamMilkoronFilters } from "./dan-bam-milkoron-filters"
import { DanBamMilkoronTable } from "./dan-bam-milkoron-table"

export function DanBamMilkoronListView() {
  const [params, setParams] = useDanBamMilkoronSearchParams()

  const { data: classesData } = useAcademicClassesForSelection()
  const { data: subjectsData } = useSubjectsForSelection({
    academicClassId: params.classId === "All" ? undefined : params.classId,
  })
  const { data: chaptersData } = useChaptersForSelection({
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
  })

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; snippet: string } | null>(null)
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState<string[] | null>(null)

  const deleteMutation = useDeleteDanBamMilkoron()
  const bulkDeleteMutation = useBulkDeleteDanBamMilkoron()

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync({ id: deleteTarget.id })
      toast.success("ডান-বাম মিলকরণটি সফলভাবে মুছে ফেলা হয়েছে।")
      setDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || "ডান-বাম মিলকরণ ডিলিট করা সম্ভব হয়নি")
    }
  }

  const handleConfirmBulkDelete = async () => {
    if (!bulkDeleteTarget) return
    try {
      const res = await bulkDeleteMutation.mutateAsync({ ids: bulkDeleteTarget })
      toast.success(`সফলভাবে ${res.deletedCount}টি ডান-বাম মিলকরণ মুছে ফেলা হয়েছে।`)
      setBulkDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || "ডান-বাম মিলকরণ ডিলিট করা সম্ভব হয়নি")
    }
  }

  const { data: statsData, isLoading: isStatsLoading } = useDanBamMilkoronStats({
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
    chapterId: params.chapterId === "All" ? undefined : params.chapterId,
  })

  const { data: listData, isLoading: isListLoading, isError } = useDanBamMilkoronList({
    page: params.page,
    limit: params.limit,
    query: params.query || undefined,
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
    chapterId: params.chapterId === "All" ? undefined : params.chapterId,
    difficulty: params.difficulty === "All" ? undefined : params.difficulty,
    sort: params.sort === "All" ? undefined : params.sort,
  })

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      <PageHeader
        title="ডান-বাম মিলকরণ প্রশ্ন ব্যাংক"
        description="শ্রেণি, বিষয় ও অধ্যায়ভিত্তিক ডান-বাম মিলকরণ (Column Matching) প্রশ্ন পরিচালনা করুন।"
        icon={ArrowRightLeft}
        badge={{ label: "ডান-বাম মিলকরণ", variant: "indigo" }}
        action={{
          label: "নতুন মিলকরণ যোগ করুন",
          href: "/dan-bam-milkoron/create",
          icon: Plus,
        }}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-foreground font-semibold text-xs sm:text-sm gap-2"
        >
          <Link href="/dan-bam-milkoron/import" prefetch={true}>
            <Upload className="w-4 h-4" />
            <span>JSON ইমপোর্ট</span>
          </Link>
        </Button>
      </PageHeader>

      <DanBamMilkoronStatsCards
        totalCount={statsData?.totalCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isStatsLoading}
      />

      <DanBamMilkoronFilters
        searchQuery={params.query}
        onSearchChange={(q) => setParams({ query: q, page: 1 })}
        selectedAcademicClassId={params.classId}
        onAcademicClassChange={(clsId) => setParams({ classId: clsId, subjectId: "All", chapterId: "All", page: 1 })}
        academicClasses={classesData}
        selectedSubjectId={params.subjectId}
        onSubjectChange={(subId) => setParams({ subjectId: subId, chapterId: "All", page: 1 })}
        subjects={subjectsData}
        selectedChapterId={params.chapterId}
        onChapterChange={(chId) => setParams({ chapterId: chId, page: 1 })}
        chapters={chaptersData}
        selectedDifficulty={params.difficulty}
        onDifficultyChange={(diff) => setParams({ difficulty: diff, page: 1 })}
        selectedSort={params.sort}
        onSortChange={(sort) => setParams({ sort: sort as any, page: 1 })}
      />

      <DanBamMilkoronTable
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
        title="ডান-বাম মিলকরণ ডিলিট করতে চান?"
        itemName={deleteTarget?.snippet}
        warningText="এই প্রশ্নটি ডিলিট করলে এটি প্রশ্ন ব্যাংক থেকে স্থায়ীভাবে মুছে যাবে।"
        isLoading={deleteMutation.isPending}
      />

      <ConfirmDeleteDialog
        isOpen={Boolean(bulkDeleteTarget && bulkDeleteTarget.length > 0)}
        onClose={() => setBulkDeleteTarget(null)}
        onConfirm={handleConfirmBulkDelete}
        title={`${bulkDeleteTarget?.length ?? 0}টি ডান-বাম মিলকরণ ডিলিট নিশ্চিত করুন`}
        itemName={`${bulkDeleteTarget?.length ?? 0}টি নির্বাচিত প্রশ্ন`}
        warningText="নির্বাচিত সকল প্রশ্ন স্থায়ীভাবে মুছে যাবে। এটি আর ফেরানো সম্ভব নয়।"
        isLoading={bulkDeleteMutation.isPending}
      />
    </div>
  )
}
