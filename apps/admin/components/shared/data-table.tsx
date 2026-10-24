"use client"

import * as React from "react"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@workspace/ui/components/table"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"
import { DataTablePagination, type DataTablePaginationProps } from "./data-table-pagination"
import { AlertTriangle, FileQuestion, LucideIcon } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

export interface DataTableColumn<T> {
  header: React.ReactNode
  accessorKey?: keyof T | string
  cell?: (item: T, index: number) => React.ReactNode
  className?: string
  headerClassName?: string
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
  errorDescription?: string
  emptyIcon?: LucideIcon
  emptyTitle?: string
  emptyDescription?: string
  emptyActionLabel?: string
  emptyActionHref?: string
  onEmptyAction?: () => void
  pagination?: {
    page: number
    limit: number
    totalItems: number
    onPageChange: (newPage: number) => void
    onLimitChange?: (newLimit: number) => void
    pageSizeOptions?: number[]
    entityName?: string
  }
  renderMobileCard?: (item: T, index: number) => React.ReactNode
  className?: string
  rowKey?: (item: T) => string
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  isLoading = false,
  isError = false,
  errorMessage = "তথ্য লোড করা সম্ভব হয়নি।",
  errorDescription = "অনুগ্রহ করে পৃষ্ঠাটি রিলোড দিন অথবা কিছুক্ষণ পর পুনরায় চেষ্টা করুন।",
  emptyIcon: EmptyIcon = FileQuestion,
  emptyTitle = "কোনো রেকর্ড পাওয়া যায়নি",
  emptyDescription = "এই মুহূর্তে প্রদর্শনের জন্য কোনো তথ্য নেই।",
  emptyActionLabel,
  emptyActionHref,
  onEmptyAction,
  pagination,
  renderMobileCard,
  className,
  rowKey = (item) => String(item.id ?? Math.random()),
}: DataTableProps<T>) {
  // 1. Loading Skeleton State
  if (isLoading) {
    return (
      <div className={cn("w-full space-y-4", className)}>
        {/* Mobile View Skeleton */}
        {renderMobileCard && (
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={`mobile-skeleton-${i}`}
                className="bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs p-5 space-y-3 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-200/80 dark:bg-white/10 shrink-0" />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="h-4 w-3/4 bg-slate-200/80 dark:bg-white/10 rounded" />
                    <div className="h-3 w-1/2 bg-slate-100 dark:bg-white/[0.06] rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Desktop View Skeleton */}
        <div
          className={cn(
            "overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-card shadow-xs",
            renderMobileCard ? "hidden md:block" : "block"
          )}
        >
          <div className="bg-slate-50/70 dark:bg-card/70 border-b border-slate-200/80 dark:border-white/[0.06] px-6 py-3.5 flex items-center justify-between">
            <div className="h-4 w-32 bg-slate-200/80 dark:bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-20 bg-slate-200/60 dark:bg-white/[0.06] rounded animate-pulse" />
          </div>
          <div className="divide-y divide-slate-100 dark:divide-white/[0.04] p-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-6 px-4 py-4 animate-pulse"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50/80 dark:bg-primary/10 border border-indigo-100 dark:border-primary/20 shrink-0" />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="h-4 w-48 bg-slate-200/80 dark:bg-white/10 rounded" />
                    <div className="h-3 w-32 bg-slate-100 dark:bg-white/[0.06] rounded" />
                  </div>
                </div>
                <div className="h-6 w-20 bg-indigo-50/80 dark:bg-primary/10 rounded-lg border border-indigo-100/80 dark:border-primary/20 shrink-0" />
                <div className="h-6 w-20 bg-slate-100 dark:bg-white/[0.06] rounded-full shrink-0" />
                <div className="flex items-center gap-2 shrink-0">
                  <div className="h-8 w-20 bg-indigo-100/60 dark:bg-primary/20 rounded-xl" />
                  <div className="h-8 w-8 bg-slate-100 dark:bg-white/[0.06] rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // 2. Error State
  if (isError) {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50/20 dark:bg-red-950/10 shadow-xs p-12 text-center text-red-600 font-headline",
          className
        )}
      >
        <AlertTriangle className="h-10 w-10 mx-auto text-red-500 mb-3" />
        <p className="text-base font-bold">{errorMessage}</p>
        <p className="text-xs text-muted-foreground mt-1 font-body">
          {errorDescription}
        </p>
      </div>
    )
  }

  // 3. Empty State
  if (data.length === 0) {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-card shadow-xs py-16 px-6 text-center select-none",
          className
        )}
      >
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100/80 dark:border-primary/20 text-indigo-600 dark:text-primary mx-auto flex items-center justify-center mb-4 shadow-sm shadow-indigo-100/50 dark:shadow-none">
          <EmptyIcon className="w-8 h-8 stroke-[1.8]" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-foreground font-headline">
          {emptyTitle}
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-muted-foreground max-w-md mx-auto font-body">
          {emptyDescription}
        </p>
        {emptyActionLabel && (emptyActionHref || onEmptyAction) && (
          <div className="mt-6">
            {emptyActionHref ? (
              <Button
                asChild
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-5 gap-2 shadow-sm shadow-indigo-200 dark:shadow-none transition-all font-headline cursor-pointer"
              >
                <Link href={emptyActionHref} prefetch={true}>
                  <span>{emptyActionLabel}</span>
                </Link>
              </Button>
            ) : (
              <Button
                onClick={onEmptyAction}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-5 gap-2 shadow-sm shadow-indigo-200 dark:shadow-none transition-all font-headline cursor-pointer"
              >
                <span>{emptyActionLabel}</span>
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }

  // 4. Populated State
  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Mobile View - Direct Card Grid Without Box Wrapper */}
      {renderMobileCard && (
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {data.map((item, idx) => (
            <React.Fragment key={rowKey(item)}>
              {renderMobileCard(item, idx)}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Desktop Table View - Contained in rounded-2xl Card */}
      <div
        tabIndex={0}
        role="region"
        aria-label="ডাটা তালিকা"
        className={cn(
          "overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-card shadow-xs focus:outline-hidden",
          renderMobileCard ? "hidden md:block" : "block"
        )}
      >
        <Table className="w-full text-left">
          <TableHeader className="bg-slate-50/70 dark:bg-card/70 border-b border-slate-200/80 dark:border-white/[0.06]">
            <TableRow className="border-b border-slate-200/80 dark:border-white/[0.06] hover:bg-transparent">
              {columns.map((col, idx) => (
                <TableHead
                  key={`head-${idx}`}
                  className={cn(
                    "px-6 py-3.5 font-bold text-xs text-slate-500 dark:text-muted-foreground font-headline",
                    col.headerClassName
                  )}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
            {data.map((item, rowIdx) => (
              <TableRow
                key={rowKey(item)}
                className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors border-b border-slate-100 dark:border-white/[0.04] group"
              >
                {columns.map((col, colIdx) => (
                  <TableCell
                    key={`cell-${rowIdx}-${colIdx}`}
                    className={cn("py-4 px-6 font-body", col.className)}
                  >
                    {col.cell
                      ? col.cell(item, rowIdx)
                      : col.accessorKey
                      ? String((item as any)[col.accessorKey] ?? "")
                      : null}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Integrated Pagination if passed */}
      {pagination && pagination.totalItems > 0 && (
        <DataTablePagination
          page={pagination.page}
          limit={pagination.limit}
          totalItems={pagination.totalItems}
          entityName={pagination.entityName ?? "টি রেকর্ড"}
          isLoading={isLoading}
          onPageChange={pagination.onPageChange}
          onLimitChange={pagination.onLimitChange}
          pageSizeOptions={pagination.pageSizeOptions}
        />
      )}
    </div>
  )
}
