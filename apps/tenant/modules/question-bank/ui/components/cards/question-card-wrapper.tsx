"use client"

import React from "react"
import { cn } from "@workspace/ui/lib/utils"

export interface QuestionCardWrapperProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export const QuestionCardWrapper: React.FC<QuestionCardWrapperProps> = ({
  children,
  className,
  onClick,
}) => {
  return (
    <article
      onClick={onClick}
      className={cn(
        "rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-0 shadow-xs",
        "transition-all duration-200 hover:shadow-md hover:border-indigo-500/30 flex flex-col justify-between overflow-hidden relative font-display",
        className
      )}
    >
      {children}
    </article>
  )
}
