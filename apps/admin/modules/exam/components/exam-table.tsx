"use client"

import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  MoreVertical,
  Pen,
  Trash,
  Eye,
  Clock,
  HelpCircle,
  Award,
  Calendar,
  CheckCircle,
  Archive,
  AlertCircle,
  GraduationCap,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"

export interface ExamSubjectItem {
  id: string
  subjectId: string
  subject: {
    id: string
    name: string
    nameBn?: string | null
    level?: string | null
    group?: string | null
  }
}

export interface ExamItem {
  id: string
  title: string
  total: number
  duration: number
  totalMcq: number
  startDate: string | Date
  endDate: string | Date
  hasSuffle: boolean
  hasRandom: boolean
  hasNegativeMark: boolean
  negativeMark: number
  type: string
  status: string
  isOffline?: boolean
  academicClassId: string
  academicClass?: {
    id: string
    nameEn: string
    nameBn: string
    level: string
    position: number
  }
  examGroupItems?: Array<{
    id: string
    examGroup: {
      id: string
      title: string
    }
  }>
  createdAt: string | Date
  updatedAt: string | Date
  examSubjects?: ExamSubjectItem[]
  _count?: {
    examAttempts?: number
  }
}

interface ExamTableProps {
  items: ExamItem[]
  isLoading: boolean
  isError: boolean
  onEdit?: (item: ExamItem) => void
  onDelete: (id: string, title: string) => void
  onToggleStatus?: (id: string, newStatus: string) => void
  onViewDetails?: (item: ExamItem) => void
  currentPage: number
  itemsPerPage: number
  totalItems: number
  totalPages: number
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
}

export function ExamTable({
  items,
  isLoading,
  isError,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewDetails,
  currentPage,
  itemsPerPage,
  totalItems,
  totalPages,
  onPageChange,
  onLimitChange,
}: ExamTableProps) {
  const displayStart = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
  const displayEnd = Math.min(currentPage * itemsPerPage, totalItems)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Published":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border-0 font-bold px-2.5 py-0.5 rounded-full text-xs inline-flex items-center gap-1 shadow-none">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Published
          </Badge>
        )
      case "Pending":
        return (
          <Badge className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-0 font-bold px-2.5 py-0.5 rounded-full text-xs inline-flex items-center gap-1 shadow-none">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Pending / Draft
          </Badge>
        )
      case "Archived":
        return (
          <Badge className="bg-slate-500/10 text-slate-600 hover:bg-slate-500/20 border-0 font-medium px-2.5 py-0.5 rounded-full text-xs inline-flex items-center gap-1 shadow-none">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Archived
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-xs">
            {status}
          </Badge>
        )
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-xs">
      {isLoading ? (
        <div className="p-4 md:p-12">
          {/* Mobile Pulse Loading */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 w-full rounded-xl bg-surface-container-high animate-pulse" />
            ))}
          </div>
          {/* Desktop Loading */}
          <div className="hidden md:flex items-center justify-center p-8 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin text-3xl text-primary">
              progress_activity
            </span>
            <span className="ml-3 font-body-md">Loading exam catalog...</span>
          </div>
        </div>
      ) : isError ? (
        <div className="p-8 text-center text-error">
          <span className="material-symbols-outlined text-4xl">error</span>
          <p className="mt-2 font-body-md font-medium">Failed to load exams list.</p>
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 sm:p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <Award className="h-8 w-8" />
          </div>
          <h3 className="font-headline-md text-lg font-bold text-on-surface">
            No Exams Found
          </h3>
          <p className="mt-1 font-body-md text-sm text-on-surface-variant max-w-sm mx-auto">
            Get started by setting up your first exam assessment module.
          </p>
          <div className="mt-6">
            <Button
              asChild
              className="inline-flex items-center gap-2 rounded-xl bg-primary-container px-6 py-2.5 font-bold text-on-primary-container hover:bg-primary hover:text-white h-auto text-sm normal-case tracking-normal"
            >
              <Link href="/exams/create">
                <span className="material-symbols-outlined text-sm">add</span>
                <span>Create Exam</span>
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div>
          {/* Mobile Card List View (< md) */}
          <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:hidden">
            {items.map((item) => {
              const subjects = item.examSubjects ?? []
              const firstGroup = item.examGroupItems?.[0]?.examGroup
              const startDateStr = new Date(item.startDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
              const endDateStr = new Date(item.endDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })

              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
                >
                  {/* Header Row: Icon + Title + Badges + Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                        <Award className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/exams/${item.id}`}
                          className="font-headline-md text-base font-extrabold text-on-surface hover:text-primary transition-colors block truncate"
                        >
                          {item.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="rounded-md bg-secondary-container/20 px-2 py-0.5 font-label-sm text-[10px] font-bold text-secondary uppercase tracking-wider">
                            {item.type}
                          </span>
                          {item.isOffline && (
                            <span className="rounded-md bg-orange-50 px-2 py-0.5 font-label-sm text-[10px] font-bold text-orange-700 border border-orange-200 uppercase tracking-wider">
                              Offline
                            </span>
                          )}
                          {item.academicClass && (
                            <Badge
                              variant="outline"
                              className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold rounded-md px-2 py-0.5 inline-flex items-center gap-0.5 shadow-none"
                            >
                              <GraduationCap className="h-3 w-3" />
                              <span>{item.academicClass.nameEn}</span>
                            </Badge>
                          )}
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
                      <DropdownMenuContent align="end" className="bg-white border border-outline-variant shadow-md rounded-xl p-1.5 min-w-[160px]">
                        <DropdownMenuItem
                          onClick={() => onViewDetails ? onViewDetails(item) : (window.location.href = `/exams/${item.id}`)}
                          className="cursor-pointer gap-2 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                        >
                          <Eye className="h-3.5 w-3.5 text-outline" />
                          <span>View Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onEdit ? onEdit(item) : (window.location.href = `/exams/${item.id}/edit`)}
                          className="cursor-pointer gap-2 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                        >
                          <Pen className="h-3.5 w-3.5 text-outline" />
                          <span>Edit Exam</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => window.location.href = `/exams/${item.id}/mcq`}
                          className="cursor-pointer gap-2 rounded-lg px-3 py-2 text-xs font-medium text-primary hover:bg-primary/10"
                        >
                          <HelpCircle className="h-3.5 w-3.5 text-primary" />
                          <span>Assign MCQs</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator className="my-1 border-outline-variant/30" />
                        
                        {item.status !== "Published" && onToggleStatus && (
                          <DropdownMenuItem
                            onClick={() => onToggleStatus(item.id, "Published")}
                            className="cursor-pointer gap-2 rounded-lg px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-500/10"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Publish Exam</span>
                          </DropdownMenuItem>
                        )}
                        {item.status !== "Pending" && onToggleStatus && (
                          <DropdownMenuItem
                            onClick={() => onToggleStatus(item.id, "Pending")}
                            className="cursor-pointer gap-2 rounded-lg px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-500/10"
                          >
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>Move to Draft</span>
                          </DropdownMenuItem>
                        )}
                        {item.status !== "Archived" && onToggleStatus && (
                          <DropdownMenuItem
                            onClick={() => onToggleStatus(item.id, "Archived")}
                            className="cursor-pointer gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-500/10"
                          >
                            <Archive className="h-3.5 w-3.5" />
                            <span>Archive Exam</span>
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator className="my-1 border-outline-variant/30" />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onDelete(item.id, item.title)}
                          className="cursor-pointer gap-2 rounded-lg px-3 py-2 text-xs font-medium text-error hover:bg-error-container/20"
                        >
                          <Trash className="h-3.5 w-3.5" />
                          <span>Delete Exam</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Marks, MCQ, Duration & Subjects */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-outline font-medium">Evaluation:</span>
                      <span className="font-bold text-on-surface">{item.total} Marks ({item.totalMcq} MCQs)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-outline font-medium">Duration:</span>
                      <span className="font-medium text-on-surface-variant">{item.duration} Mins</span>
                    </div>
                    {subjects.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        <span className="text-[11px] text-outline mr-1 font-medium">Subjects:</span>
                        {subjects.map((s) => (
                          <Badge
                            key={s.id}
                            variant="outline"
                            className="bg-surface-container-high/80 text-[10px] font-medium text-on-surface-variant border-outline-variant/40 rounded-md px-1.5 py-0"
                          >
                            {s.subject?.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Status Badge + Date */}
                  <div className="flex items-center justify-between border-t border-outline-variant/20 pt-2.5 text-[11px] text-outline mt-1">
                    <div className="flex items-center gap-1">
                      {getStatusBadge(item.status)}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">calendar_today</span>
                      <span>Starts {new Date(item.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block">
            <Table className="w-full text-left font-body-md">
              <TableHeader className="bg-surface-container-low border-b border-outline-variant/30">
                <TableRow className="hover:bg-surface-container-low border-b border-outline-variant/30">
                  <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase text-xs h-auto">
                    Exam & Type
                  </TableHead>
                  <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase text-xs h-auto">
                    Class
                  </TableHead>
                  <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase text-xs h-auto">
                    Linked Subjects
                  </TableHead>
                  <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase text-xs h-auto">
                    Marks & Duration
                  </TableHead>
                  <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase text-xs h-auto">
                    Schedule
                  </TableHead>
                  <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase text-xs h-auto">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-4 text-right font-label-sm font-semibold tracking-wider text-outline uppercase text-xs h-auto">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-outline-variant/30">
                {items.map((item) => {
                  const subjects = item.examSubjects ?? []
                  const firstGroup = item.examGroupItems?.[0]?.examGroup
                  const startDateStr = new Date(item.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  const endDateStr = new Date(item.endDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })

                  return (
                    <TableRow
                      key={item.id}
                      className="hover:bg-surface-container-low transition-all duration-200 ease-in-out group border-b border-outline-variant/30"
                    >
                      {/* Exam Title & Type */}
                      <TableCell className="py-5 group-hover:py-6 px-6 transition-all duration-200 ease-in-out">
                        <div className="flex flex-col">
                          <Link
                            href={`/exams/${item.id}`}
                            className="font-headline-md text-base font-bold text-on-surface hover:text-primary transition-colors"
                          >
                            {item.title}
                          </Link>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="rounded-md bg-secondary-container/20 px-2 py-0.5 font-label-sm text-[11px] font-semibold text-secondary uppercase tracking-wider">
                              {item.type}
                            </span>
                            {item.isOffline && (
                              <span className="rounded-md bg-orange-50 px-2 py-0.5 font-label-sm text-[11px] font-semibold text-orange-700 border border-orange-200 uppercase tracking-wider">
                                Offline
                              </span>
                            )}
                            {firstGroup && (
                              <Link
                                href={`/exam-groups/${firstGroup.id}`}
                                className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 font-label-sm text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors border border-indigo-200"
                                title={`Part of Exam Group: ${firstGroup.title}`}
                              >
                                <span className="material-symbols-outlined text-xs">layers</span>
                                <span>{firstGroup.title}</span>
                              </Link>
                            )}
                            {item._count?.examAttempts !== undefined && (
                              <span className="text-[12px] text-outline flex items-center gap-1">
                                • {item._count.examAttempts} attempt{item._count.examAttempts === 1 ? "" : "s"}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Academic Class */}
                      <TableCell className="py-5 group-hover:py-6 px-6 transition-all duration-200 ease-in-out">
                        {item.academicClass ? (
                          <Badge
                            variant="outline"
                            className="bg-primary/10 text-primary border-primary/20 text-[11px] font-bold rounded-md px-2.5 py-1 inline-flex items-center gap-1 shadow-none"
                          >
                            <GraduationCap className="h-3.5 w-3.5" />
                            <span>{item.academicClass.nameEn}</span>
                          </Badge>
                        ) : (
                          <span className="text-xs text-outline italic">Unassigned</span>
                        )}
                      </TableCell>

                      {/* Linked Subjects */}
                      <TableCell className="py-5 group-hover:py-6 px-6 transition-all duration-200 ease-in-out">
                        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                          {subjects.length > 0 ? (
                            subjects.map((s) => (
                              <Badge
                                key={s.id}
                                variant="outline"
                                className="bg-surface-container-high/80 text-[11px] font-medium text-on-surface-variant border-outline-variant/40 rounded-md px-2 py-0.5"
                              >
                                {s.subject?.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-outline italic">No subjects</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Marks & MCQ Count & Duration */}
                      <TableCell className="py-5 group-hover:py-6 px-6 transition-all duration-200 ease-in-out">
                        <div className="flex flex-col gap-1 text-xs">
                          <div className="flex items-center gap-1.5 font-semibold text-on-surface">
                            <Award className="h-3.5 w-3.5 text-primary" />
                            <span>{item.total} Marks</span>
                            <span className="text-outline">({item.totalMcq} MCQs)</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-on-surface-variant">
                            <Clock className="h-3.5 w-3.5 text-amber-600" />
                            <span>{item.duration} Mins</span>
                            {item.hasNegativeMark && (
                              <span className="text-[11px] font-medium text-error ml-1">
                                (-{item.negativeMark})
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Schedule */}
                      <TableCell className="py-5 group-hover:py-6 px-6 transition-all duration-200 ease-in-out">
                        <div className="flex flex-col text-xs text-on-surface-variant">
                          <div className="flex items-center gap-1 font-medium text-on-surface">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            <span>{startDateStr}</span>
                          </div>
                          <span className="text-[11px] text-outline pl-4">to {endDateStr}</span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-5 group-hover:py-6 px-6 transition-all duration-200 ease-in-out">
                        {getStatusBadge(item.status)}
                      </TableCell>

                      {/* Actions Dropdown */}
                      <TableCell className="py-5 group-hover:py-6 px-6 text-right transition-all duration-200 ease-in-out">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high cursor-pointer h-8 w-8"
                              title="Actions"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white border border-outline-variant shadow-md rounded-xl p-1.5 min-w-[160px]">
                            <DropdownMenuItem
                              onClick={() => onViewDetails ? onViewDetails(item) : (window.location.href = `/exams/${item.id}`)}
                              className="cursor-pointer gap-2 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                            >
                              <Eye className="h-3.5 w-3.5 text-outline" />
                              <span>View Details</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => onEdit ? onEdit(item) : (window.location.href = `/exams/${item.id}/edit`)}
                              className="cursor-pointer gap-2 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                            >
                              <Pen className="h-3.5 w-3.5 text-outline" />
                              <span>Edit Exam</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => window.location.href = `/exams/${item.id}/mcq`}
                              className="cursor-pointer gap-2 rounded-lg px-3 py-2 text-xs font-medium text-primary hover:bg-primary/10"
                            >
                              <HelpCircle className="h-3.5 w-3.5 text-primary" />
                              <span>Assign MCQs</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="my-1 border-outline-variant/30" />

                            {/* Quick Status Toggles */}
                            {item.status !== "Published" && onToggleStatus && (
                              <DropdownMenuItem
                                onClick={() => onToggleStatus(item.id, "Published")}
                                className="cursor-pointer gap-2 rounded-lg px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-500/10"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                <span>Publish Exam</span>
                              </DropdownMenuItem>
                            )}

                            {item.status !== "Pending" && onToggleStatus && (
                              <DropdownMenuItem
                                onClick={() => onToggleStatus(item.id, "Pending")}
                                className="cursor-pointer gap-2 rounded-lg px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-500/10"
                              >
                                <AlertCircle className="h-3.5 w-3.5" />
                                <span>Move to Draft</span>
                              </DropdownMenuItem>
                            )}

                            {item.status !== "Archived" && onToggleStatus && (
                              <DropdownMenuItem
                                onClick={() => onToggleStatus(item.id, "Archived")}
                                className="cursor-pointer gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-500/10"
                              >
                                <Archive className="h-3.5 w-3.5" />
                                <span>Archive Exam</span>
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator className="my-1 border-outline-variant/30" />

                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => onDelete(item.id, item.title)}
                              className="cursor-pointer gap-2 rounded-lg px-3 py-2 text-xs font-medium text-error hover:bg-error-container/20"
                            >
                              <Trash className="h-3.5 w-3.5" />
                              <span>Delete Exam</span>
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
                Showing <span className="font-bold">{displayStart}-{displayEnd}</span> of <span className="font-bold">{totalItems}</span> exams
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
      )}
    </div>
  )
}
