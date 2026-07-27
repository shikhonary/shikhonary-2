"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@workspace/ui/components/sonner"
import { useImportMcqs } from "../services/use-mcq"
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
import type { CreateMcqInput } from "@workspace/api"
import { cn } from "@workspace/ui/lib/utils"
import { RenderMath } from "@workspace/ui/components/render-math"
import "katex/dist/katex.min.css"
import { PlusIcon, Trash2Icon, CopyIcon, CheckCircle2Icon, Wand2Icon, AlertTriangleIcon } from "lucide-react"

const sampleJsonTemplate = `[
  {
    "question": "What is Newton's second law of motion?",
    "answer": "F = ma",
    "options": ["F = ma", "F = mv", "E = mc^2", "P = IV"],
    "statements": [],
    "type": "SINGLE",
    "isMath": true,
    "reference": ["Physics Board 2024"],
    "explanation": "Force equals mass times acceleration.",
    "questionUrl": null,
    "context": null,
    "contextUrl": null,
    "isActive": true
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
  isMath?: boolean
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
  isMath,
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
              className="w-full rounded-lg border-2 border-primary bg-white p-2.5 text-sm font-medium focus:outline-hidden"
            />
          ) : (
            <Input
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full rounded-lg border-2 border-primary bg-white px-3 py-2 text-sm font-medium focus:outline-hidden"
            />
          )}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
            <span>Press Enter (or Ctrl+Enter) to save, Esc to cancel</span>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                handleBlur()
              }}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div
          onDoubleClick={() => setIsEditing(true)}
          title="Click to edit"
          className={cn(
            "group/edit min-h-9 cursor-pointer rounded-lg border border-transparent bg-surface-container-lowest/50 p-2.5 transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-xs",
            !value && "italic text-outline-variant",
            textClassName
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <span className="flex-1 whitespace-pre-wrap font-medium text-on-surface text-sm leading-relaxed">
              <RenderMath text={value || placeholder} isMath={isMath} />
            </span>
            <span className="opacity-0 group-hover/edit:opacity-100 transition-opacity text-[10px] uppercase font-bold text-primary shrink-0 bg-primary-container/80 px-2 py-0.5 rounded-full select-none">
              Edit
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

interface EditableMcqCardProps {
  index: number
  item: CreateMcqInput
  onChange: (updated: CreateMcqInput) => void
  onDelete: () => void
  onDuplicate: () => void
}

function EditableMcqCard({
  index,
  item,
  onChange,
  onDelete,
  onDuplicate,
}: EditableMcqCardProps) {
  const optionLetters = ["A", "B", "C", "D", "E", "F", "G", "H"]
  const romanNumerals = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii"]

  const handleUpdateStatement = (stmtIdx: number, newText: string) => {
    const currentStatements = Array.isArray(item.statements) ? [...item.statements] : []
    currentStatements[stmtIdx] = newText
    onChange({
      ...item,
      statements: currentStatements,
    })
  }

  const handleAddStatement = () => {
    const currentStatements = Array.isArray(item.statements) ? [...item.statements] : []
    const nextRoman = romanNumerals[currentStatements.length] || String(currentStatements.length + 1)
    const newStmtText = `${nextRoman}. New statement text`
    onChange({
      ...item,
      statements: [...currentStatements, newStmtText],
    })
  }

  const handleRemoveStatement = (stmtIdx: number) => {
    const currentStatements = Array.isArray(item.statements) ? [...item.statements] : []
    const nextStatements = currentStatements.filter((_, idx) => idx !== stmtIdx)
    onChange({
      ...item,
      statements: nextStatements,
    })
  }

  const handleUpdateOption = (optIndex: number, newText: string) => {
    const newOptions = [...item.options]
    const oldOptionText = newOptions[optIndex]
    newOptions[optIndex] = newText

    let newAnswer = item.answer
    if (item.answer === oldOptionText) {
      newAnswer = newText
    }

    onChange({
      ...item,
      options: newOptions,
      answer: newAnswer,
    })
  }

  const handleAddOption = () => {
    const nextOptionText = `Option ${item.options.length + 1}`
    onChange({
      ...item,
      options: [...item.options, nextOptionText],
    })
  }

  const handleAddOptionWithText = (optText: string) => {
    if (!optText) return
    onChange({
      ...item,
      options: [...item.options, optText],
      answer: optText,
    })
  }

  const handleRemoveOption = (optIndex: number) => {
    const optToRemove = item.options[optIndex]
    const newOptions = item.options.filter((_, idx) => idx !== optIndex)
    let newAnswer = item.answer
    if (item.answer === optToRemove && newOptions.length > 0) {
      newAnswer = newOptions[0] ?? ""
    }

    onChange({
      ...item,
      options: newOptions,
      answer: newAnswer,
    })
  }

  const handleSetCorrectAnswer = (optText: string) => {
    onChange({
      ...item,
      answer: optText,
    })
  }

  const handleToggleType = () => {
    onChange({
      ...item,
      type: item.type === "SINGLE" ? "MULTIPLE" : "SINGLE",
    })
  }

  const handleToggleMath = () => {
    onChange({
      ...item,
      isMath: !item.isMath,
    })
  }

  const handleToggleActive = () => {
    onChange({
      ...item,
      isActive: item.isActive !== undefined ? !item.isActive : true,
    })
  }

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

  const isAnswerMatchingOptions = item.options.includes(item.answer)

  return (
    <Card className="overflow-hidden rounded-xl border border-outline-variant/60 bg-white shadow-xs transition-shadow hover:shadow-md">
      {/* Card Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/40 bg-surface-container-low/60 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary-container font-headline text-xs font-bold text-on-primary-container">
            #{index + 1}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-outline">
            MCQ Preview
          </span>
        </div>

        {/* Interactive Controls & Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Question Type Toggle */}
          <button
            type="button"
            onClick={handleToggleType}
            title="Click to toggle SINGLE / MULTIPLE"
            className="cursor-pointer"
          >
            <Badge
              variant={item.type === "SINGLE" ? "default" : "secondary"}
              className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-transform active:scale-95"
            >
              Type: {item.type || "SINGLE"}
            </Badge>
          </button>

          {/* Math Mode Toggle */}
          <button
            type="button"
            onClick={handleToggleMath}
            title="Click to toggle Math formula rendering"
            className="cursor-pointer"
          >
            <Badge
              variant={item.isMath ? "outline" : "ghost"}
              className={cn(
                "px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-transform active:scale-95",
                item.isMath ? "border-primary text-primary" : "text-muted-foreground"
              )}
            >
              {item.isMath ? "∑ Math On" : "Text Only"}
            </Badge>
          </button>

          {/* Active Status Toggle */}
          <button
            type="button"
            onClick={handleToggleActive}
            title="Click to toggle Active status"
            className="cursor-pointer"
          >
            <Badge
              variant="outline"
              className={cn(
                "px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-transform active:scale-95",
                item.isActive !== false
                  ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                  : "border-gray-400 text-gray-500 bg-gray-50"
              )}
            >
              {item.isActive !== false ? "Active" : "Inactive"}
            </Badge>
          </button>

          {/* Duplicate & Delete Buttons */}
          <div className="flex items-center gap-1 ml-2 border-l border-outline-variant/60 pl-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={onDuplicate}
              title="Duplicate MCQ"
              className="text-on-surface-variant hover:bg-surface-container-high cursor-pointer"
            >
              <CopyIcon className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={onDelete}
              title="Delete MCQ from import"
              className="text-destructive hover:bg-destructive/10 cursor-pointer"
            >
              <Trash2Icon className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Item Warnings Banner if validation mismatch */}
      {(!isAnswerMatchingOptions || !item.question.trim()) && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-2 font-medium">
          <div className="flex items-center gap-2">
            <AlertTriangleIcon className="size-4 text-amber-600 shrink-0" />
            <span>
              {!item.question.trim()
                ? "Question text is empty."
                : `Answer "${item.answer}" is not listed in Option Choices.`}
            </span>
          </div>
          {item.answer && !isAnswerMatchingOptions && (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={() => handleAddOptionWithText(item.answer)}
              className="bg-white border-amber-300 text-amber-900 hover:bg-amber-100 text-[11px] font-bold cursor-pointer shrink-0"
            >
              + Add Answer to Options
            </Button>
          )}
        </div>
      )}

      {/* Card Content */}
      <div className="p-5 space-y-4">
        {/* Question Text */}
        <EditableField
          label="Question"
          value={item.question}
          isMath={item.isMath}
          multiline
          placeholder="Enter question text..."
          onSave={(newQ) => onChange({ ...item, question: newQ })}
        />

        {/* Optional Context / Passage */}
        <EditableField
          label="Context / Comprehension Passage (Optional)"
          value={item.context || ""}
          isMath={item.isMath}
          multiline
          placeholder="Add context/passage (optional)..."
          onSave={(newCtx) => onChange({ ...item, context: newCtx || undefined })}
        />

        {/* Statements Section (e.g. i. Statement 1, ii. Statement 2) */}
        <div className="space-y-2 border-t border-outline-variant/30 pt-3">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs font-bold uppercase tracking-wider text-outline flex items-center gap-1.5">
              Statements / Sub-questions ({item.statements?.length || 0})
            </span>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleAddStatement}
              className="text-xs font-bold text-primary hover:bg-primary/10 cursor-pointer"
            >
              <PlusIcon className="size-3.5 mr-1" />
              Add Statement
            </Button>
          </div>

          {Array.isArray(item.statements) && item.statements.length > 0 ? (
            <div className="space-y-2">
              {item.statements.map((stmt, stmtIdx) => (
                <div
                  key={stmtIdx}
                  className="group/stmt flex items-center gap-2.5 rounded-lg border border-outline-variant/40 bg-surface-container-lowest/30 p-2 transition-all hover:border-outline-variant"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-secondary-container/30 text-xs font-bold text-secondary font-mono">
                    {romanNumerals[stmtIdx] || stmtIdx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <EditableField
                      value={stmt}
                      isMath={item.isMath}
                      placeholder="Statement text..."
                      onSave={(newVal) => handleUpdateStatement(stmtIdx, newVal)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveStatement(stmtIdx)}
                    title="Remove statement"
                    className="opacity-0 group-hover/stmt:opacity-100 text-destructive hover:text-destructive/80 p-1 cursor-pointer transition-opacity"
                  >
                    <Trash2Icon className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs italic text-muted-foreground py-1">
              No statements added. Click "+ Add Statement" for Roman numeral combination questions (i, ii, iii).
            </p>
          )}
        </div>

        {/* Options List */}
        <div className="space-y-2 border-t border-outline-variant/30 pt-3">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs font-bold uppercase tracking-wider text-outline">
              Option Choices ({item.options.length})
            </span>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleAddOption}
              className="text-xs font-bold text-primary hover:bg-primary/10 cursor-pointer"
            >
              <PlusIcon className="size-3.5 mr-1" />
              Add Option
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {item.options.map((opt, optIdx) => {
              const isCorrect = item.answer === opt
              const letter = optionLetters[optIdx] || String(optIdx + 1)

              return (
                <div
                  key={optIdx}
                  className={cn(
                    "group/option flex items-center gap-2.5 rounded-lg border p-2 transition-all",
                    isCorrect
                      ? "border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500/20"
                      : "border-outline-variant/40 bg-surface-container-lowest/30 hover:border-outline-variant"
                  )}
                >
                  {/* Select as Correct Answer Button */}
                  <button
                    type="button"
                    onClick={() => handleSetCorrectAnswer(opt)}
                    title={isCorrect ? "Correct Answer" : "Click to mark as correct answer"}
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-all cursor-pointer",
                      isCorrect
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-outline text-outline group-hover/option:border-primary group-hover/option:text-primary"
                    )}
                  >
                    {isCorrect ? <CheckCircle2Icon className="size-4" /> : letter}
                  </button>

                  {/* Editable Option Text */}
                  <div className="flex-1 min-w-0">
                    <EditableField
                      value={opt}
                      isMath={item.isMath}
                      placeholder={`Option ${letter}...`}
                      onSave={(newVal) => handleUpdateOption(optIdx, newVal)}
                      textClassName={isCorrect ? "font-bold text-emerald-900" : ""}
                    />
                  </div>

                  {/* Remove Option Button */}
                  {item.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(optIdx)}
                      title="Remove option"
                      className="opacity-0 group-hover/option:opacity-100 text-destructive hover:text-destructive/80 p-1 cursor-pointer transition-opacity"
                    >
                      <Trash2Icon className="size-3.5" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Answer Key & Explanation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-outline-variant/30 pt-3">
          {/* Answer Field */}
          <EditableField
            label="Correct Answer Value"
            value={item.answer}
            isMath={item.isMath}
            placeholder="Enter correct answer..."
            onSave={(newAns) => onChange({ ...item, answer: newAns })}
          />

          {/* References Tag List */}
          <EditableField
            label="References (Comma-separated)"
            value={referenceString}
            placeholder="e.g. Physics Board 2024, Dhaka Board..."
            onSave={handleSaveReferences}
          />
        </div>

        {/* Explanation */}
        <EditableField
          label="Explanation / Solution Notes"
          value={item.explanation || ""}
          isMath={item.isMath}
          multiline
          placeholder="Add explanation or solution notes (optional)..."
          onSave={(newExp) => onChange({ ...item, explanation: newExp || undefined })}
        />
      </div>
    </Card>
  )
}

export function ImportMcqView() {
  const router = useRouter()
  const importMutation = useImportMcqs()

  const [jsonText, setJsonText] = useState<string>("")
  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState<string>("")
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("")
  const [selectedChapterId, setSelectedChapterId] = useState<string>("")
  const [showSample, setShowSample] = useState<boolean>(false)
  const [parsedItems, setParsedItems] = useState<CreateMcqInput[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [errorContext, setErrorContext] = useState<ReturnType<typeof findJsonErrorPosition>>(null)

  // Academic classes dropdown query
  const { data: academicClasses = [] } = useAcademicClassesForSelection()

  // Subjects dropdown query filtered by selected Academic Class
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedAcademicClassId ? { academicClassId: selectedAcademicClassId } : undefined
  )

  // Chapters dropdown query filtered by selected Subject
  const { data: chapters = [] } = useChaptersForSelection(
    selectedSubjectId ? { subjectId: selectedSubjectId } : undefined
  )

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
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
      // Attempt silent auto-repair for common AI paste artifacts (smart quotes, trailing commas, markdown fences)
      const repaired = repairJsonSyntax(text)
      if (repaired && repaired !== text) {
        try {
          rawData = JSON.parse(repaired)
          textToParse = repaired
          setJsonText(repaired)
          toast.success("Auto-repaired JSON formatting (smart quotes / trailing commas)!")
        } catch {
          // Both failed, proceed to display error diagnostic locator
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

      const validated: CreateMcqInput[] = []
      const errors: string[] = []

      itemsArray.forEach((item: any, idx: number) => {
        const itemNum = idx + 1
        const subjectId = item.subjectId || overrideSubjectId
        const chapterId = item.chapterId || overrideChapterId

        if (!item.question || typeof item.question !== "string") {
          errors.push(`Item #${itemNum}: Missing or invalid 'question' string.`)
        }
        if (!item.answer || typeof item.answer !== "string") {
          errors.push(`Item #${itemNum}: Missing or invalid 'answer' string.`)
        }
        if (!Array.isArray(item.options) || item.options.length < 1) {
          errors.push(`Item #${itemNum}: 'options' must be a non-empty array of strings.`)
        }
        if (!subjectId) {
          errors.push(`Item #${itemNum}: Missing 'subjectId'. Select a default Subject above or add subjectId to JSON.`)
        }
        if (!chapterId) {
          errors.push(`Item #${itemNum}: Missing 'chapterId'. Select a default Chapter above or add chapterId to JSON.`)
        }

        validated.push({
          question: String(item.question || "").trim(),
          answer: String(item.answer || "").trim(),
          options: Array.isArray(item.options) ? item.options.map(String) : [],
          statements: Array.isArray(item.statements) ? item.statements.map(String) : [],
          type: item.type ? String(item.type) : "SINGLE",
          isMath: item.isMath !== undefined
            ? Boolean(item.isMath)
            : Boolean(
                /\$[^$\n]+\$/.test(item.question || "") ||
                /\$[^$\n]+\$/.test(item.answer || "") ||
                (Array.isArray(item.options) && item.options.some((opt: any) => /\$[^$\n]+\$/.test(String(opt)))) ||
                (Array.isArray(item.statements) && item.statements.some((stmt: any) => /\$[^$\n]+\$/.test(String(stmt)))) ||
                /\$[^$\n]+\$/.test(item.context || "")
              ),
          reference: Array.isArray(item.reference) ? item.reference.map(String) : [],
          explanation: item.explanation ? String(item.explanation) : undefined,
          questionUrl: item.questionUrl ? String(item.questionUrl) : undefined,
          context: item.context ? String(item.context) : undefined,
          contextUrl: item.contextUrl ? String(item.contextUrl) : undefined,
          subjectId,
          chapterId,
          isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
        })
      })

      if (errors.length > 0) {
        setParseError(errors.slice(0, 5).join(" | ") + (errors.length > 5 ? ` (+${errors.length - 5} more errors)` : ""))
      }

      setParsedItems(validated)
    } catch (err: any) {
      setParseError(`Validation Error: ${err.message || "Could not validate MCQ items."}`)
    }
  }

  const handleAutoFixJson = () => {
    if (!jsonText.trim()) return
    const repaired = repairJsonSyntax(jsonText)
    setJsonText(repaired)
    validateAndParseJson(repaired, selectedSubjectId, selectedChapterId)
    toast.success("Attempted JSON syntax repair & formatting!")
  }

  const syncParsedItemsToText = (newItems: CreateMcqInput[]) => {
    setParsedItems(newItems)
    setParseError(null)
    setErrorContext(null)
    setJsonText(JSON.stringify(newItems, null, 2))
  }

  const handleJsonChange = (val: string) => {
    setJsonText(val)
    validateAndParseJson(val, selectedSubjectId, selectedChapterId)
  }

  const handleAcademicClassChange = (val: string) => {
    const value = val === "all" ? "" : (val ?? "")
    setSelectedAcademicClassId(value)
    setSelectedSubjectId("")
    setSelectedChapterId("")
    if (jsonText) {
      validateAndParseJson(jsonText, "", "")
    }
  }

  const handleSubjectChange = (val: string | null) => {
    const value = val ?? ""
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

  const handleUpdateParsedItem = (idx: number, updated: CreateMcqInput) => {
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
    next.splice(idx + 1, 0, { ...itemToCopy, question: `${itemToCopy.question} (Copy)` })
    syncParsedItemsToText(next)
    toast.success(`Duplicated question #${idx + 1}.`)
  }

  const handleAddNewQuestionCard = () => {
    const newMcq: CreateMcqInput = {
      question: "New MCQ Question text",
      answer: "Option A",
      options: ["Option A", "Option B", "Option C", "Option D"],
      statements: [],
      type: "SINGLE",
      isMath: false,
      reference: [],
      isActive: true,
      subjectId: selectedSubjectId || "",
      chapterId: selectedChapterId || "",
    }
    const next = [...parsedItems, newMcq]
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
        mcqs: parsedItems,
      })

      toast.success(`Successfully imported ${result.importedCount} MCQ questions!`)
      setTimeout(() => {
        router.push("/mcqs")
      }, 1000)
    } catch (err: any) {
      toast.error(err.message || "Bulk import failed")
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto pb-12">
      {/* Header Section */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end justify-between">
        <div>
          <nav className="mb-3 flex items-center space-x-2 text-on-surface-variant">
            <Link
              href="/mcqs"
              className="font-label-sm hover:text-primary transition-colors cursor-pointer"
            >
              MCQs
            </Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="font-label-sm font-bold text-primary">Import JSON</span>
          </nav>
          <h2 className="mb-2 font-headline-md text-3xl font-extrabold text-primary">
            Import MCQs from JSON
          </h2>
          <p className="font-body-md text-on-surface-variant leading-relaxed">
            Bulk upload questions or edit individual cards before importing into the question bank.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setShowSample(!showSample)}
          className="inline-flex items-center gap-2 rounded-xl border border-outline px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container-low cursor-pointer h-auto"
        >
          <span className="material-symbols-outlined text-lg">code</span>
          <span>{showSample ? "Hide Template" : "View Sample JSON"}</span>
        </Button>
      </div>

      {/* Sample JSON Template Card */}
      {showSample && (
        <Card className="mb-8 overflow-hidden rounded-xl border border-primary/20 bg-primary-container/10 p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-headline-md text-base font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">description</span>
              Expected JSON Structure
            </h4>
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={handleCopyTemplate}
              className="font-bold text-primary border-primary/30 hover:bg-primary-container cursor-pointer"
            >
              Copy Template
            </Button>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-surface-container-lowest p-4 font-mono text-xs text-on-surface leading-relaxed border border-outline-variant/50">
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
                    <SelectItem key={sub.id} value={sub.id} textValue={`${sub.nameBn} (${sub.name})`}>
                      {`${sub.nameBn} (${sub.name})`}
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
                    <SelectItem key={ch.id} value={ch.id} textValue={`${ch.nameBn} (${ch.name})`}>
                      {`${ch.nameBn} (${ch.name})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Helper Warning if Subject & Chapter are not selected */}
          {(!selectedSubjectId || !selectedChapterId) && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800 text-xs font-semibold">
              <span className="material-symbols-outlined text-base text-amber-600">warning</span>
              <span>Please select a Default Subject and Chapter above to unlock JSON file upload and text input.</span>
            </div>
          )}

          {/* JSON File Uploader */}
          <div className="border-t border-outline-variant/30 pt-6">
            <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant mb-2">
              Upload JSON File
            </Label>
            <input
              type="file"
              accept=".json,application/json"
              disabled={!selectedSubjectId || !selectedChapterId}
              onChange={handleFileUpload}
              className="block w-full text-sm text-on-surface file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-container file:text-on-primary-container hover:file:bg-primary hover:file:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed file:disabled:pointer-events-none"
            />
          </div>

          {/* Or Paste JSON Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Or Paste JSON Content Below
              </Label>
              {jsonText.trim() && (
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  onClick={handleAutoFixJson}
                  className="text-xs font-bold text-primary border-primary/30 hover:bg-primary-container cursor-pointer"
                >
                  <Wand2Icon className="size-3.5 mr-1" />
                  ⚡ Auto-Fix & Format JSON
                </Button>
              )}
            </div>
            <Textarea
              rows={6}
              disabled={!selectedSubjectId || !selectedChapterId}
              placeholder={
                !selectedSubjectId || !selectedChapterId
                  ? "Select Subject and Chapter above first to enable JSON input..."
                  : "Paste JSON array here..."
              }
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-white p-3 font-mono text-xs text-on-surface focus:ring-2 focus:ring-primary/20 disabled:bg-surface-container-low disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {/* Validation Status / Diagnostics */}
          {parseError && (
            <div className="space-y-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-destructive">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl">error</span>
                  <p className="font-bold text-sm">JSON Parsing Diagnostic Error</p>
                </div>
                <Button
                  type="button"
                  size="xs"
                  onClick={handleAutoFixJson}
                  className="bg-destructive text-white hover:bg-destructive/90 font-bold text-xs cursor-pointer shadow-xs"
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
            <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-800 text-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-xl text-emerald-600">check_circle</span>
                <div>
                  <p className="font-bold">JSON Parsed & Valid!</p>
                  <p className="text-xs">
                    {parsedItems.length} MCQ question(s) parsed successfully.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddNewQuestionCard}
                className="bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-bold text-xs cursor-pointer shrink-0"
              >
                <PlusIcon className="size-3.5 mr-1" />
                Add Question Card
              </Button>
            </div>
          )}

          {/* Parsed Items Card-based MCQ Preview */}
          {parsedItems.length > 0 && (
            <div className="border-t border-outline-variant/30 pt-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="font-headline-md text-base font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">view_carousel</span>
                    Card Preview ({parsedItems.length} MCQ Questions)
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddNewQuestionCard}
                    className="font-bold text-xs text-primary border-primary/30 hover:bg-primary-container cursor-pointer"
                  >
                    <PlusIcon className="size-3.5 mr-1" />
                    Add Question
                  </Button>
                </div>
              </div>

              {/* Grid of MCQ Preview Cards */}
              <div className="space-y-6">
                {parsedItems.map((item, idx) => (
                  <EditableMcqCard
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
          <div className="flex items-center justify-between border-t border-outline-variant pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/mcqs")}
              className="rounded-lg border border-outline px-6 py-2.5 text-sm font-bold text-primary hover:bg-surface-container-low cursor-pointer h-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={parsedItems.length === 0 || Boolean(parseError) || importMutation.isPending}
              onClick={handleImport}
              className="flex items-center gap-2 rounded-lg bg-primary-container px-8 py-2.5 text-sm font-bold text-on-primary-container shadow-md hover:bg-primary hover:text-white disabled:opacity-50 cursor-pointer h-auto"
            >
              {importMutation.isPending ? (
                <span className="material-symbols-outlined animate-spin text-lg">
                  progress_activity
                </span>
              ) : (
                <span className="material-symbols-outlined text-lg">upload_file</span>
              )}
              <span>
                {importMutation.isPending
                  ? "Importing..."
                  : `Import ${parsedItems.length} MCQs`}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
