"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@workspace/auth/client"
import { Button } from "@workspace/ui/components/button"
import {
  Clock,
  CheckCircle2,
  Building2,
  Phone,
  PhoneCall,
  MapPin,
  Share2,
  RefreshCw,
  LogOut,
  Calendar,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Edit3,
  GraduationCap,
  Headphones,
} from "lucide-react"
import { toBengaliDigits } from "@workspace/utils"

export const TYPE_LABEL_MAP: Record<string, string> = {
  SCHOOL: "বিদ্যালয়",
  COACHING: "কোচিং সেন্টার",
  TUTOR: "ব্যক্তিগত টিউটর / গৃহশিক্ষক",
  COLLEGE: "কলেজ",
  MADRASAH: "মাদরাসা",
  OTHER: "অন্যান্য",
}

interface ApplicationStatusCardProps {
  application: {
    id: string
    type?: string
    name: string
    phone: string
    division?: { id: string; name: string; nameBn?: string | null } | null
    district?: { id: string; name: string; nameBn?: string | null } | null
    referralCode?: string | null
    status: "PENDING" | "APPROVED" | "REJECTED"
    rejectionReason?: string | null
    createdAt: string | Date
  }
  onEdit?: () => void
  onReapply: () => void
  onRefresh: () => void
  isRefreshing?: boolean
}

export function ApplicationStatusCard({
  application,
  onEdit,
  onReapply,
  onRefresh,
  isRefreshing = false,
}: ApplicationStatusCardProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true)
      await authClient.signOut()
      router.push("/auth/sign-in")
    } catch {
      setIsLoggingOut(false)
    }
  }

  const formattedDate = new Date(application.createdAt).toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const typeLabel = TYPE_LABEL_MAP[application.type || "SCHOOL"] || application.type || "শিক্ষা প্রতিষ্ঠান"

  // 1. Pending View
  if (application.status === "PENDING") {
    return (
      <div className="bg-card rounded-2xl border border-border/80 shadow-xs overflow-hidden font-body animate-fade-in">
        {/* Banner Top */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 sm:px-6 py-3.5 sm:py-5 flex items-center justify-between flex-wrap gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="size-8 sm:size-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.2 sm:px-2.5 sm:py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 font-headline">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                যাচাই চলছে
              </div>
              <h2 className="text-sm sm:text-base font-bold font-headline text-foreground mt-0.5 sm:mt-1">
                আপনার প্রতিষ্ঠানের নিবন্ধন যাচাই চলছে
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="rounded-xl border-border/70 bg-card hover:bg-muted text-foreground text-[11px] sm:text-xs font-headline font-bold h-8 sm:h-9 px-2.5 sm:px-3 gap-1.5 cursor-pointer shadow-xs"
              >
                <Edit3 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                <span>তথ্য পরিবর্তন</span>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="rounded-xl border-border/70 bg-card hover:bg-muted text-foreground text-[11px] sm:text-xs font-headline font-bold h-8 sm:h-9 px-2.5 sm:px-3 gap-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
              <span>রিফ্রেশ</span>
            </Button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-7 space-y-4 sm:space-y-6">
          <div className="bg-muted/20 rounded-xl p-3.5 sm:p-5 border border-border/60 space-y-3 sm:space-y-4">
            <h3 className="text-[11px] sm:text-xs font-semibold font-headline text-muted-foreground uppercase tracking-wider">
              নিবন্ধনে প্রদত্ত বিবরণ:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-start gap-2.5">
                <GraduationCap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] sm:text-xs text-muted-foreground block">প্রতিষ্ঠানের ধরন:</span>
                  <span className="font-semibold text-foreground font-headline">{typeLabel}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Building2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] sm:text-xs text-muted-foreground block">প্রতিষ্ঠানের নাম:</span>
                  <span className="font-semibold text-foreground font-headline">{application.name}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] sm:text-xs text-muted-foreground block">যোগাযোগের নম্বর:</span>
                  <span className="font-semibold text-foreground font-headline">{toBengaliDigits(application.phone)}</span>
                </div>
              </div>

              {(application.division || application.district) && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] sm:text-xs text-muted-foreground block">অবস্থান:</span>
                    <span className="font-semibold text-foreground font-headline">
                      {[
                        application.district?.nameBn || application.district?.name,
                        application.division?.nameBn || application.division?.name,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                </div>
              )}

              {application.referralCode && (
                <div className="flex items-start gap-2.5 sm:col-span-2">
                  <Share2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] sm:text-xs text-muted-foreground block">রেফারেল কোড:</span>
                    <span className="font-semibold text-primary font-mono tracking-wider">
                      {application.referralCode} (+১০০ ফ্রি ক্রেডিট উপহার)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Strong Contact Notice: Shikhonary Team Will Catch Up ASAP ── */}
          <div className="rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 sm:p-5 relative overflow-hidden shadow-xs animate-in fade-in">
            <div className="flex items-start gap-3 sm:gap-3.5">
              <div className="size-9 sm:size-11 rounded-xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Headphones className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-headline font-bold text-sm sm:text-base text-foreground flex items-center gap-1.5">
                    <span>শিখনারী টিম খুব দ্রুত আপনার সাথে যোগাযোগ করবে</span>
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground font-headline shadow-2xs">
                    জরুরি বিজ্ঞপ্তি
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-foreground/85 font-body leading-relaxed">
                  আপনার দেওয়া মোবাইল নম্বরে (<span className="font-headline font-bold text-primary font-mono">{toBengaliDigits(application.phone)}</span>) আমাদের ডেডিকেটেড সাপোর্ট টিম খুব দ্রুত কল করে তথ্য নিশ্চিত করবেন এবং আপনার প্রতিষ্ঠানের জন্য সম্পূর্ণ ডেটাবেজ ও প্রশ্নব্যাংক বুঝিয়ে দেবেন।
                </p>
                <div className="pt-1 flex items-center gap-2 text-[11px] sm:text-xs text-muted-foreground font-body">
                  <span className="inline-block size-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>অনুগ্রহ করে আপনার ফোনটি সচল রাখুন। খুব অল্প সময়ের মধ্যেই ভেরিফিকেশন কল সম্পন্ন হবে।</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex items-center justify-between border-t border-border/60 text-[11px] sm:text-xs">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="text-muted-foreground hover:text-foreground text-[11px] sm:text-xs h-8 gap-1.5 cursor-pointer px-2"
            >
              <LogOut className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>লগআউট</span>
            </Button>

            <span className="text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
              <span>নিবন্ধনের তারিখ: {formattedDate}</span>
            </span>
          </div>
        </div>
      </div>
    )
  }

  // 2. Approved View
  if (application.status === "APPROVED") {
    return (
      <div className="bg-card rounded-2xl border border-emerald-500/30 shadow-xs overflow-hidden font-body animate-fade-in">
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 sm:px-6 py-3.5 sm:py-5 flex items-center gap-2.5 sm:gap-3">
          <div className="size-8 sm:size-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.2 sm:px-2.5 sm:py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-headline">
              অনুমোদিত
            </div>
            <h2 className="text-sm sm:text-base font-bold font-headline text-foreground mt-0.5 sm:mt-1">
              অভিনন্দন! আপনার প্রতিষ্ঠান অনুমোদন পেয়েছে
            </h2>
          </div>
        </div>

        <div className="p-4 sm:p-7 space-y-4 sm:space-y-6">
          <p className="text-xs sm:text-sm text-foreground/80 leading-normal sm:leading-relaxed">
            আপনার প্রতিষ্ঠান <strong className="text-primary">{application.name}</strong> সফলভাবে অনুমোদন দেওয়া হয়েছে। আপনার স্বতন্ত্র ডেটাবেজ ও ক্লাউড পোর্টাল প্রস্তুত।
          </p>

          <Button
            type="button"
            onClick={() => router.push("/")}
            className="w-full h-10 sm:h-11 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-headline font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <span>পোর্টাল ড্যাশবোর্ডে প্রবেশ করুন</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  // 3. Rejected View
  return (
    <div className="bg-card rounded-2xl border border-rose-500/30 shadow-xs overflow-hidden font-body animate-fade-in">
      <div className="bg-rose-500/10 border-b border-rose-500/20 px-4 sm:px-6 py-3.5 sm:py-5 flex items-center gap-2.5 sm:gap-3">
        <div className="size-8 sm:size-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
          <ShieldAlert className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.2 sm:px-2.5 sm:py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 font-headline">
            অননুমোদিত
          </div>
          <h2 className="text-sm sm:text-base font-bold font-headline text-foreground mt-0.5 sm:mt-1">
            দুঃখিত, তথ্যটি গ্রহণ করা সম্ভব হয়নি
          </h2>
        </div>
      </div>

      <div className="p-4 sm:p-7 space-y-4 sm:space-y-6">
        {application.rejectionReason && (
          <div className="bg-rose-500/5 rounded-xl p-3 sm:p-4 border border-rose-500/20 text-xs sm:text-sm text-rose-300">
            <span className="font-bold block mb-1">কারণ:</span>
            {application.rejectionReason}
          </div>
        )}

        <Button
          type="button"
          onClick={onReapply}
          className="w-full h-10 sm:h-11 rounded-xl bg-primary text-primary-foreground font-headline font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
        >
          <span>সংশোধন করে পুনরায় জমা দিন</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
