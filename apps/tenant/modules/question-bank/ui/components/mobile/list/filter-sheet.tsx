"use client"

import React from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { Button } from "@workspace/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Label } from "@workspace/ui/components/label"
import { cn } from "@workspace/ui/lib/utils"

interface FilterOptionItem {
  id: string
  nameEn: string
  nameBn: string
}

interface MobileFilterSheetProps {
  isOpen: boolean
  onClose: () => void
  classId: string
  onClassChange: (val: string) => void
  subjectId: string
  onSubjectChange: (val: string) => void
  chapterId: string
  onChapterChange: (val: string) => void
  category: string
  onCategoryChange: (val: string) => void
  difficulty: string
  onDifficultyChange: (val: string) => void
  classes: FilterOptionItem[]
  subjects: FilterOptionItem[]
  chapters: FilterOptionItem[]
  categories: Array<{ code: string; nameEn: string; nameBn: string }>
  onReset: () => void
}

export const MobileFilterSheet: React.FC<MobileFilterSheetProps> = ({
  isOpen,
  onClose,
  classId,
  onClassChange,
  subjectId,
  onSubjectChange,
  chapterId,
  onChapterChange,
  category,
  onCategoryChange,
  difficulty,
  onDifficultyChange,
  classes,
  subjects,
  chapters,
  categories,
  onReset,
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className="bg-card border-t border-white/[0.08] text-foreground p-0 rounded-t-2xl max-h-[85vh] flex flex-col z-[100]"
      >
        <SheetHeader className="p-4 border-b border-white/[0.06] flex flex-row items-center justify-between">
          <SheetTitle className="text-base font-bold font-headline text-foreground">
            ফিল্টার অপশন
          </SheetTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
          >
            রিসেট
          </Button>
        </SheetHeader>

        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Category Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground font-body">
              প্রশ্ন ক্যাটাগরি
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => {
                const isSelected =
                  category.toUpperCase() === cat.code.toUpperCase()
                return (
                  <button
                    key={cat.code}
                    type="button"
                    onClick={() => onCategoryChange(cat.code)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary font-bold"
                        : "bg-white/[0.03] border-white/[0.06] text-muted-foreground"
                    )}
                  >
                    {cat.nameBn || cat.nameEn}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Class Select */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground font-body">
              শ্রেণি
            </Label>
            <Select value={classId} onValueChange={onClassChange}>
              <SelectTrigger className="h-10 text-xs font-body bg-white/[0.03] border-white/[0.08] text-foreground">
                <SelectValue placeholder="সকল শ্রেণি" />
              </SelectTrigger>
              <SelectContent className="bg-card border-white/[0.08] text-foreground text-xs font-body">
                <SelectItem value="All">সকল শ্রেণি</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nameBn || c.nameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject Select */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground font-body">
              বিষয়
            </Label>
            <Select value={subjectId} onValueChange={onSubjectChange}>
              <SelectTrigger className="h-10 text-xs font-body bg-white/[0.03] border-white/[0.08] text-foreground">
                <SelectValue placeholder="সকল বিষয়" />
              </SelectTrigger>
              <SelectContent className="bg-card border-white/[0.08] text-foreground text-xs font-body">
                <SelectItem value="All">সকল বিষয়</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nameBn || s.nameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Chapter Select */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground font-body">
              অধ্যায়
            </Label>
            <Select
              value={chapterId}
              onValueChange={onChapterChange}
              disabled={!subjectId || subjectId === "All"}
            >
              <SelectTrigger className="h-10 text-xs font-body bg-white/[0.03] border-white/[0.08] text-foreground disabled:opacity-50">
                <SelectValue placeholder="সকল অধ্যায়" />
              </SelectTrigger>
              <SelectContent className="bg-card border-white/[0.08] text-foreground text-xs font-body">
                <SelectItem value="All">সকল অধ্যায়</SelectItem>
                {chapters.map((ch) => (
                  <SelectItem key={ch.id} value={ch.id}>
                    {ch.nameBn || ch.nameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty Select */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground font-body">
              কাঠিন্যতা
            </Label>
            <Select value={difficulty} onValueChange={onDifficultyChange}>
              <SelectTrigger className="h-10 text-xs font-body bg-white/[0.03] border-white/[0.08] text-foreground">
                <SelectValue placeholder="সকল কাঠিন্য" />
              </SelectTrigger>
              <SelectContent className="bg-card border-white/[0.08] text-foreground text-xs font-body">
                <SelectItem value="All">সকল</SelectItem>
                <SelectItem value="EASY">সহজ</SelectItem>
                <SelectItem value="MEDIUM">মধ্যম</SelectItem>
                <SelectItem value="HARD">কঠিন</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-4 border-t border-white/[0.06] bg-card">
          <Button
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm h-10 rounded-xl"
          >
            ফিল্টার প্রয়োগ করুন
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
