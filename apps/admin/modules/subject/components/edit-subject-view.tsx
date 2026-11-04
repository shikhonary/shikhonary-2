"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useSubjectById,
  useUpdateSubject,
  useAcademicYearsForSelection,
  useAcademicClassesForSelection,
} from "../services/use-subject"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { MultiSelect } from "@workspace/ui/components/multi-select"
import { PageHeader } from "@/components/shared/page-header"
import { BookOpen, Key, Loader2, Save, AlertCircle, ArrowLeft } from "lucide-react"
import { ACADEMIC_SUBJECT_GROUP_OPTIONS } from "@workspace/utils"

const editSubjectFormSchema = z.object({
  nameEn: z.string().min(1, "বিষয়ের ইংরেজি নাম আবশ্যক"),
  nameBn: z.string().min(1, "বিষয়ের বাংলা নাম আবশ্যক"),
  code: z.string().optional().nullable(),
  group: z.string().optional().nullable(),
  academicYearId: z.string().min(1, "শিক্ষাবর্ষ নির্বাচন করুন"),
  isActive: z.boolean(),
  classIds: z.array(z.string()).optional(),
})

type EditSubjectFormData = z.infer<typeof editSubjectFormSchema>

interface EditSubjectViewProps {
  subjectId: string
}

export function EditSubjectView({ subjectId }: EditSubjectViewProps) {
  const { data: subject, isLoading: isSubjectLoading, isError } = useSubjectById(subjectId)
  const { data: yearsData, isLoading: isYearsLoading } = useAcademicYearsForSelection()
  const { data: classesData, isLoading: isClassesLoading } = useAcademicClassesForSelection()

  if (isSubjectLoading || isYearsLoading || isClassesLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-muted-foreground space-y-3">
        <Loader2 className="size-8 animate-spin text-indigo-600 dark:text-primary" />
        <span className="text-sm font-semibold">বিষয়ের বিবরণ লোড হচ্ছে...</span>
      </div>
    )
  }

  if (isError || !subject) {
    return (
      <div className="rounded-2xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/10 p-8 text-center text-rose-600 dark:text-rose-400 max-w-md mx-auto">
        <p className="text-sm font-semibold">বিষয়ের তথ্য লোড করতে ব্যর্থ হয়েছে।</p>
        <Link href="/subjects">
          <Button variant="outline" className="mt-4 rounded-xl">
            তালিকায় ফিরে যান
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <EditSubjectForm
      subject={subject}
      years={yearsData?.academicYears ?? []}
      classes={classesData?.academicClasses ?? []}
    />
  )
}

interface EditSubjectFormProps {
  subject: any
  years: any[]
  classes: any[]
}

function EditSubjectForm({ subject, years, classes }: EditSubjectFormProps) {
  const router = useRouter()
  const updateMutation = useUpdateSubject()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<EditSubjectFormData>({
    resolver: zodResolver(editSubjectFormSchema),
    defaultValues: {
      nameEn: subject.nameEn,
      nameBn: subject.nameBn,
      code: subject.code ?? "",
      group: subject.group ?? "",
      academicYearId: subject.academicYearId ?? "",
      isActive: subject.isActive,
      classIds: subject.classSubjects?.map((cs: any) => cs.classId) ?? [],
    },
  })

  const isSubmitting = updateMutation.isPending || isFormSubmitting

  const onSubmit = async (data: EditSubjectFormData) => {
    setErrorMessage(null)

    try {
      await updateMutation.mutateAsync({
        id: subject.id,
        nameEn: data.nameEn.trim(),
        nameBn: data.nameBn.trim(),
        code: data.code?.trim() || null,
        group: data.group && data.group !== "None" ? data.group.trim() : null,
        academicYearId: data.academicYearId,
        isActive: data.isActive,
        classIds: data.classIds,
      })

      toast.success("বিষয়ের তথ্য সফলভাবে হালনাগাদ করা হয়েছে।")
      setTimeout(() => {
        router.push("/subjects")
      }, 700)
    } catch (err: any) {
      const msg = err.message || "বিষয় হালনাগাদ করতে সমস্যা হয়েছে"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="w-full min-w-0 max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Shared Page Header matching MCQ */}
      <PageHeader
        title="বিষয় সম্পাদনা"
        description="বিষয়ের বাংলা ও ইংরেজি নাম, বিষয় কোড, গ্রুপ এবং শ্রেণি/শিক্ষাবর্ষ পরিবর্তন ও হালনাগাদ করুন।"
        icon={BookOpen}
        badge={{ label: "বিষয় মডিউল", variant: "indigo" }}
        breadcrumbs={[
          { label: "বিষয় তালিকা", href: "/subjects" },
          { label: "বিষয় সম্পাদনা" },
        ]}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Link href="/subjects" prefetch={true}>
            <ArrowLeft className="w-4 h-4" />
            <span>তালিকায় ফিরে যান</span>
          </Link>
        </Button>
      </PageHeader>

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/20 p-4 text-rose-600 dark:text-rose-400">
          <AlertCircle className="size-5 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Form Card matching MCQ */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs">
        <CardHeader className="border-b border-slate-200/60 dark:border-white/[0.06] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-primary flex items-center justify-center shrink-0">
              <BookOpen className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-foreground font-headline">
                বিষয়ের তথ্য পরিবর্তন ও হালনাগাদ
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5 font-body">
                বিষয়ের বাংলা ও ইংরেজি নাম, বিষয় কোড এবং শ্রেণি/শিক্ষাবর্ষ সম্পর্ক নির্ধারণ করুন
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Academic Year and Class Associations */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Academic Year Selection */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  শিক্ষাবর্ষ নির্বাচন <span className="text-rose-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="academicYearId"
                  render={({ field }) => (
                    <Select
                      value={field.value || ""}
                      disabled={isSubmitting}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between">
                        <SelectValue placeholder="শিক্ষাবর্ষ নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-60">
                        {years.map((y) => (
                          <SelectItem key={y.id} value={y.id}>
                            {y.nameBn || y.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.academicYearId && (
                  <p className="text-xs text-rose-500 font-medium">{errors.academicYearId.message}</p>
                )}
              </div>

              {/* Class Associations MultiSelect */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  সংযুক্ত শ্রেণি (Classes)
                </Label>
                <Controller
                  control={control}
                  name="classIds"
                  render={({ field }) => (
                    <MultiSelect
                      options={classes.map((c) => ({
                        label: c.nameBn || c.nameEn,
                        value: c.id,
                      }))}
                      selected={field.value || []}
                      onChange={field.onChange}
                      placeholder="শ্রেণি নির্বাচন করুন..."
                      disabled={isSubmitting}
                    />
                  )}
                />
              </div>
            </div>

            {/* Subject Names: Bangla & English */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Name BN */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  বিষয়ের নাম (বাংলা) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="text"
                  disabled={isSubmitting}
                  placeholder="যেমন: বাংলা প্রথম পত্র বা গণিত"
                  {...register("nameBn")}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4"
                />
                {errors.nameBn && (
                  <p className="text-xs text-rose-500 font-medium">{errors.nameBn.message}</p>
                )}
              </div>

              {/* Name EN */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  বিষয়ের নাম (ইংরেজি) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="text"
                  disabled={isSubmitting}
                  placeholder="e.g. Bangla 1st Paper or Mathematics"
                  {...register("nameEn")}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 font-mono"
                />
                {errors.nameEn && (
                  <p className="text-xs text-rose-500 font-medium">{errors.nameEn.message}</p>
                )}
              </div>
            </div>

            {/* Group & Subject Code */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Group */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  বিভাগ / গ্রুপ (ঐচ্ছিক)
                </Label>
                <Controller
                  control={control}
                  name="group"
                  render={({ field }) => (
                    <Select
                      value={field.value || "None"}
                      disabled={isSubmitting}
                      onValueChange={(val) => field.onChange(val === "None" ? "" : val)}
                    >
                      <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between">
                        <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg">
                        <SelectItem value="None">সকল বিভাগ / প্রযোজ্য নয়</SelectItem>
                        {ACADEMIC_SUBJECT_GROUP_OPTIONS.map((opt) => {
                          const label =
                            opt.value === "General"
                              ? "সাধারণ (General)"
                              : opt.value === "Science"
                              ? "বিজ্ঞান (Science)"
                              : opt.value === "Humanities"
                              ? "মানবিক (Humanities)"
                              : "ব্যবসায় শিক্ষা (Commerce)"
                          return (
                            <SelectItem key={opt.value} value={opt.value}>
                              {label}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.group && (
                  <p className="text-xs text-rose-500 font-medium">{errors.group.message}</p>
                )}
              </div>

              {/* Code */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  বিষয় কোড (ঐচ্ছিক)
                </Label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="text"
                    disabled={isSubmitting}
                    placeholder="যেমন: 101 বা 107"
                    {...register("code")}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 pl-10 pr-4 font-mono"
                  />
                </div>
                {errors.code && (
                  <p className="text-xs text-rose-500 font-medium">{errors.code.message}</p>
                )}
              </div>
            </div>

            {/* Is Active Switch */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-4 sm:p-5">
              <div className="space-y-0.5">
                <Label
                  htmlFor="isActive"
                  className="text-sm font-bold text-foreground cursor-pointer font-headline"
                >
                  বিষয়টি সক্রিয় রাখুন (Active)
                </Label>
                <p className="text-xs text-muted-foreground font-body">
                  সক্রিয় থাকলে এই বিষয়টি শিক্ষার্থী ও শিক্ষকদের প্রশ্নপত্র ও অধ্যায় তৈরিতে ব্যবহারযোগ্য হবে।
                </p>
              </div>
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <Switch
                    id="isActive"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>

            {/* Form Action Buttons matching MCQ */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200/60 dark:border-white/[0.06]">
              <Button
                asChild
                type="button"
                variant="outline"
                disabled={isSubmitting}
                className="h-11 px-5 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold text-sm cursor-pointer shadow-xs"
              >
                <Link href="/subjects">বাতিল</Link>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm shadow-indigo-200 dark:shadow-none gap-2 cursor-pointer font-headline"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>আপডেট হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>পরিবর্তন সংরক্ষণ করুন</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
