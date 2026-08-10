"use client"

import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@workspace/ui/components/sheet"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@workspace/ui/components/table"
import {
  User,
  Phone,
  CreditCard,
  MapPin,
  Calendar,
  Building,
  Coins,
  Receipt,
  Plus,
  Loader2,
} from "lucide-react"

interface TaxPayerDetailSheetProps {
  taxPayerId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCollectTax?: (taxPayer: any) => void
}

export function TaxPayerDetailSheet({
  taxPayerId,
  open,
  onOpenChange,
  onCollectTax,
}: TaxPayerDetailSheetProps) {
  const { data: taxPayer, isLoading } = useQuery(
    trpc.taxPayer.byId.queryOptions(
      { id: taxPayerId || "" },
      { enabled: !!taxPayerId && open }
    )
  )

  if (!open) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-xl font-bold">
            <User className="w-5 h-5 text-primary" />
            করদাতার প্রোফাইল ও ইতিহাস
          </SheetTitle>
          <SheetDescription>
            হোল্ডিং করদাতার বিস্তারিত বিবরণী ও অর্থবছরভিত্তিক পরিশোধের বিবরণ।
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !taxPayer ? (
          <div className="text-center py-10 text-muted-foreground">
            করদাতার তথ্য পাওয়া যায়নি।
          </div>
        ) : (
          <div className="space-y-6 pt-4">
            {/* Header Badge Card */}
            <div className="bg-muted/50 p-4 rounded-xl space-y-3 border">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="outline" className="mb-1 text-xs">
                    হোল্ডিং নং: {taxPayer.holding}
                  </Badge>
                  <h3 className="text-lg font-bold text-foreground">
                    {taxPayer.name}
                  </h3>
                  {taxPayer.fatherName && (
                    <p className="text-xs text-muted-foreground">
                      পিতা: {taxPayer.fatherName}
                    </p>
                  )}
                </div>

                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => onCollectTax?.(taxPayer)}
                >
                  <Coins className="w-4 h-4" />
                  কর আদায়
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-border/60">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>
                    ওয়ার্ড: <strong>{taxPayer.ward?.nameBn || taxPayer.ward?.name}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Building className="w-3.5 h-3.5 text-primary" />
                  <span>
                    গ্রাম: <strong>{taxPayer.village}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Coins className="w-3.5 h-3.5 text-primary" />
                  <span>
                    ধার্যকৃত কর: <strong>৳{taxPayer.tax.toLocaleString()}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  <span>
                    মোবাইল: <strong>{taxPayer.phone || "N/A"}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Payment History */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-primary" />
                  কর পরিশোধের ইতিহাস (Total: {taxPayer.payments?.length || 0})
                </h4>
              </div>

              {!taxPayer.payments || taxPayer.payments.length === 0 ? (
                <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed text-xs text-muted-foreground">
                  এখনো কোনো কর পরিশোধের রেকর্ড নেই।
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="text-xs">রসিদ নং</TableHead>
                        <TableHead className="text-xs">অর্থবছর</TableHead>
                        <TableHead className="text-xs">তারিখ</TableHead>
                        <TableHead className="text-xs text-right">পরিমাণ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {taxPayer.payments.map((pm: any) => (
                        <TableRow key={pm.id}>
                          <TableCell className="text-xs font-mono font-medium">
                            {pm.receiptNo || "N/A"}
                          </TableCell>
                          <TableCell className="text-xs">
                            {pm.fiscalYear?.year || "N/A"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(pm.paymentDate).toLocaleDateString("bn-BD")}
                          </TableCell>
                          <TableCell className="text-xs text-right font-bold text-emerald-600">
                            ৳{pm.amount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
