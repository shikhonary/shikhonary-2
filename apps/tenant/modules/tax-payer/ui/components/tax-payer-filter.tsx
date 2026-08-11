"use client"

import { useTaxPayerSearchParams } from "../hooks/use-tax-payer-search-params"
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
  MapPin,
  Building2,
  Table as TableIcon,
  CreditCard,
} from "lucide-react"

interface TaxPayerFilterProps {
  wards: any[]
  viewMode: "table" | "cards"
  setViewMode: (mode: "table" | "cards") => void
  setCurrentPage: (page: number) => void
}

export function TaxPayerFilter({
  wards,
  viewMode,
  setViewMode,
  setCurrentPage,
}: TaxPayerFilterProps) {
  const [searchParams, setSearchParams] = useTaxPayerSearchParams()
  const searchQuery = searchParams.search
  const wardFilter = searchParams.wardId
  const sortFilter = searchParams.sort

  const setSearchQuery = (val: string) => setSearchParams({ search: val })
  const setWardFilter = (val: string) => setSearchParams({ wardId: val })
  const setSortFilter = (val: string) => setSearchParams({ sort: val })

  const resetFilters = () => {
    setCurrentPage(1)
    setSearchParams({
      search: "",
      wardId: "all",
      sort: "all",
    })
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
            placeholder="হোল্ডিং, নাম, গ্রাম বা মোবাইল নম্বর দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full rounded-xl border border-border bg-muted/30 py-2.5 pl-10 pr-4 font-body text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 h-10 transition-all"
          />
        </div>

        {/* Mobile Filter Drawer Button (md:hidden) */}
        <Drawer>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className="md:hidden flex items-center gap-2 h-10 px-3.5 bg-muted/30 border-border text-foreground text-xs font-medium shrink-0 rounded-xl cursor-pointer hover:bg-muted/50"
            >
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              {(wardFilter !== "all" || sortFilter !== "all") && (
                <span className="flex size-4.5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  {(wardFilter !== "all" ? 1 : 0) + (sortFilter !== "all" ? 1 : 0)}
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
                    করদাতার তালিকা ওয়ার্ড ও সর্টিং অনুযায়ী ফিল্টার করুন
                  </DrawerDescription>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-4 font-body">
                {/* Ward Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 font-display">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    ওয়ার্ড নির্বাচন
                  </label>
                  <Select
                    value={wardFilter}
                    onValueChange={(val) => {
                      setWardFilter(val)
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-full rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-body text-xs text-foreground h-11 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="সকল ওয়ার্ড" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border shadow-xl rounded-xl text-popover-foreground">
                      <SelectItem value="all">সকল ওয়ার্ড</SelectItem>
                      {wards.map((w: any) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.nameBn || w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 font-display">
                    <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                    সর্টিং ক্রম
                  </label>
                  <Select
                    value={sortFilter}
                    onValueChange={(val) => {
                      setSortFilter(val)
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-full rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-body text-xs text-foreground h-11 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="সকল বাছাই" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border shadow-xl rounded-xl text-popover-foreground">
                      <SelectItem value="all">নতুন প্রথম</SelectItem>
                      <SelectItem value="holding_asc">হোল্ডিং (১ - ৯)</SelectItem>
                      <SelectItem value="name_asc">করদাতার নাম (ক-ক্ষ)</SelectItem>
                      <SelectItem value="tax_desc">ধার্যকৃত কর (বেশি)</SelectItem>
                      <SelectItem value="tax_asc">ধার্যকৃত কর (কম)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DrawerFooter className="p-0 pt-3 flex flex-row items-center gap-3 border-t border-border/50">
                <Button
                  variant="outline"
                  type="button"
                  onClick={resetFilters}
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

        {/* Desktop Filters (hidden md:flex) */}
        <div className="hidden md:flex items-center gap-3 font-body">
          {/* Ward Select */}
          <div className="min-w-[150px]">
            <Select
              value={wardFilter}
              onValueChange={(val) => {
                setWardFilter(val)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-full rounded-xl border border-border bg-muted/30 py-2.5 px-3.5 font-body text-xs text-foreground h-10 justify-between hover:bg-muted/50 transition-all">
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <SelectValue placeholder="সকল ওয়ার্ড" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border shadow-xl rounded-xl min-w-[160px] text-popover-foreground">
                <SelectItem value="all">সকল ওয়ার্ড</SelectItem>
                {wards.map((w: any) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.nameBn || w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Select */}
          <div className="min-w-[160px]">
            <Select
              value={sortFilter}
              onValueChange={(val) => {
                setSortFilter(val)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-full rounded-xl border border-border bg-muted/30 py-2.5 px-3.5 font-body text-xs text-foreground h-10 justify-between hover:bg-muted/50 transition-all">
                <div className="flex items-center gap-2 truncate">
                  <ArrowUpDown className="h-3.5 w-3.5 text-primary shrink-0" />
                  <SelectValue placeholder="সকল বাছাই" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border shadow-xl rounded-xl min-w-[170px] text-popover-foreground">
                <SelectItem value="all">নতুন প্রথম</SelectItem>
                <SelectItem value="holding_asc">হোল্ডিং (১ - ৯)</SelectItem>
                <SelectItem value="name_asc">করদাতার নাম (ক-ক্ষ)</SelectItem>
                <SelectItem value="tax_desc">ধার্যকৃত কর (বেশি)</SelectItem>
                <SelectItem value="tax_asc">ধার্যকৃত কর (কম)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Mode Toggle: Table vs Cards */}
          <div className="flex items-center rounded-xl border border-border bg-muted/30 p-1 shrink-0">
            <Button
              type="button"
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="h-8 px-3 text-xs font-bold rounded-lg gap-1.5 cursor-pointer"
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">টেবিল ভিউ</span>
            </Button>
            <Button
              type="button"
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("cards")}
              className="h-8 px-3 text-xs font-bold rounded-lg gap-1.5 cursor-pointer text-purple-600 hover:text-purple-700"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">স্মার্ট কার্ড গ্রিড</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filter Badges & Reset Row */}
      {(Boolean(searchQuery.trim()) || wardFilter !== "all" || sortFilter !== "all") && (
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
                  onClick={() => setSearchQuery("")}
                  className="rounded-full p-0.5 hover:bg-primary/20 transition-colors cursor-pointer shrink-0"
                  title="অনুসন্ধান সরান"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {/* Ward Filter Badge */}
            {wardFilter !== "all" && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-primary cursor-default shrink-0"
              >
                <span>
                  ওয়ার্ড: {wards.find((w: any) => w.id === wardFilter)?.nameBn || "নির্বাচিত ওয়ার্ড"}
                </span>
                <button
                  type="button"
                  onClick={() => setWardFilter("all")}
                  className="rounded-full p-0.5 hover:bg-primary/20 transition-colors cursor-pointer shrink-0"
                  title="ওয়ার্ড ফিল্টার সরান"
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
                  সর্ট:{" "}
                  {sortFilter === "holding_asc"
                    ? "হোল্ডিং (১ - ৯)"
                    : sortFilter === "name_asc"
                      ? "করদাতার নাম (ক-ক্ষ)"
                      : sortFilter === "tax_desc"
                        ? "ধার্যকৃত কর (বেশি)"
                        : "ধার্যকৃত কর (কম)"}
                </span>
                <button
                  type="button"
                  onClick={() => setSortFilter("all")}
                  className="rounded-full p-0.5 hover:bg-primary/20 transition-colors cursor-pointer shrink-0"
                  title="সর্ট ফিল্টার সরান"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-7 text-[11px] sm:text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg shrink-0"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            সকল ফিল্টার রিসেট
          </Button>
        </div>
      )}
    </div>
  )
}
