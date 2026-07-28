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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { MoreVertical, Pen, Trash, BookOpen } from "lucide-react"

export interface SubjectItem {
  id: string
  name: string
  position: number
  createdAt: string | Date
  updatedAt: string | Date
  academicClasses?: Array<{
    id: string
    academicClassId: string
    academicClass: {
      id: string
      name: string
      isActive?: boolean
    } | null
  }>
  _count?: {
    chapters: number
    academicClasses: number
  }
}

interface SubjectTableProps {
  items: SubjectItem[]
  isLoading: boolean
  isError: boolean
  isDeleting?: boolean
  onEdit?: (item: SubjectItem) => void
  onDelete: (id: string, name: string) => void
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
  isDeleting,
  onEdit,
  onDelete,
  currentPage,
  itemsPerPage,
  totalItems,
  totalPages,
  onPageChange,
  onLimitChange,
}: SubjectTableProps) {
  const displayStart = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
  const displayEnd = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-xs">
      {isLoading ? (
        <div className="flex items-center justify-center p-12 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-3xl text-primary">
            progress_activity
          </span>
          <span className="ml-3 font-body-md">Loading subjects...</span>
        </div>
      ) : isError ? (
        <div className="p-8 text-center text-error">
          <span className="material-symbols-outlined text-4xl">error</span>
          <p className="mt-2 font-body-md font-medium">Failed to load subjects.</p>
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-outline">
            book
          </span>
          <h3 className="mt-4 font-headline-md text-lg font-bold text-on-surface">
            No Subjects Found
          </h3>
          <p className="mt-1 font-body-md text-sm text-on-surface-variant">
            Get started by creating your first subject module.
          </p>
          <div className="mt-6">
            <Button
              asChild
              className="inline-flex items-center space-x-2 rounded-lg bg-primary-container px-6 py-2.5 font-bold text-on-primary-container hover:bg-primary hover:text-white h-auto normal-case tracking-normal"
            >
              <Link href="/subjects/create">
                <span className="material-symbols-outlined text-sm">add</span>
                <span>Create New Subject</span>
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div>
          {/* Mobile Card List View (< md) */}
          <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:hidden">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
              >
                {/* Header Row: Icon + Name + Badge + Actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-headline-md text-base font-extrabold text-on-surface truncate">
                        {item.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="rounded border border-outline-variant bg-surface-container-high px-2 py-0.5 font-label-sm text-[10px] font-medium uppercase shrink-0">
                          #{item.position < 10 ? `0${item.position}` : item.position}
                        </span>
                        <Link
                          href={`/chapters?subjectId=${item.id}`}
                          className="font-label-sm text-[10px] font-semibold text-primary hover:underline flex items-center gap-1 shrink-0"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          {item._count?.chapters ?? 0} chapters
                        </Link>
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
                    <DropdownMenuContent align="end" className="bg-white border border-outline-variant shadow-md rounded-xl p-1.5 min-w-[140px]">
                      <DropdownMenuItem
                        asChild
                        className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                      >
                        <Link href={`/chapters?subjectId=${item.id}`}>
                          <BookOpen className="h-4 w-4" />
                          <span>Chapters</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onEdit?.(item)}
                        className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                      >
                        <Pen />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onDelete(item.id, item.name)}
                        className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-error hover:bg-error-container/20"
                      >
                        <Trash />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mapped Classes Badges */}
                {item.academicClasses && item.academicClasses.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 border-t border-outline-variant/10 pt-2.5">
                    {item.academicClasses.map((acRel) => (
                      <Badge
                        key={acRel.id}
                        className="inline-flex items-center rounded-full bg-primary-container/10 px-2.5 py-0.5 font-label-sm text-[10px] font-bold uppercase text-primary border-0 shadow-none"
                      >
                        {acRel.academicClass?.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Card Footer Info */}
                <div className="flex items-center justify-between border-t border-outline-variant/20 pt-2.5 text-[11px] text-outline">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-xs">calendar_today</span>
                    <span>
                      Added {new Date(item.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <span className="text-[10px] text-outline/80">
                    ID: {item.id.slice(0, 8)}...
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block">
            <Table className="w-full text-left font-body-md">
              <TableHeader className="bg-surface-container-low border-b border-outline-variant">
                <TableRow className="border-b border-outline-variant bg-surface-container-low hover:bg-surface-container-low">
                  <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                    Subject Name
                  </TableHead>
                  <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                    Mapped Classes
                  </TableHead>
                  <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                    Position
                  </TableHead>
                  <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                    Chapters Count
                  </TableHead>
                  <TableHead className="px-6 py-4 text-right font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-outline-variant/30">
                {items.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-surface-container-low transition-all duration-200 ease-in-out group border-b border-outline-variant/30"
                  >
                    {/* Subject Name */}
                    <TableCell className="py-5 group-hover:py-6 px-6 transition-all duration-200 ease-in-out">
                      <div className="flex flex-col">
                        <span className="font-headline-md text-base font-bold text-on-surface">
                          {item.name}
                        </span>
                      </div>
                    </TableCell>

                    {/* Mapped Classes */}
                    <TableCell className="py-5 group-hover:py-6 px-6 transition-all duration-200 ease-in-out">
                      <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
                        {item.academicClasses && item.academicClasses.length > 0 ? (
                          item.academicClasses.map((acRel) => (
                            <Badge
                              key={acRel.id}
                              className="inline-flex items-center rounded-full bg-primary-container/10 px-3 py-1 font-label-sm text-xs font-bold uppercase text-primary border-0 shadow-none"
                            >
                              {acRel.academicClass?.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-outline italic">No classes mapped</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Position */}
                    <TableCell className="py-5 group-hover:py-6 px-6 transition-all duration-200 ease-in-out">
                      <div className="flex items-center gap-2">
                        <span className="rounded border border-outline-variant bg-surface-container-high px-3 py-1 font-label-sm text-xs font-medium">
                          #{item.position < 10 ? `0${item.position}` : item.position}
                        </span>
                      </div>
                    </TableCell>

                    {/* Chapters Count */}
                    <TableCell className="py-5 group-hover:py-6 px-6 transition-all duration-200 ease-in-out">
                      <Link
                        href={`/chapters?subjectId=${item.id}`}
                        className="inline-flex items-center gap-1.5 text-primary hover:text-primary-hover hover:underline"
                      >
                        <BookOpen className="h-4 w-4" />
                        <span className="font-label-sm text-xs font-semibold">
                          {item._count?.chapters ?? 0} chapters
                        </span>
                      </Link>
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
                        <DropdownMenuContent align="end" className="bg-white border border-outline-variant shadow-md rounded-xl p-1.5 min-w-[140px]">
                          <DropdownMenuItem
                            asChild
                            className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                          >
                            <Link href={`/chapters?subjectId=${item.id}`}>
                              <BookOpen className="h-4 w-4" />
                              <span>Manage Chapters</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onEdit?.(item)}
                            className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                          >
                            <Pen />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDelete(item.id, item.name)}
                            className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-error hover:bg-error-container/20"
                          >
                            <Trash />
                            <span>Delete</span>
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-outline-variant bg-surface-container-low px-4 sm:px-6 py-4">
            <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
              <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
                Showing <span className="font-bold">{displayStart}-{displayEnd}</span> of <span className="font-bold">{totalItems}</span> subjects
              </p>
              {onLimitChange && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-outline font-medium">Rows per page:</span>
                  <Select
                    value={String(itemsPerPage)}
                    onValueChange={(val) => onLimitChange(Number(val) || 5)}
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
