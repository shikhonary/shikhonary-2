"use client"

import { Button } from "@workspace/ui/components/button"
import { Calculator, Loader2 } from "lucide-react"

interface TaxGenerationActionBarProps {
  selectedTotalAmount: number
  selectedCount: number
  isPending: boolean
  handleExecuteGeneration: () => void
  formatCurrency: (amount: number) => string
  formatNumber: (num: number) => string
}

export function TaxGenerationActionBar({
  selectedTotalAmount,
  selectedCount,
  isPending,
  handleExecuteGeneration,
  formatCurrency,
  formatNumber,
}: TaxGenerationActionBarProps) {
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-72 md:right-8 z-30 bg-card/95 backdrop-blur-md border border-border/80 rounded-2xl p-3 sm:p-4 shadow-2xl flex items-center justify-center sm:justify-between gap-4 font-body">
      <div className="hidden sm:block">
        <p className="text-xs font-bold text-muted-foreground">মোট ধার্যকৃত কর (অপরিশোধিত):</p>
        <p className="text-lg font-black text-primary font-mono">
          {formatCurrency(selectedTotalAmount)}{" "}
          <span className="text-xs font-bold text-muted-foreground font-body">
            ({formatNumber(selectedCount)} জন করদাতা)
          </span>
        </p>
      </div>

      <Button
        size="lg"
        onClick={handleExecuteGeneration}
        disabled={isPending || selectedCount === 0}
        className="w-full sm:w-auto rounded-xl font-black gap-2 px-6 shadow-md shadow-primary/20 cursor-pointer h-auto py-3"
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>কর জেনারেট হচ্ছে...</span>
          </>
        ) : (
          <>
            <Calculator className="w-5 h-5" />
            <span>
              কর জেনারেট করুন ({formatNumber(selectedCount)} জন)
            </span>
          </>
        )}
      </Button>
    </div>
  )
}
