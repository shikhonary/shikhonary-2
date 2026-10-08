"use client"

import React from "react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { GraduationCap, BookOpen, FileText } from "lucide-react"
import type { AcademicClassItem } from "../../../types"

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "০"
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
  return num
    .toString()
    .split("")
    .map((char) => (/\d/.test(char) ? bengaliDigits[parseInt(char)] : char))
    .join("")
}

interface ClassDetailModalProps {
  selectedClass: AcademicClassItem | null
  onClose: () => void
}

export const ClassDetailModal: React.FC<ClassDetailModalProps> = ({
  selectedClass,
  onClose,
}) => {
  if (!selectedClass) return null

  return (
    <Dialog open={Boolean(selectedClass)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl bg-white dark:bg-card border border-slate-200 dark:border-white/[0.08] text-foreground p-0 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-6 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-card/90">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100 dark:border-primary/20 flex items-center justify-center text-indigo-600 dark:text-primary shrink-0 shadow-xs">
              <GraduationCap className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold font-headline text-slate-900 dark:text-foreground">
                {selectedClass.nameBn}
              </DialogTitle>
              <p className="text-xs text-slate-500 dark:text-muted-foreground font-body mt-0.5">
                {selectedClass.nameEn} • {toBengaliDigits(selectedClass.subjectCount)}টি পাঠ্য বিষয় অন্তর্ভুক্ত
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Subjects List */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-muted-foreground font-body">
              পাঠ্য বিষয়সমূহ ({toBengaliDigits(selectedClass.subjects.length)})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {selectedClass.subjects.map((sub) => (
              <div
                key={sub.id}
                className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] hover:border-indigo-300 dark:hover:border-white/[0.12] transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-primary flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-foreground font-body truncate">
                      {sub.nameBn}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-muted-foreground font-body truncate">
                      {sub.nameEn} {sub.code ? `(${sub.code})` : ""}
                    </div>
                  </div>
                </div>

                {sub.group && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-muted-foreground font-body shrink-0 ml-2">
                    {sub.group}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-card/90 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-xs h-9 cursor-pointer"
          >
            বন্ধ করুন
          </Button>

          <Button
            asChild
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs cursor-pointer"
          >
            <Link href={`/question-papers/create`}>
              <FileText className="w-4 h-4 mr-1.5 stroke-[2]" />
              <span>এই শ্রেণির প্রশ্নপত্র তৈরি</span>
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

