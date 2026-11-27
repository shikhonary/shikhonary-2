"use client"

import React from "react"
import { Bookmark, Tag, Flag } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

export interface QuestionCardFooterProps {
  reference?: string | string[] | null
  isBookmarked?: boolean
  onToggleBookmark?: (e: React.MouseEvent) => void
  onReport?: (e: React.MouseEvent) => void
  bookmarkText?: string
  bookmarkedText?: string
  leftContent?: React.ReactNode
  rightContent?: React.ReactNode
  className?: string
}

export const QuestionCardFooter: React.FC<QuestionCardFooterProps> = ({
  reference,
  isBookmarked = false,
  onToggleBookmark,
  onReport,
  bookmarkText = "বুকমার্কে যোগ করুন",
  bookmarkedText = "বুকমার্কে সংরক্ষিত",
  leftContent,
  rightContent,
  className,
}) => {
  const refList = Array.isArray(reference)
    ? reference.filter(Boolean)
    : reference
    ? [reference]
    : []
  const refString = refList.length > 0 ? refList.join(", ") : "শিখনারী প্রশ্নভাণ্ডার"

  return (
    <div
      className={cn(
        "px-4 py-2.5 bg-slate-50/80 dark:bg-white/[0.02] border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between text-xs font-body mt-auto relative z-10",
        className
      )}
    >
      {/* Left Side: Reference or Custom Left Content */}
      <div className="flex items-center gap-1.5 min-w-0 pr-2">
        {leftContent ? (
          leftContent
        ) : (
          <span
            className="text-[11px] text-muted-foreground/80 flex items-center gap-1.5 truncate max-w-[150px] sm:max-w-[220px] font-body"
            title={refString}
          >
            <Tag className="w-3 h-3 shrink-0 text-muted-foreground/60" />
            <span className="truncate">{refString}</span>
          </span>
        )}
      </div>

      {/* Right Side: Report and Bookmark buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        {rightContent ? (
          rightContent
        ) : (
          <>
            {onReport && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onReport(e)
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium font-headline transition-all cursor-pointer text-muted-foreground/75 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/40 active:scale-95"
                title="প্রশ্নে ত্রুটি রিপোর্ট করুন"
              >
                <Flag className="w-3.5 h-3.5 text-rose-500/80" />
                <span className="hidden sm:inline">রিপোর্ট</span>
              </button>
            )}

            {onToggleBookmark && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleBookmark(e)
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-headline transition-all cursor-pointer active:scale-95",
                  isBookmarked
                    ? "bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400"
                    : "bg-white dark:bg-card border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-800 shadow-2xs hover:bg-rose-50/50 dark:hover:bg-rose-950/20"
                )}
                title={isBookmarked ? "বুকমার্ক থেকে মুছুন" : "বুকমার্কে সংরক্ষণ করুন"}
              >
                <Bookmark
                  className={cn(
                    "w-3.5 h-3.5",
                    isBookmarked ? "fill-rose-500 text-rose-500" : "text-slate-500"
                  )}
                />
                <span>{isBookmarked ? bookmarkedText : bookmarkText}</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
