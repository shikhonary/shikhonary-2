"use client"

import Link from "next/link"
import { ArrowRight, UserPlus, Coins, FileText, Building2 } from "lucide-react"

const QUICK_ACTIONS = [
  {
    href: "/fiscal-years",
    icon: FileText,
    label: "অর্থবছর ব্যবস্থাপনা",
    desc: "অর্থবছরের তথ্য পরিচালনা করুন",
    iconBg: "bg-primary/10 text-primary",
    borderColor: "border-primary/20",
  },
  {
    href: "/counters",
    icon: Building2,
    label: "কাউন্টার ব্যবস্থাপনা",
    desc: "কাউন্টারের তথ্য পরিচালনা করুন",
    iconBg: "bg-orange-500/10 text-orange-600",
    borderColor: "border-orange-500/20",
  },
]

export function QuickActions() {
  return (
    <div className="flex flex-col gap-4 font-body">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground px-1">
        দ্রুত কার্যক্রম
      </p>
      {QUICK_ACTIONS.map((action) => (
        <Link key={action.href} href={action.href}>
          <div className={`flex items-center gap-3.5 rounded-xl border ${action.borderColor} bg-card p-4 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 cursor-pointer`}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${action.iconBg}`}>
              <action.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-display font-bold text-foreground leading-none">{action.label}</p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-snug font-body">{action.desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
        </Link>
      ))}
    </div>
  )
}
