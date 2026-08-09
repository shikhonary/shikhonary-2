"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@workspace/ui/components/sonner"
import { useImportCqs } from "../services/use-cq"
import { useAcademicClassesForSelection } from "@/modules/academic-class/services/use-academic-class"
import { useSubjectsForSelection } from "@/modules/subject/services/use-subject"
import { useChaptersForSelection } from "@/modules/chapter/services/use-chapter"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import { Badge } from "@workspace/ui/components/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import type { CreateCqInput } from "@workspace/api"
import { cn } from "@workspace/ui/lib/utils"
import { PlusIcon, Trash2Icon, CopyIcon, CheckCircle2Icon, Wand2Icon, AlertTriangleIcon, ArrowLeft, Loader2, Upload } from "lucide-react"

const sampleJsonTemplate = `[
  {
    "context": "A train starts from rest with acceleration 2 m/s^2...",
    "reference": ["Physics Board 2024"],
    "questionA": "Define acceleration.",
    "questionB": "Explain why acceleration is a vector quantity.",
    "questionC": "Find the velocity of the train after 10 seconds.",
    "questionD": "Analyze the distance traveled in the 5th second versus the 10th second.",
    "answer": {
      "answerA": "Acceleration is the rate of change of velocity.",
      "answerB": "Acceleration requires both magnitude and direction.",
      "answerC": "v = u + at = 0 + 2*10 = 20 m/s.",
      "answerD": "Comparison details here...",
      "explanation": "Newton's laws of motion are applied."
    }
  }
]`

// Smart JSON Syntax Repair Engine for Production
export function repairJsonSyntax(raw: string): string {
  let cleaned = raw.trim()

  // 1. Strip markdown code fencing (```json ... ``` or ``` ...)
  cleaned = cleaned.replace(/^```(?:json)?\s*/gi, "").replace(/\s*```$/g, "").trim()

  // 2. Normalize smart quotes to standard quotes
  cleaned = cleaned
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")

  // 3. Strip single-line comments (// comment)
  cleaned = cleaned.replace(/^\s*\/\/.*$/gm, "")

  // 4. Remove trailing commas in objects & arrays (e.g. , ] -> ] and , } -> })
  cleaned = cleaned.replace(/,\s*([\]}])/g, "$1")

  // 5. Wrap single object in array if not already an array
  if (cleaned.startsWith("{") && cleaned.endsWith("}")) {
    cleaned = `[\n${cleaned}\n]`
  }

  return cleaned
}

// Line & Column Position Diagnostic Extractor
export function findJsonErrorPosition(raw: string, errMessage: string) {
  const lines = raw.split("\n")

  // Try position number e.g. "at position 123"
  const posMatch = errMessage.match(/position\s+(\d+)/i)
  let charPos = -1
  if (posMatch && posMatch[1]) {
    charPos = parseInt(posMatch[1], 10)
  }

  // Try line number e.g. "at line 12 column 4" or "line 12"
  const lineMatch = errMessage.match(/line\s+(\d+)/i)
  const colMatch = errMessage.match(/column\s+(\d+)/i)

  let errorLine = lineMatch && lineMatch[1] ? parseInt(lineMatch[1], 10) : -1
  let errorCol = colMatch && colMatch[1] ? parseInt(colMatch[1], 10) : -1

  if (charPos >= 0 && errorLine === -1) {
    let count = 0
    for (let i = 0; i < lines.length; i++) {
      const lineLen = (lines[i]?.length || 0) + 1 // +1 for newline
      if (count + lineLen >= charPos) {
        errorLine = i + 1
        errorCol = charPos - count + 1
        break
      }
      count += lineLen
    }
  }

  if (errorLine === -1) return null

  const targetLineIdx = Math.max(0, errorLine - 1)
  const startIdx = Math.max(0, targetLineIdx - 2)
  const endIdx = Math.min(lines.length - 1, targetLineIdx + 2)

  const linesContext = []
  for (let i = startIdx; i <= endIdx; i++) {
    linesContext.push({
      num: i + 1,
      content: lines[i] || "",
      isError: i === targetLineIdx,
    })
  }

  return {
    line: errorLine,
    col: errorCol,
    linesContext,
  }
}

interface EditableFieldProps {
  label?: string
  value: string
  placeholder?: string
  multiline?: boolean
  onSave: (newValue: string) => void
  className?: string
  textClassName?: string
  badge?: React.ReactNode
}

function EditableField({
  label,
  value,
  placeholder = "Click to edit...",
  multiline = false,
  onSave,
  className = "",
  textClassName = "",
  badge,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value || "")

  useEffect(() => {
    setEditValue(value || "")
  }, [value])

  const handleBlur = () => {
    setIsEditing(false)
    if (editValue.trim() !== (value || "")) {
      onSave(editValue.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (!multiline || e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleBlur()
    } else if (e.key === "Escape") {
      setEditValue(value || "")
      setIsEditing(false)
    }
  }

  return (
    <div className={cn("group relative transition-colors", className)}>
      {label && (
        <div className="flex items-center justify-between mb-1">
          <span className="font-label-sm text-xs font-bold uppercase tracking-wider text-outline flex items-center gap-1">
            {label}
          </span>
          {badge}
        </div>
      )}
      {isEditing ? (
        <div className="space-y-1.5">
          {multiline ? (
            <Textarea
              autoFocus
              rows={3}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full rounded-lg border-2 border-primary bg-white p-2.5 text-sm font-medium focus:outline-hidden font-solaiman"
            />
          ) : (
            <Input
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full rounded-lg border-2 border-primary bg-white h-9 px-3 text-sm font-medium focus:outline-hidden font-solaiman"
            />
          )}
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className={cn(
            "min-h-9 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm font-semibold text-on-surface hover:border-primary/50 cursor-pointer transition-colors flex items-center whitespace-pre-wrap break-words font-solaiman",
            !value && "text-outline font-normal italic",
            textClassName
          )}
        >
          {value || placeholder}
        </div>
      )}
    </div>
  )
}

interface EditableCqCardProps {
  index: number
  item: CreateCqInput
  onChange: (updated: CreateCqInput) => void
  onDelete: () => void
  onDuplicate: () => void
}

function EditableCqCard({
  index,
  item,
  onChange,
  onDelete,
  onDuplicate,
}: EditableCqCardProps) {
  const referenceString = Array.isArray(item.reference) ? item.reference.join(", ") : ""

  const handleSaveReferences = (val: string) => {
    const refs = val
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean)
    onChange({
      ...item,
      reference: refs,
    })
  }

  return (
    <Card className="overflow-hidden rounded-xl border border-outline-variant/60 bg-white shadow-xs transition-shadow hover:shadow-md">
      {/* Card Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/40 bg-surface-container-low/60 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary-container font-headline text-xs font-bold text-on-primary-container">
            #{index + 1}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-outline">
            CQ Preview
          </span>
        </div>

        {/* Duplicate & Delete Buttons */}
        <div className="flex items-center gap-1 ml-2 pl-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onDuplicate}
            title="Duplicate CQ"
            className="text-on-surface-variant hover:bg-surface-container-high cursor-pointer p-1"
          >
            <CopyIcon className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onDelete}
            title="Delete CQ from import"
            className="text-destructive hover:bg-destructive/10 cursor-pointer p-1"
          >
            <Trash2Icon className="size-4" />
          </Button>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 space-y-4">
        {/* Stem / Context Field */}
        <EditableField
          label="Stem (Context)"
          value={item.context || ""}
          placeholder="Add stem/context description (optional)..."
          multiline
          onSave={(newVal) => onChange({ ...item, context: newVal || undefined })}
        />

        {/* Question Parts A, B, C, D */}
        <div className="space-y-4 border-t border-outline-variant/30 pt-4">
          <span className="font-label-sm text-xs font-bold uppercase tracking-wider text-outline block mb-2">
            Question Parts
          </span>

          <div className="space-y-3">
            {/* Part A */}
            <div className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-primary bg-primary/5 text-xs font-bold text-primary mt-1">
                ক
              </span>
              <div className="flex-1">
                <EditableField
                  value={item.questionA}
                  onSave={(newVal) => onChange({ ...item, questionA: newVal })}
                />
              </div>
            </div>

            {/* Part B */}
            <div className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-primary bg-primary/5 text-xs font-bold text-primary mt-1">
                খ
              </span>
              <div className="flex-1">
                <EditableField
                  value={item.questionB}
                  onSave={(newVal) => onChange({ ...item, questionB: newVal })}
                />
              </div>
            </div>

            {/* Part C */}
            <div className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-primary bg-primary/5 text-xs font-bold text-primary mt-1">
                গ
              </span>
              <div className="flex-1">
                <EditableField
                  value={item.questionC}
                  onSave={(newVal) => onChange({ ...item, questionC: newVal })}
                />
              </div>
            </div>

            {/* Part D */}
            <div className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-primary bg-primary/5 text-xs font-bold text-primary mt-1">
                ঘ
              </span>
              <div className="flex-1">
                <EditableField
                  value={item.questionD || ""}
                  placeholder="Add Part D (optional)..."
                  onSave={(newVal) => onChange({ ...item, questionD: newVal || undefined })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* References Field */}
        <div className="border-t border-outline-variant/30 pt-4">
          <EditableField
            label="References"
            value={referenceString}
            placeholder="Add references (optional)..."
            onSave={handleSaveReferences}
          />
        </div>
      </div>
    </Card>
  )
}

export function ImportCqView() {
  const router = useRouter()
  const importMutation = useImportCqs()

  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState<string>("all")
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("")
  const [selectedChapterId, setSelectedChapterId] = useState<string>("")

  const [showSample, setShowSample] = useState(false)
  const [jsonText, setJsonText] = useState<string>("")
  const [parsedItems, setParsedItems] = useState<CreateCqInput[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [errorContext, setErrorContext] = useState<ReturnType<typeof findJsonErrorPosition>>(null)

  // Fetch Class, Subject, Chapter lists for drop-down default selections
  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedAcademicClassId !== "all" ? { academicClassId: selectedAcademicClassId } : undefined
  )
  const { data: chapters = [] } = useChaptersForSelection(
    selectedSubjectId ? { subjectId: selectedSubjectId } : undefined
  )

  // Auto-clear values if selected Subject has changed
  useEffect(() => {
    setSelectedChapterId("")
  }, [selectedSubjectId])

  const handleAcademicClassChange = (value: string) => {
    setSelectedAcademicClassId(value)
    setSelectedSubjectId("")
    setSelectedChapterId("")
  }

  const handleSubjectChange = (value: string) => {
    setSelectedSubjectId(value)
    setSelectedChapterId("")
    if (jsonText) {
      validateAndParseJson(jsonText, value, "")
    }
  }

  const handleChapterChange = (val: string | null) => {
    const value = val ?? ""
    setSelectedChapterId(value)
    if (jsonText) {
      validateAndParseJson(jsonText, selectedSubjectId, value)
    }
  }

  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      const content = evt.target?.result
      if (typeof content === "string") {
        setJsonText(content)
        validateAndParseJson(content, selectedSubjectId, selectedChapterId)
      }
    }
    reader.readAsText(file)
  }

  const validateAndParseJson = (
    text: string,
    overrideSubjectId: string,
    overrideChapterId: string
  ) => {
    setParseError(null)
    setErrorContext(null)
    setParsedItems([])

    if (!text.trim()) return

    let textToParse = text
    let rawData: any = null

    try {
      rawData = JSON.parse(textToParse)
    } catch (err: any) {
      const repaired = repairJsonSyntax(text)
      if (repaired && repaired !== text) {
        try {
          rawData = JSON.parse(repaired)
          textToParse = repaired
          setJsonText(repaired)
          toast.success("Auto-repaired JSON formatting (smart quotes / trailing commas)!")
        } catch {
          // both failed
        }
      }

      if (!rawData) {
        const errMsg = err.message || "Invalid JSON syntax"
        setParseError(`Syntax Error: ${errMsg}`)
        const errLoc = findJsonErrorPosition(text, errMsg)
        setErrorContext(errLoc)
        return
      }
    }

    try {
      const itemsArray = Array.isArray(rawData) ? rawData : [rawData]

      if (itemsArray.length === 0) {
        setParseError("JSON array is empty.")
        return
      }

      const validated: CreateCqInput[] = []
      const errors: string[] = []

      itemsArray.forEach((item: any, idx: number) => {
        const itemNum = idx + 1
        const subjectId = item.subjectId || overrideSubjectId
        const chapterId = item.chapterId || overrideChapterId

        if (!item.questionA || typeof item.questionA !== "string") {
          errors.push(`Item #${itemNum}: Missing or invalid 'questionA' string.`)
        }
        if (!item.questionB || typeof item.questionB !== "string") {
          errors.push(`Item #${itemNum}: Missing or invalid 'questionB' string.`)
        }
        if (!item.questionC || typeof item.questionC !== "string") {
          errors.push(`Item #${itemNum}: Missing or invalid 'questionC' string.`)
        }
        if (!subjectId) {
          errors.push(`Item #${itemNum}: Missing 'subjectId'. Select a default Subject above or add subjectId to JSON.`)
        }
        if (!chapterId) {
          errors.push(`Item #${itemNum}: Missing 'chapterId'. Select a default Chapter above or add chapterId to JSON.`)
        }

        const formattedAnswer = item.answer
          ? {
              answerA: item.answer.answerA ? String(item.answer.answerA).trim() : null,
              answerB: item.answer.answerB ? String(item.answer.answerB).trim() : null,
              answerC: item.answer.answerC ? String(item.answer.answerC).trim() : null,
              answerD: item.answer.answerD ? String(item.answer.answerD).trim() : null,
              explanation: item.answer.explanation ? String(item.answer.explanation).trim() : null,
            }
          : null

        validated.push({
          questionA: String(item.questionA || "").trim(),
          questionB: String(item.questionB || "").trim(),
          questionC: String(item.questionC || "").trim(),
          questionD: item.questionD ? String(item.questionD).trim() : null,
          context: item.context ? String(item.context).trim() : null,
          reference: Array.isArray(item.reference) ? item.reference.map(String) : [],
          attachments: Array.isArray(item.attachments)
            ? item.attachments.map((att: any) => ({
                url: String(att.url).trim(),
                type: att.type ? String(att.type).trim() : "image",
                caption: att.caption ? String(att.caption).trim() : null,
                position: typeof att.position === "number" ? att.position : 0,
              }))
            : [],
          answer: formattedAnswer,
          subjectId,
          chapterId,
        })
      })

      if (errors.length > 0) {
        setParseError(errors.slice(0, 5).join(" | ") + (errors.length > 5 ? ` (+${errors.length - 5} more errors)` : ""))
      }

      setParsedItems(validated)
    } catch (err: any) {
      setParseError(`Validation Error: ${err.message || "Could not validate CQ items."}`)
    }
  }

  const handleAutoFixJson = () => {
    if (!jsonText.trim()) return
    const repaired = repairJsonSyntax(jsonText)
    setJsonText(repaired)
    validateAndParseJson(repaired, selectedSubjectId, selectedChapterId)
    toast.success("Attempted JSON syntax repair & formatting!")
  }

  const syncParsedItemsToText = (newItems: CreateCqInput[]) => {
    setParsedItems(newItems)
    setParseError(null)
    setErrorContext(null)
    setJsonText(JSON.stringify(newItems, null, 2))
  }

  const handleJsonChange = (val: string) => {
    setJsonText(val)
    validateAndParseJson(val, selectedSubjectId, selectedChapterId)
  }

  const handleUpdateParsedItem = (idx: number, updated: CreateCqInput) => {
    const next = [...parsedItems]
    next[idx] = updated
    syncParsedItemsToText(next)
  }

  const handleDeleteParsedItem = (idx: number) => {
    const next = parsedItems.filter((_, i) => i !== idx)
    syncParsedItemsToText(next)
    toast.info(`Removed question #${idx + 1} from import list.`)
  }

  const handleDuplicateParsedItem = (idx: number) => {
    const itemToCopy = parsedItems[idx]
    if (!itemToCopy) return
    const next = [...parsedItems]
    next.splice(idx + 1, 0, { ...itemToCopy, questionA: `${itemToCopy.questionA} (Copy)` })
    syncParsedItemsToText(next)
    toast.success(`Duplicated question #${idx + 1}.`)
  }

  const handleAddNewQuestionCard = () => {
    const newCq: CreateCqInput = {
      questionA: "New Knowledge-based Question (Part A)",
      questionB: "New Comprehension-based Question (Part B)",
      questionC: "New Application-based Question (Part C)",
      questionD: "",
      context: "",
      reference: [],
      attachments: [],
      answer: {
        answerA: "",
        answerB: "",
        answerC: "",
        answerD: "",
        explanation: "",
      },
      subjectId: selectedSubjectId || "",
      chapterId: selectedChapterId || "",
    }
    const next = [...parsedItems, newCq]
    syncParsedItemsToText(next)
  }

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(sampleJsonTemplate)
    toast.success("Sample JSON template copied to clipboard!")
  }

  const handleImport = async () => {
    if (parsedItems.length === 0 || parseError) {
      toast.error("Please fix JSON errors before importing.")
      return
    }

    try {
      const result = await importMutation.mutateAsync({
        cqs: parsedItems,
      })

      toast.success(`Successfully imported ${result.importedCount} Creative Questions!`)
      setTimeout(() => {
        router.push("/cqs")
      }, 1000)
    } catch (err: any) {
      toast.error(err.message || "Bulk import failed")
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto pb-12 px-4 sm:px-0 font-solaiman">
      {/* Header Section */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end justify-between">
        <div>
          <div className="mb-3">
            <Link
              href="/cqs"
              className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Creative Questions
            </Link>
          </div>
          <h2 className="mb-2 font-headline-md text-3xl font-extrabold text-primary">
            Import CQs from JSON
          </h2>
          <p className="font-body-md text-on-surface-variant leading-relaxed">
            Bulk upload questions or edit individual cards before importing into the question bank.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setShowSample(!showSample)}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-outline px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container-low cursor-pointer h-auto"
        >
          <span>{showSample ? "Hide Template" : "View Sample JSON"}</span>
        </Button>
      </div>

      {/* Sample JSON Template Card */}
      {showSample && (
        <Card className="mb-8 overflow-hidden rounded-xl border border-primary/20 bg-primary-container/10 p-4 sm:p-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <h4 className="font-headline-md text-base font-bold text-primary flex items-center gap-2">
              Expected JSON Structure
            </h4>
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={handleCopyTemplate}
              className="w-full sm:w-auto font-bold text-primary border-primary/30 hover:bg-primary-container cursor-pointer justify-center"
            >
              Copy Template
            </Button>
          </div>
          <pre className="whitespace-pre-wrap break-all sm:break-normal overflow-x-auto rounded-lg bg-surface-container-lowest p-3 sm:p-4 font-mono text-xs text-on-surface leading-relaxed border border-outline-variant/50">
            {sampleJsonTemplate}
          </pre>
        </Card>
      )}

      {/* Main Hierarchy & Input Section */}
      <Card className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-xs">
        <CardHeader className="border-b border-outline-variant/30 p-6 bg-surface-container-low/30">
          <CardTitle className="font-headline-md text-lg font-semibold text-on-surface">
            Class, Subject & Chapter Hierarchy (Default Assignee)
          </CardTitle>
          <p className="font-body-md text-xs text-on-surface-variant mt-1">
            Select Academic Class to dynamically filter Subjects and Chapters. If items in your JSON do not include `subjectId` or `chapterId`, they will be assigned below.
          </p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Academic Class, Subject & Chapter 3-Column Dropdowns */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Academic Class */}
            <div className="space-y-2">
              <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Academic Class
              </Label>
              <Select
                value={selectedAcademicClassId || "all"}
                onValueChange={handleAcademicClassChange}
              >
                <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm text-on-surface focus:ring-2 focus:ring-primary/20 h-auto justify-between">
                  <SelectValue placeholder="Select Class (All Classes)..." />
                </SelectTrigger>
                <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg max-h-64">
                  <SelectItem value="all" textValue="All Classes">All Classes</SelectItem>
                  {academicClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id} textValue={cls.name}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Default Subject */}
            <div className="space-y-2">
              <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Default Subject
              </Label>
              <Select
                value={selectedSubjectId}
                onValueChange={handleSubjectChange}
              >
                <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm text-on-surface focus:ring-2 focus:ring-primary/20 h-auto justify-between">
                  <SelectValue placeholder="Select Default Subject..." />
                </SelectTrigger>
                <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg max-h-64">
                  {subjects.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id} textValue={sub.name}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Default Chapter */}
            <div className="space-y-2">
              <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Default Chapter
              </Label>
              <Select
                disabled={!selectedSubjectId}
                value={selectedChapterId}
                onValueChange={handleChapterChange}
              >
                <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body-md text-sm text-on-surface focus:ring-2 focus:ring-primary/20 h-auto justify-between">
                  <SelectValue
                    placeholder={
                      selectedSubjectId
                        ? "Select Default Chapter..."
                        : "Select Subject first"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg max-h-64">
                  {chapters.map((ch) => (
                    <SelectItem key={ch.id} value={ch.id} textValue={ch.name}>
                      {ch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Helper Warning if Subject & Chapter are not selected */}
          {(!selectedSubjectId || !selectedChapterId) && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800 text-xs font-semibold">
              <AlertTriangleIcon className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Please select a Default Subject and Chapter above to unlock JSON file upload and text input.</span>
            </div>
          )}

          {selectedSubjectId && selectedChapterId && (
            <>
              {/* JSON File Uploader */}
              <div className="border-t border-outline-variant/30 pt-6">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant mb-2">
                  Upload JSON File
                </Label>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleJsonFileUpload}
                  className="block w-full text-sm text-on-surface file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-container file:text-on-primary-container hover:file:bg-primary hover:file:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed file:disabled:pointer-events-none"
                />
              </div>

              {/* Raw JSON Editor Panel */}
              <div className="space-y-2">
                <div className="flex flex-row items-center justify-between gap-2">
                  <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Paste JSON Content Below
                  </Label>
                  {jsonText.trim() && (
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={handleAutoFixJson}
                      className="text-[10px] sm:text-xs font-bold text-primary border-primary/30 hover:bg-primary-container cursor-pointer px-2 py-1 h-auto shrink-0"
                    >
                      <Wand2Icon className="size-3.5 mr-1" />
                      <span>Auto-Fix & Format JSON</span>
                    </Button>
                  )}
                </div>
                <Textarea
                  placeholder="Paste JSON array here..."
                  value={jsonText}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  rows={8}
                  className="w-full rounded-lg border border-outline-variant bg-white p-3 font-mono text-xs text-on-surface focus:ring-2 focus:ring-primary/20 leading-relaxed"
                />
              </div>
            </>
          )}

          {/* Validation Status / Diagnostics */}
          {parseError && (
            <div className="space-y-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-destructive">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangleIcon className="h-5 w-5 text-destructive shrink-0" />
                  <p className="font-bold text-sm">JSON Parsing Diagnostic Error</p>
                </div>
                <Button
                  type="button"
                  size="xs"
                  onClick={handleAutoFixJson}
                  className="bg-destructive text-white hover:bg-destructive/90 font-bold text-xs cursor-pointer shadow-xs w-full sm:w-auto justify-center"
                >
                  <Wand2Icon className="size-3.5 mr-1" />
                  Auto-Fix JSON Syntax
                </Button>
              </div>

              <p className="font-mono text-xs leading-relaxed bg-white/80 p-2.5 rounded-lg border border-destructive/20 text-destructive">
                {parseError}
              </p>

              {/* Code Snippet Error Pointer */}
              {errorContext && errorContext.linesContext.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-destructive/80">
                    Syntax Error Location (Line {errorContext.line}
                    {errorContext.col > 0 ? `, Column ${errorContext.col}` : ""}):
                  </p>
                  <div className="overflow-x-auto rounded-lg bg-gray-900 p-3 font-mono text-xs text-gray-200">
                    {errorContext.linesContext.map((l) => (
                      <div
                        key={l.num}
                        className={cn(
                          "flex items-center gap-3 px-2 py-0.5 rounded",
                          l.isError && "bg-red-900/80 text-white font-bold border-l-4 border-red-500"
                        )}
                      >
                        <span className="w-8 shrink-0 text-right text-gray-500 select-none">
                          {l.num}
                        </span>
                        <span className="whitespace-pre">{l.content}</span>
                        {l.isError && (
                          <span className="ml-auto text-[10px] uppercase tracking-wider bg-red-600 text-white px-1.5 py-0.5 rounded shrink-0">
                            Error Here
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!parseError && parsedItems.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-800 text-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-xl text-emerald-600">check_circle</span>
                <div>
                  <p className="font-bold">JSON Parsed & Valid!</p>
                  <p className="text-xs">
                    {parsedItems.length} CQ question(s) parsed successfully.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddNewQuestionCard}
                className="bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-bold text-xs cursor-pointer shrink-0 w-full sm:w-auto justify-center"
              >
                <PlusIcon className="size-3.5 mr-1" />
                Add Question Card
              </Button>
            </div>
          )}

          {/* Parsed Items Card Preview */}
          {parsedItems.length > 0 && !parseError && (
            <div className="border-t border-outline-variant/30 pt-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h4 className="font-headline-md text-base font-bold text-on-surface">
                  Card Preview ({parsedItems.length} CQ Questions)
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddNewQuestionCard}
                  className="font-bold text-xs text-primary border-primary/30 hover:bg-primary-container cursor-pointer w-full sm:w-auto justify-center"
                >
                  <PlusIcon className="size-3.5 mr-1" />
                  Add Question
                </Button>
              </div>

              <div className="space-y-6">
                {parsedItems.map((item, idx) => (
                  <EditableCqCard
                    key={idx}
                    index={idx}
                    item={item}
                    onChange={(updated) => handleUpdateParsedItem(idx, updated)}
                    onDelete={() => handleDeleteParsedItem(idx)}
                    onDuplicate={() => handleDuplicateParsedItem(idx)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:items-center sm:justify-between border-t border-outline-variant pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/cqs")}
              className="w-full sm:w-auto rounded-lg border border-outline px-6 py-2.5 text-sm font-bold text-primary hover:bg-surface-container-low cursor-pointer h-auto justify-center"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={parsedItems.length === 0 || Boolean(parseError) || importMutation.isPending}
              onClick={handleImport}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-primary-container px-8 py-2.5 text-sm font-bold text-on-primary-container shadow-md hover:bg-primary hover:text-white disabled:opacity-50 cursor-pointer h-auto"
            >
              {importMutation.isPending ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <Upload className="h-5 w-5" />
              )}
              <span>
                {importMutation.isPending
                  ? "Importing..."
                  : `Import ${parsedItems.length} CQs`}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
