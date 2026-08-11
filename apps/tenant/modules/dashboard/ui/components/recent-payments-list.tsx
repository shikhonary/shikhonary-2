"use client"

import Link from "next/link"
import { Receipt, ArrowRight, CheckCircle2 } from "lucide-react"

interface RecentPaymentsListProps {
  recentPayments: any[]
  formatFullTaka: (amount: number) => string
  formatDate: (date: Date | string) => string
}

export function RecentPaymentsList({
  recentPayments,
  formatFullTaka,
  formatDate,
}: RecentPaymentsListProps) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xs shadow-sm overflow-hidden font-body">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
            <Receipt className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-display font-bold text-foreground">সাম্প্রতিক কর আদায়</h3>
            <p className="text-[10px] text-muted-foreground">সর্বশেষ পরিশোধসমূহ</p>
          </div>
        </div>
        <Link
          href="/tax-collection"
          className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline underline-offset-2"
        >
          সব দেখুন
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* List */}
      {recentPayments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium">কোনো পরিশোধ রেকর্ড পাওয়া যায়নি</p>
          <p className="text-xs text-center max-w-xs">
            কর আদায় করলে এখানে সর্বশেষ পরিশোধের তালিকা দেখা যাবে।
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {recentPayments.map((payment: any) => (
            <div
              key={payment.id}
              className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-muted/40 transition-colors duration-150"
            >
              {/* Icon */}
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                <CheckCircle2 className="h-4.5 w-4.5" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 shrink-0">
                    #{payment.taxPayer.holding}
                  </span>
                  <p className="text-sm font-display font-bold text-foreground truncate">
                    {payment.taxPayer.name}
                  </p>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate font-body">
                  {payment.taxPayer.ward?.nameBn || payment.taxPayer.ward?.name}
                  {payment.receiptNo && ` · রসিদ: ${payment.receiptNo}`}
                </p>
              </div>

              {/* Amount + Date */}
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-emerald-600">
                  {formatFullTaka(payment.amount)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {formatDate(payment.paymentDate)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
