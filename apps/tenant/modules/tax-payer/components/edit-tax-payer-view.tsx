"use client"

import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { Loader2 } from "lucide-react"
import { TaxPayerForm } from "./tax-payer-form"

interface EditTaxPayerViewProps {
  taxPayerId: string
}

export function EditTaxPayerView({ taxPayerId }: EditTaxPayerViewProps) {
  const { data: taxPayer, isLoading, isError } = useQuery(
    trpc.taxPayer.byId.queryOptions({ id: taxPayerId })
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError || !taxPayer) {
    return (
      <div className="text-center py-20 space-y-3">
        <h3 className="text-lg font-bold text-destructive">করদাতার তথ্য পাওয়া যায়নি</h3>
        <p className="text-xs text-muted-foreground">
          আইডিটি সঠিক নয় অথবা করদাতার রেকর্ড মুছে ফেলা হয়েছে।
        </p>
      </div>
    )
  }

  return <TaxPayerForm initialData={taxPayer} isEditing={true} />
}
