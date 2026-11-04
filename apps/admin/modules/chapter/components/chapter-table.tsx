"use client"

import Link from "next/link"
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
  Layers,
  Edit3,
  Trash2,
  MoreVertical,
  Check,
  X,
  BookOpen,
  GraduationCap,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Plus,
} from "lucide-react"

export interface ChapterItem {
  id: string
  nameEn: string
  nameBn: string
  position: number
  isActive: boolean
  subjectId: string
  createdAt?: Date | string
  updatedAt?: Date | string
  subject?: {
    id: string
    nameEn: string
    nameBn: string
    code?: string | null
    classSubjects?: {
      academicClass?: {
        id: string
        nameEn: string
        nameBn: string
      } | null
    }[]
  } | null
  academicYearId?: string | null
  academicYear?: {
    id: string
    nameEn: string
    nameBn?: string
  } | null
}

interface ChapterTableProps {
  items: ChapterItem[]
  isLoading: boolean
  isError: boolean
  onDelete: (id: string, name: string) => void
  onToggleActive?: (id: string, currentStatus: boolean) => void
  currentPage: number
  itemsPerPage: number
  totalItems: number
  totalPages: number
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
}

export function ChapterTable({
  items,
  isLoading,
  isError,
  onDelete,
  onToggleActive,
  currentPage,
  itemsPerPage,
  totalItems,
  totalPages,
  onPageChange,
  onLimitChange,
}: ChapterTableProps) {

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
        <p className="text-sm font-semibold">অধ্যায়সমূহ লোড করতে সমস্যা হয়েছে।</p>
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
          <BookOpen className="w-8 h-8 stroke-[1.8]" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-foreground font-headline">
          কোনো অধ্যায় পাওয়া যায়নি
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-muted-foreground max-w-md mx-auto font-body">
          ফিল্টার পরিবর্তন করে দেখুন অথবা নতুন অধ্যায় যোগ করুন।
        </p>
        <div className="mt-6">
          <Button
            asChild
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-5 gap-2 shadow-sm shadow-indigo-200 dark:shadow-none transition-all font-headline cursor-pointer"
          >
            <Link href="/chapters/create" prefetch={true}>
              <Plus className="size-4" />
              <span>নতুন অধ্যায় যোগ করুন</span>
            </Link>
          </Button>
        </div>
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
                অধ্যায়ের নাম
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                বিষয় ও শ্রেণি
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                শিক্ষাবর্ষ
              </TableHead>
              <TableHead className="w-28 text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                স্ট্যাটাস
              </TableHead>
              <TableHead className="w-20 text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                অ্যাকশন
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((chapter) => {
              const classSubjects = chapter.subject?.classSubjects ?? []
              const primaryClass = classSubjects[0]?.academicClass

              return (
                <TableRow
                  key={chapter.id}
                  className="border-b border-slate-200/60 dark:border-white/[0.05] transition-colors hover:bg-slate-50/60 dark:hover:bg-white/[0.02]"
                >
                  {/* Position Badge */}
                  <TableCell className="pl-6">
                    <span className="inline-flex items-center justify-center size-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                      {toBengaliDigits(chapter.position)}
                    </span>
                  </TableCell>

                  {/* Chapter Name */}
                  <TableCell>
                    <div className="space-y-0.5">
                      <Link
                        href={`/chapters/${chapter.id}/edit`}
                        className="font-bold text-sm text-foreground hover:text-indigo-600 dark:hover:text-primary transition-colors font-headline line-clamp-1"
                      >
                        {chapter.nameBn}
                      </Link>
                      <p className="text-xs text-muted-foreground font-mono">
                        {chapter.nameEn}
                      </p>
                    </div>
                  </TableCell>

                  {/* Subject & Class */}
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {chapter.subject && (
                        <Badge
                          variant="secondary"
                          className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/40 text-[11px] font-medium"
                        >
                          <BookOpen className="size-3 mr-1" />
                          {chapter.subject.nameBn || chapter.subject.nameEn}
                        </Badge>
                      )}
                      {primaryClass && (
                        <Badge
                          variant="outline"
                          className="border-slate-200 dark:border-white/[0.08] text-muted-foreground text-[11px]"
                        >
                          <GraduationCap className="size-3 mr-1" />
                          {primaryClass.nameBn || primaryClass.nameEn}
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* Academic Year */}
                  <TableCell>
                    {chapter.academicYear ? (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="size-3 text-slate-400" />
                        {chapter.academicYear.nameBn || chapter.academicYear.nameEn}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/60">—</span>
                    )}
                  </TableCell>

                  {/* Active / Inactive Status */}
                  <TableCell className="text-center">
                    <button
                      type="button"
                      disabled={!onToggleActive}
                      onClick={() => onToggleActive?.(chapter.id, chapter.isActive)}
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer",
                        chapter.isActive
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                          : "bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/20 hover:bg-slate-500/20"
                      )}
                      title="স্ট্যাটাস পরিবর্তন করতে ক্লিক করুন"
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          chapter.isActive ? "bg-emerald-500" : "bg-slate-400"
                        )}
                      />
                      <span>{chapter.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}</span>
                    </button>
                  </TableCell>

                  {/* Actions Dropdown */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="size-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-white/[0.06]"
                        >
                          <MoreVertical className="size-4" />
                          <span className="sr-only">অ্যাকশন মেনু</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-lg border border-slate-200 dark:border-white/[0.08]">
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/chapters/${chapter.id}/edit`}
                            className="flex items-center gap-2 text-xs font-medium cursor-pointer"
                          >
                            <Edit3 className="size-3.5 text-indigo-600 dark:text-primary" />
                            <span>সম্পাদনা করুন</span>
                          </Link>
                        </DropdownMenuItem>

                        {onToggleActive && (
                          <DropdownMenuItem
                            onClick={() => onToggleActive(chapter.id, chapter.isActive)}
                            className="flex items-center gap-2 text-xs font-medium cursor-pointer"
                          >
                            {chapter.isActive ? (
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
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => onDelete(chapter.id, chapter.nameBn || chapter.nameEn)}
                          className="flex items-center gap-2 text-xs font-medium text-rose-600 dark:text-rose-400 focus:text-rose-600 cursor-pointer"
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
        {items.map((chapter) => {
          const classSubjects = chapter.subject?.classSubjects ?? []
          const primaryClass = classSubjects[0]?.academicClass

          return (
            <div
              key={`mob-${chapter.id}`}
              className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-4 space-y-3 shadow-xs transition-all"
            >
              {/* Header row: Position, Status & Actions */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center size-6 rounded-md bg-slate-100 dark:bg-white/[0.06] text-[11px] font-bold text-slate-700 dark:text-slate-300 font-mono">
                    #{toBengaliDigits(chapter.position)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleActive?.(chapter.id, chapter.isActive)}
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold",
                      chapter.isActive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                    )}
                  >
                    <span>{chapter.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <Link href={`/chapters/${chapter.id}/edit`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="size-7 p-0 text-muted-foreground hover:text-indigo-600"
                    >
                      <Edit3 className="size-3.5" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(chapter.id, chapter.nameBn || chapter.nameEn)}
                    className="size-7 p-0 text-muted-foreground hover:text-rose-500"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>

              {/* Title & Names */}
              <div>
                <Link
                  href={`/chapters/${chapter.id}/edit`}
                  className="font-bold text-sm text-foreground hover:text-indigo-600 dark:hover:text-primary transition-colors font-headline"
                >
                  {chapter.nameBn}
                </Link>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {chapter.nameEn}
                </p>
              </div>

              {/* Badges footer */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {chapter.subject && (
                  <Badge
                    variant="secondary"
                    className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/40 text-[10px]"
                  >
                    <BookOpen className="size-2.5 mr-1" />
                    {chapter.subject.nameBn || chapter.subject.nameEn}
                  </Badge>
                )}
                {primaryClass && (
                  <Badge
                    variant="outline"
                    className="border-slate-200 dark:border-white/[0.08] text-muted-foreground text-[10px]"
                  >
                    <GraduationCap className="size-2.5 mr-1" />
                    {primaryClass.nameBn || primaryClass.nameEn}
                  </Badge>
                )}
                {chapter.academicYear && (
                  <Badge
                    variant="outline"
                    className="border-slate-200 dark:border-white/[0.08] text-muted-foreground text-[10px]"
                  >
                    <Calendar className="size-2.5 mr-1" />
                    {chapter.academicYear.nameBn || chapter.academicYear.nameEn}
                  </Badge>
                )}
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
          entityName="টি অধ্যায়"
          isLoading={isLoading}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      )}
    </div>
  )
}
