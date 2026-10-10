"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { GraduationCap, BookOpen, Loader2, Clock } from "lucide-react"
import type { StepProps, AcademicClassRef } from "../../types/create-wizard"

interface StepBasicInfoProps extends StepProps {
  classes: AcademicClassRef[]
  isClassesLoading: boolean
}

export function StepBasicInfo({ data, onChange, errors, classes, isClassesLoading }: StepBasicInfoProps) {
  const handleClassChange = (classId: string) => {
    const matched = classes.find((c) => c.id === classId)
    onChange({
      classId,
      className: matched ? (matched.nameBn || matched.nameEn) : "",
    })
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
            পরীক্ষার নাম, শ্রেণী ও সময় নির্ধারণ করুন
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-5 sm:p-6 font-body">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
            {/* Exam Name */}
            <div className="space-y-2 md:col-span-2">
              <Label className="block font-headline text-xs font-semibold text-foreground">
                পরীক্ষার নাম
              </Label>
              <div className="group relative">
                <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors h-4 w-4 pointer-events-none" />
                <Input
                  type="text"
                  value={data.examName}
                  onChange={(e) => onChange({ examName: e.target.value })}
                  placeholder="উদা: অর্ধবার্ষিক মূল্যায়ন ২০২৬"
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] py-2.5 pl-10 pr-4 font-body text-xs sm:text-sm text-foreground transition-all focus:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11"
                />
              </div>
              {errors.examName && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-body mt-1">{errors.examName}</p>
              )}
            </div>

            {/* Academic Class */}
            <div className="space-y-2">
              <Label className="block font-headline text-xs font-semibold text-foreground">
                শ্রেণী
              </Label>
              <div className="group relative">
                <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors h-4 w-4 z-10 pointer-events-none" />
                {isClassesLoading ? (
                  <div className="h-11 border border-slate-200 dark:border-white/[0.08] rounded-xl flex items-center pl-10 bg-muted/20 text-xs text-muted-foreground font-body">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-600 mr-2" /> শ্রেণী তালিকা লোড হচ্ছে...
                  </div>
                ) : (
                  <Select value={data.classId} onValueChange={handleClassChange}>
                    <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] py-2.5 pl-10 pr-4 font-body text-xs sm:text-sm transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 h-11 justify-between">
                      <SelectValue placeholder="শ্রেণী নির্বাচন করুন" />
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
            </div>

            {/* Time In Minutes */}
            <div className="space-y-2">
              <Label className="block font-headline text-xs font-semibold text-foreground">
                পরীক্ষার সময় (মিনিট)
              </Label>
              <div className="group relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors h-4 w-4 pointer-events-none" />
                <Input
                  type="number"
                  min="0"
                  value={data.timeInMinutes || ""}
                  onChange={(e) => onChange({ timeInMinutes: parseInt(e.target.value, 10) || 0 })}
                  placeholder="উদা: ৯০"
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] py-2.5 pl-10 pr-4 font-body text-xs sm:text-sm text-foreground transition-all focus:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11"
                />
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
