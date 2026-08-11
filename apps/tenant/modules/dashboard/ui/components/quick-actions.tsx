"use client"

import Link from "next/link"
import { ArrowRight, UserPlus, Coins, FileText, Building2 } from "lucide-react"

const QUICK_ACTIONS = [
  {
    href: "/tax-payers/new",
    icon: UserPlus,
    label: "নতুন করদাতা নিবন্ধন",
    desc: "নতুন হোল্ডিং করদাতা যোগ করুন",
    iconBg: "bg-primary/10 text-primary",
    borderColor: "border-primary/20",
  },
  {
    href: "/tax-collection?new=true",
    icon: Coins,
    label: "কর আদায়",
    desc: "বকেয়া করের পরিশোধ রেকর্ড করুন",
    iconBg: "bg-emerald-500/10 text-emerald-600",
    borderColor: "border-emerald-500/20",
  },
  {
    href: "/generate-tax-payment",
    icon: FileText,
    label: "বাৎসরিক কর জেনারেশন",
    desc: "অর্থবছর ভিত্তিক বাৎসরিক কর নির্ধারণ ও রসিদ তৈরি",
    iconBg: "bg-violet-500/10 text-violet-600",
    borderColor: "border-violet-500/20",
  },
  {
    href: "/wards?new=true",
    icon: Building2,
    label: "ওয়ার্ড ব্যবস্থাপনা",
    desc: "ওয়ার্ড তথ্য পরিচালনা করুন",
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
