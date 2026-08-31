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
import { Textarea } from "@workspace/ui/components/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Loader2, Save, HelpCircle, ArrowLeft, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react"

import { useSubjectById, useSaveSubjectStructure } from "../services/use-subject"
import { useQuestionTypesList } from "../../question-type/services/use-question-type"

// Schema matching the unified save structure endpoint
const questionTypeConfigSchema = z.object({
  questionTypeId: z.string().min(1, "Question Type is required"),
  mark: z.coerce.number().min(0, "Mark must be at least 0"),
  requiredCount: z.coerce.number().int().min(0, "Required count must be at least 0"),
  totalQuestions: z.coerce.number().int().min(0, "Total questions must be at least 0"),
  markDistributionStr: z.string().optional(),
})

const subjectQuestionStructureSchema = z.object({
  sections: z.array(
    z.object({
      id: z.string().optional(),
      nameEn: z.string().min(1, "English section name is required"),
      nameBn: z.string().min(1, "Bangla section name is required"),
      position: z.number().int().default(0),
      instructions: z.string().optional().nullable(),
      subSections: z.array(
        z.object({
          id: z.string().optional(),
          nameEn: z.string().min(1, "English sub-section name is required"),
          nameBn: z.string().min(1, "Bangla sub-section name is required"),
          position: z.number().int().default(0),
          instructions: z.string().optional().nullable(),
          questionTypes: z.array(questionTypeConfigSchema).default([]),
        })
      ).default([]),
      questionTypes: z.array(questionTypeConfigSchema).default([]),
    })
  ).default([]),
})

interface QuestionTypeConfig {
  questionTypeId: string
  mark: number
  requiredCount: number
  totalQuestions: number
  markDistributionStr?: string
}

interface SubSectionConfig {
  id?: string
  nameEn: string
  nameBn: string
  position: number
  instructions?: string | null
  questionTypes: QuestionTypeConfig[]
}

interface SectionConfig {
  id?: string
  nameEn: string
  nameBn: string
  position: number
  instructions?: string | null
  subSections: SubSectionConfig[]
  questionTypes: QuestionTypeConfig[]
}

interface SubjectQuestionStructureData {
  sections: SectionConfig[]
}

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

  return <SubjectQuestionStructureForm subject={subject} />
}

interface SubjectQuestionStructureFormProps {
  subject: any
}

function SubjectQuestionStructureForm({ subject }: SubjectQuestionStructureFormProps) {
  const router = useRouter()
  const saveMutation = useSaveSubjectStructure()
  const { data: qTypesData, isLoading: isQTypesLoading } = useQuestionTypesList({ limit: 100 })
  const questionTypesList = qTypesData?.questionTypes ?? []

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<any>({
    resolver: zodResolver(subjectQuestionStructureSchema),
    defaultValues: {
      sections: [],
    },
  })

  const { fields: sections, append: appendSection, remove: removeSection, move: moveSection } = useFieldArray({
    control,
    name: "sections",
  })

  // Synchronize system DB structure with form default values
  useEffect(() => {
    if (subject) {
      const initialSections = subject.sections?.map((sec: any) => {
        // Find direct question types that belong to this section but don't have a sub-section
        const directQuestionTypes = subject.subjectQuestionTypes?.filter(
          (sqt: any) => sqt.sectionId === sec.id && !sqt.subSectionId
        ) || []

        return {
          id: sec.id,
          nameEn: sec.nameEn,
          nameBn: sec.nameBn,
          position: sec.position,
          subSections: sec.subSections?.map((sub: any) => {
            const subQuestionTypes = subject.subjectQuestionTypes?.filter(
              (sqt: any) => sqt.subSectionId === sub.id
            ) || []

            return {
              id: sub.id,
              nameEn: sub.nameEn,
              nameBn: sub.nameBn,
              position: sub.position,
              questionTypes: subQuestionTypes.map((sqt: any) => {
                let markDistributionStr = ""
                if (sqt.markDistribution) {
                  try {
                    const dist = typeof sqt.markDistribution === 'string'
                      ? JSON.parse(sqt.markDistribution)
                      : sqt.markDistribution
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
                  questionTypeId: sqt.questionTypeId,
                  mark: sqt.mark,
                  requiredCount: sqt.requiredCount,
                  totalQuestions: sqt.totalQuestions,
                  markDistributionStr,
                }
              }),
            }
          }) || [],
          questionTypes: directQuestionTypes.map((sqt: any) => {
            let markDistributionStr = ""
            if (sqt.markDistribution) {
              try {
                const dist = typeof sqt.markDistribution === 'string'
                  ? JSON.parse(sqt.markDistribution)
                  : sqt.markDistribution
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
              questionTypeId: sqt.questionTypeId,
              mark: sqt.mark,
              requiredCount: sqt.requiredCount,
              totalQuestions: sqt.totalQuestions,
              markDistributionStr,
            }
          }),
        }
      }) || []

      reset({ sections: initialSections })
    }
  }, [subject, reset])

  // Log validation errors
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.error("Validation Errors Details:", errors)
      toast.error("Please fill in all section & sub-section names and ensure all question types are configured correctly.")
    }
  }, [errors])

  const onSubmit = async (data: any) => {
    try {
      // Map form mark distribution strings into Record<string, number> structures
      const processedSections = data.sections.map((sec: SectionConfig, secIdx: number) => {
        const processQtConfigs = (qts: QuestionTypeConfig[], path: string) => {
          return qts.map((c: QuestionTypeConfig) => {
            let markDistribution: Record<string, number> | null = null
            if (c.markDistributionStr && c.markDistributionStr.trim()) {
              const parts = c.markDistributionStr
                .split(",")
                .map((p: string) => parseFloat(p.trim()))
                .filter((p: number) => !isNaN(p))

              if (parts.length > 0) {
                const sum = parts.reduce((a: number, b: number) => a + b, 0)
                if (Math.abs(sum - c.mark) > 0.01) {
                  const typeName = questionTypesList.find((t) => t.id === c.questionTypeId)?.nameEn || "Question Type"
                  throw new Error(
                    `In ${path}, for "${typeName}", the sum of mark distribution parts (${sum}) must equal the total mark (${c.mark}).`
                  )
                }

                markDistribution = {}
                const keys = ["a", "b", "c", "d", "e", "f", "g"]
                parts.forEach((val: number, idx: number) => {
                  const key = keys[idx]
                  if (key) {
                    markDistribution![key] = val
                  }
                })
              }
            }

            return {
              questionTypeId: c.questionTypeId,
              mark: c.mark,
              requiredCount: c.requiredCount,
              totalQuestions: c.totalQuestions,
              markDistribution,
            }
          })
        }

        return {
          nameEn: sec.nameEn,
          nameBn: sec.nameBn,
          position: secIdx,
          questionTypes: processQtConfigs(sec.questionTypes || [], `Section "${sec.nameEn}"`),
          subSections: (sec.subSections || []).map((sub: SubSectionConfig, subIdx: number) => ({
            nameEn: sub.nameEn,
            nameBn: sub.nameBn,
            position: subIdx,
            questionTypes: processQtConfigs(sub.questionTypes || [], `Section "${sec.nameEn}" > Sub-section "${sub.nameEn}"`),
          })),
        }
      })

      await saveMutation.mutateAsync({
        subjectId: subject.id,
        sections: processedSections,
      })

      toast.success("Subject exam structure updated successfully.")
      router.push("/subjects")
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
    <div className="w-full max-w-5xl mx-auto pb-12">
      {/* Navigation Headers */}
      <div className="mb-6 flex flex-col gap-3">
        <Link
          href="/subjects"
          className="inline-flex items-center gap-1.5 text-sm text-outline hover:text-primary transition-colors font-medium w-fit cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Subjects
        </Link>
        <div>
          <h2 className="mb-1 font-headline-md text-2xl sm:text-3xl font-extrabold text-primary">
            Configure Subject Exam Structure
          </h2>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Organize sections, nested sub-sections, and specify default marking configurations for{" "}
            <span className="font-bold text-primary">{subject.nameEn} ({subject.nameBn})</span>.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="rounded-xl border border-outline-variant bg-white p-0 shadow-xs">
          <CardHeader className="border-b border-outline-variant/40 bg-surface-container-lowest p-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-on-surface">Sections Layout Builder</CardTitle>
              <p className="text-xs text-on-surface-variant mt-1">
                Define the structural order and assign nested question types.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => appendSection({ nameEn: "", nameBn: "", position: sections.length, subSections: [], questionTypes: [], instructions: "" })}
              className="flex items-center gap-1.5 text-xs h-9 bg-primary text-white font-semibold rounded-lg hover:bg-primary/95 transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Section
            </Button>
          </CardHeader>

          <CardContent className="p-6 space-y-6 bg-surface-container-lowest/20">
            {sections.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-outline-variant rounded-xl bg-white space-y-3">
                <p className="text-sm font-medium text-on-surface-variant">No exam sections configured yet.</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendSection({ nameEn: "", nameBn: "", position: 0, subSections: [], questionTypes: [] })}
                  className="mx-auto flex items-center gap-1.5 text-xs text-primary border-primary hover:bg-primary/5"
                >
                  <Plus className="h-4 w-4" />
                  Add First Section
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {sections.map((sectionField, secIndex) => (
                  <SectionCard
                    key={sectionField.id}
                    control={control}
                    secIndex={secIndex}
                    totalSections={sections.length}
                    moveSection={moveSection}
                    removeSection={removeSection}
                    questionTypesList={questionTypesList}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href="/subjects">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              className="rounded-lg border border-outline px-6 py-2 h-10 font-bold text-primary hover:bg-surface-container-low transition-all text-sm"
            >
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-primary px-8 py-2 h-10 font-bold text-white shadow-md hover:bg-primary/90 transition-all text-sm"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Structure...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Save className="h-4 w-4" />
                <span>Save Structure</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   SECTION CARD COMPONENT
   ────────────────────────────────────────────────────────────────────────── */
interface SectionCardProps {
  control: any
  secIndex: number
  totalSections: number
  moveSection: (from: number, to: number) => void
  removeSection: (index: number) => void
  questionTypesList: any[]
}

function SectionCard({ control, secIndex, totalSections, moveSection, removeSection, questionTypesList }: SectionCardProps) {
  const { fields: subSections, append: appendSubSection, remove: removeSubSection } = useFieldArray({
    control,
    name: `sections.${secIndex}.subSections`,
  })

  const { fields: directQuestionTypes, append: appendDirectQt, remove: removeDirectQt } = useFieldArray({
    control,
    name: `sections.${secIndex}.questionTypes`,
  })

  return (
    <Card className="border border-outline-variant bg-white shadow-xs overflow-hidden">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-container-low p-4 border-b border-outline-variant/60">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Ordering buttons */}
          <div className="flex flex-col">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={secIndex === 0}
              onClick={() => moveSection(secIndex, secIndex - 1)}
              className="h-6 w-6 text-on-surface-variant hover:text-primary disabled:opacity-30"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={secIndex === totalSections - 1}
              onClick={() => moveSection(secIndex, secIndex + 1)}
              className="h-6 w-6 text-on-surface-variant hover:text-primary disabled:opacity-30"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 flex-1 sm:w-80">
            <div>
              <Label className="text-[10px] text-outline font-semibold uppercase">Section Name (EN)</Label>
              <Controller
                control={control}
                name={`sections.${secIndex}.nameEn`}
                render={({ field }) => (
                  <Input {...field} placeholder="e.g. Section A" className="h-9 text-sm" />
                )}
              />
            </div>
            <div>
              <Label className="text-[10px] text-outline font-semibold uppercase">Section Name (BN)</Label>
              <Controller
                control={control}
                name={`sections.${secIndex}.nameBn`}
                render={({ field }) => (
                  <Input {...field} placeholder="e.g. ক বিভাগ" className="h-9 text-sm" />
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => appendSubSection({ nameEn: "", nameBn: "", position: subSections.length, questionTypes: [] })}
            className="flex items-center gap-1 text-xs h-8 border-outline text-primary hover:bg-primary/5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Sub-section
          </Button>
          {subSections.length === 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => appendDirectQt({ questionTypeId: "", mark: 0, requiredCount: 0, totalQuestions: 0, markDistributionStr: "" })}
              className="flex items-center gap-1 text-xs h-8 border-outline text-primary hover:bg-primary/5"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Question Type
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeSection(secIndex)}
            className="h-8 w-8 text-error hover:bg-error/5 hover:text-error/95"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Render nested Sub-sections if any exist */}
        {subSections.length > 0 && (
          <div className="space-y-4 pl-4 border-l-2 border-primary/20">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Sub-sections</h4>
            {subSections.map((subField, subIndex) => (
              <SubSectionCard
                key={subField.id}
                control={control}
                secIndex={secIndex}
                subIndex={subIndex}
                removeSubSection={removeSubSection}
                questionTypesList={questionTypesList}
              />
            ))}
          </div>
        )}

        {/* Render Direct Question Types (only when no subsections exist) */}
        {subSections.length === 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-1.5">
              <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Question Types</h4>
              {directQuestionTypes.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => appendDirectQt({ questionTypeId: "", mark: 0, requiredCount: 0, totalQuestions: 0, markDistributionStr: "" })}
                  className="text-xs text-primary font-bold hover:bg-primary/5 h-7 px-2"
                >
                  + Add Type
                </Button>
              )}
            </div>

            {directQuestionTypes.length === 0 ? (
              <p className="text-xs text-center text-outline py-4">No question types added. Add a type or a sub-section above.</p>
            ) : (
              <div className="space-y-2">
                {directQuestionTypes.map((qtField, qtIndex) => (
                  <QuestionTypeRow
                    key={qtField.id}
                    control={control}
                    namePrefix={`sections.${secIndex}.questionTypes.${qtIndex}`}
                    removeRow={() => removeDirectQt(qtIndex)}
                    questionTypesList={questionTypesList}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   SUB-SECTION CARD COMPONENT
   ────────────────────────────────────────────────────────────────────────── */
interface SubSectionCardProps {
  control: any
  secIndex: number
  subIndex: number
  removeSubSection: (index: number) => void
  questionTypesList: any[]
}

function SubSectionCard({ control, secIndex, subIndex, removeSubSection, questionTypesList }: SubSectionCardProps) {
  const { fields: subQtFields, append: appendSubQt, remove: removeSubQt } = useFieldArray({
    control,
    name: `sections.${secIndex}.subSections.${subIndex}.questionTypes`,
  })

  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest/40 p-4 space-y-3">
      {/* Header Info */}
      <div className="flex items-center justify-between gap-3 border-b border-outline-variant/40 pb-2">
        <div className="grid grid-cols-2 gap-2 flex-1 max-w-sm">
          <div>
            <Label className="text-[9px] text-outline font-semibold uppercase">Sub-section Name (EN)</Label>
            <Controller
              control={control}
              name={`sections.${secIndex}.subSections.${subIndex}.nameEn`}
              render={({ field }) => (
                <Input {...field} placeholder="e.g. Arithmetic" className="h-8 text-xs bg-white" />
              )}
            />
          </div>
          <div>
            <Label className="text-[9px] text-outline font-semibold uppercase">Sub-section Name (BN)</Label>
            <Controller
              control={control}
              name={`sections.${secIndex}.subSections.${subIndex}.nameBn`}
              render={({ field }) => (
                <Input {...field} placeholder="e.g. পাটিগণিত" className="h-8 text-xs bg-white" />
              )}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => appendSubQt({ questionTypeId: "", mark: 0, requiredCount: 0, totalQuestions: 0, markDistributionStr: "" })}
            className="flex items-center gap-1 text-[11px] h-7 border-outline text-primary hover:bg-primary/5 bg-white"
          >
            <Plus className="h-3 w-3" />
            Add Type
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeSubSection(subIndex)}
            className="h-7 w-7 text-error hover:bg-error/5"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Nested Question Types inside Subsection */}
      {subQtFields.length === 0 ? (
        <p className="text-[11px] text-center text-outline py-2">No question formats mapped under this sub-section.</p>
      ) : (
        <div className="space-y-2">
          {subQtFields.map((qtField, qtIndex) => (
            <QuestionTypeRow
              key={qtField.id}
              control={control}
              namePrefix={`sections.${secIndex}.subSections.${subIndex}.questionTypes.${qtIndex}`}
              removeRow={() => removeSubQt(qtIndex)}
              questionTypesList={questionTypesList}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   QUESTION TYPE SPECIFICATION ROW
   ────────────────────────────────────────────────────────────────────────── */
interface QuestionTypeRowProps {
  control: any
  namePrefix: string
  removeRow: () => void
  questionTypesList: any[]
}

function QuestionTypeRow({ control, namePrefix, removeRow, questionTypesList }: QuestionTypeRowProps) {
  return (
    <div className="flex flex-wrap sm:flex-nowrap items-end gap-3 bg-white p-3 rounded-lg border border-outline-variant/60 shadow-xs relative">
      <div className="w-full sm:flex-1 min-w-[150px]">
        <Label className="text-[10px] text-outline font-semibold uppercase">Question Format</Label>
        <Controller
          control={control}
          name={`${namePrefix}.questionTypeId`}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {questionTypesList.map((qt) => (
                  <SelectItem key={qt.id} value={qt.id} className="text-xs">
                    {qt.nameEn} ({qt.nameBn})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="w-[100px] shrink-0">
        <Label className="text-[10px] text-outline font-semibold uppercase">Total Mark</Label>
        <Controller
          control={control}
          name={`${namePrefix}.mark`}
          render={({ field }) => (
            <Input
              type="number"
              step="any"
              placeholder="0"
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
              className="h-9 text-center text-xs"
            />
          )}
        />
      </div>

      <div className="flex-1 min-w-[120px]">
        <Label className="text-[10px] text-outline font-semibold uppercase">Mark Distribution</Label>
        <Controller
          control={control}
          name={`${namePrefix}.markDistributionStr`}
          render={({ field }) => (
            <Input
              type="text"
              placeholder="e.g. 2, 4, 4"
              value={field.value ?? ""}
              onChange={field.onChange}
              className="h-9 text-center text-xs"
            />
          )}
        />
      </div>

      <div className="w-[100px] shrink-0">
        <Label className="text-[10px] text-outline font-semibold uppercase">Required Count</Label>
        <Controller
          control={control}
          name={`${namePrefix}.requiredCount`}
          render={({ field }) => (
            <Input
              type="number"
              placeholder="0"
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
              className="h-9 text-center text-xs"
            />
          )}
        />
      </div>

      <div className="w-[100px] shrink-0">
        <Label className="text-[10px] text-outline font-semibold uppercase">Total Count</Label>
        <Controller
          control={control}
          name={`${namePrefix}.totalQuestions`}
          render={({ field }) => (
            <Input
              type="number"
              placeholder="0"
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
              className="h-9 text-center text-xs"
            />
          )}
        />
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={removeRow}
        className="h-9 w-9 text-error hover:bg-error/5"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
