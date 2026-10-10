"use client"

import React, { useState } from "react"
import {
  Coins,
  Sparkles,
  Zap,
  Check,
  CreditCard,
  Lock,
  Loader2,
  X,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { toBengaliDigits, formatBengaliPrice } from "@/modules/subscription-plan/utils"
import {
  useCreditPacks,
  usePurchaseCreditPack,
} from "@/modules/subscription-plan/services/use-subscription"

interface CreditRechargeModalProps {
  isOpen: boolean
  onClose: () => void
  currentBalance?: number
  initialPackId?: string | null
}

export const CreditRechargeModal: React.FC<CreditRechargeModalProps> = ({
  isOpen,
  onClose,
  currentBalance = 0,
  initialPackId,
}) => {
  const { data: packs, isLoading: isPacksLoading } = useCreditPacks()
  const { mutateAsync: purchasePack, isPending: isPurchasing } =
    usePurchaseCreditPack()

  const [selectedPackId, setSelectedPackId] = useState<string>("pack_standard")
  const [paymentMethod, setPaymentMethod] = useState<"BKASH" | "NAGAD" | "ROCKET" | "CARD">("BKASH")

  React.useEffect(() => {
    if (initialPackId) {
      setSelectedPackId(initialPackId)
    }
  }, [initialPackId, isOpen])

  const selectedPack = packs?.find((p: any) => p.id === selectedPackId)

  const handleConfirmPurchase = async () => {
    if (!selectedPackId) return
    try {
      await purchasePack({
        packId: selectedPackId,
        paymentMethod,
      })
      onClose()
    } catch {
      // Error handled in hook toast
    }
  }

  const paymentMethods = [
    { id: "BKASH" as const, name: "bKash", color: "bg-[#E2136E]/10 text-[#E2136E] border-[#E2136E]/30" },
    { id: "NAGAD" as const, name: "Nagad", color: "bg-[#F7941D]/10 text-[#F7941D] border-[#F7941D]/30" },
    { id: "ROCKET" as const, name: "Rocket", color: "bg-[#8C3494]/10 text-[#8C3494] border-[#8C3494]/30" },
    { id: "CARD" as const, name: "Card / IB", color: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-7 bg-background border border-border/60 shadow-2xl">
        <DialogHeader className="pb-3 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5 fill-amber-500/20" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold font-headline text-foreground">
                  এআই ও প্রশ্ন ক্রেডিট রিচার্জ
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground font-body mt-0.5">
                  জরুরি প্রশ্নপত্র তৈরি ও এআই অ্যাসিস্ট্যান্ট ব্যবহারের জন্য অতিরিক্ত ক্রেডিট টপ-আপ করুন
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Current Balance Bar */}
        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-body">
            বর্তমান অবশিষ্ট ব্যালেন্স:
          </span>
          <span
            className="text-base font-bold text-foreground font-solaiman flex items-center gap-1.5"
            style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
          >
            <Coins className="w-4 h-4 text-amber-500" />
            {toBengaliDigits(currentBalance)} ক্রেডিট
          </span>
        </div>

        {/* Credit Packs Grid */}
        <div className="space-y-3 pt-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            রিচার্জ প্যাক নির্বাচন করুন
          </p>

          {isPacksLoading ? (
            <div className="space-y-2.5 py-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {packs?.map((pack: any) => {
                const isSelected = selectedPackId === pack.id

                return (
                  <div
                    key={pack.id}
                    onClick={() => setSelectedPackId(pack.id)}
                    className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between select-none ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-500/5 shadow-md ring-2 ring-indigo-500/20"
                        : "border-border/60 hover:border-border hover:bg-muted/30"
                    }`}
                  >
                    {pack.badge && (
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-linear-to-r from-amber-500 to-amber-600 text-white text-[10px] font-bold shadow-xs">
                        {pack.badge}
                      </span>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold font-headline text-foreground">
                          {pack.displayName}
                        </h4>
                        {isSelected && (
                          <div className="w-4.5 h-4.5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] text-muted-foreground font-body line-clamp-1">
                        {pack.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border/40 mt-3 flex items-baseline justify-between">
                      <div>
                        <span
                          className="text-lg font-extrabold font-solaiman text-foreground tracking-tight"
                          style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                        >
                          {toBengaliDigits(pack.totalCredits)}
                        </span>
                        <span className="text-[11px] font-medium text-muted-foreground ml-1">
                          ক্রেডিট
                        </span>
                      </div>

                      <span
                        className="text-base font-bold text-indigo-600 dark:text-indigo-400 font-solaiman"
                        style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                      >
                        {formatBengaliPrice(pack.priceBDT)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Payment Methods Selector */}
        <div className="space-y-2 pt-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            পেমেন্ট মাধ্যম বেছে নিন
          </p>
          <div className="grid grid-cols-4 gap-2">
            {paymentMethods.map((pm) => (
              <button
                key={pm.id}
                type="button"
                onClick={() => setPaymentMethod(pm.id)}
                className={`py-2 px-1 rounded-xl border text-xs font-bold font-headline transition-all text-center cursor-pointer ${
                  paymentMethod === pm.id
                    ? `${pm.color} ring-2 ring-indigo-500/40 shadow-xs font-extrabold`
                    : "border-border/60 hover:bg-muted/40 text-muted-foreground"
                }`}
              >
                {pm.name}
              </button>
            ))}
          </div>
        </div>

        {/* Security & Action Row */}
        <div className="pt-4 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-body">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>তাত্ক্ষণিকভাবে ক্রেডিট সক্রিয় হবে</span>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPurchasing}
              className="rounded-xl h-10 px-4 text-xs font-semibold cursor-pointer"
            >
              বাতিল
            </Button>
            <Button
              type="button"
              onClick={handleConfirmPurchase}
              disabled={isPurchasing || !selectedPack}
              className="rounded-xl h-10 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-2 active:scale-95 transition-all"
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>প্রসেসিং হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span>
                    {formatBengaliPrice(selectedPack?.priceBDT || 0)} পরিশোধ করুন
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
