"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Upload, ScrollText } from "lucide-react"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { useProseEssenceSearchParams } from "../hooks/use-prose-essence-search-params"
import {
  useProseEssencesList,
  useProseEssenceStats,
  useDeleteProseEssence,
  useBulkDeleteProseEssences,
} from "../services/use-prose-essence"
import { ProseEssenceStatsCards } from "./prose-essence-stats-cards"
import { ProseEssenceFilters } from "./prose-essence-filters"
import { ProseEssenceTable } from "./prose-essence-table"

export function ProseEssenceListView() {
  const [params, setParams] = useProseEssenceSearchParams()

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string | null
    ids?: string[]
    title: string
  } | null>(null)

  const deleteMutation = useDeleteProseEssence()
  const bulkDeleteMutation = useBulkDeleteProseEssences()

  const {
    data: listData,
    isLoading: isListLoading,
    isError: isListError,
  } = useProseEssencesList({
    page: params.page,
    limit: params.limit,
    query: params.query || undefined,
    subjectId: params.subjectId !== "All" ? params.subjectId : undefined,
    chapterId: params.chapterId !== "All" ? params.chapterId : undefined,
    difficulty: params.difficulty !== "All" ? params.difficulty : undefined,
    sort: params.sort !== "All" ? (params.sort as any) : "newest",
  })

  const { data: statsData, isLoading: isStatsLoading } = useProseEssenceStats({
    subjectId: params.subjectId !== "All" ? params.subjectId : undefined,
    chapterId: params.chapterId !== "All" ? params.chapterId : undefined,
  })

  const items = listData?.items || []
  const totalItems = listData?.totalItems || 0

  const handleReset = () => {
    setParams({
      query: "",
      classId: "All",
      subjectId: "All",
      chapterId: "All",
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
        toast.success(`${deleteTarget.ids.length} টি গদ্যের সারমর্ম সফলভাবে মুছে ফেলা হয়েছে।`)
      } else if (deleteTarget.id) {
        await deleteMutation.mutateAsync({ id: deleteTarget.id })
        toast.success("গদ্যের সারমর্ম সফলভাবে মুছে ফেলা হয়েছে।")
      }
      setDeleteTarget(null)
    } catch (error: any) {
      toast.error(error?.message || "মুছে ফেলতে সমস্যা হয়েছে।")
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="গদ্যের সারমর্ম প্রশ্ন ব্যাংক"
        description="বিভিন্ন শ্রেণি ও অধ্যায়ের গদ্যের সারমর্ম প্রশ্নসমূহ পরিচালনা, সম্পাদনা এবং নতুন প্রশ্ন যোগ করুন।"
        icon={ScrollText}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <Button asChild variant="outline" size="sm" className="h-9 gap-2 rounded-lg font-medium">
            <Link href="/prose-essences/import">
              <Upload className="size-4" />
              <span>ইমপোর্ট করুন</span>
            </Link>
          </Button>
          <Button asChild size="sm" className="h-9 gap-2 rounded-lg font-semibold shadow-xs">
            <Link href="/prose-essences/create">
              <Plus className="size-4" />
              <span>নতুন যোগ করুন</span>
            </Link>
          </Button>
        </div>
      </PageHeader>

      <ProseEssenceStatsCards stats={statsData} isLoading={isStatsLoading} />

      <ProseEssenceFilters
        searchQuery={params.query}
        onSearchChange={(val) => setParams({ query: val, page: 1 })}
        classId={params.classId}
        onClassChange={(val) => setParams({ classId: val, page: 1 })}
        subjectId={params.subjectId}
        onSubjectChange={(val) => setParams({ subjectId: val, page: 1 })}
        chapterId={params.chapterId}
        onChapterChange={(val) => setParams({ chapterId: val, page: 1 })}
        difficulty={params.difficulty}
        onDifficultyChange={(val) => setParams({ difficulty: val, page: 1 })}
        sort={params.sort}
        onSortChange={(val) => setParams({ sort: val as any, page: 1 })}
        onReset={handleReset}
      />

      <ProseEssenceTable
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
            title: `নির্বাচিত ${selectedIds.length} টি গদ্যের সারমর্ম`,
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
        title={deleteTarget?.ids ? "একাধিক গদ্যের সারমর্ম মুছুন" : "গদ্যের সারমর্ম মুছুন"}
        description={
          deleteTarget?.ids
            ? `আপনি কি নিশ্চিত যে আপনি নির্বাচিত ${deleteTarget.ids.length} টি গদ্যের সারমর্ম স্থায়ীভাবে মুছে ফেলতে চান?`
            : `আপনি কি নিশ্চিত যে আপনি "${deleteTarget?.title}" প্রশ্নটি স্থায়ীভাবে মুছে ফেলতে চান?`
        }
        isLoading={deleteMutation.isPending || bulkDeleteMutation.isPending}
      />
    </div>
  )
}
