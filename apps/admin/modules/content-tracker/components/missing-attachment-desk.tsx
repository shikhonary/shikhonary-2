"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { RenderMath } from "@workspace/ui/components/render-math"
import { toast } from "@workspace/ui/components/sonner"
import {
  QuestionCardHeader,
  QuestionCardFooter,
} from "@/components/shared"
import { DataTablePagination } from "@/components/shared/data-table-pagination"
import {
  Image as ImageIcon,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Upload,
} from "lucide-react"
import { toBengaliDigits } from "@workspace/utils"
import {
  useContentTrackerMissingAttachments,
  useContentTrackerUpdateAttachmentUrl,
} from "../services/use-content-tracker"

interface MissingAttachmentDeskProps {
  subjectId: string
  chapterId?: string
  page: number
  limit: number
  onPageChange: (newPage: number) => void
  onLimitChange?: (newLimit: number) => void
}

export function MissingAttachmentDesk({
  subjectId,
  chapterId,
  page,
  limit,
  onPageChange,
  onLimitChange,
}: MissingAttachmentDeskProps) {
  // Track inline URL input values keyed by attachment ID
  const [inputUrls, setInputUrls] = useState<Record<string, string>>({})

  const { data, isLoading, refetch } = useContentTrackerMissingAttachments({
    subjectId: subjectId === "All" ? undefined : subjectId,
    chapterId: chapterId === "All" ? undefined : chapterId,
    page,
    limit,
  })

  const updateUrlMutation = useContentTrackerUpdateAttachmentUrl()

  const handleSaveUrl = async (attachmentId: string) => {
    const url = inputUrls[attachmentId]?.trim()
    if (!url) {
      toast.error("অনুগ্রহ করে একটি বৈধ ইমেজ URL লিখুন")
      return
    }

    try {
      await updateUrlMutation.mutateAsync({
        attachmentId,
        url,
      })
      toast.success("চিত্র সফলভাবে যুক্ত করা হয়েছে!")
      setInputUrls((prev) => {
        const next = { ...prev }
        delete next[attachmentId]
        return next
      })
      refetch()
    } catch (err: any) {
      toast.error(err?.message || "চিত্র আপডেট করতে ব্যর্থ হয়েছে")
    }
  }

  const items = data?.items ?? []
  const pagination = data?.pagination

  if (isLoading) {
    return (
      <div className="w-full rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-12 text-center shadow-xs">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 dark:border-primary border-t-transparent mx-auto" />
        <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-3">
          অনুপস্থিত চিত্রের তালিকা লোড হচ্ছে...
        </p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-12 text-center space-y-3 shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 mx-auto">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-foreground font-headline">
          সব চিত্র আপলোড সম্পন্ন হয়েছে!
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto font-body">
          নির্বাচিত বিষয়ের আওতায় কোনো অনুপস্থিত চিত্র বা ডায়াগ্রাম নেই। সকল প্রশ্নপত্র চিত্রসহ ব্যবহারের জন্য প্রস্তুত।
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Cards list */}
      <div className="space-y-4">
        {items.map((item, idx) => {
          const currentInputValue = inputUrls[item.id] ?? ""
          const globalIndex = (page - 1) * limit + idx + 1

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-4 sm:p-5 shadow-xs transition-all hover:border-slate-300 dark:hover:border-white/[0.15] space-y-3.5"
            >
              {/* Question Card Header from Design System */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 dark:border-white/[0.06] pb-3">
                <QuestionCardHeader
                  globalIndex={globalIndex}
                  subjectName={item.subject?.nameBn || item.subject?.nameEn}
                  chapterName={item.chapter?.nameBn || item.chapter?.nameEn}
                  isMath={item.isMath}
                >
                  <span className="px-2.5 py-0.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 rounded-lg text-xs font-bold border border-rose-200/60 dark:border-rose-800/40 font-body">
                    <ImageIcon className="h-3 w-3 mr-1 inline" />
                    {item.type}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-muted-foreground rounded-lg text-xs font-semibold font-mono">
                    {item.parentType}
                  </span>
                </QuestionCardHeader>
              </div>

              {/* Caption Description */}
              {item.caption && (
                <div className="rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 px-3.5 py-2 text-xs text-amber-900 dark:text-amber-200 font-medium">
                  🏷️ <span className="font-bold">ক্যাপশন / বিবরণ:</span> {item.caption}
                </div>
              )}

              {/* Question Stem preview */}
              <div className="space-y-1.5 bg-slate-50/60 dark:bg-white/[0.02] p-3.5 rounded-xl border border-slate-200/60 dark:border-white/[0.04]">
                {item.context && (
                  <div className="text-muted-foreground text-xs italic mb-1.5 font-body">
                    <RenderMath text={item.context} isMath={item.isMath} />
                  </div>
                )}
                <div className="text-sm font-medium text-foreground leading-relaxed font-body">
                  <RenderMath text={item.questionStem} isMath={item.isMath} />
                </div>
              </div>

              {/* Inline URL Input Form */}
              <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="https://6b90x8242j.ufs.sh/f/... (UploadThing লিংক)"
                    value={currentInputValue}
                    onChange={(e) =>
                      setInputUrls((prev) => ({
                        ...prev,
                        [item.id]: e.target.value,
                      }))
                    }
                    className="h-9.5 pl-9 text-xs font-mono rounded-xl border-slate-200 dark:border-white/[0.08]"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => handleSaveUrl(item.id)}
                  disabled={
                    !currentInputValue.trim() || updateUrlMutation.isPending
                  }
                  className="h-9.5 px-4 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-sm shadow-indigo-100/50 dark:shadow-none shrink-0"
                >
                  <Upload className="h-3.5 w-3.5 mr-1" />
                  <span>
                    {updateUrlMutation.isPending ? "সংযুক্ত হচ্ছে..." : "চিত্র সংযুক্ত করুন"}
                  </span>
                </Button>
              </div>

              {/* Question Card Footer from Design System */}
              <QuestionCardFooter references={item.reference} />
            </div>
          )
        })}
      </div>

      {/* Pagination from Design System */}
      {pagination && pagination.total > 0 && (
        <DataTablePagination
          page={page}
          limit={limit}
          totalItems={pagination.total}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          entityName="অনুপস্থিত চিত্র"
        />
      )}
    </div>
  )
}
