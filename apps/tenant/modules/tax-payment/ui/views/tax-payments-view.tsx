"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Coins,
  CreditCard,
  Building2,
  Loader2,
  MapPin,
  Receipt,
  Search,
  Clock,
} from "lucide-react"

import { useTaxPaymentSearchParams } from "../hooks/use-tax-payment-search-params"
import { TaxPaymentFilter } from "../components/tax-payment-filter"
import { TaxPaymentList } from "../components/tax-payment-list"
import { TaxPaymentModal } from "../modal/tax-payment-modal"
import { TaxReceiptModal } from "../modal/tax-receipt-modal"
import { DeleteTaxPaymentModal } from "../modal/delete-tax-payment-modal"
import { useTaxPaymentModalStore } from "../store/use-tax-payment-modal-store"

export function TaxPaymentsView() {
  const searchParamsHook = useSearchParams()
  const hasNewParam = searchParamsHook.get("new") === "true"

  const { openModal: openPaymentModal } = useTaxPaymentModalStore()

  useEffect(() => {
    if (hasNewParam) {
      openPaymentModal()
    }
  }, [hasNewParam, openPaymentModal])

  // URL Search Params State (nuqs)
  const [searchParams, setSearchParams] = useTaxPaymentSearchParams()
  const searchQuery = searchParams.search
  const fiscalYearFilter = searchParams.fiscalYearId
  const wardFilter = searchParams.wardId
  const statusFilter = searchParams.status

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

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

  // Client-Side Pagination Calculations
  const totalItems = payments.length
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1
  const pagedItems = payments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const displayStart = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const displayEnd = Math.min(currentPage * itemsPerPage, totalItems)

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
          onClick={() => openPaymentModal()}
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
              <h3 className="text-2xl font-bold text-emerald-600">
                ৳{stats?.totalCollectedAmount?.toLocaleString() || 0}
              </h3>
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

      {/* Filter Bar */}
      <TaxPaymentFilter
        fiscalYears={fiscalYears}
        wards={wards}
        stats={stats}
        setCurrentPage={setCurrentPage}
      />

      {/* Main Table & Mobile Card View Container */}
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
          <TaxPaymentList
            pagedItems={pagedItems}
            totalItems={totalItems}
            displayStart={displayStart}
            displayEnd={displayEnd}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            setCurrentPage={setCurrentPage}
          />
        )}
      </div>

      {/* Modal Dialogs */}
      <TaxPaymentModal />
      <TaxReceiptModal />
      <DeleteTaxPaymentModal />
    </div>
  )
}
