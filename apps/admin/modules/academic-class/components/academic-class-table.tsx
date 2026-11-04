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
  GraduationCap,
  Edit3,
  Trash2,
  MoreVertical,
  Check,
  X,
  BookOpen,
  ToggleLeft,
  ToggleRight,
  Plus,
} from "lucide-react"

export interface AcademicClassItem {
  id: string
  nameEn: string
  nameBn: string
  position: number
  isActive: boolean
  _count?: {
    classSubjects: number
  } | null
}

interface AcademicClassTableProps {
  items: AcademicClassItem[]
  isLoading: boolean
  isError: boolean
  onEdit: (item: AcademicClassItem) => void
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

export function AcademicClassTable({
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
}: AcademicClassTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Skeleton Cards / Table */}
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
        <p className="text-sm font-semibold">শ্রেণিসমূহ লোড করতে সমস্যা হয়েছে।</p>
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
          <GraduationCap className="w-8 h-8 stroke-[1.8]" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-foreground font-headline">
          কোনো শ্রেণি পাওয়া যায়নি
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-muted-foreground max-w-md mx-auto font-body">
          ফিল্টার পরিবর্তন করে দেখুন অথবা নতুন শ্রেণি যোগ করুন।
        </p>
        {onCreateNew && (
          <div className="mt-6">
            <Button
              type="button"
              onClick={onCreateNew}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-5 gap-2 shadow-sm shadow-indigo-200 dark:shadow-none transition-all font-headline cursor-pointer"
            >
              <Plus className="size-4" />
              <span>নতুন শ্রেণি যোগ করুন</span>
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
              <TableHead className="w-20 pl-6 font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                ক্রম
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                শ্রেণির নাম
              </TableHead>
              <TableHead className="w-48 font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                সংযুক্ত বিষয়
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
            {items.map((cls) => {
              const subjectCount = cls._count?.classSubjects ?? 0

              return (
                <TableRow
                  key={cls.id}
                  className="border-b border-slate-200/60 dark:border-white/[0.05] transition-colors hover:bg-slate-50/60 dark:hover:bg-white/[0.02]"
                >
                  {/* Position Badge */}
                  <TableCell className="pl-6">
                    <span className="inline-flex items-center justify-center size-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                      {toBengaliDigits(cls.position)}
                    </span>
                  </TableCell>

                  {/* Class Name */}
                  <TableCell>
                    <div className="space-y-0.5">
                      <button
                        type="button"
                        onClick={() => onEdit(cls)}
                        className="font-bold text-sm text-foreground hover:text-indigo-600 dark:hover:text-primary transition-colors font-headline text-left line-clamp-1 cursor-pointer"
                      >
                        {cls.nameBn}
                      </button>
                      <p className="text-xs text-muted-foreground font-mono">
                        {cls.nameEn}
                      </p>
                    </div>
                  </TableCell>

                  {/* Connected Subjects */}
                  <TableCell>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-white/[0.06] text-muted-foreground">
                      <BookOpen className="size-3.5 text-indigo-500" />
                      <span>{toBengaliDigits(subjectCount)} টি বিষয়</span>
                    </div>
                  </TableCell>

                  {/* Active Toggle Status */}
                  <TableCell className="text-center">
                    <button
                      type="button"
                      onClick={() => onToggleActive?.(cls.id, cls.isActive)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer select-none",
                        cls.isActive
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                          : "bg-slate-500/10 text-slate-500 border border-slate-500/20 hover:bg-slate-500/20"
                      )}
                    >
                      {cls.isActive ? (
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
                          onClick={() => onEdit(cls)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer"
                        >
                          <Edit3 className="size-3.5 text-indigo-500" />
                          <span>সম্পাদনা করুন</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onToggleActive?.(cls.id, cls.isActive)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer"
                        >
                          {cls.isActive ? (
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
                          onClick={() => onDelete(cls.id, cls.nameBn || cls.nameEn)}
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
        {items.map((cls) => {
          const subjectCount = cls._count?.classSubjects ?? 0

          return (
            <div
              key={`mob-${cls.id}`}
              className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-4 space-y-3 shadow-xs transition-all"
            >
              {/* Header row: Position, Status & Actions */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center size-6 rounded-md bg-slate-100 dark:bg-white/[0.06] text-[11px] font-bold text-slate-700 dark:text-slate-300 font-mono">
                    #{toBengaliDigits(cls.position)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleActive?.(cls.id, cls.isActive)}
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold",
                      cls.isActive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                    )}
                  >
                    <span>{cls.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(cls)}
                    className="size-7 p-0 text-muted-foreground hover:text-indigo-600"
                  >
                    <Edit3 className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(cls.id, cls.nameBn || cls.nameEn)}
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
                  onClick={() => onEdit(cls)}
                  className="font-bold text-sm text-foreground hover:text-indigo-600 dark:hover:text-primary transition-colors font-headline text-left block"
                >
                  {cls.nameBn}
                </button>
                <p className="text-xs text-muted-foreground font-mono">{cls.nameEn}</p>
              </div>

              {/* Subject Count */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-xs text-muted-foreground font-medium">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="size-3 text-indigo-500" />
                  <span>সংযুক্ত বিষয়:</span>
                </div>
                <span className="font-bold text-foreground font-mono">{toBengaliDigits(subjectCount)} টি</span>
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
          entityName="টি শ্রেণি"
          isLoading={isLoading}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      )}
    </div>
  )
}
