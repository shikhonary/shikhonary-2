"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  Coins,
  Calculator,
  ArrowLeft,
  Loader2,
  FileText,
  Pen,
  Sparkles,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  ReceiptText,
  Plus,
  RefreshCw,
  Clock,
  BookOpen,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  CheckCircle,
} from "lucide-react"
import { Card } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@workspace/ui/components/table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@workspace/ui/components/tabs"
import { useQuestionPaperCostBreakdown } from "../../services/use-question-paper"
import { CreditRechargeModal } from "@/modules/subscription-plan/ui/components/credits/credit-recharge-modal"
import { formatDurationBn } from "../edit-question-paper-view"
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

function formatTransactionDate(dateInput: string | Date): string {
  try {
    const d = new Date(dateInput)
    return d.toLocaleString("bn-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return String(dateInput)
  }
}

interface QuestionPaperCostViewProps {
  id: string
}

export function QuestionPaperCostView({ id }: QuestionPaperCostViewProps) {
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"breakdown" | "transactions">("breakdown")

  const { data, isLoading, isError, refetch } = useQuestionPaperCostBreakdown(id)

  if (isLoading) {
    return (
      <div className="flex h-[360px] sm:h-[400px] items-center justify-center font-display">
        <Loader2 className="h-7 w-7 sm:h-8 sm:w-8 animate-spin text-primary mr-2" />
        <span className="text-xs sm:text-sm font-bold text-muted-foreground font-body">
          ক্রেডিট খরচের হিসাব লোড হচ্ছে...
        </span>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="p-6 sm:p-8 text-center text-red-500 font-display space-y-3 bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.06] shadow-xs">
        <AlertTriangle className="h-9 w-9 sm:h-10 sm:w-10 mx-auto text-rose-500 opacity-80" />
        <p className="font-bold text-sm sm:text-base font-headline">প্রশ্নপত্রের ক্রেডিট খরচের হিসাব লোড করা যায়নি।</p>
        <Button variant="outline" onClick={() => refetch()} className="rounded-xl text-xs gap-2 font-headline h-9">
          <RefreshCw className="h-3.5 w-3.5" />
          <span>আবার চেষ্টা করুন</span>
        </Button>
      </div>
    )
  }

  const { paper, wallet, summary, distributionBreakdown, transactions } = data

  const progressPercent = summary.totalTargetQuestions > 0
    ? Math.min(100, Math.round((summary.totalAddedQuestions / summary.totalTargetQuestions) * 100))
    : 0

  const statsCards = [
    {
      title: "খরচ হয়েছে",
      value: `${toBengaliDigits(summary.netCreditsSpent)} ক্রেডিট`,
      subtitle: `${toBengaliDigits(summary.totalAddedQuestions)}টি যুক্ত প্রশ্নের বাবদ`,
      icon: Coins,
      iconColor: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/40",
    },
    {
      title: "মোট আনুমানিক বাজেট",
      value: `${toBengaliDigits(summary.totalEstimatedCredits)} ক্রেডিট`,
      subtitle: `সব মিলিয়ে মোট ${toBengaliDigits(summary.totalTargetQuestions)}টি প্রশ্নের জন্য`,
      icon: Calculator,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800/40",
    },
    {
      title: "বাকি ক্রেডিট প্রয়োজন",
      value: `${toBengaliDigits(summary.remainingCreditsNeeded)} ক্রেডিট`,
      subtitle: `আরও ${toBengaliDigits(Math.max(0, summary.totalTargetQuestions - summary.totalAddedQuestions))}টি প্রশ্ন যুক্ত করতে`,
      icon: Sparkles,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-800/40",
    },
    {
      title: "বর্তমান ব্যালেন্স",
      value: `${toBengaliDigits(wallet.creditBalance)} ক্রেডিট`,
      subtitle: wallet.hasSufficientBalance ? "পর্যাপ্ত ব্যালেন্স রয়েছে" : "ব্যালেন্স ঘাটতি রয়েছে",
      icon: Wallet,
      iconColor: wallet.hasSufficientBalance ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
      iconBg: wallet.hasSufficientBalance
        ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/40"
        : "bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-800/40",
    },
  ]

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-8 font-body">
      {/* ── 1. Page Header (Matching QuestionPaperPageHeader concept) ── */}
      <header className="w-full min-w-0 flex flex-col md:flex-row md:items-center md:justify-between gap-3.5 sm:gap-4 pb-2 border-b border-border/50">
        {/* Brand Icon & Title & Breadcrumb */}
        <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0 max-w-full">
          <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs mt-0.5 sm:mt-0">
            <Coins className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
          </div>
          <div className="min-w-0 flex-1">
            {/* Breadcrumb */}
            <nav className="mb-1 flex items-center space-x-1.5 text-muted-foreground text-[11px] sm:text-xs font-body overflow-hidden">
              <Link
                href="/question-papers"
                className="hover:text-primary transition-colors cursor-pointer shrink-0"
              >
                প্রশ্নপত্র তালিকা
              </Link>
              <span>/</span>
              <span className="truncate max-w-[120px] sm:max-w-xs">{paper.title}</span>
              <span>/</span>
              <span className="font-bold text-primary font-headline shrink-0">ক্রেডিট হিসাব</span>
            </nav>

            {/* Title & Status Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-bold font-headline tracking-tight text-foreground leading-none">
                প্রশ্নপত্রের ক্রেডিট খরচ ও হিসাব
              </h1>
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 font-headline",
                  paper.status === "Published"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40"
                    : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40"
                )}
              >
                {paper.status === "Published" ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    <span>পাবলিশড</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    <span>ড্রাফট</span>
                  </>
                )}
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-[13px] text-muted-foreground font-body line-clamp-1 max-w-2xl">
              প্রশ্নপত্রের প্রতিটি প্রশ্ন প্রকারের ক্রেডিট রেট, মোট প্রয়োজনীয় বাজেট এবং খরচ হওয়া ক্রেডিটের রিয়েলটাইম বিবরণ
            </p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        {/* Desktop View (sm:flex) */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-10 px-3.5 rounded-xl border-border bg-card hover:bg-muted text-xs font-bold font-headline cursor-pointer gap-1.5"
          >
            <Link href="/question-papers">
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
              <span>প্রশ্নপত্র তালিকা</span>
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-10 px-3.5 rounded-xl border-border bg-card hover:bg-muted text-xs font-bold font-headline cursor-pointer gap-1.5"
          >
            <Link href={`/question-papers/${paper.id}/builder`}>
              <FileText className="w-4 h-4 text-primary" />
              <span>বিল্ডার ওপেন করুন</span>
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-10 px-3.5 rounded-xl border-border bg-card hover:bg-muted text-xs font-bold font-headline cursor-pointer gap-1.5"
          >
            <Link href={`/question-papers/${paper.id}/edit`}>
              <Pen className="w-3.5 h-3.5 text-muted-foreground" />
              <span>কাঠামো পরিবর্তন</span>
            </Link>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsRechargeModalOpen(true)}
            className="h-10 px-4 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold font-headline text-xs cursor-pointer gap-1.5 shadow-md shadow-primary/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>ক্রেডিট রিচার্জ</span>
          </Button>
        </div>

        {/* Mobile View (sm:hidden): Compact 3-action bar */}
        <div className="grid grid-cols-3 gap-2 sm:hidden pt-1">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-9 px-2 rounded-xl border-border bg-card hover:bg-muted text-xs font-bold font-headline cursor-pointer gap-1.5 justify-center"
          >
            <Link href={`/question-papers/${paper.id}/builder`}>
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span>বিল্ডার</span>
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-9 px-2 rounded-xl border-border bg-card hover:bg-muted text-xs font-bold font-headline cursor-pointer gap-1.5 justify-center"
          >
            <Link href={`/question-papers/${paper.id}/edit`}>
              <Pen className="w-3.5 h-3.5 text-muted-foreground" />
              <span>কাঠামো</span>
            </Link>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsRechargeModalOpen(true)}
            className="h-9 px-2 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold font-headline text-xs cursor-pointer gap-1.5 justify-center shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>রিচার্জ</span>
          </Button>
        </div>
      </header>

      {/* ── 2. Insufficient Balance Warning Banner ── */}
      {!wallet.hasSufficientBalance && summary.remainingCreditsNeeded > 0 && (
        <Card className="rounded-2xl border border-amber-200/80 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/15 p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4 flex-col sm:flex-row">
            <div className="flex items-start gap-2.5 sm:gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                <h4 className="font-headline font-bold text-xs sm:text-sm text-foreground">
                  ক্রেডিট ঘাটতি সতর্কতা
                </h4>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed font-body">
                  আপনার বর্তমান ব্যালেন্স (<strong>{toBengaliDigits(wallet.creditBalance)} ক্রেডিট</strong>) বাকি প্রশ্নগুলো যুক্ত করার জন্য প্রয়োজনীয় ক্রেডিটের (<strong>{toBengaliDigits(summary.remainingCreditsNeeded)} ক্রেডিট</strong>) চেয়ে কম।
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setIsRechargeModalOpen(true)}
              className="w-full sm:w-auto rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold font-headline text-xs px-4 h-9 sm:h-9.5 shrink-0 cursor-pointer shadow-xs"
            >
              <Coins className="w-3.5 h-3.5 mr-1.5" />
              <span>রিচার্জ করুন</span>
            </Button>
          </div>
        </Card>
      )}

      {/* ── 3. KPI Stats Cards (Matching QuestionPaperStatsCards) ── */}
      <section aria-label="ক্রেডিট পরিসংখ্যান">
        {/* Mobile View: Minimal Compact 2x2 Grid */}
        <div className="grid grid-cols-2 gap-2 sm:hidden">
          {statsCards.map((card, idx) => {
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
                  <p className="text-sm font-bold font-headline text-slate-900 dark:text-foreground tracking-tight font-solaiman leading-tight mt-0.5 truncate">
                    {card.value}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop View: Full KPI Cards */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4.5">
          {statsCards.map((card, idx) => {
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
      </section>

      {/* ── 4. Question Paper Structure Quick Card ── */}
      <div className="bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.06] p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-headline">
              প্রশ্নপত্রের কাঠামো ও বিবরণ
            </span>
            <h3 className="font-headline font-bold text-base sm:text-lg text-foreground">
              {paper.examName} ({paper.className})
            </h3>
            <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground font-body flex-wrap pt-0.5">
              <span>পূর্ণমান: <strong className="text-foreground font-solaiman">{toBengaliDigits(paper.totalMarks)} নম্বর</strong></span>
              <span>•</span>
              <span>সময়: <strong className="text-foreground">{formatDurationBn(paper.timeInMinutes)}</strong></span>
              <span>•</span>
              <span>মোট বিষয়: <strong className="text-foreground font-solaiman">{toBengaliDigits(distributionBreakdown.length > 0 ? new Set(distributionBreakdown.map(d => d.subjectName)).size : 0)}টি</strong></span>
            </div>
          </div>

          <div className="w-full sm:w-72 space-y-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
            <div className="flex items-center justify-between text-xs font-headline">
              <span className="text-muted-foreground">প্রশ্ন সংযোজন অগ্রগতি</span>
              <span className="font-bold text-foreground font-solaiman">{toBengaliDigits(progressPercent)}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-body">
              <span>যুক্ত প্রশ্ন</span>
              <span className="font-solaiman font-medium text-foreground">
                {toBengaliDigits(summary.totalAddedQuestions)}/{toBengaliDigits(summary.totalTargetQuestions)}টি
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. Main Content: Tabs for Breakdown & Transactions ── */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as any)}
        className="w-full space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/50 pb-2">
          <TabsList className="bg-slate-100 dark:bg-white/[0.06] p-1 rounded-xl w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
            <TabsTrigger
              value="breakdown"
              className="rounded-lg text-xs font-bold font-headline px-2.5 sm:px-3.5 py-1.5 gap-1.5 sm:gap-2 cursor-pointer justify-center"
            >
              <Calculator className="h-3.5 w-3.5 shrink-0" />
              <span className="sm:hidden">মানবণ্টন তালিকা</span>
              <span className="hidden sm:inline">মানবণ্টন ও ক্রেডিট খরচের তালিকা</span>
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="rounded-lg text-xs font-bold font-headline px-2.5 sm:px-3.5 py-1.5 gap-1.5 sm:gap-2 cursor-pointer justify-center"
            >
              <ReceiptText className="h-3.5 w-3.5 shrink-0" />
              <span className="sm:hidden">হিস্ট্রি ({toBengaliDigits(transactions.length)})</span>
              <span className="hidden sm:inline">ক্রেডিট ব্যবহারের হিস্ট্রি ({toBengaliDigits(transactions.length)})</span>
            </TabsTrigger>
          </TabsList>

          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-xs text-primary font-bold font-headline hover:bg-primary/10 gap-1.5 h-8.5 cursor-pointer w-full sm:w-auto justify-end"
          >
            <Link href="/resource-pricing" target="_blank">
              <span>সকল প্রশ্নের গ্লোবাল ক্রেডিট রেট চার্ট</span>
              <Coins className="w-3.5 h-3.5 text-amber-500" />
            </Link>
          </Button>
        </div>

        {/* ── Tab 1: Breakdown View ── */}
        <TabsContent value="breakdown" className="space-y-4 m-0">
          {/* Mobile View: Adaptive Card Grid (md:hidden) */}
          <div className="space-y-3 md:hidden">
            {distributionBreakdown.length === 0 ? (
              <div className="bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.06] p-8 text-center text-xs text-muted-foreground font-body">
                এই প্রশ্নপত্রে কোনো মানবণ্টন বা বিষয় নির্ধারিত হয়নি।
              </div>
            ) : (
              distributionBreakdown.map((row) => (
                <article
                  key={row.distributionId}
                  className="bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-4 shadow-xs space-y-3"
                >
                  {/* Subject badge & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold font-headline bg-indigo-50 dark:bg-primary/10 text-indigo-700 dark:text-primary border border-indigo-100 dark:border-primary/20">
                      {row.subjectName}
                    </span>
                    {row.isFilled ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-full font-headline">
                        <CheckCircle2 className="w-3 h-3" /> সম্পূর্ণ
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 px-2 py-0.5 rounded-full font-headline">
                        বাকি
                      </span>
                    )}
                  </div>

                  {/* Question Type & Unit Rate */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-sm text-foreground font-headline">
                        {row.questionTypeNameBn || row.questionTypeName}
                      </h4>
                      {row.questionTypeLabel && (
                        <span className="text-[11px] text-muted-foreground block font-body">
                          লেবেল: {row.questionTypeLabel}
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 font-solaiman text-xs bg-muted/60 px-2.5 py-1 rounded-lg font-bold text-foreground border border-border/40 shrink-0">
                      🪙 {toBengaliDigits(row.unitCreditCost)} / প্রশ্ন
                    </span>
                  </div>

                  {/* Question Count & Mini Progress */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs font-body text-muted-foreground">
                      <span>সংযোজন অগ্রগতি</span>
                      <span
                        className={cn(
                          "font-solaiman font-bold",
                          row.addedCount >= row.targetCount
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-foreground"
                        )}
                      >
                        {toBengaliDigits(row.addedCount)}/{toBengaliDigits(row.targetCount)}টি
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          row.addedCount >= row.targetCount ? "bg-emerald-500" : "bg-primary"
                        )}
                        style={{
                          width: `${row.targetCount > 0 ? Math.min(100, Math.round((row.addedCount / row.targetCount) * 100)) : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Footer: Budget & Spent */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-border/40 text-xs font-headline">
                    <div>
                      <span className="text-muted-foreground text-[11px] block font-body">মোট বাজেট</span>
                      <span className="font-bold text-foreground font-solaiman">
                        {toBengaliDigits(row.estimatedCredits)} ক্রেডিট
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground text-[11px] block font-body">খরচ হয়েছে</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 font-solaiman">
                        {toBengaliDigits(row.spentCredits)} ক্রেডিট
                      </span>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Desktop Table View (hidden md:block) */}
          <div className="hidden md:block bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.06] overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-slate-50/80 dark:bg-white/[0.02]">
                <TableRow className="border-border/60">
                  <TableHead className="font-headline font-bold text-xs text-foreground min-w-[130px]">বিষয়</TableHead>
                  <TableHead className="font-headline font-bold text-xs text-foreground min-w-[160px]">প্রশ্নের ধরন</TableHead>
                  <TableHead className="font-headline font-bold text-xs text-foreground text-center">প্রতিটির রেট</TableHead>
                  <TableHead className="font-headline font-bold text-xs text-foreground text-center">মোট দরকার</TableHead>
                  <TableHead className="font-headline font-bold text-xs text-foreground text-center">যোগ করা হয়েছে</TableHead>
                  <TableHead className="font-headline font-bold text-xs text-foreground text-right">মোট ক্রেডিট</TableHead>
                  <TableHead className="font-headline font-bold text-xs text-foreground text-right">খরচ হয়েছে</TableHead>
                  <TableHead className="font-headline font-bold text-xs text-foreground text-center">স্ট্যাটাস</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="font-body text-xs sm:text-[13px]">
                {distributionBreakdown.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground font-body">
                      এই প্রশ্নপত্রে কোনো মানবণ্টন বা বিষয় নির্ধারিত হয়নি।
                    </TableCell>
                  </TableRow>
                ) : (
                  distributionBreakdown.map((row) => (
                    <TableRow key={row.distributionId} className="border-border/40 hover:bg-muted/20">
                      <TableCell className="font-medium text-foreground">
                        {row.subjectName}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <span className="font-bold text-foreground block font-headline">
                            {row.questionTypeNameBn || row.questionTypeName}
                          </span>
                          {row.questionTypeLabel && (
                            <span className="text-[11px] text-muted-foreground block font-body">
                              লেবেল: {row.questionTypeLabel}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center gap-1 font-solaiman text-xs bg-muted/50 px-2 py-0.5 rounded-md font-bold text-foreground border border-border/40">
                          🪙 {toBengaliDigits(row.unitCreditCost)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-headline font-medium text-foreground font-solaiman">
                        {toBengaliDigits(row.targetCount)}টি
                      </TableCell>
                      <TableCell className="text-center font-headline font-medium">
                        <span className={cn(
                          "font-solaiman",
                          row.addedCount >= row.targetCount
                            ? "text-emerald-600 dark:text-emerald-400 font-bold"
                            : "text-muted-foreground"
                        )}>
                          {toBengaliDigits(row.addedCount)}টি
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-headline font-medium text-foreground font-solaiman">
                        {toBengaliDigits(row.estimatedCredits)} ক্রেডিট
                      </TableCell>
                      <TableCell className="text-right font-headline font-bold text-indigo-600 dark:text-indigo-400 font-solaiman">
                        {toBengaliDigits(row.spentCredits)} ক্রেডিট
                      </TableCell>
                      <TableCell className="text-center">
                        {row.isFilled ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-full font-headline">
                            <CheckCircle2 className="w-3 h-3" /> সম্পূর্ণ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 px-2 py-0.5 rounded-full font-headline">
                            বাকি
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── Tab 2: Transactions Ledger ── */}
        <TabsContent value="transactions" className="space-y-4 m-0">
          {/* Mobile View: Adaptive Card Grid (md:hidden) */}
          <div className="space-y-3 md:hidden">
            {transactions.length === 0 ? (
              <div className="bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.06] p-8 text-center text-xs text-muted-foreground font-body">
                এই প্রশ্নপত্রের জন্য এখনো কোনো ক্রেডিট ব্যবহারের হিস্ট্রি নেই।
              </div>
            ) : (
              transactions.map((tx) => (
                <article
                  key={tx.id}
                  className="bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-4 shadow-xs space-y-2.5"
                >
                  {/* Date & Type Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground font-body">
                      {formatTransactionDate(tx.createdAt)}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[11px] font-bold font-headline px-2 py-0.5 rounded-full",
                        tx.type === "USAGE"
                          ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/40"
                          : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
                      )}
                    >
                      {tx.type === "USAGE" ? "খরচ" : "ফেরত"}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-foreground font-body leading-relaxed">
                    {tx.description}
                  </p>

                  {/* Footer: Balance & Amount */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs font-headline">
                    <div>
                      <span className="text-muted-foreground text-[11px] block font-body">অবশিষ্ট ব্যালেন্স</span>
                      <span className="font-bold text-foreground font-solaiman">
                        {toBengaliDigits(tx.balance)} ক্রেডিট
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground text-[11px] block font-body">পরিমাণ</span>
                      <span
                        className={cn(
                          "font-bold font-solaiman text-sm",
                          tx.type === "USAGE"
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        )}
                      >
                        {tx.type === "USAGE" ? "-" : "+"}
                        {toBengaliDigits(Math.abs(tx.amount))} ক্রেডিট
                      </span>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Desktop Table View (hidden md:block) */}
          <div className="hidden md:block bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.06] overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-slate-50/80 dark:bg-white/[0.02]">
                <TableRow className="border-border/60">
                  <TableHead className="font-headline font-bold text-xs text-foreground min-w-[150px]">তারিখ ও সময়</TableHead>
                  <TableHead className="font-headline font-bold text-xs text-foreground text-center">লেনদেনের ধরন</TableHead>
                  <TableHead className="font-headline font-bold text-xs text-foreground text-right">ক্রেডিট</TableHead>
                  <TableHead className="font-headline font-bold text-xs text-foreground min-w-[200px]">বিবরণ</TableHead>
                  <TableHead className="font-headline font-bold text-xs text-foreground text-right">অবশিষ্ট ব্যালেন্স</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="font-body text-xs sm:text-[13px]">
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground font-body">
                      এই প্রশ্নপত্রের জন্য এখনো কোনো ক্রেডিট ব্যবহারের হিস্ট্রি নেই।
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TableRow key={tx.id} className="border-border/40 hover:bg-muted/20">
                      <TableCell className="font-medium text-foreground">
                        {formatTransactionDate(tx.createdAt)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[11px] font-bold font-headline px-2 py-0.5 rounded-full",
                            tx.type === "USAGE"
                              ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/40"
                              : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
                          )}
                        >
                          {tx.type === "USAGE" ? "খরচ" : "ফেরত"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-headline font-bold font-solaiman">
                        <span className={cn(
                          tx.type === "USAGE"
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        )}>
                          {tx.type === "USAGE" ? "-" : "+"}
                          {toBengaliDigits(Math.abs(tx.amount))} ক্রেডিট
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-body">
                        {tx.description}
                      </TableCell>
                      <TableCell className="text-right font-headline font-medium text-foreground font-solaiman">
                        {toBengaliDigits(tx.balance)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Credit Recharge Modal */}
      <CreditRechargeModal
        isOpen={isRechargeModalOpen}
        onClose={() => {
          setIsRechargeModalOpen(false)
          refetch()
        }}
        currentBalance={wallet.creditBalance}
      />
    </div>
  )
}
