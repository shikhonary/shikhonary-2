"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Trash2, BookOpen, AlertCircle } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { RenderMath } from "@workspace/ui/components/render-math"
import { DataTablePagination } from "@/components/shared/data-table-pagination"
import {
  QuestionCardHeader,
  QuestionCardFooter,
  QuestionCardActions,
} from "@/components/shared"

export interface PoemEssenceItem {
  id: string
  title: string
  poemStanza?: string | null
  mainTheme?: string | null
  reference: string[]
  difficulty: string
  popularityCount: number
  source?: string | null
  session?: string | null
  createdAt: Date | string
  updatedAt: Date | string
  subject?: {
    id: string
    nameEn: string
    nameBn?: string
  } | null
  academicChapter?: {
    id: string
    nameEn: string
    nameBn?: string
  } | null
}

interface PoemEssenceTableProps {
  items: PoemEssenceItem[]
  isLoading: boolean
  isError: boolean
  onDelete: (id: string, titleSnippet: string) => void
  onBulkDelete: (selectedIds: string[]) => void
  currentPage: number
  itemsPerPage: number
  totalItems: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

export function PoemEssenceTable({
  items,
  isLoading,
  isError,
  onDelete,
  onBulkDelete,
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onLimitChange,
}: PoemEssenceTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const searchParams = useSearchParams()

  const buildEditHref = (id: string) => {
    const qs = searchParams.toString()
    return qs ? `/poem-essences/${id}/edit?${qs}` : `/poem-essences/${id}/edit`
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(items.map((item) => item.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id])
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id))
    }
  }

  const isAllSelected = items.length > 0 && selectedIds.length === items.length

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-24 rounded-md" />
                <Skeleton className="h-5 w-20 rounded-md" />
              </div>
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
            <Skeleton className="h-6 w-1/2 rounded-md" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-10 text-center space-y-3">
        <div className="p-3 bg-destructive/10 text-destructive rounded-full w-fit mx-auto">
          <AlertCircle className="size-8" />
        </div>
        <h3 className="text-lg font-bold text-destructive">তথ্য লোড করতে সমস্যা হয়েছে</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          দুঃখিত, কবিতার মূলভাবের তালিকা লোড করা সম্ভব হয়নি। অনুগ্রহ করে পেজটি রিফ্রেশ করে আবার চেষ্টা করুন।
        </p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-4">
        <div className="p-4 bg-muted text-muted-foreground rounded-full w-fit mx-auto">
          <BookOpen className="size-10 opacity-40" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground">কোনো কবিতার মূলভাব পাওয়া যায়নি</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            আপনার অনুসন্ধান বা ফিল্টার অনুযায়ী কোনো প্রশ্ন খুঁজে পাওয়া যায়নি। নতুন প্রশ্ন যোগ করুন অথবা ফিল্টার পরিবর্তন করুন।
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Selection & Bulk Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card px-4 py-2.5 rounded-xl border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <Checkbox
            id="select-all-poem-essence"
            checked={isAllSelected}
            onCheckedChange={(checked) => handleSelectAll(checked === true)}
          />
          <label
            htmlFor="select-all-poem-essence"
            className="text-xs font-semibold text-foreground cursor-pointer select-none"
          >
            সবগুলো নির্বাচন করুন ({items.length})
          </label>
          {selectedIds.length > 0 && (
            <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
              {selectedIds.length} টি নির্বাচিত
            </span>
          )}
        </div>

        {selectedIds.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onBulkDelete(selectedIds)
              setSelectedIds([])
            }}
            className="h-8 gap-1.5 text-xs font-bold rounded-lg cursor-pointer"
          >
            <Trash2 className="size-3.5" />
            নির্বাচিতগুলো মুছুন ({selectedIds.length})
          </Button>
        )}
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {items.map((item, idx) => {
          const globalIndex = (currentPage - 1) * itemsPerPage + idx + 1
          const isSelected = selectedIds.includes(item.id)

          return (
            <div
              key={item.id}
              className={cn(
                "bg-card border rounded-2xl p-5 sm:p-6 transition-all hover:border-primary/40 hover:shadow-md relative group",
                isSelected ? "border-primary ring-2 ring-primary/15 bg-primary/5" : "border-border"
              )}
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-5">
                <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0 w-full relative md:static">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleSelectOne(item.id, e.target.checked)}
                    className="absolute top-[6px] left-0 md:relative md:top-0 md:left-0 md:mt-1 h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer shrink-0"
                  />

                  <div className="flex-1 space-y-4 min-w-0">
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pl-7 md:pl-0">
                      <QuestionCardHeader
                        globalIndex={globalIndex}
                        subjectName={item.subject?.nameBn || item.subject?.nameEn}
                        chapterName={item.academicChapter?.nameBn || item.academicChapter?.nameEn}
                      >
                        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 rounded-lg text-[11px] font-bold border border-blue-200/60 dark:border-blue-800/40">
                          👁️ {item.popularityCount} Views
                        </span>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-lg text-[11px] font-bold border uppercase",
                            item.difficulty === "EASY" &&
                              "bg-emerald-50 text-emerald-700 border-emerald-200",
                            item.difficulty === "MEDIUM" &&
                              "bg-amber-50 text-amber-700 border-amber-200",
                            item.difficulty === "HARD" && "bg-red-50 text-red-700 border-red-200"
                          )}
                        >
                          {item.difficulty}
                        </span>
                      </QuestionCardHeader>
                    </div>

                    {/* Title, Stanza & Main Theme */}
                    <Link href={buildEditHref(item.id)} className="block pl-7 md:pl-0 space-y-3">
                      <h3
                        className={cn(
                          "text-lg font-bold text-foreground whitespace-pre-wrap leading-relaxed group-hover:text-primary transition-colors",
                          /[\u0980-\u09FF]/.test(item.title) && "font-solaiman"
                        )}
                      >
                        <RenderMath text={item.title} isMath={true} />
                      </h3>

                      {item.poemStanza && (
                        <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-foreground leading-relaxed border-l-4 border-l-primary/70">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary/80 mb-2">
                            <span>📜 কবিতার চরণসমূহ / স্তবক</span>
                          </div>
                          <div className="whitespace-pre-wrap font-solaiman text-base leading-loose">
                            <RenderMath text={item.poemStanza} isMath={true} />
                          </div>
                        </div>
                      )}

                      {item.mainTheme && (
                        <div className="rounded-xl border border-border bg-emerald-50/40 p-4 text-sm text-foreground leading-relaxed border-l-4 border-l-emerald-500">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-2">
                            <span>💡 মূলভাব / সারমর্ম</span>
                          </div>
                          <div className="whitespace-pre-wrap font-solaiman text-base leading-loose">
                            <RenderMath text={item.mainTheme} isMath={true} />
                          </div>
                        </div>
                      )}
                    </Link>

                    {/* Footer Meta */}
                    <div className="pl-7 md:pl-0">
                      <QuestionCardFooter
                        source={item.source}
                        session={item.session}
                        references={item.reference}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions Column */}
                <QuestionCardActions
                  editHref={buildEditHref(item.id)}
                  onDelete={() => onDelete(item.id, item.title)}
                  editTitle="Edit Poem Essence"
                  deleteTitle="Delete Poem Essence"
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      <DataTablePagination
        page={currentPage}
        limit={itemsPerPage}
        totalItems={totalItems}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        pageSizeOptions={[10, 20, 50, 100]}
        entityName="টি প্রশ্ন"
        isLoading={isLoading}
      />
    </div>
  )
}
