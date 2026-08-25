"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import { useCreateChapter, useSubjectsForSelection, useAcademicYearsForSelection, useAcademicClassesForSelection } from "../services/use-chapter"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { BookOpen, Calendar, Layers, Loader2, Save, ArrowUpDown } from "lucide-react"

const createChapterFormSchema = z.object({
  nameEn: z.string().min(1, "English Name is required"),
  nameBn: z.string().min(1, "Bangla Name is required"),
  position: z.coerce.number().int().min(0, "Position must be a positive integer"),
  isActive: z.boolean(),
  subjectId: z.string().min(1, "Academic Subject is required"),
  academicYearId: z.string().optional().nullable(),
})

type CreateChapterFormData = z.infer<typeof createChapterFormSchema>

export function CreateChapterView() {
  const router = useRouter()
  const createMutation = useCreateChapter()
  const [selectedClass, setSelectedClass] = useState<string>("None")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<CreateChapterFormData>({
    resolver: zodResolver(createChapterFormSchema),
    defaultValues: {
      nameEn: "",
      nameBn: "",
      position: 0,
      isActive: true,
      subjectId: "",
      academicYearId: "",
    },
  })

  const isActive = watch("isActive")
  const selectedYear = watch("academicYearId")
  const isSubmitting = createMutation.isPending || isFormSubmitting

  const { data: yearsData, isLoading: isYearsLoading } = useAcademicYearsForSelection()
  const years = yearsData?.academicYears ?? []

  const { data: classesData, isLoading: isClassesLoading } = useAcademicClassesForSelection(
    selectedYear || undefined
  )
  const classes = classesData?.academicClasses ?? []

  const { data: subjectsData, isLoading: isSubjectsLoading } = useSubjectsForSelection(
    selectedYear || undefined,
    selectedClass === "None" ? undefined : selectedClass
  )
  const subjects = subjectsData?.academicSubjects ?? []

  const onSubmit = async (data: CreateChapterFormData) => {
    setErrorMessage(null)

    try {
      await createMutation.mutateAsync({
        nameEn: data.nameEn.trim(),
        nameBn: data.nameBn.trim(),
        position: data.position,
        subjectId: data.subjectId,
        academicYearId: data.academicYearId || null,
        isActive: data.isActive,
      })

      toast.success("Academic Chapter created successfully.")
      setTimeout(() => {
        router.push("/chapters")
      }, 1000)
    } catch (err: any) {
      const msg = err.message || "Failed to create academic chapter"
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
              href="/chapters"
              className="font-label-sm text-xs hover:text-primary transition-colors cursor-pointer"
            >
              Chapters
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="font-label-sm text-xs font-bold text-primary">Create New</span>
          </nav>
          <h2 className="mb-1.5 font-headline-md text-2xl sm:text-3xl font-extrabold text-primary">
            New Academic Chapter
          </h2>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Create chapters, define positions/serial values, and associate them with subject syllabus structures.
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
            <Layers className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <CardTitle className="font-headline-md text-base sm:text-[20px] font-extrabold text-on-surface normal-case tracking-normal">
              Chapter Specifications
            </CardTitle>
            <p className="text-[11px] sm:text-xs font-body-md text-on-surface-variant mt-0.5">
              Enter chapter titles, numeric positions, and select parent syllabus attributes.
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
            <div className="space-y-6">
              {/* Row 1: Academic Year (form field) + Class filter (UI only, not saved) */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Academic Year — stored on chapter */}
                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Academic Year
                  </Label>
                  <div className="group relative">
                    <Controller
                      control={control}
                      name="academicYearId"
                      render={({ field }) => (
                        <Select
                          value={field.value || "None"}
                          disabled={isSubmitting || isYearsLoading}
                          onValueChange={(val) => {
                            field.onChange(val === "None" ? null : val)
                            setSelectedClass("None")
                            setValue("subjectId", "")
                          }}
                        >
                          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between disabled:opacity-50">
                            <SelectValue placeholder={isYearsLoading ? "Loading..." : "Select Academic Year"} />
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

                {/* Academic Class — UI filter only, NOT stored on chapter */}
                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Filter by Class
                    <span className="ml-1.5 normal-case text-[10px] font-normal text-on-surface-variant/60">(not saved)</span>
                  </Label>
                  <div className="group relative">
                    <Select
                      value={selectedClass}
                      disabled={isSubmitting || isClassesLoading}
                      onValueChange={(val) => {
                        setSelectedClass(val)
                        setValue("subjectId", "")
                      }}
                    >
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between disabled:opacity-50">
                        <SelectValue placeholder={isClassesLoading ? "Loading..." : "Select class to filter subjects"} />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg max-h-[200px] overflow-y-auto">
                        <SelectItem value="None">All Classes</SelectItem>
                        {classes.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nameEn} ({c.nameBn})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Row 2: Subject | Position */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Subject — stored on chapter (required) */}
                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Subject *
                  </Label>
                  <div className="group relative">
                    <Controller
                      control={control}
                      name="subjectId"
                      render={({ field }) => (
                        <Select
                          value={field.value || "None"}
                          disabled={isSubmitting || isSubjectsLoading}
                          onValueChange={(val) => field.onChange(val === "None" ? "" : val)}
                        >
                          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between disabled:opacity-50">
                            <SelectValue placeholder={
                              isSubjectsLoading
                                ? "Loading Subjects..."
                                : selectedClass === "None"
                                ? "Select Subject (or pick a class to filter)"
                                : "Select Subject"
                            } />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg max-h-[200px] overflow-y-auto">
                            <SelectItem value="None">Select Subject</SelectItem>
                            {subjects.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.nameEn} ({s.nameBn})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  {errors.subjectId && (
                    <p className="text-xs text-error">{errors.subjectId.message}</p>
                  )}
                </div>

                {/* Position — stored on chapter */}
                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Serial Position / Order *
                  </Label>
                  <div className="group relative">
                    <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors h-4.5 w-4.5" />
                    <Input
                      type="number"
                      disabled={isSubmitting}
                      placeholder="e.g. 1"
                      {...register("position")}
                      className="w-full rounded-lg border border-outline-variant py-2.5 sm:py-3 pl-10 pr-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                    />
                  </div>
                  {errors.position && (
                    <p className="text-xs text-error">{errors.position.message}</p>
                  )}
                </div>
              </div>

              {/* Row 3: Chapter Names (English & Bangla) */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Name EN */}
                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Chapter Name (English) *
                  </Label>
                  <div className="group relative">
                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors h-4.5 w-4.5" />
                    <Input
                      type="text"
                      disabled={isSubmitting}
                      placeholder="e.g. Linear Equations"
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
                    Chapter Name (Bangla) *
                  </Label>
                  <div className="group relative">
                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors h-4.5 w-4.5" />
                    <Input
                      type="text"
                      disabled={isSubmitting}
                      placeholder="যেমন: সরল সমীকরণ"
                      {...register("nameBn")}
                      className="w-full rounded-lg border border-outline-variant py-2.5 sm:py-3 pl-10 pr-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                    />
                  </div>
                  {errors.nameBn && (
                    <p className="text-xs text-error">{errors.nameBn.message}</p>
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
                    Enable/Activate Chapter
                  </label>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Allows this chapter to be linked to curriculum content and examinations.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-outline-variant/40">
              <Link href="/chapters">
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
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Save className="h-4 w-4" />
                    <span>Save Chapter</span>
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
