"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { GraduationCap, BookOpen, Loader2, AlertTriangle, Clock, Sparkles } from "lucide-react"
import { formatDurationBn } from "./step-review"
import type { StepProps, AcademicClassRef } from "../../types/create-wizard"

interface StepBasicInfoProps extends StepProps {
  classes: AcademicClassRef[]
  isClassesLoading: boolean
}

const QUICK_EXAM_NAMES = [
  "ক্লাস টেস্ট",
  "সাপ্তাহিক পরীক্ষা",
  "মাসিক পরীক্ষা",
  "অর্ধ বার্ষিক পরীক্ষা",
  "বার্ষিক পরীক্ষা",
  "প্রাক-নির্বাচনী পরীক্ষা",
  "নির্বাচনী পরীক্ষা",
  "মডেল টেস্ট",
  "চূড়ান্ত মডেল টেস্ট",
]

const DURATION_PRESETS = [
  { label: "৩০ মিনিট", mins: 30 },
  { label: "৪৫ মিনিট", mins: 45 },
  { label: "১ ঘণ্টা", mins: 60 },
  { label: "১ ঘণ্টা ১৫ মিনিট", mins: 75 },
  { label: "১ ঘণ্টা ৩০ মিনিট", mins: 90 },
  { label: "২ ঘণ্টা", mins: 120 },
  { label: "২ ঘণ্টা ৩০ মিনিট", mins: 150 },
  { label: "৩ ঘণ্টা", mins: 180 },
]

const toBengaliNumber = (num: number | string) => {
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
  return String(num)
    .split("")
    .map((d) => bnDigits[parseInt(d, 10)] || d)
    .join("")
}

export function StepBasicInfo({ data, onChange, errors, classes, isClassesLoading }: StepBasicInfoProps) {
  const handleClassChange = (classId: string) => {
    const matched = classes.find((c) => c.id === classId)
    onChange({
      classId,
      className: matched ? (matched.nameBn || matched.nameEn) : "",
    })
  }

  const handleSelectQuickExam = (examName: string) => {
    onChange({ examName })
  }

  return (
    <Card className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-0 shadow-xs ring-0">
      <CardHeader className="border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-5 sm:p-6 flex flex-row items-center gap-3 sm:gap-4">
        <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100 dark:border-primary/20 text-indigo-600 dark:text-primary shrink-0">
          <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div>
          <CardTitle className="font-headline text-base sm:text-lg font-bold text-foreground normal-case tracking-normal">
            প্রাথমিক তথ্য
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5 font-body">
            পরীক্ষার নাম, শ্রেণি ও সময় নির্ধারণ করুন
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-5 sm:p-6 font-body">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
            {/* Exam Name with Template Selector */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label className="block font-headline text-xs font-semibold text-foreground">
                  পরীক্ষার নাম *
                </Label>
                <span className="text-[11px] text-muted-foreground font-body hidden sm:inline">
                  টেমপ্লেট থেকে নির্বাচন করুন অথবা সরাসরি টাইপ করুন
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Editable Input */}
                <div className="group relative flex-1 min-w-0">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors h-4 w-4 pointer-events-none" />
                  <Input
                    type="text"
                    value={data.examName}
                    onChange={(e) => onChange({ examName: e.target.value })}
                    placeholder="উদা: অর্ধ বার্ষিক পরীক্ষা"
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] py-2.5 pl-9 pr-3 font-body text-xs sm:text-sm text-foreground transition-all focus:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11"
                  />
                </div>

                {/* Template Select Dropdown */}
                <div className="w-[105px] sm:w-56 shrink-0">
                  <Select
                    value=""
                    onValueChange={(val) => {
                      if (val) handleSelectQuickExam(val)
                    }}
                  >
                    <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] py-2.5 px-2.5 sm:px-3 font-body text-xs sm:text-sm text-foreground transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 h-11 justify-between">
                      <div className="flex items-center gap-1.5 truncate text-muted-foreground">
                        <Sparkles className="size-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate sm:hidden text-xs">টেমপ্লেট</span>
                        <span className="truncate hidden sm:inline text-xs sm:text-sm">টেমপ্লেট বাছাই</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl font-body">
                      {QUICK_EXAM_NAMES.map((name) => (
                        <SelectItem key={name} value={name} className="text-xs sm:text-sm cursor-pointer py-2">
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {errors.examName && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-body mt-1">{errors.examName}</p>
              )}
            </div>

            {/* Academic Class */}
            <div className="space-y-2">
              <Label className="block font-headline text-xs font-semibold text-foreground">
                শ্রেণি *
              </Label>
              <div className="group relative">
                <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors h-4 w-4 z-10 pointer-events-none" />
                {isClassesLoading ? (
                  <div className="h-11 border border-slate-200 dark:border-white/[0.08] rounded-xl flex items-center pl-10 bg-muted/20 text-xs text-muted-foreground font-body">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-600 mr-2" /> শ্রেণি তালিকা লোড হচ্ছে...
                  </div>
                ) : (
                  <Select value={data.classId} onValueChange={handleClassChange}>
                    <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] py-2.5 pl-10 pr-4 font-body text-xs sm:text-sm transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 h-11 justify-between">
                      <SelectValue placeholder="শ্রেণি নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl font-body">
                      {classes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nameBn || c.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              {errors.classId && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-body mt-1">{errors.classId}</p>
              )}
              {data.subjects && data.subjects.length > 0 && (
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs mt-1.5 font-body">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <span>
                    শ্রেণি পরিবর্তন করলে বিষয় ও মানবণ্টনের সামঞ্জস্যতা নষ্ট হতে পারে। অনুগ্রহ করে পরবর্তী ধাপে বিষয়গুলো পুনরায় যাচাই করুন।
                  </span>
                </div>
              )}
            </div>

            {/* Time In Minutes with Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="block font-headline text-xs font-semibold text-foreground">
                  পরীক্ষার সময় (মিনিট) *
                </Label>
                {data.timeInMinutes > 0 && (
                  <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 font-body">
                    {formatDurationBn(data.timeInMinutes)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Editable Minutes Input with suffix */}
                <div className="group relative flex-1 min-w-0">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors h-4 w-4 pointer-events-none" />
                  <Input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={data.timeInMinutes || ""}
                    onChange={(e) => onChange({ timeInMinutes: parseInt(e.target.value, 10) || 0 })}
                    placeholder="উদা: ৯০"
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] py-2.5 pl-9 pr-14 font-body text-xs sm:text-sm text-foreground transition-all focus:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] sm:text-xs font-semibold text-muted-foreground pointer-events-none select-none font-body">
                    মিনিট
                  </span>
                </div>

                {/* Duration Presets Dropdown */}
                <div className="w-[105px] sm:w-44 shrink-0">
                  <Select
                    value=""
                    onValueChange={(val) => {
                      if (val) onChange({ timeInMinutes: parseInt(val, 10) || 0 })
                    }}
                  >
                    <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] py-2.5 px-2.5 sm:px-3 font-body text-xs sm:text-sm text-foreground transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 h-11 justify-between">
                      <div className="flex items-center gap-1.5 truncate text-muted-foreground">
                        <Clock className="size-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate sm:hidden text-xs">প্রিসেট</span>
                        <span className="truncate hidden sm:inline text-xs sm:text-sm">সময় প্রিসেট</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl font-body">
                      {DURATION_PRESETS.map((p) => (
                        <SelectItem key={p.mins} value={String(p.mins)} className="text-xs sm:text-sm cursor-pointer py-2">
                          {p.label} ({toBengaliNumber(p.mins)} মি.)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {errors.timeInMinutes && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-body mt-1">{errors.timeInMinutes}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
