import React from "react"
import Link from "next/link"
import { History, Sparkles, User, Settings, CheckCircle, PlusCircle, ArrowRight } from "lucide-react"

interface HistoryItem {
  id: string
  action: string
  actorType: string
  createdAt: Date | string
  paperTitle: string
  paperId: string | null
}

interface RecentActivityTimelineProps {
  history: HistoryItem[]
}

export const RecentActivityTimeline: React.FC<RecentActivityTimelineProps> = ({ history }) => {
  const formatActionName = (action: string) => {
    switch (action) {
      case "CREATED":
        return "নতুন প্রশ্নপত্র তৈরি"
      case "PUBLISHED":
        return "প্রশ্নপত্র প্রকাশ"
      case "QUESTION_ADDED":
        return "প্রশ্ন সংযুক্ত"
      case "QUESTION_REMOVED":
        return "প্রশ্ন অপসারণ"
      case "SETTINGS_UPDATED":
        return "লেআউট ও সেটিংস পরিবর্তন"
      case "DISTRIBUTION_CHANGED":
        return "নম্বর বণ্টন পরিবর্তন"
      default:
        return "আপডেট সম্পন্ন"
    }
  }

  const formatTime = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString("bn-BD", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-white/[0.04]">
        <div className="size-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <History className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-foreground font-headline">
            সাম্প্রতিক কার্যক্রম
          </h3>
          <p className="text-[11px] text-muted-foreground font-body">
            অডিট ও এআই অ্যাসিস্ট্যান্ট লগ
          </p>
        </div>
      </div>

      {/* Timeline list */}
      {history.length === 0 ? (
        <div className="py-8 text-center text-xs text-muted-foreground font-body">
          কোনো সাম্প্রতিক কার্যক্রম রেকর্ড নেই
        </div>
      ) : (
        <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-white/[0.06]">
          {history.map((item) => {
            const isAI = item.actorType === "AI"
            return (
              <div key={item.id} className="flex items-start gap-3 relative pl-1">
                <div
                  className={`size-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                    isAI
                      ? "bg-indigo-500 text-white shadow-xs shadow-indigo-500/30"
                      : "bg-card border border-slate-200 dark:border-white/10 text-muted-foreground"
                  }`}
                >
                  {isAI ? <Sparkles className="h-3 w-3" /> : <User className="h-3 w-3" />}
                </div>

                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-foreground font-headline truncate">
                      {formatActionName(item.action)}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-solaiman shrink-0">
                      {formatTime(item.createdAt)}
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground font-body truncate">
                    {item.paperTitle}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
