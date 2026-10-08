"use client"

import React from "react"
import Link from "next/link"
import { Database, Plus, RefreshCw, FileText } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

interface DesktopHeaderProps {
  onRefresh?: () => void
  isRefreshing?: boolean
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  onRefresh,
  isRefreshing,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-headline tracking-normal text-foreground">
              প্রশ্ন ব্যাংক
            </h1>
            <p className="text-sm text-muted-foreground font-body mt-0.5">
              জাতীয় শিক্ষাক্রম ও বোর্ড প্রশ্নভাণ্ডার থেকে প্রশ্ন অনুসন্ধান ও পর্যালোচনা করুন
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="border-white/[0.08] hover:bg-white/[0.04] text-muted-foreground hover:text-foreground text-xs h-9 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>রিফ্রেশ</span>
          </Button>
        )}

        <Button
          asChild
          size="sm"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-9 px-4 shadow-sm cursor-pointer"
        >
          <Link href="/question-papers/create">
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            <span>নতুন প্রশ্নপত্র তৈরি</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
