"use client"

import React from "react"
import { Coins, ArrowDownLeft, ArrowUpRight, Sparkles, RefreshCw } from "lucide-react"
import { toBengaliDigits, formatBengaliDate } from "@/modules/subscription-plan/utils"

interface CreditTransactionsSectionProps {
  creditBalance?: number
  transactions?: {
    id: string
    type: string
    amount: number
    balance: number
    description: string
    createdAt: string | Date
  }[]
  isLoading?: boolean
}

export const CreditTransactionsSection: React.FC<CreditTransactionsSectionProps> = ({
  creditBalance = 0,
  transactions = [],
  isLoading,
}) => {
  return (
    <div className="rounded-3xl bg-card border border-border/60 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div>
          <h3 className="text-lg font-bold font-headline text-foreground flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-500" />
            <span>এআই ক্রেডিট ও লেনদেনের ইতিহাস</span>
          </h3>
          <p className="text-xs text-muted-foreground font-body mt-0.5">
            সর্বশেষ ৫টি ক্রেডিট রিচার্জ ও প্রশ্ন তৈরির হিসাব
          </p>
        </div>

        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 shrink-0">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <div className="text-xs font-body">
            <span>বর্তমান ব্যালেন্স: </span>
            <strong
              className="text-base font-bold text-amber-900 dark:text-amber-200 font-solaiman ml-1"
              style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
            >
              {toBengaliDigits(creditBalance)} ক্রেডিট
            </strong>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-muted/20 border border-border/40 flex items-center justify-between gap-4 animate-pulse select-none"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-xl bg-muted/80 shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="h-4 w-44 bg-muted/80 rounded-md" />
                  <div className="h-3 w-28 bg-muted/50 rounded-md" />
                </div>
              </div>
              <div className="text-right shrink-0 space-y-1.5">
                <div className="h-4.5 w-16 bg-muted/80 rounded-md ml-auto" />
                <div className="h-3 w-20 bg-muted/50 rounded-md ml-auto" />
              </div>
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground font-body space-y-2">
          <Coins className="w-8 h-8 mx-auto text-muted-foreground/40" />
          <p className="text-xs">এখনও কোনো ক্রেডিট লেনদেনের তথ্য পাওয়া যায়নি।</p>
        </div>
      ) : (
        <>
          {/* ── Mobile Responsive Card View (< md) ── */}
          <div className="md:hidden space-y-3">
            {transactions.map((tx) => {
              const isCreditIn = tx.amount > 0
              return (
                <div
                  key={tx.id}
                  className="p-4 rounded-2xl bg-muted/20 border border-border/50 flex flex-col gap-2.5 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-foreground leading-snug">
                        {tx.description}
                      </p>
                      <span className="text-[10px] text-muted-foreground block">
                        {formatBengaliDate(tx.createdAt)}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-sm font-extrabold font-solaiman block ${
                          isCreditIn
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                        style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                      >
                        {isCreditIn ? `+${toBengaliDigits(tx.amount)}` : toBengaliDigits(tx.amount)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">ক্রেডিট</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px]">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        isCreditIn
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-500/20"
                      }`}
                    >
                      {isCreditIn ? (
                        <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <ArrowUpRight className="w-3 h-3 text-slate-600" />
                      )}
                      <span>{tx.type}</span>
                    </span>

                    <div className="text-muted-foreground font-body">
                      <span>অবশিষ্ট: </span>
                      <strong
                        className="font-bold text-foreground font-solaiman"
                        style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                      >
                        {toBengaliDigits(tx.balance)}
                      </strong>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Desktop View (>= md) ── */}
          <div className="hidden md:block overflow-x-auto -mx-2 px-2">
            <table className="w-full text-xs font-body text-left">
              <thead>
                <tr className="border-b border-border/40 text-muted-foreground font-semibold">
                  <th className="pb-3 pl-2">বিবরণ</th>
                  <th className="pb-3">ধরন</th>
                  <th className="pb-3 text-right">পরিমাণ</th>
                  <th className="pb-3 text-right">অবশিষ্ট ব্যালেন্স</th>
                  <th className="pb-3 pr-2 text-right">তারিখ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {transactions.map((tx) => {
                  const isCreditIn = tx.amount > 0
                  return (
                    <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 pl-2 font-medium text-foreground">
                        {tx.description}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isCreditIn
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-500/20"
                          }`}
                        >
                          {isCreditIn ? (
                            <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3 text-slate-600" />
                          )}
                          <span>{tx.type}</span>
                        </span>
                      </td>
                      <td
                        className={`py-3 text-right font-bold font-solaiman ${
                          isCreditIn
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                        style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                      >
                        {isCreditIn ? `+${toBengaliDigits(tx.amount)}` : toBengaliDigits(tx.amount)}
                      </td>
                      <td
                        className="py-3 text-right font-bold font-solaiman text-foreground"
                        style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                      >
                        {toBengaliDigits(tx.balance)}
                      </td>
                      <td className="py-3 pr-2 text-right text-muted-foreground">
                        {formatBengaliDate(tx.createdAt)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
