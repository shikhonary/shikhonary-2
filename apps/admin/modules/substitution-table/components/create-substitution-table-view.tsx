"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useCreateSubstitutionTable,
  useSubjectsForSelection,
  useAcademicClassesForSelection,
} from "../services/use-substitution-tables"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { HelpCircle, Plus, Trash2, TableProperties, ArrowLeft } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { QUESTION_DIFFICULTY, QUESTION_DIFFICULTY_OPTIONS } from "@workspace/utils"
import { SubstitutionTableGrid } from "./substitution-tables-table"

const createSubstitutionTableFormSchema = z.object({
  classId: z.string().min(1, "Please select an academic class"),
  subjectId: z.string().min(1, "Please select a subject"),
  referenceText: z.string().optional(),
  difficulty: z.nativeEnum(QUESTION_DIFFICULTY),
  popularityCount: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Popularity count must be a number",
  }),
})

type CreateSubstitutionTableFormData = z.infer<typeof createSubstitutionTableFormSchema>

export function CreateSubstitutionTableView() {
  const router = useRouter()
  const createMutation = useCreateSubstitutionTable()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // 3-Column Rows State (default 5 rows)
  const [rows, setRows] = useState<Array<{ a: string; b: string; c: string }>>([
    { a: "", b: "", c: "" },
    { a: "", b: "", c: "" },
    { a: "", b: "", c: "" },
    { a: "", b: "", c: "" },
    { a: "", b: "", c: "" },
  ])

  const { data: academicClasses = [] } = useAcademicClassesForSelection()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<CreateSubstitutionTableFormData>({
    resolver: zodResolver(createSubstitutionTableFormSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      referenceText: "",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      popularityCount: "0",
    },
  })

  const selectedClassId = watch("classId")
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedClassId ? { academicClassId: selectedClassId } : undefined
  )
  const selectedSubjectId = watch("subjectId")
  const selectedDifficulty = watch("difficulty")

  const isSubmitting = createMutation.isPending || isFormSubmitting

  const handleRowChange = (index: number, col: "a" | "b" | "c", val: string) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [col]: val } : row))
    )
  }

  const handleAddRow = () => {
    setRows([...rows, { a: "", b: "", c: "" }])
  }

  const handleRemoveRow = (index: number) => {
    if (rows.length <= 1) return
    setRows(rows.filter((_, i) => i !== index))
  }

  const columnA = rows.map((r) => r.a.trim()).filter(Boolean)
  const columnB = rows.map((r) => r.b.trim()).filter(Boolean)
  const columnC = rows.map((r) => r.c.trim()).filter(Boolean)

  const onSubmit = async (data: CreateSubstitutionTableFormData) => {
    setErrorMessage(null)

    if (columnA.length === 0 || columnB.length === 0 || columnC.length === 0) {
      setErrorMessage("Please provide at least one entry in each column of the substitution table.")
      return
    }

    try {
      const referenceArray = data.referenceText
        ? data.referenceText
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : []

      await createMutation.mutateAsync({
        subjectId: data.subjectId,
        columnA: rows.map((r) => r.a.trim()),
        columnB: rows.map((r) => r.b.trim()),
        columnC: rows.map((r) => r.c.trim()),
        difficulty: data.difficulty,
        popularityCount: Number(data.popularityCount) || 0,
        reference: referenceArray,
      })

      toast.success("Substitution Table created successfully!")
      router.push("/substitution-tables")
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create substitution table")
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 text-outline hover:text-on-surface rounded-lg cursor-pointer"
          >
            <Link href="/substitution-tables">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-headline-md text-2xl sm:text-3xl font-bold text-on-surface">
              Create Substitution Table
            </h1>
            <p className="text-xs sm:text-sm text-outline">
              Define the 3 columns (Column A, Column B, Column C) and associate with a subject.
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-error/30 bg-error/5 p-4 text-xs font-semibold text-error">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 3-Column Editor (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-xl border border-outline-variant/30 bg-surface-container-low shadow-sm">
              <CardHeader className="pb-4 border-b border-outline-variant/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TableProperties className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base font-bold text-on-surface">
                      3-Column Table Entries
                    </CardTitle>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddRow}
                    className="h-8 px-3 text-xs font-bold border-primary text-primary hover:bg-primary/10 rounded-lg cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Row
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="pt-5 space-y-4">
                <div className="space-y-3">
                  {rows.map((row, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-lg border border-outline-variant/30 bg-white"
                    >
                      <span className="font-mono text-xs font-bold text-outline w-6 text-center shrink-0">
                        {idx + 1}
                      </span>

                      {/* Column A */}
                      <Input
                        type="text"
                        placeholder={`Column A (Row ${idx + 1})`}
                        value={row.a}
                        onChange={(e) => handleRowChange(idx, "a", e.target.value)}
                        className="flex-1 text-xs sm:text-sm bg-surface-container-lowest border-outline-variant/50 h-9"
                      />

                      {/* Column B */}
                      <Input
                        type="text"
                        placeholder={`Column B (Row ${idx + 1})`}
                        value={row.b}
                        onChange={(e) => handleRowChange(idx, "b", e.target.value)}
                        className="flex-1 text-xs sm:text-sm bg-surface-container-lowest border-outline-variant/50 h-9"
                      />

                      {/* Column C */}
                      <Input
                        type="text"
                        placeholder={`Column C (Row ${idx + 1})`}
                        value={row.c}
                        onChange={(e) => handleRowChange(idx, "c", e.target.value)}
                        className="flex-1 text-xs sm:text-sm bg-surface-container-lowest border-outline-variant/50 h-9"
                      />

                      {/* Remove Row */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={rows.length <= 1}
                        onClick={() => handleRemoveRow(idx)}
                        className="h-8 w-8 p-0 text-outline hover:text-error hover:bg-error/10 rounded-md cursor-pointer shrink-0 disabled:opacity-30"
                        title="Remove Row"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Live Preview */}
                <div className="pt-4 border-t border-outline-variant/20">
                  <Label className="text-xs font-bold text-on-surface uppercase tracking-wider block mb-2">
                    Live Table Preview
                  </Label>
                  <SubstitutionTableGrid
                    columnA={rows.map((r) => r.a)}
                    columnB={rows.map((r) => r.b)}
                    columnC={rows.map((r) => r.c)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Metadata (1 Col) */}
          <div className="space-y-6">
            {/* Academic Classification */}
            <Card className="rounded-xl border border-outline-variant/30 bg-surface-container-low shadow-sm">
              <CardHeader className="pb-4 border-b border-outline-variant/20">
                <CardTitle className="text-base font-bold text-on-surface">
                  Academic Classification
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-5 space-y-4">
                {/* Academic Class */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-on-surface">Academic Class *</Label>
                  <Select
                    value={selectedClassId}
                    onValueChange={(val) => {
                      setValue("classId", val ?? "", { shouldValidate: true })
                      setValue("subjectId", "")
                    }}
                  >
                    <SelectTrigger className="w-full bg-white border-outline-variant rounded-lg text-xs sm:text-sm">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-neutral-900 border border-outline-variant shadow-md">
                      {academicClasses.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id} className="text-neutral-900">
                          {cls.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.classId && (
                    <p className="text-[11px] text-error font-medium">{errors.classId.message}</p>
                  )}
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-on-surface">Subject *</Label>
                  <Select
                    value={selectedSubjectId}
                    disabled={!selectedClassId}
                    onValueChange={(val) => setValue("subjectId", val ?? "", { shouldValidate: true })}
                  >
                    <SelectTrigger className="w-full bg-white border-outline-variant rounded-lg text-xs sm:text-sm disabled:opacity-50">
                      <SelectValue placeholder={!selectedClassId ? "Select Class First" : "Select Subject"} />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-neutral-900 border border-outline-variant shadow-md">
                      {subjects.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id} className="text-neutral-900">
                          {sub.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.subjectId && (
                    <p className="text-[11px] text-error font-medium">{errors.subjectId.message}</p>
                  )}
                </div>

                {/* Difficulty */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-on-surface">Difficulty Level</Label>
                  <Select
                    value={selectedDifficulty}
                    onValueChange={(val: any) => setValue("difficulty", val, { shouldValidate: true })}
                  >
                    <SelectTrigger className="w-full bg-white border-outline-variant rounded-lg text-xs sm:text-sm">
                      <SelectValue placeholder="Select Difficulty" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-outline-variant shadow-md">
                      {QUESTION_DIFFICULTY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Reference Tags */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-on-surface">References</Label>
                    <span className="text-[10px] text-outline">Comma-separated</span>
                  </div>
                  <Input
                    type="text"
                    placeholder="e.g. Dhaka Board 2024, Rajshahi Board 2023"
                    {...register("referenceText")}
                    className="w-full bg-white border-outline-variant rounded-lg text-xs sm:text-sm"
                  />
                </div>

                {/* Popularity Count */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-on-surface">Popularity Count</Label>
                  <Input
                    type="number"
                    min="0"
                    {...register("popularityCount")}
                    className="w-full bg-white border-outline-variant rounded-lg text-xs sm:text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="outline"
                className="flex-1 rounded-xl border-outline-variant text-xs sm:text-sm font-bold cursor-pointer"
              >
                <Link href="/substitution-tables">Cancel</Link>
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs sm:text-sm font-bold cursor-pointer"
              >
                {isSubmitting ? "Creating..." : "Save Table"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
