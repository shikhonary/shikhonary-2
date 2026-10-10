"use client"

import React, { useState } from "react"
import { BillingCycleToggle } from "./billing-cycle-toggle"
import { SubscriptionPlanCard } from "./subscription-plan-card"
import type { SubscriptionPlanItem, BillingCycle } from "@/modules/subscription-plan/types"

interface SubscriptionPlansGridProps {
  plans: SubscriptionPlanItem[]
  currentPlanId?: string
  billingCycle: BillingCycle
  onBillingCycleChange: (cycle: BillingCycle) => void
  onSelectPlan: (plan: SubscriptionPlanItem) => void
  isLoading?: boolean
}

export const SubscriptionPlansGrid: React.FC<SubscriptionPlansGridProps> = ({
  plans,
  currentPlanId,
  billingCycle,
  onBillingCycleChange,
  onSelectPlan,
  isLoading,
}) => {
  return (
    <div className="space-y-8">
      {/* Centered Billing Cycle Switcher */}
      <BillingCycleToggle
        value={billingCycle}
        onChange={onBillingCycleChange}
      />

      {/* Grid of Plans */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-3xl bg-card border border-border/70 p-6 sm:p-7 shadow-xs flex flex-col justify-between overflow-hidden select-none animate-pulse space-y-6"
            >
              <div className="space-y-5">
                {/* Plan Header: Name, Badge and Subtitle */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-7 w-28 bg-muted/80 rounded-md" />
                    {i === 2 && (
                      <div className="h-5 w-20 bg-amber-500/20 rounded-full" />
                    )}
                  </div>
                  <div className="h-3.5 w-48 bg-muted/60 rounded-md" />
                </div>

                {/* Price Skeleton */}
                <div className="pt-2 pb-4 border-b border-border/40 space-y-2">
                  <div className="flex items-baseline gap-2">
                    <div className="h-10 w-32 bg-muted/80 rounded-lg" />
                    <div className="h-4 w-12 bg-muted/50 rounded-md" />
                  </div>
                  <div className="h-3 w-36 bg-muted/40 rounded-md" />
                </div>

                {/* Quota Highlights Box Skeleton (Papers, AI, OMR, etc.) */}
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-3.5 w-24 bg-muted/70 rounded-md" />
                    <div className="h-4 w-16 bg-muted/80 rounded-md" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-3.5 w-28 bg-muted/70 rounded-md" />
                    <div className="h-4 w-14 bg-muted/80 rounded-md" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-3.5 w-20 bg-muted/70 rounded-md" />
                    <div className="h-4 w-12 bg-muted/80 rounded-md" />
                  </div>
                </div>

                {/* Feature Bullets Checklist Skeletons */}
                <div className="space-y-2.5 pt-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 shrink-0" />
                      <div className="h-3.5 w-4/5 bg-muted/60 rounded-md" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button Skeleton */}
              <div className="h-11 w-full bg-muted/80 rounded-xl mt-6" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => (
            <SubscriptionPlanCard
              key={plan.id}
              plan={plan}
              billingCycle={billingCycle}
              isCurrentPlan={plan.id === currentPlanId}
              onSelectPlan={onSelectPlan}
            />
          ))}
        </div>
      )}
    </div>
  )
}
