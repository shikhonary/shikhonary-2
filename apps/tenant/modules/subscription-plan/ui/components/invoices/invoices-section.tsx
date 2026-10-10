"use client"

import React from "react"
import { Receipt, FileText, Download, CheckCircle2, Clock, ExternalLink } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { toBengaliDigits, formatBengaliPrice, formatBengaliDate } from "@/modules/subscription-plan/utils"
import type { InvoiceItem } from "@/modules/subscription-plan/types"

interface InvoicesSectionProps {
  invoices?: InvoiceItem[]
  isLoading?: boolean
}

export const InvoicesSection: React.FC<InvoicesSectionProps> = ({
  invoices = [],
  isLoading,
}) => {
  return (
    <div className="rounded-3xl bg-card border border-border/60 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div>
          <h3 className="text-lg font-bold font-headline text-foreground flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>বিলিং হিস্ট্রি ও ইনভয়েস</span>
          </h3>
          <p className="text-xs text-muted-foreground font-body mt-0.5">
            সাবস্ক্রিপশন ও অতিরিক্ত প্যাকেজ ক্রয়ের ইনভয়েস ও রসিদ
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-muted/40 animate-pulse"
            />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground font-body space-y-2">
          <FileText className="w-8 h-8 mx-auto text-muted-foreground/40" />
          <p className="text-xs">কোনো ইনভয়েস তথ্য পাওয়া যায়নি।</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-body text-left">
            <thead>
              <tr className="border-b border-border/40 text-muted-foreground font-semibold">
                <th className="pb-3 pl-2">ইনভয়েস নম্বর</th>
                <th className="pb-3">বিলিং পিরিয়ড</th>
                <th className="pb-3">পেমেন্ট মাধ্যম</th>
                <th className="pb-3 text-right">মোট পরিমাণ</th>
                <th className="pb-3 text-center">স্ট্যাটাস</th>
                <th className="pb-3 pr-2 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {invoices.map((inv) => {
                const isPaid = inv.status === "PAID"
                return (
                  <tr key={inv.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 pl-2 font-mono font-medium text-foreground">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {formatBengaliDate(inv.periodStart)} – {formatBengaliDate(inv.periodEnd)}
                    </td>
                    <td className="py-3 text-foreground">
                      {inv.paymentMethod || "অনলাইন গেটওয়ে"}
                    </td>
                    <td
                      className="py-3 text-right font-bold font-solaiman text-foreground"
                      style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                    >
                      {formatBengaliPrice(inv.amount)}
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isPaid
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {isPaid ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        <span>{isPaid ? "পরিশোধিত" : "অপেক্ষমান"}</span>
                      </span>
                    </td>
                    <td className="py-3 pr-2 text-right">
                      {inv.pdfUrl ? (
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs font-medium cursor-pointer"
                        >
                          <a href={inv.pdfUrl} target="_blank" rel="noreferrer">
                            <Download className="w-3.5 h-3.5 mr-1" />
                            <span>ডাউনলোড</span>
                          </a>
                        </Button>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">উপলব্ধ নয়</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
