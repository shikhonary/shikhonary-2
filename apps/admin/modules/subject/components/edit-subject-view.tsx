"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import { useSubjectById, useUpdateSubject, useAcademicYearsForSelection, useAcademicClassesForSelection } from "../services/use-subject"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { MultiSelect } from "@workspace/ui/components/multi-select"
import { BookOpen, Calendar, Key, Layers, Loader2, Save } from "lucide-react"
import { ACADEMIC_SUBJECT_GROUP_OPTIONS } from "@workspace/utils"

const editSubjectFormSchema = z.object({
  nameEn: z.string().min(1, "English Name is required"),
  nameBn: z.string().min(1, "Bangla Name is required"),
  code: z.string().optional().nullable(),
  group: z.string().optional().nullable(),
  academicYearId: z.string().min(1, "Academic Year is required"),
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
      <div className="flex items-center justify-center p-24 text-on-surface-variant">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 font-body-md text-base">Loading subject details...</span>
      </div>
    )
  }

  if (isError || !subject) {
    return (
      <div className="p-8 text-center text-error max-w-md mx-auto">
        <p className="font-body-md font-medium">Failed to load subject details.</p>
        <Link href="/subjects">
          <Button className="mt-4">Back to List</Button>
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

  const isActive = watch("isActive")
  const isSubmitting = updateMutation.isPending || isFormSubmitting

  const onSubmit = async (data: EditSubjectFormData) => {
    setErrorMessage(null)

    try {
      await updateMutation.mutateAsync({
        id: subject.id,
        nameEn: data.nameEn.trim(),
        nameBn: data.nameBn.trim(),
        code: data.code?.trim() || null,
        group: data.group?.trim() || null,
        academicYearId: data.academicYearId,
        isActive: data.isActive,
        classIds: data.classIds,
      })

      toast.success("Academic Subject updated successfully.")
      setTimeout(() => {
        router.push("/subjects")
      }, 1000)
    } catch (err: any) {
      const msg = err.message || "Failed to update academic subject"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="mb-6 sm:mb-10 flex flex-col gap-4 md:flex-row md:items-end justify-between">
        <div className="max-w-2xl">
          <nav className="mb-3 flex items-center space-x-2 text-on-surface-variant">
            <Link
              href="/subjects"
              className="font-label-sm text-xs hover:text-primary transition-colors cursor-pointer"
            >
              Subjects
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="font-label-sm text-xs font-bold text-primary">Edit Subject</span>
          </nav>
          <h2 className="mb-1.5 font-headline-md text-2xl sm:text-3xl font-extrabold text-primary">
            Edit Academic Subject
          </h2>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Modify subject codes, syllabus groups, and template specifications.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-error/30 bg-error-container/20 p-4 text-error">
          <span className="material-symbols-outlined text-lg">error</span>
          <span className="font-body-md text-xs sm:text-sm font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Form Card */}
      <Card className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-outline-variant bg-white p-0 shadow-xs ring-0">
        <CardHeader className="border-b border-outline-variant/40 bg-surface-container-lowest p-4 sm:p-8 flex flex-row items-center gap-3 sm:gap-4">
          <div className="flex size-10 sm:size-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <CardTitle className="font-headline-md text-base sm:text-[20px] font-extrabold text-on-surface normal-case tracking-normal">
              Subject Specifications
            </CardTitle>
            <p className="text-[11px] sm:text-xs font-body-md text-on-surface-variant mt-0.5">
              Modify subject titles, identifier code, and associate with academic cycles.
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
            <div className="space-y-6">
              {/* Academic Year and Class Associations (First Row) */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Academic Year Selection */}
                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Academic Year Association *
                  </Label>
                  <div className="group relative">
                    <Controller
                      control={control}
                      name="academicYearId"
                      render={({ field }) => (
                        <Select
                          value={field.value || "None"}
                          disabled={isSubmitting}
                          onValueChange={(val) => field.onChange(val === "None" ? "" : val)}
                        >
                          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between disabled:opacity-50">
                            <SelectValue placeholder="Select Academic Year" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg max-h-[200px] overflow-y-auto">
                            <SelectItem value="None">Select Academic Year</SelectItem>
                            {years.map((y) => (
                              <SelectItem key={y.id} value={y.id}>
                                {y.nameEn} ({y.nameBn})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  {errors.academicYearId && (
                    <p className="text-xs text-error">{errors.academicYearId.message}</p>
                  )}
                </div>

                {/* Class Associations MultiSelect */}
                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Class Associations
                  </Label>
                  <Controller
                    control={control}
                    name="classIds"
                    render={({ field }) => (
                      <MultiSelect
                        options={classes.map((c) => ({
                          label: `${c.nameEn} (${c.nameBn})`,
                          value: c.id,
                        }))}
                        selected={field.value || []}
                        onChange={field.onChange}
                        placeholder="Select Associated Classes..."
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </div>
              </div>

              {/* Subject Names (English & Bangla) */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Name EN */}
                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Subject Name (English) *
                  </Label>
                  <div className="group relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors h-4.5 w-4.5" />
                    <Input
                      type="text"
                      disabled={isSubmitting}
                      placeholder="e.g. Mathematics"
                      {...register("nameEn")}
                      className="w-full rounded-lg border border-outline-variant py-2.5 sm:py-3 pl-10 pr-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                    />
                  </div>
                  {errors.nameEn && (
                    <p className="text-xs text-error">{errors.nameEn.message}</p>
                  )}
                </div>

                {/* Name BN */}
                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Subject Name (Bangla) *
                  </Label>
                  <div className="group relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors h-4.5 w-4.5" />
                    <Input
                      type="text"
                      disabled={isSubmitting}
                      placeholder="e.g. গণিত"
                      {...register("nameBn")}
                      className="w-full rounded-lg border border-outline-variant py-2.5 sm:py-3 pl-10 pr-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                    />
                  </div>
                  {errors.nameBn && (
                    <p className="text-xs text-error">{errors.nameBn.message}</p>
                  )}
                </div>
              </div>

              {/* Group & Code */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Group */}
                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Syllabus Group (Optional)
                  </Label>
                  <div className="group relative">
                    <Controller
                      control={control}
                      name="group"
                      render={({ field }) => (
                        <Select
                          value={field.value || "None"}
                          disabled={isSubmitting}
                          onValueChange={(val) => field.onChange(val === "None" ? null : val)}
                        >
                          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between disabled:opacity-50">
                            <SelectValue placeholder="Select Group" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
                            <SelectItem value="None">Select Group</SelectItem>
                            {ACADEMIC_SUBJECT_GROUP_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  {errors.group && (
                    <p className="text-xs text-error">{errors.group.message}</p>
                  )}
                </div>

                {/* Subject Code */}
                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Subject Code (Optional)
                  </Label>
                  <div className="group relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors h-4.5 w-4.5" />
                    <Input
                      type="text"
                      disabled={isSubmitting}
                      placeholder="e.g. MATH101"
                      {...register("code")}
                      className="w-full rounded-lg border border-outline-variant py-2.5 sm:py-3 pl-10 pr-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                    />
                  </div>
                  {errors.code && (
                    <p className="text-xs text-error">{errors.code.message}</p>
                  )}
                </div>
              </div>

              {/* Is Active Toggle */}
              <div className="flex items-center space-x-3 rounded-lg border border-outline-variant/40 p-4 bg-surface-container-low">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  disabled={isSubmitting}
                  onChange={(e) => {
                    const { onChange } = register("isActive")
                    onChange(e)
                  }}
                  className="size-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer disabled:opacity-50"
                />
                <div className="select-none">
                  <label
                    htmlFor="isActive"
                    className="text-xs font-bold text-on-surface cursor-pointer flex items-center gap-1.5"
                  >
                    Enable/Activate Subject Template
                  </label>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Allows chapters, exams, and classes to use this subject template.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-outline-variant/40">
              <Link href="/subjects">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  className="rounded-lg border border-outline px-6 py-2.5 font-bold text-primary hover:bg-surface-container-low transition-all cursor-pointer h-auto text-sm disabled:opacity-50"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-primary-container px-8 py-2.5 font-bold text-on-primary-container shadow-md hover:bg-primary hover:text-white transition-all cursor-pointer h-auto text-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Save className="h-4 w-4" />
                    <span>Update Subject</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
