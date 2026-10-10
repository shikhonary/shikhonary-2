import React from "react"
import { FileText, CheckCircle2, FileEdit, Sparkles, HelpCircle, Coins, ArrowUpRight } from "lucide-react"
import { toBengaliDigits } from "@/modules/subscription-plan/utils"

interface DashboardMetrics {
  totalPapers: number
  publishedPapers: number
  draftPapers: number
  totalQuestions: number
  creditBalance: number
  lifetimeCreditsSpent: number
}

interface DashboardStatCardsProps {
  metrics: DashboardMetrics
}

export const DashboardStatCards: React.FC<DashboardStatCardsProps> = ({ metrics }) => {
  const cards = [
    {
      label: "মোট প্রশ্নপত্র",
      value: toBengaliDigits(metrics.totalPapers),
      subtext: `${toBengaliDigits(metrics.publishedPapers)} প্রকাশিত · ${toBengaliDigits(metrics.draftPapers)} ড্রাফট`,
      badge: "প্রশ্নপত্র",
      badgeColor: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200/50 dark:border-indigo-800/40",
      icon: FileText,
      iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20",
      accentGradient: "from-indigo-500/10 to-transparent",
      borderColor: "hover:border-indigo-500/40",
    },
    {
      label: "প্রকাশিত পরীক্ষা",
      value: toBengaliDigits(metrics.publishedPapers),
      subtext: "সম্পূর্ণ প্রণীত ও প্রস্তুত",
      badge: "রেডি",
      badgeColor: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/40",
      icon: CheckCircle2,
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
      accentGradient: "from-emerald-500/10 to-transparent",
      borderColor: "hover:border-emerald-500/40",
    },
    {
      label: "ব্যবহৃত প্রশ্ন সংখ্যা",
      value: toBengaliDigits(metrics.totalQuestions),
      subtext: "সকল পরীক্ষা মিলিয়ে",
      badge: "প্রশ্নব্যাংক",
      badgeColor: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-200/50 dark:border-sky-800/40",
      icon: HelpCircle,
      iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20",
      accentGradient: "from-sky-500/10 to-transparent",
      borderColor: "hover:border-sky-500/40",
    },
    {
      label: "এআই ক্রেডিট ব্যালেন্স",
      value: toBengaliDigits(metrics.creditBalance),
      subtext: `মোট খরচ: ${toBengaliDigits(metrics.lifetimeCreditsSpent)} ক্রেডিট`,
      badge: "ওয়ালেট",
      badgeColor: "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30",
      icon: Coins,
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
      accentGradient: "from-amber-500/10 to-transparent",
      borderColor: "hover:border-amber-500/40",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <div
            key={idx}
            className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-3.5 sm:p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${card.borderColor} flex flex-col justify-between`}
          >
            {/* Ambient background glow on hover */}
            <div className={`pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-gradient-to-br ${card.accentGradient} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] sm:text-xs font-bold text-muted-foreground font-headline truncate">
                {card.label}
              </span>
              <div className={`size-8 sm:size-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-200 ${card.iconBg} shadow-2xs`}>
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>

            <div className="space-y-1 sm:space-y-1.5 relative z-10">
              <div className="flex items-baseline justify-between gap-2">
                <p
                  className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight font-solaiman leading-none"
                  style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                >
                  {card.value}
                </p>
                <span className={`hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md border font-solaiman ${card.badgeColor}`}>
                  {card.badge}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-body truncate leading-tight">
                {card.subtext}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
