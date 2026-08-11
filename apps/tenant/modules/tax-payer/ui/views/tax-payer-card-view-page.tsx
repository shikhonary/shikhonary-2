"use client"

import React from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { useTenant } from "@/modules/layout/ui/components/tenant-provider"
import { HoldingCardViewComponent } from "../components/holding-card-view-component"
import { Button } from "@workspace/ui/components/button"
import { ArrowLeft, Loader2, UserX } from "lucide-react"

interface TaxPayerCardViewPageProps {
  taxPayerId: string
}

export function TaxPayerCardViewPage({ taxPayerId }: TaxPayerCardViewPageProps) {
  const { tenant } = useTenant()
  const { data: taxPayer, isLoading, isError } = useQuery(
    trpc.taxPayer.byId.queryOptions({ id: taxPayerId })
  )

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm font-medium text-muted-foreground font-body">
          হোল্ডিং কার্ডের তথ্য লোড হচ্ছে...
        </p>
      </div>
    )
  }

  if (isError || !taxPayer) {
    return (
      <div className="text-center py-20 px-4 space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <UserX className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold font-display">করদাতা পাওয়া যায়নি</h3>
        <p className="text-xs text-muted-foreground font-body">
          অনুরোধকৃত করদাতার তথ্য খুঁজে পাওয়া যায়নি অথবা এটি ইতিমধ্যে মুছে ফেলা হয়েছে।
        </p>
        <Button asChild variant="outline" className="rounded-xl font-bold text-xs gap-2">
          <Link href="/tax-payers">
            <ArrowLeft className="w-4 h-4" />
            <span>করদাতা তালিকায় ফিরুন</span>
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="rounded-xl font-bold text-xs gap-2 text-muted-foreground hover:text-foreground">
          <Link href="/tax-payers">
            <ArrowLeft className="w-4 h-4" />
            <span>তালিকায় ফিরুন</span>
          </Link>
        </Button>

        <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
          হোল্ডিং নম্বর: #{taxPayer.holding}
        </span>
      </div>

      <div className="bg-card border border-border/60 rounded-2xl p-6 sm:p-8 shadow-sm">
        <HoldingCardViewComponent taxPayer={taxPayer} tenant={tenant} />
      </div>
    </div>
  )
}
