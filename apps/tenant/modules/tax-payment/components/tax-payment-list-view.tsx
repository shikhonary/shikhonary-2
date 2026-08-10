"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coins,
  CreditCard,
  Building2,
  Eye,
  Loader2,
  MapPin,
  MoreVertical,
  Phone,
  Plus,
  Printer,
  Receipt,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  User,
  X,
} from "lucide-react"


import { TaxPaymentModal } from "./tax-payment-modal"
import { TaxReceiptModal } from "./tax-receipt-modal"
import { useTaxPaymentSearchParams } from "../hooks/use-tax-payment-search-params"

export function TaxPaymentListView() {
  const queryClient = useQueryClient()
  const searchParamsHook = useSearchParams()
  const hasNewParam = searchParamsHook.get("new") === "true"

  const [showPaymentModal, setShowPaymentModal] = useState(false)

  useEffect(() => {
    if (hasNewParam) {
      setShowPaymentModal(true)
    }
  }, [hasNewParam])
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<any>(null)
  const [deletingPayment, setDeletingPayment] = useState<any>(null)

  // URL Search Params State (nuqs)
  const [searchParams, setSearchParams] = useTaxPaymentSearchParams()
  const searchQuery = searchParams.search
  const fiscalYearFilter = searchParams.fiscalYearId
  const wardFilter = searchParams.wardId
  const statusFilter = searchParams.status

  const setSearchQuery = (val: string) => setSearchParams({ search: val })
  const setFiscalYearFilter = (val: string) => setSearchParams({ fiscalYearId: val })
  const setWardFilter = (val: string) => setSearchParams({ wardId: val })
  const setStatusFilter = (val: "all" | "paid" | "unpaid") => setSearchParams({ status: val })

  const [preselectedTaxPayer, setPreselectedTaxPayer] = useState<any>(null)

  // Fetch Fiscal Years for filter
  const { data: fiscalYearsData } = useQuery(
    trpc.tenantFiscalYear.list.queryOptions({ limit: 100 })
  )
  const fiscalYears = fiscalYearsData?.fiscalYears || []

  // Fetch Wards
  const { data: wardsData } = useQuery(
    trpc.tenantWard.list.queryOptions({ limit: 100 })
  )
  const wards = wardsData?.wards || []

  // Fetch Collection Stats
  const { data: stats } = useQuery(
    trpc.taxPayment.stats.queryOptions({
      fiscalYearId: fiscalYearFilter === "all" ? undefined : fiscalYearFilter,
      wardId: wardFilter === "all" ? undefined : wardFilter,
    })
  )

  // Fetch Payments List
  const { data: paymentsData, isLoading } = useQuery(
    trpc.taxPayment.list.queryOptions({
      limit: 100,
      search: searchQuery.trim() || undefined,
      fiscalYearId: fiscalYearFilter === "all" ? undefined : fiscalYearFilter,
      wardId: wardFilter === "all" ? undefined : wardFilter,
      status: statusFilter,
    })
  )
  const payments = paymentsData?.payments || []

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Client-Side Pagination Calculations
  const totalItems = payments.length
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1
  const pagedItems = payments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const displayStart = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const displayEnd = Math.min(currentPage * itemsPerPage, totalItems)

  // Delete Payment Mutation
  const deleteMutation = useMutation({
    ...trpc.taxPayment.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.taxPayment.pathFilter())
      queryClient.invalidateQueries(trpc.taxPayer.pathFilter())
      toast.success("কর পরিশোধের রেকর্ড সফলভাবে মুছে ফেলা হয়েছে।")
      setDeletingPayment(null)
    },
    onError: (err: any) => {
      toast.error(err.message || "রেকর্ড মুছতে ব্যর্থ হয়েছে")
    },
  })

  const resetFilters = () => {
    setSearchParams({
      search: "",
      fiscalYearId: "all",
      wardId: "all",
      status: "all",
    })
  }

  return (
    <div className="w-full space-y-6 font-body">
      {/* Header — Section Title & Primary CTA */}
      <section className="mb-6 sm:mb-8 flex flex-col justify-between gap-4 sm:gap-6 md:flex-row md:items-end">
        <div>
          <h2 className="mb-1 font-display text-2xl sm:text-3xl font-extrabold text-foreground md:text-4xl">
            হোল্ডিং কর আদায় ও রসিদ রেজিস্টার
          </h2>
          <p className="max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed text-muted-foreground">
            ইউনিয়ন পরিষদের বাৎসরিক কর সংগ্রহের রসিদ তৈরি, নথিভুক্তকরণ ও হিসাবনিকাশ পরিচালনা করুন।
          </p>
        </div>
        <Button
          onClick={() => setShowPaymentModal(true)}
          className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 sm:py-3 font-display text-sm sm:text-base font-bold text-white shadow-md hover:shadow-lg hover:shadow-emerald-600/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 cursor-pointer overflow-hidden h-auto"
        >
          <Coins className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 ease-out group-hover:scale-110" />
          <span className="relative z-10">নতুন কর আদায় নথিভুক্ত করুন</span>
        </Button>
      </section>


      {/* Stats Cards Section */}
      <div className="mb-6">
        {/* Mobile View (< sm): Compact Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:hidden">
          <Badge variant="outline" className="rounded-md border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 normal-case tracking-normal">
            আদায়কৃত: ৳{stats?.totalCollectedAmount?.toLocaleString() || 0}
          </Badge>
          <Badge variant="outline" className="rounded-md border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 normal-case tracking-normal">
            অনাদায়ী: ৳{stats?.totalPendingAmount?.toLocaleString() || 0}
          </Badge>
          <Badge variant="outline" className="rounded-md border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary normal-case tracking-normal">
            মোট দাবি: {stats?.totalCount || 0} টি
          </Badge>
          <Badge variant="outline" className="rounded-md border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 normal-case tracking-normal">
            গড় আদায়: ৳{stats?.averagePaymentAmount?.toLocaleString() || 0}
          </Badge>
        </div>

        {/* Desktop & Tablet View (>= sm): 4-Column Cards */}
        <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Demand Count */}
          <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <Receipt className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                মোট বাৎসরিক কর দাবি
              </p>
              <h3 className="text-2xl font-bold text-foreground">
                {stats?.totalCount?.toLocaleString() || 0} টি
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                পরিশোধিত: {stats?.paidCount || 0}, অনাদায়ী: {stats?.unpaidCount || 0}
              </p>
            </div>
          </div>

          {/* Total Collected Tax */}
          <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                আদায়কৃত হোল্ডিং কর
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-emerald-600">
                  ৳{stats?.totalCollectedAmount?.toLocaleString() || 0}
                </h3>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {stats?.paidCount || 0} টি পরিশোধিত দাবি থেকে সংগৃহীত
              </p>
            </div>
          </div>

          {/* Pending Unpaid Demand */}
          <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                অনাদায়ী / অপরিশোধিত কর
              </p>
              <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                ৳{stats?.totalPendingAmount?.toLocaleString() || 0}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {stats?.unpaidCount || 0} টি কর দাবি অপরিশোধিত রয়েছে
              </p>
            </div>
          </div>

          {/* Average Collection */}
          <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                গড় আদায় (প্রতি রসিদ)
              </p>
              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ৳{stats?.averagePaymentAmount?.toLocaleString() || 0}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                পরিশোধিত প্রতিটি রসিদের গড় পরিমাণ
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* Filter Bar — Matched with Ward Module Filter Layout */}
      <div className="space-y-3">
        {/* Primary Filter Toolbar */}
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xs p-3 sm:p-4">
          {/* Search Input Filter */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="করদাতার নাম, ফোন, গ্রাম বা NID টাইপ করুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/30 py-2.5 pl-10 pr-4 font-body text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 h-10 transition-all"
            />
          </div>

          {/* Mobile Filter Drawer Button (md:hidden) */}
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                className="md:hidden flex items-center gap-2 h-10 px-3.5 bg-muted/30 border-border text-foreground text-xs font-medium shrink-0 rounded-xl cursor-pointer hover:bg-muted/50"
              >
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                {(fiscalYearFilter !== "all" || wardFilter !== "all" || statusFilter !== "all") && (
                  <span className="flex size-4.5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                    {(fiscalYearFilter !== "all" ? 1 : 0) + (wardFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0)}
                  </span>
                )}
              </Button>
            </DrawerTrigger>

            <DrawerContent className="p-0 border-t border-border bg-card shadow-2xl rounded-t-3xl overflow-hidden text-foreground">
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
                      রসিদ রেজিস্টার অবস্থা, অর্থবছর ও ওয়ার্ড অনুযায়ী ফিল্টার করুন
                    </DrawerDescription>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-4 font-body">
                  {/* Status Filter */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 font-display">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      আদায়ের অবস্থা
                    </label>
                    <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
                      <SelectTrigger className="w-full rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-body text-xs text-foreground h-11 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder="সকল অবস্থা" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-border shadow-xl rounded-xl text-popover-foreground">
                        <SelectItem value="all">সকল অবস্থা ({stats?.totalCount || 0})</SelectItem>
                        <SelectItem value="paid">পরিশোধিত ({stats?.paidCount || 0})</SelectItem>
                        <SelectItem value="unpaid">অনাদায়ী/অপরিশোধিত ({stats?.unpaidCount || 0})</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Fiscal Year Filter */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 font-display">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      অর্থবছর নির্বাচন
                    </label>
                    <Select value={fiscalYearFilter} onValueChange={setFiscalYearFilter}>
                      <SelectTrigger className="w-full rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-body text-xs text-foreground h-11 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder="সকল অর্থবছর" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-border shadow-xl rounded-xl text-popover-foreground">
                        <SelectItem value="all">সকল অর্থবছর</SelectItem>
                        {fiscalYears.map((fy: any) => (
                          <SelectItem key={fy.id} value={fy.id}>
                            {fy.year} {fy.isCurrent ? "(চলতি)" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Ward Filter */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 font-display">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      ওয়ার্ড নির্বাচন
                    </label>
                    <Select value={wardFilter} onValueChange={setWardFilter}>
                      <SelectTrigger className="w-full rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-body text-xs text-foreground h-11 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder="সকল ওয়ার্ড" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-border shadow-xl rounded-xl text-popover-foreground">
                        <SelectItem value="all">সকল ওয়ার্ড</SelectItem>
                        {wards.map((w: any) => (
                          <SelectItem key={w.id} value={w.id}>
                            {w.nameBn || w.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DrawerFooter className="p-0 pt-3 flex flex-row items-center gap-3 border-t border-border/50">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={resetFilters}
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

          {/* Desktop Filters (hidden md:flex) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Fiscal Year Select */}
            <div className="min-w-[160px]">
              <Select value={fiscalYearFilter} onValueChange={setFiscalYearFilter}>
                <SelectTrigger className="w-full rounded-xl border border-border bg-muted/30 py-2.5 px-3.5 font-body text-xs text-foreground h-10 justify-between hover:bg-muted/50 transition-all">
                  <div className="flex items-center gap-2 truncate">
                    <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                    <SelectValue placeholder="সকল অর্থবছর" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border shadow-xl rounded-xl min-w-[170px] text-popover-foreground">
                  <SelectItem value="all">সকল অর্থবছর</SelectItem>
                  {fiscalYears.map((fy: any) => (
                    <SelectItem key={fy.id} value={fy.id}>
                      {fy.year} {fy.isCurrent ? "(চলতি)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ward Select */}
            <div className="min-w-[150px]">
              <Select value={wardFilter} onValueChange={setWardFilter}>
                <SelectTrigger className="w-full rounded-xl border border-border bg-muted/30 py-2.5 px-3.5 font-body text-xs text-foreground h-10 justify-between hover:bg-muted/50 transition-all">
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <SelectValue placeholder="সকল ওয়ার্ড" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border shadow-xl rounded-xl min-w-[160px] text-popover-foreground">
                  <SelectItem value="all">সকল ওয়ার্ড</SelectItem>
                  {wards.map((w: any) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.nameBn || w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Select */}
            <div className="min-w-[160px]">
              <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
                <SelectTrigger className="w-full rounded-xl border border-border bg-muted/30 py-2.5 px-3.5 font-body text-xs text-foreground h-10 justify-between hover:bg-muted/50 transition-all">
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <SelectValue placeholder="সকল অবস্থা" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border shadow-xl rounded-xl min-w-[170px] text-popover-foreground">
                  <SelectItem value="all">সকল অবস্থা ({stats?.totalCount || 0})</SelectItem>
                  <SelectItem value="paid">পরিশোধিত ({stats?.paidCount || 0})</SelectItem>
                  <SelectItem value="unpaid">অনাদায়ী ({stats?.unpaidCount || 0})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Active Filter Badges & Reset Row */}
        {(Boolean(searchQuery.trim()) || fiscalYearFilter !== "all" || wardFilter !== "all" || statusFilter !== "all") && (
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
                    onClick={() => setSearchQuery("")}
                    className="rounded-full p-0.5 hover:bg-primary/20 transition-colors cursor-pointer shrink-0"
                    title="অনুসন্ধান সরান"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {/* Status Badge */}
              {statusFilter !== "all" && (
                <Badge
                  variant="secondary"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-primary cursor-default shrink-0"
                >
                  <span>
                    অবস্থা: {statusFilter === "paid" ? "পরিশোধিত" : "অনাদায়ী"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("all")}
                    className="rounded-full p-0.5 hover:bg-primary/20 transition-colors cursor-pointer shrink-0"
                    title="অবস্থা ফিল্টার সরান"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {/* Fiscal Year Badge */}
              {fiscalYearFilter !== "all" && (
                <Badge
                  variant="secondary"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-primary cursor-default shrink-0"
                >
                  <span>
                    অর্থবছর: {fiscalYears.find((fy: any) => fy.id === fiscalYearFilter)?.year || "নির্বাচিত অর্থবছর"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFiscalYearFilter("all")}
                    className="rounded-full p-0.5 hover:bg-primary/20 transition-colors cursor-pointer shrink-0"
                    title="অর্থবছর ফিল্টার সরান"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {/* Ward Filter Badge */}
              {wardFilter !== "all" && (
                <Badge
                  variant="secondary"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-primary cursor-default shrink-0"
                >
                  <span>
                    ওয়ার্ড: {wards.find((w: any) => w.id === wardFilter)?.nameBn || "নির্বাচিত ওয়ার্ড"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setWardFilter("all")}
                    className="rounded-full p-0.5 hover:bg-primary/20 transition-colors cursor-pointer shrink-0"
                    title="ওয়ার্ড ফিল্টার সরান"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-7 text-[11px] sm:text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg shrink-0"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              সকল ফিল্টার রিসেট
            </Button>
          </div>
        )}
      </div>


      {/* Main Payment Register Table & Mobile Card View Container — Matched with Tax Payer Module */}
      <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xs shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold">কোনো কর আদায় রসিদ বা অনাদায়ী দাবি পাওয়া যায়নি</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              নতুন কর আদায় নথিভুক্ত করুন বোতামে ক্লিক করে কর সংগ্রহের হিসাব যোগ করুন।
            </p>
          </div>
        ) : (
          <div>
            {/* Mobile Card List View (< md) */}
            <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:hidden">
              {pagedItems.map((pm: any) => {
                const isPaid = pm.paymentMethod !== null && pm.paymentMethod !== ""

                return (
                  <div
                    key={pm.id}
                    className="group relative flex flex-col gap-3.5 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xs p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 border border-primary/20 shadow-xs">
                          <User className="h-5.5 w-5.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 shrink-0">
                              #{pm.taxPayer?.holding}
                            </span>
                            <h4 className="font-display text-base font-extrabold text-foreground truncate">
                              {pm.taxPayer?.name}
                            </h4>
                          </div>
                          {pm.taxPayer?.fatherName && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate font-body">
                              পিতা: {pm.taxPayer.fatherName}
                            </p>
                          )}
                          <p className="text-[11px] text-muted-foreground/80 mt-0.5 font-mono">
                            রসিদ/দাবি: <span className="font-bold text-foreground">{pm.receiptNo || "N/A"}</span>
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
                        <DropdownMenuContent align="end" className="bg-popover border border-border shadow-xl rounded-2xl p-1.5 min-w-[160px] text-popover-foreground">
                          {isPaid ? (
                            <DropdownMenuItem asChild>
                              <Link href={`/print/tax-collection/receipt/${pm.id}`} className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-500/10 focus:bg-emerald-500/10">
                                <Printer className="h-3.5 w-3.5" />
                                <span>রসিদ প্রিন্ট করুন</span>
                              </Link>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => {
                                setPreselectedTaxPayer(pm.taxPayer)
                                setShowPaymentModal(true)
                              }}
                              className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-500/10 focus:bg-emerald-500/10"
                            >
                              <Coins className="h-3.5 w-3.5" />
                              <span>কর আদায় করুন</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => setDeletingPayment(pm)}
                            className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>মুছে ফেলুন</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2.5 border-t border-border/50">
                      <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{pm.taxPayer?.ward?.nameBn || pm.taxPayer?.ward?.name || "N/A"}{pm.taxPayer?.village ? ` - ${pm.taxPayer.village}` : ""}</span>
                      </div>
                      <div className="flex items-center justify-end gap-1 text-emerald-600 font-bold font-mono">
                        <Coins className="h-3.5 w-3.5 shrink-0" />
                        <span>৳{pm.amount?.toLocaleString()}</span>
                      </div>

                      {pm.taxPayer?.phone && (
                        <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
                          <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">{pm.taxPayer.phone}</span>
                        </div>
                      )}
                      {pm.taxPayer?.nid && (
                        <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
                          <CreditCard className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">{pm.taxPayer.nid}</span>
                        </div>
                      )}

                      <div className="col-span-2 flex items-center justify-between pt-1 border-t border-border/30 mt-1">
                        <span className="text-muted-foreground text-[11px]">
                          অর্থবছর: {pm.fiscalYear?.year} • {new Date(pm.paymentDate).toLocaleDateString("bn-BD")}
                        </span>
                        {isPaid ? (
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>পরিশোধিত ({pm.paymentMethod})</span>
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-bold gap-1"
                          >
                            <Clock className="w-3 h-3" />
                            <span>অপরিশোধিত (দাবি)</span>
                          </Badge>
                        )}
                      </div>

                      {!isPaid && (
                        <div className="col-span-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setPreselectedTaxPayer(pm.taxPayer)
                              setShowPaymentModal(true)
                            }}
                            className="w-full h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 shadow-sm cursor-pointer"
                          >
                            <Coins className="h-4 w-4" />
                            <span>কর আদায় করুন</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block">
              <Table className="w-full text-left font-body">
                <TableHeader className="bg-white/[0.02] border-b border-white/[0.05]">
                  <TableRow className="border-b border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.02]">
                    <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs h-auto">
                      রসিদ / দাবি নং
                    </TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs h-auto">
                      করদাতার নাম ও হোল্ডিং
                    </TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs h-auto">
                      অর্থবছর & ওয়ার্ড
                    </TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs h-auto">
                      তারিখ & অবস্থা
                    </TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs h-auto text-right">
                      করের পরিমাণ
                    </TableHead>
                    <TableHead className="px-6 py-4 text-right font-semibold text-muted-foreground text-xs h-auto">
                      অ্যাকশন
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-white/[0.04]">
                  {pagedItems.map((pm: any) => {
                    const isPaid = pm.paymentMethod !== null && pm.paymentMethod !== ""

                    return (
                      <TableRow key={pm.id} className="hover:bg-white/[0.02] transition-all duration-200 ease-in-out group border-b border-white/[0.04]">
                        <TableCell className="py-4 group-hover:py-5 px-6 font-bold text-primary font-mono text-sm transition-all duration-200 ease-in-out">
                          {pm.receiptNo || "N/A"}
                        </TableCell>
                        <TableCell className="py-4 group-hover:py-5 px-6 text-foreground transition-all duration-200 ease-in-out">
                          <p className="font-bold text-foreground font-display text-base">
                            {pm.taxPayer?.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            হোল্ডিং #{pm.taxPayer?.holding}
                          </p>
                        </TableCell>
                        <TableCell className="py-4 group-hover:py-5 px-6 text-xs text-foreground transition-all duration-200 ease-in-out">
                          <p className="font-semibold text-foreground">{pm.fiscalYear?.year}</p>
                          <p className="text-muted-foreground mt-0.5">
                            ওয়ার্ড: {pm.taxPayer?.ward?.nameBn || pm.taxPayer?.ward?.name}
                          </p>
                        </TableCell>
                        <TableCell className="py-4 group-hover:py-5 px-6 text-xs text-foreground transition-all duration-200 ease-in-out">
                          <p className="font-medium">
                            {new Date(pm.paymentDate).toLocaleDateString("bn-BD")}
                          </p>
                          {isPaid ? (
                            <Badge
                              variant="outline"
                              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold gap-1 mt-0.5"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>পরিশোধিত ({pm.paymentMethod})</span>
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-bold gap-1 mt-0.5"
                            >
                              <Clock className="w-3 h-3" />
                              <span>অপরিশোধিত (দাবি)</span>
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-4 group-hover:py-5 px-6 text-right font-bold text-emerald-600 font-mono text-base transition-all duration-200 ease-in-out">
                          ৳{pm.amount?.toLocaleString()}
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
                            <DropdownMenuContent align="end" className="bg-popover border border-border shadow-xl rounded-2xl p-1.5 min-w-[160px] text-popover-foreground">
                              {isPaid ? (
                                <DropdownMenuItem asChild>
                                  <Link href={`/print/tax-collection/receipt/${pm.id}`} className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-500/10 focus:bg-emerald-500/10">
                                    <Printer className="h-3.5 w-3.5" />
                                    <span>রসিদ প্রিন্ট করুন</span>
                                  </Link>
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setPreselectedTaxPayer(pm.taxPayer)
                                    setShowPaymentModal(true)
                                  }}
                                  className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-500/10 focus:bg-emerald-500/10"
                                >
                                  <Coins className="h-3.5 w-3.5" />
                                  <span>কর আদায় করুন</span>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => setDeletingPayment(pm)}
                                className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
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

            {/* Table Footer / Pagination — Matched with Tax Payer Module */}
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

      {/* Modals */}
      <TaxPaymentModal
        open={showPaymentModal}
        onOpenChange={(open) => {
          setShowPaymentModal(open)
          if (!open) setPreselectedTaxPayer(null)
        }}
        preselectedTaxPayer={preselectedTaxPayer}
        onSuccessPayment={(pm) => setSelectedReceiptPayment(pm)}
      />

      <TaxReceiptModal
        open={!!selectedReceiptPayment}
        onOpenChange={(open) => {
          if (!open) setSelectedReceiptPayment(null)
        }}
        payment={selectedReceiptPayment}
      />

      {/* Delete Confirmation */}
      <Dialog
        open={!!deletingPayment}
        onOpenChange={(open) => {
          if (!open) setDeletingPayment(null)
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive text-lg font-bold">
              রেকর্ড মুছে ফেলার নিশ্চিতকরণ
            </DialogTitle>
            <DialogDescription className="text-xs pt-1">
              আপনি কি নিশ্চিত যে রসিদ নম্বর <strong>"{deletingPayment?.receiptNo}"</strong> স্থায়ীভাবে মুছে ফেলতে চান?
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingPayment(null)}
              disabled={deleteMutation.isPending}
            >
              বাতিল
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (deletingPayment) deleteMutation.mutate({ id: deletingPayment.id })
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  মুছা হচ্ছে...
                </>
              ) : (
                "হ্যাঁ, মুছে ফেলুন"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
