"use client"

import * as React from "react"
import { LucideIcon, Inbox } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

export interface DataTableEmptyStateProps {
  columns: number
  icon?: LucideIcon
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function DataTableEmptyState({
  columns,
  icon: Icon = Inbox,
  title = "কোনো তথ্য পাওয়া যায়নি",
  description = "এই মুহূর্তে প্রদর্শনের জন্য কোনো রেকর্ড নেই।",
  actionLabel,
  onAction,
}: DataTableEmptyStateProps) {
  return (
    <tr>
      <td colSpan={columns} className="px-4 py-12 text-center">
        <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-primary border border-indigo-100/80 dark:border-primary/20">
            <Icon className="h-6 w-6 stroke-[1.8]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground font-headline">{title}</h3>
            <p className="text-xs text-muted-foreground font-body leading-relaxed">
              {description}
            </p>
          </div>
          {actionLabel && onAction && (
            <Button
              onClick={onAction}
              size="sm"
              className="mt-2 h-9 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-sm shadow-indigo-100/50 dark:shadow-none"
            >
              {actionLabel}
            </Button>
          )}
        </div>
      </td>
    </tr>
  )
}
