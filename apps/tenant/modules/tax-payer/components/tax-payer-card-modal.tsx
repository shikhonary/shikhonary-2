"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { CreditCard } from "lucide-react"
import { HoldingCardViewComponent } from "./holding-card-view-component"
import { TaxPayerCardData } from "./holding-card-front"
import { useTenant } from "@/modules/layout/ui/components/tenant-provider"

interface TaxPayerCardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taxPayer: TaxPayerCardData | null
}

export const TaxPayerCardModal: React.FC<TaxPayerCardModalProps> = ({
  open,
  onOpenChange,
  taxPayer,
}) => {
  const { tenant } = useTenant()

  if (!taxPayer) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border-border bg-card shadow-2xl p-4 sm:p-6 overflow-hidden max-w-[calc(100vw-1.5rem)]">
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0 border-b border-border/50 pb-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0 border border-emerald-500/20">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-base font-extrabold font-display">
              হোল্ডিং স্মার্ট কার্ড — {taxPayer.name}
            </DialogTitle>
            <p className="text-xs text-muted-foreground font-body mt-0.5">
              হোল্ডিং নং: #{taxPayer.holding} | {tenant.nameBn || tenant.unionName || tenant.name}
            </p>
          </div>
        </DialogHeader>

        <div className="pt-2">
          <HoldingCardViewComponent taxPayer={taxPayer} tenant={tenant} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
