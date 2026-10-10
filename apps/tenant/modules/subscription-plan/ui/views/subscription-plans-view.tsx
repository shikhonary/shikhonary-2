"use client"

import React, { useState } from "react"
import {
  useMySubscription,
  useAvailableSubscriptionPlans,
  useSubscriptionInvoices,
  useCreditTransactions,
} from "../../services/use-subscription"
import { SubscriptionHeader } from "../components/subscription-header"
import { SubscriptionKpiStats } from "../components/subscription-kpi-stats"
import { SubscriptionPlansGrid } from "../components/plans-grid/subscription-plans-grid"
import { ResourceQuotaMeters } from "../components/resource-usage/resource-quota-meters"
import { CreditTransactionsSection } from "../components/credits/credit-transactions-section"
import { InvoicesSection } from "../components/invoices/invoices-section"
import { TrustAndSupportSection } from "../components/trust-and-support/trust-and-support-section"
import { PlanChangeModal } from "../components/modals/plan-change-modal"
import { CreditRechargeModal } from "../components/credits/credit-recharge-modal"
import { MobileSubscriptionView } from "../components/mobile/mobile-subscription-view"
import type { SubscriptionPlanItem, BillingCycle } from "../../types"

export const SubscriptionPlansView: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("MONTHLY")
  const [selectedPlanForModal, setSelectedPlanForModal] =
    useState<SubscriptionPlanItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false)

  // Fetch subscription details
  const { data: subscriptionDetails, isLoading: isSubLoading } =
    useMySubscription()

  // Fetch available plans
  const { data: plansData, isLoading: isPlansLoading } =
    useAvailableSubscriptionPlans()
  const rawPlans = (plansData?.plans as any[]) ?? []
  const plans: SubscriptionPlanItem[] = rawPlans
    .filter((p) => p.isActive && p.name !== "free" && p.monthlyPriceBDT > 0 && ["teacher", "academy", "campus"].includes(p.name))
    .sort((a, b) => a.monthlyPriceBDT - b.monthlyPriceBDT)
    .map((p) => ({
      id: p.id,
      name: p.name,
      displayName: p.displayName,
      description: p.description,
      monthlyPriceBDT: p.monthlyPriceBDT,
      yearlyPriceBDT: p.yearlyPriceBDT,
      features: p.features,
      isActive: p.isActive,
      isPopular: p.isPopular,
      defaultStudentLimit: p.defaultStudentLimit,
      defaultTeacherLimit: p.defaultTeacherLimit,
      defaultExamLimit: p.defaultExamLimit,
      defaultStorageLimit: p.defaultStorageLimit,
      defaultCreditLimit: p.defaultCreditLimit,
      canCreateExams: p.canCreateExams,
      canCollectFees: p.canCollectFees,
      canUseLms: p.canUseLms,
      canManageAttendance: p.canManageAttendance,
      canManageLibrary: p.canManageLibrary,
      canManageTransport: p.canManageTransport,
      canSendSms: p.canSendSms,
      canUseCustomDomain: p.canUseCustomDomain,
      canUseAiFeatures: p.canUseAiFeatures,
      canExportReports: p.canExportReports,
    }))

  // Fetch invoices
  const { data: invoicesData, isLoading: isInvoicesLoading } =
    useSubscriptionInvoices()
  const invoices = (invoicesData as any[]) ?? []

  // Fetch credit transactions
  const { data: creditTxData, isLoading: isCreditLoading } =
    useCreditTransactions(10)
  const creditTransactions = (creditTxData?.transactions as any[]) ?? []

  const currentPlanId = subscriptionDetails?.subscription?.planId
  const currentPlanName = subscriptionDetails?.subscription?.plan?.displayName

  const handleOpenPlanModal = (plan: SubscriptionPlanItem) => {
    setSelectedPlanForModal(plan)
    setIsModalOpen(true)
  }

  const handleHeaderUpgradeClick = () => {
    // Find next higher plan or standard/premium
    const higherPlan =
      plans.find((p) => p.id !== currentPlanId && p.name !== "free") ||
      plans[0]
    if (higherPlan) {
      setSelectedPlanForModal(higherPlan)
      setIsModalOpen(true)
    }
  }

  return (
    <>
      {/* ── Desktop View (Hidden on mobile) ───────────────────────── */}
      <div className="hidden md:block min-h-screen bg-slate-50/50 dark:bg-background relative isolate w-full min-w-0">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl relative z-10 space-y-8 w-full min-w-0">
          {/* Header Banner */}
          <SubscriptionHeader
            subscriptionDetails={subscriptionDetails as any}
            isLoading={isSubLoading}
            onOpenUpgradeModal={handleHeaderUpgradeClick}
          />

          {/* 4 KPI Metrics */}
          <SubscriptionKpiStats
            subscriptionDetails={subscriptionDetails as any}
            isLoading={isSubLoading}
            onOpenRechargeModal={() => setIsRechargeModalOpen(true)}
          />

          {/* Available Subscription Plans Grid */}
          <section className="space-y-4 pt-4">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold font-headline text-foreground">
                উপলব্ধ সাবস্ক্রিপশন প্ল্যানসমূহ
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-body max-w-xl mx-auto">
                আপনার প্রতিষ্ঠানের চাহিদা অনুযায়ী সঠিক প্ল্যানটি বেছে নিন এবং যেকোনো সময় আপগ্রেড করুন
              </p>
            </div>

            <SubscriptionPlansGrid
              plans={plans}
              currentPlanId={currentPlanId}
              billingCycle={billingCycle}
              onBillingCycleChange={setBillingCycle}
              onSelectPlan={handleOpenPlanModal}
              isLoading={isPlansLoading}
            />
          </section>

          {/* Resource Usage & Quota Breakdown */}
          <section className="pt-4">
            <ResourceQuotaMeters
              subscriptionDetails={subscriptionDetails as any}
            />
          </section>



          {/* Frictionless Trust Badges, FAQ & Live Support Contact Bar */}
          <section className="pt-4">
            <TrustAndSupportSection context="subscription" />
          </section>
        </main>
      </div>

      {/* ── Mobile View (Hidden on desktop) ────────────────────────── */}
      <div className="md:hidden -m-4 sm:-m-6">
        <MobileSubscriptionView
          subscriptionDetails={subscriptionDetails as any}
          plans={plans}
          invoices={invoices}
          creditTransactions={creditTransactions}
          billingCycle={billingCycle}
          onBillingCycleChange={setBillingCycle}
          onSelectPlan={handleOpenPlanModal}
          isLoading={isSubLoading || isPlansLoading}
        />
      </div>

      {/* Plan Change Modal */}
      <PlanChangeModal
        selectedPlan={selectedPlanForModal}
        currentPlanName={currentPlanName}
        billingCycle={billingCycle}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedPlanForModal(null)
        }}
      />

      {/* Credit Recharge Top-up Modal */}
      <CreditRechargeModal
        isOpen={isRechargeModalOpen}
        onClose={() => setIsRechargeModalOpen(false)}
        currentBalance={subscriptionDetails?.usage?.credits}
      />
    </>
  )
}
