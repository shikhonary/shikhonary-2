"use client"

import * as React from "react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
  SlidersHorizontal,
  RefreshCw,
  Layers,
  Image as ImageIcon,
  FileCheck2,
} from "lucide-react"
import { toBengaliDigits } from "@workspace/utils"

interface ContentTrackerHeaderProps {
  activeTab: "matrix" | "attachments" | "quality"
  onTabChange: (tab: "matrix" | "attachments" | "quality") => void
  onRefresh: () => void
  isLoading?: boolean
  missingVisualCount?: number
  pendingIssuesCount?: number
  showTabs?: boolean
}

export function ContentTrackerHeader({
  activeTab,
  onTabChange,
  onRefresh,
  isLoading = false,
  missingVisualCount = 0,
  pendingIssuesCount = 0,
  showTabs = true,
}: ContentTrackerHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Design System Page Header */}
      <PageHeader
        title="কনটেন্ট পাইপলাইন ও প্রুফিং ট্র্যাকার"
        description="সিলেবাস কাভারেজ, ডায়াগ্রাম সংযুক্তি এবং অ্যাক্টিভ প্রুফরিডিং স্ট্যাটাস নিরীক্ষণ ও পরিচালনা করুন।"
        icon={SlidersHorizontal}
        badge={{ label: "কনটেন্ট পাইপলাইন", variant: "indigo" }}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-10 px-4 rounded-xl border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-foreground font-semibold text-xs sm:text-sm gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          <span>রিফ্রেশ</span>
        </Button>
      </PageHeader>

      {/* Sub-navigation Tabs aligned with Admin Design Language */}
      {showTabs && (
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06] w-fit overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => onTabChange("matrix")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "matrix"
                ? "bg-card text-foreground shadow-xs border border-slate-200/80 dark:border-white/[0.08]"
                : "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-white/[0.02]"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>সিলেবাস পাইপলাইন মেট্রিক্স</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange("attachments")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "attachments"
                ? "bg-card text-foreground shadow-xs border border-slate-200/80 dark:border-white/[0.08]"
                : "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-white/[0.02]"
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>অনুপস্থিত চিত্র ডেস্ক</span>
            {missingVisualCount > 0 && (
              <Badge
                variant="destructive"
                className="text-[10px] px-1.5 py-0 rounded-full h-4.5 min-w-4.5 flex items-center justify-center font-mono font-bold"
              >
                {toBengaliDigits(missingVisualCount)}
              </Badge>
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange("quality")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "quality"
                ? "bg-card text-foreground shadow-xs border border-slate-200/80 dark:border-white/[0.08]"
                : "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-white/[0.02]"
            }`}
          >
            <FileCheck2 className="h-4 w-4" />
            <span>কোয়ালিটি কন্ট্রোল ও প্রুফিং</span>
            {pendingIssuesCount > 0 && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 rounded-full h-4.5 min-w-4.5 flex items-center justify-center bg-amber-500/15 text-amber-700 dark:text-amber-300 font-mono font-bold"
              >
                {toBengaliDigits(pendingIssuesCount)}
              </Badge>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
