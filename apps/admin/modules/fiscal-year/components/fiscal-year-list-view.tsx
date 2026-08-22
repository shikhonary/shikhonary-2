"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { DatePicker } from "@workspace/ui/components/date-picker"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Calendar, Plus, Trash2, CheckCircle2, RefreshCw, Tag, CheckSquare, ChevronLeft, ChevronRight, MoreVertical, Pen, AlertTriangle, Info, Loader2 } from "lucide-react"

export function FiscalYearListView() {
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingItem, setDeletingItem] = useState<{ id: string; name: string } | null>(null)

  const [yearInput, setYearInput] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [isCurrent, setIsCurrent] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const { data: fiscalYearData, isLoading, isError, refetch } = useQuery(
    trpc.fiscalYear.list.queryOptions({ limit: itemsPerPage * 5 })
  )

  const resetForm = () => {
    setShowCreateModal(false)
    setEditingId(null)
    setYearInput("")
    setStartDate(undefined)
    setEndDate(undefined)
    setIsCurrent(false)
  }

  const createMutation = useMutation({
    ...trpc.fiscalYear.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.fiscalYear.pathFilter())
      toast.success("Fiscal year created successfully.")
      resetForm()
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create fiscal year")
    },
  })

  const updateMutation = useMutation({
    ...trpc.fiscalYear.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.fiscalYear.pathFilter())
      toast.success("Fiscal year updated successfully.")
      resetForm()
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update fiscal year")
    },
  })

  const deleteMutation = useMutation({
    ...trpc.fiscalYear.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.fiscalYear.pathFilter())
      toast.success(`Fiscal year "${deletingItem?.name || ""}" deleted successfully.`)
      setDeletingItem(null)
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete fiscal year")
    },
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const handleEdit = (fy: any) => {
    setEditingId(fy.id)
    setYearInput(fy.year)
    setStartDate(new Date(fy.startDate))
    setEndDate(new Date(fy.endDate))
    setIsCurrent(fy.isCurrent)
    setShowCreateModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!startDate || !endDate) return

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        year: yearInput,
        startDate,
        endDate,
        isCurrent,
      })
    } else {
      createMutation.mutate({
        year: yearInput,
        startDate,
        endDate,
        isCurrent,
      })
    }
  }

  const handleConfirmDelete = () => {
    if (!deletingItem) return
    deleteMutation.mutate({ id: deletingItem.id })
  }

  const allItems = fiscalYearData?.fiscalYears ?? []
  const totalItems = allItems.length
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1
  const displayStart = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
  const displayEnd = Math.min(currentPage * itemsPerPage, totalItems)
  const pagedItems = allItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="w-full space-y-6">
      {/* Header — Matched with User Module Header */}
      <section className="mb-6 sm:mb-8 flex flex-col justify-between gap-4 sm:gap-6 md:flex-row md:items-end">
        <div>
          <h2 className="mb-1 font-headline-md text-2xl sm:text-3xl font-extrabold text-primary md:text-4xl">
            Fiscal Year Management
          </h2>
          <p className="max-w-2xl font-body-md text-xs sm:text-sm md:text-base leading-relaxed text-on-surface-variant">
            Manage annual financial and administrative periods across all school portals.
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setShowCreateModal(true)
          }}
          className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary-container px-6 py-2.5 sm:py-3 font-headline-md text-sm sm:text-base font-bold text-on-primary-container shadow-sm hover:shadow-md hover:shadow-primary/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 hover:bg-primary hover:text-white h-auto normal-case tracking-normal cursor-pointer overflow-hidden"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 ease-out group-hover:rotate-90 group-hover:scale-110" />
          <span className="relative z-10">Add Fiscal Year</span>
        </Button>
      </section>

      {/* Content Table & Mobile Card List View — Matched with User Data Table */}
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
        ) : allItems.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Calendar className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-on-surface">No fiscal years found.</p>
            <p className="text-xs text-on-surface-variant max-w-sm">
              Create a new fiscal year (e.g. 2026 or 2025-2026) to manage budget cycles.
            </p>
            <Button size="sm" onClick={() => { resetForm(); setShowCreateModal(true); }} className="mt-2 rounded-lg bg-primary-container text-on-primary-container hover:bg-primary hover:text-white transition-colors font-bold">
              <Plus className="h-4 w-4 mr-1" /> Add First Fiscal Year
            </Button>
          </div>
        ) : (
          <div>
            {/* Mobile Card List View (< md) */}
            <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:hidden">
              {pagedItems.map((fy) => (
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
                          onClick={() => handleEdit(fy)}
                          className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                        >
                          <Pen className="h-3.5 w-3.5" />
                          <span>Edit Fiscal Year</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingItem({ id: fy.id, name: fy.year })}
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
                  {pagedItems.map((fy) => (
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
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Active Current Year
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
                              onClick={() => handleEdit(fy)}
                              className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                            >
                              <Pen className="h-3.5 w-3.5" />
                              <span>Edit Fiscal Year</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeletingItem({ id: fy.id, name: fy.year })}
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

            {/* Table Footer / Pagination — Matched with User Module */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-outline-variant bg-surface-container-low px-4 sm:px-6 py-4">
              <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
                <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
                  Showing <span className="font-bold">{displayStart}-{displayEnd}</span> of <span className="font-bold">{totalItems}</span> fiscal years
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-outline font-medium">Rows per page:</span>
                  <Select
                    value={String(itemsPerPage)}
                    onValueChange={(val) => {
                      setItemsPerPage(Number(val) || 10)
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="h-8 rounded-lg border border-outline-variant bg-white px-2.5 font-body-md text-xs w-auto gap-1">
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
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className="size-8 sm:size-10 rounded-lg border border-outline-variant transition-colors hover:bg-surface-container-high disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "ghost"}
                    onClick={() => setCurrentPage(pageNum)}
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
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className="size-8 sm:size-10 rounded-lg border border-outline-variant transition-colors hover:bg-surface-container-high disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal — Reset form after creating / updating */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-lg overflow-hidden rounded-xl border border-outline-variant bg-white p-0 shadow-xl ring-0 animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="border-b border-outline-variant/40 bg-surface-container-lowest p-6 flex flex-row items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="font-headline-md text-xl font-extrabold text-on-surface normal-case tracking-normal">
                  {editingId ? "Edit Fiscal Year" : "Fiscal Year Details"}
                </CardTitle>
                <p className="text-xs font-body-md text-on-surface-variant mt-0.5">
                  Configure financial year label, duration, and active status
                </p>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Year Label */}
                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Fiscal Year Label
                  </Label>
                  <div className="group relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors h-4.5 w-4.5" />
                    <Input
                      value={yearInput}
                      onChange={(e) => setYearInput(e.target.value)}
                      placeholder="e.g. 2026 or 2025-2026"
                      disabled={isSubmitting}
                      required
                      className="w-full rounded-lg border border-outline-variant py-2.5 pl-10 pr-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Start Date & End Date using shadcn Date Picker */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Start Date
                    </Label>
                    <DatePicker
                      date={startDate}
                      setDate={setStartDate}
                      disabled={isSubmitting}
                      placeholder="Select start date"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      End Date
                    </Label>
                    <DatePicker
                      date={endDate}
                      setDate={setEndDate}
                      disabled={isSubmitting}
                      placeholder="Select end date"
                    />
                  </div>
                </div>

                {/* Checkbox */}
                <div className="flex items-center space-x-3 rounded-lg border border-outline-variant/40 p-3 bg-surface-container-low">
                  <input
                    type="checkbox"
                    id="isCurrent"
                    checked={isCurrent}
                    disabled={isSubmitting}
                    onChange={(e) => setIsCurrent(e.target.checked)}
                    className="size-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="grid gap-0.5 leading-none">
                    <label
                      htmlFor="isCurrent"
                      className="text-xs font-bold text-on-surface cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckSquare className="h-3.5 w-3.5 text-primary" />
                      Set as Current Active Fiscal Year
                    </label>
                    <p className="text-[11px] text-on-surface-variant">
                      Will automatically archive previous active fiscal year.
                    </p>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-outline-variant">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={resetForm}
                    className="rounded-lg border border-outline px-6 py-2.5 font-bold text-primary hover:bg-surface-container-low transition-all cursor-pointer h-auto text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !yearInput.trim() || !startDate || !endDate}
                    className="rounded-lg bg-primary-container px-8 py-2.5 font-bold text-on-primary-container shadow-md hover:bg-primary hover:text-white transition-all cursor-pointer h-auto text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving...</span>
                      </div>
                    ) : editingId ? (
                      "Update Fiscal Year"
                    ) : (
                      "Save Fiscal Year"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal — Matched with DeleteRoleModal */}
      <Dialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <DialogContent
          showCloseButton={false}
          style={{ minWidth: "320px", maxWidth: "480px", width: "calc(100vw - 2rem)" }}
          className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-white p-5 sm:p-6 shadow-xl text-left gap-4"
        >
          {/* Warning Header Icon */}
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-red-500/10 text-red-600 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="font-headline-md text-lg font-bold tracking-tight text-on-surface normal-case">
                Delete Fiscal Year?
              </DialogTitle>
              <p className="text-xs text-outline mt-0.5">
                This action requires confirmation
              </p>
            </div>
          </div>

          {/* Description */}
          <DialogHeader className="pt-1">
            <DialogDescription className="font-body-md text-sm leading-relaxed text-on-surface-variant">
              Are you sure you want to delete{" "}
              <span className="font-bold text-on-surface">
                &quot;{deletingItem?.name || "selected year"}&quot;
              </span>
              ? All administrative reports and tracking assigned to this fiscal year will no longer match.
            </DialogDescription>
          </DialogHeader>

          {/* Informational Alert Box */}
          <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-700">
            <Info className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            <p className="leading-snug">
              This process is permanent and cannot be undone. Please ensure no active budget processes depend on this fiscal year.
            </p>
          </div>

          {/* Actions Footer */}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={deleteMutation.isPending}
              onClick={() => setDeletingItem(null)}
              className="w-full sm:w-auto rounded-lg border border-outline-variant px-5 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer h-10 normal-case tracking-normal"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={handleConfirmDelete}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 cursor-pointer h-10 normal-case tracking-normal disabled:opacity-50"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Fiscal Year</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
