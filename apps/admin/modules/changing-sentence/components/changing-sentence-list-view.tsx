"use client"

import { useState } from "react"
import Link from "next/link"
import {
  useChangingSentenceList,
  useChangingSentenceStats,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useDeleteChangingSentence,
  useBulkDeleteChangingSentences,
} from "../services/use-changing-sentence"
import { useChangingSentenceSearchParams } from "../hooks/use-changing-sentence-search-params"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { Sparkles, Plus, Upload } from "lucide-react"
import { ChangingSentenceStatsCards } from "./changing-sentence-stats-cards"
import { ChangingSentenceFilters } from "./changing-sentence-filters"
import { ChangingSentenceTable } from "./changing-sentence-table"

export function ChangingSentenceListView() {
  const [params, setParams] = useChangingSentenceSearchParams()
  const selectedAcademicClassId = params.classId || "All"

  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedAcademicClassId !== "All" ? { academicClassId: selectedAcademicClassId } : undefined
  )

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; snippet: string } | null>(null)
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState<string[] | null>(null)

  const deleteMutation = useDeleteChangingSentence()
  const bulkDeleteMutation = useBulkDeleteChangingSentences()

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync({ id: deleteTarget.id })
      toast.success("বাক্য রূপান্তর প্রশ্নটি সফলভাবে মুছে ফেলা হয়েছে।")
      setDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || "বাক্য রূপান্তর ডিলিট করা সম্ভব হয়নি")
    }
  }

  const handleConfirmBulkDelete = async () => {
    if (!bulkDeleteTarget) return
    try {
      const res = await bulkDeleteMutation.mutateAsync({ ids: bulkDeleteTarget })
      toast.success(`সফলভাবে ${res.count}টি বাক্য রূপান্তর মুছে ফেলা হয়েছে।`)
      setBulkDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || "বাক্য রূপান্তর ডিলিট করা সম্ভব হয়নি")
    }
  }

  const { data: statsData, isLoading: isStatsLoading } = useChangingSentenceStats(
    params.subjectId !== "All" ? { subjectId: params.subjectId } : undefined
  )

  const { data: listData, isLoading: isListLoading, isError } = useChangingSentenceList({
    page: params.page,
    limit: params.limit,
    query: params.query || undefined,
    subjectId: params.subjectId !== "All" ? params.subjectId : undefined,
    difficulty: params.difficulty !== "All" ? params.difficulty : undefined,
    sort: params.sort !== "All" ? params.sort : undefined,
  })

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      <PageHeader
        title="বাক্য রূপান্তর প্রশ্ন ব্যাংক (Changing Sentences)"
        description="শ্রেণি ও বিষয়ভিত্তিক বাক্য রূপান্তর প্রশ্ন, নির্দেশনা, রেফারেন্স এবং কঠিনতার স্তর পরিচালনা করুন।"
        icon={Sparkles}
        badge={{ label: "Changing Sentence", variant: "indigo" }}
        action={{
          label: "নতুন প্রশ্ন যোগ করুন",
          href: "/changing-sentences/create",
          icon: Plus,
        }}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-foreground font-semibold text-xs sm:text-sm gap-2"
        >
          <Link href="/changing-sentences/import" prefetch={true}>
            <Upload className="w-4 h-4" />
            <span>JSON ইমপোর্ট</span>
          </Link>
        </Button>
      </PageHeader>

      <ChangingSentenceStatsCards
        totalCount={statsData?.totalCount}
        difficultyCounts={statsData?.difficultyCounts}
        isLoading={isStatsLoading}
      />

      <ChangingSentenceFilters
        searchQuery={params.query}
        onSearchChange={(query) => setParams({ query, page: 1 })}
        selectedAcademicClassId={selectedAcademicClassId}
        onAcademicClassChange={(clsId) => {
          setParams({ classId: clsId, subjectId: "All", page: 1 })
        }}
        academicClasses={academicClasses}
        selectedSubjectId={params.subjectId}
        onSubjectChange={(subjectId) => setParams({ subjectId, page: 1 })}
        subjects={subjects}
        selectedDifficulty={params.difficulty}
        onDifficultyChange={(difficulty) => setParams({ difficulty, page: 1 })}
        selectedSort={params.sort}
        onSortChange={(sort) => setParams({ sort: sort as any, page: 1 })}
      />

      <ChangingSentenceTable
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
        title="বাক্য রূপান্তর প্রশ্ন ডিলিট করতে চান?"
        itemName={deleteTarget?.snippet}
        warningText="এই প্রশ্নটি ডিলিট করলে এটি প্রশ্ন ব্যাংক থেকে স্থায়ীভাবে মুছে যাবে।"
        isLoading={deleteMutation.isPending}
      />

      <ConfirmDeleteDialog
        isOpen={Boolean(bulkDeleteTarget && bulkDeleteTarget.length > 0)}
        onClose={() => setBulkDeleteTarget(null)}
        onConfirm={handleConfirmBulkDelete}
        title={`${bulkDeleteTarget?.length ?? 0}টি বাক্য রূপান্তর ডিলিট নিশ্চিত করুন`}
        itemName={`${bulkDeleteTarget?.length ?? 0}টি নির্বাচিত প্রশ্ন`}
        warningText="নির্বাচিত সকল প্রশ্ন স্থায়ীভাবে মুছে যাবে। এটি আর ফেরানো সম্ভব নয়।"
        isLoading={bulkDeleteMutation.isPending}
      />
    </div>
  )
}
