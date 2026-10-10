import React from "react"
import Link from "next/link"
import { useTenant } from "@/modules/layout/ui/components/tenant-provider"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Plus, BookOpen, FileText, Sparkles, School, GraduationCap } from "lucide-react"

function getBengaliGreeting(): string {
  // Convert current time to Bangladesh timezone (Asia/Dhaka)
  const now = new Date()
  const dhakaTimeString = now.toLocaleString("en-US", { timeZone: "Asia/Dhaka", hour12: false, hour: "numeric" })
  const hour = parseInt(dhakaTimeString, 10)

  if (hour >= 5 && hour < 12) {
    return "শুভ সকাল"
  } else if (hour >= 12 && hour < 15) {
    return "শুভ দুপুর"
  } else if (hour >= 15 && hour < 18) {
    return "শুভ অপরাহ্ন"
  } else if (hour >= 18 && hour < 22) {
    return "শুভ সন্ধ্যা"
  } else {
    return "শুভ রাত্রি"
  }
}

export const DashboardHero: React.FC = () => {
  const { tenant, user } = useTenant()
  const greeting = getBengaliGreeting()

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-6 sm:p-8 shadow-xs">
      {/* Background Subtle Gradient Glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-1/4 h-56 w-56 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 px-2.5 py-1 text-xs font-bold rounded-lg font-solaiman flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block animate-pulse" />
              শিখনারী অ্যাডমিন হাব
            </Badge>
            {(tenant.districtNameBn || tenant.districtName) && (
              <Badge variant="outline" className="border-slate-200 dark:border-white/10 text-muted-foreground text-xs font-solaiman">
                {tenant.districtNameBn || tenant.districtName}
              </Badge>
            )}
            <Badge variant="outline" className="border-slate-200 dark:border-white/10 text-muted-foreground text-xs font-mono">
              {tenant.slug}
            </Badge>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-headline">
              {greeting}, {user?.name || "অধ্যক্ষ / অ্যাডমিন"}!
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-body mt-1.5 leading-relaxed">
              <span className="font-semibold text-foreground">{tenant.nameBn || tenant.name}</span>-এর প্রশ্নপত্র প্রণয়ন, ডিজিটাল প্রশ্নব্যাংক অনুসন্ধান এবং পরীক্ষা মূল্যায়ন পরিচালনা করুন।
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
          <Button
            asChild
            variant="outline"
            className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card hover:bg-slate-50 dark:hover:bg-white/[0.04] text-foreground font-bold text-xs sm:text-sm px-4 h-11 transition-all cursor-pointer font-headline"
          >
            <Link href="/question-bank">
              <BookOpen className="h-4 w-4 mr-1.5 text-indigo-600 dark:text-indigo-400" />
              <span>প্রশ্ন ব্যাংক</span>
            </Link>
          </Button>

          <Button
            asChild
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm px-5 h-11 transition-all active:scale-95 shadow-sm shadow-indigo-600/20 cursor-pointer font-headline"
          >
            <Link href="/question-papers/create">
              <Plus className="h-4 w-4 mr-1.5" />
              <span>নতুন প্রশ্নপত্র তৈরি</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
