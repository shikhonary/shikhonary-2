"use client"

import { Input } from "@workspace/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
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
import { X, RotateCcw, SlidersHorizontal, ArrowUpDown, Filter, BookOpen } from "lucide-react"

interface QuestionPaperFilterBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedClassId: string
  onClassChange: (value: string) => void
  selectedStatus: string
  onStatusChange: (value: string) => void
  selectedSort: string
  onSortChange: (value: string) => void
  onResetAll?: () => void
  classes?: { id: string; nameEn: string; nameBn: string }[]
}

export function QuestionPaperFilterBar({
  searchQuery,
  onSearchChange,
  selectedClassId,
  onClassChange,
  selectedStatus,
  onStatusChange,
  selectedSort,
  onSortChange,
  onResetAll,
  classes = [],
}: QuestionPaperFilterBarProps) {
  const hasActiveQuery = Boolean(searchQuery && searchQuery.trim() !== "")
  const hasActiveClass = Boolean(selectedClassId && selectedClassId !== "All")
  const hasActiveStatus = Boolean(selectedStatus && selectedStatus !== "All")
  const hasActiveSort = Boolean(selectedSort && selectedSort !== "All")
  const hasAnyFilter = hasActiveQuery || hasActiveClass || hasActiveStatus || hasActiveSort

  const activeFilterCount =
    (hasActiveClass ? 1 : 0) +
    (hasActiveStatus ? 1 : 0) +
    (hasActiveSort ? 1 : 0)

  const handleResetAll = () => {
    onSearchChange("")
    onClassChange("All")
    onStatusChange("All")
    onSortChange("All")
    if (onResetAll) onResetAll()
  }

  const getSortLabel = (sort: string) => {
    switch (sort) {
      case "newest":
        return "নতুন তৈরি"
      case "oldest":
        return "পুরাতন তৈরি"
      case "title_asc":
        return "শিরোনাম (A-Z)"
      case "title_desc":
        return "শিরোনাম (Z-A)"
      default:
        return sort
    }
  }

  const getClassName = (classId: string) => {
    const cls = classes.find((c) => c.id === classId)
    return cls ? (cls.nameBn || cls.nameEn) : classId
  }

  const renderSelectFilters = (isMobile = false) => (
    <>
      {/* Class Filter */}
      <div className={isMobile ? "space-y-1.5" : "min-w-[160px]"}>
        {isMobile && (
          <label className="text-xs font-bold text-on-surface flex items-center gap-1.5 font-display">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            শ্রেণী
          </label>
        )}
        <Select
          value={selectedClassId}
          onValueChange={(val) => onClassChange(val ?? "All")}
        >
          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between">
            <SelectValue placeholder="সব শ্রেণী" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
            <SelectItem value="All">সব শ্রেণী</SelectItem>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.nameBn || cls.nameEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status Filter */}
      <div className={isMobile ? "space-y-1.5" : "min-w-[160px]"}>
        {isMobile && (
          <label className="text-xs font-bold text-on-surface flex items-center gap-1.5 font-display">
            <Filter className="h-3.5 w-3.5 text-primary" />
            স্ট্যাটাস
          </label>
        )}
        <Select
          value={selectedStatus}
          onValueChange={(val) => onStatusChange(val ?? "All")}
        >
          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between">
            <SelectValue placeholder="সব স্ট্যাটাস" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
            <SelectItem value="All">সব স্ট্যাটাস</SelectItem>
            <SelectItem value="Draft">খসড়া (Draft)</SelectItem>
            <SelectItem value="Published">প্রকাশিত (Published)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort Filter */}
      <div className={isMobile ? "space-y-1.5" : "min-w-[160px]"}>
        {isMobile && (
          <label className="text-xs font-bold text-on-surface flex items-center gap-1.5 font-display">
            <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
            সর্ট
          </label>
        )}
        <Select
          value={selectedSort}
          onValueChange={(val) => onSortChange(val ?? "All")}
        >
          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between">
            <SelectValue placeholder="সর্ট" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg font-body">
            <SelectItem value="All">সর্ট</SelectItem>
            <SelectItem value="newest">নতুন তৈরি</SelectItem>
            <SelectItem value="oldest">পুরাতন তৈরি</SelectItem>
            <SelectItem value="title_asc">শিরোনাম (A to Z)</SelectItem>
            <SelectItem value="title_desc">শিরোনাম (Z to A)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  )

  return (
    <div className="mb-6 space-y-3">
      {/* Primary Filter Toolbar */}
      <div className="flex items-center gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-low p-3 sm:p-4">
        {/* Search Input Filter */}
        <div className="relative flex-1 min-w-0">
          <Input
            type="text"
            placeholder="পরীক্ষার নাম বা প্রশ্নপত্র শিরোনাম দিয়ে অনুসন্ধান করুন..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto"
          />
        </div>

        {/* Mobile Filter Drawer Button */}
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
              <DrawerTitle className="text-base font-bold text-on-surface flex items-center gap-2 font-display">
                <SlidersHorizontal className="h-5 w-5 text-primary" />
                ফিল্টার তালিকা
              </DrawerTitle>
              <DrawerDescription className="text-xs text-on-surface-variant font-body">
                শ্রেণী, পরীক্ষার স্ট্যাটাস এবং সাজানোর অপশনগুলো বেছে নিন।
              </DrawerDescription>
            </DrawerHeader>

            {/* Stacked Filter Selects */}
            <div className="space-y-4 pt-1">
              {renderSelectFilters(true)}
            </div>

            <DrawerFooter className="p-0 pt-3 flex flex-row items-center gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={handleResetAll}
                className="flex-1 h-10 text-xs font-bold border-outline-variant/40 cursor-pointer font-display"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                রিসেট করুন
              </Button>
              <DrawerClose asChild>
                <Button className="flex-1 h-10 text-xs font-bold bg-primary text-white cursor-pointer font-display">
                  ফিল্টার প্রয়োগ করুন
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Desktop Filter Selects */}
        <div className="hidden md:flex items-center gap-3">
          {renderSelectFilters(false)}
        </div>
      </div>

      {/* Active Filter Badges & Reset Row */}
      {hasAnyFilter && (
        <div className="flex flex-col gap-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3 text-xs sm:flex-row sm:items-center sm:justify-between sm:bg-transparent sm:border-0 sm:p-0 sm:px-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="font-semibold text-outline text-[11px] sm:text-xs uppercase tracking-wider font-display">
              সক্রিয় ফিল্টারসমূহ:
            </span>

            {/* Search Query Badge */}
            {hasActiveQuery && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[11px] sm:text-xs font-medium text-on-surface hover:bg-surface-container-highest cursor-default normal-case tracking-normal max-w-[200px] truncate font-body"
              >
                <span className="truncate">অনুসন্ধান: &quot;{searchQuery}&quot;</span>
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="rounded-full p-0.5 hover:bg-outline-variant/30 transition-colors cursor-pointer shrink-0"
                  title="অনুসন্ধান ফিল্টার বাদ দিন"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {/* Class Filter Badge */}
            {hasActiveClass && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[11px] sm:text-xs font-medium text-on-surface hover:bg-surface-container-highest cursor-default normal-case tracking-normal shrink-0 font-body"
              >
                <span>শ্রেণী: {getClassName(selectedClassId)}</span>
                <button
                  type="button"
                  onClick={() => onClassChange("All")}
                  className="rounded-full p-0.5 hover:bg-outline-variant/30 transition-colors cursor-pointer shrink-0"
                  title="শ্রেণী ফিল্টার বাদ দিন"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {/* Status Filter Badge */}
            {hasActiveStatus && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[11px] sm:text-xs font-medium text-on-surface hover:bg-surface-container-highest cursor-default normal-case tracking-normal shrink-0 font-body"
              >
                <span>স্ট্যাটাস: {selectedStatus === "Draft" ? "খসড়া" : "প্রকাশিত"}</span>
                <button
                  type="button"
                  onClick={() => onStatusChange("All")}
                  className="rounded-full p-0.5 hover:bg-outline-variant/30 transition-colors cursor-pointer shrink-0"
                  title="স্ট্যাটাস ফিল্টার বাদ দিন"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {/* Sort Filter Badge */}
            {hasActiveSort && (
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[11px] sm:text-xs font-medium text-on-surface hover:bg-surface-container-highest cursor-default normal-case tracking-normal shrink-0 font-body"
              >
                <span>সর্ট: {getSortLabel(selectedSort)}</span>
                <button
                  type="button"
                  onClick={() => onSortChange("All")}
                  className="rounded-full p-0.5 hover:bg-outline-variant/30 transition-colors cursor-pointer shrink-0"
                  title="সর্ট বাদ দিন"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>

          {/* Reset All */}
          <div className="flex justify-end border-t border-outline-variant/20 pt-2 sm:border-0 sm:pt-0">
            <button
              type="button"
              onClick={handleResetAll}
              className="cursor-pointer focus:outline-hidden"
              title="সব ফিল্টার বাতিল করুন"
            >
              <Badge
                variant="outline"
                className="inline-flex items-center gap-1 rounded-md border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] sm:text-xs font-bold text-primary hover:bg-primary/20 transition-colors normal-case tracking-normal font-display"
              >
                <RotateCcw className="h-3 w-3" />
                <span>সব ফিল্টার রিসেট</span>
              </Badge>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
