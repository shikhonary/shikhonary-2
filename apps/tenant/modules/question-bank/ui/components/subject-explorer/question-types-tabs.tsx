"use client"

import React, { useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, Layers, Bookmark, Sparkles } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import type { QuestionTypeSummary } from "../../../types"

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "০"
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
  return num
    .toString()
    .split("")
    .map((char) => (/\d/.test(char) ? bengaliDigits[parseInt(char)] : char))
    .join("")
}

interface QuestionTypesTabsProps {
  questionTypes: QuestionTypeSummary[]
  activeCategory: string
  onSelectCategory: (code: string) => void
  totalQuestions: number
  bookmarkedCount?: number
  isBookmarkedOnly?: boolean
  onToggleBookmarkedOnly?: () => void
  isLoading?: boolean
  isSticky?: boolean
  className?: string
}

export const QuestionTypesTabs: React.FC<QuestionTypesTabsProps> = ({
  questionTypes,
  activeCategory,
  onSelectCategory,
  totalQuestions,
  bookmarkedCount = 0,
  isBookmarkedOnly = false,
  onToggleBookmarkedOnly,
  isLoading,
  isSticky = true,
  className,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeftPos = useRef(0)

  // Scroll horizontally on mouse wheel (deltaY translates to scrollLeft)
  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault()
        el.scrollLeft += e.deltaY
      } else if (e.deltaX !== 0) {
        el.scrollLeft += e.deltaX
      }
    }

    el.addEventListener("wheel", handleWheel, { passive: false })
    return () => el.removeEventListener("wheel", handleWheel)
  }, [])

  // Mouse drag to scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return
    isDragging.current = true
    startX.current = e.pageX - scrollContainerRef.current.offsetLeft
    scrollLeftPos.current = scrollContainerRef.current.scrollLeft
  }

  const handleMouseLeave = () => {
    isDragging.current = false
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollContainerRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX.current) * 1.5
    scrollContainerRef.current.scrollLeft = scrollLeftPos.current - walk
  }

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 260
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-3 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-hidden">
          <div className="h-10 w-28 bg-slate-200/80 dark:bg-white/10 rounded-xl animate-pulse shrink-0" />
          <div className="h-10 w-32 bg-slate-100 dark:bg-white/[0.06] rounded-xl animate-pulse shrink-0" />
          <div className="h-10 w-36 bg-slate-100 dark:bg-white/[0.06] rounded-xl animate-pulse shrink-0" />
          <div className="h-10 w-28 bg-slate-100 dark:bg-white/[0.06] rounded-xl animate-pulse shrink-0" />
          <div className="h-10 w-36 bg-slate-100 dark:bg-white/[0.06] rounded-xl animate-pulse shrink-0" />
          <div className="h-10 w-32 bg-slate-100 dark:bg-white/[0.06] rounded-xl animate-pulse shrink-0" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        isSticky
          ? "sticky top-16 z-20 bg-background/95 backdrop-blur-md py-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
          : "w-full min-w-0 py-0",
        className
      )}
    >
      <div className="bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-1.5 sm:p-2.5 shadow-xs flex flex-col gap-1 sm:gap-1.5">
        <div className="flex items-center gap-2 w-full min-w-0">
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => handleScroll("left")}
            className="hidden md:flex w-8 h-8 rounded-xl items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-foreground hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors shrink-0 cursor-pointer"
            aria-label="Previous tabs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scrollable Tabs List */}
          <div
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-0.5 cursor-grab active:cursor-grabbing select-none"
          >
            {/* Tab 1: All Questions */}
            <button
              type="button"
              onClick={() => {
                if (isBookmarkedOnly && onToggleBookmarkedOnly) {
                  onToggleBookmarkedOnly()
                }
                onSelectCategory("ALL")
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-headline transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeCategory === "ALL" && !isBookmarkedOnly
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100/70 dark:bg-white/[0.03] text-slate-700 dark:text-muted-foreground hover:bg-slate-200/70 dark:hover:bg-white/[0.08] hover:text-slate-900 dark:hover:text-foreground"
              }`}
            >
              <Layers className="w-3.5 h-3.5 stroke-[2]" />
              <span>সকল ধরন</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-md font-solaiman font-semibold leading-none ${
                  activeCategory === "ALL" && !isBookmarkedOnly
                    ? "bg-white/20 text-white"
                    : "bg-slate-200/80 dark:bg-white/[0.08] text-slate-700 dark:text-muted-foreground"
                }`}
                style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
              >
                {toBengaliDigits(totalQuestions)}
              </span>
            </button>

            {/* Dynamic Question Type Pills */}
            {questionTypes.map((qt) => {
              const isActive = activeCategory === qt.code && !isBookmarkedOnly
              return (
                <button
                  key={qt.code}
                  type="button"
                  onClick={() => {
                    if (isBookmarkedOnly && onToggleBookmarkedOnly) {
                      onToggleBookmarkedOnly()
                    }
                    onSelectCategory(qt.code)
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold font-headline transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100/70 dark:bg-white/[0.03] text-slate-700 dark:text-muted-foreground hover:bg-slate-200/70 dark:hover:bg-white/[0.08] hover:text-slate-900 dark:hover:text-foreground"
                  }`}
                >
                  <span>{qt.nameBn}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-md font-solaiman font-semibold leading-none ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-200/80 dark:bg-white/[0.08] text-slate-700 dark:text-muted-foreground"
                    }`}
                    style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                  >
                    {toBengaliDigits(qt.count)}
                  </span>
                </button>
              )
            })}

            {/* Tab: Bookmarked / Saved Questions */}
            {onToggleBookmarkedOnly && (
              <button
                type="button"
                onClick={onToggleBookmarkedOnly}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold font-headline transition-all cursor-pointer whitespace-nowrap shrink-0 ml-auto ${
                  isBookmarkedOnly
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-rose-50/70 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-950/40"
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 stroke-[2] ${isBookmarkedOnly ? "fill-white" : "fill-rose-500"}`} />
                <span>বুকমার্ককৃত প্রশ্ন</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-md font-solaiman font-semibold leading-none ${
                    isBookmarkedOnly
                      ? "bg-white/20 text-white"
                      : "bg-rose-200/80 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200"
                  }`}
                  style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                >
                  {toBengaliDigits(bookmarkedCount)}
                </span>
              </button>
            )}
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => handleScroll("right")}
            className="hidden md:flex w-8 h-8 rounded-xl items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-foreground hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors shrink-0 cursor-pointer"
            aria-label="Next tabs"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile-only scroll instruction directly below the tabs */}
        <div className="flex md:hidden items-center text-[11px] text-muted-foreground px-1 select-none pt-1 border-t border-slate-100 dark:border-white/[0.04]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shrink-0" />
            <span className="font-body">ডানে বা বাঁয়ে স্ক্রল করে আরও ধরন দেখুন</span>
          </span>
        </div>
      </div>
    </div>
  )
}
