import React from "react"
import { BarChart3, GraduationCap } from "lucide-react"
import { toBengaliDigits } from "@/modules/subscription-plan/utils"

interface ClassDistributionItem {
  classId: string
  className: string
  count: number
}

interface ClassDistributionChartProps {
  data: ClassDistributionItem[]
}

export const ClassDistributionChart: React.FC<ClassDistributionChartProps> = ({ data }) => {
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-white/[0.04]">
        <div className="size-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <BarChart3 className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-foreground font-headline">
            শ্রেণীভিত্তিক প্রশ্নপত্র বণ্টন
          </h3>
          <p className="text-[11px] text-muted-foreground font-body">
            বিভিন্ন শ্রেণীতে তৈরি পরীক্ষার হার
          </p>
        </div>
      </div>

      {/* Content */}
      {data.length === 0 ? (
        <div className="py-8 text-center text-xs text-muted-foreground font-body">
          শ্রেণীভিত্তিক কোনো ডেটা নেই
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {data.map((item, idx) => {
            const percentage = Math.round((item.count / maxCount) * 100)
            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground font-headline flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-indigo-500" />
                    {item.className}
                  </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 font-solaiman text-xs">
                    {toBengaliDigits(item.count)}টি প্রশ্নপত্র
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
                    style={{ width: `${Math.max(percentage, 8)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
