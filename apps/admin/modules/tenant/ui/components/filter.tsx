"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useCallback, useTransition } from "react"
import { Search, SlidersHorizontal, X, RotateCcw, ArrowUpDown } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@workspace/ui/components/drawer"

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
]

const TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "UNION_PORISHOD", label: "Union Porishod" },
  { value: "MUNICIPALITY", label: "Municipality" },
  { value: "CITY_CORPORATION", label: "City Corporation" },
]

interface FilterProps {
  isLoading?: boolean
}

export function Filter({ isLoading }: FilterProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const search = searchParams?.get("search") || ""
  const status = searchParams?.get("status") || "all"
  const type = searchParams?.get("type") || "all"

  const activeFilterCount = [
    search ? 1 : 0,
    status !== "all" ? 1 : 0,
    type !== "all" ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  const updateParam = useCallback(
    (key: string, value: string) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams?.toString() || "")
        if (value && value !== "all") {
          params.set(key, value)
        } else {
          params.delete(key)
        }
        params.delete("page")
        router.push(`?${params.toString()}`)
      })
    },
    [searchParams, router]
  )

  const clearAll = () => {
    startTransition(() => {
      router.push("?")
    })
  }

  const renderSelectFilters = (isMobile = false) => (
    <>
      {/* Status Filter */}
      <div className={isMobile ? "space-y-1.5" : "min-w-[160px]"}>
        {isMobile && (
          <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
            Portal Status
          </label>
        )}
        <Select value={status} onValueChange={(val) => updateParam("status", val ?? "all")}>
          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Type Filter */}
      <div className={isMobile ? "space-y-1.5" : "min-w-[180px]"}>
        {isMobile && (
          <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
            Entity Type
          </label>
        )}
        <Select value={type} onValueChange={(val) => updateParam("type", val ?? "all")}>
          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
            {TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  )

  return (
    <div className="mb-6 space-y-3">
      {/* Primary Filter Toolbar — Matched 1:1 with Role module */}
      <div className="flex items-center gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-low p-3 sm:p-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-outline" />
          <Input
            type="text"
            placeholder="Filter by Union Porishod Name or Slug..."
            value={search}
            onChange={(e) => updateParam("search", e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-white py-2.5 pl-10 pr-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto"
          />
          {search && (
            <button
              type="button"
              onClick={() => updateParam("search", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Desktop Filter Dropdowns (>= md) */}
        <div className="hidden md:flex items-center gap-3">
          {renderSelectFilters(false)}
        </div>

        {/* Mobile Filter Drawer Button (Visible ONLY on mobile: md:hidden) */}
        <Drawer>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className="md:hidden flex items-center gap-2 h-10 px-3.5 bg-white border-outline-variant/40 text-sm font-medium shrink-0 rounded-lg cursor-pointer"
            >
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              {activeFilterCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-white text-[11px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </DrawerTrigger>

          <DrawerContent className="p-6 space-y-5 bg-white border-t border-outline-variant/40">
            <DrawerHeader className="p-0 text-left">
              <DrawerTitle className="text-base font-bold text-on-surface flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-primary" />
                Filter Union Porishods
              </DrawerTitle>
              <DrawerDescription className="text-xs text-on-surface-variant">
                Select status and type filters to refine portal records.
              </DrawerDescription>
            </DrawerHeader>

            <div className="space-y-4 pt-1">
              {renderSelectFilters(true)}
            </div>

            <DrawerFooter className="p-0 pt-3 flex flex-row items-center gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={clearAll}
                className="flex-1 h-10 text-xs font-bold border-outline-variant/40 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Reset
              </Button>
              <DrawerClose asChild>
                <Button className="flex-1 h-10 text-xs font-bold bg-primary text-white cursor-pointer">
                  Apply Filters
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Reset / Clear Button */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            onClick={clearAll}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-outline hover:text-error h-10 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
