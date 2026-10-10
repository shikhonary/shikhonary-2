"use client"

import React from "react"
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
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  MoreVertical,
  Pen,
  Trash,
  Clock,
  Copy,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  FileQuestion,
  Plus,
} from "lucide-react"
import { QuestionPaperCardGrid } from "./question-paper-card-grid"
import type { QuestionPaperViewMode } from "../hooks/use-question-paper-search-params"

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "০"
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
  return num
    .toString()
    .split("")
    .map((char) => (/\d/.test(char) ? bengaliDigits[parseInt(char)] : char))
    .join("")
}

export function formatDurationBn(minutes: number): string {
  if (!minutes) return "০ মিনিট"
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0 && mins > 0) {
    return `${toBengaliDigits(hours)} ঘণ্টা ${toBengaliDigits(mins)} মিনিট`
  } else if (hours > 0) {
    return `${toBengaliDigits(hours)} ঘণ্টা`
  } else {
    return `${toBengaliDigits(mins)} মিনিট`
  }
}

export interface QuestionPaperItem {
  id: string
  title: string
  examName: string
  description: string | null
  classId: string
  className: string
  status: string // "Draft" | "Published"
  isTemplate: boolean
  total: number
  timeInMinutes: number
  createdAt: string | Date
}

interface QuestionPaperDataTableProps {
  items: QuestionPaperItem[]
  isLoading: boolean
  isError: boolean
  viewMode?: QuestionPaperViewMode
  onEdit?: (item: QuestionPaperItem) => void
  onDuplicate: (id: string, title: string) => void
  onDelete: (id: string, title: string) => void
}

export function QuestionPaperDataTable({
  items,
  isLoading,
  isError,
  viewMode = "table",
  onEdit,
  onDuplicate,
  onDelete,
}: QuestionPaperDataTableProps) {
  const getStatusBadge = (status: string) => {
    if (status === "Published") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40 font-headline">
          <CheckCircle className="h-3.5 w-3.5 shrink-0" />
          <span>পাবলিশড</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40 font-headline">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        <span>ড্রাফট</span>
      </span>
    )
  }

  // If in Grid view mode on desktop
  if (viewMode === "grid") {
    if (isLoading) {
      return (
        <QuestionPaperCardGrid
          items={[]}
          isLoading={true}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      )
    }

    if (isError) {
      return (
        <div className="p-12 text-center text-red-500 font-headline bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.06] shadow-xs">
          <AlertTriangle className="h-10 w-10 mx-auto text-red-400 mb-3" />
          <p className="text-base font-bold">প্রশ্নপত্র তালিকা লোড করতে ব্যর্থ হয়েছে।</p>
          <p className="text-xs text-muted-foreground mt-1">অনুগ্রহ করে পুনরায় পেজটি রিফ্রেশ করুন বা পরে চেষ্টা করুন।</p>
        </div>
      )
    }

    return (
      <QuestionPaperCardGrid
        items={items}
        isLoading={false}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />
    )
  }

  if (isLoading) {
    return (
      <>
        {/* Mobile View Skeleton: Card Grid */}
        <div className="md:hidden">
          <QuestionPaperCardGrid
            items={[]}
            isLoading={true}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        </div>

        {/* Desktop View Skeleton: Table with Matching Question Bank Style */}
        <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-card shadow-xs">
          <div className="bg-slate-50/70 dark:bg-card/70 border-b border-slate-200/80 dark:border-white/[0.06] px-6 py-3.5 flex items-center justify-between">
            <div className="h-4 w-32 bg-slate-200/80 dark:bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-20 bg-slate-200/60 dark:bg-white/[0.06] rounded animate-pulse" />
          </div>
          <div className="divide-y divide-slate-100 dark:divide-white/[0.04] p-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center justify-between gap-6 px-4 py-4 animate-pulse">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100 dark:border-primary/20 shrink-0" />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="h-4 w-48 bg-slate-200/80 dark:bg-white/10 rounded" />
                    <div className="h-3 w-32 bg-slate-100 dark:bg-white/[0.06] rounded" />
                  </div>
                </div>
                <div className="h-6 w-20 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg border border-indigo-100 dark:border-indigo-800/30 shrink-0" />
                <div className="h-4 w-28 bg-slate-100 dark:bg-white/[0.06] rounded shrink-0 hidden lg:block" />
                <div className="h-6 w-20 bg-slate-100 dark:bg-white/[0.06] rounded-full shrink-0" />
                <div className="h-4 w-24 bg-slate-100 dark:bg-white/[0.06] rounded shrink-0 hidden xl:block" />
                <div className="flex items-center gap-2 shrink-0">
                  <div className="h-8 w-24 bg-indigo-100/70 dark:bg-primary/20 rounded-xl" />
                  <div className="h-8 w-8 bg-slate-100 dark:bg-white/[0.06] rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    )
  }

  if (isError) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-card shadow-xs p-12 text-center text-red-500 font-headline">
        <AlertTriangle className="h-10 w-10 mx-auto text-red-400 mb-3" />
        <p className="text-base font-bold">প্রশ্নপত্র তালিকা লোড করতে ব্যর্থ হয়েছে।</p>
        <p className="text-xs text-muted-foreground mt-1">অনুগ্রহ করে পুনরায় পেজটি রিফ্রেশ করুন বা পরে চেষ্টা করুন।</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-card shadow-xs py-16 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-4 border border-indigo-100 dark:border-indigo-800/40">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-foreground font-headline">
          কোনো প্রশ্নপত্র পাওয়া যায়নি
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-muted-foreground max-w-md mx-auto font-body">
          নতুন একটি প্রশ্নপত্র তৈরি করে বা কোনো পূর্ববর্তী টেমপ্লেট ডুপ্লিকেট করে শুরু করতে পারেন।
        </p>
        <div className="mt-6">
          <Button asChild className="rounded-xl bg-primary text-primary-foreground font-bold h-10 px-5 gap-2 shadow-xs hover:shadow-md transition-all font-headline">
            <Link href="/question-papers/create">
              <Plus className="w-4 h-4" />
              <span>নতুন প্রশ্নপত্র তৈরি করুন</span>
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile View - Direct Card Grid Without Any Outer Box Wrapper */}
          <div className="md:hidden">
            <QuestionPaperCardGrid
              items={items}
              isLoading={false}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          </div>

          {/* Desktop Table View - Contained in rounded-2xl Card */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-card shadow-xs">
            <Table className="w-full text-left">
              <TableHeader className="bg-slate-50/70 dark:bg-card/70 border-b border-slate-200/80 dark:border-white/[0.06]">
                  <TableRow className="border-b border-slate-200/80 dark:border-white/[0.06] hover:bg-transparent">
                    <TableHead className="px-6 py-3.5 font-bold text-xs text-slate-500 dark:text-muted-foreground font-headline">
                      প্রশ্নপত্র বিবরণ
                    </TableHead>
                    <TableHead className="px-6 py-3.5 font-bold text-xs text-slate-500 dark:text-muted-foreground font-headline">
                      শ্রেণি
                    </TableHead>
                    <TableHead className="px-6 py-3.5 font-bold text-xs text-slate-500 dark:text-muted-foreground font-headline">
                      পূর্ণমান / সময়
                    </TableHead>
                    <TableHead className="px-6 py-3.5 font-bold text-xs text-slate-500 dark:text-muted-foreground font-headline">
                      স্ট্যাটাস
                    </TableHead>
                    <TableHead className="px-6 py-3.5 font-bold text-xs text-slate-500 dark:text-muted-foreground font-headline">
                      তৈরির তারিখ
                    </TableHead>
                    <TableHead className="px-6 py-3.5 text-right font-bold text-xs text-slate-500 dark:text-muted-foreground font-headline">
                      কার্যক্রম
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                  {items.map((item) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors border-b border-slate-100 dark:border-white/[0.04] group"
                    >
                      <TableCell className="py-4 px-6">
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-foreground font-headline">
                            {item.title}
                          </p>
                          <p className="text-xs text-muted-foreground font-body">{item.examName}</p>
                        </div>
                      </TableCell>

                      <TableCell className="py-4 px-6">
                        <Badge variant="outline" className="rounded-lg px-2.5 py-0.5 border border-indigo-200 dark:border-indigo-800/40 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold font-headline">
                          {item.className}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-4 px-6 font-body">
                        <div className="flex flex-col">
                          <span className="text-xs text-foreground font-bold font-solaiman">
                            পূর্ণমান: {toBengaliDigits(item.total)}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            সময়: {formatDurationBn(item.timeInMinutes)}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-4 px-6">
                        {getStatusBadge(item.status)}
                      </TableCell>

                      <TableCell className="py-4 px-6">
                        <span className="text-xs text-muted-foreground font-body">
                          {new Date(item.createdAt).toLocaleDateString("bn-BD", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </TableCell>

                      <TableCell className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="rounded-xl h-8 gap-1.5 border-primary/30 text-primary hover:bg-primary/10 font-bold text-xs cursor-pointer font-headline"
                          >
                            <Link href={`/question-papers/${item.id}/builder`}>
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>বিল্ডার</span>
                            </Link>
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer h-8 w-8"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl p-1.5 min-w-[150px] font-headline">
                              <DropdownMenuItem
                                asChild
                                className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10"
                              >
                                <Link href={`/question-papers/${item.id}/builder`}>
                                  <Sparkles className="h-3.5 w-3.5" />
                                  <span>বিল্ডার ওপেন করুন</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                asChild
                                className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-slate-100 dark:hover:bg-white/[0.06]"
                              >
                                <Link href={`/question-papers/${item.id}/edit`}>
                                  <Pen className="h-3.5 w-3.5" />
                                  <span>সম্পাদনা করুন</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onDuplicate(item.id, item.title)}
                                className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-slate-100 dark:hover:bg-white/[0.06]"
                              >
                                <Copy className="h-3.5 w-3.5" />
                                <span>ডুপ্লিকেট করুন</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => onDelete(item.id, item.title)}
                                className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                              >
                                <Trash className="h-3.5 w-3.5" />
                                <span>মুছে ফেলুন</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          </div>
        </>
  )
}
