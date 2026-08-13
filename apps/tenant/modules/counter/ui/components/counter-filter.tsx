"use client"

import { useCounterSearchParams } from "../hooks/use-counter-search-params"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
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
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  RotateCcw,
} from "lucide-react"

interface CounterFilterProps {
  setCurrentPage?: (page: number) => void
}

export function CounterFilter({ setCurrentPage }: CounterFilterProps) {
  const [searchParams, setSearchParams] = useCounterSearchParams()
  const searchQuery = searchParams.search
  const sortFilter = searchParams.sort as "all" | "key_asc" | "key_desc" | "value_desc" | "value_asc"

  const setSearchQuery = (val: string) => setSearchParams({ search: val })
  const setSortFilter = (val: any) => setSearchParams({ sort: val })

  const handlePageReset = () => {
    if (setCurrentPage) setCurrentPage(1)
  }

  return (
    <div className="space-y-3">
      {/* Primary Filter Toolbar */}
      <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xs p-3 sm:p-4">
        {/* Search Input Filter */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="কাউন্টার কী দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              handlePageReset()
            }}
            className="w-full rounded-xl border border-border bg-muted/30 py-2.5 pl-10 pr-4 font-body text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 h-10 transition-all"
          />
        </div>

        {/* Mobile Filter Drawer Button (Visible ONLY on mobile: md:hidden) */}
        <Drawer>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className="md:hidden flex items-center gap-2 h-10 px-3.5 bg-muted/30 border-border text-foreground text-xs font-medium shrink-0 rounded-xl cursor-pointer hover:bg-muted/50"
            >
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              {sortFilter !== "all" && (
                <span className="flex size-4.5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  1
                </span>
              )}
            </Button>
          </DrawerTrigger>

          <DrawerContent className="p-0 border-t border-border bg-card shadow-2xl rounded-t-3xl overflow-hidden text-foreground">
            <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-5 text-primary-foreground">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-primary-foreground shrink-0 shadow-sm">
                  <SlidersHorizontal className="h-5 w-5" />
                </div>
                <div>
                  <DrawerTitle className="font-display text-base font-bold text-primary-foreground">
                    ফিল্টার অ্যান্ড সর্ট
                  </DrawerTitle>
                  <DrawerDescription className="font-body text-xs text-primary-foreground/90 mt-0.5">
                    কাউন্টার তালিকা অনুসারে সাজান ও অনুসন্ধান করুন
                  </DrawerDescription>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-4 font-body">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 font-display">
                    <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                    সর্টিং ক্রম
                  </label>
                  <Select
                    value={sortFilter}
                    onValueChange={(val) => {
                      setSortFilter(val as any)
                      handlePageReset()
                    }}
                  >
                    <SelectTrigger className="w-full rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-body text-xs text-foreground h-11 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="সকল বাছাই" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border shadow-xl rounded-xl text-popover-foreground">
                      <SelectItem value="all">সকল বাছাই</SelectItem>
                      <SelectItem value="key_asc">বর্ণানুক্রমিক (ক-ক্ষ)</SelectItem>
                      <SelectItem value="key_desc">বিপরীত বর্ণানুক্রমিক (ক্ষ-ক)</SelectItem>
                      <SelectItem value="value_desc">মান (সর্বোচ্চ প্রথম)</SelectItem>
                      <SelectItem value="value_asc">মান (সর্বনিম্ন প্রথম)</SelectItem>
                      <SelectItem value="newest">সর্বশেষ যোগকৃত</SelectItem>
                      <SelectItem value="oldest">সর্বপ্রথম যোগকৃত</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DrawerFooter className="p-0 pt-3 flex flex-row items-center gap-3 border-t border-border/50">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setSearchQuery("")
                    setSortFilter("all")
                    handlePageReset()
                  }}
                  className="flex-1 h-11 text-xs font-medium border-border text-foreground hover:bg-muted rounded-xl cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  রিসেট
                </Button>
                <DrawerClose asChild>
                  <Button className="flex-1 h-11 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl cursor-pointer shadow-md shadow-primary/20">
                    ফিল্টার প্রয়োগ করুন
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>

        {/* Desktop Sort Filter Select (Visible ONLY on desktop: hidden md:flex) */}
        <div className="hidden md:flex items-center gap-3">
          <div className="min-w-[180px]">
            <Select
              value={sortFilter}
              onValueChange={(val) => {
                setSortFilter(val as any)
                handlePageReset()
              }}
            >
              <SelectTrigger className="w-full rounded-xl border border-border bg-muted/30 py-2.5 px-3.5 font-body text-xs text-foreground h-10 justify-between hover:bg-muted/50 transition-all">
                <div className="flex items-center gap-2 truncate">
                  <ArrowUpDown className="h-3.5 w-3.5 text-primary shrink-0" />
                  <SelectValue placeholder="সকল বাছাই" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border shadow-xl rounded-xl min-w-[180px] text-popover-foreground">
                <SelectItem value="all">সকল বাছাই</SelectItem>
                <SelectItem value="key_asc">বর্ণানুক্রমিক (ক-ক্ষ)</SelectItem>
                <SelectItem value="key_desc">বিপরীত বর্ণানুক্রমিক (ক্ষ-ক)</SelectItem>
                <SelectItem value="value_desc">মান (সর্বোচ্চ প্রথম)</SelectItem>
                <SelectItem value="value_asc">মান (সর্বনিম্ন প্রথম)</SelectItem>
                <SelectItem value="newest">সর্বশেষ যোগকৃত</SelectItem>
                <SelectItem value="oldest">সর্বপ্রথম যোগকৃত</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Active Filter Badges & Reset Row */}
      {(Boolean(searchQuery.trim()) || sortFilter !== "all") && (
        <div className="flex flex-col gap-2.5 rounded-xl border border-border/40 bg-card/40 p-3 text-xs sm:flex-row sm:items-center sm:justify-between sm:bg-transparent sm:border-0 sm:p-0 sm:px-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="font-semibold text-muted-foreground text-[11px] sm:text-xs uppercase tracking-wider font-display">
              সক্রিয় ফিল্টার:
            </span>

            {/* Search Query Badge */}
            {Boolean(searchQuery.trim()) && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-primary cursor-default max-w-[220px] truncate"
              >
                <span className="truncate">খোঁজ: &quot;{searchQuery}&quot;</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("")
                    handlePageReset()
                  }}
                  className="rounded-full p-0.5 hover:bg-primary/20 transition-colors cursor-pointer shrink-0"
                  title="অনুসন্ধান ফিল্টার সরান"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {/* Sort Filter Badge */}
            {sortFilter !== "all" && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-primary cursor-default shrink-0"
              >
                <span>
                  ক্রমানুসারে:{" "}
                  {sortFilter === "key_asc"
                    ? "বর্ণানুক্রমিক (ক-ক্ষ)"
                    : sortFilter === "key_desc"
                    ? "বিপরীত বর্ণানুক্রমিক (ক্ষ-ক)"
                    : sortFilter === "value_desc"
                    ? "মান (সর্বোচ্চ প্রথম)"
                    : sortFilter === "value_asc"
                    ? "মান (সর্বনিম্ন প্রথম)"
                    : sortFilter === "newest"
                    ? "সর্বশেষ যোগকৃত"
                    : "সর্বপ্রথম যোগকৃত"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSortFilter("all")
                    handlePageReset()
                  }}
                  className="rounded-full p-0.5 hover:bg-primary/20 transition-colors cursor-pointer shrink-0"
                  title="সর্ট ফিল্টার সরান"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>

          {/* Reset All Button */}
          <div className="flex justify-end border-t border-border/30 pt-2 sm:border-0 sm:pt-0">
            <button
              type="button"
              onClick={() => {
                handlePageReset()
                setSearchParams({ search: "", sort: "all" })
              }}
              className="cursor-pointer focus:outline-hidden"
              title="সকল সক্রিয় ফিল্টার রিসেট করুন"
            >
              <Badge
                variant="outline"
                className="inline-flex items-center gap-1 rounded-lg border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] sm:text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                <span>সব রিসেট করুন</span>
              </Badge>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
