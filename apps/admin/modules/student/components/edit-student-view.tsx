"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import { useStudentById, useUpdateStudent } from "../services/use-student"
import { useAcademicClassesForSelection } from "../../academic-class/services/use-academic-class"
import { UserSearchSelect } from "./user-search-select"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Users, GraduationCap, School, Phone, Hash } from "lucide-react"

const updateStudentSchema = z.object({
  name: z.string().min(1, "Student name is required"),
  phone: z.string().min(1, "Phone number is required"),
  institute: z.string().min(1, "Institute name is required"),
  roll: z.coerce.number().int().optional().nullable(),
  isOfflineStudent: z.boolean(),
  academicClassId: z.string().min(1, "Academic class is required"),
  userId: z.string().optional().nullable(),
})

type UpdateStudentFormData = z.infer<typeof updateStudentSchema>

interface EditStudentViewProps {
  studentId: string
}

export function EditStudentView({ studentId }: EditStudentViewProps) {
  const router = useRouter()
  const { data: student, isLoading, isError } = useStudentById(studentId)
  const updateMutation = useUpdateStudent()
  const { data: classes } = useAcademicClassesForSelection()

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<UpdateStudentFormData>({
    resolver: zodResolver(updateStudentSchema),
    defaultValues: {
      name: "",
      phone: "",
      institute: "",
      roll: null,
      isOfflineStudent: false,
      academicClassId: "",
      userId: null,
    },
  })

  // Watch academic class to check if label starts with "SSC"
  const selectedClassId = watch("academicClassId")
  const selectedClass = classes?.find((c) => c.id === selectedClassId)
  const isSscClass = Boolean(
    selectedClass?.name?.trim().toUpperCase().startsWith("SSC")
  )
  const instituteLabel = isSscClass ? "School" : "College"
  const institutePlaceholder = isSscClass
    ? "e.g. Ideal School & College"
    : "e.g. Notre Dame College"

  // Pre-fill form when student data is loaded
  useEffect(() => {
    if (student) {
      reset({
        name: student.name,
        phone: student.phone,
        institute: student.institute,
        roll: student.roll,
        isOfflineStudent: student.isOfflineStudent,
        academicClassId: student.academicClassId,
        userId: student.userId,
      })
    }
  }, [student, reset])

  const isSubmitting = updateMutation.isPending || isFormSubmitting

  const onSubmit = async (data: UpdateStudentFormData) => {
    setErrorMessage(null)

    try {
      await updateMutation.mutateAsync({
        id: studentId,
        name: data.name.trim(),
        phone: data.phone.trim(),
        institute: data.institute.trim(),
        roll: isSscClass ? data.roll : null,
        isOfflineStudent: data.isOfflineStudent,
        academicClassId: data.academicClassId,
        userId: data.userId || null,
      })

      toast.success("Student profile updated successfully.")
      setTimeout(() => {
        router.push("/students")
      }, 1000)
    } catch (err: any) {
      const msg = err.message || "Failed to update student profile"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin text-3xl text-primary">
          progress_activity
        </span>
        <span className="ml-3 font-body-md text-sm">Loading student details...</span>
      </div>
    )
  }

  if (isError || !student) {
    return (
      <div className="mx-auto max-w-2xl p-8 sm:p-12 text-center">
        <span className="material-symbols-outlined text-4xl sm:text-5xl text-error">error</span>
        <h3 className="mt-4 font-headline-md text-lg sm:text-xl font-bold text-on-surface">
          Student Not Found
        </h3>
        <p className="mt-2 font-body-md text-xs sm:text-sm text-on-surface-variant">
          The requested student profile could not be loaded or may have been removed.
        </p>
        <div className="mt-6">
          <Button
            type="button"
            onClick={() => router.push("/students")}
            className="rounded-lg bg-primary px-6 py-2.5 font-bold text-white hover:bg-primary/90 h-auto normal-case tracking-normal text-sm"
          >
            Back to Students
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="mb-6 sm:mb-10 flex flex-col gap-4 md:flex-row md:items-end justify-between">
        <div className="max-w-2xl">
          <nav className="mb-3 flex items-center space-x-2 text-on-surface-variant">
            <Link
              href="/students"
              className="font-label-sm text-xs hover:text-primary transition-colors cursor-pointer"
            >
              Students
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="font-label-sm text-xs font-bold text-primary">Edit Profile</span>
          </nav>
          <h2 className="mb-1.5 font-headline-md text-2xl sm:text-3xl font-extrabold text-primary">
            Edit Student Profile
          </h2>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Update personal information, batch/class configurations, and linked portal account.
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
            <Users className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <CardTitle className="font-headline-md text-base sm:text-[20px] font-extrabold text-on-surface normal-case tracking-normal">
              Student Specifications
            </CardTitle>
            <p className="text-[11px] sm:text-xs font-body-md text-on-surface-variant mt-0.5">
              Edit academic class, name, contact, and optional user profile mapping.
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2">
              {/* 1. Academic Class Selection (FIRST FIELD) */}
              <div className="space-y-2 md:col-span-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  Academic Class
                </Label>
                <Controller
                  name="academicClassId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      disabled={isSubmitting}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 sm:py-3 px-4 font-body-md text-sm outline-hidden focus:ring-2 focus:ring-primary/10 h-auto justify-between">
                        <SelectValue placeholder="Select Class Level" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
                        {classes?.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.academicClassId && (
                  <p className="text-xs text-error">{errors.academicClassId.message}</p>
                )}
              </div>

              {/* 2. Student Name */}
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Student Name
                </Label>
                <div className="group relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10">
                    <Users className="h-4 w-4" />
                  </span>
                  <Input
                    type="text"
                    disabled={isSubmitting}
                    placeholder="e.g. Robin Hood"
                    {...register("name")}
                    className="w-full rounded-lg border border-outline-variant py-2.5 sm:py-3 pl-10 pr-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-error">{errors.name.message}</p>
                )}
              </div>

              {/* 3. Phone number */}
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Phone Number
                </Label>
                <div className="group relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10">
                    <Phone className="h-4 w-4" />
                  </span>
                  <Input
                    type="text"
                    disabled={isSubmitting}
                    placeholder="e.g. 01712345678"
                    {...register("phone")}
                    className="w-full rounded-lg border border-outline-variant py-2.5 sm:py-3 pl-10 pr-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-error">{errors.phone.message}</p>
                )}
              </div>

              {/* 4. Institute (School / College dynamically) */}
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  {instituteLabel}
                </Label>
                <div className="group relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10">
                    <School className="h-4 w-4" />
                  </span>
                  <Input
                    type="text"
                    disabled={isSubmitting}
                    placeholder={institutePlaceholder}
                    {...register("institute")}
                    className="w-full rounded-lg border border-outline-variant py-2.5 sm:py-3 pl-10 pr-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                  />
                </div>
                {errors.institute && (
                  <p className="text-xs text-error">{errors.institute.message}</p>
                )}
              </div>

              {/* 5. Roll Number (Conditional: ONLY appears if Academic Class starts with 'SSC') */}
              {isSscClass && (
                <div className="space-y-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Roll Number (SSC Class Only)
                  </Label>
                  <div className="group relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10">
                      <Hash className="h-4 w-4" />
                    </span>
                    <Input
                      type="number"
                      disabled={isSubmitting}
                      placeholder="e.g. 101"
                      {...register("roll")}
                      className="w-full rounded-lg border border-outline-variant py-2.5 sm:py-3 pl-10 pr-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                    />
                  </div>
                  {errors.roll && (
                    <p className="text-xs text-error">{errors.roll.message}</p>
                  )}
                </div>
              )}

              {/* 6. Link User account (Optional & Searchable) */}
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Link User Account (Optional)
                </Label>
                <Controller
                  name="userId"
                  control={control}
                  render={({ field }) => (
                    <UserSearchSelect
                      disabled={isSubmitting}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.userId && (
                  <p className="text-xs text-error">{errors.userId.message}</p>
                )}
              </div>

              {/* 7. Offline Switch */}
              <div className="space-y-2 flex flex-col justify-center">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Offline Student Status
                </Label>
                <Controller
                  name="isOfflineStudent"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-3 pt-1 sm:pt-2">
                      <Switch
                        id="is-offline"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                        className="cursor-pointer"
                      />
                      <Label htmlFor="is-offline" className="font-body-md text-sm text-on-surface cursor-pointer select-none">
                        Student participates in physical classroom batches
                      </Label>
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row border-t border-outline-variant/30 pt-6">
              <Button
                asChild
                variant="outline"
                disabled={isSubmitting}
                className="w-full sm:w-auto rounded-lg border border-outline-variant px-6 py-2.5 sm:py-3 text-sm font-semibold text-on-surface hover:bg-surface-container-high transition-colors h-auto normal-case tracking-normal cursor-pointer"
              >
                <Link href="/students">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto rounded-lg bg-primary px-6 py-2.5 sm:py-3 text-sm font-bold text-white hover:bg-primary/95 transition-colors h-auto normal-case tracking-normal cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}