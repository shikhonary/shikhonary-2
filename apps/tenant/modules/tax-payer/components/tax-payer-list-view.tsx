"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  Users,
  User,
  UserPlus,
  Trash2,
  Pen,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Loader2,
  MapPin,
  Building2,
  Coins,
  Receipt,
  RotateCcw,
  Eye,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Phone,
  CreditCard,
  Info,
  Download,
  LayoutGrid,
  Table as TableIcon,
} from "lucide-react"

import { useTenant } from "@/modules/layout/ui/components/tenant-provider"
import { TaxPayerCardModal } from "./tax-payer-card-modal"
import { HoldingCardViewComponent } from "./holding-card-view-component"
import { useDownloadAllCards } from "../hooks/use-download-all-cards"
import { TaxPayerDetailSheet } from "./tax-payer-detail-sheet"
import { TaxPaymentModal } from "@/modules/tax-payment/components/tax-payment-modal"
import { TaxReceiptModal } from "@/modules/tax-payment/components/tax-receipt-modal"
import { useTaxPayerSearchParams } from "../hooks/use-tax-payer-search-params"

export function TaxPayerListView() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { tenant } = useTenant()
  const { downloadAll, downloading: downloadingAll, progress: downloadProgress } = useDownloadAllCards()

  // State
  const [selectedTaxPayerId, setSelectedTaxPayerId] = useState<string | null>(null)
  const [deletingTaxPayer, setDeletingTaxPayer] = useState<{ id: string; name: string } | null>(null)
  const [cardModalTaxPayer, setCardModalTaxPayer] = useState<any>(null)
  const [showCardModal, setShowCardModal] = useState(false)
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")

  // Payment Modals State
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [preselectedTaxPayer, setPreselectedTaxPayer] = useState<any>(null)
  const [createdPayment, setCreatedPayment] = useState<any>(null)
  const [showReceiptModal, setShowReceiptModal] = useState(false)

  // URL Search Params State (nuqs)
  const [searchParams, setSearchParams] = useTaxPayerSearchParams()
  const searchQuery = searchParams.search
  const wardFilter = searchParams.wardId
  const sortFilter = searchParams.sort

  const setSearchQuery = (val: string) => setSearchParams({ search: val })
  const setWardFilter = (val: string) => setSearchParams({ wardId: val })
  const setSortFilter = (val: string) => setSearchParams({ sort: val })

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Fetch Wards
  const { data: wardsData } = useQuery(
    trpc.tenantWard.list.queryOptions({ limit: 100 })
  )
  const wards = wardsData?.wards || []

  // Fetch TaxPayer Stats
  const { data: stats } = useQuery(
    trpc.taxPayer.stats.queryOptions({
      wardId: wardFilter === "all" ? undefined : wardFilter,
    })
  )

  // Fetch TaxPayers List
  const { data: taxPayersData, isLoading, isError, refetch } = useQuery(
    trpc.taxPayer.list.queryOptions({
      limit: 100,
      search: searchQuery.trim() || undefined,
      wardId: wardFilter === "all" ? undefined : wardFilter,
      sort: sortFilter === "all" ? undefined : (sortFilter as any),
    })
  )
  const taxPayers = taxPayersData?.taxPayers || []

  // Client-Side Pagination Calculations
  const totalItems = taxPayers.length
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1
  const pagedItems = taxPayers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const displayStart = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const displayEnd = Math.min(currentPage * itemsPerPage, totalItems)


  // Delete Mutation
  const deleteMutation = useMutation({
    ...trpc.taxPayer.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.taxPayer.pathFilter())
      toast.success(`করদাতা "${deletingTaxPayer?.name}" সফলভাবে মুছে ফেলা হয়েছে।`)
      setDeletingTaxPayer(null)
    },
    onError: (err: any) => {
      toast.error(err.message || "করদাতা মুছতে ব্যর্থ হয়েছে")
    },
  })

  const handleCollectTax = (tp: any) => {
    setPreselectedTaxPayer(tp)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = (payment: any) => {
    setCreatedPayment(payment)
    setShowReceiptModal(true)
  }

  const resetFilters = () => {
    setCurrentPage(1)
    setSearchParams({
      search: "",
      wardId: "all",
      sort: "all",
    })
  }

  return (
    <div className="w-full space-y-6 font-body">
      {/* Header — Section Title & Primary CTA */}
      <section className="mb-6 sm:mb-8 flex flex-col justify-between gap-4 sm:gap-6 md:flex-row md:items-end">
        <div>
          <h2 className="mb-1 font-display text-2xl sm:text-3xl font-extrabold text-foreground md:text-4xl">
            করদাতা ব্যবস্থাপনা
          </h2>
          <p className="max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed text-muted-foreground">
            ইউনিয়ন পরিষদের হোল্ডিং করদাতাদের তালিকা, প্রোফাইল ও বাৎসরিক ট্যাক্স পরিচালনা করুন।
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Bulk Download Cards (.ZIP) Button - Commented out for now
          <Button
            variant="outline"
            onClick={async () => {
              if (!taxPayers || taxPayers.length === 0) {
                toast.error("ডাউনলোড করার জন্য কোনো করদাতা পাওয়া যায়নি।")
                return
              }
              try {
                await downloadAll(taxPayers, tenant)
                toast.success("সকল হোল্ডিং স্মার্ট কার্ড সফলভাবে ডাউনলোড করা হয়েছে!")
              } catch {
                toast.error("স্মার্ট কার্ড জিপ ফাইল তৈরি করতে ব্যর্থ হয়েছে।")
              }
            }}
            disabled={downloadingAll}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-emerald-600/40 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 px-5 py-2.5 sm:py-3 font-display text-sm font-bold shadow-xs transition-all cursor-pointer h-auto"
          >
            {downloadingAll ? (
              <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
            ) : (
              <Download className="h-4 w-4 text-emerald-600" />
            )}
            <span>
              {downloadingAll
                ? `জেনারেট হচ্ছে (${downloadProgress.current}/${downloadProgress.total})...`
                : "স্মার্ট কার্ড জিপ (.ZIP)"}
            </span>
          </Button>
          */}

          <Button
            onClick={() => {
              setPreselectedTaxPayer(null)
              setShowPaymentModal(true)
            }}
            className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 sm:py-3 font-display text-sm sm:text-base font-bold text-white shadow-md hover:shadow-lg hover:shadow-emerald-600/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 cursor-pointer overflow-hidden h-auto"
          >
            <Coins className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 ease-out group-hover:scale-110" />
            <span className="relative z-10">কর আদায় করুন</span>
          </Button>

          <Button
            asChild
            className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 sm:py-3 font-display text-sm sm:text-base font-bold text-primary-foreground shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 cursor-pointer overflow-hidden h-auto"
          >
            <Link href="/tax-payers/new">
              <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 ease-out group-hover:scale-110" />
              <span className="relative z-10">নতুন করদাতা নিবন্ধন</span>
            </Link>
          </Button>
        </div>
      </section>


      {/* Stats Cards Section (Matched with Admin App User Module) */}
      <div className="mb-6">
        {/* Mobile View (< sm): Compact Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:hidden">
          <Badge variant="outline" className="rounded-md border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary normal-case tracking-normal">
            মোট করদাতা: {stats?.totalCount || 0}
          </Badge>
          <Badge variant="outline" className="rounded-md border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 normal-case tracking-normal">
            ধার্যকৃত কর: ৳{stats?.totalExpectedTax?.toLocaleString() || 0}
          </Badge>
          <Badge variant="outline" className="rounded-md border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-600 normal-case tracking-normal">
            গড় কর: ৳{stats?.averageTax?.toLocaleString() || 0}
          </Badge>
        </div>

        {/* Desktop & Tablet View (>= sm): Cards matching Admin User Stats */}
        <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Total Taxpayers */}
          <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                মোট নিবন্ধিত করদাতা
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-foreground">
                  {stats?.totalCount?.toLocaleString() || 0} জন
                </h3>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                সকল নিবন্ধিত হোল্ডিং মালিক
              </p>
            </div>
          </div>

          {/* Total Expected Tax */}
          <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                প্রাক্কলিত বাৎসরিক ধার্যকৃত কর
              </p>
              <h3 className="text-2xl font-bold text-emerald-600">
                ৳{stats?.totalExpectedTax?.toLocaleString() || 0}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                বাৎসরিক সম্ভাব্য রাজস্ব আয়
              </p>
            </div>
          </div>

          {/* Average Tax */}
          <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 shrink-0">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                গড় বাৎসরিক কর (প্রতি হোল্ডিং)
              </p>
              <h3 className="text-2xl font-bold text-blue-600">
                ৳{stats?.averageTax?.toLocaleString() || 0}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                হোল্ডিং প্রতি গড় কর হার
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
              placeholder="হোল্ডিং, নাম, গ্রাম বা মোবাইল নম্বর দিয়ে খুঁজুন..."
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
                {(wardFilter !== "all" || sortFilter !== "all") && (
                  <span className="flex size-4.5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                    {(wardFilter !== "all" ? 1 : 0) + (sortFilter !== "all" ? 1 : 0)}
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
                      করদাতার তালিকা ওয়ার্ড ও সর্টিং অনুযায়ী ফিল্টার করুন
                    </DrawerDescription>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-4 font-body">
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

                  {/* Sort Filter */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 font-display">
                      <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                      সর্টিং ক্রম
                    </label>
                    <Select value={sortFilter} onValueChange={setSortFilter}>
                      <SelectTrigger className="w-full rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-body text-xs text-foreground h-11 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder="সকল বাছাই" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-border shadow-xl rounded-xl text-popover-foreground">
                        <SelectItem value="all">নতুন প্রথম</SelectItem>
                        <SelectItem value="holding_asc">হোল্ডিং (১ - ৯)</SelectItem>
                        <SelectItem value="name_asc">করদাতার নাম (ক-ক্ষ)</SelectItem>
                        <SelectItem value="tax_desc">ধার্যকৃত কর (বেশি)</SelectItem>
                        <SelectItem value="tax_asc">ধার্যকৃত কর (কম)</SelectItem>
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

            {/* Sort Select */}
            <div className="min-w-[160px]">
              <Select value={sortFilter} onValueChange={setSortFilter}>
                <SelectTrigger className="w-full rounded-xl border border-border bg-muted/30 py-2.5 px-3.5 font-body text-xs text-foreground h-10 justify-between hover:bg-muted/50 transition-all">
                  <div className="flex items-center gap-2 truncate">
                    <ArrowUpDown className="h-3.5 w-3.5 text-primary shrink-0" />
                    <SelectValue placeholder="সকল বাছাই" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border shadow-xl rounded-xl min-w-[170px] text-popover-foreground">
                  <SelectItem value="all">নতুন প্রথম</SelectItem>
                  <SelectItem value="holding_asc">হোল্ডিং (১ - ৯)</SelectItem>
                  <SelectItem value="name_asc">করদাতার নাম (ক-ক্ষ)</SelectItem>
                  <SelectItem value="tax_desc">ধার্যকৃত কর (বেশি)</SelectItem>
                  <SelectItem value="tax_asc">ধার্যকৃত কর (কম)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Toggle: Table vs Cards */}
            <div className="flex items-center rounded-xl border border-border bg-muted/30 p-1 shrink-0">
              <Button
                type="button"
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="h-8 px-3 text-xs font-bold rounded-lg gap-1.5 cursor-pointer"
              >
                <TableIcon className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">টেবিল ভিউ</span>
              </Button>
              <Button
                type="button"
                variant={viewMode === "cards" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("cards")}
                className="h-8 px-3 text-xs font-bold rounded-lg gap-1.5 cursor-pointer text-purple-600 hover:text-purple-700"
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">স্মার্ট কার্ড গ্রিড</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filter Badges & Reset Row */}
        {(Boolean(searchQuery.trim()) || wardFilter !== "all" || sortFilter !== "all") && (
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

              {/* Sort Filter Badge */}
              {sortFilter !== "all" && (
                <Badge
                  variant="secondary"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-primary cursor-default shrink-0"
                >
                  <span>
                    সর্ট:{" "}
                    {sortFilter === "holding_asc"
                      ? "হোল্ডিং (১ - ৯)"
                      : sortFilter === "name_asc"
                        ? "করদাতার নাম (ক-ক্ষ)"
                        : sortFilter === "tax_desc"
                          ? "ধার্যকৃত কর (বেশি)"
                          : "ধার্যকৃত কর (কম)"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSortFilter("all")}
                    className="rounded-full p-0.5 hover:bg-primary/20 transition-colors cursor-pointer shrink-0"
                    title="সর্ট ফিল্টার সরান"
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


      {/* Main Table & Mobile Card View Container — Matched with Ward Module Table Layout */}
      <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xs shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : taxPayers.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold">কোনো করদাতা পাওয়া যায়নি</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              নতুন করদাতা নিবন্ধন বোতামে ক্লিক করে ইউপি ডিরেক্টরিতে প্রথম করদাতা যুক্ত করুন।
            </p>
          </div>
        ) : viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 sm:p-6 bg-muted/10">
            {pagedItems.map((tp: any) => (
              <div key={tp.id} className="flex flex-col items-center bg-card border border-border/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                <HoldingCardViewComponent taxPayer={tp} tenant={tenant} />
              </div>
            ))}
          </div>
        ) : (
          <div>
            {/* Mobile Card List View (< md) */}
            <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:hidden">
              {pagedItems.map((tp: any) => {
                const hasUnpaidTax = !tp.payments || tp.payments.length === 0 || tp.payments.some((p: any) => !p.paymentMethod)

                return (
                  <div
                    key={tp.id}
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
                              #{tp.holding}
                            </span>
                            <h4
                              onClick={() => router.push(`/tax-payers/${tp.id}`)}
                              className="font-display text-base font-extrabold text-foreground truncate cursor-pointer hover:underline"
                            >
                              {tp.name}
                            </h4>
                          </div>
                          {tp.fatherName && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate font-body">
                              পিতা: {tp.fatherName}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
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
                            <DropdownMenuItem
                              onClick={() => router.push(`/tax-payers/${tp.id}`)}
                              className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted focus:bg-muted"
                            >
                              <Eye className="h-3.5 w-3.5 text-primary" />
                              <span>প্রোফাইল ও ইতিহাস</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setCardModalTaxPayer(tp)
                                setShowCardModal(true)
                              }}
                              className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted focus:bg-muted"
                            >
                              <CreditCard className="h-3.5 w-3.5 text-purple-600" />
                              <span>স্মার্ট কার্ড দেখুন</span>
                            </DropdownMenuItem>
                            {hasUnpaidTax && (
                              <DropdownMenuItem
                                onClick={() => handleCollectTax(tp)}
                                className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-500/10 focus:bg-emerald-500/10"
                              >
                                <Coins className="h-3.5 w-3.5" />
                                <span>কর আদায় করুন</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => router.push(`/tax-payers/${tp.id}/edit`)}
                              className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted focus:bg-muted"
                            >
                              <Pen className="h-3.5 w-3.5 text-blue-600" />
                              <span>সম্পাদনা</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeletingTaxPayer({ id: tp.id, name: tp.name })}
                              className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>মুছে ফেলুন</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2.5 border-t border-border/50">
                      <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{tp.ward?.nameBn || tp.ward?.name || "N/A"}</span>
                      </div>
                      <div className="flex items-center justify-end gap-1 text-emerald-600 font-bold font-mono">
                        <Coins className="h-3.5 w-3.5 shrink-0" />
                        <span>৳{tp.tax?.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                        <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{tp.village || "N/A"}</span>
                      </div>
                      {tp.phone && (
                        <div className="flex items-center justify-end gap-1.5 text-muted-foreground font-mono">
                          <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">{tp.phone}</span>
                        </div>
                      )}

                      {tp.nid && (
                        <div className="col-span-2 flex items-center gap-1.5 text-muted-foreground font-mono pt-1">
                          <CreditCard className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">NID: {tp.nid}</span>
                        </div>
                      )}

                      {hasUnpaidTax && (
                        <div className="col-span-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleCollectTax(tp)}
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
                      হোল্ডিং নম্বর
                    </TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs h-auto">
                      করদাতার নাম ও পরিচয়
                    </TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs h-auto">
                      ওয়ার্ড ও গ্রাম
                    </TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs h-auto text-right">
                      ধার্যকৃত বাৎসরিক কর
                    </TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs h-auto">
                      যোগাযোগ ও পরিচয়
                    </TableHead>
                    <TableHead className="px-6 py-4 text-right font-semibold text-muted-foreground text-xs h-auto">
                      অ্যাকশন
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-white/[0.04]">
                  {pagedItems.map((tp: any) => {
                    const hasUnpaidTax = !tp.payments || tp.payments.length === 0 || tp.payments.some((p: any) => !p.paymentMethod)

                    return (
                      <TableRow key={tp.id} className="hover:bg-white/[0.02] transition-all duration-200 ease-in-out group border-b border-white/[0.04]">
                        <TableCell className="py-4 group-hover:py-5 px-6 font-bold text-primary font-mono text-sm transition-all duration-200 ease-in-out">
                          #{tp.holding}
                        </TableCell>
                        <TableCell className="py-4 group-hover:py-5 px-6 text-foreground transition-all duration-200 ease-in-out">
                          <p
                            onClick={() => router.push(`/tax-payers/${tp.id}`)}
                            className="font-bold text-foreground font-display text-base cursor-pointer hover:underline"
                          >
                            {tp.name}
                          </p>
                          {tp.fatherName && (
                            <p className="text-xs text-muted-foreground mt-0.5">পিতা: {tp.fatherName}</p>
                          )}
                        </TableCell>
                        <TableCell className="py-4 group-hover:py-5 px-6 text-xs text-foreground transition-all duration-200 ease-in-out">
                          <p className="font-semibold text-foreground">{tp.ward?.nameBn || tp.ward?.name || "N/A"}</p>
                          <p className="text-muted-foreground mt-0.5">গ্রাম: {tp.village}</p>
                        </TableCell>
                        <TableCell className="py-4 group-hover:py-5 px-6 text-right font-bold text-emerald-600 font-mono text-base transition-all duration-200 ease-in-out">
                          ৳{tp.tax?.toLocaleString()}
                        </TableCell>
                        <TableCell className="py-4 group-hover:py-5 px-6 text-xs text-muted-foreground transition-all duration-200 ease-in-out space-y-0.5 font-mono">
                          {tp.phone && <p>📱 {tp.phone}</p>}
                          {tp.nid && <p>🪪 NID: {tp.nid}</p>}
                          {!tp.phone && !tp.nid && <span>-</span>}
                        </TableCell>
                        <TableCell className="py-4 group-hover:py-5 px-6 text-right transition-all duration-200 ease-in-out">
                          <div className="flex items-center justify-end">
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
                              <DropdownMenuContent align="end" className="bg-popover border border-border shadow-xl rounded-2xl p-1.5 min-w-[165px] text-popover-foreground">
                                <DropdownMenuItem
                                  onClick={() => router.push(`/tax-payers/${tp.id}`)}
                                  className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted focus:bg-muted"
                                >
                                  <Eye className="h-3.5 w-3.5 text-primary" />
                                  <span>প্রোফাইল ও ইতিহাস</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setCardModalTaxPayer(tp)
                                    setShowCardModal(true)
                                  }}
                                  className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted focus:bg-muted"
                                >
                                  <CreditCard className="h-3.5 w-3.5 text-purple-600" />
                                  <span>স্মার্ট কার্ড দেখুন</span>
                                </DropdownMenuItem>
                                {hasUnpaidTax && (
                                  <DropdownMenuItem
                                    onClick={() => handleCollectTax(tp)}
                                    className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-500/10 focus:bg-emerald-500/10"
                                  >
                                    <Coins className="h-3.5 w-3.5" />
                                    <span>কর আদায় করুন</span>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => router.push(`/tax-payers/${tp.id}/edit`)}
                                  className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted focus:bg-muted"
                                >
                                  <Pen className="h-3.5 w-3.5 text-blue-600" />
                                  <span>সম্পাদনা</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setDeletingTaxPayer({ id: tp.id, name: tp.name })}
                                  className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>মুছে ফেলুন</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Table Footer / Pagination — Aligned with Ward Module Theme */}
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
                    className={`size-8 sm:size-9 rounded-lg text-xs font-bold transition-all ${currentPage === pageNum
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


      {/* Modals & Sheets */}


      <TaxPayerDetailSheet
        taxPayerId={selectedTaxPayerId}
        open={!!selectedTaxPayerId}
        onOpenChange={(open) => {
          if (!open) setSelectedTaxPayerId(null)
        }}
        onCollectTax={(tp) => {
          setSelectedTaxPayerId(null)
          handleCollectTax(tp)
        }}
      />

      <TaxPaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        preselectedTaxPayer={preselectedTaxPayer}
        onSuccessPayment={handlePaymentSuccess}
      />

      <TaxReceiptModal
        open={showReceiptModal}
        onOpenChange={setShowReceiptModal}
        payment={createdPayment}
      />

      {/* Delete Confirmation Modal — Matched with Ward Module */}
      <Dialog open={!!deletingTaxPayer} onOpenChange={(open) => !open && setDeletingTaxPayer(null)}>
        <DialogContent className="bg-card border border-white/[0.08] shadow-2xl rounded-2xl overflow-hidden text-foreground max-w-md p-0 gap-0">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-6 text-primary-foreground">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-primary-foreground shrink-0 shadow-sm">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="font-display text-lg font-bold text-primary-foreground">
                  করদাতা মুছে ফেলবেন?
                </DialogTitle>
                <DialogDescription className="font-body text-xs text-primary-foreground/90 mt-0.5">
                  এই প্রক্রিয়া নিশ্চিতকরণ আবশ্যক
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4 font-body">
            <p className="font-body text-sm leading-relaxed text-muted-foreground">
              আপনি কি নিশ্চিত যে আপনি{" "}
              <span className="font-bold text-foreground">
                &quot;{deletingTaxPayer?.name || "নির্বাচিত করদাতা"}&quot;
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
                onClick={() => setDeletingTaxPayer(null)}
                className="border-border text-foreground hover:bg-muted rounded-xl px-5 py-2.5 text-xs font-medium cursor-pointer"
              >
                বাতিল
              </Button>
              <Button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  if (deletingTaxPayer?.id) {
                    deleteMutation.mutate({ id: deletingTaxPayer.id })
                  }
                }}
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
                    <span>করদাতা মুছুন</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <TaxPayerCardModal
        open={showCardModal}
        onOpenChange={setShowCardModal}
        taxPayer={cardModalTaxPayer}
      />

    </div>
  )
}
