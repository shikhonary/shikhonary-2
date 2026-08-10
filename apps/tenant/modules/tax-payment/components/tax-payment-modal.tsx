"use client"

import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Checkbox } from "@workspace/ui/components/checkbox"
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
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import {
  Loader2,
  Coins,
  Calendar,
  User,
  CreditCard,
  MapPin,
  Search,
  CheckCircle2,
  X,
} from "lucide-react"

import { useRouter } from "next/navigation"

interface TaxPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preselectedTaxPayer?: any
  onSuccessPayment?: (payment: any) => void
}

export function TaxPaymentModal({
  open,
  onOpenChange,
  preselectedTaxPayer,
  onSuccessPayment,
}: TaxPaymentModalProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  // Form State
  const [fiscalYearId, setFiscalYearId] = useState("")
  const [wardId, setWardId] = useState("all")
  const [taxPayerSearch, setTaxPayerSearch] = useState("")
  const [taxPayerId, setTaxPayerId] = useState("")
  const [amount, setAmount] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState("নগদ")

  // Check if any filter is active
  const hasFilter = wardId !== "all" || taxPayerSearch.trim().length > 0 || !!preselectedTaxPayer

  // 1. Fetch Fiscal Years
  const { data: fiscalYearsData } = useQuery(
    trpc.tenantFiscalYear.list.queryOptions({ limit: 100 })
  )
  const fiscalYears = fiscalYearsData?.fiscalYears || []

  // Pre-select current fiscal year if available
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

  // 3. Fetch TaxPayers list (disabled until ward or search query is set, limited to 3, excluding paid taxpayers)
  const { data: taxPayersData, isLoading: isLoadingTaxPayers } = useQuery({
    ...trpc.taxPayer.list.queryOptions({
      limit: 10,
      wardId: wardId === "all" ? undefined : wardId,
      search: taxPayerSearch.trim() || undefined,
      fiscalYearId: fiscalYearId || undefined,
      unpaidOnly: true,
    }),
    enabled: hasFilter && open,
  })
  const taxPayers = (taxPayersData?.taxPayers || []).slice(0, 3)

  useEffect(() => {
    if (preselectedTaxPayer) {
      setTaxPayerId(preselectedTaxPayer.id)
      setAmount(preselectedTaxPayer.tax || 0)
      if (preselectedTaxPayer.wardId) {
        setWardId(preselectedTaxPayer.wardId)
      }
    }
  }, [preselectedTaxPayer, open])

  // Selected TaxPayer Object
  const selectedTaxPayerObj = taxPayerId
    ? taxPayers.find((tp: any) => tp.id === taxPayerId) ||
      (preselectedTaxPayer?.id === taxPayerId ? preselectedTaxPayer : null)
    : null

  const handleTaxPayerSelect = (tp: any) => {
    setTaxPayerId(tp.id)
    if (tp.tax) {
      setAmount(tp.tax)
    }
  }

  const clearTaxPayerSelection = () => {
    setTaxPayerId("")
    setAmount(0)
  }

  const createMutation = useMutation({
    ...trpc.taxPayment.create.mutationOptions(),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries(trpc.taxPayment.pathFilter())
      queryClient.invalidateQueries(trpc.taxPayer.pathFilter())
      toast.success("কর পরিশোধের তথ্য সফলভাবে সংরক্ষিত হয়েছে।")
      onOpenChange(false)
      onSuccessPayment?.(data)
      resetForm()
      if (data?.id) {
        router.push(`/print/tax-collection/receipt/${data.id}`)
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "কর পরিশোধ সংরক্ষণ করতে ব্যর্থ হয়েছে")
    },
  })

  const resetForm = () => {
    setTaxPayerId("")
    setWardId("all")
    setTaxPayerSearch("")
    setAmount(0)
    setPaymentMethod("নগদ")
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("bn-BD").format(num)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!taxPayerId || !fiscalYearId || !amount || amount <= 0) {
      toast.error("অনুগ্রহ করে করদাতা, অর্থবছর এবং সঠিক টাকার পরিমাণ প্রদান করুন।")
      return
    }

    createMutation.mutate({
      taxPayerId,
      fiscalYearId,
      amount: Number(amount),
      paymentMethod,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 border border-border/80 bg-card shadow-2xl rounded-3xl overflow-hidden text-foreground sm:max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 p-6 text-white text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-3 shadow-lg ring-4 ring-white/10">
            <Coins className="w-8 h-8" />
          </div>
          <DialogTitle className="font-display text-xl font-extrabold text-white">
            হোল্ডিং কর আদায় নথিভুক্তকরণ
          </DialogTitle>
          <DialogDescription className="font-body text-xs text-white/90 mt-1">
            করদাতার বাৎসরিক কর সংগ্রহের বিবরণ প্রদান করে চালান রসিদ তৈরি করুন।
          </DialogDescription>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-body">
          {/* Row 1: Fiscal Year & Ward Filter side-by-side */}
          <div className="grid grid-cols-2 gap-3">
            {/* Fiscal Year Select */}
            <div className="space-y-1.5">
              <Label htmlFor="fiscalYearId" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 font-display">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                অর্থবছর <span className="text-destructive">*</span>
              </Label>
              <Select value={fiscalYearId} onValueChange={setFiscalYearId}>
                <SelectTrigger id="fiscalYearId" className="w-full rounded-xl border border-border bg-muted/30 py-2.5 px-3.5 font-body text-xs text-foreground h-10 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20">
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

            {/* Ward Select */}
            <div className="space-y-1.5">
              <Label htmlFor="wardId" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 font-display">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                ওয়ার্ড নম্বর
              </Label>
              <Select value={wardId} onValueChange={setWardId}>
                <SelectTrigger id="wardId" className="w-full rounded-xl border border-border bg-muted/30 py-2.5 px-3.5 font-body text-xs text-foreground h-10 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20">
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

          {/* Row 2: Search Filter Input (Name, Phone, Village, NID) */}
          <div className="space-y-1.5">
            <Label htmlFor="taxPayerSearch" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 font-display">
              <Search className="w-3.5 h-3.5 text-primary" />
              করদাতা ফিল্টার (নাম, ফোন, গ্রাম, এনআইডি)
            </Label>
            <Input
              id="taxPayerSearch"
              type="text"
              placeholder="করদাতার নাম, ফোন, গ্রাম বা NID টাইপ করুন..."
              value={taxPayerSearch}
              onChange={(e) => setTaxPayerSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/30 py-2.5 px-3.5 font-body text-xs text-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 h-10 transition-all"
            />
          </div>

          {/* Row 3: Taxpayer Selection Section */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground flex items-center justify-between font-display">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" />
                করদাতা <span className="text-destructive">*</span>
              </span>
              {!selectedTaxPayerObj && taxPayers.length > 0 && (
                <span className="text-[10px] text-muted-foreground">
                  ({formatNumber(taxPayers.length)} জন দেখানো হচ্ছে)
                </span>
              )}
            </Label>

            {selectedTaxPayerObj ? (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-foreground flex items-center justify-between shadow-xs transition-all animate-in fade-in-50">
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30 shrink-0">
                        #{selectedTaxPayerObj.holding}
                      </span>
                      <span className="font-extrabold text-xs text-foreground truncate">{selectedTaxPayerObj.name}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                      ওয়ার্ড: {selectedTaxPayerObj.ward?.nameBn || selectedTaxPayerObj.ward?.name} • গ্রাম: {selectedTaxPayerObj.village} {selectedTaxPayerObj.phone ? `• 📱 ${selectedTaxPayerObj.phone}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono font-bold text-xs text-emerald-600 bg-emerald-500/20 px-2 py-1 rounded-lg border border-emerald-500/30">
                    ৳{selectedTaxPayerObj.tax?.toLocaleString()}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={clearTaxPayerSelection}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer"
                    title="নির্বাচন বাতিল করুন"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : !hasFilter ? (
              <div className="p-4 text-center border rounded-xl bg-muted/20 text-xs text-muted-foreground font-medium">
                ওয়ার্ড নির্বাচন করুন অথবা করদাতার নাম/ফোন নম্বর দিয়ে অনুসন্ধান করুন...
              </div>
            ) : isLoadingTaxPayers ? (
              <div className="p-4 text-center border rounded-xl bg-muted/20">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" />
                <span className="text-xs text-muted-foreground mt-1 block">করদাতা খোঁজা হচ্ছে...</span>
              </div>
            ) : taxPayers.length === 0 ? (
              <div className="p-4 text-center border rounded-xl bg-muted/20 text-xs text-muted-foreground">
                কোনো করদাতা পাওয়া যায়নি। ফিল্টার পরিবর্তন করুন।
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-2 border border-border/80 rounded-xl p-2 bg-muted/20 divide-y divide-border/40">
                {taxPayers.map((tp: any) => (
                  <div
                    key={tp.id}
                    onClick={() => handleTaxPayerSelect(tp)}
                    className="p-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-all hover:bg-muted/50 text-foreground"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                      <Checkbox
                        checked={false}
                        onCheckedChange={() => handleTaxPayerSelect(tp)}
                        className="shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 shrink-0">
                            #{tp.holding}
                          </span>
                          <span className="font-bold text-xs truncate">{tp.name}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                          ওয়ার্ড: {tp.ward?.nameBn || tp.ward?.name} • গ্রাম: {tp.village} {tp.phone ? `• 📱 ${tp.phone}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-xs text-emerald-600 block">
                        ৳{tp.tax?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Amount & Payment Method - Visible only after a taxpayer is selected */}
          {Boolean(taxPayerId) && (
            <div className="grid grid-cols-2 gap-3 transition-all animate-in fade-in-50 slide-in-from-top-2">
              {/* Amount */}
              <div className="space-y-1.5">
                <Label htmlFor="amount" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 font-display">
                  <Coins className="w-3.5 h-3.5 text-primary" />
                  আদায়কৃত টাকা (৳) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min={1}
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                  className="w-full rounded-xl border border-border bg-muted/30 py-2.5 px-3.5 font-body text-xs text-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 h-10 transition-all font-mono font-bold"
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-1.5">
                <Label htmlFor="paymentMethod" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 font-display">
                  <CreditCard className="w-3.5 h-3.5 text-primary" />
                  পরিশোধের মাধ্যম
                </Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="paymentMethod" className="w-full rounded-xl border border-border bg-muted/30 py-2.5 px-3.5 font-body text-xs text-foreground h-10 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-xl rounded-xl text-popover-foreground">
                    <SelectItem value="নগদ">নগদ (Cash)</SelectItem>
                    <SelectItem value="মোবাইল ব্যাংকিং">মোবাইল ব্যাংকিং</SelectItem>
                    <SelectItem value="ব্যাংক ট্রান্সফার">ব্যাংক ট্রান্সফার</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-3 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
              className="flex-1 h-11 text-xs font-semibold border-border text-foreground hover:bg-muted rounded-xl cursor-pointer"
            >
              বাতিল
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || !taxPayerId}
              className="flex-1 h-11 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer shadow-md shadow-emerald-600/20 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4" />
                  <span>কর আদায় নথিভুক্ত করুন</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
