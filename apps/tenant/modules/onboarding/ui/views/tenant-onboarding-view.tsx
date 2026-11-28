"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { MinimalApplicationForm } from "../components/minimal-application-form"
import { ApplicationStatusCard } from "../components/application-status-card"
import {
  GraduationCap,
  Sparkles,
  Building2,
  Loader2,
} from "lucide-react"

export function TenantOnboardingView() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)

  const {
    data: application,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery(trpc.tenantApplication.myStatus.queryOptions())

  // If already approved, redirect to home
  useEffect(() => {
    if (application?.status === "APPROVED") {
      router.push("/")
    }
  }, [application?.status, router])

  return (
    <div className="min-h-screen bg-background font-body text-foreground py-4 sm:py-10 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-7">
        {/* Page Top Header — Human, impactful Bengali copy */}
        <div className="space-y-1 sm:space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold bg-primary/10 text-primary border border-primary/20 font-headline">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
            <span>নতুন প্রতিষ্ঠান নিবন্ধন</span>
          </div>
          <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tight">
            আপনার প্রতিষ্ঠান বা কোচিং যুক্ত করুন
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-body leading-normal sm:leading-relaxed max-w-2xl">
            আপনার স্কুল, কলেজ, কোচিং বা ব্যক্তিগত পাঠদানের বিবরণ দিয়ে শুরু করুন। অনুমোদন সম্পন্ন হলেই আপনার নিজস্ব প্রশ্নব্যাংক ও পোর্টাল ব্যবহারের জন্য প্রস্তুত হয়ে যাবে।
          </p>
        </div>

        {/* Dynamic State: Loading vs Status Card vs Form */}
        {isLoading ? (
          <div className="rounded-2xl border border-border/80 bg-card p-8 sm:p-12 flex flex-col items-center justify-center gap-2.5 sm:gap-3 text-center shadow-xs">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-spin" />
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">
              তথ্য যাচাই করা হচ্ছে...
            </p>
          </div>
        ) : application && !isEditing ? (
          <ApplicationStatusCard
            application={application as any}
            onEdit={() => setIsEditing(true)}
            onReapply={() => setIsEditing(true)}
            onRefresh={refetch}
            isRefreshing={isRefetching}
          />
        ) : (
          <MinimalApplicationForm
            previousApplication={application}
            onCancel={application ? () => setIsEditing(false) : undefined}
            onSuccess={() => {
              setIsEditing(false)
              refetch()
            }}
          />
        )}
      </div>
    </div>
  )
}
