"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Trash2, FileText, AlertCircle } from "lucide-react"
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

export interface FormFillingItem {
  id: string
  scenario: string
  institution?: string | null
  title?: string | null
  description?: string | null
  hasPhoto?: boolean
  declaration?: string | null
  signatures?: string[]
  formData: any
  solution?: any | null
  reference: string[]
  source?: string | null
  session?: string | null
  difficulty: string
  popularityCount: number
  subjectId: string
  chapterId?: string | null
  academicChapterId?: string | null
  subject?: {
    id: string
    nameBn: string
    nameEn: string
  }
  academicChapter?: {
    id: string
    nameBn: string
    nameEn: string
  } | null
  createdAt: Date | string
  updatedAt: Date | string
}

interface ParsedField {
  sl: string
  label: string
  solutionValue: string
}

function parseFormFields(formData: any, solution: any): ParsedField[] {
  let formObj: any = formData
  let solObj: any = solution

  if (typeof formData === "string") {
    try {
      formObj = JSON.parse(formData)
    } catch {
      return []
    }
  }

  if (typeof solution === "string") {
    try {
      solObj = JSON.parse(solution)
    } catch {
      solObj = null
    }
  }

  const bengaliDigits = ["১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯", "১০", "১১", "১২", "১৩", "১৪", "১৫"]

  if (Array.isArray(formObj)) {
    return formObj.map((item, idx) => {
      const defaultSl = bengaliDigits[idx] ? `${bengaliDigits[idx]}.` : `${idx + 1}.`
      if (typeof item === "string") {
        return {
          sl: defaultSl,
          label: item,
          solutionValue: Array.isArray(solObj)
            ? String(solObj[idx] ?? "")
            : solObj && typeof solObj === "object"
              ? String(solObj[item] ?? "")
              : "",
        }
      }
      return {
        sl: item.sl || defaultSl,
        label: item.label || item.name || item.key || `Field ${idx + 1}`,
        solutionValue:
          item.value ||
          (solObj && typeof solObj === "object" ? String(solObj[item.key || item.label] ?? "") : ""),
      }
    })
  }

  if (typeof formObj === "object" && formObj !== null) {
    return Object.entries(formObj).map(([key, val], idx) => {
      const matchPrefix = key.match(/^([\d১-৯]+[\.\:\-]?)\s*(.*)$/)
      let sl = bengaliDigits[idx] ? `${bengaliDigits[idx]}.` : `${idx + 1}.`
      let label = key

      if (matchPrefix && matchPrefix[1] && matchPrefix[2]) {
        sl = matchPrefix[1]
        label = matchPrefix[2]
      }

      let solVal = ""
      if (solObj && typeof solObj === "object") {
        solVal = solObj[key] ?? solObj[label] ?? ""
      } else if (val) {
        solVal = String(val)
      }

      return {
        sl,
        label,
        solutionValue: String(solVal || ""),
      }
    })
  }

  return []
}

function FormFillingCardItem({
  item,
  globalIndex,
  isSelected,
  onSelectOne,
  onDelete,
  editHref,
  renderJsonPretty,
}: {
  item: FormFillingItem
  globalIndex: number
  isSelected: boolean
  onSelectOne: (id: string, checked: boolean) => void
  onDelete: (id: string, snippet: string) => void
  editHref: string
  renderJsonPretty: (val: any) => string | null
}) {
  const [viewMode, setViewMode] = useState<"exam" | "solution" | "raw">("exam")
  const fields = parseFormFields(item.formData, item.solution)
  const bengaliDigits = ["১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯", "১০", "১১", "১২", "১৩", "১৪", "১৫"]
  const bengaliIndex = bengaliDigits[globalIndex - 1] || String(globalIndex)

  return (
    <div
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
            onChange={(e) => onSelectOne(item.id, e.target.checked)}
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
                    item.difficulty === "EASY" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                    item.difficulty === "MEDIUM" && "bg-amber-50 text-amber-700 border-amber-200",
                    item.difficulty === "HARD" && "bg-red-50 text-red-700 border-red-200"
                  )}
                >
                  {item.difficulty}
                </span>
              </QuestionCardHeader>

              {/* View Mode Switcher Pills */}
            <div className="inline-flex items-center rounded-lg border border-border bg-muted/40 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode("exam")}
                className={cn(
                  "rounded-md px-2.5 py-1 transition-all cursor-pointer text-xs",
                  viewMode === "exam"
                    ? "bg-background text-primary shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                📄 প্রশ্নপত্র (Exam)
              </button>
              <button
                type="button"
                onClick={() => setViewMode("solution")}
                className={cn(
                  "rounded-md px-2.5 py-1 transition-all cursor-pointer text-xs",
                  viewMode === "solution"
                    ? "bg-background text-primary shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                ✨ সমাধান (Solution)
              </button>
              <button
                type="button"
                onClick={() => setViewMode("raw")}
                className={cn(
                  "rounded-md px-2.5 py-1 transition-all cursor-pointer text-xs",
                  viewMode === "raw"
                    ? "bg-background text-primary shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                ⚙️ JSON
              </button>
            </div>
          </div>

          {/* 1. SCENARIO / উদ্দীপক */}
          <div className="pl-0 md:pl-7">
            <div className="font-solaiman text-base sm:text-lg font-bold text-foreground leading-relaxed flex items-start gap-2">
              <span className="shrink-0">{bengaliIndex}।</span>
              <div className="flex-1">
                <RenderMath text={item.scenario} isMath={true} />
              </div>
            </div>
          </div>

          {/* 2. AUTHENTIC FORM BOX */}
          {viewMode !== "raw" ? (
            <div className="pl-0 md:pl-7">
              <div className="border-2 border-neutral-900 rounded-sm bg-white p-5 sm:p-8 shadow-xs space-y-6 text-neutral-900 font-solaiman relative">
                {item.hasPhoto && (
                  <div className="absolute right-4 sm:right-6 top-4 sm:top-6 w-16 h-20 sm:w-20 sm:h-24 border-2 border-neutral-900 rounded-xs flex items-center justify-center bg-white text-neutral-900 font-bold text-sm sm:text-base select-none z-10">
                    ছবি
                  </div>
                )}

                <div
                  className={cn(
                    "text-center space-y-1 pb-2",
                    item.hasPhoto ? "pr-20 sm:pr-28 pl-4" : "px-4"
                  )}
                >
                  {item.institution && (
                    <h3 className="text-base sm:text-xl font-bold tracking-tight text-neutral-900 leading-snug">
                      {item.institution}
                    </h3>
                  )}
                  {item.title && (
                    <h4 className="text-sm sm:text-lg font-bold text-neutral-900">{item.title}</h4>
                  )}
                  {item.description && (
                    <p className="text-xs sm:text-sm font-semibold text-neutral-700">{item.description}</p>
                  )}
                </div>

                <div className="space-y-3 sm:space-y-4 pt-2">
                  {fields.length > 0 ? (
                    fields.map((field, fIdx) => (
                      <div key={fIdx} className="flex items-baseline text-sm sm:text-base leading-relaxed group/field">
                        <div className="flex items-baseline shrink-0 gap-1.5 min-w-[130px] sm:min-w-[170px]">
                          {field.sl && <span className="font-bold">{field.sl}</span>}
                          <span className="font-bold">{field.label}</span>
                          <span className="font-bold ml-auto mr-2">:</span>
                        </div>

                        <div className="flex-1 relative min-h-[1.4rem] flex items-baseline">
                          {viewMode === "solution" && field.solutionValue ? (
                            <div className="w-full flex items-baseline border-b border-dotted border-neutral-700 pb-0.5">
                              <span className="font-bold text-primary px-2 text-sm sm:text-base">
                                {field.solutionValue}
                              </span>
                            </div>
                          ) : (
                            <div className="w-full border-b-2 border-dotted border-neutral-700 translate-y-[-4px]" />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-xs font-mono text-muted-foreground">
                      {renderJsonPretty(item.formData)}
                    </div>
                  )}
                </div>

                {item.declaration && (
                  <div className="pt-4 text-xs sm:text-sm text-neutral-900 leading-relaxed font-semibold">
                    {item.declaration}
                  </div>
                )}

                <div className="pt-6 sm:pt-8 flex flex-wrap items-end justify-end gap-6 sm:gap-10">
                  {(item.signatures && item.signatures.length > 0
                    ? item.signatures
                    : ["প্রার্থীর স্বাক্ষর"]
                  ).map((sig, sIdx) => (
                    <div key={sIdx} className="text-center min-w-[130px] sm:min-w-[160px]">
                      <div className="w-full border-b-2 border-neutral-900 mb-1" />
                      <span className="text-xs sm:text-sm font-bold text-neutral-900">{sig}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="pl-0 md:pl-7 space-y-3">
              {item.formData && (
                <div className="text-xs font-mono bg-muted/40 p-4 rounded-xl border border-border space-y-1">
                  <span className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider block font-sans">
                    Form Data (JSON):
                  </span>
                  <pre className="whitespace-pre-wrap font-mono text-foreground overflow-x-auto">
                    {renderJsonPretty(item.formData)}
                  </pre>
                </div>
              )}
              {item.solution && (
                <div className="text-xs font-mono bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-1">
                  <span className="font-bold text-emerald-800 text-[10px] uppercase tracking-wider block font-sans">
                    Solution (JSON):
                  </span>
                  <pre className="whitespace-pre-wrap font-mono text-emerald-900 overflow-x-auto">
                    {renderJsonPretty(item.solution)}
                  </pre>
                </div>
              )}
            </div>
          )}

            {/* Footer Meta */}
            <div className="pl-0 md:pl-7">
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
          editHref={editHref}
          onDelete={() => onDelete(item.id, item.scenario)}
          editTitle="Edit Form Fillup"
          deleteTitle="Delete Form Fillup"
        />
      </div>
    </div>
  )
}

interface FormFillingTableProps {
  items: FormFillingItem[]
  isLoading: boolean
  isError: boolean
  onDelete: (id: string, scenarioSnippet: string) => void
  onBulkDelete: (selectedIds: string[]) => void
  currentPage: number
  itemsPerPage: number
  totalItems: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

export function FormFillingTable({
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
}: FormFillingTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const searchParams = useSearchParams()

  const buildEditHref = (id: string) => {
    const qs = searchParams.toString()
    return qs ? `/form-filling/${id}/edit?${qs}` : `/form-filling/${id}/edit`
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

  const renderJsonPretty = (val: any) => {
    if (!val) return null
    try {
      const obj = typeof val === "string" ? JSON.parse(val) : val
      return JSON.stringify(obj, null, 2)
    } catch {
      return String(val)
    }
  }

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
            <Skeleton className="h-6 w-3/4 rounded-md" />
            <Skeleton className="h-44 w-full rounded-xl" />
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
          দুঃখিত, ফর্ম পূরণের তালিকা লোড করা সম্ভব হয়নি। অনুগ্রহ করে পেজটি রিফ্রেশ করে আবার চেষ্টা করুন।
        </p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-4">
        <div className="p-4 bg-muted text-muted-foreground rounded-full w-fit mx-auto">
          <FileText className="size-10 opacity-40" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground">কোনো ফর্ম পূরণ পাওয়া যায়নি</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            আপনার অনুসন্ধান বা ফিল্টার অনুযায়ী কোনো প্রশ্ন খুঁজে পাওয়া যায়নি। নতুন ফর্ম পূরণ যোগ করুন অথবা ফিল্টার পরিবর্তন করুন।
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
            id="select-all-form-filling"
            checked={isAllSelected}
            onCheckedChange={(checked) => handleSelectAll(checked === true)}
          />
          <label
            htmlFor="select-all-form-filling"
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
            <FormFillingCardItem
              key={item.id}
              item={item}
              globalIndex={globalIndex}
              isSelected={isSelected}
              onSelectOne={handleSelectOne}
              onDelete={onDelete}
              editHref={buildEditHref(item.id)}
              renderJsonPretty={renderJsonPretty}
            />
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
