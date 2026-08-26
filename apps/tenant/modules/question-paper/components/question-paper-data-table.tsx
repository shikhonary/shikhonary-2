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
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { MoreVertical, Pen, Trash, Clock, Copy, Printer, CheckCircle, AlertTriangle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"

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
  onEdit?: (item: QuestionPaperItem) => void
  onDuplicate: (id: string, title: string) => void
  onDelete: (id: string, title: string) => void
  currentPage: number
  itemsPerPage: number
  totalItems: number
  totalPages: number
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
}

export function QuestionPaperDataTable({
  items,
  isLoading,
  isError,
  onEdit,
  onDuplicate,
  onDelete,
  currentPage,
  itemsPerPage,
  totalItems,
  totalPages,
  onPageChange,
  onLimitChange,
}: QuestionPaperDataTableProps) {
  const displayStart = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
  const displayEnd = Math.min(currentPage * itemsPerPage, totalItems)

  const getStatusBadge = (status: string) => {
    if (status === "Published") {
      return (
        <div className="flex items-center gap-1.5 text-emerald-600 font-display">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span className="text-xs font-semibold uppercase">প্রকাশিত</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-1.5 text-amber-600 font-display">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span className="text-xs font-semibold uppercase">খসড়া (Draft)</span>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-xs">
      {isLoading ? (
        <div className="p-12 text-center text-on-surface-variant font-display">
          <span className="animate-spin inline-block mr-2">⏳</span>
          लोड হচ্ছে...
        </div>
      ) : isError ? (
        <div className="p-8 text-center text-red-500 font-display">
          <p className="font-medium">প্রশ্নপত্র তালিকা লোড করতে ব্যর্থ হয়েছে।</p>
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 sm:p-12 text-center font-display">
          <h3 className="mt-4 text-lg font-bold text-on-surface">
            কোনো প্রশ্নপত্র পাওয়া যায়নি
          </h3>
          <p className="mt-1 text-sm text-on-surface-variant max-w-sm mx-auto font-body">
            নতুন একটি প্রশ্নপত্র তৈরি করে বা কোনো পূর্ববর্তী টেমপ্লেট ডুপ্লিকেট করে শুরু করুন।
          </p>
          <div className="mt-6">
            <Button asChild className="rounded-lg bg-primary text-white font-bold h-auto py-2.5 px-6">
              <Link href="/question-papers/create">
                নতুন প্রশ্নপত্র তৈরি করুন
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div>
          {/* Mobile View */}
          <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:hidden font-body">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-extrabold text-on-surface truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-outline mt-0.5 truncate">{item.examName}</p>
                    <div className="flex gap-2 items-center mt-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px] font-bold border-primary/20 bg-primary/5 px-2 py-0.5 rounded-full text-primary font-display h-auto">
                        {item.className}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-bold border-outline/20 bg-muted/5 px-2 py-0.5 rounded-full text-outline font-display h-auto">
                        পূর্ণমান: {item.total}
                      </Badge>
                      {item.isTemplate && (
                        <Badge variant="outline" className="text-[10px] font-bold border-teal-500/20 bg-teal-500/5 px-2 py-0.5 rounded-full text-teal-600 font-display h-auto">
                          টেমপ্লেট
                        </Badge>
                      )}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high cursor-pointer h-8 w-8 shrink-0 animate-none transition-none"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border border-outline-variant shadow-md rounded-xl p-1.5 min-w-[140px] font-display">
                      <DropdownMenuItem
                        onClick={() => onEdit?.(item)}
                        className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                      >
                        <Pen className="h-3.5 w-3.5" />
                        <span>সম্পাদনা করুন</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDuplicate(item.id, item.title)}
                        className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span>ডুপ্লিকেট করুন</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        asChild
                        className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                      >
                        <Link href={`/question-papers/${item.id}/print`} target="_blank">
                          <Printer className="h-3.5 w-3.5" />
                          <span>প্রিন্ট করুন</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onDelete(item.id, item.title)}
                        className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-error hover:bg-error-container/20"
                      >
                        <Trash className="h-3.5 w-3.5" />
                        <span>মুছে ফেলুন</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {getStatusBadge(item.status)}
                  <div className="flex items-center gap-1.5 text-[11px] text-outline">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {new Date(item.createdAt).toLocaleDateString("bn-BD", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block font-display">
            <Table className="w-full text-left">
              <TableHeader className="bg-surface-container-low border-b border-outline-variant">
                <TableRow className="border-b border-outline-variant bg-surface-container-low hover:bg-surface-container-low">
                  <TableHead className="px-6 py-4 font-semibold tracking-wider text-outline uppercase h-auto">
                    প্রশ্নপত্র বিবরণ
                  </TableHead>
                  <TableHead className="px-6 py-4 font-semibold tracking-wider text-outline uppercase h-auto">
                    শ্রেণী
                  </TableHead>
                  <TableHead className="px-6 py-4 font-semibold tracking-wider text-outline uppercase h-auto">
                    পূর্ণমান / সময়
                  </TableHead>
                  <TableHead className="px-6 py-4 font-semibold tracking-wider text-outline uppercase h-auto">
                    স্ট্যাটাস
                  </TableHead>
                  <TableHead className="px-6 py-4 font-semibold tracking-wider text-outline uppercase h-auto">
                    তৈরির তারিখ
                  </TableHead>
                  <TableHead className="px-6 py-4 text-right font-semibold tracking-wider text-outline uppercase h-auto">
                    কার্যক্রম
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-outline-variant/30 font-body">
                {items.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-surface-container-low transition-all duration-200 ease-in-out group border-b border-outline-variant/30"
                  >
                    <TableCell className="py-4 px-6">
                      <div>
                        <p className="text-sm font-bold text-on-surface">
                          {item.title}
                        </p>
                        <p className="text-xs text-outline">{item.examName}</p>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 px-6">
                      <Badge variant="outline" className="rounded-full px-2.5 py-0.5 border border-primary/20 bg-primary/5 text-primary text-xs font-bold">
                        {item.className}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-xs text-on-surface font-bold">
                          পূর্ণমান: {item.total}
                        </span>
                        <span className="text-[10px] text-outline">
                          সময়: {item.timeInMinutes} মিনিট
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 px-6">
                      {getStatusBadge(item.status)}
                    </TableCell>

                    <TableCell className="py-4 px-6">
                      <span className="text-xs text-on-surface">
                        {new Date(item.createdAt).toLocaleDateString("bn-BD", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </TableCell>

                    <TableCell className="py-4 px-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high cursor-pointer h-auto w-auto"
                          >
                            <MoreVertical />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border border-outline-variant shadow-md rounded-xl p-1.5 min-w-[140px] font-display">
                          <DropdownMenuItem
                            onClick={() => onEdit?.(item)}
                            className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                          >
                            <Pen className="h-3.5 w-3.5" />
                            <span>সম্পাদনা করুন</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDuplicate(item.id, item.title)}
                            className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            <span>ডুপ্লিকেট করুন</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            asChild
                            className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                          >
                            <Link href={`/question-papers/${item.id}/print`} target="_blank">
                              <Printer className="h-3.5 w-3.5 mr-1" />
                              <span>প্রিন্ট করুন</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDelete(item.id, item.title)}
                            className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-error hover:bg-error-container/20"
                          >
                            <Trash className="h-3.5 w-3.5" />
                            <span>মুছে ফেলুন</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Table Footer / Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-outline-variant bg-surface-container-low px-4 sm:px-6 py-4 font-display">
            <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
              <p className="text-xs sm:text-sm text-on-surface-variant">
                মোট <span className="font-bold">{totalItems}</span> টি প্রশ্নপত্রের মধ্যে <span className="font-bold">{displayStart}-{displayEnd}</span> দেখানো হচ্ছে
              </p>
              {onLimitChange && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-outline font-medium">প্রতি পাতায়:</span>
                  <Select
                    value={String(itemsPerPage)}
                    onValueChange={(val) => onLimitChange(Number(val) || 10)}
                  >
                    <SelectTrigger className="h-8 rounded-lg border border-outline-variant bg-white px-2.5 text-xs w-auto gap-1">
                      <SelectValue placeholder="Per Page" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg min-w-[80px]">
                      <SelectItem value="5">৫</SelectItem>
                      <SelectItem value="10">১০</SelectItem>
                      <SelectItem value="20">২০</SelectItem>
                      <SelectItem value="50">৫০</SelectItem>
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
                className="size-8 sm:size-10 rounded-lg border border-outline-variant transition-colors hover:bg-surface-container-high disabled:opacity-30 shrink-0"
              >
                <span>⬅️</span>
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "ghost"}
                  onClick={() => onPageChange(pageNum)}
                  className={`size-8 sm:size-10 rounded-lg text-xs sm:text-sm transition-colors shrink-0 ${currentPage === pageNum
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
                className="size-8 sm:size-10 rounded-lg border border-outline-variant transition-colors hover:bg-surface-container-high disabled:opacity-30 shrink-0"
              >
                <span>➡️</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
