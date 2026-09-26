"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@workspace/ui/components/sonner"
import {
  useImportFillInTheBlanksWithoutClues,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-fill-in-the-blanks-without-clues"
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
import { cn } from "@workspace/ui/lib/utils"
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
} from "lucide-react"
import {
  FILL_IN_THE_BLANKS_WITHOUT_CLUES_SOURCE_OPTIONS,
  DEFAULT_SOURCE,
} from "../constants"

const sampleJsonTemplate = `[
  {
    "content": "A poor woodcutter lived in a village. He was very (a) _________ and worked (b) _________ in the (c) _________ every day. One day, his axe fell into a deep (d) _________. He cried for (e) _________.",
    "options": [],
    "reference": ["ঢাকা বোর্ড ২০২৪", "রাজশাহী বোর্ড ২০২৩"],
    "source": "গাইড বুক",
    "difficulty": "MEDIUM",
    "popularityCount": 0
  },
  {
    "content": null,
    "options": [
      "(a) He is _________ honest man.",
      "(b) She bought _________ umbrella yesterday.",
      "(c) The earth moves round _________ sun."
    ],
    "reference": ["চট্টগ্রাম বোর্ড ২০২২"],
    "source": "বৃত্তি সহায়িকা",
    "difficulty": "EASY",
    "popularityCount": 0
  }
]`

// Smart JSON Syntax Repair Engine
export function repairJsonSyntax(raw: string): string {
  let cleaned = raw.trim()

  // 1. Strip markdown code fencing
  cleaned = cleaned.replace(/^```(?:json)?\s*/gi, "").replace(/\s*```$/g, "").trim()

  // 2. Normalize smart quotes to standard quotes
  cleaned = cleaned
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")

  // 3. Strip single-line comments
  cleaned = cleaned.replace(/^\s*\/\/.*$/gm, "")

  // 4. Remove trailing commas in objects & arrays
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
  const posMatch = errMessage.match(/position\s+(\d+)/i)
  let charPos = -1
  if (posMatch && posMatch[1]) {
    charPos = parseInt(posMatch[1], 10)
  }

  const lineMatch = errMessage.match(/line\s+(\d+)/i)
  const colMatch = errMessage.match(/column\s+(\d+)/i)

  let errorLine = lineMatch && lineMatch[1] ? parseInt(lineMatch[1], 10) : -1
  let errorCol = colMatch && colMatch[1] ? parseInt(colMatch[1], 10) : -1

  if (charPos >= 0 && errorLine === -1) {
    let count = 0
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line === undefined) continue
      const lineLen = line.length + 1
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
    const line = lines[i]
    linesContext.push({
      num: i + 1,
      content: line || "",
      isError: i === targetLineIdx,
    })
  }

  return {
    line: errorLine,
    col: errorCol,
    linesContext,
  }
}

function RenderFormattedPassage({ text }: { text: string }) {
  if (!text) return null
  const parts = text.split(/(\([a-z]\)\s*_{2,})/gi)
  return (
    <span>
      {parts.map((part, index) => {
        if (/^\([a-z]\)\s*_{2,}/i.test(part)) {
          return (
            <span
              key={index}
              className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded font-mono font-bold text-primary bg-primary/10 border border-primary/20"
            >
              {part}
            </span>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </span>
  )
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
  renderFormatted?: boolean
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
  renderFormatted = false,
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
              rows={4}
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
            <span>Press Enter to save, Esc to cancel</span>
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
          title="Double click to edit"
          className={cn(
            "group/edit min-h-9 cursor-pointer rounded-lg border border-transparent bg-surface-container-lowest/50 p-2.5 transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-xs",
            !value && "italic text-outline-variant",
            textClassName
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <span className="flex-1 whitespace-pre-wrap font-medium text-on-surface text-sm leading-relaxed">
              {renderFormatted ? (
                <RenderFormattedPassage text={value || placeholder} />
              ) : (
                value || placeholder
              )}
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

interface EditableCardProps {
  index: number
  item: any
  onChange: (updated: any) => void
  onDelete: () => void
  onDuplicate: () => void
}

function EditableCard({
  index,
  item,
  onChange,
  onDelete,
  onDuplicate,
}: EditableCardProps) {
  const hasContent = Boolean(item.content && item.content.trim())
  const hasOptions = Boolean(Array.isArray(item.options) && item.options.length > 0)
  const isInvalid = !hasContent && !hasOptions

  return (
    <div
      className={cn(
        "relative rounded-2xl border bg-white p-5 transition-all duration-200 hover:shadow-md",
        isInvalid ? "border-error/60 bg-error-container/5" : "border-outline-variant/60"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/40 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/15 font-bold font-mono text-xs">
            #{index + 1}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-bold uppercase",
              item.difficulty === "EASY" && "text-emerald-700 border-emerald-300 bg-emerald-50",
              item.difficulty === "MEDIUM" && "text-amber-700 border-amber-300 bg-amber-50",
              item.difficulty === "HARD" && "text-red-700 border-red-300 bg-red-50"
            )}
          >
            {item.difficulty || "MEDIUM"}
          </Badge>
          {Array.isArray(item.options) && item.options.length > 0 && (
            <Badge
              variant="outline"
              className="text-[10px] font-semibold bg-violet-50 text-violet-700 border-violet-200"
            >
              📋 {item.options.length} Sentences
            </Badge>
          )}
          {item.source && (
            <Badge
              variant="outline"
              className="text-[10px] font-semibold bg-amber-500/10 text-amber-700 border-amber-500/20"
            >
              📚 {item.source}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDuplicate}
            className="h-8 w-8 p-0 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg"
            title="Duplicate question"
          >
            <CopyIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 p-0 text-error hover:bg-error/10 rounded-lg"
            title="Delete question"
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Passage Content */}
        <EditableField
          label="Passage Content (Optional if sentence options are provided)"
          value={item.content || ""}
          placeholder="Enter passage content with (a) _________ or leave empty for sentence-based..."
          multiline
          renderFormatted
          onSave={(val) => onChange({ ...item, content: val || null })}
        />

        {/* Sentence Options */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs font-bold uppercase tracking-wider text-outline">
              Sentence Options ({Array.isArray(item.options) ? item.options.length : 0})
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const currentOptions = Array.isArray(item.options) ? item.options : []
                const nextLetter = String.fromCharCode(97 + currentOptions.length)
                onChange({ ...item, options: [...currentOptions, `(${nextLetter}) `] })
              }}
              className="h-6 text-[10px] font-bold border-primary/30 text-primary hover:bg-primary/5 cursor-pointer px-2"
            >
              + Add Option
            </Button>
          </div>
          {Array.isArray(item.options) && item.options.length > 0 && (
            <div className="space-y-1.5">
              {item.options.map((opt: string, optIdx: number) => (
                <div key={optIdx} className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-outline w-6 text-center shrink-0">
                    #{optIdx + 1}
                  </span>
                  <input
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...item.options]
                      newOptions[optIdx] = e.target.value
                      onChange({ ...item, options: newOptions })
                    }}
                    placeholder={`e.g. (${String.fromCharCode(97 + optIdx)}) Sentence with _________ blank`}
                    className="flex-1 rounded-md border border-outline-variant bg-white px-2.5 py-1 text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newOptions = item.options.filter((_: any, i: number) => i !== optIdx)
                      onChange({ ...item, options: newOptions })
                    }}
                    className="text-outline hover:text-error p-1 cursor-pointer"
                    title="Remove option"
                  >
                    <Trash2Icon className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reference, Source & Difficulty Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-outline-variant/30">
          <EditableField
            label="Reference Tags"
            value={Array.isArray(item.reference) ? item.reference.join(", ") : item.reference || ""}
            placeholder="e.g. ঢাকা বোর্ড ২০২৪"
            onSave={(val) => {
              const refs = val.split(",").map((s: string) => s.trim()).filter(Boolean)
              onChange({ ...item, reference: refs })
            }}
          />

          <div>
            <span className="font-label-sm text-xs font-bold uppercase tracking-wider text-outline block mb-1">
              Source (উৎস)
            </span>
            <Select
              value={item.source || DEFAULT_SOURCE}
              onValueChange={(val) => onChange({ ...item, source: val })}
            >
              <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-xs font-semibold h-9 justify-between">
                <SelectValue placeholder="Select Source">
                  {item.source || DEFAULT_SOURCE}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white">
                {FILL_IN_THE_BLANKS_WITHOUT_CLUES_SOURCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <span className="font-label-sm text-xs font-bold uppercase tracking-wider text-outline block mb-1">
              Difficulty
            </span>
            <Select
              value={item.difficulty || "MEDIUM"}
              onValueChange={(val) => onChange({ ...item, difficulty: val })}
            >
              <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-xs font-semibold h-9 justify-between">
                <SelectValue placeholder="Select Difficulty">
                  {item.difficulty || "MEDIUM"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="EASY">EASY</SelectItem>
                <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                <SelectItem value="HARD">HARD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ImportFillInTheBlanksWithoutCluesView() {
  const router = useRouter()
  const importMutation = useImportFillInTheBlanksWithoutClues()

  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState("")
  const [selectedSubjectId, setSelectedSubjectId] = useState("")
  const [selectedChapterId, setSelectedChapterId] = useState("")
  const [selectedSource, setSelectedSource] = useState<string>(DEFAULT_SOURCE)

  const [jsonText, setJsonText] = useState("")
  const [parsedItems, setParsedItems] = useState<any[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [errorContext, setErrorContext] = useState<any>(null)
  const [showSample, setShowSample] = useState(false)

  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedAcademicClassId ? { academicClassId: selectedAcademicClassId } : undefined
  )
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
        validateAndParseJson(content, selectedAcademicClassId, selectedSubjectId, selectedChapterId, selectedSource)
        toast.success(`Loaded JSON file: ${file.name}`)
      }
    }
    reader.onerror = () => {
      toast.error("Failed to read file.")
    }
    reader.readAsText(file)
  }

  const validateAndParseJson = (
    text: string,
    overrideClassId = selectedAcademicClassId,
    overrideSubjectId = selectedSubjectId,
    overrideChapterId = selectedChapterId,
    overrideSource = selectedSource
  ) => {
    if (!text.trim()) {
      setParsedItems([])
      setParseError(null)
      setErrorContext(null)
      return
    }

    let rawData: any = null

    try {
      rawData = JSON.parse(text)
      setParseError(null)
      setErrorContext(null)
    } catch (err: any) {
      const repaired = repairJsonSyntax(text)
      if (repaired !== text) {
        try {
          rawData = JSON.parse(repaired)
          setJsonText(repaired)
          toast.success("Auto-repaired JSON formatting (smart quotes / trailing commas)!")
        } catch {
          // Both failed
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

      const currentDefaultSource = overrideSource || selectedSource || DEFAULT_SOURCE
      const validated: any[] = []
      const errors: string[] = []

      itemsArray.forEach((item: any, idx: number) => {
        const itemNum = idx + 1
        const subjectId = item.subjectId || overrideSubjectId
        const chapterId = item.chapterId || item.academicChapterId || overrideChapterId

        const contentText = item.content || item.passage || item.question || item.text || ""
        const optionsList = Array.isArray(item.options)
          ? item.options.map((opt: any) => String(opt).trim()).filter(Boolean)
          : []

        const hasContent = Boolean(contentText && typeof contentText === "string" && contentText.trim())
        const hasOptions = optionsList.length > 0

        if (!hasContent && !hasOptions) {
          errors.push(`Item #${itemNum}: Must provide either 'content' passage or 'options' sentences.`)
        }
        if (!subjectId) {
          errors.push(`Item #${itemNum}: Missing 'subjectId'. Select default Subject or add to JSON.`)
        }

        const rawDiff = (item.difficulty || item.difficultyLevel || item.level || "MEDIUM").toString().trim().toUpperCase()
        const normalizedDifficulty = ["EASY", "MEDIUM", "HARD"].includes(rawDiff) ? rawDiff : "MEDIUM"

        validated.push({
          subjectId,
          chapterId: chapterId || null,
          academicChapterId: chapterId || null,
          content: hasContent ? String(contentText).trim() : null,
          options: optionsList,
          difficulty: normalizedDifficulty,
          popularityCount: item.popularityCount !== undefined && item.popularityCount !== null ? Number(item.popularityCount) : 0,
          reference: Array.isArray(item.reference) ? item.reference : [],
          source: item.source ? String(item.source).trim() : currentDefaultSource,
        })
      })

      if (errors.length > 0) {
        setParseError(errors.slice(0, 5).join(" | ") + (errors.length > 5 ? ` (+${errors.length - 5} more errors)` : ""))
      }

      setParsedItems(validated)
    } catch (err: any) {
      setParseError(`Validation Error: ${err.message || "Could not validate questions."}`)
    }
  }

  const handleAutoFixJson = () => {
    if (!jsonText.trim()) return
    const repaired = repairJsonSyntax(jsonText)
    setJsonText(repaired)
    validateAndParseJson(repaired, selectedAcademicClassId, selectedSubjectId, selectedChapterId, selectedSource)
    toast.success("Attempted JSON syntax repair & formatting!")
  }

  const syncParsedItemsToText = (newItems: any[]) => {
    setParsedItems(newItems)
    setParseError(null)
    setErrorContext(null)
    setJsonText(JSON.stringify(newItems, null, 2))
  }

  const handleJsonChange = (val: string) => {
    setJsonText(val)
    validateAndParseJson(val, selectedAcademicClassId, selectedSubjectId, selectedChapterId, selectedSource)
  }

  const handleAcademicClassChange = (val: string) => {
    const value = val === "all" ? "" : (val ?? "")
    setSelectedAcademicClassId(value)
    setSelectedSubjectId("")
    setSelectedChapterId("")
    if (jsonText) {
      validateAndParseJson(jsonText, value, "", "", selectedSource)
    }
  }

  const handleSubjectChange = (val: string | null) => {
    const value = val ?? ""
    setSelectedSubjectId(value)
    setSelectedChapterId("")
    if (jsonText) {
      validateAndParseJson(jsonText, selectedAcademicClassId, value, "", selectedSource)
    }
  }

  const handleChapterChange = (val: string | null) => {
    const value = val ?? ""
    setSelectedChapterId(value)
    if (jsonText) {
      validateAndParseJson(jsonText, selectedAcademicClassId, selectedSubjectId, value, selectedSource)
    }
  }

  const handleSourceChange = (val: string) => {
    setSelectedSource(val)
    if (parsedItems.length > 0) {
      const next = parsedItems.map((item) => ({
        ...item,
        source: item.source || val,
      }))
      syncParsedItemsToText(next)
    }
  }

  const handleUpdateParsedItem = (idx: number, updated: any) => {
    const next = [...parsedItems]
    next[idx] = updated
    syncParsedItemsToText(next)
  }

  const handleDeleteParsedItem = (idx: number) => {
    const next = parsedItems.filter((_, i) => i !== idx)
    syncParsedItemsToText(next)
    toast.info(`Removed entry #${idx + 1} from import list.`)
  }

  const handleDuplicateParsedItem = (idx: number) => {
    const itemToCopy = parsedItems[idx]
    if (!itemToCopy) return
    const next = [...parsedItems]
    next.splice(idx + 1, 0, {
      ...itemToCopy,
    })
    syncParsedItemsToText(next)
    toast.success(`Duplicated entry #${idx + 1}.`)
  }

  const handleAddNewQuestionCard = () => {
    const newItem = {
      content: "Sample text with (a) _________ gap marker in the sentence.",
      options: [],
      difficulty: "MEDIUM",
      popularityCount: 0,
      reference: [],
      source: selectedSource || DEFAULT_SOURCE,
    }
    const next = [...parsedItems, newItem]
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
    if (!selectedSubjectId) {
      toast.error("Please select a subject first.")
      return
    }

    try {
      const currentYear = new Date().getFullYear().toString()
      const payload = parsedItems.map((item) => ({
        subjectId: selectedSubjectId,
        chapterId: selectedChapterId || null,
        academicChapterId: selectedChapterId || null,
        content: item.content ? item.content.trim() : null,
        options: Array.isArray(item.options) ? item.options : [],
        difficulty: item.difficulty as any,
        popularityCount: Number(item.popularityCount) || 0,
        reference: Array.isArray(item.reference) ? item.reference : [],
        source: item.source ? String(item.source).trim() : selectedSource,
        session: currentYear,
      }))

      const res = await importMutation.mutateAsync({
        source: selectedSource,
        session: currentYear,
        items: payload as any,
      })
      toast.success(`Successfully imported ${res.importedCount} questions!`)
      setTimeout(() => {
        router.push("/fill-in-the-blanks-without-clues")
      }, 1000)
    } catch (err: any) {
      toast.error(err.message || "Failed to bulk import questions.")
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto pb-12">
      {/* Header Section */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end justify-between">
        <div>
          <nav className="mb-3 flex items-center space-x-2 text-on-surface-variant">
            <Link
              href="/fill-in-the-blanks-without-clues"
              className="font-label-sm text-xs hover:text-primary transition-colors cursor-pointer"
            >
              Fill in the Blanks without Clues
            </Link>
            <ChevronRightIcon className="size-3 text-on-surface-variant/70" />
            <span className="font-label-sm text-xs font-bold text-primary">Import JSON</span>
          </nav>
          <h2 className="mb-1.5 font-headline-md text-2xl sm:text-3xl font-extrabold text-primary">
            Import Fill in the Blanks Questions from JSON
          </h2>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Bulk upload questions without clues (শূন্যস্থান পূরণ) or edit individual cards before importing into the question bank.
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
            Select Academic Class and Subject. Chapter is optional. Questions will be assigned subject and chapter from the selection below.
          </p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Academic Class, Subject, Chapter & Source dropdowns */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  {academicClasses.map((ac) => (
                    <SelectItem key={ac.id} value={ac.id} className="text-neutral-900">
                      {ac.nameEn} ({ac.nameBn})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject Select */}
            <div className="space-y-2">
              <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Academic Subject *
              </Label>
              <Select
                value={selectedSubjectId || "none"}
                onValueChange={(val) => handleSubjectChange(val === "none" ? null : val)}
                disabled={!selectedAcademicClassId}
              >
                <SelectTrigger className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10 cursor-pointer disabled:opacity-50">
                  <SelectValue placeholder={!selectedAcademicClassId ? "Select Class First" : "Select Subject..."} />
                </SelectTrigger>
                <SelectContent className="bg-white text-neutral-900 border border-outline-variant">
                  <SelectItem value="none" className="text-neutral-900">-- Select Subject --</SelectItem>
                  {subjects.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id} className="text-neutral-900">
                      {sub.nameEn} ({sub.nameBn})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Chapter Select */}
            <div className="space-y-2">
              <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Academic Chapter
              </Label>
              <Select
                value={selectedChapterId || "none"}
                onValueChange={(val) => handleChapterChange(val === "none" ? null : val)}
                disabled={!selectedSubjectId}
              >
                <SelectTrigger className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10 cursor-pointer disabled:opacity-50">
                  <SelectValue placeholder={!selectedSubjectId ? "Select Subject First" : "Select Chapter (Optional)..."} />
                </SelectTrigger>
                <SelectContent className="bg-white text-neutral-900 border border-outline-variant">
                  <SelectItem value="none" className="text-neutral-900">-- No Chapter Assigned --</SelectItem>
                  {chapters.map((ch) => (
                    <SelectItem key={ch.id} value={ch.id} className="text-neutral-900">
                      {ch.nameEn} ({ch.nameBn})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Default Source Select */}
            <div className="space-y-2">
              <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Source (উৎস) *
              </Label>
              <Select
                value={selectedSource}
                onValueChange={(val) => handleSourceChange(val ?? DEFAULT_SOURCE)}
              >
                <SelectTrigger className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10 cursor-pointer">
                  <SelectValue placeholder="Select Source..." />
                </SelectTrigger>
                <SelectContent className="bg-white text-neutral-900 border border-outline-variant">
                  {FILL_IN_THE_BLANKS_WITHOUT_CLUES_SOURCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-neutral-900">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* JSON Textarea & Upload Bar */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <Label className="font-label-sm text-xs font-bold uppercase tracking-wider text-on-surface">
                Paste Raw JSON Payload
              </Label>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  onClick={handleAutoFixJson}
                  disabled={!jsonText.trim()}
                  className="font-bold text-primary hover:bg-primary/10 cursor-pointer"
                >
                  <Wand2Icon className="size-3.5 mr-1" />
                  Auto-Fix Syntax
                </Button>

                <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer">
                  <UploadIcon className="size-3.5" />
                  <span>Upload .json file</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            <Textarea
              rows={8}
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              placeholder="[\n  {\n    &quot;content&quot;: &quot;A poor woodcutter lived in a village. He was very (a) _________ and worked (b) _________ in the (c) _________ every day.&quot;,\n    &quot;reference&quot;: [&quot;ঢাকা বোর্ড ২০২৪&quot;],\n    &quot;difficulty&quot;: &quot;MEDIUM&quot;\n  }\n]"
              className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-4 font-mono text-xs leading-relaxed text-on-surface focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </div>

          {/* Parse Error & Context Diagnostic */}
          {parseError && (
            <div className="rounded-xl border border-error/40 bg-error-container/20 p-4 text-error space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangleIcon className="size-4 shrink-0" />
                <span>{parseError}</span>
              </div>

              {errorContext && (
                <div className="overflow-x-auto rounded-lg bg-surface-container-lowest p-3 font-mono text-xs text-on-surface border border-outline-variant/60">
                  <div className="font-bold text-error mb-1">
                    Error near Line {errorContext.line}, Column {errorContext.col}:
                  </div>
                  {errorContext.linesContext.map((l: any) => (
                    <div
                      key={l.num}
                      className={cn(
                        "flex items-start gap-3 px-2 py-0.5 rounded",
                        l.isError && "bg-error/15 font-bold text-error"
                      )}
                    >
                      <span className="w-8 text-right font-bold text-outline select-none shrink-0">
                        {l.num}
                      </span>
                      <span className="whitespace-pre-wrap">{l.content}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview & Edit Cards Section */}
      {parsedItems.length > 0 && !parseError && (
        <div className="space-y-6 animate-fade-in mt-8">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-md text-lg font-bold text-primary flex items-center gap-2">
              <CheckCircle2Icon className="size-5 text-emerald-600" />
              Parsed Questions ({parsedItems.length} items ready for import)
            </h3>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddNewQuestionCard}
              className="rounded-xl border-dashed border-primary text-primary font-bold text-xs hover:bg-primary/10 cursor-pointer"
            >
              <PlusIcon className="size-4 mr-1" />
              Add Question Card
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {parsedItems.map((item, idx) => (
              <EditableCard
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

      {/* Final Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6">
        <Button
          asChild
          variant="outline"
          className="w-full sm:w-auto rounded-xl border border-outline px-6 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container-high h-11 cursor-pointer"
        >
          <Link href="/fill-in-the-blanks-without-clues">Cancel</Link>
        </Button>

        <Button
          type="button"
          onClick={handleImport}
          disabled={parsedItems.length === 0 || Boolean(parseError) || importMutation.isPending || !selectedSubjectId}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-2.5 text-sm font-bold text-white shadow-md hover:bg-primary/90 disabled:opacity-40 h-11 cursor-pointer"
        >
          {importMutation.isPending ? (
            <span>Importing Questions...</span>
          ) : (
            <>
              <UploadIcon className="size-4" />
              <span>Import {parsedItems.length} Questions</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
