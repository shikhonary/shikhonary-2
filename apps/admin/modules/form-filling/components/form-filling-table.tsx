"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { RenderMath } from "@workspace/ui/components/render-math"
import "katex/dist/katex.min.css"
import { ChevronLeft, ChevronRight, Edit3, Trash2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

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

interface ParsedFormField {
  sl?: string
  label: string
  solutionValue?: string
}

function parseFormFields(formData: any, solutionData?: any): ParsedFormField[] {
  if (!formData) return []

  let formObj = formData
  if (typeof formData === "string") {
    try {
      formObj = JSON.parse(formData)
    } catch {
      return []
    }
  }

  let solObj = solutionData
  if (typeof solutionData === "string") {
    try {
      solObj = JSON.parse(solutionData)
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
          solutionValue: Array.isArray(solObj) ? String(solObj[idx] ?? "") : (solObj && typeof solObj === "object" ? String(solObj[item] ?? "") : "")
        }
      }
      return {
        sl: item.sl || defaultSl,
        label: item.label || item.name || item.key || `Field ${idx + 1}`,
        solutionValue: item.value || (solObj && typeof solObj === "object" ? String(solObj[item.key || item.label] ?? "") : "")
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
  renderJsonPretty,
}: {
  item: FormFillingItem
  globalIndex: number
  isSelected: boolean
  onSelectOne: (id: string, checked: boolean) => void
  onDelete: (id: string, snippet: string) => void
  renderJsonPretty: (val: any) => string | null
}) {
  const [viewMode, setViewMode] = useState<"exam" | "solution" | "raw">("exam")
  const fields = parseFormFields(item.formData, item.solution)
  const bengaliDigits = ["১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯", "১০", "১১", "১২", "১৩", "১৪", "১৫"]
  const bengaliIndex = bengaliDigits[globalIndex - 1] || String(globalIndex)

  return (
    <div
      className={cn(
        "bg-white border rounded-2xl p-5 sm:p-7 transition-all hover:border-primary/50 hover:shadow-md relative group",
        isSelected ? "border-primary ring-2 ring-primary/20 bg-primary-container/5" : "border-outline-variant/60"
      )}
    >
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        {/* Selection Checkbox & Main Content */}
        <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0 w-full relative md:static">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelectOne(item.id, e.target.checked)}
            className="absolute top-[6px] left-0 md:relative md:top-0 md:left-0 md:mt-1 h-4 w-4 rounded-sm border-outline-variant text-primary focus:ring-primary cursor-pointer shrink-0"
          />

          <div className="flex-1 space-y-5 min-w-0">
            {/* Header Controls & Badges Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pl-7 md:pl-0 border-b border-outline-variant/30 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                {/* Global Index Badge */}
                <span className="px-2 py-0.5 bg-surface-container-high font-mono text-[11px] font-bold text-on-surface-variant rounded">
                  #{globalIndex}
                </span>

                {/* Subject Badge */}
                {item.subject && (
                  <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded font-label-sm text-xs font-bold border border-primary/20">
                    {item.subject.nameBn || item.subject.nameEn}
                  </span>
                )}

                {/* Chapter Badge */}
                {item.academicChapter && (
                  <span className="px-2.5 py-0.5 bg-surface-container-high text-on-surface-variant rounded font-label-sm text-xs font-semibold">
                    {item.academicChapter.nameBn || item.academicChapter.nameEn}
                  </span>
                )}

                {/* Popularity Badge */}
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded font-label-sm text-[11px] font-bold border border-blue-100 uppercase">
                  👁️ {item.popularityCount} Views
                </span>

                {/* Difficulty Badge */}
                <span className={cn(
                  "px-2.5 py-0.5 rounded font-label-sm text-[11px] font-bold border uppercase",
                  item.difficulty === "EASY" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                  item.difficulty === "MEDIUM" && "bg-amber-50 text-amber-700 border-amber-200",
                  item.difficulty === "HARD" && "bg-red-50 text-red-700 border-red-200"
                )}>
                  {item.difficulty}
                </span>
              </div>

              {/* View Mode Switcher Pills */}
              <div className="inline-flex items-center rounded-lg border border-outline-variant/40 bg-surface-container-low p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setViewMode("exam")}
                  className={cn(
                    "rounded-md px-2.5 py-1 transition-all cursor-pointer font-label-sm text-xs",
                    viewMode === "exam" ? "bg-white text-primary shadow-xs font-bold" : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  📄 প্রশ্নপত্র (Exam)
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("solution")}
                  className={cn(
                    "rounded-md px-2.5 py-1 transition-all cursor-pointer font-label-sm text-xs",
                    viewMode === "solution" ? "bg-white text-primary shadow-xs font-bold" : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  ✨ সমাধান (Solution)
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("raw")}
                  className={cn(
                    "rounded-md px-2.5 py-1 transition-all cursor-pointer font-label-sm text-xs",
                    viewMode === "raw" ? "bg-white text-primary shadow-xs font-bold" : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  ⚙️ JSON
                </button>
              </div>
            </div>

            {/* 1. SCENARIO / উদ্দীপক (Top question text) */}
            <div className="pl-7 md:pl-0">
              <div className="font-solaiman text-base sm:text-lg font-bold text-neutral-900 leading-relaxed flex items-start gap-2">
                <span className="shrink-0">{bengaliIndex}।</span>
                <div className="flex-1">
                  <RenderMath text={item.scenario} isMath={true} />
                </div>
              </div>
            </div>

            {/* 2. AUTHENTIC FORM BOX (Matching Attachment) */}
            {viewMode !== "raw" ? (
              <div className="pl-7 md:pl-0">
                <div className="border-2 border-neutral-900 rounded-sm bg-white p-5 sm:p-8 shadow-xs space-y-6 text-neutral-900 font-solaiman relative">
                  {/* Photo Slot (Top Right Corner) */}
                  {item.hasPhoto && (
                    <div className="absolute right-4 sm:right-6 top-4 sm:top-6 w-16 h-20 sm:w-20 sm:h-24 border-2 border-neutral-900 rounded-xs flex items-center justify-center bg-white text-neutral-900 font-bold text-sm sm:text-base select-none z-10">
                      ছবি
                    </div>
                  )}

                  {/* Header Title & Institution */}
                  <div className={cn(
                    "text-center space-y-1 pb-2",
                    item.hasPhoto ? "pr-20 sm:pr-28 pl-4" : "px-4"
                  )}>
                    {item.institution && (
                      <h3 className="text-base sm:text-xl font-bold tracking-tight text-neutral-900 leading-snug">
                        {item.institution}
                      </h3>
                    )}
                    {item.title && (
                      <h4 className="text-sm sm:text-lg font-bold text-neutral-900">
                        {item.title}
                      </h4>
                    )}
                    {item.description && (
                      <p className="text-xs sm:text-sm font-semibold text-neutral-700">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Form Fields with Dotted Lines */}
                  <div className="space-y-3 sm:space-y-4 pt-2">
                    {fields.length > 0 ? (
                      fields.map((field, fIdx) => (
                        <div key={fIdx} className="flex items-baseline text-sm sm:text-base leading-relaxed group/field">
                          {/* Label with serial and colon */}
                          <div className="flex items-baseline shrink-0 gap-1.5 min-w-[130px] sm:min-w-[170px]">
                            {field.sl && <span className="font-bold">{field.sl}</span>}
                            <span className="font-bold">{field.label}</span>
                            <span className="font-bold ml-auto mr-2">:</span>
                          </div>

                          {/* Dotted underline fill area */}
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
                      <div className="text-center py-4 text-xs font-mono text-outline">
                        {renderJsonPretty(item.formData)}
                      </div>
                    )}
                  </div>

                  {/* Declaration Note */}
                  {item.declaration && (
                    <div className="pt-4 text-xs sm:text-sm text-neutral-900 leading-relaxed font-semibold">
                      {item.declaration}
                    </div>
                  )}

                  {/* Signatures */}
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
              /* RAW JSON VIEW */
              <div className="pl-7 md:pl-0 space-y-3">
                {item.formData && (
                  <div className="text-xs font-mono bg-neutral-50 p-4 rounded-xl border border-outline-variant/60 space-y-1">
                    <span className="font-bold text-outline text-[10px] uppercase tracking-wider block font-sans">Form Data (JSON):</span>
                    <pre className="whitespace-pre-wrap font-mono text-neutral-900 overflow-x-auto">
                      {renderJsonPretty(item.formData)}
                    </pre>
                  </div>
                )}
                {item.solution && (
                  <div className="text-xs font-mono bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-1">
                    <span className="font-bold text-emerald-800 text-[10px] uppercase tracking-wider block font-sans">Solution (JSON):</span>
                    <pre className="whitespace-pre-wrap font-mono text-emerald-900 overflow-x-auto">
                      {renderJsonPretty(item.solution)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Reference Tags & ID Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/30 pt-3 pl-7 md:pl-0">
              <div className="flex flex-wrap items-center gap-1.5">
                {(item.source || item.session) && (
                  <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[11px] font-semibold border border-primary/20">
                    📚 {item.source || "N/A"}{item.session ? ` (${item.session})` : ""}
                  </span>
                )}
                {Array.isArray(item.reference) && item.reference.length > 0 ? (
                  item.reference.map((ref, rIdx) => (
                    <span
                      key={rIdx}
                      className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[11px] font-medium border border-neutral-200"
                    >
                      🏷️ {ref}
                    </span>
                  ))
                ) : (
                  !(item.source || item.session) && (
                    <span className="text-[11px] text-muted-foreground italic">No reference tags</span>
                  )
                )}
              </div>

              <span className="text-[11px] font-mono text-outline/60">
                ID: {item.id}
              </span>
            </div>
          </div>
        </div>

        {/* Actions Column */}
        <div className="flex md:flex-col justify-end items-center gap-2 shrink-0 border-t md:border-t-0 border-outline-variant/40 pt-3 md:pt-0 w-full md:w-auto">
          <Link
            href={`/form-filling/${item.id}/edit`}
            className="p-2.5 hover:bg-neutral-100 rounded-xl text-primary transition-all cursor-pointer border border-outline-variant/40 hover:border-primary/40 text-center flex-1 md:flex-initial"
            title="Edit Form Fillup"
          >
            <Edit3 className="size-5 mx-auto" />
          </Link>

          <button
            type="button"
            onClick={() => onDelete(item.id, item.scenario)}
            className="p-2.5 hover:bg-error-container/30 rounded-xl text-error transition-all cursor-pointer border border-outline-variant/40 hover:border-error/40 flex-1 md:flex-initial"
            title="Delete Form Fillup"
          >
            <Trash2 className="size-5 mx-auto" />
          </button>
        </div>
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
  totalPages: number
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
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
  totalPages,
  onPageChange,
  onLimitChange,
}: FormFillingTableProps) {
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

  const renderJsonPretty = (val: any) => {
    if (val === null || val === undefined) return null
    if (typeof val === "string") return val
    try {
      return JSON.stringify(val, null, 2)
    } catch {
      return String(val)
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Selection Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="h-4 w-4 rounded-sm border-outline-variant text-primary focus:ring-primary cursor-pointer"
            />
            <span className="font-label-sm text-xs font-bold uppercase tracking-wider text-outline">
              Select All ({items.length})
            </span>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3 pl-4 border-l border-outline-variant">
              <span className="font-label-sm text-xs font-semibold text-primary">
                {selectedIds.length} items selected
              </span>
              <Button
                type="button"
                onClick={() => {
                  onBulkDelete(selectedIds)
                  setSelectedIds([])
                }}
                className="flex items-center gap-1.5 rounded-lg bg-error px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-error/90 cursor-pointer h-auto"
              >
                <Trash2 className="size-3.5" />
                <span>Delete Selected</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-16 text-center text-on-surface-variant rounded-xl border border-outline-variant bg-white">
          <div className="flex flex-col items-center justify-center gap-3">
            <span className="animate-spin text-primary text-sm font-bold">
              Loading...
            </span>
            <span className="font-body-md text-sm font-medium">Loading Form Fillups...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <div className="py-16 text-center text-error rounded-xl border border-error/30 bg-error-container/20">
          <div className="flex flex-col items-center justify-center gap-3">
            <span className="text-xl font-bold">⚠️ Error</span>
            <span className="font-body-md text-sm font-medium">
              Error loading form fillups. Please try refreshing.
            </span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && items.length === 0 && (
        <div className="py-16 text-center text-on-surface-variant rounded-xl border border-outline-variant bg-white">
          <div className="flex flex-col items-center justify-center gap-3">
            <span className="text-2xl">📋</span>
            <p className="font-headline-md text-xl font-bold text-on-surface">
              No Form Fillups Found
            </p>
            <p className="font-body-md text-sm text-outline max-w-md">
              Try adjusting filters or add a new form fillup entry to the bank.
            </p>
          </div>
        </div>
      )}

      {/* CARD VIEW LAYOUT */}
      {!isLoading && !isError && items.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {items.map((item, idx) => (
            <FormFillingCardItem
              key={item.id}
              item={item}
              globalIndex={(currentPage - 1) * itemsPerPage + idx + 1}
              isSelected={selectedIds.includes(item.id)}
              onSelectOne={handleSelectOne}
              onDelete={onDelete}
              renderJsonPretty={renderJsonPretty}
            />
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {!isLoading && !isError && totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border border-outline-variant bg-surface-container-low rounded-xl p-4">
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
            <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
              Showing <span className="font-bold">{displayStart}-{displayEnd}</span> of <span className="font-bold">{totalItems}</span> form fillups
            </p>
            {onLimitChange && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-outline font-medium">Rows per page:</span>
                <Select
                  value={String(itemsPerPage)}
                  onValueChange={(val) => onLimitChange(Number(val) || 10)}
                >
                  <SelectTrigger className="h-8 rounded-lg border border-outline-variant bg-white px-2.5 font-body-md text-xs outline-hidden focus:ring-2 focus:ring-primary/10 w-auto gap-1 cursor-pointer">
                    <SelectValue placeholder="Per Page" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-neutral-900 border border-outline-variant shadow-md rounded-lg min-w-[80px]">
                    <SelectItem value="10" className="text-neutral-900">10</SelectItem>
                    <SelectItem value="20" className="text-neutral-900">20</SelectItem>
                    <SelectItem value="50" className="text-neutral-900">50</SelectItem>
                    <SelectItem value="100" className="text-neutral-900">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className="size-8 sm:size-10 rounded-lg border border-outline-variant bg-white transition-colors hover:bg-surface-container-high disabled:opacity-30 cursor-pointer animate-fade-in"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "ghost"}
                onClick={() => onPageChange(pageNum)}
                className={`size-8 sm:size-10 rounded-lg font-body-md text-xs sm:text-sm transition-colors cursor-pointer ${
                  currentPage === pageNum
                    ? "bg-primary font-bold text-white hover:bg-primary"
                    : "hover:bg-surface-container-high text-on-surface"
                }`}
              >
                {pageNum}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              className="size-8 sm:size-10 rounded-lg border border-outline-variant bg-white transition-colors hover:bg-surface-container-high disabled:opacity-30 cursor-pointer animate-fade-in"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
