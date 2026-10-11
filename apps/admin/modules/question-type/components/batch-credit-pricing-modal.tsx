"use client"

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Coins, Loader2, Save, Search, RefreshCw, AlertCircle } from "lucide-react"
import { useQuestionTypesList, useBatchUpdateCreditCosts } from "../services/use-question-type"
import type { QuestionTypeItem } from "./question-type-table"

interface BatchCreditPricingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BatchCreditPricingModal({
  open,
  onOpenChange,
}: BatchCreditPricingModalProps) {
  const [search, setSearch] = useState("")
  // Local state for modified costs: id -> creditCost
  const [creditCosts, setCreditCosts] = useState<Record<string, number>>({})

  // Fetch all question types (large limit to list all)
  const { data, isLoading } = useQuestionTypesList({
    limit: 100,
    page: 1,
  })

  const batchMutation = useBatchUpdateCreditCosts()
  const items = data?.questionTypes ?? []

  // Initialize/reset local costs when data loads
  useEffect(() => {
    if (items.length > 0) {
      const initialMap: Record<string, number> = {}
      items.forEach((item) => {
        initialMap[item.id] = item.creditCost ?? 1
      })
      setCreditCosts(initialMap)
    }
  }, [data])

  const filteredItems = items.filter(
    (item) =>
      item.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      item.nameBn.toLowerCase().includes(search.toLowerCase()) ||
      (item.label && item.label.toLowerCase().includes(search.toLowerCase()))
  )

  const handleCostChange = (id: string, value: string) => {
    const num = parseInt(value, 10)
    setCreditCosts((prev) => ({
      ...prev,
      [id]: isNaN(num) ? 0 : Math.max(0, num),
    }))
  }

  const handleSave = () => {
    const updates = items.map((item) => ({
      id: item.id,
      creditCost: creditCosts[item.id] ?? (item.creditCost ?? 1),
    }))

    batchMutation.mutate(
      { items: updates },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-card border-border shadow-2xl font-body">
        {/* Header */}
        <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-border/60 bg-amber-500/5 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold font-headline text-foreground">
                Resource Credit Pricing Management
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Quickly adjust unit credit costs for all question types across the platform.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Search bar */}
        <div className="p-4 border-b border-border/60 bg-muted/20 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search question types..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 rounded-xl bg-background border-border text-xs"
            />
          </div>
          <span className="text-xs text-muted-foreground font-medium shrink-0">
            Total: {filteredItems.length} types
          </span>
        </div>

        {/* Content Table */}
        <div className="max-h-[55vh] overflow-y-auto p-4 sm:p-6 space-y-2">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Loading question types...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-xs">
              No matching question types found.
            </div>
          ) : (
            <div className="divide-y divide-border/60 border border-border rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-3 p-3 bg-muted/50 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <div className="col-span-6 sm:col-span-7">Question Type</div>
                <div className="col-span-2 text-center">Marks</div>
                <div className="col-span-4 sm:col-span-3 text-right">Credit Cost</div>
              </div>

              {filteredItems.map((item) => {
                const currentCost = creditCosts[item.id] ?? (item.creditCost ?? 1)

                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-3 p-3 items-center hover:bg-muted/30 transition-colors text-xs"
                  >
                    <div className="col-span-6 sm:col-span-7 min-w-0">
                      <p className="font-bold text-foreground truncate">
                        {item.nameEn}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {item.nameBn} {item.label && `(${item.label})`}
                      </p>
                    </div>

                    <div className="col-span-2 text-center font-mono text-muted-foreground">
                      {item.mark}
                    </div>

                    <div className="col-span-4 sm:col-span-3 flex items-center justify-end gap-2">
                      <div className="relative w-24">
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={currentCost}
                          onChange={(e) => handleCostChange(item.id, e.target.value)}
                          className="h-8 rounded-lg text-right pr-2 font-mono font-bold text-xs"
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        credits
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 sm:p-5 pt-3 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Updated credit costs take effect immediately for all tenants.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-border text-xs w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={batchMutation.isPending || isLoading}
              onClick={handleSave}
              className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5 w-full sm:w-auto shadow-xs"
            >
              {batchMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save All Changes</span>
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
