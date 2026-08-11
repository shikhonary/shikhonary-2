"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
  Users,
  UserPlus,
  Coins,
  MapPin,
  Building2,
} from "lucide-react"

import { useTenant } from "@/modules/layout/ui/components/tenant-provider"
import { useTaxPayerSearchParams } from "../hooks/use-tax-payer-search-params"
import { TaxPayerFilter } from "../components/tax-payer-filter"
import { TaxPayerList } from "../components/tax-payer-list"
import { DeleteTaxPayerModal } from "../modal/delete-tax-payer-modal"
import { TaxPayerCardModal } from "../modal/tax-payer-card-modal"
import { TaxPayerDetailSheet } from "../modal/tax-payer-detail-sheet"
import { TaxPaymentModal } from "@/modules/tax-payment/ui/modal/tax-payment-modal"
import { TaxReceiptModal } from "@/modules/tax-payment/ui/modal/tax-receipt-modal"

export function TaxPayersView() {
  const { tenant } = useTenant()

  // Payment Modals State
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [preselectedTaxPayer, setPreselectedTaxPayer] = useState<any>(null)
  const [createdPayment, setCreatedPayment] = useState<any>(null)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")

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

  const handleCollectTax = (tp: any) => {
    setPreselectedTaxPayer(tp)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = (payment: any) => {
    setCreatedPayment(payment)
    setShowReceiptModal(true)
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

      {/* Stats Cards Section */}
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

        {/* Desktop & Tablet View (>= sm): Cards */}
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

      {/* Filter Bar */}
      <TaxPayerFilter
        wards={wards}
        viewMode={viewMode}
        setViewMode={setViewMode}
        setCurrentPage={setCurrentPage}
      />

      {/* Main Table & Mobile Card View Container */}
      <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xs shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Users className="w-8 h-8 animate-spin text-primary" />
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
        ) : (
          <TaxPayerList
            pagedItems={pagedItems}
            tenant={tenant}
            viewMode={viewMode}
            totalItems={totalItems}
            displayStart={displayStart}
            displayEnd={displayEnd}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            setCurrentPage={setCurrentPage}
            handleCollectTax={handleCollectTax}
          />
        )}
      </div>

      {/* Modals & Sheets */}
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

      <DeleteTaxPayerModal />
      <TaxPayerCardModal />
      <TaxPayerDetailSheet />
    </div>
  )
}
