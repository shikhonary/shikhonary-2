"use client"

import { useState } from "react"
import Link from "next/link"
import { useEkKothayProkashSearchParams } from "../hooks/use-ek-kothay-prokash-search-params"
import {
  useEkKothayProkashList,
  useEkKothayProkashStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
  useDeleteEkKothayProkash,
  useBulkDeleteEkKothayProkash,
} from "../services/use-ek-kothay-prokash"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { BookOpen, Plus, Upload } from "lucide-react"
import { EkKothayProkashStatsCards } from "./ek-kothay-prokash-stats-cards"
import { EkKothayProkashFilters } from "./ek-kothay-prokash-filters"
import { EkKothayProkashTable } from "./ek-kothay-prokash-table"

export function EkKothayProkashListView() {
  const [params, setParams] = useEkKothayProkashSearchParams()

  const { data: classesData } = useAcademicClassesForSelection()
  const { data: subjectsData } = useSubjectsForSelection({
    academicClassId: params.classId === "All" ? undefined : params.classId,
  })
  const { data: chaptersData } = useChaptersForSelection({
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
  })

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; snippet: string } | null>(null)
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState<string[] | null>(null)

  const deleteMutation = useDeleteEkKothayProkash()
  const bulkDeleteMutation = useBulkDeleteEkKothayProkash()

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync({ id: deleteTarget.id })
      toast.success("এক কথায় প্রকাশটি সফলভাবে মুছে ফেলা হয়েছে।")
      setDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || "এক কথায় প্রকাশ ডিলিট করা সম্ভব হয়নি")
    }
  }

  const handleConfirmBulkDelete = async () => {
    if (!bulkDeleteTarget) return
    try {
      const res = await bulkDeleteMutation.mutateAsync({ ids: bulkDeleteTarget })
      toast.success(`সফলভাবে ${res.deletedCount}টি এক কথায় প্রকাশ মুছে ফেলা হয়েছে।`)
      setBulkDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || "এক কথায় প্রকাশ ডিলিট করা সম্ভব হয়নি")
    }
  }

  const { data: listData, isLoading, isError } = useEkKothayProkashList({
    page: params.page,
    limit: params.limit,
    query: params.query || undefined,
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
    chapterId: params.chapterId === "All" ? undefined : params.chapterId,
    difficulty: params.difficulty === "All" ? undefined : params.difficulty,
    sort: params.sort === "All" ? undefined : params.sort,
  })

  const { data: statsData } = useEkKothayProkashStats({
    subjectId: params.subjectId === "All" ? undefined : params.subjectId,
    chapterId: params.chapterId === "All" ? undefined : params.chapterId,
  })

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      <PageHeader
        title="এক কথায় প্রকাশ প্রশ্ন ব্যাংক"
        description="শ্রেণি, বিষয় ও অধ্যায়ভিত্তিক এক কথায় প্রকাশ, মূল বাক্যাংশ এবং উত্তর পরিচালনা করুন।"
        icon={BookOpen}
        badge={{ label: "এক কথায় প্রকাশ", variant: "indigo" }}
        action={{
          label: "নতুন যোগ করুন",
          href: "/ek-kothay-prokash/create",
          icon: Plus,
        }}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-foreground font-semibold text-xs sm:text-sm gap-2"
        >
          <Link href="/ek-kothay-prokash/import" prefetch={true}>
            <Upload className="w-4 h-4" />
            <span>JSON ইমপোর্ট</span>
          </Link>
        </Button>
      </PageHeader>

      <EkKothayProkashStatsCards
        totalCount={statsData?.totalCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isLoading}
      />

      <EkKothayProkashFilters
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

      <EkKothayProkashTable
        items={(listData?.items ?? []) as any}
        isLoading={isLoading}
        isError={isError}
        onDelete={(id, snippet) => setDeleteTarget({ id, snippet })}
        onBulkDelete={(ids) => setBulkDeleteTarget(ids)}
        currentPage={params.page}
        itemsPerPage={params.limit}
        totalItems={listData?.totalItems ?? 0}
        totalPages={listData?.totalPages ?? 1}
        onPageChange={(page) => setParams({ page })}
        onLimitChange={(limit) => setParams({ limit, page: 1 })}
      />

      <ConfirmDeleteDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="এক কথায় প্রকাশ ডিলিট করতে চান?"
        itemName={deleteTarget?.snippet}
        warningText="এই প্রশ্নটি ডিলিট করলে এটি প্রশ্ন ব্যাংক থেকে স্থায়ীভাবে মুছে যাবে।"
        isLoading={deleteMutation.isPending}
      />

      <ConfirmDeleteDialog
        isOpen={Boolean(bulkDeleteTarget && bulkDeleteTarget.length > 0)}
        onClose={() => setBulkDeleteTarget(null)}
        onConfirm={handleConfirmBulkDelete}
        title={`${bulkDeleteTarget?.length ?? 0}টি এক কথায় প্রকাশ ডিলিট নিশ্চিত করুন`}
        itemName={`${bulkDeleteTarget?.length ?? 0}টি নির্বাচিত প্রশ্ন`}
        warningText="নির্বাচিত সকল প্রশ্ন স্থায়ীভাবে মুছে যাবে। এটি আর ফেরানো সম্ভব নয়।"
        isLoading={bulkDeleteMutation.isPending}
      />
    </div>
  )
}
