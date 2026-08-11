"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { CreditCard } from "lucide-react"
import { HoldingCardViewComponent } from "../components/holding-card-view-component"
import { TaxPayerCardData } from "../components/holding-card-front"
import { useTenant } from "@/modules/layout/ui/components/tenant-provider"
import { useTaxPayerCardModalStore } from "../store/use-tax-payer-card-modal-store"

interface TaxPayerCardModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  taxPayer?: TaxPayerCardData | null
}

export const TaxPayerCardModal: React.FC<TaxPayerCardModalProps> = ({
  open,
  onOpenChange,
  taxPayer,
}) => {
  const { tenant } = useTenant()
  const store = useTaxPayerCardModalStore()

  const finalOpen = open !== undefined ? open : store.isOpen
  const finalOnOpenChange = onOpenChange !== undefined ? onOpenChange : () => store.closeModal()
  const finalTaxPayer = taxPayer !== undefined ? taxPayer : store.taxPayer

  if (!finalTaxPayer) return null

  return (
    <Dialog open={finalOpen} onOpenChange={finalOnOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border-border bg-card shadow-2xl p-4 sm:p-6 overflow-hidden max-w-[calc(100vw-1.5rem)]">
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0 border-b border-border/50 pb-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0 border border-emerald-500/20">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-base font-extrabold font-display">
              হোল্ডিং স্মার্ট কার্ড — {finalTaxPayer.name}
            </DialogTitle>
            <p className="text-xs text-muted-foreground font-body mt-0.5">
              হোল্ডিং নং: #{finalTaxPayer.holding} | {tenant.nameBn || tenant.unionName || tenant.name}
            </p>
          </div>
        </DialogHeader>

        <div className="pt-2">
          <HoldingCardViewComponent taxPayer={finalTaxPayer} tenant={tenant} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
