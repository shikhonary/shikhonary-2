"use client"

import { useRef } from "react"
import Link from "next/link"
import { useTenant } from "@/modules/layout/ui/components/tenant-provider"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Printer, CheckCircle2, Building2 } from "lucide-react"

import { useTaxReceiptModalStore } from "../store/use-tax-receipt-modal-store"

interface TaxReceiptModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  payment?: any
}

export function TaxReceiptModal({
  open,
  onOpenChange,
  payment,
}: TaxReceiptModalProps) {
  const { tenant } = useTenant()
  const store = useTaxReceiptModalStore()
  const printRef = useRef<HTMLDivElement>(null)

  const finalOpen = open !== undefined ? open : store.isOpen
  const finalOnOpenChange = onOpenChange !== undefined ? onOpenChange : (val: boolean) => { if (!val) store.closeModal() }
  const finalPayment = payment !== undefined ? payment : store.payment

  if (!finalOpen || !finalPayment) return null

  const fiscalYear = finalPayment.fiscalYear

  return (
    <Dialog open={finalOpen} onOpenChange={finalOnOpenChange}>
      <DialogContent className="p-0 border border-border/80 bg-card shadow-2xl rounded-3xl overflow-hidden text-foreground sm:max-w-md max-h-[92vh] overflow-y-auto">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 p-6 text-white text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-3 shadow-lg ring-4 ring-white/10">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="font-display text-xl font-extrabold text-white">
            কর আদায় রসিদ (Tax Receipt)
          </DialogTitle>
          <DialogDescription className="font-body text-xs text-white/90 mt-1">
            ইউনিয়ন পরিষদের অফিসিয়াল হোল্ডিং কর আদায় রসিদ পত্র
          </DialogDescription>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4 font-body">
          <div
            ref={printRef}
            className="p-5 border border-border/80 rounded-2xl bg-card space-y-4 shadow-sm text-foreground print:p-0 print:border-none print:shadow-none"
          >
            {/* 1. Institution Header */}
            <div className="text-center space-y-1 pb-4 border-b border-dashed border-border/80">
              <div className="flex justify-center mb-1">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>
              <h2 className="text-lg font-bold tracking-tight text-foreground font-display">
                {tenant?.nameBn || tenant?.name}
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                হোল্ডিং কর আদায় রসিদ ও রাজস্ব মেমো
              </p>
            </div>

            {/* 2. Receipt Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs p-3.5 bg-muted/40 rounded-xl border border-border/60">
              <div className="space-y-0.5">
                <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider block">রসিদ নম্বর</span>
                <strong className="font-mono text-xs font-bold text-primary">{finalPayment.receiptNo || "N/A"}</strong>
              </div>
              <div className="space-y-0.5 text-right">
                <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider block">পরিশোধের তারিখ</span>
                <strong className="text-xs font-bold">{new Date(finalPayment.paymentDate).toLocaleDateString("bn-BD")}</strong>
              </div>
              <div className="space-y-0.5">
                <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider block">অর্থবছর</span>
                <strong className="text-xs font-bold text-foreground">{fiscalYear?.year || "N/A"}</strong>
              </div>
              <div className="space-y-0.5 text-right">
                <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider block">পরিশোধের মাধ্যম</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  {finalPayment.paymentMethod || "নগদ"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => finalOnOpenChange(false)}
              className="flex-1 h-11 text-xs font-semibold border-border text-foreground hover:bg-muted rounded-xl cursor-pointer"
            >
              বন্ধ করুন
            </Button>
            <Button
              asChild
              className="flex-1 h-11 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer shadow-md shadow-emerald-600/20 gap-2"
            >
              <Link href={`/tax-collection/receipt/${finalPayment.id}/preview`} target="_blank">
                <Printer className="w-4 h-4" />
                <span>রসিদ প্রিন্ট পেজে যান</span>
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
