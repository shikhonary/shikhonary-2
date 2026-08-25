"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Loader2, Save, HelpCircle, Award, Hash, ArrowLeft } from "lucide-react"

import { useSubjectById, useSaveSubjectQuestionTypes } from "../services/use-subject"
import { useQuestionTypesList } from "../../question-type/services/use-question-type"

const subjectQuestionTypesFormSchema = z.object({
  configs: z.array(
    z.object({
      questionTypeId: z.string(),
      questionTypeNameEn: z.string(),
      questionTypeNameBn: z.string(),
      questionTypeLabel: z.string(),
      enabled: z.preprocess(
        (val) => {
          if (Array.isArray(val)) {
            return val.includes(true) || val.includes("true");
          }
          return val === true || val === "true";
        },
        z.boolean()
      ),
      mark: z.preprocess(
        (val) => (val === "" || val === null || val === undefined ? 0 : val),
        z.coerce.number().min(0, "Mark must be at least 0")
      ),
      requiredCount: z.preprocess(
        (val) => (val === "" || val === null || val === undefined ? 0 : val),
        z.coerce.number().int().min(0, "Required count must be at least 0")
      ),
      totalQuestions: z.preprocess(
        (val) => (val === "" || val === null || val === undefined ? 0 : val),
        z.coerce.number().int().min(0, "Total questions must be at least 0")
      ),
      markDistributionStr: z.string().optional(),
    })
  ),
})

type SubjectQuestionTypesFormData = z.infer<typeof subjectQuestionTypesFormSchema>

interface SubjectQuestionTypeConfigViewProps {
  subjectId: string
}

export function SubjectQuestionTypeConfigView({ subjectId }: SubjectQuestionTypeConfigViewProps) {
  const { data: subject, isLoading: isSubjectLoading, isError } = useSubjectById(subjectId)

  if (isSubjectLoading) {
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

  return <SubjectQuestionTypeConfigForm subject={subject} />
}

interface SubjectQuestionTypeConfigFormProps {
  subject: any
}

function SubjectQuestionTypeConfigForm({ subject }: SubjectQuestionTypeConfigFormProps) {
  const router = useRouter()
  const saveMutation = useSaveSubjectQuestionTypes()
  const { data: qTypesData, isLoading: isQTypesLoading } = useQuestionTypesList({ limit: 100 })
  const questionTypesList = qTypesData?.questionTypes ?? []

  const {
    control,
    handleSubmit,
    register,
    watch,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<SubjectQuestionTypesFormData>({
    resolver: zodResolver(subjectQuestionTypesFormSchema),
    defaultValues: {
      configs: [],
    },
  })

  const { fields } = useFieldArray({
    control,
    name: "configs",
  })

  // Synchronize system question types list with subject's active mappings
  useEffect(() => {
    if (questionTypesList.length > 0) {
      const initialConfigs = questionTypesList.map((qt) => {
        const mapped = subject.subjectQuestionTypes?.find(
          (m: any) => m.questionTypeId === qt.id
        )

        let markDistributionStr = ""
        if (mapped?.markDistribution) {
          try {
            const dist = typeof mapped.markDistribution === 'string'
              ? JSON.parse(mapped.markDistribution)
              : mapped.markDistribution
            if (dist && typeof dist === 'object') {
              const sortedValues = Object.keys(dist)
                .sort()
                .map((k) => dist[k])
              markDistributionStr = sortedValues.join(", ")
            }
          } catch (e) {
            console.error("Failed to parse markDistribution", e)
          }
        }

        return {
          questionTypeId: qt.id,
          questionTypeNameEn: qt.nameEn,
          questionTypeNameBn: qt.nameBn,
          questionTypeLabel: qt.label,
          enabled: !!mapped,
          mark: mapped ? mapped.mark : qt.mark,
          requiredCount: mapped ? mapped.requiredCount : 0,
          totalQuestions: mapped ? mapped.totalQuestions : 0,
          markDistributionStr: markDistributionStr,
        }
      })

      reset({ configs: initialConfigs })
    }
  }, [questionTypesList, subject, reset])

  // Log and notify about validation errors
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.error("Validation Errors Details:", JSON.stringify(errors, null, 2))
      toast.error("Please ensure all enabled question types have valid, positive marks and counts.")
    }
  }, [errors])

  const onSubmit = async (data: SubjectQuestionTypesFormData) => {
    console.log("Form raw data on submit:", data)
    try {
      const activeConfigs = []

      for (const c of data.configs) {
        if (!c.enabled) continue

        let markDistribution: Record<string, number> | null = null
        if (c.markDistributionStr && c.markDistributionStr.trim()) {
          const parts = c.markDistributionStr
            .split(",")
            .map((p) => parseFloat(p.trim()))
            .filter((p) => !isNaN(p))

          if (parts.length > 0) {
            const sum = parts.reduce((a, b) => a + b, 0)
            if (Math.abs(sum - c.mark) > 0.01) {
              throw new Error(
                `For "${c.questionTypeNameEn}", the sum of mark distribution parts (${sum}) must equal the total mark (${c.mark}).`
              )
            }

            markDistribution = {}
            const keys = ["a", "b", "c", "d", "e", "f", "g"]
            parts.forEach((val, idx) => {
              if (idx < keys.length) {
                markDistribution![keys[idx]] = val
              }
            })
          }
        }

        activeConfigs.push({
          questionTypeId: c.questionTypeId,
          mark: c.mark,
          requiredCount: c.requiredCount,
          totalQuestions: c.totalQuestions,
          markDistribution,
        })
      }

      console.log("Mapped activeConfigs payload:", activeConfigs)

      await saveMutation.mutateAsync({
        subjectId: subject.id,
        questionTypes: activeConfigs,
      })

      toast.success("Question types configuration updated successfully.")
      setTimeout(() => {
        router.push("/subjects")
      }, 1000)
    } catch (err: any) {
      toast.error(err.message || "Failed to update configuration.")
    }
  }

  if (isQTypesLoading) {
    return (
      <div className="flex items-center justify-center p-24 text-on-surface-variant">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 font-body-md text-base">Loading available question types...</span>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8 flex flex-col gap-4">
        <Link
          href="/subjects"
          className="inline-flex items-center gap-1.5 text-sm text-outline hover:text-primary transition-colors font-medium w-fit cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Subjects
        </Link>
        <div>
          <nav className="mb-3 flex items-center space-x-2 text-on-surface-variant">
            <Link
              href="/subjects"
              className="font-label-sm text-xs hover:text-primary transition-colors cursor-pointer"
            >
              Subjects
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="font-label-sm text-xs font-bold text-outline">{subject.nameEn}</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="font-label-sm text-xs font-bold text-primary">Question Types</span>
          </nav>
          <h2 className="mb-1.5 font-headline-md text-2xl sm:text-3xl font-extrabold text-primary">
            Configure Question Types
          </h2>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Configure default marks, required question counts, and enabled formats for <span className="font-bold text-primary">{subject.nameEn} ({subject.nameBn})</span>.
          </p>
        </div>
      </div>

      <Card className="overflow-hidden rounded-xl border border-outline-variant bg-white p-0 shadow-xs ring-0">
        <CardHeader className="border-b border-outline-variant/40 bg-surface-container-lowest p-4 sm:p-8 flex flex-row items-center gap-3 sm:gap-4">
          <div className="flex size-10 sm:size-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <CardTitle className="font-headline-md text-base sm:text-[20px] font-extrabold text-on-surface normal-case tracking-normal">
              Question Type Specifications
            </CardTitle>
            <p className="text-[11px] sm:text-xs font-body-md text-on-surface-variant mt-0.5">
              Enable question formats and specify default marking structures.
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {fields.length === 0 ? (
              <p className="text-center text-sm font-medium text-on-surface-variant py-6">
                No active question types found in the system.
              </p>
            ) : (
              <div className="space-y-4">
                {/* Desktop View Table */}
                <div className="hidden sm:block overflow-x-auto rounded-xl border border-outline-variant">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant">
                        <th className="p-4 font-bold text-xs uppercase text-on-surface-variant w-[80px]">Enable</th>
                        <th className="p-4 font-bold text-xs uppercase text-on-surface-variant">Question Type</th>
                        <th className="p-4 font-bold text-xs uppercase text-on-surface-variant w-[120px]">Label</th>
                        <th className="p-4 font-bold text-xs uppercase text-on-surface-variant w-[120px]">Default Mark</th>
                        <th className="p-4 font-bold text-xs uppercase text-on-surface-variant w-[160px]">Mark Distribution</th>
                        <th className="p-4 font-bold text-xs uppercase text-on-surface-variant w-[135px]">Required Count</th>
                        <th className="p-4 font-bold text-xs uppercase text-on-surface-variant w-[130px]">Total Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fields.map((field, index) => {
                        const isEnabled = watch(`configs.${index}.enabled`)
                        return (
                          <tr key={field.id} className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                            <td className="p-4">
                              <Controller
                                control={control}
                                name={`configs.${index}.enabled`}
                                render={({ field }) => (
                                  <input
                                    type="checkbox"
                                    checked={!!field.value}
                                    onChange={(e) => field.onChange(e.target.checked)}
                                    className="size-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                                  />
                                )}
                              />
                            </td>
                            <td className="p-4">
                              <div className="font-semibold text-on-surface">
                                {watch(`configs.${index}.questionTypeNameEn`)}
                              </div>
                              <div className="text-xs text-on-surface-variant">
                                {watch(`configs.${index}.questionTypeNameBn`)}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="font-mono text-xs text-outline font-bold">
                                {watch(`configs.${index}.questionTypeLabel`)}
                              </span>
                            </td>
                            <td className="p-4">
                              <Controller
                                control={control}
                                name={`configs.${index}.mark`}
                                render={({ field }) => (
                                  <Input
                                    type="number"
                                    step="any"
                                    disabled={!isEnabled}
                                    placeholder="0"
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
                                    className="h-9 w-24 rounded-lg border border-outline-variant text-center bg-white px-2 py-1 text-sm outline-hidden focus:ring-2 focus:ring-primary/10 disabled:opacity-50"
                                  />
                                )}
                              />
                            </td>
                            <td className="p-4">
                              <Controller
                                control={control}
                                name={`configs.${index}.markDistributionStr`}
                                render={({ field }) => (
                                  <Input
                                    type="text"
                                    disabled={!isEnabled}
                                    placeholder="e.g. 2, 4, 4"
                                    value={field.value ?? ""}
                                    onChange={field.onChange}
                                    className="h-9 w-full min-w-[120px] rounded-lg border border-outline-variant text-center bg-white px-2 py-1 text-sm outline-hidden focus:ring-2 focus:ring-primary/10 disabled:opacity-50"
                                  />
                                )}
                              />
                            </td>
                            <td className="p-4">
                              <Controller
                                control={control}
                                name={`configs.${index}.requiredCount`}
                                render={({ field }) => (
                                  <Input
                                    type="number"
                                    disabled={!isEnabled}
                                    placeholder="0"
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                                    className="h-9 w-24 rounded-lg border border-outline-variant text-center bg-white px-2 py-1 text-sm outline-hidden focus:ring-2 focus:ring-primary/10 disabled:opacity-50"
                                  />
                                )}
                              />
                            </td>
                            <td className="p-4">
                              <Controller
                                control={control}
                                name={`configs.${index}.totalQuestions`}
                                render={({ field }) => (
                                  <Input
                                    type="number"
                                    disabled={!isEnabled}
                                    placeholder="0"
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                                    className="h-9 w-24 rounded-lg border border-outline-variant text-center bg-white px-2 py-1 text-sm outline-hidden focus:ring-2 focus:ring-primary/10 disabled:opacity-50"
                                  />
                                )}
                              />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Card Layout */}
                <div className="sm:hidden space-y-3">
                  {fields.map((field, index) => {
                    const isEnabled = watch(`configs.${index}.enabled`)
                    return (
                      <div key={field.id} className="rounded-xl border border-outline-variant/60 bg-surface-container-low p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Controller
                              control={control}
                              name={`configs.${index}.enabled`}
                              render={({ field }) => (
                                <input
                                  type="checkbox"
                                  checked={!!field.value}
                                  onChange={(e) => field.onChange(e.target.checked)}
                                  className="size-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                                />
                              )}
                            />
                            <div>
                              <span className="font-semibold text-on-surface text-sm block">
                                {watch(`configs.${index}.questionTypeNameEn`)}
                              </span>
                              <span className="text-xs text-on-surface-variant block">
                                {watch(`configs.${index}.questionTypeNameBn`)}
                              </span>
                            </div>
                          </div>
                          <span className="inline-flex items-center rounded-md bg-surface-container-high px-2 py-0.5 text-[10px] font-medium text-on-surface-variant font-mono">
                            {watch(`configs.${index}.questionTypeLabel`)}
                          </span>
                        </div>

                        {isEnabled && (
                          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-outline-variant/20">
                            <div className="space-y-1">
                              <Label className="text-[10px] uppercase font-bold text-on-surface-variant">Total Mark</Label>
                              <Controller
                                control={control}
                                name={`configs.${index}.mark`}
                                render={({ field }) => (
                                  <Input
                                    type="number"
                                    step="any"
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
                                    className="h-8 w-full rounded-lg border border-outline-variant text-center bg-white text-xs"
                                  />
                                )}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] uppercase font-bold text-on-surface-variant">Required Count</Label>
                              <Controller
                                control={control}
                                name={`configs.${index}.requiredCount`}
                                render={({ field }) => (
                                  <Input
                                    type="number"
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                                    className="h-8 w-full rounded-lg border border-outline-variant text-center bg-white text-xs"
                                  />
                                )}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] uppercase font-bold text-on-surface-variant">Total Count</Label>
                              <Controller
                                control={control}
                                name={`configs.${index}.totalQuestions`}
                                render={({ field }) => (
                                  <Input
                                    type="number"
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                                    className="h-8 w-full rounded-lg border border-outline-variant text-center bg-white text-xs"
                                  />
                                )}
                              />
                            </div>
                            <div className="space-y-1 col-span-2">
                              <Label className="text-[10px] uppercase font-bold text-on-surface-variant">Mark Distribution (e.g. 2, 4, 4)</Label>
                              <Controller
                                control={control}
                                name={`configs.${index}.markDistributionStr`}
                                render={({ field }) => (
                                  <Input
                                    type="text"
                                    placeholder="e.g. 2, 4, 4"
                                    value={field.value ?? ""}
                                    onChange={field.onChange}
                                    className="h-8 w-full rounded-lg border border-outline-variant text-center bg-white text-xs px-2"
                                  />
                                )}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

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
                disabled={isSubmitting || fields.length === 0}
                className="rounded-lg bg-primary-container px-8 py-2.5 font-bold text-on-primary-container shadow-md hover:bg-primary hover:text-white transition-all cursor-pointer h-auto text-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Mappings...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Save className="h-4 w-4" />
                    <span>Save Mappings</span>
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
