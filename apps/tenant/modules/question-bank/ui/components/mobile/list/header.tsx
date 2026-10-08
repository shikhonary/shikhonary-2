"use client"

import React from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"

interface MobileHeaderProps {
  search: string
  onSearchChange: (val: string) => void
  onOpenFilterSheet: () => void
  activeFiltersCount: number
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  search,
  onSearchChange,
  onOpenFilterSheet,
  activeFiltersCount,
}) => {
  return (
    <header className="sticky top-0 bg-background/95 backdrop-blur-md z-40 border-b border-white/[0.05] px-4 py-3 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold font-headline text-foreground">
          প্রশ্ন ব্যাংক
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenFilterSheet}
          className="h-8 px-2.5 text-xs border-white/[0.08] bg-white/[0.02] text-foreground flex items-center gap-1.5"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>ফিল্টার</span>
          {activeFiltersCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="প্রশ্ন বা উদ্দীপক খুঁজুন..."
          className="pl-9 pr-8 h-9 text-xs font-body bg-white/[0.03] border-white/[0.08] text-foreground focus:border-primary/40"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  )
}
