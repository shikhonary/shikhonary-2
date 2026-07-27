"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import { useCreateSubject } from "../services/use-subject"
import { useAcademicClassesForSelection } from "@/modules/academic-class/services/use-academic-class"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Badge } from "@workspace/ui/components/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

const createSubjectSchema = z.object({
  name: z.string().min(1, "English name is required"),
  nameBn: z.string().min(1, "Bengali name is required"),
  level: z.string().min(1, "Please select an academic level"),
  group: z.string().min(1, "Please select a group"),
  position: z.coerce.number().int().min(0, "Position must be 0 or greater"),
  academicClassIds: z.array(z.string()),
})

type CreateSubjectFormData = z.infer<typeof createSubjectSchema>

export function CreateSubjectView() {
  const router = useRouter()
  const createMutation = useCreateSubject()

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<CreateSubjectFormData>({
    resolver: zodResolver(createSubjectSchema),
    defaultValues: {
      name: "",
      nameBn: "",
      level: "",
      group: "General",
      position: 0,
      academicClassIds: [],
    },
  })

  const selectedLevel = watch("level")
  const selectedClassIds = watch("academicClassIds") || []

  // Fetch available academic classes for mapping
  const { data: availableClasses = [] } = useAcademicClassesForSelection(true)

  const isSubmitting = createMutation.isPending || isFormSubmitting

  const toggleAcademicClass = (classId: string) => {
    if (selectedClassIds.includes(classId)) {
      setValue(
        "academicClassIds",
        selectedClassIds.filter((id) => id !== classId)
      )
    } else {
      setValue("academicClassIds", [...selectedClassIds, classId])
    }
  }

  const onSubmit = async (data: CreateSubjectFormData) => {
    setErrorMessage(null)

    try {
      await createMutation.mutateAsync({
        name: data.name.trim(),
        nameBn: data.nameBn.trim(),
        level: data.level,
        group: data.group.trim(),
        position: Number(data.position) || 0,
        academicClassIds: data.academicClassIds,
      })

      toast.success("Subject created successfully.")
      setTimeout(() => {
        router.push("/subjects")
      }, 1000)
    } catch (err: any) {
      const msg = err.message || "Failed to create subject"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end justify-between">
        <div className="max-w-2xl">
          <nav className="mb-4 flex items-center space-x-2 text-on-surface-variant">
            <Link
              href="/subjects"
              className="font-label-sm hover:text-primary transition-colors cursor-pointer"
            >
              Subjects
            </Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="font-label-sm font-bold text-primary">Create New</span>
          </nav>
          <h2 className="mb-2 font-headline-md text-3xl font-extrabold text-primary">
            Establish New Academic Subject
          </h2>
          <p className="font-body-md text-on-surface-variant leading-relaxed">
            Define new subject offerings, level/group classification, and map them to target academic classes.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-error/30 bg-error-container/20 p-4 text-error">
          <span className="material-symbols-outlined">error</span>
          <span className="font-body-md text-sm font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Form Card */}
      <Card className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-outline-variant bg-white p-0 shadow-xs ring-0">
        <CardHeader className="border-b border-outline-variant bg-surface-container-lowest p-8">
          <CardTitle className="font-headline-md text-[20px] font-semibold text-on-surface normal-case tracking-normal">
            Subject Specifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form
            onSubmit={handleSubmit(onSubmit, (invalidErrors) => {
              console.log("[CreateSubjectView] Submit blocked by validation errors:", invalidErrors)
            })}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Subject Name (English) */}
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Subject Name (English)
                </Label>
                <div className="group relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10">
                    abc
                  </span>
                  <Input
                    type="text"
                    disabled={isSubmitting}
                    placeholder="e.g. Physics / Physics Paper 1"
                    {...register("name")}
                    className="w-full rounded-lg border border-outline-variant py-3 pl-10 pr-4 font-body-md text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-error">{errors.name.message}</p>
                )}
              </div>

              {/* Subject Name (Bengali) */}
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Subject Name (Bengali)
                </Label>
                <div className="group relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10">
                    translate
                  </span>
                  <Input
                    type="text"
                    disabled={isSubmitting}
                    placeholder="উদাঃ পদার্থবিজ্ঞান"
                    {...register("nameBn")}
                    className="w-full rounded-lg border border-outline-variant py-3 pl-10 pr-4 font-body-md font-bengali text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                  />
                </div>
                {errors.nameBn && (
                  <p className="text-xs text-error">{errors.nameBn.message}</p>
                )}
              </div>

              {/* Academic Level */}
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Academic Level
                </Label>
                <Controller
                  name="level"
                  control={control}
                  render={({ field }) => (
                    <div className="group relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10 pointer-events-none">
                        layers
                      </span>
                      <Select
                        disabled={isSubmitting}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-3 pl-10 pr-10 font-body-md text-on-surface transition-all cursor-pointer focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto justify-between">
                          <SelectValue placeholder="Select level..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
                          <SelectItem value="Primary">Primary</SelectItem>
                          <SelectItem value="Secondary">Secondary</SelectItem>
                          <SelectItem value="Higher Secondary (HSC)">
                            Higher Secondary (HSC)
                          </SelectItem>
                          <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                          <SelectItem value="Graduate">Graduate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
                {errors.level && (
                  <p className="text-xs text-error">{errors.level.message}</p>
                )}
              </div>

              {/* Group */}
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Group / Discipline
                </Label>
                <Controller
                  name="group"
                  control={control}
                  render={({ field }) => (
                    <div className="group relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10 pointer-events-none">
                        category
                      </span>
                      <Select
                        disabled={isSubmitting}
                        value={field.value || "General"}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-3 pl-10 pr-10 font-body-md text-on-surface transition-all cursor-pointer focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto justify-between">
                          <SelectValue placeholder="Select group..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
                          <SelectItem value="General">General</SelectItem>
                          <SelectItem value="Science">Science</SelectItem>
                          <SelectItem value="Commerce">Commerce / Business</SelectItem>
                          <SelectItem value="Humanities">Humanities / Arts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
                {errors.group && (
                  <p className="text-xs text-error">{errors.group.message}</p>
                )}
              </div>

              {/* Position / Order */}
              <div className="space-y-2 md:col-span-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Display Position
                </Label>
                <div className="group relative max-w-xs">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors z-10">
                    format_list_numbered
                  </span>
                  <Input
                    type="number"
                    min="0"
                    disabled={isSubmitting}
                    {...register("position")}
                    className="w-full rounded-lg border border-outline-variant py-3 pl-10 pr-4 font-body-md text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                  />
                </div>
                <p className="text-[12px] italic text-outline">
                  Defines display order in curriculum and subject lists
                </p>
                {errors.position && (
                  <p className="text-xs text-error">{errors.position.message}</p>
                )}
              </div>

              {/* Academic Class Mapping */}
              <div className="space-y-3 md:col-span-2 border-t border-outline-variant pt-6">
                <div className="flex flex-col">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Map to Academic Classes
                  </Label>
                  <p className="text-xs text-outline mt-1">
                    Select academic classes that offer this subject.
                  </p>
                </div>

                {availableClasses.length > 0 ? (
                  <div className="flex flex-wrap gap-2.5 pt-2">
                    {availableClasses.map((ac) => {
                      const isSelected = selectedClassIds.includes(ac.id)
                      return (
                        <button
                          key={ac.id}
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => toggleAcademicClass(ac.id)}
                          className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 font-body-md text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? "bg-primary text-white shadow-xs"
                              : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/50"
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {isSelected ? "check_circle" : "add_circle"}
                          </span>
                          <span>
                            {ac.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-outline-variant p-4 text-center font-body-md text-xs text-outline">
                    {selectedLevel
                      ? "No active academic classes found for the selected level."
                      : "Please select an Academic Level above to load associated classes."}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 border-t border-outline-variant pt-6">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => router.push("/subjects")}
                className="rounded-lg border border-outline-variant px-6 py-2.5 font-label-sm text-on-surface transition-all hover:bg-surface-container-high h-auto cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-primary px-8 py-2.5 font-label-sm font-bold text-white transition-all hover:bg-primary/90 shadow-sm h-auto cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-sm">
                      progress_activity
                    </span>
                    <span>Saving...</span>
                  </div>
                ) : (
                  "Create Subject"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
