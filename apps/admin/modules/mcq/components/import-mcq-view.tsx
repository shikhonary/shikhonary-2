"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@workspace/ui/components/sonner"
import { useImportMcqs, useAcademicClassesForSelection, useSubjectsForSelection, useChaptersForSelection } from "../services/use-mcq"
import { useQuestionTypesList } from "@/modules/question-type/services/use-question-type"
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
import {
  PlusIcon,
  Trash2Icon,
  CopyIcon,
  CheckCircle2Icon,
  Wand2Icon,
  AlertTriangleIcon,
  ChevronRightIcon,
  CodeIcon,
  FileCodeIcon,
  UploadIcon,
  SaveIcon,
  CheckIcon,
  HelpCircleIcon
} from "lucide-react"
import { QUESTION_DIFFICULTY, QUESTION_DIFFICULTY_OPTIONS } from "@workspace/utils"

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
    "contextId": null,
    "difficulty": "MEDIUM",
    "year": 2024,
    "source": "Physics Board",
    "questionTypeId": null,
    "isActive": true,
    "attachments": [
      {
        "url": "https://images.unsplash.com/photo-1543269865-cbf427effbad",
        "type": "image",
        "caption": "Figure 1: Illustration",
        "position": 0
      }
    ]
  }
]`

// Smart JSON Syntax Repair Engine for Production
export function repairJsonSyntax(raw: string): string {
  let cleaned = raw.trim()

  // 1. Strip markdown code fencing (```json ... ``` or ``` ...)
  cleaned = cleaned.replace(/^```(?:json)?\s*/gi, "").replace(/\s*```$/g, "").trim()

  // Remove trailing comma at the end of the input (e.g. }, -> })
  if (cleaned.endsWith(",")) {
    cleaned = cleaned.slice(0, -1).trim()
  }

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
              className={cn(
                "w-full rounded-lg border-2 border-primary bg-white p-2.5 text-sm font-medium focus:outline-hidden",
                editValue && /[\u0980-\u09FF]/.test(editValue) && "font-solaiman"
              )}
            />
          ) : (
            <Input
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className={cn(
                "w-full rounded-lg border-2 border-primary bg-white px-3 py-2 text-sm font-medium focus:outline-hidden",
                editValue && /[\u0980-\u09FF]/.test(editValue) && "font-solaiman"
              )}
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
            <span className={cn(
              "flex-1 whitespace-pre-wrap font-medium text-on-surface text-sm leading-relaxed",
              value && /[\u0980-\u09FF]/.test(value) && "font-solaiman"
            )}>
              <RenderMath text={value || placeholder} isMath={isMath} />
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing(true)
              }}
              className="opacity-100 md:opacity-0 md:group-hover/edit:opacity-100 transition-opacity text-[10px] uppercase font-bold text-primary shrink-0 bg-primary-container/80 hover:bg-primary/20 px-2 py-0.5 rounded-full select-none cursor-pointer border-0 outline-hidden animate-fade-in"
            >
              Edit
            </button>
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
  console.log("EditableMcqCard item:", item)
  const optionLetters = ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ"]
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
        {/* Passage Context / Stimulus (Optional) */}
        <EditableField
          label="Passage Context / Stimulus (Optional)"
          value={item.context || ""}
          isMath={item.isMath}
          multiline
          placeholder="Enter stimulus/passage text (উদ্দীপক)..."
          onSave={(newCtx) => onChange({ ...item, context: newCtx || undefined })}
        />

        {/* Question Text */}
        <EditableField
          label="Question"
          value={item.question}
          isMath={item.isMath}
          multiline
          placeholder="Enter question text..."
          onSave={(newQ) => onChange({ ...item, question: newQ })}
        />

        {/* Optional Context ID */}
        <EditableField
          label="Stimulus / Passage Context ID (Optional)"
          value={item.contextId || ""}
          placeholder="Add context/passage ID (optional)..."
          onSave={(newCtxId) => onChange({ ...item, contextId: newCtxId || undefined })}
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
                        : "border-outline text-outline group-hover/option:border-primary group-hover/option:text-primary",
                      /[\u0980-\u09FF]/.test(letter) && "font-solaiman"
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

          {/* Difficulty */}
          <div className="space-y-1">
            <span className="text-xs font-bold text-outline uppercase tracking-wider">Difficulty</span>
            <Select
              value={item.difficulty || "MEDIUM"}
              onValueChange={(val) => onChange({ ...item, difficulty: val as any })}
            >
              <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-1 px-3 text-xs focus:ring-1 focus:ring-primary h-8 justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg text-xs">
                {QUESTION_DIFFICULTY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Source */}
          <EditableField
            label="Source / Board (Optional)"
            value={item.source || ""}
            placeholder="e.g. Dhaka Board..."
            onSave={(newSrc) => onChange({ ...item, source: newSrc || undefined })}
          />

          {/* Year */}
          <EditableField
            label="Exam Year (Optional)"
            value={item.year !== undefined && item.year !== null ? String(item.year) : ""}
            placeholder="e.g. 2024..."
            onSave={(newYr) => onChange({ ...item, year: newYr && !isNaN(Number(newYr)) ? Number(newYr) : undefined })}
          />

          {/* Question Type ID */}
          <EditableField
            label="Question Type ID (Optional)"
            value={item.questionTypeId || ""}
            placeholder="Enter question type ID..."
            onSave={(newQTypeId) => onChange({ ...item, questionTypeId: newQTypeId || undefined })}
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
  const { data: chapters = [] } = useChaptersForSelection({
    subjectId: selectedSubjectId,
  })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        setJsonText(content)
        validateAndParseJson(content, selectedAcademicClassId, selectedSubjectId, selectedChapterId)
      }
    }
    reader.readAsText(file)
  }

  const validateAndParseJson = (
    text: string,
    overrideClassId: string,
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

        let questionText = String(item.question || "").trim()
        let contextText = item.context ? String(item.context).trim() : undefined

        // Extract context from attachments if type is text/text-context or if url is null/empty (implying text context)
        const attachmentsArray = Array.isArray(item.attachments)
          ? item.attachments
          : Array.isArray(item.attachment)
          ? item.attachment
          : []
        console.log("Item attachments array:", attachmentsArray)

        if (!contextText && attachmentsArray.length > 0) {
          const textAttachment = attachmentsArray.find(
            (att: any) =>
              att &&
              (att.type === "text" ||
                att.url === "text-context" ||
                !att.url ||
                String(att.type).toLowerCase() === "text" ||
                String(att.url).toLowerCase() === "text-context")
          )
          console.log("Found textAttachment:", textAttachment)
          if (textAttachment) {
            const potentialText =
              textAttachment.caption ||
              textAttachment.content ||
              textAttachment.text ||
              (textAttachment.url && textAttachment.url !== "text-context" ? textAttachment.url : "")
            console.log("Extracted potentialText:", potentialText)
            if (potentialText) {
              contextText = String(potentialText).trim()
            }
          }
        }

        // Filter out text attachments since they will be reconstructed from the context field on the backend
        const filteredAttachments = attachmentsArray.filter(
          (att: any) =>
            att &&
            att.type !== "text" &&
            att.url !== "text-context" &&
            att.url &&
            String(att.type).toLowerCase() !== "text" &&
            String(att.url).toLowerCase() !== "text-context"
        )

        // Smart extraction of stimulus/context if embedded in the question stem
        if (!contextText && questionText.includes("\n\n")) {
          // Look for common separators like "প্রশ্ন:", "প্রশ্নঃ", "Question:", "Q:"
          const parts = questionText.split(/\n\n(?:প্রশ্ন|প্রশ্নঃ|Q|Question)[\s:]*/i)
          if (parts.length >= 2) {
            contextText = parts[0]?.trim()
            questionText = parts.slice(1).join("\n\n").trim()
          } else {
            // Fallback: split on the first double newline if it has keywords like "উদ্দীপক" or "অনুচ্ছেদ"
            const doubleNewlineIdx = questionText.indexOf("\n\n")
            if (doubleNewlineIdx !== -1 && (questionText.includes("উদ্দীপক") || questionText.includes("অনুচ্ছেদ"))) {
              contextText = questionText.slice(0, doubleNewlineIdx).trim()
              questionText = questionText.slice(doubleNewlineIdx + 2).trim()
            }
          }
        }

        validated.push({
          question: questionText,
          answer: String(item.answer || "").trim(),
          options: Array.isArray(item.options) ? item.options.map(String) : [],
          statements: Array.isArray(item.statements) ? item.statements.map(String) : [],
          type: item.type ? String(item.type) : "SINGLE",
          isMath: item.isMath !== undefined
            ? Boolean(item.isMath)
            : Boolean(
              /\$[^$\n]+\$/.test(questionText || "") ||
              /\$[^$\n]+\$/.test(item.answer || "") ||
              (Array.isArray(item.options) && item.options.some((opt: any) => /\$[^$\n]+\$/.test(String(opt)))) ||
              (Array.isArray(item.statements) && item.statements.some((stmt: any) => /\$[^$\n]+\$/.test(String(stmt)))) ||
              /\$[^$\n]+\$/.test(item.contextId || "")
            ),
          reference: Array.isArray(item.reference) ? item.reference.map(String) : [],
          explanation: item.explanation ? String(item.explanation) : undefined,
          questionUrl: item.questionUrl ? String(item.questionUrl) : undefined,
          contextId: item.contextId ? String(item.contextId) : undefined,
          context: contextText,
          difficulty: (item.difficulty && typeof item.difficulty === "string" && ["EASY", "MEDIUM", "HARD"].includes(item.difficulty.toUpperCase()))
            ? (item.difficulty.toUpperCase() as any)
            : undefined,
          year: item.year !== undefined && item.year !== null && !isNaN(Number(item.year)) ? Number(item.year) : undefined,
          source: item.source ? String(item.source) : undefined,
          questionTypeId: item.questionTypeId ? String(item.questionTypeId) : undefined,
          subjectId,
          chapterId,
          isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
          attachments: filteredAttachments.map((att: any) => ({
            url: String(att.url || ""),
            type: String(att.type || "image"),
            caption: att.caption ? String(att.caption) : null,
            position: att.position !== undefined ? Number(att.position) : 0,
          })),
        } as any)
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
    validateAndParseJson(repaired, selectedAcademicClassId, selectedSubjectId, selectedChapterId)
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
    validateAndParseJson(val, selectedAcademicClassId, selectedSubjectId, selectedChapterId)
  }

  const handleAcademicClassChange = (val: string) => {
    const value = val === "all" ? "" : (val ?? "")
    setSelectedAcademicClassId(value)
    setSelectedSubjectId("")
    setSelectedChapterId("")
    if (jsonText) {
      validateAndParseJson(jsonText, value, "", "")
    }
  }

  const handleSubjectChange = (val: string | null) => {
    const value = val ?? ""
    setSelectedSubjectId(value)
    setSelectedChapterId("")
    if (jsonText) {
      validateAndParseJson(jsonText, selectedAcademicClassId, value, "")
    }
  }

  const handleChapterChange = (val: string | null) => {
    const value = val ?? ""
    setSelectedChapterId(value)
    if (jsonText) {
      validateAndParseJson(jsonText, selectedAcademicClassId, selectedSubjectId, value)
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
              className="font-label-sm text-xs hover:text-primary transition-colors cursor-pointer"
            >
              MCQs
            </Link>
            <ChevronRightIcon className="size-3 text-on-surface-variant/70" />
            <span className="font-label-sm text-xs font-bold text-primary">Import JSON</span>
          </nav>
          <h2 className="mb-1.5 font-headline-md text-2xl sm:text-3xl font-extrabold text-primary">
            Import MCQs from JSON
          </h2>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Bulk upload questions or edit individual cards before importing into the question bank.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setShowSample(!showSample)}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-outline px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container-low cursor-pointer h-auto"
        >
          <CodeIcon className="size-4" />
          <span>{showSample ? "Hide Template" : "View Sample JSON"}</span>
        </Button>
      </div>

      {/* Sample JSON Template Card */}
      {showSample && (
        <Card className="mb-8 overflow-hidden rounded-xl border border-primary/20 bg-primary-container/10 p-4 sm:p-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <h4 className="font-headline-md text-base font-bold text-primary flex items-center gap-2">
              <FileCodeIcon className="size-5" />
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
                <SelectTrigger className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10 cursor-pointer">
                  <SelectValue placeholder="Select Class (All Classes)..." />
                </SelectTrigger>
                <SelectContent className="bg-white text-neutral-900 border border-outline-variant">
                  <SelectItem value="all" className="text-neutral-900">All Classes</SelectItem>
                  {academicClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id} className="text-neutral-900">
                      {cls.nameEn}
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
                <SelectTrigger className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10 cursor-pointer">
                  <SelectValue placeholder="Select Default Subject..." />
                </SelectTrigger>
                <SelectContent className="bg-white text-neutral-900 border border-outline-variant">
                  {subjects.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id} className="text-neutral-900">
                      {sub.nameEn}
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
                <SelectTrigger className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10 cursor-pointer disabled:opacity-50">
                  <SelectValue
                    placeholder={
                      selectedSubjectId
                        ? "Select Default Chapter..."
                        : "Select Subject first"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-white text-neutral-900 border border-outline-variant">
                  {chapters.map((ch) => (
                    <SelectItem key={ch.id} value={ch.id} className="text-neutral-900">
                      {ch.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Helper Warning if Class, Subject & Chapter are not selected */}
          {(!selectedAcademicClassId || !selectedSubjectId || !selectedChapterId) && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800 text-xs font-semibold">
              <AlertTriangleIcon className="size-4 text-amber-600 shrink-0" />
              <span>Please select a Default Class, Default Subject, and Default Chapter above to unlock JSON file upload and text input.</span>
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
              disabled={!selectedAcademicClassId || !selectedSubjectId || !selectedChapterId}
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
              disabled={!selectedAcademicClassId || !selectedSubjectId || !selectedChapterId}
              placeholder={
                !selectedAcademicClassId || !selectedSubjectId || !selectedChapterId
                  ? "Select Class, Subject, and Chapter above first to enable JSON input..."
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangleIcon className="size-5 text-destructive shrink-0" />
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
                <CheckCircle2Icon className="size-5 text-emerald-600 shrink-0" />
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
                className="bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-bold text-xs cursor-pointer shrink-0 w-full sm:w-auto justify-center"
              >
                <PlusIcon className="size-3.5 mr-1" />
                Add Question Card
              </Button>
            </div>
          )}

          {/* Parsed Items Card-based MCQ Preview */}
          {parsedItems.length > 0 && (
            <div className="border-t border-outline-variant/30 pt-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-headline-md text-base font-bold text-on-surface flex items-center gap-2">
                    <CodeIcon className="size-4 text-primary shrink-0" />
                    Card Preview ({parsedItems.length} MCQ Questions)
                  </h4>
                </div>

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
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:items-center sm:justify-between border-t border-outline-variant pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/mcqs")}
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
                <Wand2Icon className="size-4 animate-spin shrink-0" />
              ) : (
                <UploadIcon className="size-4 shrink-0" />
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
