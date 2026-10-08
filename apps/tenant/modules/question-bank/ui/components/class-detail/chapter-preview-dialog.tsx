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
import { BookOpen, Layers, FileText, CheckCircle2 } from "lucide-react"
import type { AcademicSubjectWithChapters } from "../../../types"

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "০"
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
  return num
    .toString()
    .split("")
    .map((char) => (/\d/.test(char) ? bengaliDigits[parseInt(char)] : char))
    .join("")
}

interface ChapterPreviewDialogProps {
  selectedSubject: AcademicSubjectWithChapters | null
  classId: string
  classNameBn?: string
  onClose: () => void
}

export const ChapterPreviewDialog: React.FC<ChapterPreviewDialogProps> = ({
  selectedSubject,
  classId,
  classNameBn,
  onClose,
}) => {
  if (!selectedSubject) return null

  return (
    <Dialog open={Boolean(selectedSubject)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl bg-white dark:bg-card border border-slate-200 dark:border-white/[0.08] text-foreground p-0 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-6 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-card/90">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100 dark:border-primary/20 flex items-center justify-center text-indigo-600 dark:text-primary shrink-0 shadow-xs">
              <BookOpen className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl font-bold font-headline text-slate-900 dark:text-foreground">
                  {selectedSubject.nameBn}
                </DialogTitle>
                {selectedSubject.code && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-muted-foreground">
                    {selectedSubject.code}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-muted-foreground font-body mt-0.5">
                {selectedSubject.nameEn}
                {classNameBn ? ` • ${classNameBn}` : ""} • {toBengaliDigits(selectedSubject.chaptersCount)}টি অধ্যায় অন্তর্ভুক্ত
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Chapters List */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-muted-foreground font-body">
              অধ্যায় তালিকা ({toBengaliDigits(selectedSubject.chapters.length)})
            </span>
            <span className="text-xs font-semibold text-indigo-600 dark:text-primary font-body">
              {toBengaliDigits(selectedSubject.questionCount)}টি প্রশ্ন সংরক্ষিত
            </span>
          </div>

          {selectedSubject.chapters.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 dark:text-muted-foreground font-body">
              এই বিষয়ের কোনো অধ্যায় এখনও তালিকাভুক্ত করা হয়নি।
            </div>
          ) : (
            <div className="space-y-2">
              {selectedSubject.chapters.map((ch, idx) => (
                <Link
                  key={ch.id}
                  href={`/question-bank/${classId}/${selectedSubject.id}?chapterId=${ch.id}`}
                  onClick={onClose}
                  className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] hover:border-indigo-300 dark:hover:border-white/[0.12] hover:bg-slate-100/80 dark:hover:bg-white/[0.04] transition-colors flex items-center justify-between group cursor-pointer block"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-primary flex items-center justify-center shrink-0 font-bold font-mono text-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      #{toBengaliDigits(idx + 1)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-foreground font-body truncate group-hover:text-indigo-600 dark:group-hover:text-primary transition-colors">
                        {ch.nameBn}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-muted-foreground font-body truncate">
                        {ch.nameEn}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-muted-foreground font-body shrink-0 ml-2 group-hover:border-indigo-200 transition-colors">
                    প্রশ্ন দেখুন →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-card/90 flex items-center justify-between gap-2 flex-wrap">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-xs h-9 cursor-pointer"
          >
            <Link
              href={`/question-bank/${classId}/${selectedSubject.id}`}
              onClick={onClose}
            >
              <span>সকল প্রশ্ন অন্বেষণ করুন</span>
            </Link>
          </Button>

          <Button
            asChild
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs cursor-pointer ml-auto"
          >
            <Link
              href={`/question-papers/create?classId=${encodeURIComponent(classId)}&subjectId=${encodeURIComponent(selectedSubject.id)}`}
            >
              <FileText className="w-4 h-4 mr-1.5 stroke-[2]" />
              <span>এই বিষয়ের প্রশ্নপত্র তৈরি</span>
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
