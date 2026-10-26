"use client"

import * as React from "react"
import Link from "next/link"
import { Edit3, Trash2 } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

export interface QuestionCardActionsProps {
  editHref: string
  onDelete: () => void
  editLabel?: string
  deleteLabel?: string
  editTitle?: string
  deleteTitle?: string
  className?: string
  children?: React.ReactNode
}

export function QuestionCardActions({
  editHref,
  onDelete,
  editLabel = "এডিট",
  deleteLabel = "ডিলিট",
  editTitle = "সম্পাদনা করুন",
  deleteTitle = "মুছুন",
  className,
  children,
}: QuestionCardActionsProps) {
  return (
    <div
      className={cn(
        "flex md:flex-col justify-end items-stretch md:items-end gap-2 shrink-0 border-t md:border-t-0 border-slate-200/80 dark:border-white/[0.06] pt-3 md:pt-0 w-full md:w-auto",
        className
      )}
    >
      <Link
        href={editHref}
        prefetch={true}
        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 hover:bg-indigo-50 dark:hover:bg-primary/10 rounded-xl text-indigo-600 dark:text-primary font-bold text-xs transition-all cursor-pointer border border-slate-200/80 dark:border-white/[0.08] hover:border-indigo-300 shadow-xs flex-1 md:flex-initial md:w-24 font-headline"
        title={editTitle}
      >
        <Edit3 className="w-3.5 h-3.5" />
        <span>{editLabel}</span>
      </Link>

      <button
        type="button"
        onClick={onDelete}
        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-rose-600 dark:text-rose-400 font-bold text-xs transition-all cursor-pointer border border-slate-200/80 dark:border-white/[0.08] hover:border-rose-300 shadow-xs flex-1 md:flex-initial md:w-24 font-headline"
        title={deleteTitle}
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>{deleteLabel}</span>
      </button>

      {children}
    </div>
  )
}
