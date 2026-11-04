"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
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
  BookOpen,
  Edit3,
  Trash2,
  MoreVertical,
  Check,
  X,
  GraduationCap,
  Calendar,
  Layers,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  Plus,
} from "lucide-react"

export interface SubjectItem {
  id: string
  nameEn: string
  nameBn: string
  code: string | null
  group: string | null
  isActive: boolean
  academicYearId: string | null
  academicYear?: {
    id: string
    nameEn: string
    nameBn: string
  } | null
  classSubjects?: {
    academicClass?: {
      id: string
      nameEn: string
      nameBn: string
    } | null
  }[]
  _count?: {
    subjectQuestionTypes: number
  } | null
}

interface SubjectTableProps {
  items: SubjectItem[]
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

export function SubjectTable({
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
}: SubjectTableProps) {
  const router = useRouter()

  const getGroupBadgeColor = (group: string | null) => {
    switch (group) {
      case "Science":
        return "border-emerald-200/80 dark:border-emerald-800/40 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400"
      case "Humanities":
        return "border-amber-200/80 dark:border-amber-800/40 bg-amber-50/60 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400"
      case "Commerce":
        return "border-blue-200/80 dark:border-blue-800/40 bg-blue-50/60 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400"
      default:
        return "border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300"
    }
  }

  const getGroupLabel = (group: string | null) => {
    switch (group) {
      case "General":
        return "সাধারণ"
      case "Science":
        return "বিজ্ঞান"
      case "Humanities":
        return "মানবিক"
      case "Commerce":
        return "ব্যবসায় শিক্ষা"
      default:
        return group || "সাধারণ"
    }
  }

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
        <p className="text-sm font-semibold">বিষয়সমূহ লোড করতে সমস্যা হয়েছে।</p>
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
          কোনো বিষয় পাওয়া যায়নি
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-muted-foreground max-w-md mx-auto font-body">
          ফিল্টার পরিবর্তন করে দেখুন অথবা নতুন বিষয় যোগ করুন।
        </p>
        <div className="mt-6">
          <Button
            asChild
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-5 gap-2 shadow-sm shadow-indigo-200 dark:shadow-none transition-all font-headline cursor-pointer"
          >
            <Link href="/subjects/create" prefetch={true}>
              <Plus className="size-4" />
              <span>নতুন বিষয় যোগ করুন</span>
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
                বিষয়ের নাম
              </TableHead>
              <TableHead className="w-24 font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                কোড
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                শ্রেণি ও বিভাগ
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                শিক্ষাবর্ষ
              </TableHead>
              <TableHead className="w-32 font-semibold text-xs uppercase tracking-wider text-muted-foreground font-headline">
                প্রশ্ন কাঠামো
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
            {items.map((subject, idx) => {
              const globalIndex = (currentPage - 1) * itemsPerPage + idx + 1
              const classSubjects = subject.classSubjects ?? []
              const qTypeCount = subject._count?.subjectQuestionTypes ?? 0

              return (
                <TableRow
                  key={subject.id}
                  className="border-b border-slate-200/60 dark:border-white/[0.05] transition-colors hover:bg-slate-50/60 dark:hover:bg-white/[0.02]"
                >
                  {/* Position Badge */}
                  <TableCell className="pl-6">
                    <span className="inline-flex items-center justify-center size-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                      {toBengaliDigits(globalIndex)}
                    </span>
                  </TableCell>

                  {/* Subject Name */}
                  <TableCell>
                    <div className="space-y-0.5">
                      <Link
                        href={`/subjects/${subject.id}/edit`}
                        className="font-bold text-sm text-foreground hover:text-indigo-600 dark:hover:text-primary transition-colors font-headline line-clamp-1"
                      >
                        {subject.nameBn}
                      </Link>
                      <p className="text-xs text-muted-foreground font-mono">
                        {subject.nameEn}
                      </p>
                    </div>
                  </TableCell>

                  {/* Code */}
                  <TableCell>
                    {subject.code ? (
                      <Badge
                        variant="secondary"
                        className="font-mono text-xs px-2 py-0.5 rounded-md font-semibold bg-slate-100 dark:bg-white/[0.06] text-foreground"
                      >
                        {subject.code}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground font-mono">—</span>
                    )}
                  </TableCell>

                  {/* Classes & Group */}
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {classSubjects.length > 0 ? (
                        classSubjects.map((cs, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-xs py-0.5 px-2 rounded-md font-medium border-slate-200 dark:border-white/[0.08]"
                          >
                            <GraduationCap className="size-3 mr-1 text-indigo-500" />
                            {cs.academicClass?.nameBn || cs.academicClass?.nameEn}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">শ্রেণি নির্ধারিত নেই</span>
                      )}
                      {subject.group && (
                        <Badge
                          variant="outline"
                          className={cn("text-[11px] py-0.5 px-2 rounded-md font-semibold", getGroupBadgeColor(subject.group))}
                        >
                          {getGroupLabel(subject.group)}
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* Academic Year */}
                  <TableCell>
                    {subject.academicYear ? (
                      <Badge
                        variant="outline"
                        className="border-slate-200 dark:border-white/[0.08] text-muted-foreground text-xs font-medium"
                      >
                        <Calendar className="size-3 mr-1 text-slate-400" />
                        {subject.academicYear.nameBn || subject.academicYear.nameEn}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground font-mono">—</span>
                    )}
                  </TableCell>

                  {/* Question Types Count */}
                  <TableCell>
                    <Link
                      href={`/subjects/${subject.id}/question-types`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50/70 dark:bg-primary/10 text-indigo-600 dark:text-primary hover:bg-indigo-100/70 transition-colors"
                    >
                      <HelpCircle className="size-3.5" />
                      <span>{toBengaliDigits(qTypeCount)} টি ধরন</span>
                    </Link>
                  </TableCell>

                  {/* Active Toggle Status */}
                  <TableCell className="text-center">
                    <button
                      type="button"
                      onClick={() => onToggleActive?.(subject.id, subject.isActive)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer select-none",
                        subject.isActive
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                          : "bg-slate-500/10 text-slate-500 border border-slate-500/20 hover:bg-slate-500/20"
                      )}
                    >
                      {subject.isActive ? (
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
                        className="w-48 rounded-xl border border-slate-200/80 dark:border-white/[0.08] shadow-lg p-1.5"
                      >
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/subjects/${subject.id}/edit`}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer"
                          >
                            <Edit3 className="size-3.5 text-indigo-500" />
                            <span>সম্পাদনা করুন</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/subjects/${subject.id}/question-types`}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer"
                          >
                            <HelpCircle className="size-3.5 text-purple-500" />
                            <span>প্রশ্ন কাঠামো কনফিগ</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onToggleActive?.(subject.id, subject.isActive)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer"
                        >
                          {subject.isActive ? (
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
                          onClick={() => onDelete(subject.id, subject.nameBn || subject.nameEn)}
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
        {items.map((subject, idx) => {
          const globalIndex = (currentPage - 1) * itemsPerPage + idx + 1
          const classSubjects = subject.classSubjects ?? []
          const qTypeCount = subject._count?.subjectQuestionTypes ?? 0

          return (
            <div
              key={`mob-${subject.id}`}
              className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-4 space-y-3 shadow-xs transition-all"
            >
              {/* Header row: Position, Status & Actions */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center size-6 rounded-md bg-slate-100 dark:bg-white/[0.06] text-[11px] font-bold text-slate-700 dark:text-slate-300 font-mono">
                    #{toBengaliDigits(globalIndex)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleActive?.(subject.id, subject.isActive)}
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold",
                      subject.isActive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                    )}
                  >
                    <span>{subject.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}</span>
                  </button>
                  {subject.code && (
                    <Badge
                      variant="secondary"
                      className="font-mono text-[10px] px-1.5 py-0 rounded bg-slate-100 dark:bg-white/[0.06]"
                    >
                      {subject.code}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Link href={`/subjects/${subject.id}/edit`}>
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
                    onClick={() => onDelete(subject.id, subject.nameBn || subject.nameEn)}
                    className="size-7 p-0 text-muted-foreground hover:text-rose-500"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-0.5">
                <Link
                  href={`/subjects/${subject.id}/edit`}
                  className="font-bold text-sm text-foreground hover:text-indigo-600 dark:hover:text-primary transition-colors font-headline block"
                >
                  {subject.nameBn}
                </Link>
                <p className="text-xs text-muted-foreground font-mono">{subject.nameEn}</p>
              </div>

              {/* Meta Badges */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {classSubjects.map((cs, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="border-slate-200 dark:border-white/[0.08] text-muted-foreground text-[10px]"
                  >
                    <GraduationCap className="size-2.5 mr-1 text-indigo-500" />
                    {cs.academicClass?.nameBn || cs.academicClass?.nameEn}
                  </Badge>
                ))}
                {subject.group && (
                  <Badge
                    variant="outline"
                    className={cn("text-[10px]", getGroupBadgeColor(subject.group))}
                  >
                    {getGroupLabel(subject.group)}
                  </Badge>
                )}
                {subject.academicYear && (
                  <Badge
                    variant="outline"
                    className="border-slate-200 dark:border-white/[0.08] text-muted-foreground text-[10px]"
                  >
                    <Calendar className="size-2.5 mr-1" />
                    {subject.academicYear.nameBn || subject.academicYear.nameEn}
                  </Badge>
                )}
              </div>

              {/* Question Types Link */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
                <Link
                  href={`/subjects/${subject.id}/question-types`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-primary hover:underline"
                >
                  <HelpCircle className="size-3.5" />
                  <span>প্রশ্ন কাঠামো ({toBengaliDigits(qTypeCount)} টি ধরন)</span>
                </Link>
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
          entityName="টি বিষয়"
          isLoading={isLoading}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      )}
    </div>
  )
}
