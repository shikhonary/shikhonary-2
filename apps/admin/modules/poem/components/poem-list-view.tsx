"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Upload, BookOpen } from "lucide-react"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { usePoemSearchParams } from "../hooks/use-poem-search-params"
import {
  usePoemsList,
  usePoemStats,
  useDeletePoem,
  useBulkDeletePoems,
} from "../services/use-poem"
import { PoemStatsCards } from "./poem-stats-cards"
import { PoemFilters } from "./poem-filters"
import { PoemTable } from "./poem-table"

export function PoemListView() {
  const [params, setParams] = usePoemSearchParams()
  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState("All")

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string | null
    ids?: string[]
    title: string
  } | null>(null)

  const deleteMutation = useDeletePoem()
  const bulkDeleteMutation = useBulkDeletePoems()

  const {
    data: listData,
    isLoading: isListLoading,
    isError: isListError,
  } = usePoemsList({
    page: params.page,
    limit: params.limit,
    query: params.query || undefined,
    subjectId: params.subjectId !== "All" ? params.subjectId : undefined,
    difficulty: params.difficulty !== "All" ? params.difficulty : undefined,
    sort: params.sort !== "All" ? (params.sort as any) : "newest",
  })

  const { data: statsData, isLoading: isStatsLoading } = usePoemStats(
    params.subjectId !== "All" ? { subjectId: params.subjectId } : undefined
  )

  const items = listData?.items || []
  const totalItems = listData?.totalItems || 0

  const handleReset = () => {
    setSelectedAcademicClassId("All")
    setParams({
      query: "",
      subjectId: "All",
      difficulty: "All",
      sort: "All",
      page: 1,
    })
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    try {
      if (deleteTarget.ids && deleteTarget.ids.length > 0) {
        await bulkDeleteMutation.mutateAsync({ ids: deleteTarget.ids })
        toast.success(`${deleteTarget.ids.length} টি কবিতা সফলভাবে মুছে ফেলা হয়েছে।`)
      } else if (deleteTarget.id) {
        await deleteMutation.mutateAsync({ id: deleteTarget.id })
        toast.success("কবিতা সফলভাবে মুছে ফেলা হয়েছে।")
      }
      setDeleteTarget(null)
    } catch (error: any) {
      toast.error(error?.message || "মুছে ফেলতে সমস্যা হয়েছে।")
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="কবিতা প্রশ্ন ব্যাংক"
        description="বিভিন্ন শ্রেণি ও বিষয়ের কবিতা প্রশ্নসমূহ পরিচালনা, সম্পাদনা এবং নতুন কবিতা যোগ করুন।"
        icon={BookOpen}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <Button asChild variant="outline" size="sm" className="h-9 gap-2 rounded-lg font-medium">
            <Link href="/poems/import">
              <Upload className="size-4" />
              <span>ইমপোর্ট করুন</span>
            </Link>
          </Button>
          <Button asChild size="sm" className="h-9 gap-2 rounded-lg font-semibold shadow-xs">
            <Link href="/poems/create">
              <Plus className="size-4" />
              <span>নতুন যোগ করুন</span>
            </Link>
          </Button>
        </div>
      </PageHeader>

      <PoemStatsCards stats={statsData} isLoading={isStatsLoading} />

      <PoemFilters
        searchQuery={params.query}
        onSearchChange={(val) => setParams({ query: val, page: 1 })}
        classId={selectedAcademicClassId}
        onClassChange={(val) => {
          setSelectedAcademicClassId(val)
          setParams({ subjectId: "All", page: 1 })
        }}
        subjectId={params.subjectId}
        onSubjectChange={(val) => setParams({ subjectId: val, page: 1 })}
        difficulty={params.difficulty}
        onDifficultyChange={(val) => setParams({ difficulty: val, page: 1 })}
        sort={params.sort}
        onSortChange={(val) => setParams({ sort: val as any, page: 1 })}
        onReset={handleReset}
      />

      <PoemTable
        items={items as any}
        isLoading={isListLoading}
        isError={isListError}
        onDelete={(id, snippet) =>
          setDeleteTarget({
            id,
            title: snippet.length > 60 ? `${snippet.slice(0, 60)}...` : snippet,
          })
        }
        onBulkDelete={(selectedIds) =>
          setDeleteTarget({
            id: null,
            ids: selectedIds,
            title: `নির্বাচিত ${selectedIds.length} টি কবিতা`,
          })
        }
        currentPage={params.page}
        itemsPerPage={params.limit}
        totalItems={totalItems}
        onPageChange={(p) => setParams({ page: p })}
        onLimitChange={(l) => setParams({ limit: l, page: 1 })}
      />

      <ConfirmDeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={deleteTarget?.ids ? "একাধিক কবিতা মুছুন" : "কবিতা মুছুন"}
        description={
          deleteTarget?.ids
            ? `আপনি কি নিশ্চিত যে আপনি নির্বাচিত ${deleteTarget.ids.length} টি কবিতা স্থায়ীভাবে মুছে ফেলতে চান?`
            : `আপনি কি নিশ্চিত যে আপনি "${deleteTarget?.title}" কবিতাটি স্থায়ীভাবে মুছে ফেলতে চান?`
        }
        isLoading={deleteMutation.isPending || bulkDeleteMutation.isPending}
      />
    </div>
  )
}
