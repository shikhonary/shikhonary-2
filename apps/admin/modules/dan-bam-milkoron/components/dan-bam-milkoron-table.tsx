"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { RenderMath } from "@workspace/ui/components/render-math"
import "katex/dist/katex.min.css"
import { ChevronLeft, ChevronRight, Edit3, Trash2, ArrowRightLeft } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

export interface DanBamMilkoronItem {
  id: string
  leftColumn: string[]
  rightColumn: string[]
  difficulty: string
  reference: string[]
  popularityCount: number
  source?: string | null
  session?: string | null
  isActive: boolean
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

interface DanBamMilkoronTableProps {
  items: DanBamMilkoronItem[]
  isLoading: boolean
  isError: boolean
  onDelete: (id: string, snippet: string) => void
  onBulkDelete: (selectedIds: string[]) => void
  currentPage: number
  itemsPerPage: number
  totalItems: number
  totalPages: number
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
}

/**
 * Renders the 2 columns of Dan-Bam Milkoron in a clean bordered grid
 */
export function DanBamMilkoronGrid({
  leftColumn = [],
  rightColumn = [],
}: {
  leftColumn: string[]
  rightColumn: string[]
}) {
  const maxRows = Math.max(leftColumn.length, rightColumn.length, 1)

  return (
    <div className="w-full max-w-2xl overflow-x-auto my-2 rounded-lg border border-outline-variant/60 bg-white">
      <table className="w-full border-collapse text-left text-xs sm:text-sm bg-white">
        <thead>
          <tr className="bg-surface-container-high/50 border-b border-outline-variant/40">
            <th className="px-3 py-1.5 font-bold text-primary border-r border-outline-variant/40 w-1/2 text-xs uppercase tracking-wider">
              বাম পাশ (Left Column)
            </th>
            <th className="px-3 py-1.5 font-bold text-primary w-1/2 text-xs uppercase tracking-wider">
              ডান পাশ (Right Column)
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: maxRows }).map((_, idx) => (
            <tr
              key={idx}
              className={cn(
                "border-b last:border-b-0 border-outline-variant/30 hover:bg-surface-container-low/40 transition-colors",
                idx % 2 === 0 ? "bg-white" : "bg-surface-container-lowest/30"
              )}
            >
              <td className="px-3 py-2 border-r border-outline-variant/30 font-medium text-on-surface align-top">
                {leftColumn[idx] !== undefined ? (
                  <div className="flex items-start gap-1.5">
                    <span className="text-[11px] font-bold text-primary/70 shrink-0 select-none">
                      ({idx + 1})
                    </span>
                    <span className="leading-relaxed">
                      <RenderMath text={leftColumn[idx]} />
                    </span>
                  </div>
                ) : (
                  <span className="text-outline italic text-xs">-</span>
                )}
              </td>
              <td className="px-3 py-2 font-medium text-on-surface align-top">
                {rightColumn[idx] !== undefined ? (
                  <div className="flex items-start gap-1.5">
                    <span className="text-[11px] font-bold text-secondary/70 shrink-0 select-none">
                      ({String.fromCharCode(0x0995 + idx)})
                    </span>
                    <span className="leading-relaxed">
                      <RenderMath text={rightColumn[idx]} />
                    </span>
                  </div>
                ) : (
                  <span className="text-outline italic text-xs">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function DanBamMilkoronTable({
  items,
  isLoading,
  isError,
  onDelete,
  onBulkDelete,
  currentPage,
  itemsPerPage,
  totalItems,
  totalPages,
  onPageChange,
  onLimitChange,
}: DanBamMilkoronTableProps) {
  const displayStart = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
  const displayEnd = Math.min(currentPage * itemsPerPage, totalItems)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

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

  const allSelected =
    items.length > 0 && items.every((item) => selectedIds.includes(item.id))

  return (
    <div className="w-full space-y-6">
      {/* Selection Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="select-all"
              aria-label="Select all questions on this page"
              checked={allSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="size-4 rounded border-outline-variant text-primary focus:ring-primary/20 cursor-pointer"
            />
            <label
              htmlFor="select-all"
              className="text-sm font-medium text-on-surface cursor-pointer select-none"
            >
              Select All on this page
            </label>
          </div>
          {selectedIds.length > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {selectedIds.length} selected
            </span>
          )}
        </div>

        {selectedIds.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onBulkDelete(selectedIds)}
            className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Selected ({selectedIds.length})
          </Button>
        )}
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto rounded-xl border border-outline-variant/30 bg-surface shadow-xs">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-outline-variant/30 bg-surface-container-low">
              <th className="w-12 px-4 py-3.5 text-center">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={allSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="size-4 rounded border-outline-variant text-primary focus:ring-primary/20 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                বাম-ডান তথ্য (Columns)
              </th>
              <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                বিষয় ও অধ্যায়
              </th>
              <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                কঠিনতার স্তর
              </th>
              <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                রেফারেন্স
              </th>
              <th className="px-4 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                অ্যাকশন
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="text-sm font-medium">লোড হচ্ছে...</p>
                  </div>
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-error">
                  <p className="text-sm font-medium">তথ্য লোড করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।</p>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ArrowRightLeft className="size-8 text-outline" />
                    <p className="text-sm font-medium">কোনো ডান-বাম মিলকরণ তথ্য পাওয়া যায়নি</p>
                    <p className="text-xs text-outline">নতুন প্রশ্ন তৈরি করুন অথবা JSON ইমপোর্ট করুন</p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isSelected = selectedIds.includes(item.id)
                const snippet = item.leftColumn?.[0] || item.rightColumn?.[0] || "ডান-বাম মিলকরণ"
                return (
                  <tr
                    key={item.id}
                    className={cn(
                      "transition-colors hover:bg-surface-container-low/50",
                      isSelected && "bg-primary/5 hover:bg-primary/10"
                    )}
                  >
                    <td className="px-4 py-3 text-center align-top">
                      <input
                        type="checkbox"
                        aria-label={`Select item`}
                        checked={isSelected}
                        onChange={(e) => handleSelectOne(item.id, e.target.checked)}
                        className="size-4 rounded border-outline-variant text-primary focus:ring-primary/20 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 align-top min-w-[340px]">
                      <DanBamMilkoronGrid
                        leftColumn={item.leftColumn}
                        rightColumn={item.rightColumn}
                      />
                      {item.source && (
                        <span className="text-[11px] text-outline mt-1 inline-block">
                          উৎস: {item.source}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-xs">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-on-surface">
                          {item.subject?.nameEn || "N/A"}
                          {item.subject?.nameBn && (
                            <span className="text-on-surface-variant ml-1 font-normal">
                              ({item.subject.nameBn})
                            </span>
                          )}
                        </span>
                        {item.academicChapter && (
                          <span className="text-on-surface-variant">
                            অধ্যায়: {item.academicChapter.nameEn}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wider",
                          item.difficulty === "EASY"
                            ? "bg-emerald-100 text-emerald-800"
                            : item.difficulty === "MEDIUM"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        )}
                      >
                        {item.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-on-surface-variant max-w-[200px]">
                      {item.reference && item.reference.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.reference.map((ref, idx) => (
                            <span
                              key={idx}
                              className="rounded bg-surface-container px-1.5 py-0.5 text-[10px] text-on-surface"
                            >
                              {ref}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-outline italic">-</span>
                      )}
                      {item.session && (
                        <div className="text-[11px] text-outline mt-0.5">
                          সেশন: {item.session}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right align-top">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dan-bam-milkoron/${item.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="size-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(item.id, snippet)}
                          className="size-8 text-error hover:text-error hover:bg-error/10 rounded-lg cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span>
              Showing <span className="font-semibold text-on-surface">{displayStart}</span> to{" "}
              <span className="font-semibold text-on-surface">{displayEnd}</span> of{" "}
              <span className="font-semibold text-on-surface">{totalItems}</span> items
            </span>
            {onLimitChange && (
              <div className="flex items-center gap-1.5 ml-4">
                <span>Rows:</span>
                <Select
                  value={String(itemsPerPage)}
                  onValueChange={(val) => onLimitChange(Number(val))}
                >
                  <SelectTrigger className="h-7 w-16 text-xs bg-white border-outline-variant">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="h-8 px-2.5 text-xs border-outline-variant disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              Previous
            </Button>
            <span className="text-xs px-2 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="h-8 px-2.5 text-xs border-outline-variant disabled:opacity-40 cursor-pointer"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
