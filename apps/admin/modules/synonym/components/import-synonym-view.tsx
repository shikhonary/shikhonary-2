"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@workspace/ui/components/sonner"
import {
  useImportSynonym,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-synonym"
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
} from "lucide-react"

const sampleJsonTemplate = `[
  {
    "word": "সমুদ্র",
    "synonymWord": "সাগর",
    "synonyms": ["সাগর", "জলধি", "সিন্ধু"],
    "reference": ["ঢাকা বোর্ড ২০২৪", "রাজশাহী বোর্ড ২০২৩"],
    "difficulty": "EASY",
    "popularityCount": 12
  },
  {
    "word": "সূর্য",
    "synonymWord": "রবি",
    "synonyms": ["রবি", "ভানু", "দিবাকর"],
    "reference": ["চট্টগ্রাম বোর্ড ২০২২"],
    "difficulty": "MEDIUM",
    "popularityCount": 8
  }
]`

// Smart JSON Syntax Repair Engine
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
  isMath = true,
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
              className="opacity-100 md:opacity-0 md:group-hover/edit:opacity-100 transition-opacity text-[10px] uppercase font-bold text-primary shrink-0 bg-primary-container/80 hover:bg-primary/20 px-2 py-0.5 rounded-full select-none cursor-pointer border-0 outline-hidden"
            >
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

interface EditableSynonymCardProps {
  index: number
  item: any
  onChange: (updated: any) => void
  onDelete: () => void
  onDuplicate: () => void
}

function EditableSynonymCard({
  index,
  item,
  onChange,
  onDelete,
  onDuplicate,
}: EditableSynonymCardProps) {
  const handleToggleDifficulty = () => {
    const difficulties = ["EASY", "MEDIUM", "HARD"]
    const nextIdx = (difficulties.indexOf(item.difficulty || "MEDIUM") + 1) % difficulties.length
    onChange({
      ...item,
      difficulty: difficulties[nextIdx],
    })
  }

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

  const handleSaveSynonyms = (val: string) => {
    const syns = val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    onChange({
      ...item,
      synonyms: syns,
    })
  }

  const referenceString = Array.isArray(item.reference) ? item.reference.join(", ") : ""
  const synonymsString = Array.isArray(item.synonyms) ? item.synonyms.join(", ") : ""

  return (
    <Card className="overflow-hidden rounded-xl border border-outline-variant/60 bg-white shadow-xs transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/40 bg-surface-container-low/60 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary-container font-headline text-xs font-bold text-on-primary-container">
            #{index + 1}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-outline">
            Synonym Entry Preview
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Difficulty Toggle */}
          <button type="button" onClick={handleToggleDifficulty} className="cursor-pointer">
            <Badge
              variant="outline"
              className={cn(
                "px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
                item.difficulty === "EASY" && "border-emerald-500 text-emerald-700 bg-emerald-50",
                item.difficulty === "MEDIUM" && "border-amber-500 text-amber-700 bg-amber-50",
                item.difficulty === "HARD" && "border-red-500 text-red-700 bg-red-50"
              )}
            >
              {item.difficulty || "MEDIUM"}
            </Badge>
          </button>

          {/* Duplicate & Delete Buttons */}
          <div className="flex items-center gap-1 ml-2 border-l border-outline-variant/60 pl-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={onDuplicate}
              title="Duplicate Entry"
              className="text-on-surface-variant hover:bg-surface-container-high cursor-pointer"
            >
              <CopyIcon className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={onDelete}
              title="Delete Entry from import"
              className="text-destructive hover:bg-destructive/10 cursor-pointer"
            >
              <Trash2Icon className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Word Text */}
          <EditableField
            label="Word (মূল শব্দ)"
            value={item.word || item.question || item.name || item.title || ""}
            placeholder="Enter word text (e.g. সমুদ্র, সূর্য)..."
            onSave={(newVal) => onChange({ ...item, word: newVal })}
          />

          {/* Primary Synonym Word */}
          <EditableField
            label="Primary Synonym (প্রধান সমার্থক শব্দ)"
            value={item.synonymWord || ""}
            placeholder="Enter primary synonym (e.g. সাগর, রবি)..."
            onSave={(newVal) => onChange({ ...item, synonymWord: newVal })}
          />
        </div>

        {/* Synonyms List */}
        <EditableField
          label="Synonyms List (অন্যান্য সমার্থক শব্দসমূহ - Comma-separated)"
          value={synonymsString}
          placeholder="e.g. সাগর, জলধি, সিন্ধু..."
          onSave={handleSaveSynonyms}
        />

        {/* References & Popularity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-outline-variant/30 pt-3">
          <EditableField
            label="References (Comma-separated)"
            value={referenceString}
            placeholder="e.g. ঢাকা বোর্ড ২০২৪..."
            onSave={handleSaveReferences}
          />
          <EditableField
            label="Popularity Count"
            value={item.popularityCount !== undefined ? String(item.popularityCount) : "0"}
            placeholder="e.g. 0..."
            onSave={(newVal) => onChange({ ...item, popularityCount: newVal && !isNaN(Number(newVal)) ? Number(newVal) : 0 })}
          />
        </div>
      </div>
    </Card>
  )
}

export function ImportSynonymView() {
  const router = useRouter()
  const importMutation = useImportSynonym()

  const [jsonText, setJsonText] = useState<string>("")
  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState<string>("")
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("")
  const [selectedChapterId, setSelectedChapterId] = useState<string>("")
  const [showSample, setShowSample] = useState<boolean>(false)
  const [parsedItems, setParsedItems] = useState<any[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [errorContext, setErrorContext] = useState<ReturnType<typeof findJsonErrorPosition>>(null)

  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedAcademicClassId ? { academicClassId: selectedAcademicClassId } : undefined
  )
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
      const repaired = repairJsonSyntax(text)
      if (repaired && repaired !== text) {
        try {
          rawData = JSON.parse(repaired)
          textToParse = repaired
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

      const validated: any[] = []
      const errors: string[] = []

      itemsArray.forEach((item: any, idx: number) => {
        const itemNum = idx + 1
        const subjectId = item.subjectId || overrideSubjectId
        const chapterId = item.chapterId || item.academicChapterId || overrideChapterId

        const wordText = item.word || item.question || item.name || item.title || ""
        if (!wordText || typeof wordText !== "string" || !wordText.trim()) {
          errors.push(`Item #${itemNum}: Missing or invalid 'word' text.`)
        }
        if (!subjectId) {
          errors.push(`Item #${itemNum}: Missing 'subjectId'. Select default Subject or add to JSON.`)
        }

        const primarySynonym = item.synonymWord || item.genderWord || item.meaning ? String(item.synonymWord || item.genderWord || item.meaning).trim() : null
        let synonymsArray: string[] = []

        if (Array.isArray(item.synonyms)) {
          synonymsArray = item.synonyms.map((s: any) => String(s).trim()).filter(Boolean)
        } else if (typeof item.synonyms === "string") {
          synonymsArray = item.synonyms.split(",").map((s: string) => s.trim()).filter(Boolean)
        } else if (primarySynonym) {
          synonymsArray = [primarySynonym]
        }

        validated.push({
          subjectId,
          chapterId: chapterId || null,
          academicChapterId: chapterId || null,
          word: String(wordText).trim(),
          synonymWord: primarySynonym,
          synonyms: synonymsArray,
          difficulty: item.difficulty || "MEDIUM",
          popularityCount: item.popularityCount !== undefined && item.popularityCount !== null ? Number(item.popularityCount) : 0,
          reference: Array.isArray(item.reference) ? item.reference : [],
        })
      })

      if (errors.length > 0) {
        setParseError(errors.slice(0, 5).join(" | ") + (errors.length > 5 ? ` (+${errors.length - 5} more errors)` : ""))
      }

      setParsedItems(validated)
    } catch (err: any) {
      setParseError(`Validation Error: ${err.message || "Could not validate Synonym items."}`)
    }
  }

  const handleAutoFixJson = () => {
    if (!jsonText.trim()) return
    const repaired = repairJsonSyntax(jsonText)
    setJsonText(repaired)
    validateAndParseJson(repaired, selectedAcademicClassId, selectedSubjectId, selectedChapterId)
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
      word: `${itemToCopy.word} (Copy)`,
    })
    syncParsedItemsToText(next)
    toast.success(`Duplicated entry #${idx + 1}.`)
  }

  const handleAddNewWordCard = () => {
    const newWord = {
      word: "নতুন শব্দ",
      synonymWord: "সমার্থক শব্দ",
      synonyms: ["সমার্থক শব্দ"],
      difficulty: "MEDIUM",
      popularityCount: 0,
      reference: [],
    }
    const next = [...parsedItems, newWord]
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
      const payload = parsedItems.map((item) => ({
        subjectId: selectedSubjectId,
        chapterId: selectedChapterId || null,
        academicChapterId: selectedChapterId || null,
        word: item.word.trim(),
        synonymWord: item.synonymWord ? item.synonymWord.trim() : null,
        synonyms: Array.isArray(item.synonyms) ? item.synonyms : [],
        difficulty: item.difficulty as any,
        popularityCount: Number(item.popularityCount) || 0,
        reference: Array.isArray(item.reference) ? item.reference : [],
      }))

      const res = await importMutation.mutateAsync({ questions: payload as any })
      toast.success(`Successfully imported ${res.importedCount} Synonym Entries!`)
      setTimeout(() => {
        router.push("/synonyms")
      }, 1000)
    } catch (err: any) {
      toast.error(err.message || "Failed to bulk import synonym words.")
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto pb-12">
      {/* Header Section */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end justify-between">
        <div>
          <nav className="mb-3 flex items-center space-x-2 text-on-surface-variant">
            <Link
              href="/synonyms"
              className="font-label-sm text-xs hover:text-primary transition-colors cursor-pointer"
            >
              Synonym
            </Link>
            <ChevronRightIcon className="size-3 text-on-surface-variant/70" />
            <span className="font-label-sm text-xs font-bold text-primary">Import JSON</span>
          </nav>
          <h2 className="mb-1.5 font-headline-md text-2xl sm:text-3xl font-extrabold text-primary">
            Import Synonym Words from JSON
          </h2>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Bulk upload chapter-based words & synonyms (সমার্থক শব্দ) or edit individual cards before importing into the question bank.
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
            Select Academic Class and Subject. Chapter is required. Synonym items will be assigned subject and chapter from the selection below.
          </p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Academic Class, Subject & Chapter dropdowns */}
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
                Academic Chapter *
              </Label>
              <Select
                value={selectedChapterId || "none"}
                onValueChange={(val) => handleChapterChange(val === "none" ? null : val)}
                disabled={!selectedSubjectId}
              >
                <SelectTrigger className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10 cursor-pointer disabled:opacity-50">
                  <SelectValue placeholder={!selectedSubjectId ? "Select Subject First" : "Select Chapter..."} />
                </SelectTrigger>
                <SelectContent className="bg-white text-neutral-900 border border-outline-variant">
                  <SelectItem value="none" className="text-neutral-900">-- Select Chapter --</SelectItem>
                  {chapters.map((ch) => (
                    <SelectItem key={ch.id} value={ch.id} className="text-neutral-900">
                      {ch.nameEn} ({ch.nameBn})
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
              placeholder="[\n  {\n    &quot;word&quot;: &quot;সমুদ্র&quot;,\n    &quot;synonymWord&quot;: &quot;সাগর&quot;,\n    &quot;synonyms&quot;: [&quot;সাগর&quot;, &quot;জলধি&quot;],\n    &quot;reference&quot;: [&quot;ঢাকা বোর্ড ২০২৪&quot;],\n    &quot;difficulty&quot;: &quot;EASY&quot;\n  }\n]"
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
                  {errorContext.linesContext.map((l) => (
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
              Parsed Words ({parsedItems.length} items ready for import)
            </h3>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddNewWordCard}
              className="rounded-xl border-dashed border-primary text-primary font-bold text-xs hover:bg-primary/10 cursor-pointer"
            >
              <PlusIcon className="size-4 mr-1" />
              Add Word Card
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {parsedItems.map((item, idx) => (
              <EditableSynonymCard
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
          <Link href="/synonyms">Cancel</Link>
        </Button>

        <Button
          type="button"
          onClick={handleImport}
          disabled={parsedItems.length === 0 || Boolean(parseError) || importMutation.isPending || !selectedSubjectId || !selectedChapterId}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-2.5 text-sm font-bold text-white shadow-md hover:bg-primary/90 disabled:opacity-40 h-11 cursor-pointer"
        >
          {importMutation.isPending ? (
            <span>Importing Words...</span>
          ) : (
            <>
              <UploadIcon className="size-4" />
              <span>Import {parsedItems.length} Synonym Entries</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
