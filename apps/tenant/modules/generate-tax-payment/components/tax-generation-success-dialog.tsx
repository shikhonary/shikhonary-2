"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { CheckCircle2, ArrowRight, Coins, Receipt, ShieldCheck } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"

interface TaxGenerationSuccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  result: {
    generatedCount: number
    skippedCount: number
    totalAmount: number
  } | null
  fiscalYearYear?: string
}

export function TaxGenerationSuccessDialog({
  open,
  onOpenChange,
  result,
  fiscalYearYear,
}: TaxGenerationSuccessDialogProps) {
  if (!result) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("bn-BD").format(amount) + " ৳"
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("bn-BD").format(num)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 border border-border/80 bg-card shadow-2xl rounded-3xl overflow-hidden text-foreground sm:max-w-md">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 p-6 text-white text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-3 shadow-lg ring-4 ring-white/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <DialogTitle className="font-display text-xl font-extrabold text-white">
            কর জেনারেশন সফল হয়েছে!
          </DialogTitle>
          <DialogDescription className="font-body text-xs text-white/90 mt-1">
            {fiscalYearYear
              ? `${fiscalYearYear} অর্থ বছরের জন্য সফলভাবে কর দাবি প্রস্তুত হয়েছে।`
              : "মনোনীত করদাতাদের বাৎসরিক কর দাবি প্রস্তুত সম্পন্ন হয়েছে।"}
          </DialogDescription>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          <div className="bg-muted/40 border border-border/60 rounded-2xl p-4 space-y-3 font-body">
            <div className="flex justify-between items-center text-xs font-medium">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                সফলভাবে প্রস্তুতকৃত দাবি:
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono text-sm">
                {formatNumber(result.generatedCount)} টি
              </span>
            </div>

            {result.skippedCount > 0 && (
              <div className="flex justify-between items-center text-xs font-medium">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  এড়িয়ে যাওয়া (পূর্বেই বিদ্যমান):
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-bold font-mono text-sm">
                  {formatNumber(result.skippedCount)} জন
                </span>
              </div>
            )}

            <div className="border-t border-border/60 pt-2.5 flex justify-between items-center text-sm font-bold">
              <span className="text-foreground font-display">মোট জেনারেটকৃত কর দাবি:</span>
              <span className="text-primary font-black font-mono text-base">
                {formatCurrency(result.totalAmount)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1 font-body">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:flex-1 h-11 text-xs font-semibold border-border text-foreground hover:bg-muted rounded-xl cursor-pointer"
            >
              আরো জেনারেট করুন
            </Button>
            <Button asChild className="w-full sm:flex-1 h-11 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl cursor-pointer shadow-md shadow-primary/20 gap-2">
              <Link href="/tax-collection">
                <Coins className="w-4 h-4" />
                <span>কর আদায় রেজিস্টার</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
