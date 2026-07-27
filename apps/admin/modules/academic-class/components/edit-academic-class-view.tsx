"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useAcademicClassById,
  useUpdateAcademicClass,
} from "../services/use-academic-class"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import { GraduationCap } from "lucide-react"

const updateAcademicClassSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  isActive: z.boolean().optional(),
})

type UpdateAcademicClassFormData = z.infer<typeof updateAcademicClassSchema>

interface EditAcademicClassViewProps {
  classId: string
}

export function EditAcademicClassView({ classId }: EditAcademicClassViewProps) {
  const router = useRouter()
  const { data: academicClass, isLoading, isError } = useAcademicClassById(classId)
  const updateMutation = useUpdateAcademicClass()

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<UpdateAcademicClassFormData>({
    resolver: zodResolver(updateAcademicClassSchema),
    defaultValues: {
      name: "",
      isActive: false,
    },
  })

  // Pre-fill form values when data is loaded
  useEffect(() => {
    if (academicClass) {
      reset({
        name: academicClass.name,
        isActive: academicClass.isActive,
      })
    }
  }, [academicClass, reset])

  const isSubmitting = updateMutation.isPending || isFormSubmitting

  const onSubmit = async (data: UpdateAcademicClassFormData) => {
    setErrorMessage(null)

    try {
      await updateMutation.mutateAsync({
        id: classId,
        name: data.name.trim(),
        isActive: data.isActive,
      })

      toast.success("Academic Class updated successfully.")
      setTimeout(() => {
        router.push("/academic-classes")
      }, 1000)
    } catch (err: any) {
      const msg = err.message || "Failed to update academic class"
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
        <span className="ml-3 font-body-md text-sm">Loading class details...</span>
      </div>
    )
  }

  if (isError || !academicClass) {
    return (
      <div className="mx-auto max-w-2xl p-8 sm:p-12 text-center">
        <span className="material-symbols-outlined text-4xl sm:text-5xl text-error">error</span>
        <h3 className="mt-4 font-headline-md text-lg sm:text-xl font-bold text-on-surface">
          Academic Class Not Found
        </h3>
        <p className="mt-2 font-body-md text-xs sm:text-sm text-on-surface-variant">
          The requested class record could not be loaded or may have been removed.
        </p>
        <div className="mt-6">
          <Button
            type="button"
            onClick={() => router.push("/academic-classes")}
            className="rounded-lg bg-primary px-6 py-2.5 font-bold text-white hover:bg-primary/90 h-auto normal-case tracking-normal text-sm"
          >
            Back to Classes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4">
      {/* Header Section */}
      <div className="mb-6 sm:mb-10 flex flex-col gap-4 md:flex-row md:items-end justify-between">
        <div className="max-w-2xl">
          <nav className="mb-3 flex items-center space-x-2 text-on-surface-variant">
            <Link
              href="/academic-classes"
              className="font-label-sm text-xs hover:text-primary transition-colors cursor-pointer"
            >
              Classes
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="font-label-sm text-xs font-bold text-primary">Edit Class</span>
          </nav>
          <h2 className="mb-1.5 font-headline-md text-2xl sm:text-3xl font-extrabold text-primary">
            Edit Academic Class: {academicClass.name}
          </h2>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Update specifications for this academic class.
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
            <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <CardTitle className="font-headline-md text-base sm:text-[20px] font-extrabold text-on-surface normal-case tracking-normal">
              Class Specifications
            </CardTitle>
            <p className="text-[11px] sm:text-xs font-body-md text-on-surface-variant mt-0.5">
              Update class name and operational status for your institution
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2">
              {/* Class Name */}
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Class Name
                </Label>
                <div className="group relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10 text-base sm:text-lg">
                    school
                  </span>
                  <Input
                    type="text"
                    disabled={isSubmitting}
                    placeholder="e.g. Class 10"
                    {...register("name")}
                    className="w-full rounded-lg border border-outline-variant py-2.5 sm:py-3 pl-10 pr-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-error">{errors.name.message}</p>
                )}
              </div>

              {/* Is Active Status Toggle */}
              <div className="space-y-2 flex flex-col justify-center">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Status
                </Label>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-3 pt-1 sm:pt-2">
                      <Switch
                        id="is-active"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                      <Label htmlFor="is-active" className="cursor-pointer text-sm font-medium">
                        {field.value ? "Active" : "Inactive"}
                      </Label>
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Meta & Actions */}
            <div className="mt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-outline-variant pt-6 sm:pt-8">
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">history</span>
                <span className="text-[12px]">
                  Last updated:{" "}
                  {new Date(academicClass.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex flex-col-reverse sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-3 sm:gap-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => router.push("/academic-classes")}
                  className="w-full sm:w-auto rounded-lg border border-outline px-6 sm:px-8 py-2.5 sm:py-3 font-bold text-primary transition-all active:scale-95 hover:bg-surface-container-low cursor-pointer h-auto normal-case tracking-normal disabled:opacity-50 text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full sm:w-auto items-center justify-center space-x-2 rounded-lg bg-primary-container px-8 sm:px-10 py-2.5 sm:py-3 font-bold text-on-primary-container shadow-md transition-all active:scale-95 hover:bg-primary hover:text-white disabled:opacity-50 cursor-pointer h-auto normal-case tracking-normal text-sm"
                >
                  {isSubmitting ? (
                    <span className="material-symbols-outlined animate-spin text-[18px] sm:text-[20px]">
                      progress_activity
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px] sm:text-[20px]">save</span>
                  )}
                  <span>{isSubmitting ? "Updating..." : "Update Class"}</span>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


