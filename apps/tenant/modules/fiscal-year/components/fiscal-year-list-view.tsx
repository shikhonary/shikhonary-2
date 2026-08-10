"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Badge } from "@workspace/ui/components/badge"
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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@workspace/ui/components/drawer"
import {
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Tag,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Pen,
  Info,
  Loader2,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  RotateCcw,
} from "lucide-react"

import { useFiscalYearSearchParams } from "../hooks/use-fiscal-year-search-params"

export function FiscalYearListView() {
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingItem, setDeletingItem] = useState<{ id: string; name: string } | null>(null)

  const [yearInput, setYearInput] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [isCurrent, setIsCurrent] = useState(false)

  // URL Search Params State (nuqs)
  const [searchParams, setSearchParams] = useFiscalYearSearchParams()
  const searchQuery = searchParams.search
  const sortFilter = searchParams.sort as "all" | "name_asc" | "name_desc" | "newest" | "oldest"

  const setSearchQuery = (val: string) => setSearchParams({ search: val })
  const setSortFilter = (val: any) => setSearchParams({ sort: val })

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const { data: fiscalYearData, isLoading, isError, refetch } = useQuery(
    trpc.tenantFiscalYear.list.queryOptions({
      limit: itemsPerPage * 5,
      search: searchQuery.trim() || undefined,
      sort: sortFilter === "all" ? undefined : sortFilter,
    })
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
    ...trpc.tenantFiscalYear.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.tenantFiscalYear.pathFilter())
      toast.success("অর্থবছর সফলভাবে তৈরি করা হয়েছে।")
      resetForm()
    },
    onError: (err: any) => {
      toast.error(err.message || "অর্থবছর তৈরি করতে ব্যর্থ হয়েছে")
    },
  })

  const updateMutation = useMutation({
    ...trpc.tenantFiscalYear.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.tenantFiscalYear.pathFilter())
      toast.success("অর্থবছর সফলভাবে আপডেট করা হয়েছে।")
      resetForm()
    },
    onError: (err: any) => {
      toast.error(err.message || "অর্থবছর আপডেট করতে ব্যর্থ হয়েছে")
    },
  })

  const deleteMutation = useMutation({
    ...trpc.tenantFiscalYear.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.tenantFiscalYear.pathFilter())
      toast.success(`অর্থবছর "${deletingItem?.name || ""}" সফলভাবে মুছে ফেলা হয়েছে।`)
      setDeletingItem(null)
    },
    onError: (err: any) => {
      toast.error(err.message || "অর্থবছর মুছতে ব্যর্থ হয়েছে")
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
      {/* Header — Purely Bangla Title & Action */}
      <section className="mb-6 sm:mb-8 flex flex-col justify-between gap-4 sm:gap-6 md:flex-row md:items-end">
        <div>
          <h2 className="mb-1 font-display text-2xl sm:text-3xl font-extrabold text-foreground md:text-4xl">
            অর্থবছর ব্যবস্থাপনা
          </h2>
          <p className="max-w-2xl font-body text-xs sm:text-sm md:text-base leading-relaxed text-muted-foreground">
            ইউনিয়ন পরিষদের বাৎসরিক অর্থবছর, শুরু ও শেষের তারিখ এবং বর্তমান সক্রিয় অর্থবছর পরিচালনা করুন।
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setShowCreateModal(true)
          }}
          className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 sm:py-3 font-display text-sm sm:text-base font-bold text-primary-foreground shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 cursor-pointer overflow-hidden h-auto"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 ease-out group-hover:rotate-90 group-hover:scale-110" />
          <span className="relative z-10">নতুন অর্থবছর যোগ করুন</span>
        </Button>
      </section>

      {/* Filter Bar — Matched with Admin App User Module Filter Layout */}
      <div className="space-y-3">
        {/* Primary Filter Toolbar */}
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xs p-3 sm:p-4">
          {/* Search Input Filter */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="অর্থবছরের নাম দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full rounded-xl border border-border bg-muted/30 py-2.5 pl-10 pr-4 font-body text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 h-10 transition-all"
            />
          </div>

          {/* Mobile Filter Drawer Button (Visible ONLY on mobile: md:hidden) */}
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                className="md:hidden flex items-center gap-2 h-10 px-3.5 bg-muted/30 border-border text-foreground text-xs font-medium shrink-0 rounded-xl cursor-pointer hover:bg-muted/50"
              >
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                {sortFilter !== "all" && (
                  <span className="flex size-4.5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                    1
                  </span>
                )}
              </Button>
            </DrawerTrigger>

            <DrawerContent className="p-0 border-t border-border bg-card shadow-2xl rounded-t-3xl overflow-hidden text-foreground">
              {/* Drawer Header Banner matching Tenant Green Theme */}
              <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-5 text-primary-foreground">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-primary-foreground shrink-0 shadow-sm">
                    <SlidersHorizontal className="h-5 w-5" />
                  </div>
                  <div>
                    <DrawerTitle className="font-display text-base font-bold text-primary-foreground">
                      ফিল্টার অ্যান্ড সর্ট
                    </DrawerTitle>
                    <DrawerDescription className="font-body text-xs text-primary-foreground/90 mt-0.5">
                      অর্থবছরের তালিকা অনুসারে সাজান ও অনুসন্ধান করুন
                    </DrawerDescription>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Stacked Filter Selects */}
                <div className="space-y-4 font-body">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 font-display">
                      <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                      সর্টিং ক্রম
                    </label>
                    <Select
                      value={sortFilter}
                      onValueChange={(val) => {
                        setSortFilter(val as any)
                        setCurrentPage(1)
                      }}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-body text-xs text-foreground h-11 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder="সকল বাছাই" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-border shadow-xl rounded-xl text-popover-foreground">
                        <SelectItem value="all">সকল বাছাই</SelectItem>
                        <SelectItem value="name_asc">অর্থবছরের নাম (ক-ক্ষ)</SelectItem>
                        <SelectItem value="name_desc">অর্থবছরের নাম (ক্ষ-ক)</SelectItem>
                        <SelectItem value="newest">সর্বশেষ যোগকৃত</SelectItem>
                        <SelectItem value="oldest">সর্বপ্রথম যোগকৃত</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DrawerFooter className="p-0 pt-3 flex flex-row items-center gap-3 border-t border-border/50">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setSearchQuery("")
                      setSortFilter("all")
                      setCurrentPage(1)
                    }}
                    className="flex-1 h-11 text-xs font-medium border-border text-foreground hover:bg-muted rounded-xl cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                    রিসেট
                  </Button>
                  <DrawerClose asChild>
                    <Button className="flex-1 h-11 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl cursor-pointer shadow-md shadow-primary/20">
                      ফিল্টার প্রয়োগ করুন
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>

          {/* Desktop Sort Filter Select (Visible ONLY on desktop: hidden md:flex) */}
          <div className="hidden md:flex items-center gap-3">
            <div className="min-w-[170px]">
              <Select
                value={sortFilter}
                onValueChange={(val) => {
                  setSortFilter(val as any)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-full rounded-xl border border-border bg-muted/30 py-2.5 px-3.5 font-body text-xs text-foreground h-10 justify-between hover:bg-muted/50 transition-all">
                  <div className="flex items-center gap-2 truncate">
                    <ArrowUpDown className="h-3.5 w-3.5 text-primary shrink-0" />
                    <SelectValue placeholder="সকল বাছাই" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border shadow-xl rounded-xl min-w-[180px] text-popover-foreground">
                  <SelectItem value="all">সকল বাছাই</SelectItem>
                  <SelectItem value="name_asc">অর্থবছরের নাম (ক-ক্ষ)</SelectItem>
                  <SelectItem value="name_desc">অর্থবছরের নাম (ক্ষ-ক)</SelectItem>
                  <SelectItem value="newest">সর্বশেষ যোগকৃত</SelectItem>
                  <SelectItem value="oldest">সর্বপ্রথম যোগকৃত</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Active Filter Badges & Reset Row */}
        {(Boolean(searchQuery.trim()) || sortFilter !== "all") && (
          <div className="flex flex-col gap-2.5 rounded-xl border border-border/40 bg-card/40 p-3 text-xs sm:flex-row sm:items-center sm:justify-between sm:bg-transparent sm:border-0 sm:p-0 sm:px-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="font-semibold text-muted-foreground text-[11px] sm:text-xs uppercase tracking-wider font-display">
                সক্রিয় ফিল্টার:
              </span>

              {/* Search Query Badge */}
              {Boolean(searchQuery.trim()) && (
                <Badge
                  variant="secondary"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-primary cursor-default max-w-[220px] truncate"
                >
                  <span className="truncate">খোঁজ: &quot;{searchQuery}&quot;</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("")
                      setCurrentPage(1)
                    }}
                    className="rounded-full p-0.5 hover:bg-primary/20 transition-colors cursor-pointer shrink-0"
                    title="অনুসন্ধান ফিল্টার সরান"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {/* Sort Filter Badge */}
              {sortFilter !== "all" && (
                <Badge
                  variant="secondary"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-primary cursor-default shrink-0"
                >
                  <span>
                    ক্রমানুসারে:{" "}
                    {sortFilter === "name_asc"
                      ? "অর্থবছরের নাম (ক-ক্ষ)"
                      : sortFilter === "name_desc"
                      ? "অর্থবছরের নাম (ক্ষ-ক)"
                      : sortFilter === "newest"
                      ? "সর্বশেষ যোগকৃত"
                      : "সর্বপ্রথম যোগকৃত"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSortFilter("all")
                      setCurrentPage(1)
                    }}
                    className="rounded-full p-0.5 hover:bg-primary/20 transition-colors cursor-pointer shrink-0"
                    title="সর্ট ফিল্টার সরান"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>

            {/* Reset All Button */}
            <div className="flex justify-end border-t border-border/30 pt-2 sm:border-0 sm:pt-0">
              <button
                type="button"
                onClick={() => {
                  setCurrentPage(1)
                  setSearchParams({ search: "", sort: "all" })
                }}
                className="cursor-pointer focus:outline-hidden"
                title="সকল সক্রিয় ফিল্টার রিসেট করুন"
              >
                <Badge
                  variant="outline"
                  className="inline-flex items-center gap-1 rounded-lg border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] sm:text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>সব রিসেট করুন</span>
                </Badge>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content Table & Mobile Card List View */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-card shadow-xs">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm font-body flex items-center justify-center gap-3">
            <RefreshCw className="h-5 w-5 animate-spin text-primary" />
            <span>অর্থবছরের তথ্য লোড হচ্ছে...</span>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-destructive">
            <p className="font-body font-medium">অর্থবছরের তালিকা পেতে সমস্যা হয়েছে।</p>
            <Button size="sm" variant="outline" onClick={() => refetch()} className="mt-3 border-white/10 hover:bg-white/[0.04]">
              পুনরায় চেষ্টা করুন
            </Button>
          </div>
        ) : allItems.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Calendar className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-foreground">কোনো অর্থবছর পাওয়া যায়নি</p>
            <p className="text-xs text-muted-foreground max-w-sm">
              {searchQuery || sortFilter !== "all"
                ? "ফিল্টার অনুযায়ী কোনো রেকর্ড পাওয়া যায়নি। অনুসন্ধান বা ফিল্টার রিসেট করুন।"
                : "বাজেট ও হিসাবরক্ষণ চক্র পরিচালনার জন্য প্রথম অর্থবছর (যেমন ২০২৫-২০২৬) যোগ করুন।"}
            </p>
            {searchQuery || sortFilter !== "all" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setSortFilter("all")
                }}
                className="mt-2 rounded-lg border-border text-foreground hover:bg-muted font-bold"
              >
                <RotateCcw className="h-4 w-4 mr-1" /> ফিল্টার রিসেট করুন
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  resetForm()
                  setShowCreateModal(true)
                }}
                className="mt-2 rounded-lg bg-primary text-primary-foreground font-bold"
              >
                <Plus className="h-4 w-4 mr-1" /> প্রথম অর্থবছর যোগ করুন
              </Button>
            )}
          </div>
        ) : (
          <div>
            {/* Mobile Card List View (< md) — Tenant App Theme Aligned */}
            <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:hidden">
              {pagedItems.map((fy) => (
                <div
                  key={fy.id}
                  className="group relative flex flex-col gap-3.5 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xs p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 border border-primary/20 shadow-xs">
                        <Calendar className="h-5.5 w-5.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-display text-base sm:text-lg font-extrabold text-primary font-mono truncate">
                          {fy.year}
                        </h4>
                        <div className="mt-1">
                          {fy.isCurrent ? (
                            <Badge className="bg-primary/10 text-primary border border-primary/25 shadow-none px-2.5 py-0.5 text-[10px] font-bold rounded-full inline-flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> বর্তমান অর্থবছর
                            </Badge>
                          ) : (
                            <Badge className="bg-muted/60 text-muted-foreground border border-border/40 shadow-none px-2.5 py-0.5 text-[10px] font-bold rounded-full">
                              আর্কাইভড
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
                          className="rounded-xl p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer h-9 w-9 shrink-0"
                          title="অ্যাকশন"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border border-border shadow-xl rounded-2xl p-1.5 min-w-[150px] text-popover-foreground">
                        <DropdownMenuItem
                          onClick={() => handleEdit(fy)}
                          className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted focus:bg-muted"
                        >
                          <Pen className="h-3.5 w-3.5 text-primary" />
                          <span>অর্থবছর সম্পাদনা</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingItem({ id: fy.id, name: fy.year })}
                          className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>মুছে ফেলুন</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-border/50 pt-3 text-xs text-muted-foreground">
                    <div className="bg-muted/20 rounded-xl p-2.5 border border-border/30">
                      <span className="text-[10px] font-semibold text-muted-foreground block font-display">শুরুর তারিখ</span>
                      <span className="font-bold text-foreground font-body mt-0.5 block">
                        {new Date(fy.startDate).toLocaleDateString("bn-BD", { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <div className="bg-muted/20 rounded-xl p-2.5 border border-border/30">
                      <span className="text-[10px] font-semibold text-muted-foreground block font-display">শেষের তারিখ</span>
                      <span className="font-bold text-foreground font-body mt-0.5 block">
                        {new Date(fy.endDate).toLocaleDateString("bn-BD", { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                    </div>
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
                      অর্থবছর
                    </TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs h-auto">
                      শুরুর তারিখ
                    </TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs h-auto">
                      শেষের তারিখ
                    </TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs h-auto">
                      স্ট্যাটাস
                    </TableHead>
                    <TableHead className="px-6 py-4 text-right font-semibold text-muted-foreground text-xs h-auto">
                      অ্যাকশন
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-white/[0.04]">
                  {pagedItems.map((fy) => (
                    <TableRow key={fy.id} className="hover:bg-white/[0.02] transition-all duration-200 ease-in-out group border-b border-white/[0.04]">
                      <TableCell className="py-4 group-hover:py-5 px-6 font-bold text-primary font-mono text-base transition-all duration-200 ease-in-out">
                        {fy.year}
                      </TableCell>
                      <TableCell className="py-4 group-hover:py-5 px-6 text-foreground transition-all duration-200 ease-in-out">
                        {new Date(fy.startDate).toLocaleDateString("bn-BD", { year: "numeric", month: "short", day: "numeric" })}
                      </TableCell>
                      <TableCell className="py-4 group-hover:py-5 px-6 text-foreground transition-all duration-200 ease-in-out">
                        {new Date(fy.endDate).toLocaleDateString("bn-BD", { year: "numeric", month: "short", day: "numeric" })}
                      </TableCell>
                      <TableCell className="py-4 group-hover:py-5 px-6 transition-all duration-200 ease-in-out">
                        {fy.isCurrent ? (
                          <Badge className="bg-primary/10 text-primary border border-primary/20 shadow-none px-2.5 py-0.5 text-[10px] font-bold rounded-full">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> বর্তমান অর্থবছর
                          </Badge>
                        ) : (
                          <Badge className="bg-white/[0.06] text-muted-foreground border-0 shadow-none px-2.5 py-0.5 text-[10px] font-bold rounded-full">
                            আর্কাইভড
                          </Badge>
                        )}
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
                          <DropdownMenuContent align="end" className="bg-popover border border-border shadow-xl rounded-2xl p-1.5 min-w-[150px] text-popover-foreground">
                            <DropdownMenuItem
                              onClick={() => handleEdit(fy)}
                              className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted focus:bg-muted"
                            >
                              <Pen className="h-3.5 w-3.5 text-primary" />
                              <span>অর্থবছর সম্পাদনা</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeletingItem({ id: fy.id, name: fy.year })}
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

            {/* Table Footer / Pagination — Aligned with Tenant App Theme Tokens */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/50 bg-card/60 backdrop-blur-xs px-4 sm:px-6 py-4">
              <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
                <p className="font-body text-xs sm:text-sm text-muted-foreground">
                  মোট <span className="font-bold text-foreground">{totalItems}</span> টির মধ্যে <span className="font-bold text-foreground">{displayStart}-{displayEnd}</span> দেখানো হচ্ছে
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
        )}
      </div>

      {/* Form Modal — Green Gradient Banner Theme matching Tenant App */}
      <Dialog open={showCreateModal} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="bg-card border border-white/[0.08] shadow-2xl rounded-2xl overflow-hidden text-foreground max-w-lg p-0">
          {/* Tenant App Signature Green Gradient Header Banner */}
          <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-6 text-primary-foreground">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-primary-foreground shrink-0 shadow-sm">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="font-display text-xl font-extrabold text-primary-foreground">
                  {editingId ? "অর্থবছর সম্পাদনা করুন" : "নতুন অর্থবছর যুক্ত করুন"}
                </DialogTitle>
                <DialogDescription className="font-body text-xs text-primary-foreground/90 mt-0.5">
                  অর্থবছরের শিরোনাম, সময়সীমা ও সক্রিয় স্ট্যাটাস নির্ধারণ করুন
                </DialogDescription>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Year Label */}
            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-muted-foreground">
                অর্থবছরের নাম
              </Label>
              <div className="relative group">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                <Input
                  value={yearInput}
                  onChange={(e) => setYearInput(e.target.value)}
                  placeholder="যেমন: ২০২৫-২০২৬ বা ২০২৬"
                  disabled={isSubmitting}
                  required
                  className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all"
                />
              </div>
            </div>

            {/* Start Date & End Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="block text-xs font-semibold text-muted-foreground">
                  শুরুর তারিখ
                </Label>
                <DatePicker
                  date={startDate}
                  setDate={setStartDate}
                  disabled={isSubmitting}
                  placeholder="তারিখ নির্বাচন করুন"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="block text-xs font-semibold text-muted-foreground">
                  শেষের তারিখ
                </Label>
                <DatePicker
                  date={endDate}
                  setDate={setEndDate}
                  disabled={isSubmitting}
                  placeholder="তারিখ নির্বাচন করুন"
                />
              </div>
            </div>

            {/* Checkbox Box with Green Tint */}
            <div className="flex items-center space-x-3 rounded-xl border border-primary/20 p-4 bg-primary/5">
              <input
                type="checkbox"
                id="isCurrent"
                checked={isCurrent}
                disabled={isSubmitting}
                onChange={(e) => setIsCurrent(e.target.checked)}
                className="size-4.5 rounded border-primary/30 bg-background text-primary focus:ring-primary cursor-pointer disabled:opacity-50"
              />
              <div className="grid gap-0.5 leading-none">
                <label
                  htmlFor="isCurrent"
                  className="text-xs font-bold text-foreground cursor-pointer flex items-center gap-1.5"
                >
                  <CheckSquare className="h-4 w-4 text-primary" />
                  বর্তমান সক্রিয় অর্থবছর হিসেবে সেট করুন
                </label>
                <p className="text-[11px] text-muted-foreground">
                  সক্রিয় করলে পূর্ববর্তী সক্রিয় অর্থবছরটি স্বয়ংক্রিয়ভাবে আর্কাইভ হবে।
                </p>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={resetForm}
                className="border-border text-foreground hover:bg-muted rounded-xl px-5 py-2.5 text-xs font-medium cursor-pointer"
              >
                বাতিল
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !yearInput.trim() || !startDate || !endDate}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl px-6 py-2.5 text-xs cursor-pointer shadow-md shadow-primary/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>সংরক্ষণ হচ্ছে...</span>
                  </div>
                ) : editingId ? (
                  "আপডেট করুন"
                ) : (
                  "সংরক্ষণ করুন"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal — Cleaned Header & Warning Box, Red Only on Submit Button */}
      <Dialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <DialogContent className="bg-card border border-white/[0.08] shadow-2xl rounded-2xl overflow-hidden text-foreground max-w-md p-0 gap-0">
          {/* Header Banner matching Tenant Theme */}
          <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-6 text-primary-foreground">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-primary-foreground shrink-0 shadow-sm">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="font-display text-lg font-bold text-primary-foreground">
                  অর্থবছর মুছে ফেলবেন?
                </DialogTitle>
                <DialogDescription className="font-body text-xs text-primary-foreground/90 mt-0.5">
                  এই প্রক্রিয়া নিশ্চিতকরণ আবশ্যক
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <p className="font-body text-sm leading-relaxed text-muted-foreground">
              আপনি কি নিশ্চিত যে আপনি{" "}
              <span className="font-bold text-foreground">
                &quot;{deletingItem?.name || "নির্বাচিত বছর"}&quot;
              </span>{" "}
              মুছে ফেলতে চান?
            </p>

            <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-3.5 text-xs text-muted-foreground">
              <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <p className="leading-snug">
                এই প্রক্রিয়াটি স্থায়ী এবং মুছে ফেলার পর পুনরায় ফিরিয়ে আনা যাবে না।
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                disabled={deleteMutation.isPending}
                onClick={() => setDeletingItem(null)}
                className="border-border text-foreground hover:bg-muted rounded-xl px-5 py-2.5 text-xs font-medium cursor-pointer"
              >
                বাতিল
              </Button>
              <Button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={handleConfirmDelete}
                className="bg-red-600 text-white hover:bg-red-700 font-bold rounded-xl px-6 py-2.5 text-xs cursor-pointer shadow-md shadow-red-600/20 disabled:opacity-50"
              >
                {deleteMutation.isPending ? (
                  <div className="flex items-center gap-1.5">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>মুছে ফেলা হচ্ছে...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Trash2 className="h-4 w-4" />
                    <span>অর্থবছর মুছুন</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
