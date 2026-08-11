"use client"

interface CollectionProgressProps {
  collectionRate: number
  totalAssessedTax: number
  currentFiscalYear: any
  formatFullTaka: (amount: number) => string
}

export function CollectionProgress({
  collectionRate,
  totalAssessedTax,
  currentFiscalYear,
  formatFullTaka,
}: CollectionProgressProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 sm:p-5 transition-all hover:shadow-sm font-body">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">আদায় অগ্রগতি</p>
          <p className="text-sm font-semibold text-foreground mt-0.5">
            ধার্যকৃত করের বিপরীতে {currentFiscalYear ? `${currentFiscalYear.year} অর্থবছরের` : ""} আদায়ের হার
          </p>
        </div>
        <span className="text-2xl font-bold text-primary font-display">{collectionRate}%</span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-700 ease-out"
          style={{ width: `${Math.min(collectionRate, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5 font-mono">
        <span>৳০</span>
        <span>{formatFullTaka(totalAssessedTax)}</span>
      </div>
    </div>
  )
}
