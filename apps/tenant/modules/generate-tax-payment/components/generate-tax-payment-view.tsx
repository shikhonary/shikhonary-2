"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { Checkbox } from "@workspace/ui/components/checkbox"
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
  Calculator,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  Filter,
  Loader2,
  MapPin,
  Phone,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  User,
  UserCheck,
  Users,
  X,
} from "lucide-react"

import { TaxGenerationSummary } from "./tax-generation-summary"
import { TaxGenerationSuccessDialog } from "./tax-generation-success-dialog"
import { useTaxGenerationSearchParams } from "../hooks/use-tax-generation-search-params"

export function GenerateTaxPaymentView() {
  const queryClient = useQueryClient()

  // URL Search Params State (nuqs)
  const [searchParams, setSearchParams] = useTaxGenerationSearchParams()
  const searchQuery = searchParams.search
  const wardId = searchParams.wardId
  const fiscalYearId = searchParams.fiscalYearId

  const setSearchQuery = (val: string) => setSearchParams({ search: val })
  const setWardId = (val: string) => setSearchParams({ wardId: val })
  const setFiscalYearId = (val: string) => setSearchParams({ fiscalYearId: val })

  // Selected Taxpayers for generation
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Success Dialog State
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false)
  const [executionResult, setExecutionResult] = useState<{
    generatedCount: number
    skippedCount: number
    totalAmount: number
  } | null>(null)

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
  }, [fiscalYears, fiscalYearId])

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
    if (previewItems.length > 0) {
      const pendingSet = new Set(
        previewItems
          .filter((item) => !item.alreadyGenerated && item.annualTax > 0)
          .map((item) => item.id)
      )
      setSelectedIds(pendingSet)
    } else {
      setSelectedIds(new Set())
    }
  }, [previewData])

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
      setExecutionResult(data)
      setShowSuccessDialog(true)
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
    <div className="space-y-6 pb-20">
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

      {/* 3. Filter Bar — Matched Exactly with Tax Payer Module Filter UI */}
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
                {(wardId !== "all" || Boolean(searchQuery.trim())) && (
                  <span className="flex size-4.5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                    {(wardId !== "all" ? 1 : 0) + (Boolean(searchQuery.trim()) ? 1 : 0)}
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
                      করদাতার তালিকা অর্থবছর ও ওয়ার্ড অনুযায়ী ফিল্টার করুন
                    </DrawerDescription>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-4 font-body">
                  {/* Fiscal Year Filter */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 font-display">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      অর্থবছর নির্বাচন
                    </label>
                    <Select value={fiscalYearId} onValueChange={setFiscalYearId}>
                      <SelectTrigger className="w-full rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-body text-xs text-foreground h-11 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder="অর্থবছর" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-border shadow-xl rounded-xl text-popover-foreground">
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
                    <Select value={wardId} onValueChange={setWardId}>
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
                    onClick={() => {
                      setSearchQuery("")
                      setWardId("all")
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

          {/* Desktop Filters (hidden md:flex) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Fiscal Year Select */}
            <div className="min-w-[160px]">
              <Select value={fiscalYearId} onValueChange={setFiscalYearId}>
                <SelectTrigger className="w-full rounded-xl border border-border bg-muted/30 py-2.5 px-3.5 font-body text-xs text-foreground h-10 justify-between hover:bg-muted/50 transition-all">
                  <div className="flex items-center gap-2 truncate">
                    <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                    <SelectValue placeholder="অর্থবছর" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border shadow-xl rounded-xl min-w-[170px] text-popover-foreground">
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
              <Select value={wardId} onValueChange={setWardId}>
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
          </div>
        </div>

        {/* Active Filter Badges & Reset Row (Matched Exactly with Tax Payer Module) */}
        {(Boolean(searchQuery.trim()) || wardId !== "all") && (
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
              {wardId !== "all" && (
                <Badge
                  variant="secondary"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-primary cursor-default shrink-0"
                >
                  <span>
                    ওয়ার্ড: {wards.find((w: any) => w.id === wardId)?.nameBn || "নির্বাচিত ওয়ার্ড"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setWardId("all")}
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
              onClick={() => {
                setSearchQuery("")
                setWardId("all")
              }}
              className="h-7 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer self-start sm:self-auto"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              সকল ফিল্টার সরান
            </Button>
          </div>
        )}

      </div>

      {/* 4. Preview Table */}
      <div className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/60 flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2 font-bold text-sm text-foreground">
            <Users className="w-4 h-4 text-primary" />
            <span>করদাতা তালিকা প্রিভিউ ({formatNumber(filteredItems.length)})</span>
          </div>

          {pendingItems.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all-header"
                checked={
                  pendingItems.length > 0 &&
                  pendingItems.every((item) => selectedIds.has(item.id))
                }
                onCheckedChange={(checked) => handleToggleSelectAll(!!checked)}
              />
              <label
                htmlFor="select-all-header"
                className="text-xs font-bold text-muted-foreground cursor-pointer select-none"
              >
                সকল পেন্ডিং নির্বাচন করুন
              </label>
            </div>
          )}
        </div>

        {!hasWardOrSearch ? (
          <div className="p-12 text-center space-y-2">
            <MapPin className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <p className="text-base font-bold text-foreground">
              ওয়ার্ড নির্বাচন করুন অথবা অনুসন্ধান টাইপ করুন
            </p>
            <p className="text-xs text-muted-foreground font-semibold">
              করদাতার বাৎসরিক কর নির্ধারণ ও জেনারেশনের জন্য যেকোনো একটি ওয়ার্ড নম্বর নির্বাচন করুন বা সন্ধান করুন।
            </p>
          </div>
        ) : isLoadingPreview ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-bold text-muted-foreground">
              করদাতা তালিকা হিসাব করা হচ্ছে...
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <p className="text-base font-bold text-foreground">কোনো করদাতা পাওয়া যায়নি</p>
            <p className="text-xs text-muted-foreground font-semibold">
              ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card View (< md) */}
            <div className="divide-y divide-border/60 md:hidden">
              {filteredItems.map((item) => {
                const isSelected = selectedIds.has(item.id)
                const isDisabled = item.alreadyGenerated || item.annualTax <= 0

                return (
                  <div
                    key={item.id}
                    className={`p-4 space-y-3 transition-colors ${
                      item.alreadyGenerated
                        ? "bg-muted/20 opacity-70"
                        : isSelected
                        ? "bg-primary/5 dark:bg-primary/10"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Checkbox
                          checked={isSelected}
                          disabled={isDisabled}
                          onCheckedChange={() => handleToggleItem(item.id)}
                          className="mt-0.5"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 shrink-0">
                              #{item.holding}
                            </span>
                            <h4 className="font-display text-sm font-extrabold text-foreground truncate">
                              {item.name}
                            </h4>
                          </div>
                          {item.fatherName && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate font-body">
                              পিতা: {item.fatherName}
                            </p>
                          )}
                        </div>
                      </div>

                      {item.alreadyGenerated ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold text-[10px] gap-1 shrink-0"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>জেনারেটকৃত</span>
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-bold text-[10px] gap-1 shrink-0"
                        >
                          <Clock className="w-3 h-3" />
                          <span>জেনারেশন বাকি</span>
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2.5 border-t border-border/50">
                      <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">
                          {item.wardName} - {item.village}
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-1 text-primary font-bold font-mono">
                        <Coins className="h-3.5 w-3.5 shrink-0" />
                        <span>{formatCurrency(item.annualTax)}</span>
                      </div>
                      {item.phone && (
                        <div className="flex items-center gap-1.5 text-muted-foreground font-mono col-span-2">
                          <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">{item.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-12 text-center">নির্বাচন</TableHead>
                    <TableHead className="font-bold">হোল্ডিং নং</TableHead>
                    <TableHead className="font-bold">করদাতার নাম</TableHead>
                    <TableHead className="font-bold">ওয়ার্ড</TableHead>
                    <TableHead className="font-bold">গ্রাম</TableHead>
                    <TableHead className="font-bold text-right">বাৎসরিক কর</TableHead>
                    <TableHead className="font-bold text-center">অবস্থা</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const isSelected = selectedIds.has(item.id)
                    const isDisabled = item.alreadyGenerated || item.annualTax <= 0

                    return (
                      <TableRow
                        key={item.id}
                        className={
                          item.alreadyGenerated
                            ? "bg-muted/20 opacity-70"
                            : isSelected
                            ? "bg-primary/5 dark:bg-primary/10"
                            : undefined
                        }
                      >
                        <TableCell className="text-center">
                          <Checkbox
                            checked={isSelected}
                            disabled={isDisabled}
                            onCheckedChange={() => handleToggleItem(item.id)}
                          />
                        </TableCell>

                        <TableCell className="font-black text-foreground">
                          {item.holding}
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground">{item.name}</span>
                            {item.fatherName && (
                              <span className="text-xs text-muted-foreground">
                                পিতা: {item.fatherName}
                              </span>
                            )}
                            {item.phone && (
                              <span className="text-xs text-muted-foreground">
                                ফোন: {item.phone}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="font-semibold text-muted-foreground">
                          {item.wardName}
                        </TableCell>

                        <TableCell className="font-semibold text-muted-foreground">
                          {item.village}
                        </TableCell>

                        <TableCell className="text-right font-black text-foreground">
                          {formatCurrency(item.annualTax)}
                        </TableCell>

                        <TableCell className="text-center">
                          {item.alreadyGenerated ? (
                            <Badge
                              variant="outline"
                              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>জেনারেটকৃত</span>
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-bold gap-1"
                            >
                              <Clock className="w-3 h-3" />
                              <span>জেনারেশন বাকি</span>
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>

      {/* Execution Action Bar (Sticky Bottom) */}
      <div className="fixed bottom-4 left-4 right-4 md:left-72 md:right-8 z-30 bg-card/95 backdrop-blur-md border border-border/80 rounded-2xl p-3 sm:p-4 shadow-2xl flex items-center justify-center sm:justify-between gap-4">
        <div className="hidden sm:block">
          <p className="text-xs font-bold text-muted-foreground">মোট ধার্যকৃত কর (অপরিশোধিত):</p>
          <p className="text-lg font-black text-primary">
            {formatCurrency(selectedTotalAmount)}{" "}
            <span className="text-xs font-bold text-muted-foreground font-body">
              ({formatNumber(selectedIds.size)} জন করদাতা)
            </span>
          </p>
        </div>

        <Button
          size="lg"
          onClick={handleExecuteGeneration}
          disabled={executeMutation.isPending || selectedIds.size === 0}
          className="w-full sm:w-auto rounded-xl font-black gap-2 px-6 shadow-md shadow-primary/20"
        >
          {executeMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>কর জেনারেট হচ্ছে...</span>
            </>
          ) : (
            <>
              <Calculator className="w-5 h-5" />
              <span>
                কর জেনারেট করুন ({formatNumber(selectedIds.size)} জন)
              </span>
            </>
          )}
        </Button>
      </div>

      {/* Success Dialog */}
      <TaxGenerationSuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        result={executionResult}
        fiscalYearYear={currentFiscalYearYear}
      />
    </div>
  )
}
