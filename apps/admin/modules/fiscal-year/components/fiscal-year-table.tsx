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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import {
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  RefreshCw,
  MoreVertical,
  Pen,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

import { useCreateFiscalYearModalStore } from "../store/use-create-fiscal-year-modal-store"
import { useEditFiscalYearModalStore } from "../store/use-edit-fiscal-year-modal-store"

export interface FiscalYearItem {
  id: string
  year: string
  startDate: string | Date
  endDate: string | Date
  isCurrent: boolean
}

interface FiscalYearTableProps {
  items: FiscalYearItem[]
  isLoading: boolean
  isError: boolean
  onDelete: (id: string, name: string) => void
}

export function FiscalYearTable({
  items,
  isLoading,
  isError,
  onDelete,
}: FiscalYearTableProps) {
  const openCreateModal = useCreateFiscalYearModalStore((state) => state.openModal)
  const openEditModal = useEditFiscalYearModalStore((state) => state.openModal)

  return (
    <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-xs">
      {isLoading ? (
        <div className="p-8 text-center text-on-surface-variant text-sm font-body-md flex items-center justify-center gap-3">
          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
          <span>Loading fiscal years...</span>
        </div>
      ) : isError ? (
        <div className="p-8 text-center text-error">
          <p className="font-body-md font-medium">Failed to load fiscal years.</p>
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Calendar className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold text-on-surface">No fiscal years found.</p>
          <p className="text-xs text-on-surface-variant max-w-sm">
            Create a new fiscal year (e.g. 2026 or 2025-2026) to manage budget cycles.
          </p>
          <Button size="sm" onClick={openCreateModal} className="mt-2 rounded-lg bg-primary-container text-on-primary-container hover:bg-primary hover:text-white transition-colors font-bold">
            <Plus className="h-4 w-4 mr-1" /> Add First Fiscal Year
          </Button>
        </div>
      ) : (
        <div>
          {/* Mobile Card List View (< md) */}
          <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:hidden">
            {items.map((fy) => (
              <div
                key={fy.id}
                className="group relative flex flex-col gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-headline-md text-base font-extrabold text-primary font-mono truncate">
                        {fy.year}
                      </h4>
                      <div className="mt-1">
                        {fy.isCurrent ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-none px-2 py-0.5 text-[9px] uppercase font-bold rounded-full inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Active Current Year
                          </Badge>
                        ) : (
                          <Badge className="bg-surface-variant text-on-surface-variant border-0 shadow-none px-2 py-0.5 text-[9px] uppercase font-bold rounded-full">
                            Archived
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high cursor-pointer h-8 w-8 shrink-0"
                        title="Actions"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border border-outline-variant shadow-md rounded-xl p-1.5 min-w-[140px]">
                      <DropdownMenuItem
                        onClick={() => openEditModal(fy.id)}
                        className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                      >
                        <Pen className="h-3.5 w-3.5" />
                        <span>Edit Fiscal Year</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(fy.id, fy.year)}
                        className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-error hover:bg-error-container/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-outline-variant/20 pt-2.5 text-xs text-on-surface-variant">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-outline block">Start Date</span>
                    <span className="font-medium text-on-surface">
                      {new Date(fy.startDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-outline block">End Date</span>
                    <span className="font-medium text-on-surface">
                      {new Date(fy.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                  </div>
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
                    Fiscal Year
                  </TableHead>
                  <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                    Start Date
                  </TableHead>
                  <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                    End Date
                  </TableHead>
                  <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-4 text-right font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-outline-variant/30">
                {items.map((fy) => (
                  <TableRow key={fy.id} className="hover:bg-surface-container-low transition-all duration-200 ease-in-out group border-b border-outline-variant/30">
                    <TableCell className="py-4 group-hover:py-5 px-6 font-bold text-primary font-mono text-base transition-all duration-200 ease-in-out">
                      {fy.year}
                    </TableCell>
                    <TableCell className="py-4 group-hover:py-5 px-6 text-on-surface-variant transition-all duration-200 ease-in-out">
                      {new Date(fy.startDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </TableCell>
                    <TableCell className="py-4 group-hover:py-5 px-6 text-on-surface-variant transition-all duration-200 ease-in-out">
                      {new Date(fy.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </TableCell>
                    <TableCell className="py-4 group-hover:py-5 px-6 transition-all duration-200 ease-in-out">
                      {fy.isCurrent ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-none px-2.5 py-0.5 text-[10px] uppercase font-bold rounded-full">
                          <CheckCircle2 className="h-3 w-3 mr-1 inline" /> Active Current Year
                        </Badge>
                      ) : (
                        <Badge className="bg-surface-variant text-on-surface-variant border-0 shadow-none px-2.5 py-0.5 text-[10px] uppercase font-bold rounded-full">
                          Archived
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-4 group-hover:py-5 px-6 text-right transition-all duration-200 ease-in-out">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high cursor-pointer h-8 w-8"
                            title="Actions"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border border-outline-variant shadow-md rounded-xl p-1.5 min-w-[140px]">
                          <DropdownMenuItem
                            onClick={() => openEditModal(fy.id)}
                            className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                          >
                            <Pen className="h-3.5 w-3.5" />
                            <span>Edit Fiscal Year</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(fy.id, fy.year)}
                            className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-error hover:bg-error-container/20"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

        </div>
      )}
    </div>
  )
}
