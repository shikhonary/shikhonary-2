"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { toast } from "@workspace/ui/components/sonner"

import { useTaxGenerationSearchParams } from "../hooks/use-tax-generation-search-params"
import { TaxGenerationFilter } from "../components/tax-generation-filter"
import { TaxGenerationPreviewList } from "../components/tax-generation-preview-list"
import { TaxGenerationActionBar } from "../components/tax-generation-action-bar"
import { TaxGenerationSummary } from "../components/tax-generation-summary"
import { TaxGenerationSuccessDialog } from "../modal/tax-generation-success-dialog"
import { useTaxGenerationSuccessStore } from "../store/use-tax-generation-success-store"

export function GenerateTaxPaymentView() {
  const queryClient = useQueryClient()
  const successStore = useTaxGenerationSuccessStore()

  // URL Search Params State (nuqs)
  const [searchParams, setSearchParams] = useTaxGenerationSearchParams()
  const searchQuery = searchParams.search
  const wardId = searchParams.wardId
  const fiscalYearId = searchParams.fiscalYearId

  const setFiscalYearId = (val: string) => setSearchParams({ fiscalYearId: val })

  // Selected Taxpayers for generation
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // 1. Fetch Fiscal Years
  const { data: fiscalYearsData } = useQuery(
    trpc.tenantFiscalYear.list.queryOptions({ limit: 100 })
  )
  const fiscalYears = fiscalYearsData?.fiscalYears || []

  // Auto-select current Fiscal Year if not in URL
  useEffect(() => {
    if (fiscalYears.length > 0 && !fiscalYearId) {
      const current = fiscalYears.find((fy: any) => fy.isCurrent) || fiscalYears[0]
      if (current) setFiscalYearId(current.id)
    }
  }, [fiscalYears, fiscalYearId, setFiscalYearId])

  // 2. Fetch Wards
  const { data: wardsData } = useQuery(
    trpc.tenantWard.list.queryOptions({ limit: 100 })
  )
  const wards = wardsData?.wards || []

  const hasWardFilter = !!wardId && wardId !== "all"
  const hasSearchFilter = searchQuery.trim().length > 0
  const hasWardOrSearch = hasWardFilter || hasSearchFilter

  // 3. Fetch Preview Data
  const {
    data: previewData,
    isLoading: isLoadingPreview,
  } = useQuery({
    ...trpc.generateTaxPayment.preview.queryOptions({
      fiscalYearId: fiscalYearId || "placeholder",
      wardId: wardId === "all" ? undefined : wardId,
      search: searchQuery.trim() || undefined,
    }),
    enabled: !!fiscalYearId && hasWardOrSearch,
  })

  const previewItems = previewData?.items || []
  const summary = previewData?.summary
  const currentFiscalYearYear = previewData?.fiscalYear?.year

  const filteredItems = previewItems

  // Pending (eligible) items in current view
  const pendingItems = useMemo(() => {
    return filteredItems.filter((item) => !item.alreadyGenerated)
  }, [filteredItems])

  // Auto select all pending items whenever preview data changes
  useEffect(() => {
    const pendingSet = new Set(
      previewItems
        .filter((item) => !item.alreadyGenerated && item.annualTax > 0)
        .map((item) => item.id)
    )

    const hasChanged =
      selectedIds.size !== pendingSet.size ||
      Array.from(pendingSet).some((id) => !selectedIds.has(id))

    if (hasChanged) {
      setSelectedIds(pendingSet)
    }
  }, [previewItems, selectedIds])

  // Select / Deselect Handlers
  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      const allPending = new Set(
        pendingItems.filter((item) => item.annualTax > 0).map((item) => item.id)
      )
      setSelectedIds(allPending)
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleToggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Calculate sum of selected tax amounts
  const selectedTotalAmount = useMemo(() => {
    let total = 0
    previewItems.forEach((item) => {
      if (selectedIds.has(item.id)) {
        total += item.annualTax
      }
    })
    return total
  }, [previewItems, selectedIds])

  // Mutation: Execute Tax Generation
  const executeMutation = useMutation({
    ...trpc.generateTaxPayment.executeBatch.mutationOptions(),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries(trpc.generateTaxPayment.pathFilter())
      queryClient.invalidateQueries(trpc.taxPayment.pathFilter())
      queryClient.invalidateQueries(trpc.taxPayer.pathFilter())
      successStore.openModal(data)
      toast.success("কর জেনারেশন (ধার্য) সফলভাবে সম্পন্ন হয়েছে।")
    },
    onError: (err: any) => {
      toast.error(err.message || "কর জেনারেট করতে সমস্যা হয়েছে।")
    },
  })

  const handleExecuteGeneration = () => {
    if (!fiscalYearId) {
      toast.error("অনুগ্রহ করে একটি অর্থবছর নির্বাচন করুন।")
      return
    }
    if (selectedIds.size === 0) {
      toast.error("অনুগ্রহ করে অন্তত একজন করদাতা নির্বাচন করুন।")
      return
    }

    executeMutation.mutate({
      fiscalYearId,
      taxPayerIds: Array.from(selectedIds),
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("bn-BD").format(amount) + " ৳"
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("bn-BD").format(num)
  }

  return (
    <div className="space-y-6 pb-20 font-body">
      {/* Header — Section Title */}
      <section className="mb-6 sm:mb-8 flex flex-col justify-between gap-4 sm:gap-6 md:flex-row md:items-end">
        <div>
          <h2 className="mb-1 font-display text-2xl sm:text-3xl font-extrabold text-foreground md:text-4xl">
            বাৎসরিক কর জেনারেশন
          </h2>
          <p className="max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed text-muted-foreground">
            ইউনিয়ন পরিষদের নিবন্ধিত করদাতাদের জন্য অর্থবছরভিত্তিক স্বয়ংক্রিয় বাৎসরিক কর রসিদ তৈরি ও ধার্য নির্ধারণ করুন।
          </p>
        </div>
      </section>

      {/* 2. Summary Metrics */}
      <TaxGenerationSummary summary={summary} isLoading={isLoadingPreview} />

      {/* 3. Filter Bar */}
      <TaxGenerationFilter fiscalYears={fiscalYears} wards={wards} />

      {/* 4. Preview Table */}
      <TaxGenerationPreviewList
        hasWardOrSearch={hasWardOrSearch}
        isLoadingPreview={isLoadingPreview}
        filteredItems={filteredItems}
        pendingItems={pendingItems}
        selectedIds={selectedIds}
        handleToggleSelectAll={handleToggleSelectAll}
        handleToggleItem={handleToggleItem}
        formatCurrency={formatCurrency}
        formatNumber={formatNumber}
      />

      {/* Execution Action Bar (Sticky Bottom) */}
      <TaxGenerationActionBar
        selectedTotalAmount={selectedTotalAmount}
        selectedCount={selectedIds.size}
        isPending={executeMutation.isPending}
        handleExecuteGeneration={handleExecuteGeneration}
        formatCurrency={formatCurrency}
        formatNumber={formatNumber}
      />

      {/* Success Dialog */}
      <TaxGenerationSuccessDialog fiscalYearYear={currentFiscalYearYear} />
    </div>
  )
}
