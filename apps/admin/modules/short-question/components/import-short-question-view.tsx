"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@workspace/ui/components/sonner"
import {
  useImportShortQuestions,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-short-question"
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
import { PageHeader } from "@/components/shared/page-header"
import { toBengaliDigits, QUESTION_DIFFICULTY_OPTIONS, QUESTION_DIFFICULTY } from "@workspace/utils"
import { SHORT_QUESTION_SOURCE_OPTIONS, DEFAULT_SOURCE } from "../constants"
import {
  Upload,
  ArrowLeft,
  BookOpen,
  Code,
  FileCode,
  Wand2,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Maximize2,
  Minimize2,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  Layers,
} from "lucide-react"

const sampleJsonTemplate = `[
  {
    "question": "আমাদের ছোট নদী চলে বাঁকে বাঁকে,\\nবৈশাখ মাসে তার হাঁটু জল থাকে।",
    "reference": ["ঢাকা বোর্ড ২০২৪", "রাজশাহী বোর্ড ২০২৩"],
    "difficulty": "EASY",
    "source": "বোর্ড প্রশ্ন",
    "year": 2024,
    "popularityCount": 12
  },
  {
    "question": "মেঘের কোলে রোদ হেসেছে, বাদল গেছে টুটি,\\nআজ আমাদের ছুটি ও ভাই, আজ আমাদের ছুটি।",
    "reference": ["চট্টগ্রাম বোর্ড ২০২২"],
    "difficulty": "MEDIUM",
    "source": "পাঠ্যবই",
    "year": 2022,
    "popularityCount": 8
  }
]`

// Smart JSON Syntax Repair Engine
export function repairJsonSyntax(raw: string): string {
  let cleaned = raw.trim()

  // 1. Strip markdown code fencing (```json ... ``` or ``` ...)
  cleaned = cleaned.replace(/^```(?:json)?\s*/gi, "").replace(/\s*```$/g, "").trim()

  // Remove trailing comma at the end of input
  if (cleaned.endsWith(",")) {
    cleaned = cleaned.slice(0, -1).trim()
  }

  // 2. Normalize smart quotes to standard quotes
  cleaned = cleaned.replace(/[“”]/g, '"').replace(/[‘’]/g, "'")

  // 3. Strip single-line comments (// comment)
  cleaned = cleaned.replace(/^\s*\/\/.*$/gm, "")

  // 4. Escape LaTeX backslashes that are unescaped
  cleaned = cleaned.replace(
    /(?<!\\)\\(rightarrow|right|rho|rangle|Rightarrow|roots|rceil|rfloor|times|theta|text|tan|tau|tilde|to|therefore|triangle|tanh|top|tiny|textbf|textit|texttt|tfrac|tag|frac|forall|flat|beta|begin|bar|mathbf|binom|big|Big|bullet|bot|boldsymbol|bmatrix|bmod|neq|nabla|nu|not|null|neg|natural|ni|norm)\b/g,
    "\\\\$1"
  )

  // 5. Remove trailing commas in objects & arrays
  cleaned = cleaned.replace(/,\s*([\]}])/g, "$1")

  // 6. Wrap single object in array if needed
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
      const lineLen = (lines[i]?.length || 0) + 1
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

interface ParsedCardProps {
  index: number
  item: any
  isExpanded: boolean
  onToggleExpand: () => void
  onChange: (updated: any) => void
  onDelete: () => void
  onDuplicate: () => void
}

function ParsedShortQuestionCard({
  index,
  item,
  isExpanded,
  onToggleExpand,
  onChange,
  onDelete,
  onDuplicate,
}: ParsedCardProps) {
  const referenceString = Array.isArray(item.reference) ? item.reference.join(", ") : ""

  const snippet =
    item.question && item.question.length > 90
      ? item.question.substring(0, 90) + "..."
      : item.question || `প্রশ্ন #${toBengaliDigits(index + 1)} (বিবরণ নেই)`

  return (
    <Card className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs overflow-hidden transition-all hover:shadow-md">
      {/* Header Bar matching MCQ ParsedCard Benchmark */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-4 sm:p-5">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-primary font-bold text-xs sm:text-sm border border-indigo-100 dark:border-primary/20 shrink-0">
            #{toBengaliDigits(index + 1)}
          </div>
          <div className="min-w-0 flex-1">
            <h4
              onClick={onToggleExpand}
              className="text-sm sm:text-base font-bold font-headline text-foreground truncate cursor-pointer hover:text-indigo-600 transition-colors"
            >
              <RenderMath text={snippet} isMath={true} />
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Source Badge */}
          <Badge
            variant="outline"
            className="px-2.5 py-0.5 text-[11px] font-bold border-indigo-200/80 bg-indigo-50/50 text-indigo-700 dark:bg-primary/10 dark:text-primary font-body hidden sm:inline-flex"
          >
            {item.source || DEFAULT_SOURCE}
          </Badge>

          {/* Difficulty Badge */}
          <Badge
            variant="outline"
            className={cn(
              "px-2.5 py-0.5 text-[11px] font-bold font-body",
              item.difficulty === "EASY" && "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40",
              item.difficulty === "HARD" && "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/40",
              (!item.difficulty || item.difficulty === "MEDIUM") && "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/40"
            )}
          >
            {item.difficulty === "EASY" ? "সহজ" : item.difficulty === "HARD" ? "কঠিন" : "মাঝারি"}
          </Badge>

          {/* Action Buttons */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDuplicate}
            title="কপি করুন"
            className="size-8 text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl cursor-pointer"
          >
            <Copy className="size-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDelete}
            title="মুছুন"
            className="size-8 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl cursor-pointer"
          >
            <Trash2 className="size-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggleExpand}
            className="size-8 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </div>
      </div>

      {/* Expanded Inline Review & Edit Form matching MCQ View */}
      {isExpanded && (
        <CardContent className="p-5 sm:p-6 space-y-6 bg-card">
          {/* Question Text */}
          <div className="space-y-2">
            <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              প্রশ্নের মূল বিবরণ (Question Stem) <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              rows={3}
              value={item.question || ""}
              onChange={(e) => onChange({ ...item, question: e.target.value })}
              placeholder="সংক্ষিপ্ত প্রশ্নের বিবরণ লিখুন..."
              className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 p-3.5 leading-relaxed"
            />
            {item.question && (
              <div className="rounded-xl border border-indigo-100 dark:border-primary/20 bg-indigo-50/20 dark:bg-primary/[0.02] p-3 text-xs">
                <span className="font-bold text-indigo-700 dark:text-primary font-headline block mb-1">
                  লাইভ প্রিভিউ:
                </span>
                <RenderMath text={item.question} isMath={true} />
              </div>
            )}
          </div>

          {/* Reference */}
          <div className="space-y-2">
            <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              রেফারেন্স / উৎস (কমা দিয়ে একাধিক উল্লেখ করুন)
            </Label>
            <Input
              type="text"
              placeholder="যেমন: ঢাকা বোর্ড ২০২৪, পাঠ্যবই পৃষ্ঠা ৪২..."
              value={referenceString}
              onChange={(e) => {
                const arr = e.target.value
                  .split(",")
                  .map((r) => r.trim())
                  .filter(Boolean)
                onChange({ ...item, reference: arr })
              }}
              className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4"
            />
          </div>

          {/* Metadata Settings */}
          <div className="space-y-6 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
            <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-primary flex items-center gap-1.5 font-headline">
              <Sparkles className="w-3.5 h-3.5" />
              মেটাডাটা ও অতিরিক্ত সেটিংস
            </h5>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Difficulty */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  কাঠিন্যের মাত্রা (Difficulty) <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={item.difficulty || "MEDIUM"}
                  onValueChange={(val) => onChange({ ...item, difficulty: val })}
                >
                  <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between">
                    <SelectValue placeholder="কাঠিন্য নির্বাচন করুন..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg">
                    {QUESTION_DIFFICULTY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Source */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  প্রশ্নের উৎস (Source)
                </Label>
                <Select
                  value={item.source || DEFAULT_SOURCE}
                  onValueChange={(val) => onChange({ ...item, source: val })}
                >
                  <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between">
                    <SelectValue placeholder="উৎস নির্বাচন করুন...">
                      {item.source || DEFAULT_SOURCE}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg">
                    {SHORT_QUESTION_SOURCE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  পরীক্ষার বছর (ঐচ্ছিক)
                </Label>
                <Input
                  type="number"
                  placeholder="যেমন: ২০২৪"
                  value={item.year !== undefined && item.year !== null ? String(item.year) : ""}
                  onChange={(e) =>
                    onChange({
                      ...item,
                      year: e.target.value && !isNaN(Number(e.target.value)) ? Number(e.target.value) : null,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4"
                />
              </div>

              {/* Popularity / Views */}
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  ভিউ সংখ্যা (Popularity)
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={item.popularityCount !== undefined ? item.popularityCount : 0}
                  onChange={(e) =>
                    onChange({
                      ...item,
                      popularityCount: e.target.value ? Number(e.target.value) : 0,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4"
                />
              </div>
            </div>

            {/* Active Status Checkbox */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-4">
              <div>
                <p className="text-sm font-bold text-foreground">
                  অ্যাক্টিভ প্রশ্নের অবস্থা
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  পরীক্ষা ও অনুশীলনে শিক্ষার্থীদের জন্য অবিলম্বে দৃশ্যমান করুন।
                </p>
              </div>
              <input
                type="checkbox"
                checked={item.isActive !== false}
                onChange={(e) => onChange({ ...item, isActive: e.target.checked })}
                className="size-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export function ImportShortQuestionView() {
  const router = useRouter()
  const importMutation = useImportShortQuestions()

  const [jsonText, setJsonText] = useState<string>("")
  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState<string>("")
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("")
  const [selectedChapterId, setSelectedChapterId] = useState<string>("")
  const [selectedSource, setSelectedSource] = useState<string>(DEFAULT_SOURCE)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(QUESTION_DIFFICULTY.MEDIUM)
  const [showSample, setShowSample] = useState<boolean>(false)
  const [parsedItems, setParsedItems] = useState<any[]>([])
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({ 0: true })
  const [parseError, setParseError] = useState<string | null>(null)
  const [errorContext, setErrorContext] = useState<ReturnType<typeof findJsonErrorPosition>>(null)

  const { data: academicClasses = [] } = useAcademicClassesForSelection()

  const { data: subjects = [] } = useSubjectsForSelection(
    selectedAcademicClassId ? { academicClassId: selectedAcademicClassId } : undefined
  )

  const { data: chapters = [] } = useChaptersForSelection(
    selectedSubjectId ? { subjectId: selectedSubjectId } : undefined
  )

  const handleAcademicClassChange = (classId: string) => {
    const val = classId === "all" ? "" : classId
    setSelectedAcademicClassId(val)
    setSelectedSubjectId("")
    setSelectedChapterId("")
  }

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId)
    setSelectedChapterId("")
  }

  const handleChapterChange = (chapterId: string) => {
    setSelectedChapterId(chapterId)
  }

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(sampleJsonTemplate)
    toast.success("নমুনা JSON টেমপ্লেট ক্লিপবোর্ডে কপি করা হয়েছে!")
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        setJsonText(content)
        validateAndParseJson(
          content,
          selectedAcademicClassId,
          selectedSubjectId,
          selectedChapterId,
          selectedSource,
          selectedDifficulty
        )
      }
    }
    reader.readAsText(file)
  }

  const validateAndParseJson = (
    text: string,
    overrideClassId: string,
    overrideSubjectId: string,
    overrideChapterId: string,
    overrideSource?: string,
    overrideDifficulty?: string
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
          toast.success("JSON ফরম্যাট ও সিনট্যাক্স স্বয়ংক্রিয়ভাবে সংশোধন করা হয়েছে!")
        } catch {
          // Both failed
        }
      }

      if (!rawData) {
        const errMsg = err.message || "ভুল JSON সিনট্যাক্স"
        setParseError(`সিনট্যাক্স ত্রুটি: ${errMsg}`)
        const errLoc = findJsonErrorPosition(text, errMsg)
        setErrorContext(errLoc)
        return
      }
    }

    try {
      const itemsArray = Array.isArray(rawData) ? rawData : [rawData]

      if (itemsArray.length === 0) {
        setParseError("JSON অ্যারেটি খালি।")
        return
      }

      const validated: any[] = []
      const errors: string[] = []

      const fallbackSource = overrideSource || selectedSource || DEFAULT_SOURCE
      const fallbackDifficulty =
        overrideDifficulty || selectedDifficulty || QUESTION_DIFFICULTY.MEDIUM

      itemsArray.forEach((item: any, idx: number) => {
        const itemNum = idx + 1
        const questionText = item.question || item.name || item.title

        if (!questionText || typeof questionText !== "string" || !questionText.trim()) {
          errors.push(`প্রশ্ন #${itemNum}: প্রশ্নের মূল বিবরণ (question) অনুপস্থিত বা সঠিক নয়।`)
          return
        }

        const normalizedDifficulty = (item.difficulty || fallbackDifficulty).toUpperCase()
        const validDifficulty = ["EASY", "MEDIUM", "HARD"].includes(normalizedDifficulty)
          ? normalizedDifficulty
          : "MEDIUM"

        const normalizedItem: any = {
          question: questionText.trim(),
          reference: Array.isArray(item.reference) ? item.reference : [],
          source: item.source ? String(item.source).trim() : fallbackSource,
          session: item.session ? String(item.session).trim() : null,
          year: item.year && !isNaN(Number(item.year)) ? Number(item.year) : null,
          difficulty: validDifficulty,
          popularityCount: item.popularityCount || 0,
          isActive: item.isActive !== false,
        }

        validated.push(normalizedItem)
      })

      if (errors.length > 0) {
        setParseError(errors.join(" | "))
        return
      }

      setParsedItems(validated)
    } catch (err: any) {
      setParseError(err.message || "ডাটা ভ্যালিডেশনে সমস্যা হয়েছে।")
    }
  }

  const handleAutoFixJson = () => {
    if (!jsonText.trim()) return
    const repaired = repairJsonSyntax(jsonText)
    setJsonText(repaired)
    validateAndParseJson(
      repaired,
      selectedAcademicClassId,
      selectedSubjectId,
      selectedChapterId,
      selectedSource,
      selectedDifficulty
    )
    toast.success("স্বয়ংক্রিয় সিনট্যাক্স ফিক্স ও ফরম্যাট প্রয়োগ করা হয়েছে।")
  }

  const handleJsonChange = (val: string) => {
    setJsonText(val)
    validateAndParseJson(
      val,
      selectedAcademicClassId,
      selectedSubjectId,
      selectedChapterId,
      selectedSource,
      selectedDifficulty
    )
  }

  const handleUpdateParsedItem = (index: number, updatedItem: any) => {
    const updated = [...parsedItems]
    updated[index] = updatedItem
    setParsedItems(updated)
    setJsonText(JSON.stringify(updated, null, 2))
  }

  const handleDeleteParsedItem = (index: number) => {
    const updated = parsedItems.filter((_, idx) => idx !== index)
    setParsedItems(updated)
    setJsonText(JSON.stringify(updated, null, 2))
    toast.info("প্রশ্নটি তালিকা থেকে মুছে ফেলা হয়েছে।")
  }

  const handleDuplicateParsedItem = (index: number) => {
    const target = parsedItems[index]
    const updated = [...parsedItems]
    updated.splice(index + 1, 0, { ...target })
    setParsedItems(updated)
    setJsonText(JSON.stringify(updated, null, 2))
    toast.success("প্রশ্নটি সফলভাবে ডুপ্লিকেট করা হয়েছে।")
  }

  const handleAddNewQuestionCard = () => {
    const newItem: any = {
      question: "নতুন সংক্ষিপ্ত প্রশ্ন...",
      reference: [],
      source: selectedSource || DEFAULT_SOURCE,
      difficulty: selectedDifficulty || "MEDIUM",
      popularityCount: 0,
      isActive: true,
    }
    const updated = [...parsedItems, newItem]
    setParsedItems(updated)
    setJsonText(JSON.stringify(updated, null, 2))
    setExpandedCards((prev) => ({ ...prev, [updated.length - 1]: true }))
  }

  const toggleAllExpanded = (expanded: boolean) => {
    const all: Record<number, boolean> = {}
    parsedItems.forEach((_, i) => (all[i] = expanded))
    setExpandedCards(all)
  }

  const handleImport = async () => {
    if (!selectedAcademicClassId) {
      toast.error("অনুগ্রহ করে শ্রেণি নির্বাচন করুন।")
      return
    }
    if (!selectedSubjectId) {
      toast.error("অনুগ্রহ করে বিষয় নির্বাচন করুন।")
      return
    }
    if (!selectedChapterId) {
      toast.error("অনুগ্রহ করে অধ্যায় নির্বাচন করুন।")
      return
    }
    if (parsedItems.length === 0) {
      toast.error("ইমপোর্ট করার জন্য কোনো প্রশ্ন পাওয়া যায়নি।")
      return
    }

    try {
      const payload = parsedItems.map((item) => {
        const resolvedSession = item.session
          ? String(item.session).trim()
          : item.year
          ? String(item.year)
          : new Date().getFullYear().toString()

        return {
          subjectId: selectedSubjectId,
          chapterId: selectedChapterId,
          question: item.question.trim(),
          difficulty: item.difficulty || "MEDIUM",
          reference: Array.isArray(item.reference) ? item.reference : [],
          source: item.source || selectedSource || DEFAULT_SOURCE,
          session: resolvedSession,
          popularityCount: item.popularityCount || 0,
          isActive: item.isActive !== false,
        }
      })

      const res = await importMutation.mutateAsync({ questions: payload as any })
      toast.success(`সফলভাবে ${toBengaliDigits(res.importedCount)}টি সংক্ষিপ্ত প্রশ্ন ইমপোর্ট করা হয়েছে!`)
      router.push("/short-questions")
    } catch (err: any) {
      toast.error(err.message || "ইমপোর্ট সম্পন্ন করা সম্ভব হয়নি।")
    }
  }

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200 pb-12">
      {/* Shared Page Header matching MCQ Blueprint */}
      <PageHeader
        title="JSON থেকে সংক্ষিপ্ত প্রশ্ন ইম্পোর্ট"
        description="JSON ফাইল আপলোড বা সরাসরি টেক্সট পেস্ট করে একসাথে একাধিক সংক্ষিপ্ত প্রশ্ন যাচাই, সম্পাদনা ও ইম্পোর্ট করুন।"
        icon={Upload}
        badge={{ label: "বাল্ক ইম্পোর্ট", variant: "indigo" }}
        breadcrumbs={[
          { label: "সংক্ষিপ্ত প্রশ্ন তালিকা", href: "/short-questions" },
          { label: "JSON ইম্পোর্ট" },
        ]}
      >
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowSample(!showSample)}
            className="h-10 px-4 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-xs font-headline"
          >
            <Code className="w-4 h-4" />
            <span>{showSample ? "টেমপ্লেট লুকান" : "নমুনা JSON দেখুন"}</span>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-10 px-4 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-xs font-headline"
          >
            <Link href="/short-questions" prefetch={true}>
              <ArrowLeft className="w-4 h-4" />
              <span>তালিকায় ফিরে যান</span>
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* Sample JSON Template Card matching MCQ Blueprint */}
      {showSample && (
        <Card className="rounded-2xl border border-indigo-200/70 dark:border-primary/20 bg-indigo-50/30 dark:bg-primary/5 p-5 sm:p-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <h4 className="text-sm font-bold font-headline text-indigo-700 dark:text-primary flex items-center gap-2">
              <FileCode className="size-4" />
              প্রত্যাশিত JSON ফরম্যাট ও কাঠামো
            </h4>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleCopyTemplate}
              className="rounded-xl border border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-primary/20 dark:text-primary text-xs font-bold h-8 px-3 cursor-pointer font-headline"
            >
              টেমপ্লেট কপি করুন
            </Button>
          </div>
          <pre className="whitespace-pre-wrap break-all sm:break-normal overflow-x-auto rounded-xl bg-card p-4 font-mono text-xs text-foreground leading-relaxed border border-slate-200/80 dark:border-white/[0.08]">
            {sampleJsonTemplate}
          </pre>
        </Card>
      )}

      {/* Step 1 Card: Data Source & Hierarchy Setup matching MCQ Benchmark */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs overflow-hidden">
        <CardHeader className="border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-5 sm:p-7 flex flex-row items-center gap-3.5 sm:gap-4">
          <div className="flex size-11 sm:size-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-primary border border-indigo-100/80 dark:border-primary/20 shrink-0">
            <Layers className="h-5 w-5 sm:h-6 sm:w-6 stroke-[1.8]" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold font-headline text-foreground">
              ১. শ্রেণি, বিষয় ও ডেটা সোর্স কনফিগারেশন
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              যেসব প্রশ্নে বিষয় বা অধ্যায় আইডি নেই, সেগুলোর জন্য ডিফল্ট তথ্য ও সোর্স নির্বাচন করে ফাইল আপলোড বা পেস্ট করুন।
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Hierarchy Dropdowns: Strict 4-Column Setup Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Academic Class */}
            <div className="space-y-2">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                শ্রেণি (Academic Class)
              </Label>
              <Select
                value={selectedAcademicClassId || "all"}
                onValueChange={handleAcademicClassChange}
              >
                <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between">
                  <SelectValue placeholder="সব শ্রেণি..." />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg">
                  <SelectItem value="all">সব শ্রেণি (All Classes)</SelectItem>
                  {academicClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.nameBn || cls.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Default Subject */}
            <div className="space-y-2">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                ডিফল্ট বিষয় (Subject)
              </Label>
              <Select
                value={selectedSubjectId}
                onValueChange={handleSubjectChange}
              >
                <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between">
                  <SelectValue placeholder="ডিফল্ট বিষয় নির্বাচন করুন..." />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg">
                  {subjects.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.nameBn || sub.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Default Chapter */}
            <div className="space-y-2">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                ডিফল্ট অধ্যায় (Chapter)
              </Label>
              <Select
                disabled={!selectedSubjectId}
                value={selectedChapterId}
                onValueChange={handleChapterChange}
              >
                <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between disabled:opacity-50">
                  <SelectValue
                    placeholder={
                      selectedSubjectId
                        ? "ডিফল্ট অধ্যায় নির্বাচন করুন..."
                        : "প্রথমে বিষয় নির্বাচন করুন"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg">
                  {chapters.map((ch) => (
                    <SelectItem key={ch.id} value={ch.id}>
                      {ch.nameBn || ch.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Default Source */}
            <div className="space-y-2">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                ডিফল্ট উৎস (Source)
              </Label>
              <Select
                value={selectedSource}
                onValueChange={(val) => {
                  setSelectedSource(val)
                  if (jsonText) {
                    validateAndParseJson(
                      jsonText,
                      selectedAcademicClassId,
                      selectedSubjectId,
                      selectedChapterId,
                      val
                    )
                  }
                }}
              >
                <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between">
                  <SelectValue placeholder="উৎস নির্বাচন করুন...">
                    {selectedSource}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg">
                  {SHORT_QUESTION_SOURCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Warning Banner if Hierarchy not chosen */}
          {(!selectedAcademicClassId || !selectedSubjectId || !selectedChapterId) && (
            <div className="flex items-center gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/70 dark:bg-amber-950/20 p-4 text-amber-800 dark:text-amber-400 text-xs font-medium">
              <AlertTriangle className="size-4 text-amber-600 shrink-0" />
              <span>
                JSON ফাইল আপলোড বা টেক্সট ইনপুট আনলক করতে অনুগ্রহ করে উপরে ডিফল্ট শ্রেণি, বিষয় ও অধ্যায় নির্বাচন করুন।
              </span>
            </div>
          )}

          {/* File Upload Section */}
          <div className="border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
            <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              JSON ফাইল আপলোড করুন
            </Label>
            <input
              type="file"
              accept=".json,application/json"
              disabled={!selectedAcademicClassId || !selectedSubjectId || !selectedChapterId}
              onChange={handleFileUpload}
              className="block w-full text-sm text-foreground file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 dark:file:bg-primary/10 file:text-indigo-700 dark:file:text-primary hover:file:bg-indigo-100 dark:hover:file:bg-primary/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed file:disabled:pointer-events-none"
            />
          </div>

          {/* Or Paste JSON Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                অথবা সরাসরি JSON টেক্সট পেস্ট করুন
              </Label>
              {jsonText.trim() && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAutoFixJson}
                  className="rounded-xl border border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-primary/20 dark:text-primary text-xs font-bold h-8 px-3 cursor-pointer font-headline"
                >
                  <Wand2 className="size-3.5 mr-1" />
                  স্বয়ংক্রিয় সিনট্যাক্স ফিক্স ও ফরম্যাট
                </Button>
              )}
            </div>
            <Textarea
              rows={5}
              disabled={!selectedAcademicClassId || !selectedSubjectId || !selectedChapterId}
              placeholder={
                !selectedAcademicClassId || !selectedSubjectId || !selectedChapterId
                  ? "প্রথমে উপরে শ্রেণি, বিষয় ও অধ্যায় নির্বাচন করুন..."
                  : "এখানে JSON অ্যারে পেস্ট করুন..."
              }
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] p-3.5 font-mono text-xs text-foreground focus-visible:ring-2 focus-visible:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Validation Diagnostics / Error Locator */}
          {parseError && (
            <div className="space-y-3 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 p-5 text-rose-700 dark:text-rose-400">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="size-5 text-rose-600 shrink-0" />
                  <p className="font-bold text-sm font-headline">JSON সিনট্যাক্স ডায়াগনস্টিক ত্রুটি</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAutoFixJson}
                  className="rounded-xl bg-rose-600 text-white hover:bg-rose-700 font-bold text-xs h-8 px-3 cursor-pointer shadow-xs w-full sm:w-auto justify-center font-headline"
                >
                  <Wand2 className="size-3.5 mr-1" />
                  স্বয়ংক্রিয় ফিক্স প্রয়োগ করুন
                </Button>
              </div>

              <p className="font-mono text-xs leading-relaxed bg-white/90 dark:bg-card p-3 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400">
                {parseError}
              </p>

              {/* Code Snippet Error Pointer */}
              {errorContext && errorContext.linesContext.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-rose-700/80 font-headline">
                    ত্রুটির সম্ভাব্য অবস্থান (লাইন {toBengaliDigits(errorContext.line)}
                    {errorContext.col > 0 ? `, কলাম ${toBengaliDigits(errorContext.col)}` : ""}):
                  </p>
                  <div className="overflow-x-auto rounded-xl bg-slate-900 p-3.5 font-mono text-xs text-slate-200">
                    {errorContext.linesContext.map((l) => (
                      <div
                        key={l.num}
                        className={cn(
                          "flex items-center gap-3 px-2 py-0.5 rounded-lg",
                          l.isError && "bg-rose-950/80 text-white font-bold border-l-4 border-rose-500"
                        )}
                      >
                        <span className="w-8 shrink-0 text-right text-slate-500 select-none">
                          {toBengaliDigits(l.num)}
                        </span>
                        <span className="whitespace-pre">{l.content}</span>
                        {l.isError && (
                          <span className="ml-auto text-[10px] uppercase font-bold tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded-md shrink-0">
                            এখানে ত্রুটি
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Validation Success Banner matching MCQ Benchmark */}
          {!parseError && parsedItems.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/20 p-4 text-emerald-800 dark:text-emerald-300 text-sm">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold font-headline">JSON যাচাইকরণ সফল হয়েছে!</p>
                  <p className="text-xs text-emerald-700/80 dark:text-emerald-400">
                    মোট {toBengaliDigits(parsedItems.length)}টি সংক্ষিপ্ত প্রশ্ন সফলভাবে পার্স করা হয়েছে। নিচের প্রিভিউ কার্ডে পর্যালোচনা ও সম্পাদনা করুন।
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddNewQuestionCard}
                className="rounded-xl bg-white dark:bg-card border-emerald-300 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 font-bold text-xs h-9 px-4 cursor-pointer shrink-0 w-full sm:w-auto justify-center font-headline"
              >
                <Plus className="size-3.5 mr-1" />
                নতুন প্রশ্ন কার্ড যোগ করুন
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2 Section: Parsed Questions Review & Edit Cards matching MCQ Benchmark */}
      {parsedItems.length > 0 && (
        <div className="space-y-6 pt-2">
          {/* Section Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-1">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-primary border border-indigo-100/80 shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-headline text-foreground flex items-center gap-2">
                  <span>২. প্রশ্ন প্রিভিউ ও সম্পাদনা</span>
                  <Badge variant="secondary" className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono">
                    {toBengaliDigits(parsedItems.length)}টি প্রশ্ন
                  </Badge>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  প্রতিটি প্রশ্নের বিবরণ, রেফারেন্স ও মেটাডাটা চেক করুন এবং প্রয়োজনে সরাসরি সংশোধন করুন।
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => toggleAllExpanded(true)}
                className="rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 text-xs font-semibold h-9 px-3 cursor-pointer font-headline"
              >
                <Maximize2 className="size-3.5 mr-1" />
                সব প্রসারিত করুন
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => toggleAllExpanded(false)}
                className="rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 text-xs font-semibold h-9 px-3 cursor-pointer font-headline"
              >
                <Minimize2 className="size-3.5 mr-1" />
                সব সংকুচিত করুন
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddNewQuestionCard}
                className="rounded-xl border border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-primary/20 dark:text-primary font-bold text-xs h-9 px-3.5 cursor-pointer font-headline"
              >
                <Plus className="size-3.5 mr-1" />
                প্রশ্ন যোগ করুন
              </Button>
            </div>
          </div>

          {/* List of Parsed Cards */}
          <div className="space-y-6">
            {parsedItems.map((item, idx) => (
              <ParsedShortQuestionCard
                key={idx}
                index={idx}
                item={item}
                isExpanded={Boolean(expandedCards[idx])}
                onToggleExpand={() =>
                  setExpandedCards((prev) => ({
                    ...prev,
                    [idx]: !prev[idx],
                  }))
                }
                onChange={(updated) => handleUpdateParsedItem(idx, updated)}
                onDelete={() => handleDeleteParsedItem(idx)}
                onDuplicate={() => handleDuplicateParsedItem(idx)}
              />
            ))}
          </div>

          {/* Form Actions Footer matching MCQ Benchmark */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:items-center sm:justify-between border-t border-slate-200/80 dark:border-white/[0.08] pt-6 sm:pt-8 mt-6">
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold px-6 h-11 text-sm transition-all active:scale-95 cursor-pointer justify-center font-headline"
            >
              <Link href="/short-questions" prefetch={true}>
                বাতিল
              </Link>
            </Button>
            <Button
              type="button"
              disabled={
                parsedItems.length === 0 ||
                Boolean(parseError) ||
                importMutation.isPending
              }
              onClick={handleImport}
              className="w-full sm:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 h-11 text-sm shadow-sm shadow-indigo-200 dark:shadow-none transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 font-headline"
            >
              {importMutation.isPending ? (
                <Loader2 className="size-4 animate-spin shrink-0" />
              ) : (
                <Upload className="size-4 shrink-0" />
              )}
              <span>
                {importMutation.isPending
                  ? "ইম্পোর্ট করা হচ্ছে..."
                  : `মোট ${toBengaliDigits(parsedItems.length)}টি প্রশ্ন ইম্পোর্ট করুন`}
              </span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
