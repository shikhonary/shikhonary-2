"use client"

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  MapPin,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Pen,
} from "lucide-react"

import { useWardModalStore } from "../store/use-ward-modal-store"
import { useDeleteWardModalStore } from "../store/use-delete-ward-modal-store"

interface WardListProps {
  pagedItems: any[]
  isLoading: boolean
  isError: boolean
  refetch: () => any
  totalItems: number
  displayStart: number
  displayEnd: number
  currentPage: number
  totalPages: number
  itemsPerPage: number
  setItemsPerPage: (val: number) => void
  setCurrentPage: (val: number) => void
}

export function WardList({
  pagedItems,
  isLoading,
  isError,
  refetch,
  totalItems,
  displayStart,
  displayEnd,
  currentPage,
  totalPages,
  itemsPerPage,
  setItemsPerPage,
  setCurrentPage,
}: WardListProps) {
  const { openModal: openEditModal } = useWardModalStore()
  const { openModal: openDeleteModal } = useDeleteWardModalStore()

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm font-body flex items-center justify-center gap-3">
        <RefreshCw className="h-5 w-5 animate-spin text-primary" />
        <span>ওয়ার্ডের তথ্য লোড হচ্ছে...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-destructive">
        <p className="font-body font-medium">ওয়ার্ডের তালিকা পেতে সমস্যা হয়েছে।</p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => refetch()}
          className="mt-3 border-white/10 hover:bg-white/[0.04]"
        >
          পুনরায় চেষ্টা করুন
        </Button>
      </div>
    )
  }

  if (pagedItems.length === 0) {
    return null // Handled in views wrapper for empty state
  }

  return (
    <div>
      {/* Mobile Card List View (< md) */}
      <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:hidden">
        {pagedItems.map((ward) => (
          <div
            key={ward.id}
            className="group relative flex flex-col gap-3.5 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xs p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 border border-primary/20 shadow-xs">
                  <MapPin className="h-5.5 w-5.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-display text-base sm:text-lg font-extrabold text-foreground truncate">
                    {ward.nameBn}
                  </h4>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
                    {ward.name}
                  </p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer h-9 w-9 shrink-0"
                    title="অ্যাকশন"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-popover border border-border shadow-xl rounded-2xl p-1.5 min-w-[150px] text-popover-foreground"
                >
                  <DropdownMenuItem
                    onClick={() => openEditModal(ward)}
                    className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted focus:bg-muted"
                  >
                    <Pen className="h-3.5 w-3.5 text-primary" />
                    <span>ওয়ার্ড সম্পাদনা</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => openDeleteModal(ward.id, ward.nameBn)}
                    className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>মুছে ফেলুন</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="border-t border-border/50 pt-2.5 text-xs text-muted-foreground flex items-center justify-between">
              <span className="text-[10px] font-semibold text-muted-foreground font-display">তৈরির তারিখ</span>
              <span className="font-bold text-foreground font-body">
                {new Date(ward.createdAt).toLocaleDateString("bn-BD", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block">
        <Table className="w-full text-left font-body">
          <TableHeader className="bg-white/[0.02] border-b border-white/[0.05]">
            <TableRow className="border-b border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.02]">
              <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs h-auto">
                ওয়ার্ডের নাম (বাংলা)
              </TableHead>
              <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs h-auto">
                Name (English)
              </TableHead>
              <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs h-auto">
                তৈরির তারিখ
              </TableHead>
              <TableHead className="px-6 py-4 text-right font-semibold text-muted-foreground text-xs h-auto">
                অ্যাকশন
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-white/[0.04]">
            {pagedItems.map((ward) => (
              <TableRow
                key={ward.id}
                className="hover:bg-white/[0.02] transition-all duration-200 ease-in-out group border-b border-white/[0.04]"
              >
                <TableCell className="py-4 group-hover:py-5 px-6 font-bold text-foreground font-display text-base transition-all duration-200 ease-in-out">
                  {ward.nameBn}
                </TableCell>
                <TableCell className="py-4 group-hover:py-5 px-6 font-medium text-muted-foreground font-mono text-sm transition-all duration-200 ease-in-out">
                  {ward.name}
                </TableCell>
                <TableCell className="py-4 group-hover:py-5 px-6 text-foreground transition-all duration-200 ease-in-out">
                  {new Date(ward.createdAt).toLocaleDateString("bn-BD", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </TableCell>
                <TableCell className="py-4 group-hover:py-5 px-6 text-right transition-all duration-200 ease-in-out">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-lg p-2 text-muted-foreground hover:bg-white/[0.04] cursor-pointer h-8 w-8"
                        title="অ্যাকশন"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-popover border border-border shadow-xl rounded-2xl p-1.5 min-w-[150px] text-popover-foreground"
                    >
                      <DropdownMenuItem
                        onClick={() => openEditModal(ward)}
                        className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted focus:bg-muted"
                      >
                        <Pen className="h-3.5 w-3.5 text-primary" />
                        <span>ওয়ার্ড সম্পাদনা</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openDeleteModal(ward.id, ward.nameBn)}
                        className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/50 bg-card/60 backdrop-blur-xs px-4 sm:px-6 py-4">
        <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
          <p className="font-body text-xs sm:text-sm text-muted-foreground">
            মোট <span className="font-bold text-foreground">{totalItems}</span> টির মধ্যে{" "}
            <span className="font-bold text-foreground">
              {displayStart}-{displayEnd}
            </span>{" "}
            দেখানো হচ্ছে
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">প্রতি পেজে:</span>
            <Select
              value={String(itemsPerPage)}
              onValueChange={(val) => {
                setItemsPerPage(Number(val) || 10)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="h-8 rounded-lg border border-border bg-muted/30 px-3 text-xs w-auto gap-1.5 text-foreground hover:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 transition-all">
                <SelectValue placeholder="প্রতি পেজে" />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border shadow-xl rounded-xl min-w-[90px] text-popover-foreground">
                <SelectItem value="5">৫</SelectItem>
                <SelectItem value="10">১০</SelectItem>
                <SelectItem value="20">২০</SelectItem>
                <SelectItem value="50">৫০</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="size-8 sm:size-9 rounded-lg border border-border/60 bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? "default" : "ghost"}
              onClick={() => setCurrentPage(pageNum)}
              className={`size-8 sm:size-9 rounded-lg text-xs font-bold transition-all ${
                currentPage === pageNum
                  ? "bg-primary text-primary-foreground font-extrabold shadow-sm shadow-primary/20 hover:bg-primary/90"
                  : "border border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {pageNum}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            className="size-8 sm:size-9 rounded-lg border border-border/60 bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
