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
import { MoreVertical, Pen, Trash, Users, Link2, Monitor, MapPin } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import Image from "next/image"

export interface StudentItem {
  id: string
  name: string
  phone: string
  institute: string
  roll: number | null
  isOfflineStudent: boolean
  academicClassId: string
  academicClass?: {
    id: string
    name: string
    isActive: boolean
  } | null
  userId: string | null
  imageUrl: string | null
  createdAt: string | Date
  updatedAt: string | Date
}

interface StudentTableProps {
  items: StudentItem[]
  isLoading: boolean
  isError: boolean
  isDeleting: boolean
  onEdit?: (item: StudentItem) => void
  onDelete: (id: string, name: string) => void
  currentPage: number
  itemsPerPage: number
  totalItems: number
  totalPages: number
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
}

export function StudentTable({
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
}: StudentTableProps) {
  const displayStart = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
  const displayEnd = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-xs">
      {isLoading ? (
        <div className="p-4 md:p-12">
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 w-full rounded-xl bg-surface-container-high animate-pulse" />
            ))}
          </div>
          <div className="hidden md:flex items-center justify-center p-8 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin text-3xl text-primary">
              progress_activity
            </span>
            <span className="ml-3 font-body-md">Loading students directory...</span>
          </div>
        </div>
      ) : isError ? (
        <div className="p-8 text-center text-error">
          <span className="material-symbols-outlined text-4xl">error</span>
          <p className="mt-2 font-body-md font-medium">Failed to load students list.</p>
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 sm:p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-outline">
            group
          </span>
          <h3 className="mt-4 font-headline-md text-lg font-bold text-on-surface">
            No Students Found
          </h3>
          <p className="mt-1 font-body-md text-sm text-on-surface-variant">
            Get started by enrolling or onboarding your first student record.
          </p>
          <div className="mt-6">
            <Button
              asChild
              className="inline-flex items-center space-x-2 rounded-lg bg-primary-container px-6 py-2.5 font-bold text-on-primary-container hover:bg-primary hover:text-white h-auto normal-case tracking-normal"
            >
              <Link href="/students/create">
                <span className="material-symbols-outlined text-sm">add</span>
                <span>Enroll New Student</span>
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
                {/* Header Row: Avatar + Name + Class + Actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 overflow-hidden border border-outline-variant/40">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <Users className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-headline-md text-base font-extrabold text-on-surface truncate">
                        {item.name}
                      </h4>
                      <p className="font-body-md text-xs text-on-surface-variant truncate">
                        Roll: {item.roll ?? "N/A"} • {item.academicClass?.name || "No Class"}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <Badge
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase border-0 shadow-none ${item.isOfflineStudent
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-emerald-500/10 text-emerald-600"
                          }`}
                        >
                          {item.isOfflineStudent ? "Offline" : "Online"}
                        </Badge>
                        <Badge
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase border-0 shadow-none ${item.userId
                            ? "bg-primary/10 text-primary"
                            : "bg-surface-variant text-on-surface-variant/70"
                          }`}
                        >
                          {item.userId ? "Linked" : "Standalone"}
                        </Badge>
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
                        onClick={() => onEdit ? onEdit(item) : (window.location.href = `/students/${item.id}/edit`)}
                        className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                      >
                        <Pen className="h-3.5 w-3.5" />
                        <span>Edit Info</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onDelete(item.id, item.name)}
                        disabled={isDeleting}
                        className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-error hover:bg-error-container/20"
                      >
                        <Trash className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Card Contact & School Info */}
                <div className="flex flex-col gap-1 text-xs text-outline bg-surface-container-lowest/50 rounded-lg p-2.5 border border-outline-variant/20">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">phone</span>
                    <span>{item.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">school</span>
                    <span className="truncate">{item.institute}</span>
                  </div>
                </div>

                {/* Card Footer Info */}
                <div className="flex items-center justify-between border-t border-outline-variant/20 pt-2 text-[10px] text-outline">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                    <span>
                      Registered {new Date(item.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <span>ID: {item.id.slice(0, 8)}...</span>
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
                    Student Info
                  </TableHead>
                  <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                    Class & Roll
                  </TableHead>
                  <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                    Contact & Phone
                  </TableHead>
                  <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                    Institute
                  </TableHead>
                  <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                    Status Badges
                  </TableHead>
                  <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-surface-container-low transition-all duration-200 ease-in-out group border-b border-outline-variant/30"
                  >
                    {/* Student Info */}
                    <TableCell className="py-5 group-hover:py-6 px-6 transition-all duration-200 ease-in-out">
                      <div className="flex items-center gap-3">
                        <div className="relative flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 overflow-hidden border border-outline-variant/30">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <Users className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-headline-md text-sm font-extrabold text-on-surface">
                            {item.name}
                          </h4>
                          <span className="text-[11px] font-mono text-outline leading-none">
                            ID: {item.id}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Class & Roll */}
                    <TableCell className="py-5 group-hover:py-6 px-6 transition-all duration-200 ease-in-out">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-body-md text-sm font-semibold text-on-surface">
                          {item.academicClass?.name || "No Class"}
                        </span>
                        <span className="text-xs text-outline">
                          Roll Number: {item.roll !== null ? item.roll : "Not Set"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Contact & Phone */}
                    <TableCell className="py-5 group-hover:py-6 px-6 transition-all duration-200 ease-in-out font-body-md text-sm text-on-surface-variant">
                      {item.phone}
                    </TableCell>

                    {/* Institute */}
                    <TableCell className="py-5 group-hover:py-6 px-6 transition-all duration-200 ease-in-out font-body-md text-sm text-on-surface-variant max-w-[200px] truncate" title={item.institute}>
                      {item.institute}
                    </TableCell>

                    {/* Status Badges */}
                    <TableCell className="py-5 group-hover:py-6 px-6 transition-all duration-200 ease-in-out">
                      <div className="flex items-center gap-2">
                        {/* Offline Indicator */}
                        <Badge
                          variant="outline"
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border-0 ${item.isOfflineStudent
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-emerald-500/10 text-emerald-600"
                          }`}
                        >
                          {item.isOfflineStudent ? "Offline" : "Online"}
                        </Badge>

                        {/* Linked Indicator */}
                        <Badge
                          variant="outline"
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border-0 ${item.userId
                            ? "bg-primary/10 text-primary"
                            : "bg-surface-variant text-on-surface-variant/70"
                          }`}
                        >
                          {item.userId ? "Linked" : "Standalone"}
                        </Badge>
                      </div>
                    </TableCell>

                    {/* Actions Dropdown */}
                    <TableCell className="py-5 group-hover:py-6 px-6 transition-all duration-200 ease-in-out text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high cursor-pointer h-8 w-8 inline-flex items-center justify-center shrink-0"
                            title="Actions"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border border-outline-variant shadow-md rounded-xl p-1.5 min-w-[140px] z-50">
                          <DropdownMenuItem
                            onClick={() => onEdit ? onEdit(item) : (window.location.href = `/students/${item.id}/edit`)}
                            className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                          >
                            <Pen className="h-3.5 w-3.5" />
                            <span>Edit Student</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDelete(item.id, item.name)}
                            disabled={isDeleting}
                            className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-error hover:bg-error-container/20"
                          >
                            <Trash className="h-3.5 w-3.5" />
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
                Showing <span className="font-bold">{displayStart}-{displayEnd}</span> of <span className="font-bold">{totalItems}</span> students
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
                  className={`size-8 sm:size-10 rounded-lg font-body-md text-xs sm:text-sm transition-colors ${currentPage === pageNum
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
