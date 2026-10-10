"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Sparkles,
  Zap,
  Clock,
  Coins,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Receipt,
  Layers,
  ChevronRight,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { BillingCycleToggle } from "../plans-grid/billing-cycle-toggle"
import { SubscriptionPlanCard } from "../plans-grid/subscription-plan-card"
import { ResourceQuotaMeters } from "../resource-usage/resource-quota-meters"
import { CreditTransactionsSection } from "../credits/credit-transactions-section"
import { InvoicesSection } from "../invoices/invoices-section"
import { TrustAndSupportSection } from "../trust-and-support/trust-and-support-section"
import { toBengaliDigits, formatBengaliDate } from "@/modules/subscription-plan/utils"
import type {
  TenantSubscriptionDetails,
  SubscriptionPlanItem,
  BillingCycle,
  InvoiceItem,
} from "@/modules/subscription-plan/types"

type MobileTab = "plans" | "quotas"

interface MobileSubscriptionViewProps {
  subscriptionDetails?: TenantSubscriptionDetails | null
  plans: SubscriptionPlanItem[]
  invoices?: InvoiceItem[]
  creditTransactions?: any[]
  billingCycle: BillingCycle
  onBillingCycleChange: (cycle: BillingCycle) => void
  onSelectPlan: (plan: SubscriptionPlanItem) => void
  isLoading?: boolean
}

export const MobileSubscriptionView: React.FC<MobileSubscriptionViewProps> = ({
  subscriptionDetails,
  plans,
  invoices = [],
  creditTransactions = [],
  billingCycle,
  onBillingCycleChange,
  onSelectPlan,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<MobileTab>("plans")

  const sub = subscriptionDetails?.subscription
  const plan = sub?.plan
  const remainingDays = subscriptionDetails?.remainingDays ?? 0

  const tabs = [
    { id: "plans" as MobileTab, label: "প্ল্যানসমূহ", count: plans.length },
    { id: "quotas" as MobileTab, label: "কোটা ও ব্যবহার", count: null },
  ]

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background pb-16">
      {/* ── Mobile Sticky Top Header Section ── */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-xl z-40 border-b border-border/40 px-2.5 pt-3 pb-2.5 space-y-2.5 shadow-2xs w-full min-w-0">
        {/* Row 1: Back Button, Title, Badges & CTA */}
        <div className="flex items-center justify-between gap-2 min-w-0 w-full">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <Link
              href="/"
              className="w-9 h-9 rounded-xl bg-muted/50 hover:bg-muted border border-border/40 flex items-center justify-center text-foreground transition-all shrink-0 shadow-2xs active:scale-95"
              title="ড্যাশবোর্ডে ফিরুন"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-bold font-headline text-foreground truncate leading-tight">
                সাবস্ক্রিপশন ও প্ল্যান
              </h1>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-body truncate mt-0.5">
                <span className="px-1.5 py-0.2 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20 text-[10px] shrink-0">
                  {plan?.displayName || "শিক্ষক প্যাক"}
                </span>
                <span className="text-muted-foreground/40">•</span>
                <span className="truncate">বাকি {toBengaliDigits(remainingDays)} দিন</span>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setActiveTab("plans")}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-8.5 px-3 rounded-xl shadow-xs shrink-0 active:scale-95 transition-all"
          >
            <Zap className="w-3.5 h-3.5 mr-1" />
            <span>আপগ্রেড</span>
          </Button>
        </div>

        {/* Row 2: Horizontal Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5 pb-1">
          {tabs.map((t) => {
            const isActive = activeTab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-headline whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-muted/40 hover:bg-muted text-muted-foreground border border-border/40"
                }`}
              >
                <span>{t.label}</span>
                {t.count !== null && (
                  <span
                    className={`font-solaiman text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                    style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                  >
                    ({toBengaliDigits(t.count)})
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </header>

      {/* ── Main Content Stream ── */}
      <main className="px-2.5 py-3 space-y-4">
        {activeTab === "plans" && (
          <div className="space-y-4">
            <BillingCycleToggle
              value={billingCycle}
              onChange={onBillingCycleChange}
            />

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-80 rounded-3xl bg-card border border-border/50 animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {plans.map((p) => (
                  <SubscriptionPlanCard
                    key={p.id}
                    plan={p}
                    billingCycle={billingCycle}
                    isCurrentPlan={p.id === sub?.planId}
                    onSelectPlan={onSelectPlan}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "quotas" && (
          <ResourceQuotaMeters subscriptionDetails={subscriptionDetails} />
        )}

        {/* ── Frictionless Trust Badges, FAQ & Live Support Contact Bar ── */}
        <div className="pt-2">
          <TrustAndSupportSection />
        </div>
      </main>
    </div>
  )
}
