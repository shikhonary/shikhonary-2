"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useToggleSeenComprehensionActive } from "../services/use-seen-comprehension"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { RenderMath } from "@workspace/ui/components/render-math"
import "katex/dist/katex.min.css"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@workspace/ui/components/accordion"
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  BookOpen,
  HelpCircle,
  FileText,
  Layers,
  Sparkles,
  CheckCircle2,
  Check,
  CheckSquare,
  Square,
  ListFilter,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

export interface SeenComprehensionItem {
  id: string
  title?: string | null
  passage: string
  instruction?: string | null
  source?: string | null
  reference: string[]
  session?: string | null
  comprehensionType: string
  difficulty: string
  totalMarks?: number | null
  popularityCount?: number
  isActive: boolean
  createdAt: Date | string
  updatedAt: Date | string
  subject: {
    id: string
    nameEn: string
    nameBn: string
    code?: string | null
  }
  academicChapter?: {
    id: string
    nameEn: string
    nameBn: string
    position?: number
  } | null
  questionType?: {
    id: string
    nameEn: string
    nameBn: string
    label: string
    mark: number
  } | null
  questions?: Array<{
    id: string
    groupNumber: number
    groupTitle?: string | null
    itemLabel?: string | null
    orderIndex: number
    type: string
    question: string
    options?: any
    answer?: string | null
    marks: number
  }>
}

interface SeenComprehensionTableProps {
  items: SeenComprehensionItem[]
  isLoading: boolean
  isError: boolean
  onDelete: (id: string, titleSnippet: string) => void
  onBulkDelete: (selectedIds: string[]) => void
  currentPage: number
  itemsPerPage: number
  totalItems: number
  totalPages: number
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
}

export function SeenComprehensionTable({
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
}: SeenComprehensionTableProps) {
  const displayStart = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
  const displayEnd = Math.min(currentPage * itemsPerPage, totalItems)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const toggleActiveMutation = useToggleSeenComprehensionActive()

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
      setSelectedIds((prev) => prev.filter((i) => i !== id))
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleToggleExpandAll = () => {
    if (expandedIds.size === items.length) {
      setExpandedIds(new Set())
    } else {
      setExpandedIds(new Set(items.map((item) => item.id)))
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await toggleActiveMutation.mutateAsync({
        id,
        isActive: !currentStatus,
      })
      toast.success(
        !currentStatus
          ? "Seen Comprehension published (active)"
          : "Seen Comprehension set to draft (inactive)"
      )
    } catch {
      toast.error("Failed to update status")
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-8 text-center text-outline shadow-xs">
        <div className="flex flex-col items-center justify-center gap-2">
          <BookOpen className="h-8 w-8 animate-pulse text-primary" />
          <p className="text-sm font-medium">Loading seen comprehensions...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center text-destructive shadow-xs">
        <p className="text-sm font-medium">Failed to load seen comprehensions. Please try again.</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-12 text-center text-outline shadow-xs">
        <BookOpen className="mx-auto h-12 w-12 text-outline/40 mb-3" />
        <h3 className="text-base font-bold text-on-surface">No seen comprehensions found</h3>
        <p className="mt-1 text-xs text-outline max-w-sm mx-auto">
          No reading comprehension questions matched your filters. Create a new one or adjust your search criteria.
        </p>
      </div>
    )
  }

  const isAllSelected = items.length > 0 && selectedIds.length === items.length
  const isAllExpanded = items.length > 0 && expandedIds.size === items.length

  return (
    <div className="space-y-4">
      {/* Batch Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-primary/10 border border-primary/20 px-4 py-2.5 text-xs text-primary font-medium">
          <div className="flex items-center gap-2">
            <span className="font-bold">{selectedIds.length}</span> items selected
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onBulkDelete(selectedIds)}
            className="rounded-lg h-8 text-xs font-bold gap-1.5 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-2 text-xs text-on-surface-variant font-medium">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4 cursor-pointer"
          />
          <span>Select all on page ({items.length})</span>
        </label>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleExpandAll}
          className="h-8 text-xs gap-1 text-primary hover:bg-primary/10 cursor-pointer"
        >
          {isAllExpanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              Collapse All
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              Expand All
            </>
          )}
        </Button>
      </div>

      {/* Accordion Cards List */}
      <div className="space-y-3">
        {items.map((item, idx) => {
          const isSelected = selectedIds.includes(item.id)
          const isExpanded = expandedIds.has(item.id)
          const isSeen2 = item.comprehensionType === "SEEN_COMPREHENSION_2"
          const subQuestions = item.questions || []

          // Group sub-questions by groupNumber
          const groupedQuestions = subQuestions.reduce((acc: Record<number, any[]>, sq: any) => {
            const gNum = sq.groupNumber || 1
            if (!acc[gNum]) acc[gNum] = []
            acc[gNum].push(sq)
            return acc
          }, {})

          const groupKeys = Object.keys(groupedQuestions).map(Number).sort((a, b) => a - b)

          return (
            <div
              key={item.id}
              className={cn(
                "rounded-2xl border bg-surface-container-lowest transition-all hover:border-primary/40 hover:shadow-xs overflow-hidden",
                isSelected
                  ? "border-primary ring-2 ring-primary/20 bg-primary/[0.02]"
                  : "border-outline-variant/60"
              )}
            >
              {/* Accordion Header / Card Summary */}
              <div
                onClick={() => toggleExpand(item.id)}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 cursor-pointer select-none hover:bg-surface-container-low/40 transition-colors"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="pt-0.5 shrink-0"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleSelectOne(item.id, e.target.checked)}
                      className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    {/* Badge Row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 uppercase whitespace-nowrap",
                          isSeen2
                            ? "border-purple-500/30 text-purple-600 bg-purple-500/10"
                            : "border-indigo-500/30 text-indigo-600 bg-indigo-500/10"
                        )}
                      >
                        {isSeen2 ? "Seen 2 (Cloze/Flow)" : "Seen 1 (MCQ/SA)"}
                      </Badge>

                      <span
                        className={cn(
                          "text-[10px] uppercase font-bold px-2 py-0.5 rounded",
                          item.difficulty === "HARD"
                            ? "text-red-600 bg-red-500/10 border border-red-500/20"
                            : item.difficulty === "EASY"
                            ? "text-emerald-600 bg-emerald-500/10 border border-emerald-500/20"
                            : "text-amber-600 bg-amber-500/10 border border-amber-500/20"
                        )}
                      >
                        {item.difficulty}
                      </span>

                      <span className="text-xs font-bold text-on-surface">
                        {item.subject?.nameEn}
                        {item.subject?.nameBn ? ` (${item.subject.nameBn})` : ""}
                      </span>

                      {item.academicChapter && (
                        <span className="text-xs text-outline font-medium">
                          • Ch: {item.academicChapter.nameEn}
                        </span>
                      )}
                    </div>

                    {/* Passage Title */}
                    {item.title ? (
                      <div className="font-bold text-sm text-primary font-headline">
                        <RenderMath text={item.title} />
                      </div>
                    ) : null}

                    {/* Passage Preview */}
                    <div
                      className={cn(
                        "text-xs text-on-surface/90 leading-relaxed font-body",
                        !isExpanded && "line-clamp-2"
                      )}
                    >
                      <RenderMath text={item.passage} />
                    </div>

                    {/* Meta info pills */}
                    <div className="flex items-center gap-3 text-xs text-outline flex-wrap mt-0.5">
                      <div className="flex items-center gap-1.5 font-semibold text-primary">
                        <Layers className="h-3.5 w-3.5" />
                        <span>{subQuestions.length} Sub-Questions</span>
                        {groupKeys.length > 0 && (
                          <span className="text-muted-foreground font-normal">
                            ({groupKeys.length} {groupKeys.length > 1 ? "groups" : "group"})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 font-semibold text-on-surface">
                        <span>Total {item.totalMarks ?? 20} Marks</span>
                      </div>

                      {item.reference && item.reference.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          {item.reference.map((ref, rIdx) => (
                            <span
                              key={rIdx}
                              className="rounded bg-surface-container-high px-1.5 py-0.5 text-[10px] text-outline font-medium"
                            >
                              {ref}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Actions & Expand Button */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 self-end sm:self-center shrink-0 pt-2 sm:pt-0"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleActive(item.id, item.isActive)}
                    disabled={toggleActiveMutation.isPending}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase transition-colors cursor-pointer mr-1",
                      item.isActive
                        ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25"
                        : "bg-surface-container-high text-outline hover:bg-surface-container-highest"
                    )}
                  >
                    {item.isActive ? "Active" : "Draft"}
                  </button>

                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg hover:bg-surface-container-low text-primary"
                    title="Edit Seen Comprehension"
                  >
                    <Link href={`/seen-comprehensions/${item.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(item.id, item.title || item.passage.slice(0, 40))}
                    className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive cursor-pointer"
                    title="Delete Seen Comprehension"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <button
                    type="button"
                    onClick={() => toggleExpand(item.id)}
                    className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-surface-container-low text-outline transition-colors cursor-pointer ml-1"
                    title={isExpanded ? "Collapse" : "Expand"}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-primary" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Accordion Content: Reading Passage & Questions Accordion */}
              {isExpanded && (
                <div className="border-t border-outline-variant/40 p-4 sm:p-6 bg-surface-container-low/20 space-y-5">
                  {/* Reading Passage Card */}
                  <div className="rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-primary pb-1.5 border-b border-outline-variant/40">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4" />
                        <span>Reading Passage</span>
                      </div>
                      {item.source && (
                        <span className="text-[11px] font-normal text-outline">
                          Source: {item.source}
                        </span>
                      )}
                    </div>

                    {item.instruction && (
                      <p className="text-xs italic text-outline font-medium">
                        {item.instruction}
                      </p>
                    )}

                    <div className="text-xs text-on-surface leading-relaxed text-justify font-body">
                      <RenderMath text={item.passage} />
                    </div>
                  </div>

                  {/* Sub-Questions Accordion Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-on-surface px-1">
                      <div className="flex items-center gap-1.5">
                        <Layers className="h-4 w-4 text-primary" />
                        <span>Questions Accordion ({subQuestions.length} Questions)</span>
                      </div>
                      <span className="text-outline text-[11px] font-medium">
                        {groupKeys.length} {groupKeys.length > 1 ? "Question Groups" : "Question Group"}
                      </span>
                    </div>

                    {groupKeys.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-outline-variant/60 p-6 text-center text-outline text-xs">
                        No sub-questions added to this passage yet.
                      </div>
                    ) : (
                      <Accordion
                        type="multiple"
                        defaultValue={groupKeys.map((k) => `group-${k}`)}
                        className="space-y-3"
                      >
                        {groupKeys.map((gNum) => {
                          const groupItems = groupedQuestions[gNum] || []
                          const firstItem = groupItems[0]

                          const isTrueFalseGroup =
                            firstItem?.type === "TRUE_FALSE" ||
                            groupItems.some((sq: any) => sq.type === "TRUE_FALSE")

                          const isMcqGroup =
                            !isTrueFalseGroup &&
                            (firstItem?.type === "MCQ" ||
                              groupItems.some((sq: any) => sq.type === "MCQ"))

                          let defaultTitle = "Answer the following questions:"
                          if (isMcqGroup) {
                            defaultTitle = "Choose the correct answer from the following alternatives:"
                          } else if (isTrueFalseGroup) {
                            defaultTitle = "Write 'True' for correct statement and 'False' for incorrect statement."
                          }

                          const rawTitle = firstItem?.groupTitle || defaultTitle
                          const cleanTitle = rawTitle.replace(/^\d+[\.\)\s]+/, "").trim()

                          const totalGroupMarks = groupItems.reduce(
                            (sum: number, sq: any) => sum + (sq.marks || 1),
                            0
                          )

                          return (
                            <AccordionItem
                              key={gNum}
                              value={`group-${gNum}`}
                              className="rounded-xl border border-outline-variant/60 bg-surface-container-lowest shadow-2xs overflow-hidden"
                            >
                              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-surface-container-low/40 hover:bg-surface-container-low/70 transition-colors">
                                <div className="flex items-center justify-between gap-3 flex-1 text-left min-w-0 pr-2">
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px] font-bold px-2 py-0.5 shrink-0 bg-primary/10 text-primary border border-primary/20"
                                    >
                                      Group {gNum}
                                    </Badge>

                                    {isTrueFalseGroup && (
                                      <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20 shrink-0">
                                        True/False
                                      </span>
                                    )}

                                    {isMcqGroup && (
                                      <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 shrink-0">
                                        MCQ
                                      </span>
                                    )}

                                    <span className="text-xs font-bold text-on-surface truncate">
                                      {cleanTitle}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0 text-xs text-outline font-medium">
                                    <span>{groupItems.length} items</span>
                                    <span>•</span>
                                    <span className="font-bold text-on-surface">
                                      {totalGroupMarks} marks
                                    </span>
                                  </div>
                                </div>
                              </AccordionTrigger>

                              <AccordionContent className="p-4 pt-3 space-y-3 bg-surface-container-lowest">
                                <div className="space-y-3 divide-y divide-outline-variant/30">
                                  {groupItems.map((sq: any, sIdx: number) => {
                                    const label = sq.itemLabel || String.fromCharCode(97 + sIdx)
                                    const rawOptions =
                                      typeof sq.options === "string"
                                        ? JSON.parse(sq.options || "[]")
                                        : sq.options || []
                                    const optionsList: any[] = Array.isArray(rawOptions)
                                      ? rawOptions
                                      : []

                                    const isMcq =
                                      isMcqGroup || sq.type === "MCQ" || optionsList.length > 0
                                    const isTf = isTrueFalseGroup || sq.type === "TRUE_FALSE"

                                    return (
                                      <div
                                        key={sq.id || sIdx}
                                        className={cn(
                                          "pt-3 first:pt-0 space-y-2 text-xs font-body",
                                          sIdx > 0 && "pt-3"
                                        )}
                                      >
                                        {/* Question Prompt */}
                                        <div className="flex items-start justify-between gap-2 w-full">
                                          <div className="flex items-baseline gap-2 flex-1 min-w-0">
                                            <span className="font-bold text-primary shrink-0 min-w-[1.6em]">
                                              ({label})
                                            </span>
                                            <span className="font-medium text-on-surface flex-1">
                                              <RenderMath text={sq.question} />
                                            </span>
                                          </div>

                                          <span className="font-bold text-[11px] text-outline shrink-0 ml-2">
                                            [{sq.marks || 1} mark]
                                          </span>
                                        </div>

                                        {/* MCQ Options Display */}
                                        {isMcq && optionsList.length > 0 && (
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6 mt-1.5">
                                            {optionsList.map((opt: any, oIdx: number) => {
                                              const optText = typeof opt === "object" ? opt.text : opt
                                              const optKey =
                                                typeof opt === "object"
                                                  ? opt.key || String.fromCharCode(97 + oIdx)
                                                  : String.fromCharCode(97 + oIdx)

                                              // Check if this option is the correct answer
                                              const isCorrect =
                                                sq.answer &&
                                                (String(sq.answer).toLowerCase() ===
                                                  String(optKey).toLowerCase() ||
                                                  String(sq.answer).toLowerCase() ===
                                                    String(optText).toLowerCase() ||
                                                  String(sq.answer) === String(oIdx + 1))

                                              return (
                                                <div
                                                  key={oIdx}
                                                  className={cn(
                                                    "flex items-center gap-2 p-2 rounded-lg border text-xs transition-colors",
                                                    isCorrect
                                                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-800 font-semibold"
                                                      : "bg-surface-container-low/40 border-outline-variant/40 text-on-surface/80"
                                                  )}
                                                >
                                                  <span className="font-bold uppercase text-primary shrink-0">
                                                    ({optKey})
                                                  </span>
                                                  <span className="flex-1 truncate">
                                                    <RenderMath text={String(optText)} />
                                                  </span>
                                                  {isCorrect && (
                                                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                                  )}
                                                </div>
                                              )
                                            })}
                                          </div>
                                        )}

                                        {/* True/False Answer Display */}
                                        {isTf && sq.answer && (
                                          <div className="pl-6 mt-1 flex items-center gap-2">
                                            <span className="text-[11px] font-semibold text-outline">
                                              Statement Truth:
                                            </span>
                                            <span
                                              className={cn(
                                                "font-bold text-xs px-2 py-0.5 rounded-md",
                                                String(sq.answer).toLowerCase().includes("true") ||
                                                  String(sq.answer).includes("সত্য")
                                                  ? "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30"
                                                  : "bg-red-500/15 text-red-700 border border-red-500/30"
                                              )}
                                            >
                                              {sq.answer}
                                            </span>
                                          </div>
                                        )}

                                        {/* Short Answer / General Answer Display */}
                                        {!isMcq && !isTf && sq.answer && (
                                          <div className="pl-6 mt-1">
                                            <div className="p-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-xs">
                                              <span className="font-bold text-primary mr-1">
                                                Answer Key:
                                              </span>
                                              <span className="text-on-surface">
                                                <RenderMath text={sq.answer} />
                                              </span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )
                        })}
                      </Accordion>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Pagination Controls */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-outline px-1 pt-2">
          <div>
            Showing <span className="font-bold text-on-surface">{displayStart}</span> to{" "}
            <span className="font-bold text-on-surface">{displayEnd}</span> of{" "}
            <span className="font-bold text-on-surface">{totalItems}</span> items
          </div>

          <div className="flex items-center gap-2">
            {onLimitChange && (
              <div className="flex items-center gap-1.5 mr-2">
                <span>Per page:</span>
                <Select
                  value={String(itemsPerPage)}
                  onValueChange={(val) => onLimitChange(Number(val) || 10)}
                >
                  <SelectTrigger className="h-8 w-16 rounded-lg border-outline-variant/60 text-xs font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="h-8 px-2.5 rounded-lg border-outline-variant/60 text-xs gap-1 cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>

            <span className="text-xs font-bold text-on-surface px-1">
              {currentPage} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="h-8 px-2.5 rounded-lg border-outline-variant/60 text-xs gap-1 cursor-pointer"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
