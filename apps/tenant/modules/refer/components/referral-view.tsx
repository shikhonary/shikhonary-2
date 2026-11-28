"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Card } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@workspace/ui/components/table"
import {
  Share2,
  Copy,
  Check,
  Gift,
  Coins,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
  Loader2,
  HelpCircle,
  MessageCircle,
  Mail,
  UserCheck,
  TrendingUp,
  Inbox,
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

function formatDateBn(dateInput?: string | Date | null): string {
  if (!dateInput) return "—"
  try {
    const d = new Date(dateInput)
    return d.toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return String(dateInput)
  }
}

export function ReferralView() {
  const queryClient = useQueryClient()
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [activeFilter, setActiveFilter] = useState<"ALL" | "REWARDED" | "PENDING">("ALL")

  // Form states for inviting a peer institution
  const [institutionName, setInstitutionName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  // Fetch tenant referral code & link
  const { data: codeData, isLoading: isCodeLoading } = useQuery(
    trpc.referral.getMyCode.queryOptions()
  )

  // Fetch referral statistics
  const { data: statsData, isLoading: isStatsLoading } = useQuery(
    trpc.referral.getStats.queryOptions({})
  )

  // Fetch referral conversion history
  const { data: historyData, isLoading: isHistoryLoading } = useQuery(
    trpc.referral.getHistory.queryOptions({
      status: activeFilter === "ALL" ? undefined : activeFilter,
      limit: 20,
    })
  )

  // Resolve base domain URL from environment variable or window location fallback for testing/production
  const baseDomain =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_TENANT_URL ||
    (typeof window !== "undefined" && window.location.origin ? window.location.origin : "http://localhost:3001")

  const effectiveReferralLink = codeData?.code
    ? `${baseDomain.replace(/\/$/, "")}/join?ref=${codeData.code}`
    : codeData?.referralLink || `${baseDomain.replace(/\/$/, "")}/join?ref=...`

  // Mutation to send direct peer invite
  const inviteMutation = useMutation(
    trpc.referral.invitePeer.mutationOptions({
      onSuccess: () => {
        toast.success("সহকর্মী প্রতিষ্ঠানের কাছে রেফারেল আমন্ত্রণ সফলভাবে পাঠানো হয়েছে!")
        setInstitutionName("")
        setEmail("")
        setPhone("")
        queryClient.invalidateQueries(trpc.referral.getHistory.pathFilter())
        queryClient.invalidateQueries(trpc.referral.getStats.pathFilter())
      },
      onError: (err: any) => {
        toast.error(err?.message || "আমন্ত্রণ পাঠাতে ব্যর্থ হয়েছে।")
      },
    })
  )

  const handleCopyCode = () => {
    if (!codeData?.code) return
    navigator.clipboard.writeText(codeData.code)
    setCopiedCode(true)
    toast.success("রেফারেল কোড ক্লিপবোর্ডে কপি করা হয়েছে!")
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleCopyLink = () => {
    if (!effectiveReferralLink) return
    navigator.clipboard.writeText(effectiveReferralLink)
    setCopiedLink(true)
    toast.success("রেফারেল লিংক ক্লিপবোর্ডে কপি করা হয়েছে!")
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleWhatsAppShare = () => {
    if (!codeData) return
    const text = `আসসালামু আলাইকুম! আমাদের প্রতিষ্ঠান শিখনারী প্ল্যাটফর্ম ব্যবহার করে স্বয়ংক্রিয় এআই প্রশ্নপত্র প্রণয়ন করছে। আপনার প্রতিষ্ঠানের জন্যও শিখনারী ব্যবহার করতে পারেন। এই লিংকে যুক্ত হলেই উভয় প্রতিষ্ঠান ৫০টি ফ্রি এআই ক্রেডিট বোনাস পাবে: ${effectiveReferralLink}`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, "_blank")
  }

  const handleEmailShare = () => {
    if (!codeData) return
    const subject = "শিখনারী প্ল্যাটফর্মে যোগদানের আমন্ত্রণ"
    const body = `আসসালামু আলাইকুম,\n\nআমরা আমাদের প্রতিষ্ঠানের পরীক্ষার প্রশ্নপত্র তৈরি ও প্রশ্নব্যাংক অনুসন্ধানে শিখনারী (Shikhonary) প্ল্যাটফর্ম ব্যবহার করছি।\n\nআপনিও আপনার স্কুলের জন্য যুক্ত হতে পারেন। নিচের রেফারেল লিংকের মাধ্যমে যুক্ত হলে উভয় প্রতিষ্ঠানই ৫০টি ফ্রি এআই ক্রেডিট বোনাস লাভ করবে:\n\n${effectiveReferralLink}\n\nরেফারেল কোড: ${codeData.code}\n\nধন্যবাদ!`
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailto
  }

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!institutionName.trim() || !email.trim()) {
      toast.error("প্রতিষ্ঠানের নাম ও ইমেইল ঠিকানা প্রদান করুন।")
      return
    }
    inviteMutation.mutate({
      institutionName: institutionName.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
    })
  }

  const stats = [
    {
      title: "মোট রেফারেল",
      value: `${toBengaliDigits(statsData?.totalReferrals ?? 0)}টি`,
      subtitle: "আমন্ত্রিত শিক্ষা প্রতিষ্ঠান",
      icon: Building2,
      iconColor: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/40",
    },
    {
      title: "সফল রূপান্তর",
      value: `${toBengaliDigits(statsData?.activeInstitutions ?? 0)}টি`,
      subtitle: "অ্যাডমিন পোর্টাল সক্রিয় করেছে",
      icon: CheckCircle2,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/40",
    },
    {
      title: "অর্জিত বোনাস ক্রেডিট",
      value: `${toBengaliDigits(statsData?.totalEarnedCredits ?? 0)} ক্রেডিট`,
      subtitle: "সরাসরি ওয়ালেটে যুক্ত হয়েছে",
      icon: Coins,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-800/40",
    },
    {
      title: "অপেক্ষমাণ রূপান্তর",
      value: `${toBengaliDigits(statsData?.pendingReferrals ?? 0)}টি`,
      subtitle: `যোগদানে সম্ভাব্য +${toBengaliDigits(statsData?.potentialBonusCredits ?? 0)} ক্রেডিট`,
      icon: Clock,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800/40",
    },
  ]

  const historyItems = historyData?.items ?? []

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8 font-body">
      {/* ── 1. Page Header (Matching QuestionPaperPageHeader concept) ── */}
      <header className="w-full min-w-0 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-border/50">
        <div className="flex items-center gap-3.5 min-w-0 max-w-full">
          <div className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100/80 dark:border-primary/20 flex items-center justify-center text-indigo-600 dark:text-primary shadow-xs">
            <Gift className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold font-headline tracking-tight text-foreground leading-none">
                রেফারেল ও রিওয়ার্ডস
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 shrink-0 font-headline">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span>প্রতি রেফারেলে ৩০০ ক্রেডিট</span>
              </span>
            </div>
            <p className="mt-1.5 text-xs sm:text-[13px] text-muted-foreground font-body line-clamp-1 max-w-2xl">
              অন্যান্য শিক্ষক ও প্রতিষ্ঠানকে শিখনারী রেফার করে আকর্ষণীয় বোনাস ক্রেডিট ও বিশেষ রিওয়ার্ড অর্জন করুন
            </p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 flex-wrap">
          <Button
            variant="outline"
            asChild
            className="h-11 px-4 rounded-2xl border-border bg-card hover:bg-muted text-xs sm:text-sm font-bold font-headline text-foreground cursor-pointer flex items-center gap-2"
          >
            <Link href="/resource-pricing" title="প্রশ্ন প্রকারভিত্তিক ক্রেডিট রেট চার্ট">
              <Coins className="w-4 h-4 text-amber-500" />
              <span>ক্রেডিট রেট চার্ট</span>
            </Link>
          </Button>

          <Button
            onClick={handleCopyLink}
            disabled={isCodeLoading}
            className="group relative h-11 px-5 rounded-2xl bg-primary hover:bg-primary/95 text-white font-bold text-sm shadow-md shadow-primary/25 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
          >
            {copiedLink ? (
              <Check className="w-4 h-4 text-emerald-300" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span>{copiedLink ? "লিংক কপি হয়েছে!" : "রেফারেল লিংক কপি"}</span>
          </Button>
        </div>
      </header>

      {/* ── 2. KPI Metrics Cards (1:1 with QuestionPaperStatsCards) ── */}
      <section aria-label="রেফারেল পরিসংখ্যান">
        {isStatsLoading ? (
          <div>
            {/* Mobile Minimal Skeleton */}
            <div className="grid grid-cols-2 gap-2 sm:hidden">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-card rounded-xl p-2.5 border border-slate-200/80 dark:border-white/[0.06] shadow-2xs flex items-center gap-2.5 animate-pulse"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-white/10 shrink-0" />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="h-2.5 w-14 bg-slate-200 dark:bg-white/10 rounded" />
                    <div className="h-4 w-10 bg-slate-200 dark:bg-white/10 rounded" />
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Skeleton */}
            <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-card rounded-2xl p-5 border border-slate-200/80 dark:border-white/[0.06] shadow-xs flex flex-col justify-between animate-pulse select-none"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="h-3 w-20 bg-slate-200 dark:bg-white/10 rounded" />
                      <div className="h-7 w-24 bg-slate-200 dark:bg-white/10 rounded-md" />
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/10" />
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                    <div className="h-3 w-32 bg-slate-200 dark:bg-white/10 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Mobile View: Ultra Minimal Compact 2x2 Grid */}
            <div className="grid grid-cols-2 gap-2 sm:hidden">
              {stats.map((card, idx) => {
                const Icon = card.icon
                return (
                  <div
                    key={idx}
                    className="bg-card rounded-xl p-2.5 border border-slate-200/80 dark:border-white/[0.06] shadow-2xs flex items-center gap-2.5 min-w-0"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0`}
                    >
                      <Icon className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium text-slate-500 dark:text-muted-foreground truncate font-body leading-tight">
                        {card.title}
                      </p>
                      <p className="text-base font-bold font-headline text-slate-900 dark:text-foreground tracking-tight font-solaiman leading-tight mt-0.5">
                        {card.value}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop & Tablet View: Full KPI Cards */}
            <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4.5">
              {stats.map((card, idx) => {
                const Icon = card.icon
                return (
                  <article
                    key={idx}
                    className="bg-card rounded-2xl p-5 border border-slate-200/80 dark:border-white/[0.06] shadow-xs hover:shadow-md transition-all duration-200 relative group flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-muted-foreground font-body">
                          {card.title}
                        </p>
                        <h3 className="text-2xl sm:text-3xl font-bold font-headline text-slate-900 dark:text-foreground mt-1.5 tracking-tight font-solaiman">
                          {card.value}
                        </h3>
                      </div>
                      <div
                        className={`w-10 h-10 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200`}
                      >
                        <Icon className="w-5 h-5 stroke-[1.8]" />
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-muted-foreground/80 mt-3 font-body font-normal border-t border-slate-100 dark:border-white/[0.06] pt-3 truncate">
                      {card.subtitle}
                    </p>
                  </article>
                )
              })}
            </div>
          </>
        )}
      </section>

      {/* ── 3. Dual Hub: Share Studio & Direct Peer Invite ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Your Code & Quick Share (7 Cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-card p-5 sm:p-6 shadow-xs space-y-5">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40 font-headline">
              <Share2 className="w-3 h-3" />
              <span>আপনার প্রাতিষ্ঠানিক রেফারেল স্টুডিও</span>
            </span>
            <h3 className="text-base sm:text-lg font-bold font-headline text-slate-900 dark:text-foreground tracking-tight">
              কোড ও লিংক শেয়ার করে বোনাস ক্রেডিট অর্জন করুন
            </h3>
            <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed font-body">
              আপনার রেফারেল কোড বা লিংকের মাধ্যমে কোনো প্রতিষ্ঠান যুক্ত হয়ে অ্যাডমিন আমন্ত্রণ গ্রহণ করলে উভয়েই পাবেন আকর্ষণীয় ফ্রি এআই ক্রেডিট।
            </p>
          </div>

          {/* Big Code Pill Box */}
          <div className="p-4 sm:p-5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-muted-foreground font-headline block">
                প্রাতিষ্ঠানিক রেফারেল কোড
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-indigo-700 dark:text-primary select-all">
                {isCodeLoading ? "..." : codeData?.code || "SHIK-SCHOOL"}
              </div>
            </div>

            <Button
              onClick={handleCopyCode}
              disabled={isCodeLoading}
              className="h-10 px-4.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold font-headline text-xs gap-1.5 shrink-0 cursor-pointer shadow-xs active:scale-95 transition-all"
            >
              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? "কপি সম্পন্ন" : "কোড কপি করুন"}</span>
            </Button>
          </div>

          {/* Full Link Input with Copy */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-headline">
              সরাসরি রেফারেল ইনভাইটেশন লিংক
            </Label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={effectiveReferralLink}
                className="h-10.5 rounded-xl bg-muted/30 border-border text-xs sm:text-sm font-mono truncate"
              />
              <Button
                variant="outline"
                onClick={handleCopyLink}
                disabled={isCodeLoading}
                className="h-10.5 px-4 rounded-xl border-border bg-card hover:bg-muted text-xs font-bold font-headline shrink-0 gap-1.5 cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                <span className="hidden sm:inline">{copiedLink ? "কপি হয়েছে" : "কপি"}</span>
              </Button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="pt-3 border-t border-border/50 space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-headline block">
              দ্রুত শেয়ার করুন:
            </span>
            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleWhatsAppShare}
                className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/40 bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-100/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold font-headline gap-1.5 h-9.5 px-3.5 cursor-pointer shadow-2xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>হোয়াটসঅ্যাপে পাঠান</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleEmailShare}
                className="rounded-xl border border-slate-200/80 dark:border-white/[0.06] bg-card hover:bg-muted text-foreground text-xs font-bold font-headline gap-1.5 h-9.5 px-3.5 cursor-pointer shadow-2xs"
              >
                <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>ইমেইলে পাঠান</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Direct Peer Invite Form (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-card p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08] font-headline">
              <Send className="w-3 h-3" />
              <span>সহকর্মী প্রতিষ্ঠানকে আমন্ত্রণ</span>
            </span>
            <h3 className="text-base sm:text-lg font-bold font-headline text-slate-900 dark:text-foreground tracking-tight">
              সরাসরি ইনভাইটেশন রিকোয়েস্ট পাঠান
            </h3>
            <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed font-body">
              আপনার পরিচিত কোনো স্কুলের প্রধানের তথ্য প্রদান করুন। আমাদের সিস্টেম তাদের কাছে আপনার রেফারেন্সে আনুষ্ঠানিক আমন্ত্রণপত্র পাঠিয়ে দেবে।
            </p>
          </div>

          <form onSubmit={handleInviteSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-headline">
                শিক্ষা প্রতিষ্ঠানের নাম <span className="text-destructive">*</span>
              </Label>
              <Input
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                placeholder="যেমন: মতিঝিল আইডিয়াল স্কুল"
                disabled={inviteMutation.isPending}
                className="h-10 rounded-xl bg-card border-border text-xs sm:text-sm font-body"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-headline">
                প্রধান শিক্ষক / অধ্যক্ষের ইমেইল <span className="text-destructive">*</span>
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="principal@school.edu.bd"
                disabled={inviteMutation.isPending}
                className="h-10 rounded-xl bg-card border-border text-xs sm:text-sm font-body"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 font-headline">
                যোগাযোগের মোবাইল নম্বর (ঐচ্ছিক)
              </Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="০১৭xxxxxxxx"
                disabled={inviteMutation.isPending}
                className="h-10 rounded-xl bg-card border-border text-xs sm:text-sm font-body"
              />
            </div>

            <Button
              type="submit"
              disabled={inviteMutation.isPending}
              className="w-full h-10.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold font-headline text-xs sm:text-sm gap-2 shadow-xs cursor-pointer active:scale-95 transition-all mt-1"
            >
              {inviteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>আমন্ত্রণ পাঠানো হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>আমন্ত্রণপত্র প্রেরণ করুন</span>
                </>
              )}
            </Button>
          </form>

          <div className="p-3 rounded-xl bg-muted/30 border border-border/40 text-[11px] text-muted-foreground leading-relaxed flex items-center gap-2 font-body">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>নতুন প্রতিষ্ঠানটি যুক্ত হলেই উভয় প্রতিষ্ঠানই বোনাস ক্রেডিট উপভোগ করবে।</span>
          </div>
        </div>
      </div>

      {/* ── 4. Referral Ledger History Table ── */}
      <div className="space-y-4">
        {/* Section Header & Tab Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1 border-b border-border/50">
          <div>
            <h3 className="font-headline font-bold text-base sm:text-lg text-slate-900 dark:text-foreground">
              রেফারেল রূপান্তর ও লেজার হিস্ট্রি
            </h3>
            <p className="text-xs text-muted-foreground font-body">
              আপনার পাঠানো আমন্ত্রণ এবং যোগদানের রিয়েলটাইম স্ট্যাটাস
            </p>
          </div>

          {/* Filter Tabs matching QuestionPaperFilterBar style */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100/70 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06] shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setActiveFilter("ALL")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-headline font-bold transition-all cursor-pointer",
                activeFilter === "ALL"
                  ? "bg-white dark:bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              সবগুলো
            </button>
            <button
              onClick={() => setActiveFilter("REWARDED")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-headline font-bold transition-all cursor-pointer flex items-center gap-1.5",
                activeFilter === "REWARDED"
                  ? "bg-white dark:bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>রিওয়ার্ড অর্জিত</span>
            </button>
            <button
              onClick={() => setActiveFilter("PENDING")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-headline font-bold transition-all cursor-pointer flex items-center gap-1.5",
                activeFilter === "PENDING"
                  ? "bg-white dark:bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>অপেক্ষমাণ</span>
            </button>
          </div>
        </div>

        {/* Mobile View: Adaptive Card Grid (md:hidden) */}
        <div className="space-y-3 md:hidden">
          {isHistoryLoading ? (
            <div className="bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.06] p-8 text-center text-xs text-muted-foreground animate-pulse font-body">
              হিস্ট্রি লোড হচ্ছে...
            </div>
          ) : historyItems.length === 0 ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-card shadow-xs py-12 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-3 border border-indigo-100 dark:border-indigo-800/40">
                <Building2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-foreground font-headline">
                কোনো রেফারেল রেকর্ড পাওয়া যায়নি
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-muted-foreground max-w-sm mx-auto font-body">
                উপরে আপনার রেফারেল লিংক কপি করে অন্য শিক্ষা প্রতিষ্ঠানের সাথে শেয়ার করুন।
              </p>
            </div>
          ) : (
            historyItems.map((ref) => (
              <article
                key={ref.id}
                className="bg-card rounded-xl border border-slate-200/80 dark:border-white/[0.06] p-4 shadow-2xs space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-sm font-headline text-foreground truncate">
                    {ref.referredInstitutionName || ref.referredTenant?.nameBn || ref.referredTenant?.name || "শিক্ষা প্রতিষ্ঠান"}
                  </h4>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-bold font-headline px-2 py-0.5 rounded-lg shrink-0",
                      ref.status === "REWARDED"
                        ? "bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40"
                        : ref.status === "ACTIVATED"
                        ? "bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40"
                        : "bg-amber-50/70 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40"
                    )}
                  >
                    {ref.status === "REWARDED" ? "রিওয়ার্ড অর্জিত" : ref.status === "ACTIVATED" ? "সক্রিয়" : "অপেক্ষারত"}
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground font-body">
                  <span>যোগাযোগ: {ref.referredEmail || ref.referredPhone || "অনলাইন লিংক"}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/[0.06] text-xs font-headline">
                  <span className="text-muted-foreground font-body">আমন্ত্রণ: {formatDateBn(ref.createdAt)}</span>
                  <span
                    className={cn(
                      "font-bold font-solaiman",
                      ref.status === "REWARDED"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"
                    )}
                  >
                    {ref.status === "REWARDED"
                      ? `+${toBengaliDigits(ref.referrerBonusCredits)} ক্রেডিট`
                      : "প্রক্রিয়াধীন (+৫০)"}
                  </span>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Desktop Table View (hidden md:block) - Matching QuestionPaperDataTable Style */}
        <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-card shadow-xs">
          <Table className="w-full text-left">
            <TableHeader className="bg-slate-50/70 dark:bg-card/70 border-b border-slate-200/80 dark:border-white/[0.06]">
              <TableRow className="border-b border-slate-200/80 dark:border-white/[0.06] hover:bg-transparent">
                <TableHead className="px-6 py-3.5 font-bold text-xs text-slate-500 dark:text-muted-foreground font-headline min-w-[200px]">
                  শিক্ষা প্রতিষ্ঠান
                </TableHead>
                <TableHead className="px-6 py-3.5 font-bold text-xs text-slate-500 dark:text-muted-foreground font-headline min-w-[180px]">
                  ইমেইল / মোবাইল
                </TableHead>
                <TableHead className="px-6 py-3.5 font-bold text-xs text-slate-500 dark:text-muted-foreground font-headline text-center">
                  আমন্ত্রণের তারিখ
                </TableHead>
                <TableHead className="px-6 py-3.5 font-bold text-xs text-slate-500 dark:text-muted-foreground font-headline text-center">
                  স্ট্যাটাস
                </TableHead>
                <TableHead className="px-6 py-3.5 text-right font-bold text-xs text-slate-500 dark:text-muted-foreground font-headline">
                  অর্জিত রিওয়ার্ড
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {isHistoryLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground font-body">
                    হিস্ট্রি লোড হচ্ছে...
                  </TableCell>
                </TableRow>
              ) : historyItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-14 px-6 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-3 border border-indigo-100 dark:border-indigo-800/40">
                      <Building2 className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-foreground font-headline">
                      কোনো রেফারেল রেকর্ড পাওয়া যায়নি
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-muted-foreground max-w-sm mx-auto font-body">
                      উপরে আপনার রেফারেল লিংক কপি করে অন্য প্রতিষ্ঠানের সাথে শেয়ার করুন।
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                historyItems.map((ref) => (
                  <TableRow
                    key={ref.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors border-b border-slate-100 dark:border-white/[0.04]"
                  >
                    <TableCell className="py-4 px-6 font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/40 flex items-center justify-center shrink-0">
                          <Building2 className="w-4.5 h-4.5 stroke-[1.8]" />
                        </div>
                        <span className="font-bold font-headline text-slate-900 dark:text-foreground text-sm">
                          {ref.referredInstitutionName || ref.referredTenant?.nameBn || ref.referredTenant?.name || "শিক্ষা প্রতিষ্ঠান"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 px-6 text-muted-foreground font-body text-xs sm:text-sm">
                      {ref.referredEmail || ref.referredPhone || "লিংকের মাধ্যমে স্বয়ংক্রিয়"}
                    </TableCell>

                    <TableCell className="py-4 px-6 text-center font-solaiman text-muted-foreground text-xs sm:text-sm">
                      {formatDateBn(ref.createdAt)}
                    </TableCell>

                    <TableCell className="py-4 px-6 text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-semibold font-headline px-2.5 py-0.5 rounded-lg inline-flex items-center gap-1",
                          ref.status === "REWARDED"
                            ? "bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40"
                            : ref.status === "ACTIVATED"
                            ? "bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40"
                            : "bg-amber-50/70 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40"
                        )}
                      >
                        {ref.status === "REWARDED" ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>রিওয়ার্ড অর্জিত</span>
                          </>
                        ) : ref.status === "ACTIVATED" ? (
                          <>
                            <Check className="w-3 h-3 text-indigo-500" />
                            <span>সক্রিয়</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span>অপেক্ষারত</span>
                          </>
                        )}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-4 px-6 text-right font-headline font-bold font-solaiman">
                      {ref.status === "REWARDED" ? (
                        <span className="text-emerald-600 dark:text-emerald-400 text-sm">
                          +{toBengaliDigits(ref.referrerBonusCredits)} ক্রেডিট
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 text-xs font-normal">
                          প্রক্রিয়াধীন (+৩০০)
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── 5. How Referral Program Works (Standard Guidance Section) ── */}
      <div className="bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.06] p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-base sm:text-lg font-bold font-headline text-foreground flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>রেফারেল ও রিওয়ার্ডস কীভাবে কাজ করে?</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] space-y-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold font-headline text-xs border border-indigo-100 dark:border-indigo-800/40">
              ১
            </div>
            <h4 className="font-headline font-bold text-sm text-foreground">
              কোড বা লিংক শেয়ার করুন
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed font-body">
              আপনার পরিচিত অন্য কোনো স্কুলের প্রধান শিক্ষক বা আইটি কোঅর্ডিনেটরের সাথে আপনার প্রতিষ্ঠানের রেফারেল লিংক শেয়ার করুন।
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] space-y-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold font-headline text-xs border border-emerald-100 dark:border-emerald-800/40">
              ২
            </div>
            <h4 className="font-headline font-bold text-sm text-foreground">
              প্রতিষ্ঠান যুক্ত ও সক্রিয়করণ
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed font-body">
              নতুন প্রতিষ্ঠানটি শিখনারী প্ল্যাটফর্মে যুক্ত হয়ে অ্যাডমিন আমন্ত্রণ গ্রহণ করবে এবং পোর্টাল চালু করবে।
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] space-y-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold font-headline text-xs border border-amber-100 dark:border-amber-800/40">
              ৩
            </div>
            <h4 className="font-headline font-bold text-sm text-foreground">
              উভয় পক্ষের বোনাস লাভ
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed font-body">
              নতুন স্কুল যোগদানের সাথে সাথে আপনি পাবেন ৩০০টি ফ্রি এআই ক্রেডিট এবং নতুন স্কুল পাবে ১০০টি ওয়েলকাম ক্রেডিট!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
