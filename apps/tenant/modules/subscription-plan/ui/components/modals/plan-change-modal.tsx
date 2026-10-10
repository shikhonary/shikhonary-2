"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Sparkles, Check, ArrowRight, Loader2 } from "lucide-react"
import { toBengaliDigits, formatBengaliPrice } from "@/modules/subscription-plan/utils"
import { useChangeSubscriptionPlan } from "@/modules/subscription-plan/services/use-subscription"
import type { SubscriptionPlanItem, BillingCycle } from "@/modules/subscription-plan/types"

interface PlanChangeModalProps {
  selectedPlan: SubscriptionPlanItem | null
  currentPlanName?: string
  billingCycle: BillingCycle
  isOpen: boolean
  onClose: () => void
}

export const PlanChangeModal: React.FC<PlanChangeModalProps> = ({
  selectedPlan,
  currentPlanName,
  billingCycle,
  isOpen,
  onClose,
}) => {
  const [reason, setReason] = useState("")
  const changePlanMutation = useChangeSubscriptionPlan()

  if (!selectedPlan) return null

  const price =
    billingCycle === "YEARLY"
      ? selectedPlan.yearlyPriceBDT
      : selectedPlan.monthlyPriceBDT
  const period = billingCycle === "YEARLY" ? "বছর" : "মাস"

  const handleConfirm = () => {
    changePlanMutation.mutate(
      {
        planId: selectedPlan.id,
        billingCycle,
        reason: reason.trim() || undefined,
      },
      {
        onSuccess: () => {
          onClose()
        },
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 font-body">
        <DialogHeader className="space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-1">
            <Sparkles className="w-6 h-6" />
          </div>
          <DialogTitle className="text-xl font-bold font-headline text-center">
            প্ল্যান পরিবর্তন নিশ্চিত করুন
          </DialogTitle>
          <DialogDescription className="text-xs text-center text-muted-foreground">
            আপনার প্রতিষ্ঠানের বর্তমান প্যাকেজ থেকে নতুন প্ল্যানে পরিবর্তন করা হচ্ছে
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3 text-xs">
          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">বর্তমান প্ল্যান:</span>
              <strong className="text-foreground">{currentPlanName || "ফ্রি"}</strong>
            </div>

            <div className="flex items-center justify-between border-t border-border/40 pt-2">
              <span className="text-muted-foreground">নতুন নির্বাচিত প্ল্যান:</span>
              <strong className="text-indigo-600 dark:text-indigo-400 text-sm font-bold">
                {selectedPlan.displayName}
              </strong>
            </div>

            <div className="flex items-center justify-between border-t border-border/40 pt-2">
              <span className="text-muted-foreground">বিলিং সাইকেল:</span>
              <span className="font-semibold text-foreground">
                {billingCycle === "YEARLY" ? "বার্ষিক" : "মাসিক"}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-border/40 pt-2 text-sm">
              <span className="font-bold text-foreground">নির্ধারিত মূল্য:</span>
              <strong
                className="text-base font-black text-indigo-600 dark:text-indigo-400 font-solaiman"
                style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
              >
                {formatBengaliPrice(price)} / {period}
              </strong>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-row items-center gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={changePlanMutation.isPending}
            className="flex-1 h-11 rounded-2xl font-bold cursor-pointer"
          >
            বাতিল
          </Button>

          <Button
            type="button"
            onClick={handleConfirm}
            disabled={changePlanMutation.isPending}
            className="flex-1 h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
          >
            {changePlanMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>প্রসেসিং হচ্ছে...</span>
              </>
            ) : (
              <>
                <span>নিশ্চিত করুন</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
