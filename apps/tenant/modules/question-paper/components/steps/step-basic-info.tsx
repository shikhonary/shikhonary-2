"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Checkbox } from "@workspace/ui/components/checkbox"
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
    <Card className="overflow-hidden rounded-xl border border-outline-variant bg-white p-0 shadow-xs ring-0">
      <CardHeader className="border-b border-outline-variant/40 bg-surface-container-lowest p-4 sm:p-8 flex flex-row items-center gap-3 sm:gap-4">
        <div className="flex size-10 sm:size-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
          <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div>
          <CardTitle className="font-headline-md text-base sm:text-[20px] font-extrabold text-on-surface normal-case tracking-normal">
            প্রাথমিক তথ্য
          </CardTitle>
          <p className="text-[11px] sm:text-xs font-body-md text-on-surface-variant mt-0.5 font-body">
            পরীক্ষার নাম, শ্রেণী ও সময় নির্ধারণ করুন
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-8">
        <div className="space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2">
            {/* Exam Name */}
            <div className="space-y-2">
              <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                পরীক্ষার নাম
              </Label>
              <div className="group relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors h-4.5 w-4.5" />
                <Input
                  type="text"
                  value={data.examName}
                  onChange={(e) => onChange({ examName: e.target.value })}
                  placeholder="উদা: অর্ধবার্ষিক মূল্যায়ন ২০২৬"
                  className="w-full rounded-lg border border-outline-variant py-2.5 sm:py-3 pl-10 pr-4 font-body text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                />
              </div>
              {errors.examName && (
                <p className="text-xs text-error font-body mt-1">{errors.examName}</p>
              )}
            </div>

            {/* Academic Class */}
            <div className="space-y-2">
              <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                শ্রেণী
              </Label>
              <div className="group relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors h-4.5 w-4.5 z-10" />
                {isClassesLoading ? (
                  <div className="h-[46px] border border-outline-variant rounded-lg flex items-center pl-10 bg-muted/20 text-xs text-outline font-body">
                    <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" /> শ্রেণী তালিকা লোড হচ্ছে...
                  </div>
                ) : (
                  <Select value={data.classId} onValueChange={handleClassChange}>
                    <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 sm:py-3 pl-10 pr-4 font-body text-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 h-auto justify-between">
                      <SelectValue placeholder="শ্রেণী নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg font-body">
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
                <p className="text-xs text-error font-body mt-1">{errors.classId}</p>
              )}
            </div>

            {/* Time In Minutes */}
            <div className="space-y-2">
              <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                পরীক্ষার সময় (মিনিট)
              </Label>
              <div className="group relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors h-4.5 w-4.5" />
                <Input
                  type="number"
                  min="0"
                  value={data.timeInMinutes || ""}
                  onChange={(e) => onChange({ timeInMinutes: parseInt(e.target.value, 10) || 0 })}
                  placeholder="উদা: ৯০"
                  className="w-full rounded-lg border border-outline-variant py-2.5 sm:py-3 pl-10 pr-4 font-body text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                />
              </div>
              {errors.timeInMinutes && (
                <p className="text-xs text-error font-body mt-1">{errors.timeInMinutes}</p>
              )}
            </div>

            {/* Template Checkbox */}
            <div className="flex items-start space-x-3 rounded-lg border border-outline-variant/40 p-4 hover:bg-surface-container-low transition-colors font-body">
              <Checkbox
                id="isTemplate"
                checked={data.isTemplate}
                onCheckedChange={(checked) => onChange({ isTemplate: !!checked })}
                className="mt-0.5"
              />
              <div className="grid gap-1.5 leading-none">
                <label htmlFor="isTemplate" className="text-xs font-bold leading-none cursor-pointer">
                  টেমপ্লেট হিসেবে সংরক্ষণ করুন
                </label>
                <p className="text-[10px] text-outline leading-snug">
                  এই কাঠামোটি পরবর্তীতে অন্য পরীক্ষা তৈরির জন্য টেমপ্লেট হিসেবে ব্যবহার করুন।
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
