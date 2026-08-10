"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { useTenant } from "@/modules/layout/ui/components/tenant-provider"
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
  ArrowLeft,
  User,
  Phone,
  CreditCard,
  MapPin,
  Building2,
  Coins,
  Receipt,
  Pen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  Printer,
  Sparkles,
} from "lucide-react"
import { HoldingCardViewComponent } from "./holding-card-view-component"
import { TaxPayerCardModal } from "./tax-payer-card-modal"
import { TaxPaymentModal } from "@/modules/tax-payment/components/tax-payment-modal"
import { TaxReceiptModal } from "@/modules/tax-payment/components/tax-receipt-modal"

interface TaxPayerDetailViewProps {
  taxPayerId: string
}

export const TaxPayerDetailView: React.FC<TaxPayerDetailViewProps> = ({ taxPayerId }) => {
  const router = useRouter()
  const { tenant } = useTenant()

  const [activeTab, setActiveTab] = useState<"history" | "card" | "info">("history")
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showCardModal, setShowCardModal] = useState(false)
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<any | null>(null)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [createdPayment, setCreatedPayment] = useState<any | null>(null)

  const { data: taxPayer, isLoading, refetch } = useQuery(
    trpc.taxPayer.byId.queryOptions({ id: taxPayerId })
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  if (!taxPayer) {
    return (
      <div className="text-center py-20 space-y-4">
        <h3 className="text-xl font-bold text-foreground font-display">করদাতার তথ্য পাওয়া যায়নি</h3>
        <p className="text-sm text-muted-foreground font-body">
          অনুরোধকৃত করদাতার আইডি ডাটাবেজে রেকর্ড করা নেই।
        </p>
        <Button onClick={() => router.push("/tax-payers")} variant="outline" className="rounded-xl">
          <ArrowLeft className="w-4 h-4 mr-2" />
          করদাতার তালিকায় ফিরুন
        </Button>
      </div>
    )
  }

  const handlePaymentSuccess = (payment: any) => {
    setShowPaymentModal(false)
    setCreatedPayment(payment)
    setShowReceiptModal(true)
    void refetch()
  }

  const wardName = taxPayer.ward?.nameBn || taxPayer.ward?.name || "N/A"
  const isPaid = taxPayer.isCurrentYearPaid

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/tax-payers")}
          className="gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-xl w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>করদাতার তালিকায় ফিরুন</span>
        </Button>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/tax-payers/${taxPayer.id}/edit`)}
            className="flex-1 sm:flex-none gap-1.5 text-xs font-bold rounded-xl border-border hover:bg-muted"
          >
            <Pen className="h-3.5 w-3.5 text-blue-600" />
            <span>সম্পাদনা</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCardModal(true)}
            className="flex-1 sm:flex-none gap-1.5 text-xs font-bold rounded-xl border-purple-600/30 bg-purple-50 text-purple-700 hover:bg-purple-100"
          >
            <CreditCard className="h-3.5 w-3.5 text-purple-600" />
            <span>স্মার্ট কার্ড</span>
          </Button>

          {!isPaid && (
            <Button
              size="sm"
              onClick={() => setShowPaymentModal(true)}
              className="w-full sm:w-auto gap-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <Coins className="h-4 w-4" />
              <span>কর আদায় করুন</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Profile Header Banner Card */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card/90 to-primary/5 p-4 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex size-12 sm:size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0 border border-primary/20 shadow-xs">
              <User className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                  হোল্ডিং: #{taxPayer.holding}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                  isPaid 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : "bg-amber-50 text-amber-700 border-amber-300"
                }`}>
                  {isPaid ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>চলতি অর্থবছরে পরিশোধিত</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                      <span>কর বকেয়া রয়েছে</span>
                    </>
                  )}
                </span>
              </div>

              <h1 className="font-display text-xl sm:text-3xl font-extrabold text-foreground tracking-tight break-words">
                {taxPayer.name}
              </h1>

              {taxPayer.fatherName && (
                <p className="text-sm text-muted-foreground font-body">
                  পিতা/স্বামী: <span className="font-medium text-foreground">{taxPayer.fatherName}</span>
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground font-body pt-1 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>ওয়ার্ড: <strong>{wardName}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>গ্রাম/মহল্লা: <strong>{taxPayer.village}</strong></span>
                </div>
                {taxPayer.phone && (
                  <div className="flex items-center gap-1.5 font-mono">
                    <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{taxPayer.phone}</span>
                  </div>
                )}
                {taxPayer.nid && (
                  <div className="flex items-center gap-1.5 font-mono">
                    <CreditCard className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>NID: {taxPayer.nid}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Section (Matched with List Stat UI) */}
      <div className="mb-4 sm:mb-8">
        {/* Mobile View (< sm): Compact Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:hidden">
          <Badge variant="outline" className="rounded-md border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary normal-case tracking-normal">
            ধার্যকৃত কর: ৳{taxPayer.tax?.toLocaleString() || 0}
          </Badge>
          <Badge variant="outline" className="rounded-md border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 normal-case tracking-normal">
            পরিশোধিত: ৳{taxPayer.totalPaid?.toLocaleString() || 0}
          </Badge>
          <Badge variant="outline" className={`rounded-md px-3 py-1.5 text-xs font-bold normal-case tracking-normal ${
            isPaid 
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
              : "border-amber-500/20 bg-amber-500/10 text-amber-600"
          }`}>
            অবস্থা: {isPaid ? "পরিশোধিত" : `বকেয়া (৳${taxPayer.dueAmount?.toLocaleString()})`}
          </Badge>
          <Badge variant="outline" className="rounded-md border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-600 normal-case tracking-normal">
            রসিদ: {taxPayer.payments?.length || 0} টি
          </Badge>
        </div>

        {/* Desktop & Tablet View (>= sm): Grid Cards */}
        <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Assessed Annual Tax */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold font-body">ধার্যকৃত বাৎসরিক কর</span>
              <Coins className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-foreground">
              ৳{taxPayer.tax?.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground font-body">বাৎসরিক নির্ধারিত এসেসমেন্ট</p>
          </div>

          {/* Total Paid Amount */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/40 p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-emerald-800">
              <span className="text-xs font-semibold font-body">সর্বমোট পরিশোধিত কর</span>
              <Receipt className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-emerald-700">
              ৳{taxPayer.totalPaid?.toLocaleString()}
            </div>
            <p className="text-xs text-emerald-600/90 font-body">যাবতীয় আদায়কৃত কর</p>
          </div>

          {/* Current Fiscal Year Status */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold font-body">চলতি অর্থবছর অবস্থা</span>
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div className="text-xl font-bold font-display">
              {isPaid ? (
                <span className="text-emerald-600">পরিশোধিত (৳{taxPayer.currentYearPaidAmount?.toLocaleString()})</span>
              ) : (
                <span className="text-amber-600">বকেয়া (৳{taxPayer.dueAmount?.toLocaleString()})</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-body">
              অর্থবছর: {taxPayer.currentFiscalYear?.year || "চলতি অর্থবছর"}
            </p>
          </div>

          {/* Total Receipts */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold font-body font-bold">মোট রসিদ সংখ্যা</span>
              <Receipt className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-foreground">
              {taxPayer.payments?.length || 0} টি
            </div>
            <p className="text-xs text-muted-foreground font-body">স্বীকৃত পরিশোধিত রসিদ</p>
          </div>
        </div>
      </div>

      {/* Main Tabs Container */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
        {/* Tab Header — 3-Column Grid without scrollbar */}
        <div className="grid grid-cols-3 border-b border-border/60 bg-muted/20 p-1 sm:p-1.5 gap-1">
          <Button
            variant="ghost"
            onClick={() => setActiveTab("history")}
            className={`w-full justify-center rounded-xl px-1 sm:px-4 py-2 sm:py-2.5 text-[11px] xs:text-xs sm:text-sm font-extrabold cursor-pointer transition-all truncate text-center h-auto ${
              activeTab === "history"
                ? "bg-card text-primary shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent"
            }`}
          >
            <span>পরিশোধ ইতিহাস</span>
          </Button>

          <Button
            variant="ghost"
            onClick={() => setActiveTab("card")}
            className={`w-full justify-center rounded-xl px-1 sm:px-4 py-2 sm:py-2.5 text-[11px] xs:text-xs sm:text-sm font-extrabold cursor-pointer transition-all truncate text-center h-auto ${
              activeTab === "card"
                ? "bg-card text-purple-600 shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent"
            }`}
          >
            <span>স্মার্ট কার্ড</span>
          </Button>

          <Button
            variant="ghost"
            onClick={() => setActiveTab("info")}
            className={`w-full justify-center rounded-xl px-1 sm:px-4 py-2 sm:py-2.5 text-[11px] xs:text-xs sm:text-sm font-extrabold cursor-pointer transition-all truncate text-center h-auto ${
              activeTab === "info"
                ? "bg-card text-primary shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent"
            }`}
          >
            <span>পরিচয় তথ্য</span>
          </Button>
        </div>

        {/* Tab 1: Payment History */}
        {activeTab === "history" && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-display text-sm sm:text-base font-bold text-foreground">
                সকল বাৎসরিক কর আদায় রেকর্ড (মোট: {taxPayer.payments?.length || 0})
              </h3>
              {!isPaid && (
                <Button
                  size="sm"
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full sm:w-auto gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                >
                  <Coins className="h-3.5 w-3.5" />
                  <span>নতুন কর আদায় করুন</span>
                </Button>
              )}
            </div>

            {!taxPayer.payments || taxPayer.payments.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-3 bg-muted/10 rounded-2xl border border-dashed border-border/80">
                <Receipt className="h-10 w-10 text-muted-foreground mx-auto" />
                <h4 className="font-bold text-sm text-foreground">এখনো কোনো কর পরিশোধ করা হয়নি</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  কর আদায় বোতামে ক্লিক করে ইউপি ক্যাশ রেজিস্টারে নতুন ট্যাক্স কালেকশন এন্ট্রি দিন।
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Payment Cards View (< md) */}
                <div className="grid grid-cols-1 gap-3 md:hidden">
              {taxPayer.payments.map((pm: any) => (
                <div
                  key={pm.id}
                  className="flex flex-col gap-2.5 rounded-xl border border-border/60 bg-muted/10 p-3.5 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                      #{pm.receiptNo || pm.id.slice(0, 8)}
                    </span>
                    <span className="text-sm font-bold font-mono text-emerald-600">
                      ৳{pm.amount.toLocaleString()}/-
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-body pt-1">
                    <div>
                      <span className="text-muted-foreground">অর্থবছর: </span>
                      <strong className="text-foreground">{pm.fiscalYear?.year || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">মেথড: </span>
                      <strong className="text-foreground">{pm.paymentMethod || "নগদ"}</strong>
                    </div>
                    <div className="col-span-2 text-muted-foreground font-mono">
                      তারিখ: {new Date(pm.paymentDate).toLocaleDateString("bn-BD")}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/50 flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedReceiptPayment(pm)
                        setShowReceiptModal(true)
                      }}
                      className="h-8 text-xs font-bold text-primary border-primary/20 hover:bg-primary/10 rounded-xl gap-1.5 px-3 cursor-pointer"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>রসিদ দেখুন</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Payment Table View (>= md) */}
            <div className="hidden md:block rounded-xl border border-border/60 overflow-hidden">
              <Table className="w-full text-left font-body">
                <TableHeader className="bg-muted/40 border-b border-border/60">
                  <TableRow>
                    <TableHead className="px-5 py-3 text-xs font-bold">রসিদ নং</TableHead>
                    <TableHead className="px-5 py-3 text-xs font-bold">অর্থবছর</TableHead>
                    <TableHead className="px-5 py-3 text-xs font-bold">পরিশোধের তারিখ</TableHead>
                    <TableHead className="px-5 py-3 text-xs font-bold">পেমেন্ট মেথড</TableHead>
                    <TableHead className="px-5 py-3 text-xs font-bold text-right">পরিমাণ</TableHead>
                    <TableHead className="px-5 py-3 text-xs font-bold text-right">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxPayer.payments.map((pm: any) => (
                    <TableRow key={pm.id} className="hover:bg-muted/30">
                      <TableCell className="px-5 py-3.5 font-mono text-xs font-bold text-primary">
                        #{pm.receiptNo || pm.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-xs font-medium">
                        {pm.fiscalYear?.year || "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-xs text-muted-foreground font-mono">
                        {new Date(pm.paymentDate).toLocaleDateString("bn-BD")}
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-xs">
                        <Badge variant="outline" className="text-xs font-normal">
                          {pm.paymentMethod || "নগদ"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-xs font-bold text-right font-mono text-emerald-600">
                        ৳{pm.amount.toLocaleString()}/-
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedReceiptPayment(pm)
                            setShowReceiptModal(true)
                          }}
                          className="h-7 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg gap-1 px-2.5 cursor-pointer"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span>রসিদ দেখুন</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
              </>
            )}
          </div>
        )}

        {/* Tab 2: Digital Smart Card View */}
        {activeTab === "card" && (
          <div className="p-6 sm:p-8 flex flex-col items-center justify-center">
            <HoldingCardViewComponent taxPayer={taxPayer} tenant={tenant} />
          </div>
        )}

        {/* Tab 3: Detailed Identity Information */}
        {activeTab === "info" && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 rounded-xl border border-border/60 p-5 bg-muted/10">
                <h4 className="font-display text-sm font-bold text-primary flex items-center gap-2 border-b border-border/60 pb-2">
                  <User className="h-4 w-4" />
                  <span>ব্যক্তিগত তথ্যসমূহ</span>
                </h4>
                <div className="space-y-3 text-xs font-body">
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">করদাতার নাম:</span>
                    <span className="font-bold text-foreground">{taxPayer.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">পিতা/স্বামীর নাম:</span>
                    <span className="font-bold text-foreground">{taxPayer.fatherName || "N/A"}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">জাতীয় পরিচয়পত্র (NID):</span>
                    <span className="font-mono font-bold text-foreground">{taxPayer.nid || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">মোবাইল নম্বর:</span>
                    <span className="font-mono font-bold text-foreground">{taxPayer.phone || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-xl border border-border/60 p-5 bg-muted/10">
                <h4 className="font-display text-sm font-bold text-primary flex items-center gap-2 border-b border-border/60 pb-2">
                  <MapPin className="h-4 w-4" />
                  <span>হোল্ডিং ও ঠিকানা বিবরণ</span>
                </h4>
                <div className="space-y-3 text-xs font-body">
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">হোল্ডিং নম্বর:</span>
                    <span className="font-mono font-extrabold text-primary">#{taxPayer.holding}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">ওয়ার্ড নম্বর ও নাম:</span>
                    <span className="font-bold text-foreground">{wardName}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">গ্রাম/মহল্লা:</span>
                    <span className="font-bold text-foreground">{taxPayer.village}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">নিবন্ধনের তারিখ:</span>
                    <span className="font-mono text-muted-foreground">
                      {new Date(taxPayer.createdAt).toLocaleDateString("bn-BD")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <TaxPaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        preselectedTaxPayer={taxPayer}
        onSuccessPayment={handlePaymentSuccess}
      />

      <TaxReceiptModal
        open={showReceiptModal}
        onOpenChange={setShowReceiptModal}
        payment={selectedReceiptPayment || createdPayment}
      />

      <TaxPayerCardModal
        open={showCardModal}
        onOpenChange={setShowCardModal}
        taxPayer={taxPayer}
      />
    </div>
  )
}
