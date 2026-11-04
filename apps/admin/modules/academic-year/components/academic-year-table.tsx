"use client"

import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
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
import { DataTablePagination } from "@/components/shared/data-table-pagination"
import { toBengaliDigits } from "@workspace/utils"
import {
  Calendar,
  CalendarCheck,
  Edit3,
  Trash2,
  MoreVertical,
  Check,
  X,
  BookOpen,
  FolderTree,
  ToggleLeft,
  ToggleRight,
  Plus,
  Clock,
} from "lucide-react"

export interface AcademicYearItem {
  id: string
  nameEn: string
  nameBn: string
  startDate: string | Date
  endDate: string | Date
  isCurrent: boolean
  isActive: boolean
  _count?: {
    subjects: number
    chapters: number
  } | null
}

interface AcademicYearTableProps {
  items: AcademicYearItem[]
  isLoading: boolean
  isError: boolean
  onEdit: (item: AcademicYearItem) => void
  onDelete: (id: string, name: string) => void
  onToggleActive?: (id: string, currentStatus: boolean) => void
  currentPage: number
  itemsPerPage: number
  totalItems: number
  totalPages: number
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
  onCreateNew?: () => void
}

export function AcademicYearTable({
  items,
  isLoading,
  isError,
  onEdit,
  onDelete,
  onToggleActive,
  currentPage,
  itemsPerPage,
  totalItems,
  totalPages,
  onPageChange,
  onLimitChange,
  onCreateNew,
}: AcademicYearTableProps) {
  const formatDateBn = (dateVal: string | Date) => {
    if (!dateVal) return "—"
    try {
      const d = new Date(dateVal)
      return d.toLocaleDateString("bn-BD", { year: "numeric", month: "short", day: "numeric" })
    } catch {
      return String(dateVal)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.04]">
            <div className="h-5 w-40 bg-slate-200 dark:bg-white/10 rounded-md animate-pulse" />
            <div className="h-8 w-24 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={`skel-${i}`}
              className="h-16 w-full bg-slate-100/80 dark:bg-white/[0.03] rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/10 p-8 text-center text-rose-600 dark:text-rose-400">
        <p className="text-sm font-semibold">শিক্ষাবর্ষ লোড করতে সমস্যা হয়েছে।</p>
        <p className="text-xs text-muted-foreground mt-1">
          অনুগ্রহ করে পুনরায় চেষ্টা করুন বা পেইজটি রিফ্রেশ দিন।
        </p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-card shadow-xs py-16 px-6 text-center select-none">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100/80 dark:border-primary/20 text-indigo-600 dark:text-primary mx-auto flex items-center justify-center mb-4 shadow-sm shadow-indigo-100/50 dark:shadow-none">
          <Calendar className="w-8 h-8 stroke-[1.8]" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-foreground font-headline">
          কোনো শিক্ষাবর্ষ পাওয়া যায়নি
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-muted-foreground max-w-md mx-auto font-body">
          ফিল্টার পরিবর্তন করে দেখুন অথবা নতুন শিক্ষাবর্ষ যোগ করুন।
        </p>
        {onCreateNew && (
          <div className="mt-6">
            <Button
              type="button"
              onClick={onCreateNew}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-5 gap-2 shadow-sm shadow-indigo-200 dark:shadow-none transition-all font-headline cursor-pointer"
            >
              <Plus className="size-4" />
              <span>নতুন শিক্ষাবর্ষ যোগ করুন</span>
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200/70 dark:border-white/[0.08] hover:bg-transparent bg-slate-50/50 dark:bg-white/[0.02]">
              <TableHead className="w-16 pl-6 font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                ক্রম
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                শিক্ষাবর্ষের নাম
              </TableHead>
              <TableHead className="w-56 font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                সময়কাল (তারিখ)
              </TableHead>
              <TableHead className="w-48 font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                সংযুক্ত কনটেন্ট
              </TableHead>
              <TableHead className="w-32 text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                অবস্থা
              </TableHead>
              <TableHead className="w-28 text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                স্ট্যাটাস
              </TableHead>
              <TableHead className="w-20 text-right pr-6 font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                অ্যাকশন
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((ay, idx) => {
              const displayIndex = (currentPage - 1) * itemsPerPage + idx + 1
              const subjectCount = ay._count?.subjects ?? 0
              const chapterCount = ay._count?.chapters ?? 0

              return (
                <TableRow
                  key={ay.id}
                  className="border-b border-slate-200/60 dark:border-white/[0.05] transition-colors hover:bg-slate-50/60 dark:hover:bg-white/[0.02]"
                >
                  {/* Position Badge */}
                  <TableCell className="pl-6">
                    <span className="inline-flex items-center justify-center size-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                      {toBengaliDigits(displayIndex)}
                    </span>
                  </TableCell>

                  {/* Year Name */}
                  <TableCell>
                    <div className="space-y-0.5">
                      <button
                        type="button"
                        onClick={() => onEdit(ay)}
                        className="font-bold text-sm text-foreground hover:text-indigo-600 dark:hover:text-primary transition-colors font-headline text-left line-clamp-1 cursor-pointer"
                      >
                        {ay.nameBn}
                      </button>
                      <p className="text-xs text-muted-foreground font-mono">
                        {ay.nameEn}
                      </p>
                    </div>
                  </TableCell>

                  {/* Date Range */}
                  <TableCell>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="size-3 text-indigo-500 shrink-0" />
                        <span className="font-medium text-foreground">
                          {formatDateBn(ay.startDate)} - {formatDateBn(ay.endDate)}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Connected Content */}
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40">
                        <BookOpen className="size-3" />
                        <span>{toBengaliDigits(subjectCount)} বিষয়</span>
                      </div>
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-white/[0.06] text-muted-foreground">
                        <FolderTree className="size-3 text-slate-500" />
                        <span>{toBengaliDigits(chapterCount)} অধ্যায়</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Current Year Badge */}
                  <TableCell className="text-center">
                    {ay.isCurrent ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CalendarCheck className="size-3" />
                        <span>বর্তমান</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-white/[0.05] text-muted-foreground">
                        আর্কাইভ
                      </span>
                    )}
                  </TableCell>

                  {/* Active Toggle Status */}
                  <TableCell className="text-center">
                    <button
                      type="button"
                      onClick={() => onToggleActive?.(ay.id, ay.isActive)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer select-none",
                        ay.isActive
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                          : "bg-slate-500/10 text-slate-500 border border-slate-500/20 hover:bg-slate-500/20"
                      )}
                    >
                      {ay.isActive ? (
                        <>
                          <Check className="size-3" />
                          <span>সক্রিয়</span>
                        </>
                      ) : (
                        <>
                          <X className="size-3" />
                          <span>নিষ্ক্রিয়</span>
                        </>
                      )}
                    </button>
                  </TableCell>

                  {/* Action Menu */}
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="size-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg"
                        >
                          <MoreVertical className="size-4" />
                          <span className="sr-only">অ্যাকশন মেনু</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-44 rounded-xl border border-slate-200/80 dark:border-white/[0.08] shadow-lg p-1.5"
                      >
                        <DropdownMenuItem
                          onClick={() => onEdit(ay)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer"
                        >
                          <Edit3 className="size-3.5 text-indigo-500" />
                          <span>সম্পাদনা করুন</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onToggleActive?.(ay.id, ay.isActive)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer"
                        >
                          {ay.isActive ? (
                            <>
                              <ToggleLeft className="size-3.5 text-amber-500" />
                              <span>নিষ্ক্রিয় করুন</span>
                            </>
                          ) : (
                            <>
                              <ToggleRight className="size-3.5 text-emerald-500" />
                              <span>সক্রিয় করুন</span>
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1 border-slate-100 dark:border-white/[0.05]" />
                        <DropdownMenuItem
                          onClick={() => onDelete(ay.id, ay.nameBn || ay.nameEn)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                          <span>মুছে ফেলুন</span>
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

      {/* Mobile Card List View (< md) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {items.map((ay, idx) => {
          const displayIndex = (currentPage - 1) * itemsPerPage + idx + 1
          const subjectCount = ay._count?.subjects ?? 0
          const chapterCount = ay._count?.chapters ?? 0

          return (
            <div
              key={`mob-${ay.id}`}
              className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-4 space-y-3 shadow-xs transition-all"
            >
              {/* Header row: Position, Current badge, Status & Actions */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.04]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center justify-center size-6 rounded-md bg-slate-100 dark:bg-white/[0.06] text-[11px] font-bold text-slate-700 dark:text-slate-300 font-mono">
                    #{toBengaliDigits(displayIndex)}
                  </span>
                  {ay.isCurrent && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <CalendarCheck className="size-2.5" />
                      <span>বর্তমান</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onToggleActive?.(ay.id, ay.isActive)}
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold",
                      ay.isActive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                    )}
                  >
                    <span>{ay.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(ay)}
                    className="size-7 p-0 text-muted-foreground hover:text-indigo-600"
                  >
                    <Edit3 className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(ay.id, ay.nameBn || ay.nameEn)}
                    className="size-7 p-0 text-muted-foreground hover:text-rose-500"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => onEdit(ay)}
                  className="font-bold text-sm text-foreground hover:text-indigo-600 dark:hover:text-primary transition-colors font-headline text-left block"
                >
                  {ay.nameBn}
                </button>
                <p className="text-xs text-muted-foreground font-mono">{ay.nameEn}</p>
              </div>

              {/* Date Range */}
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="size-3 text-indigo-500 shrink-0" />
                <span>{formatDateBn(ay.startDate)} - {formatDateBn(ay.endDate)}</span>
              </div>

              {/* Connected Content Count */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-xs text-muted-foreground font-medium">
                <span>সংযুক্ত কনটেন্ট:</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{toBengaliDigits(subjectCount)} বিষয়</span>
                  <span>•</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{toBengaliDigits(chapterCount)} অধ্যায়</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination Footer matching MCQ */}
      {totalItems > 0 && (
        <DataTablePagination
          page={currentPage}
          limit={itemsPerPage}
          totalItems={totalItems}
          entityName="টি শিক্ষাবর্ষ"
          isLoading={isLoading}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      )}
    </div>
  )
}
