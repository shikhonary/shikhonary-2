"use client"

import Link from "next/link"
import { Badge } from "@workspace/ui/components/badge"
import { Calendar, Clock } from "lucide-react"

interface FiscalYearBannerProps {
  currentFiscalYear: any
  formatDate: (date: Date | string) => string
}

export function FiscalYearBanner({ currentFiscalYear, formatDate }: FiscalYearBannerProps) {
  if (currentFiscalYear) {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:shadow-sm font-body">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
          <Calendar className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            চলতি অর্থবছর
          </p>
          <h3 className="text-2xl font-bold text-foreground">{currentFiscalYear.year}</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {formatDate(currentFiscalYear.startDate)} — {formatDate(currentFiscalYear.endDate)}
          </p>
        </div>
        <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary text-xs font-bold shrink-0">
          সক্রিয়
        </Badge>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 font-body">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
        <Clock className="h-6 w-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">অর্থবছর</p>
        <h3 className="text-base font-bold text-foreground">কোনো সক্রিয় অর্থবছর নেই</h3>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          <Link href="/fiscal-years" className="text-amber-600 underline underline-offset-2 font-semibold">
            এখানে ক্লিক করে একটি অর্থবছর তৈরি করুন
          </Link>
        </p>
      </div>
    </div>
  )
}
