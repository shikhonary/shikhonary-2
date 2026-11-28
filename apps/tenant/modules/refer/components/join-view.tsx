"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { Card } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import {
  Gift,
  Building2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Coins,
  ShieldCheck,
  Loader2,
  School,
  ExternalLink,
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "০"
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
  return num
    .toString()
    .split("")
    .map((char) => (/\d/.test(char) ? bengaliDigits[parseInt(char, 10)] : char))
    .join("")
}

export function JoinView() {
  const searchParams = useSearchParams()
  const initialRef = (searchParams.get("ref") || "").trim().toUpperCase()

  const [inputCode, setInputCode] = useState(initialRef)
  const [activeCode, setActiveCode] = useState(initialRef)

  // Query to validate referral code via public endpoint
  const { data: codeData, isLoading, isError } = useQuery({
    ...trpc.referral.validateCode.queryOptions({ code: activeCode }),
    enabled: Boolean(activeCode),
    retry: false,
  })

  // Persist valid referral code in localStorage for signup flow
  useEffect(() => {
    if (codeData?.valid && codeData.code) {
      try {
        localStorage.setItem("shikhonary_referral_code", codeData.code)
      } catch (e) {
        // Safe fail if localStorage is disabled
      }
    }
  }, [codeData])

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputCode.trim()) {
      setActiveCode(inputCode.trim().toUpperCase())
    }
  }

  const isValid = Boolean(codeData?.valid)
  const referrerTenantName = codeData?.valid ? (codeData.referrerTenantName || codeData.tenant?.nameBn || codeData.tenant?.name) : undefined

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-body">
      {/* Top Bar / Brand Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-xs">
            <School className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold font-headline text-lg text-foreground tracking-tight block leading-tight">
              শিখনারী
            </span>
            <span className="text-[11px] text-muted-foreground font-body block">
              শিক্ষা প্রতিষ্ঠান ম্যানেজমেন্ট প্ল্যাটফর্ম
            </span>
          </div>
        </div>

        <Button variant="ghost" size="sm" asChild className="rounded-xl text-xs font-bold font-headline gap-1.5">
          <Link href="/auth/sign-in">
            <span>লগইন</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </header>

      {/* Main Join Container */}
      <main className="max-w-xl mx-auto w-full py-8 sm:py-12">
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-card p-6 sm:p-9 shadow-xs space-y-6 sm:space-y-7 animate-in fade-in duration-200">
          
          {/* Top Invitation Badge & Icon */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100/80 dark:border-primary/20 flex items-center justify-center text-indigo-600 dark:text-primary shadow-xs mx-auto">
              <Gift className="w-7 h-7 stroke-[1.8]" />
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 font-headline">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>প্রাতিষ্ঠানিক রেফারেল আমন্ত্রণ</span>
              </span>

              <h1 className="text-xl sm:text-2xl font-bold font-headline tracking-tight text-slate-900 dark:text-foreground mt-2">
                শিখনারী প্ল্যাটফর্মে স্বাগতম
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed max-w-md mx-auto">
                সহকর্মী শিক্ষা প্রতিষ্ঠানের আমন্ত্রণে যুক্ত হয়ে স্বয়ংক্রিয় এআই প্রশ্নপত্র প্রণয়ন এবং ফ্রি বোনাস ক্রেডিট উপভোগ করুন।
              </p>
            </div>
          </div>

          {/* Validation & Referrer Institution Details */}
          {isLoading ? (
            <div className="p-6 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] text-center space-y-2">
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" />
              <p className="text-xs text-muted-foreground font-body">রেফারেল কোড যাচাই করা হচ্ছে...</p>
            </div>
          ) : isValid && codeData?.valid ? (
            <div className="p-4 sm:p-5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/40 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 font-headline block">
                আমন্ত্রণকারী শিক্ষা প্রতিষ্ঠান:
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-2xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold font-headline text-slate-900 dark:text-foreground truncate">
                    {referrerTenantName || "শিক্ষা প্রতিষ্ঠান"}
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    রেফারেল কোড: <strong className="text-indigo-600 dark:text-primary">{codeData.code}</strong>
                  </p>
                </div>
              </div>
            </div>
          ) : activeCode && (!isValid || isError) ? (
            <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/40 text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold text-xs font-headline">
                <AlertCircle className="w-4 h-4" />
                <span>প্রদত্ত রেফারেল কোডটি কার্যকর বা সক্রিয় নয়</span>
              </div>
              <p className="text-[11px] text-muted-foreground font-body">
                অনুগ্রহ করে সঠিক কোডটি পুনরায় লিখুন অথবা সরাসরি নিবন্ধন সম্পন্ন করুন।
              </p>
            </div>
          ) : (
            <form onSubmit={handleValidate} className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-headline block">
                আপনার কাছে রেফারেল কোড আছে কি?
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="যেমন: SHIK-SCHOOL-123"
                  className="h-10.5 rounded-xl bg-card border-border text-xs sm:text-sm font-mono uppercase"
                />
                <Button type="submit" variant="outline" className="h-10.5 px-4 rounded-xl text-xs font-bold font-headline cursor-pointer shrink-0">
                  যাচাই করুন
                </Button>
              </div>
            </form>
          )}

          {/* Dual Incentive Bonus Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-1 text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold text-xs font-headline">
                <Sparkles className="w-3.5 h-3.5" />
                <span>আপনার প্রতিষ্ঠান</span>
              </div>
              <p className="text-xl sm:text-2xl font-black font-solaiman text-emerald-700 dark:text-emerald-300">
                +১০০ ক্রেডিট
              </p>
              <p className="text-[11px] text-muted-foreground font-body">
                যোগদানে ওয়েলকাম বোনাস
              </p>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 space-y-1 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-700 dark:text-amber-400 font-bold text-xs font-headline">
                <Coins className="w-3.5 h-3.5" />
                <span>আমন্ত্রণকারী</span>
              </div>
              <p className="text-xl sm:text-2xl font-black font-solaiman text-amber-700 dark:text-amber-300">
                +৩০০ ক্রেডিট
              </p>
              <p className="text-[11px] text-muted-foreground font-body">
                রেফারেল রিওয়ার্ড বোনাস
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-2 border-t border-border/40">
            <Button
              asChild
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold font-headline text-xs sm:text-sm gap-2 shadow-sm shadow-primary/20 cursor-pointer active:scale-95 transition-all"
            >
              <Link href={`/auth/sign-up${isValid && codeData?.code ? `?ref=${codeData.code}` : ""}`}>
                <span>নতুন প্রতিষ্ঠান হিসেবে অ্যাকাউন্ট খুলুন</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>

            <Button
              variant="outline"
              asChild
              className="w-full h-10.5 rounded-xl border-border bg-card hover:bg-muted text-foreground font-bold font-headline text-xs cursor-pointer"
            >
              <Link href="/auth/sign-in">
                <span>ইতিমধ্যে অ্যাকাউন্ট আছে? সাইন ইন করুন</span>
              </Link>
            </Button>
          </div>

          {/* Trust Footer Note */}
          <div className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground font-body pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>নিরাপদ ও অনুমোদিত প্রতিষ্ঠান যাচাইকরণ ব্যবস্থা</span>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center pt-6 border-t border-border/40 text-xs text-muted-foreground font-body">
        © ২০২৬ শিখনারী — সর্বস্বত্ব সংরক্ষিত
      </footer>
    </div>
  )
}
