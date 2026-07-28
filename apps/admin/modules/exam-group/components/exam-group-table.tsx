"use client"

import Link from "next/link"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@workspace/ui/components/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { MoreVertical, Pen, Trash, Calculator, Eye, Layers, CheckCircle2, XCircle } from "lucide-react"

export interface ExamGroupItemData {
  id: string
  title: string
  code?: string | null
  description?: string | null
  type: string
  calculationType: string
  bestOfNCount?: number | null
  totalMarks?: number | null
  passMarks?: number | null
  startDate?: string | Date | null
  endDate?: string | Date | null
  isPublished: boolean
  academicClassId?: string | null
  academicClass?: {
    id: string
    nameEn: string
    nameBn: string
  } | null
  items?: Array<{
    id: string
    examId: string
    position: number
    weightage: number
    isRequired: boolean
    exam?: {
      id: string
      title: string
    }
  }>
  _count?: {
    items: number
    groupResults: number
  }
}

interface ExamGroupTableProps {
  items: ExamGroupItemData[]
  isLoading: boolean
  isError: boolean
  onEdit?: (item: ExamGroupItemData) => void
  onDelete?: (id: string, title: string) => void
  onTogglePublish?: (id: string, isPublished: boolean) => void
  onCalculateResults?: (id: string) => void
  onViewDetails?: (item: ExamGroupItemData) => void
  currentPage: number
  itemsPerPage: number
  totalItems: number
  totalPages: number
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
}

export function ExamGroupTable({
  items,
  isLoading,
  isError,
  onEdit,
  onDelete,
  onTogglePublish,
  onCalculateResults,
  onViewDetails,
  currentPage,
  itemsPerPage,
  totalItems,
  totalPages,
  onPageChange,
  onLimitChange,
}: ExamGroupTableProps) {
  const displayStart = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
  const displayEnd = Math.min(currentPage * itemsPerPage, totalItems)

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case "MODEL_TEST":
        return "bg-indigo-500/10 text-indigo-700 border-indigo-200"
      case "TERM_EXAM":
        return "bg-purple-500/10 text-purple-700 border-purple-200"
      case "WEEKLY_SERIES":
        return "bg-blue-500/10 text-blue-700 border-blue-200"
      case "SUBJECT_COMBO":
        return "bg-teal-500/10 text-teal-700 border-teal-200"
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200"
    }
  }

  const getCalcBadgeClass = (calcType: string) => {
    switch (calcType) {
      case "BEST_OF_N":
        return "bg-amber-500/10 text-amber-700 border-amber-200"
      case "WEIGHTED_AVERAGE":
        return "bg-cyan-500/10 text-cyan-700 border-cyan-200"
      case "AVERAGE":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-200"
      default:
        return "bg-slate-500/10 text-slate-700 border-slate-200"
    }
  }

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-xs p-4 md:p-12">
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 w-full rounded-xl bg-surface-container-high animate-pulse" />
          ))}
        </div>
        <div className="hidden md:flex items-center justify-center p-8 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-3xl text-primary">
            progress_activity
          </span>
          <span className="ml-3 font-body-md">Loading exam groups...</span>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-xs p-8 text-center text-error">
        <span className="material-symbols-outlined text-4xl">error</span>
        <p className="mt-2 font-body-md font-medium">Failed to load exam groups.</p>
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-xs p-8 sm:p-12 text-center">
        <span className="material-symbols-outlined text-5xl text-outline">
          layers
        </span>
        <h3 className="mt-4 font-headline-md text-lg font-bold text-on-surface">
          No Exam Groups Found
        </h3>
        <p className="mt-1 font-body-md text-sm text-on-surface-variant">
          Get started by creating your first model test series or exam group.
        </p>
        <div className="mt-6">
          <Button
            asChild
            className="inline-flex items-center space-x-2 rounded-lg bg-primary-container px-6 py-2.5 font-bold text-on-primary-container hover:bg-primary hover:text-white h-auto normal-case tracking-normal"
          >
            <Link href="/exam-groups/create">
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Create Exam Group</span>
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-xs">
      {/* Mobile Card List View (< md) */}
      <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:hidden">
        {items.map((item) => {
          const examsCount = item._count?.items ?? item.items?.length ?? 0
          const resultsCount = item._count?.groupResults ?? 0

          return (
            <div
              key={item.id}
              className="group relative flex flex-col gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
            >
              {/* Header Row: Icon + Title + Publish status + Actions */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-headline-md text-base font-extrabold text-on-surface truncate">
                      {item.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {item.code && (
                        <span className="font-mono text-[10px] text-outline bg-surface px-1.5 py-0.5 rounded border border-outline-variant/40 shrink-0">
                          {item.code}
                        </span>
                      )}
                      <button
                        onClick={() => onTogglePublish && onTogglePublish(item.id, item.isPublished)}
                        className="inline-flex items-center gap-1.5 rounded-full text-xs font-medium cursor-pointer shrink-0"
                        title="Click to toggle publication state"
                      >
                        {item.isPublished ? (
                          <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px] uppercase">
                            <CheckCircle2 className="h-3 w-3" /> Published
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[10px] uppercase">
                            <XCircle className="h-3 w-3" /> Draft
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high cursor-pointer h-8 w-8 shrink-0"
                      title="Actions"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white border border-outline-variant shadow-md rounded-xl p-1.5 min-w-[170px]">
                    <DropdownMenuItem
                      onClick={() => onViewDetails ? onViewDetails(item) : (window.location.href = `/exam-groups/${item.id}`)}
                      className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                    >
                      <Eye className="h-4 w-4 text-outline" />
                      <span>View Details</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onEdit ? onEdit(item) : (window.location.href = `/exam-groups/${item.id}/edit`)}
                      className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                    >
                      <Pen className="h-4 w-4 text-outline" />
                      <span>Edit Details</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onCalculateResults && onCalculateResults(item.id)}
                      className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                    >
                      <Calculator className="h-4 w-4 text-outline" />
                      <span>Calculate Results</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete && onDelete(item.id, item.title)}
                      className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-error hover:bg-error-container/20"
                    >
                      <Trash className="h-4 w-4" />
                      <span>Delete Group</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Attributes Grid */}
              <div className="flex flex-col gap-1.5 text-xs text-on-surface-variant pt-2.5 border-t border-outline-variant/20">
                <div className="flex justify-between gap-2">
                  <span className="text-outline font-medium">Class:</span>
                  <span className="font-semibold text-on-surface">
                    {item.academicClass ? item.academicClass.nameEn : "Global / All"}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-outline font-medium">Type:</span>
                  <Badge variant="outline" className={`h-auto py-0.5 text-[10px] font-bold uppercase border-0 shadow-none ${getTypeBadgeClass(item.type)}`}>
                    {item.type.replace("_", " ")}
                  </Badge>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-outline font-medium">Calc Mode:</span>
                  <Badge variant="outline" className={`h-auto py-0.5 text-[10px] font-bold uppercase border-0 shadow-none ${getCalcBadgeClass(item.calculationType)}`}>
                    {item.calculationType === "BEST_OF_N"
                      ? `BEST OF ${item.bestOfNCount || "N"}`
                      : item.calculationType.replace("_", " ")}
                  </Badge>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-outline font-medium">Exams Included:</span>
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {examsCount}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-outline font-medium">Results:</span>
                  <span className="font-semibold text-emerald-600">{resultsCount} evaluated</span>
                </div>
              </div>

              {/* Card Footer Info */}
              <div className="flex items-center justify-between border-t border-outline-variant/20 pt-2.5 text-[10px] text-outline">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                  <span>
                    Start: {item.startDate ? new Date(item.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                  </span>
                </div>
                <span className="text-[10px] text-outline/85">
                  ID: {item.id.slice(0, 8)}...
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block">
        <Table className="w-full text-left font-body-md">
          <TableHeader className="bg-surface-container-low border-b border-outline-variant">
            <TableRow className="border-b border-outline-variant bg-surface-container-low hover:bg-surface-container-low">
              <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                Title & Code
              </TableHead>
              <TableHead className="px-4 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                Class
              </TableHead>
              <TableHead className="px-4 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                Type
              </TableHead>
              <TableHead className="px-4 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                Calculation Mode
              </TableHead>
              <TableHead className="px-4 py-4 text-center font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                Exams
              </TableHead>
              <TableHead className="px-4 py-4 text-center font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                Results
              </TableHead>
              <TableHead className="px-4 py-4 text-center font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                Status
              </TableHead>
              <TableHead className="px-6 py-4 text-right font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-outline-variant/30">
            {items.map((item) => {
              const examsCount = item._count?.items ?? item.items?.length ?? 0
              const resultsCount = item._count?.groupResults ?? 0

              return (
                <TableRow
                  key={item.id}
                  className="hover:bg-surface-container-low transition-all duration-200 ease-in-out group border-b border-outline-variant/30"
                >
                  {/* Title & Code */}
                  <TableCell className="py-5 group-hover:py-6 px-6 transition-all duration-200 ease-in-out">
                    <div className="flex flex-col">
                      <Link
                        href={`/exam-groups/${item.id}`}
                        className="font-headline-md text-base font-bold text-on-surface hover:text-primary transition-colors"
                      >
                        {item.title}
                      </Link>
                      {item.code && (
                        <span className="font-mono text-xs text-outline mt-0.5">
                          Code: {item.code}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Class */}
                  <TableCell className="py-5 group-hover:py-6 px-4 transition-all duration-200 ease-in-out">
                    {item.academicClass ? (
                      <span className="inline-flex items-center rounded-md bg-secondary/10 px-2.5 py-1 text-xs font-semibold text-secondary">
                        {item.academicClass.nameEn}
                      </span>
                    ) : (
                      <span className="text-xs text-outline italic">Global / All</span>
                    )}
                  </TableCell>

                  {/* Type Badge */}
                  <TableCell className="py-5 group-hover:py-6 px-4 transition-all duration-200 ease-in-out">
                    <Badge variant="outline" className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-label-sm text-[11px] font-bold uppercase border-0 shadow-none ${getTypeBadgeClass(item.type)}`}>
                      {item.type.replace("_", " ")}
                    </Badge>
                  </TableCell>

                  {/* Calculation Mode */}
                  <TableCell className="py-5 group-hover:py-6 px-4 transition-all duration-200 ease-in-out">
                    <Badge variant="outline" className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-label-sm text-[11px] font-bold uppercase border-0 shadow-none ${getCalcBadgeClass(item.calculationType)}`}>
                      {item.calculationType === "BEST_OF_N"
                        ? `BEST OF ${item.bestOfNCount || "N"}`
                        : item.calculationType.replace("_", " ")}
                    </Badge>
                  </TableCell>

                  {/* Exams Count */}
                  <TableCell className="py-5 group-hover:py-6 px-4 text-center transition-all duration-200 ease-in-out">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {examsCount}
                    </span>
                  </TableCell>

                  {/* Results Count */}
                  <TableCell className="py-5 group-hover:py-6 px-4 text-center transition-all duration-200 ease-in-out">
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {resultsCount} evaluated
                    </span>
                  </TableCell>

                  {/* Publication Status */}
                  <TableCell className="py-5 group-hover:py-6 px-4 text-center transition-all duration-200 ease-in-out">
                    <button
                      onClick={() =>
                        onTogglePublish && onTogglePublish(item.id, item.isPublished)
                      }
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer hover:opacity-80"
                      title="Click to toggle publication state"
                    >
                      {item.isPublished ? (
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Published
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-600 font-semibold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          <XCircle className="h-3.5 w-3.5" /> Draft
                        </span>
                      )}
                    </button>
                  </TableCell>

                  {/* Actions Dropdown */}
                  <TableCell className="py-5 group-hover:py-6 px-6 text-right transition-all duration-200 ease-in-out">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high cursor-pointer h-auto w-auto"
                          title="Actions"
                        >
                          <MoreVertical />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border border-outline-variant shadow-md rounded-xl p-1.5 min-w-[170px]">
                        <DropdownMenuItem
                          onClick={() => onViewDetails ? onViewDetails(item) : (window.location.href = `/exam-groups/${item.id}`)}
                          className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                        >
                          <Eye className="h-4 w-4 text-outline" />
                          <span>View Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onEdit ? onEdit(item) : (window.location.href = `/exam-groups/${item.id}/edit`)}
                          className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                        >
                          <Pen className="h-4 w-4 text-outline" />
                          <span>Edit Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onCalculateResults && onCalculateResults(item.id)}
                          className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                        >
                          <Calculator className="h-4 w-4 text-outline" />
                          <span>Calculate Results</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onDelete && onDelete(item.id, item.title)}
                          className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-error hover:bg-error-container/20"
                        >
                          <Trash className="h-4 w-4" />
                          <span>Delete Group</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Table Footer / Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-outline-variant bg-surface-container-low px-4 sm:px-6 py-4">
        <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
            Showing <span className="font-bold">{displayStart}-{displayEnd}</span> of <span className="font-bold">{totalItems}</span> exam groups
          </p>
          {onLimitChange && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-outline font-medium">Rows per page:</span>
              <Select
                value={String(itemsPerPage)}
                onValueChange={(val) => onLimitChange(Number(val) || 10)}
              >
                <SelectTrigger className="h-8 rounded-lg border border-outline-variant bg-white px-2.5 font-body-md text-xs outline-hidden focus:ring-2 focus:ring-primary/10 w-auto gap-1">
                  <SelectValue placeholder="Per Page" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg min-w-[80px]">
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className="size-8 sm:size-10 rounded-lg border border-outline-variant transition-colors hover:bg-surface-container-high disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-sm sm:text-base">chevron_left</span>
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? "default" : "ghost"}
              onClick={() => onPageChange(pageNum)}
              className={`size-8 sm:size-10 rounded-lg font-body-md text-xs sm:text-sm transition-colors ${
                currentPage === pageNum
                  ? "bg-primary font-bold text-on-primary hover:bg-primary"
                  : "hover:bg-surface-container-high text-on-surface"
              }`}
            >
              {pageNum}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className="size-8 sm:size-10 rounded-lg border border-outline-variant transition-colors hover:bg-surface-container-high disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-sm sm:text-base">chevron_right</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

