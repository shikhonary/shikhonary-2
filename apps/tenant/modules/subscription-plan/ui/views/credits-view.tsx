"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  Coins,
  Sparkles,
  Zap,
  Check,
  CreditCard,
  Lock,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  History,
  BadgePercent,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  useCreditBalance,
  useCreditPacks,
  useCreditTransactions,
} from "../../services/use-subscription"
import { toBengaliDigits, formatBengaliPrice } from "../../utils"
import { CreditRechargeModal } from "../components/credits/credit-recharge-modal"
import { CreditTransactionsSection } from "../components/credits/credit-transactions-section"
import { TrustAndSupportSection } from "../components/trust-and-support/trust-and-support-section"

export const CreditsView: React.FC = () => {
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false)
  const [selectedPackIdForModal, setSelectedPackIdForModal] = useState<string | null>(null)

  const { data: balanceData, isLoading: isBalanceLoading } = useCreditBalance()
  const { data: packs, isLoading: isPacksLoading } = useCreditPacks()
  const { data: transactionsData, isLoading: isTransactionsLoading } = useCreditTransactions(5)

  const creditBalance = balanceData?.creditBalance ?? 0

  const handleOpenRechargeWithPack = (packId?: string) => {
    if (packId) {
      setSelectedPackIdForModal(packId)
    }
    setIsRechargeModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background relative isolate w-full min-w-0">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl relative z-10 space-y-10 w-full min-w-0">
        
        {/* ── Banner: Credit Wallet & Overview ────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-white p-6 sm:p-10 shadow-xl border border-amber-500/30">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-100">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>এআই ক্রেডিট ও টপ-আপ ওয়ালেট</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-headline tracking-tight">
                প্রশ্ন তৈরির ক্রেডিট প্ল্যান ও রিচার্জ
              </h1>

              <p className="text-sm sm:text-base text-amber-100/90 leading-relaxed font-body">
                আপনার প্রতিষ্ঠানের প্রশ্নব্যাংক থেকে স্বয়ংক্রিয় এআই প্রশ্ন তৈরিতে প্রয়োজন ক্রেডিট। নির্ধারিত সাবস্ক্রিপশন কোটা শেষ হলে যেকোনো সময় সাশ্রয়ী মূল্যে ক্রেডিট টপ-আপ করুন।
              </p>
            </div>

            {/* Wallet Box */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex flex-col sm:flex-row lg:flex-col items-center justify-between gap-6 shrink-0 lg:min-w-[280px]">
              <div className="text-center sm:text-left lg:text-center w-full">
                <span className="text-xs uppercase tracking-wider font-semibold text-amber-200 block">
                  বর্তমান ব্যালেন্স
                </span>
                <div className="mt-1 flex items-baseline justify-center sm:justify-start lg:justify-center gap-2">
                  <Coins className="w-7 h-7 text-amber-300 fill-amber-300/30 shrink-0 self-center" />
                  <span
                    className="text-4xl sm:text-5xl font-black font-solaiman text-white tracking-tight"
                    style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                  >
                    {isBalanceLoading ? "..." : toBengaliDigits(creditBalance)}
                  </span>
                  <span className="text-sm font-bold text-amber-200">ক্রেডিট</span>
                </div>
              </div>

              <Button
                size="lg"
                onClick={() => handleOpenRechargeWithPack()}
                className="w-full bg-white hover:bg-white/90 text-amber-900 font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-amber-700 text-amber-700" />
                <span>তাৎক্ষণিক রিচার্জ</span>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Credit Packs Showcase ─────────────────────────────────── */}
        <section className="space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold font-headline text-foreground">
              ক্রেডিট টপ-আপ প্যাকসমূহ
            </h2>
            <p className="text-sm text-muted-foreground font-body">
              আপনার প্রতিষ্ঠানের প্রয়োজনের সাথে সামঞ্জস্যপূর্ণ প্যাক বেছে নিয়ে সাশ্রয়ী মূল্যে ক্রেডিট সংগ্রহ করুন
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isPacksLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl p-6 bg-card border border-border/70 shadow-xs flex flex-col justify-between overflow-hidden select-none animate-pulse"
                >
                  <div className="space-y-4">
                    {/* Header: Title and Badge Skeleton */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="h-6 w-24 bg-muted/80 rounded-md" />
                      <div className="h-4.5 w-14 bg-emerald-500/15 rounded-full" />
                    </div>

                    {/* Subtitle / Description Skeleton */}
                    <div className="space-y-1.5 min-h-[32px]">
                      <div className="h-3 w-full bg-muted/60 rounded-md" />
                      <div className="h-3 w-2/3 bg-muted/50 rounded-md" />
                    </div>

                    {/* Total Credits Box Skeleton */}
                    <div className="my-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/15 text-center flex flex-col items-center justify-center space-y-2">
                      <div className="h-8 w-24 bg-amber-500/20 rounded-lg" />
                      <div className="h-3 w-32 bg-amber-500/15 rounded-md" />
                    </div>

                    {/* Price Skeleton */}
                    <div className="mb-6 text-center space-y-1.5 flex flex-col items-center">
                      <div className="h-7 w-20 bg-muted/80 rounded-md" />
                      <div className="h-3 w-28 bg-muted/50 rounded-md" />
                    </div>

                    {/* Feature Checklist Skeletons */}
                    <div className="space-y-2.5 mb-6 pt-1 border-t border-border/40">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="flex items-center gap-2">
                          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 shrink-0" />
                          <div className="h-3 w-4/5 bg-muted/60 rounded-md" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Button Skeleton */}
                  <div className="h-10 w-full bg-muted/80 rounded-xl" />
                </div>
              ))
            ) : (
              packs?.map((pack: any) => {
                const isPopular = pack.isPopular
                const hasBonus = pack.bonusCredits > 0

                return (
                  <div
                    key={pack.id}
                    className={`relative rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between ${
                      isPopular
                        ? "bg-amber-500/5 dark:bg-amber-500/10 border-2 border-amber-500 shadow-lg shadow-amber-500/10"
                        : "bg-card border border-border hover:border-amber-500/40 shadow-xs hover:shadow-md"
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-200" />
                        <span>জনপ্রিয় প্যাক</span>
                      </div>
                    )}

                    <div>
                      {/* Pack Title & Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="text-lg font-bold font-headline text-foreground">
                          {pack.displayName || pack.nameBn || pack.name}
                        </h3>
                        {hasBonus && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                            +{toBengaliDigits(pack.bonusCredits)} বোনাস
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                        {pack.descriptionBn || pack.description || "প্রশ্ন তৈরির জন্য আদর্শ"}
                      </p>

                      {/* Total Credits */}
                      <div className="my-6 p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-center">
                        <div className="flex items-baseline justify-center gap-1.5">
                          <span
                            className="text-3xl font-extrabold text-amber-900 dark:text-amber-200 font-solaiman"
                            style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                          >
                            {toBengaliDigits(pack.totalCredits)}
                          </span>
                          <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                            ক্রেডিট
                          </span>
                        </div>
                        {hasBonus && (
                          <p className="text-[11px] text-muted-foreground mt-1">
                            মূল: {toBengaliDigits(pack.credits)} + বোনাস: {toBengaliDigits(pack.bonusCredits)}
                          </p>
                        )}
                      </div>

                      {/* Pricing */}
                      <div className="mb-6 text-center">
                        <div className="flex items-baseline justify-center gap-1">
                          <span
                            className="text-2xl font-bold font-solaiman text-foreground"
                            style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                          >
                            {formatBengaliPrice(pack.priceBDT)}
                          </span>
                          <span className="text-xs text-muted-foreground">এককালীন</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          প্রতি ক্রেডিট মাত্র ৳{(pack.priceBDT / pack.totalCredits).toFixed(2)}
                        </p>
                      </div>

                      {/* Features */}
                      <ul className="space-y-2 text-xs text-muted-foreground mb-6">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>তাৎক্ষণিক অ্যাক্টিভেশন</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>কোনো মেয়াদোত্তীর্ণ হওয়ার তারিখ নেই</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>সব এআই মডেলের সাথে ব্যবহারযোগ্য</span>
                        </li>
                      </ul>
                    </div>

                    <Button
                      onClick={() => handleOpenRechargeWithPack(pack.id)}
                      variant={isPopular ? "default" : "outline"}
                      className={`w-full font-bold rounded-xl cursor-pointer ${
                        isPopular
                          ? "bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                          : "border-border hover:border-amber-500/50 hover:bg-amber-500/5"
                      }`}
                    >
                      <span>ক্রয় করুন</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                )
              })
            )}
          </div>
        </section>

        {/* ── Credit Transactions Section ───────────────────────────── */}
        <section>
          <CreditTransactionsSection
            creditBalance={creditBalance}
            transactions={transactionsData?.transactions as any}
            isLoading={isTransactionsLoading}
          />
        </section>

        {/* ── Frictionless Trust Badges & FAQ (Credits Specific) ────── */}
        <section className="pt-2">
          <TrustAndSupportSection context="credits" />
        </section>
      </main>

      {/* Credit Recharge Top-up Modal */}
      <CreditRechargeModal
        isOpen={isRechargeModalOpen}
        onClose={() => {
          setIsRechargeModalOpen(false)
          setSelectedPackIdForModal(null)
        }}
        currentBalance={creditBalance}
        initialPackId={selectedPackIdForModal}
      />
    </div>
  )
}
