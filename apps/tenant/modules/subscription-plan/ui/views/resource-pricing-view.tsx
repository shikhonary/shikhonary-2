"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import {
  Coins,
  Calculator,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Plus,
  Minus,
  HelpCircle,
  AlertCircle,
  FileText,
  BadgePercent,
  Layers,
  ArrowUpRight,
  BookOpen,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import {
  useCreditBalance,
  useQuestionTypePricing,
  useEstimatePaperCost,
} from "../../services/use-subscription"
import { toBengaliDigits, formatBengaliPrice } from "../../utils"
import { CreditRechargeModal } from "../components/credits/credit-recharge-modal"
import { TrustAndSupportSection } from "../components/trust-and-support/trust-and-support-section"

interface QuestionTypePricingItem {
  id: string
  nameEn: string
  nameBn: string
  label?: string | null
  mark: number
  creditCost?: number
  position: number
  descriptionEn?: string | null
  descriptionBn?: string | null
}

const CATEGORY_TABS = [
  { id: "all", label: "সব প্রশ্ন টাইপ" },
  { id: "creative", label: "রচনামূলক ও সৃজনশীল" },
  { id: "objective", label: "নৈর্ব্যক্তিক ও সংক্ষিপ্ত" },
  { id: "grammar", label: "ভাষা ও ব্যাকরণ" },
]

export const ResourcePricingView: React.FC = () => {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false)
  
  // Interactive Calculator state: map of questionTypeId -> count
  const [calculatorCounts, setCalculatorCounts] = useState<Record<string, number>>({})

  // Queries
  const { data: balanceData, isLoading: isBalanceLoading } = useCreditBalance()
  const { data: pricingData, isLoading: isPricingLoading, refetch } = useQuestionTypePricing()
  
  const creditBalance = balanceData?.creditBalance ?? 0
  const questionTypes: QuestionTypePricingItem[] = (pricingData as any) ?? []

  // Helper to categorize types
  const getCategory = (item: QuestionTypePricingItem): string => {
    const en = item.nameEn.toLowerCase()
    const bn = item.nameBn.toLowerCase()

    if (
      en.includes("creative") ||
      en.includes("cq") ||
      en.includes("essay") ||
      en.includes("paragraph") ||
      en.includes("letter") ||
      en.includes("application") ||
      en.includes("composition") ||
      en.includes("amplification") ||
      bn.includes("সৃজনশীল") ||
      bn.includes("রচনা") ||
      bn.includes("অনুচ্ছেদ") ||
      bn.includes("চিঠি") ||
      bn.includes("দরখাস্ত") ||
      bn.includes("ভাব-সম্প্রসারণ")
    ) {
      return "creative"
    }

    if (
      en.includes("grammar") ||
      en.includes("parts of speech") ||
      en.includes("punctuation") ||
      en.includes("verb") ||
      en.includes("tense") ||
      en.includes("synonym") ||
      en.includes("shuddho") ||
      bn.includes("ব্যাকরণ") ||
      bn.includes("বিরাম চিহ্ন") ||
      bn.includes("পদ")
    ) {
      return "grammar"
    }

    return "objective"
  }

  // Filtered types
  const filteredQuestionTypes = useMemo(() => {
    return questionTypes.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.nameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.label && item.label.toLowerCase().includes(searchQuery.toLowerCase()))

      if (!matchesSearch) return false

      if (activeTab === "all") return true
      return getCategory(item) === activeTab
    })
  }, [questionTypes, searchQuery, activeTab])

  // Calculator computations
  const totalCalculatedCredits = useMemo(() => {
    let sum = 0
    for (const [id, count] of Object.entries(calculatorCounts)) {
      if (count > 0) {
        const item = questionTypes.find((q) => q.id === id)
        const cost = item?.creditCost ?? 1
        sum += count * cost
      }
    }
    return sum
  }, [calculatorCounts, questionTypes])

  const totalCalculatedQuestions = useMemo(() => {
    return Object.values(calculatorCounts).reduce((acc, c) => acc + (c > 0 ? c : 0), 0)
  }, [calculatorCounts])

  const handleUpdateCount = (id: string, delta: number) => {
    setCalculatorCounts((prev) => {
      const current = prev[id] || 0
      const next = Math.max(0, current + delta)
      if (next === 0) {
        const updated = { ...prev }
        delete updated[id]
        return updated
      }
      return { ...prev, [id]: next }
    })
  }

  const handleResetCalculator = () => {
    setCalculatorCounts({})
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background relative isolate w-full min-w-0 font-body">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl relative z-10 space-y-10 w-full min-w-0">
        
        {/* ── Banner: Header & Credit Wallet Overview ────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-indigo-500/30">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-indigo-100">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span>মডেল রিসোর্স ও ইউনিট ক্রেডিট প্রাইসিং</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-headline tracking-tight">
                প্রশ্ন টাইপ অনুযায়ী ক্রেডিট মূল্যতালিকা
              </h1>

              <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed">
                স্বয়ংক্রিয় এআই ইঞ্জিন ও প্রশ্নব্যাংক থেকে প্রশ্ন সংযোজনে প্রতিটি প্রশ্ন টাইপের জন্য নির্ধারিত ইউনিট ক্রেডিট খরচ হয়। এখানে সকল প্রশ্ন প্রকারের ক্রেডিট রেট ও পেপারের আনুমানিক খরচ হিসাব করতে পারবেন।
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-indigo-200">
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>কোনো লুকানো চার্জ নেই</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>বিকল্প (Or) প্রশ্নেও একই রেট প্রযোজ্য</span>
                </div>
              </div>
            </div>

            {/* Wallet Quick Box */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex flex-col sm:flex-row lg:flex-col items-center justify-between gap-6 shrink-0 lg:min-w-[280px]">
              <div className="text-center sm:text-left lg:text-center w-full">
                <span className="text-xs uppercase tracking-wider font-semibold text-indigo-200 block">
                  আপনার বর্তমান ব্যালেন্স
                </span>
                <div className="mt-1 flex items-baseline justify-center sm:justify-start lg:justify-center gap-2">
                  <Coins className="w-7 h-7 text-amber-300 fill-amber-300/30 shrink-0 self-center" />
                  <span
                    className="text-4xl sm:text-5xl font-black font-solaiman text-white tracking-tight"
                    style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                  >
                    {isBalanceLoading ? "..." : toBengaliDigits(creditBalance)}
                  </span>
                  <span className="text-sm font-bold text-indigo-200">ক্রেডিট</span>
                </div>
              </div>

              <div className="w-full flex flex-col gap-2">
                <Button
                  size="lg"
                  onClick={() => setIsRechargeModalOpen(true)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Coins className="w-4 h-4 fill-slate-950" />
                  <span>ক্রেডিট রিচার্জ করুন</span>
                </Button>
                <Link href="/credits" className="w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs rounded-xl"
                  >
                    <span>টপ-আপ প্যাকেজসমূহ</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Main Section: Grid & Live Estimator ───────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Question Types List (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Filter Bar & Tabs */}
            <div className="bg-card border border-border p-4 rounded-2xl shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="প্রশ্ন টাইপের নাম বা লেবেল খুঁজুন..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-10 rounded-xl bg-muted/40 border-border text-xs sm:text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      ক্লিয়ার
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="px-3 py-1.5 rounded-lg border-border font-medium text-xs">
                    মোট: {toBengaliDigits(filteredQuestionTypes.length)} প্রকার
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => refetch()}
                    className="rounded-xl h-10 w-10 text-muted-foreground hover:text-foreground"
                    title="রিফ্রেশ করুন"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border/50">
                {CATEGORY_TABS.map((tab) => {
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                      }`}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* List / Cards */}
            {isPricingLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-2xl border border-border/70 bg-card shadow-xs animate-pulse space-y-3"
                  >
                    <div className="h-5 w-32 bg-muted/80 rounded" />
                    <div className="h-3 w-48 bg-muted/50 rounded" />
                    <div className="h-8 w-full bg-muted/30 rounded mt-4" />
                  </div>
                ))}
              </div>
            ) : filteredQuestionTypes.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-2xl p-8 space-y-3">
                <HelpCircle className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
                <h3 className="font-bold text-foreground text-base">কোনো প্রশ্ন টাইপ পাওয়া যায়নি</h3>
                <p className="text-xs text-muted-foreground">
                  অনুসন্ধান ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredQuestionTypes.map((item) => {
                  const creditCost = item.creditCost ?? 1
                  const inCalculator = calculatorCounts[item.id] || 0

                  return (
                    <div
                      key={item.id}
                      className="group relative flex flex-col justify-between p-5 rounded-2xl border border-border bg-card hover:border-indigo-500/40 hover:shadow-md transition-all duration-200"
                    >
                      <div className="space-y-3">
                        {/* Header: Title and Mark Badge */}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-headline font-bold text-foreground text-sm sm:text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {item.nameBn}
                            </h3>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">
                              {item.nameEn}
                            </p>
                          </div>

                          <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 font-solaiman">
                            মান: {toBengaliDigits(item.mark)}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-muted-foreground/90 line-clamp-2 min-h-[32px] leading-relaxed">
                          {item.descriptionBn || item.descriptionEn || "বিষয়ভিত্তিক প্রশ্নব্যাংক ও সৃজনশীল তৈরির রিসোর্স"}
                        </p>
                      </div>

                      {/* Footer: Credit Cost & Add to Calculator */}
                      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                        {/* Credit Badge */}
                        <div className="flex items-center gap-1.5 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 px-2.5 py-1.5 rounded-xl">
                          <Coins className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span
                            className="text-xs font-black text-amber-900 dark:text-amber-200 font-solaiman"
                            style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                          >
                            {toBengaliDigits(creditCost)} ক্রেডিট
                          </span>
                          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                            / প্রশ্ন
                          </span>
                        </div>

                        {/* Quick Calculator Stepper */}
                        <div className="flex items-center gap-1">
                          {inCalculator > 0 ? (
                            <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border">
                              <button
                                onClick={() => handleUpdateCount(item.id, -1)}
                                className="w-6 h-6 rounded-lg bg-card border border-border flex items-center justify-center text-xs hover:bg-muted active:scale-95 transition-transform"
                                title="কমিয়ে দিন"
                              >
                                <Minus className="w-3 h-3 text-muted-foreground" />
                              </button>
                              <span className="w-6 text-center text-xs font-bold font-solaiman">
                                {toBengaliDigits(inCalculator)}
                              </span>
                              <button
                                onClick={() => handleUpdateCount(item.id, 1)}
                                className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs hover:bg-indigo-700 active:scale-95 transition-transform"
                                title="বাড়িয়ে দিন"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateCount(item.id, 1)}
                              className="h-8 text-xs rounded-xl border-border hover:border-indigo-500/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-muted-foreground hover:text-foreground cursor-pointer font-bold"
                            >
                              <Plus className="w-3.5 h-3.5 mr-1 text-indigo-600 dark:text-indigo-400" />
                              <span>হিসাবে যোগ</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right Column: Live Estimator Calculator (4 Cols Sticky) */}
          <div className="lg:col-span-4 sticky top-6 space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-headline font-bold text-foreground text-base">
                      রিসোর্স ক্যালকুলেটর
                    </h2>
                    <p className="text-[11px] text-muted-foreground">
                      প্রশ্নপত্র তৈরির আনুমানিক ক্রেডিট হিসাব
                    </p>
                  </div>
                </div>

                {totalCalculatedQuestions > 0 && (
                  <button
                    onClick={handleResetCalculator}
                    className="text-[11px] text-muted-foreground hover:text-destructive font-semibold"
                  >
                    রিসেট
                  </button>
                )}
              </div>

              {/* Selected List */}
              {totalCalculatedQuestions === 0 ? (
                <div className="text-center py-8 px-4 rounded-2xl bg-muted/30 border border-dashed border-border/80 space-y-2">
                  <Coins className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                  <p className="text-xs font-semibold text-foreground">
                    কোনো প্রশ্ন নির্বাচন করা হয়নি
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    বামপাশের তালিকা থেকে প্রশ্ন প্রকারের পাশে <strong>"হিসাবে যোগ"</strong> বাটনে চাপ দিন
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                  {Object.entries(calculatorCounts).map(([id, count]) => {
                    const item = questionTypes.find((q) => q.id === id)
                    if (!item || count <= 0) return null
                    const unitCost = item.creditCost ?? 1
                    const subtotal = count * unitCost

                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-foreground truncate">
                            {item.nameBn}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {toBengaliDigits(count)} × {toBengaliDigits(unitCost)} ক্রেডিট
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-bold text-foreground font-solaiman text-sm">
                            {toBengaliDigits(subtotal)} ক্রেডিট
                          </span>
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleUpdateCount(id, -1)}
                              className="w-5 h-5 rounded bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
                            >
                              -
                            </button>
                            <button
                              onClick={() => handleUpdateCount(id, 1)}
                              className="w-5 h-5 rounded bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Total Summary Box */}
              <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>মোট প্রশ্ন সংখ্যা:</span>
                  <span className="font-bold text-foreground font-solaiman">
                    {toBengaliDigits(totalCalculatedQuestions)} টি
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm pt-2 border-t border-indigo-200/60 dark:border-indigo-800/60">
                  <span className="font-bold text-foreground">প্রয়োজনীয় ক্রেডিট:</span>
                  <div className="flex items-baseline gap-1 text-indigo-700 dark:text-indigo-300">
                    <span
                      className="text-2xl font-black font-solaiman"
                      style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                    >
                      {toBengaliDigits(totalCalculatedCredits)}
                    </span>
                    <span className="text-xs font-bold">ক্রেডিট</span>
                  </div>
                </div>

                {/* Balance Comparison Alert */}
                {totalCalculatedCredits > 0 && (
                  <div className="pt-2 text-[11px] leading-relaxed">
                    {creditBalance >= totalCalculatedCredits ? (
                      <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স রয়েছে</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5 text-amber-800 dark:text-amber-300">
                        <div className="flex items-center gap-1.5 font-bold">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            ঘাটতি: {toBengaliDigits(totalCalculatedCredits - creditBalance)} ক্রেডিট
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          প্রশ্নপত্র তৈরির জন্য প্রয়োজনীয় ক্রেডিট সংগ্রহ করুন
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                {creditBalance < totalCalculatedCredits && totalCalculatedCredits > 0 ? (
                  <Button
                    onClick={() => setIsRechargeModalOpen(true)}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-xs"
                  >
                    <Coins className="w-4 h-4 mr-1.5 fill-slate-950" />
                    <span>প্রয়োজনীয় ক্রেডিট টপ-আপ করুন</span>
                  </Button>
                ) : (
                  <Link href="/question-papers/create" className="w-full block">
                    <Button
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                    >
                      <FileText className="w-4 h-4 mr-1.5" />
                      <span>প্রশ্নপত্র তৈরি করতে যান</span>
                    </Button>
                  </Link>
                )}

                <Link href="/credits" className="w-full block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-xl border-border text-xs text-muted-foreground hover:text-foreground"
                  >
                    <span>ক্রেডিট হিস্ট্রি ও বিস্তারিত</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Tip Card */}
            <div className="p-4 rounded-2xl bg-card border border-border text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>বিকল্প প্রশ্ন (Alternative) পলিসি</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                কোনো প্রশ্নে বিকল্প বা অথবা প্রশ্ন যুক্ত করা হলে সংশ্লিষ্ট প্রশ্ন টাইপের ক্রেডিট রেট স্বয়ংক্রিয়ভাবে প্রযোজ্য হবে।
              </p>
            </div>
          </div>
        </div>

        {/* ── Trust, FAQ & Support ───────────────────────── */}
        <section className="pt-4">
          <TrustAndSupportSection context="credits" />
        </section>
      </main>

      {/* Credit Recharge Modal */}
      <CreditRechargeModal
        isOpen={isRechargeModalOpen}
        onClose={() => setIsRechargeModalOpen(false)}
        currentBalance={creditBalance}
      />
    </div>
  )
}
