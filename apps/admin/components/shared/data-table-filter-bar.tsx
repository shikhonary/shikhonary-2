"use client"

import * as React from "react"
import { Search, X, RotateCcw, SlidersHorizontal, Check } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { cn } from "@workspace/ui/lib/utils"

export type StatusFilterValue = "ALL" | "ACTIVE" | "INACTIVE"

export interface ActiveFilterChip {
  id: string
  label: string
  onRemove: () => void
}

export interface DataTableFilterBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  status?: StatusFilterValue
  onStatusChange?: (status: StatusFilterValue) => void
  statusOptions?: { label: string; value: StatusFilterValue }[]
  activeFilters?: ActiveFilterChip[]
  onResetAll?: () => void
  children?: React.ReactNode
  extraControls?: React.ReactNode
  className?: string
  filterButtonLabel?: string
  filtersHeading?: string
  activeFiltersLabel?: string
  resetLabel?: string
  resetAllLabel?: string
  applyFiltersLabel?: string
  refineDisplayLabel?: string
}

export function DataTableFilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "অনুসন্ধান করুন...",
  status,
  onStatusChange,
  statusOptions = [
    { label: "সকল স্ট্যাটাস", value: "ALL" },
    { label: "সক্রিয় (Active)", value: "ACTIVE" },
    { label: "নিষ্ক্রিয় (Inactive)", value: "INACTIVE" },
  ],
  activeFilters = [],
  onResetAll,
  children,
  extraControls,
  className,
  filterButtonLabel = "ফিল্টার",
  filtersHeading = "ফিল্টারসমূহ",
  activeFiltersLabel = "সক্রিয় ফিল্টার:",
  resetLabel = "রিসেট",
  resetAllLabel = "সব রিসেট",
  applyFiltersLabel = "প্রয়োগ করুন",
  refineDisplayLabel = "ফিল্টার প্রয়োগ করুন",
}: DataTableFilterBarProps) {
  const [mobileSheetOpen, setMobileSheetOpen] = React.useState(false)

  // Compute built-in active filters
  const hasActiveSearch = Boolean(searchQuery && searchQuery.trim() !== "")
  const hasActiveStatus = Boolean(status && status !== "ALL")

  // Combine built-in and custom active filters
  const computedActiveFilters: ActiveFilterChip[] = [...activeFilters]

  if (hasActiveSearch && !computedActiveFilters.some((f) => f.id === "search")) {
    computedActiveFilters.unshift({
      id: "search",
      label: `অনুসন্ধান: "${searchQuery}"`,
      onRemove: () => onSearchChange(""),
    })
  }

  if (hasActiveStatus && onStatusChange && !computedActiveFilters.some((f) => f.id === "status")) {
    const statusLabel =
      statusOptions.find((opt) => opt.value === status)?.label || status
    computedActiveFilters.push({
      id: "status",
      label: `স্ট্যাটাস: ${statusLabel}`,
      onRemove: () => onStatusChange("ALL"),
    })
  }

  const hasAnyFilter = computedActiveFilters.length > 0
  const activeCount = computedActiveFilters.length

  const handleResetAll = () => {
    onSearchChange("")
    if (onStatusChange) onStatusChange("ALL")
    if (onResetAll) onResetAll()
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Primary Filter Toolbar */}
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-card p-3 sm:p-4 shadow-xs">
        {/* Search Input Filter */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-9 h-10 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-xs sm:text-sm text-foreground focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-600 transition-all font-body"
          />
          {hasActiveSearch && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-foreground rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="অনুসন্ধান মুছুন"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mobile Filter Sheet Trigger Button & Drawer */}
        <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className={cn(
                "md:hidden h-10 px-3 rounded-xl border flex items-center gap-1.5 text-xs font-bold font-body transition-all shrink-0 cursor-pointer active:scale-95",
                activeCount > 0
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-card border-slate-200 dark:border-white/[0.08] text-foreground hover:bg-slate-50 dark:hover:bg-white/[0.04] shadow-2xs"
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{filterButtonLabel}</span>
              {activeCount > 0 && (
                <span className="w-4.5 h-4.5 rounded-full bg-white text-indigo-600 text-[10px] font-bold flex items-center justify-center ml-0.5">
                  {activeCount}
                </span>
              )}
            </button>
          </SheetTrigger>

          <SheetContent
            side="bottom"
            className="rounded-t-3xl max-h-[88vh] flex flex-col p-0 border-t border-slate-200 dark:border-white/[0.08] bg-card text-foreground shadow-2xl focus:outline-hidden overflow-hidden"
          >
            {/* Grab Handle */}
            <div className="w-12 h-1.5 rounded-full bg-muted-foreground/25 mx-auto mt-3 mb-1 shrink-0" />

            {/* Sheet Header */}
            <SheetHeader className="px-4 py-3 border-b border-slate-200/80 dark:border-white/[0.06] text-left shrink-0">
              <SheetTitle className="text-base font-bold font-headline flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-primary flex items-center justify-center shrink-0">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span>{filtersHeading}</span>
                      {activeCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                          {activeCount}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-normal text-muted-foreground font-body leading-none mt-0.5">
                      {activeCount > 0
                        ? `${activeCount}টি ফিল্টার সক্রিয়`
                        : refineDisplayLabel}
                    </p>
                  </div>
                </div>

                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 font-body cursor-pointer transition-all active:scale-95"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{resetLabel}</span>
                  </button>
                )}
              </SheetTitle>
            </SheetHeader>

            {/* Sheet Body */}
            <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-4 font-body text-xs">
              {/* Active Filter Chips Strip inside Drawer */}
              {activeCount > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pb-3 border-b border-slate-200/80 dark:border-white/[0.06]">
                  <span className="text-[10px] font-semibold text-muted-foreground">{activeFiltersLabel}</span>
                  {computedActiveFilters.map((filter) => (
                    <span
                      key={filter.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-primary font-medium text-[11px] border border-indigo-100/80 dark:border-primary/20"
                    >
                      <span>{filter.label}</span>
                      <button
                        type="button"
                        onClick={filter.onRemove}
                        className="hover:opacity-75 cursor-pointer ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Status Section if configured */}
              {onStatusChange && (
                <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] space-y-2">
                  <label className="font-bold text-foreground">স্ট্যাটাস</label>
                  <Select
                    value={status ?? "ALL"}
                    onValueChange={(val) => onStatusChange(val as StatusFilterValue)}
                  >
                    <SelectTrigger className="w-full h-11 px-3.5 rounded-xl bg-card border border-slate-200 dark:border-white/[0.08] text-xs shadow-2xs">
                      <SelectValue placeholder="স্ট্যাটাস" />
                    </SelectTrigger>
                    <SelectContent className="font-body">
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Extra children filters */}
              {children && <div className="space-y-3">{children}</div>}
            </div>

            {/* Sticky Action Footer */}
            <div className="px-4 py-3 bg-card border-t border-slate-200/80 dark:border-white/[0.06] flex items-center gap-2.5 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetAll}
                disabled={activeCount === 0}
                className="h-11 px-4 rounded-xl font-bold flex items-center gap-1.5 border-slate-200 dark:border-white/[0.08] text-foreground shrink-0 disabled:opacity-40 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{resetLabel}</span>
              </Button>

              <Button
                type="button"
                onClick={() => setMobileSheetOpen(false)}
                className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] transition-transform cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{applyFiltersLabel}</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Filters & Slots */}
        <div className="hidden md:flex items-center gap-3">
          {onStatusChange && (
            <div className="min-w-[130px]">
              <Select
                value={status ?? "ALL"}
                onValueChange={(val) => onStatusChange(val as StatusFilterValue)}
              >
                <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground py-2 px-3.5 text-xs font-medium outline-hidden hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors h-10 justify-between cursor-pointer">
                  <SelectValue placeholder="স্ট্যাটাস" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl">
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {children}
          {extraControls}
        </div>
      </div>

      {/* Expanded Active Filters Tray (Shown whenever any filter is active) */}
      {hasAnyFilter && (
        <div className="flex flex-col gap-2 rounded-xl bg-slate-50/70 dark:bg-card/60 border border-slate-200/60 dark:border-white/[0.04] p-3 text-xs sm:flex-row sm:items-center sm:justify-between animate-in fade-in slide-in-from-top-1 duration-200 select-none">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="font-semibold text-slate-500 dark:text-muted-foreground text-[11px] sm:text-xs font-headline">
              {activeFiltersLabel}
            </span>

            {computedActiveFilters.map((filter) => (
              <Badge
                key={filter.id}
                variant="secondary"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-slate-100 dark:hover:bg-white/[0.04] cursor-default normal-case tracking-normal max-w-[260px] truncate font-body shadow-2xs"
              >
                <span className="truncate">{filter.label}</span>
                <button
                  type="button"
                  onClick={filter.onRemove}
                  className="rounded-full p-0.5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                  title={`${filter.label} মুছুন`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          {/* Reset All Button */}
          {onResetAll && (
            <div className="flex justify-end pt-1 sm:pt-0">
              <button
                type="button"
                onClick={handleResetAll}
                className="cursor-pointer focus:outline-hidden"
                title="সব ফিল্টার রিসেট করুন"
              >
                <Badge
                  variant="outline"
                  className="inline-flex items-center gap-1 rounded-lg border-indigo-200 bg-indigo-50/80 dark:bg-primary/10 text-indigo-600 dark:text-primary px-2.5 py-1 text-xs font-bold hover:bg-indigo-100/80 dark:hover:bg-primary/20 transition-colors normal-case tracking-normal font-headline cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>{resetAllLabel}</span>
                </Badge>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
