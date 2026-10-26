"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@workspace/ui/components/sonner"
import {
  useImportPbqs,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-pbq"
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
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  Wand2,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Code,
  FileCode,
  Upload,
  ArrowLeft,
  Sparkles,
  Layers,
  AlertCircle,
  Loader2,
  Maximize2,
  Minimize2,
  BookOpen,
  Calendar,
} from "lucide-react"
import { QUESTION_DIFFICULTY, QUESTION_DIFFICULTY_OPTIONS, toBengaliDigits } from "@workspace/utils"
import { PBQ_SOURCE_OPTIONS, DEFAULT_SOURCE } from "../constants"
import { PageHeader } from "@/components/shared/page-header"

const sampleJsonTemplate = `[
  {
    "context": "উদ্দীপক: নিচের অনুচ্ছেদটি পড় এবং প্রশ্নগুলোর উত্তর দাও:\\nএকদিন এক রাখাল বালক মাঠে গরু চড়াচ্ছিল। সে প্রায়ই বাঘ বাঘ বলে চিৎকার করে গ্রামের মানুষদের বিভ্রান্ত করত। একদিন সত্যি সত্যিই বাঘ এলে তার চিৎকারে কেউ এগিয়ে আসেনি।",
    "questionA": "রাখাল বালক মাঠে কী করছিল?",
    "questionB": "রাখাল কেন বাঘ বাঘ বলে চিৎকার করত?",
    "questionC": "গ্রামবাসীদের প্রতিক্রিয়ার বর্ণনা দাও।",
    "questionD": "রাখালের এই মিথ্যার পরিণতি কী হয়েছিল?",
    "questionE": "এই গল্প থেকে প্রাপ্ত মূল শিক্ষা নিজের ভাষায় বুঝিয়ে লেখ।",
    "difficulty": "MEDIUM",
    "source": "সহায়ক সংকলন",
    "session": "2024",
    "reference": ["ঢাকা বোর্ড ২০২৪", "পাঠ্যবই অনুচ্ছেদ ৩"],
    "marks": {
      "a": 2,
      "b": 2,
      "c": 2,
      "d": 2,
      "e": 2
    }
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

  // 4. Fix known LaTeX commands starting with characters that are valid JSON escapes (b, f, n, r, t)
  cleaned = cleaned.replace(
    /(?<!\\)\\(rightarrow|right|rho|rangle|Rightarrow|roots|rceil|rfloor|times|theta|text|tan|tau|tilde|to|therefore|triangle|tanh|top|tiny|textbf|textit|texttt|tfrac|tag|frac|forall|flat|beta|begin|bar|mathbf|binom|big|Big|bullet|bot|boldsymbol|bmatrix|bmod|neq|nabla|nu|not|null|neg|natural|ni|norm)\b/g,
    "\\\\$1"
  )

  // 5. Fix any unescaped backslashes that are not valid JSON escape sequences
  cleaned = cleaned.replace(/(?<!\\)\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, "\\\\")

  // 6. Remove trailing commas in objects & arrays
  cleaned = cleaned.replace(/,\s*([\]}])/g, "$1")

  // 7. Wrap single object in array if not already an array
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

interface ParsedPbqCardProps {
  index: number
  item: any
  defaultSource: string
  isExpanded: boolean
  onToggleExpand: () => void
  onChange: (updatedItem: any) => void
  onDelete: () => void
  onDuplicate: () => void
}

/**
 * Parsed PBQ Card matching the visual benchmark of MCQ and CreatePbqView
 */
function ParsedPbqCard({
  index,
  item,
  defaultSource,
  isExpanded,
  onToggleExpand,
  onChange,
  onDelete,
  onDuplicate,
}: ParsedPbqCardProps) {
  const marksA = Number(item.marks?.a) || 2
  const marksB = Number(item.marks?.b) || 2
  const marksC = Number(item.marks?.c) || 2
  const marksD = Number(item.marks?.d) || 2
  const marksE = Number(item.marks?.e) || 2
  const totalMarks = marksA + marksB + marksC + marksD + marksE

  const hasStimulus = Boolean(item.context && String(item.context).trim().length > 0)
  const hasQuestionA = Boolean(item.questionA && String(item.questionA).trim().length > 0)

  const activeSource = item.source || defaultSource || DEFAULT_SOURCE
  const activeSession = item.session || ""
  const referenceString = Array.isArray(item.reference) ? item.reference.join(", ") : ""

  const handleUpdateMarks = (part: "a" | "b" | "c" | "d" | "e", val: string) => {
    const num = Number(val) || 0
    onChange({
      ...item,
      marks: {
        ...(item.marks || {}),
        [part]: num,
      },
    })
  }

  return (
    <Card className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs overflow-hidden transition-all hover:shadow-md">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-4 sm:p-5">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-primary font-bold text-xs sm:text-sm border border-indigo-100 dark:border-primary/20 shrink-0 font-solaiman">
            #{toBengaliDigits(index + 1)}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm sm:text-base font-bold font-headline text-foreground truncate">
              {hasStimulus
                ? item.context
                : hasQuestionA
                ? `ক. ${item.questionA}`
                : `অনুচ্ছেদভিত্তিক প্রশ্ন #${toBengaliDigits(index + 1)}`}
            </h4>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[11px] text-muted-foreground font-body">
                উপ-প্রশ্ন: ক, খ, গ, ঘ, ঙ | মোট নম্বর: {toBengaliDigits(totalMarks)}
              </span>
              <span className="px-2 py-0.5 bg-indigo-50 dark:bg-primary/10 text-indigo-700 dark:text-primary rounded-lg text-[11px] font-semibold border border-indigo-100 dark:border-primary/20 flex items-center gap-1 font-body">
                <BookOpen className="w-3 h-3" />
                <span>
                  {activeSource}
                  {activeSession ? ` (${toBengaliDigits(activeSession)})` : ""}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDuplicate}
            className="h-8 px-2.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
            title="ডুপ্লিকেট করুন"
          >
            <Copy className="w-3.5 h-3.5 mr-1" />
            <span>কপি</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 px-2.5 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
            title="মুছে ফেলুন"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            <span>মুছুন</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggleExpand}
            className="h-8 px-2.5 rounded-lg border-slate-200 dark:border-white/[0.08] text-xs font-semibold cursor-pointer gap-1"
          >
            <span>{isExpanded ? "সংক্ষেপ" : "সম্পাদনা"}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* Card Body */}
      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Quick Summary View (Collapsed) */}
        {!isExpanded && (
          <div className="space-y-3">
            {hasStimulus && (
              <div className="text-xs text-muted-foreground line-clamp-2 bg-slate-50/50 dark:bg-white/[0.02] p-3 rounded-xl border border-slate-200/60 dark:border-white/[0.04]">
                <span className="font-bold text-foreground mr-1.5 font-headline">উদ্দীপক:</span>
                <RenderMath text={item.context} isMath={true} />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="line-clamp-1 text-slate-700 dark:text-slate-300">
                <span className="font-bold mr-1 text-indigo-600 dark:text-primary">ক.</span>
                {item.questionA || <span className="text-rose-400 italic">প্রশ্ন অনুপস্থিত</span>}
              </div>
              <div className="line-clamp-1 text-slate-700 dark:text-slate-300">
                <span className="font-bold mr-1 text-indigo-600 dark:text-primary">খ.</span>
                {item.questionB || <span className="text-rose-400 italic">প্রশ্ন অনুপস্থিত</span>}
              </div>
              <div className="line-clamp-1 text-slate-700 dark:text-slate-300">
                <span className="font-bold mr-1 text-indigo-600 dark:text-primary">গ.</span>
                {item.questionC || <span className="text-rose-400 italic">প্রশ্ন অনুপস্থিত</span>}
              </div>
              <div className="line-clamp-1 text-slate-700 dark:text-slate-300">
                <span className="font-bold mr-1 text-indigo-600 dark:text-primary">ঘ.</span>
                {item.questionD || <span className="text-rose-400 italic">প্রশ্ন অনুপস্থিত</span>}
              </div>
              <div className="line-clamp-1 text-slate-700 dark:text-slate-300 sm:col-span-2">
                <span className="font-bold mr-1 text-indigo-600 dark:text-primary">ঙ.</span>
                {item.questionE || <span className="text-rose-400 italic">প্রশ্ন অনুপস্থিত</span>}
              </div>
            </div>
          </div>
        )}

        {/* Detailed Form View (Expanded) */}
        {isExpanded && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Stimulus Context */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                উদ্দীপক / অনুচ্ছেদ (Passage Context) <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                rows={4}
                value={item.context || ""}
                onChange={(e) => onChange({ ...item, context: e.target.value })}
                placeholder="উদ্দীপক লিখুন..."
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 p-3"
              />
            </div>

            {/* 5 Sub-Questions Stems: ক, খ, গ, ঘ, ঙ */}
            <div className="space-y-3 border-t border-slate-200/80 dark:border-white/[0.08] pt-4">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                উপ-প্রশ্ন ও নম্বর বণ্টন
              </Label>

              {/* Question A */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                <div className="md:col-span-3">
                  <Input
                    type="text"
                    value={item.questionA || ""}
                    onChange={(e) => onChange({ ...item, questionA: e.target.value })}
                    placeholder="ক. প্রথম উপ-প্রশ্ন..."
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] h-10 px-3 text-sm"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    value={item.marks?.a ?? "2"}
                    onChange={(e) => handleUpdateMarks("a", e.target.value)}
                    placeholder="নম্বর (ক)"
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] h-10 px-3 text-sm"
                  />
                </div>
              </div>

              {/* Question B */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                <div className="md:col-span-3">
                  <Input
                    type="text"
                    value={item.questionB || ""}
                    onChange={(e) => onChange({ ...item, questionB: e.target.value })}
                    placeholder="খ. দ্বিতীয় উপ-প্রশ্ন..."
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] h-10 px-3 text-sm"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    value={item.marks?.b ?? "2"}
                    onChange={(e) => handleUpdateMarks("b", e.target.value)}
                    placeholder="নম্বর (খ)"
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] h-10 px-3 text-sm"
                  />
                </div>
              </div>

              {/* Question C */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                <div className="md:col-span-3">
                  <Input
                    type="text"
                    value={item.questionC || ""}
                    onChange={(e) => onChange({ ...item, questionC: e.target.value })}
                    placeholder="গ. তৃতীয় উপ-প্রশ্ন..."
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] h-10 px-3 text-sm"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    value={item.marks?.c ?? "2"}
                    onChange={(e) => handleUpdateMarks("c", e.target.value)}
                    placeholder="নম্বর (গ)"
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] h-10 px-3 text-sm"
                  />
                </div>
              </div>

              {/* Question D */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                <div className="md:col-span-3">
                  <Input
                    type="text"
                    value={item.questionD || ""}
                    onChange={(e) => onChange({ ...item, questionD: e.target.value })}
                    placeholder="ঘ. চতুর্থ উপ-প্রশ্ন..."
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] h-10 px-3 text-sm"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    value={item.marks?.d ?? "2"}
                    onChange={(e) => handleUpdateMarks("d", e.target.value)}
                    placeholder="নম্বর (ঘ)"
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] h-10 px-3 text-sm"
                  />
                </div>
              </div>

              {/* Question E */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                <div className="md:col-span-3">
                  <Input
                    type="text"
                    value={item.questionE || ""}
                    onChange={(e) => onChange({ ...item, questionE: e.target.value })}
                    placeholder="ঙ. পঞ্চম উপ-প্রশ্ন..."
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] h-10 px-3 text-sm"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    value={item.marks?.e ?? "2"}
                    onChange={(e) => handleUpdateMarks("e", e.target.value)}
                    placeholder="নম্বর (ঙ)"
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] h-10 px-3 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Metadata (Difficulty, Source, Reference) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-200/80 dark:border-white/[0.08] pt-4">
              {/* Difficulty */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">কাঠিন্য (Difficulty)</Label>
                <Select
                  value={item.difficulty || "MEDIUM"}
                  onValueChange={(val) => onChange({ ...item, difficulty: val })}
                >
                  <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] h-10 px-3 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] rounded-xl font-body">
                    {QUESTION_DIFFICULTY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Source */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">উৎস (Source)</Label>
                <Select
                  value={item.source || defaultSource || DEFAULT_SOURCE}
                  onValueChange={(val) => onChange({ ...item, source: val })}
                >
                  <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] h-10 px-3 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] rounded-xl font-body">
                    {PBQ_SOURCE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reference */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">রেফারেন্স / ট্যাগ</Label>
                <Input
                  type="text"
                  value={referenceString}
                  onChange={(e) => {
                    const refs = e.target.value
                      .split(",")
                      .map((r) => r.trim())
                      .filter(Boolean)
                    onChange({ ...item, reference: refs })
                  }}
                  placeholder="কমা দিয়ে আলাদা করুন..."
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] h-10 px-3 text-xs font-body"
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ImportPbqView() {
  const router = useRouter()
  const importMutation = useImportPbqs()

  const [jsonInput, setJsonInput] = useState<string>("")
  const [parsedItems, setParsedItems] = useState<any[]>([])
  const [jsonError, setJsonError] = useState<{ message: string; details?: any } | null>(null)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

  // Scope & Source Setup state
  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("")
  const [selectedChapterId, setSelectedChapterId] = useState<string>("")
  const [selectedSource, setSelectedSource] = useState<string>(DEFAULT_SOURCE)

  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedClassId ? { academicClassId: selectedClassId } : undefined
  )
  const { data: chapters = [] } = useChaptersForSelection(
    selectedSubjectId ? { subjectId: selectedSubjectId } : undefined
  )

  // Auto-parse JSON on input change
  useEffect(() => {
    if (!jsonInput.trim()) {
      setParsedItems([])
      setJsonError(null)
      return
    }

    try {
      const repaired = repairJsonSyntax(jsonInput)
      const parsed = JSON.parse(repaired)

      if (!Array.isArray(parsed)) {
        setJsonError({
          message: "JSON ইনপুটটি একটি অ্যারে (Array) হতে হবে, যেমন: [{ ... }]",
        })
        setParsedItems([])
        return
      }

      setParsedItems(parsed)
      setJsonError(null)
    } catch (err: any) {
      const diagnostics = findJsonErrorPosition(jsonInput, err.message)
      setJsonError({
        message: err.message || "JSON ফরম্যাটে ত্রুটি রয়েছে",
        details: diagnostics,
      })
    }
  }, [jsonInput])

  const handleFixJsonSyntax = () => {
    if (!jsonInput.trim()) return
    const repaired = repairJsonSyntax(jsonInput)
    setJsonInput(repaired)
    toast.success("অটোমেটিক সিনট্যাক্স মেরামত সম্পন্ন হয়েছে।")
  }

  const handleCopyTemplate = () => {
    setJsonInput(sampleJsonTemplate)
    toast.success("নমুনা JSON টেমপ্লেট ইনপুটে পেস্ট করা হয়েছে।")
  }

  const handleUpdateItem = (index: number, updated: any) => {
    setParsedItems((prev) => {
      const copy = [...prev]
      copy[index] = updated
      return copy
    })
  }

  const handleDeleteItem = (index: number) => {
    setParsedItems((prev) => prev.filter((_, i) => i !== index))
    toast.success("প্রশ্নটি তালিকা থেকে মুছে ফেলা হয়েছে।")
  }

  const handleDuplicateItem = (index: number) => {
    setParsedItems((prev) => {
      const copy = [...prev]
      const dup = JSON.parse(JSON.stringify(copy[index]))
      copy.splice(index + 1, 0, dup)
      return copy
    })
    toast.success("প্রশ্নটি ডুপ্লিকেট করা হয়েছে।")
  }

  const isSubmitting = importMutation.isPending

  const handleImportSubmit = async () => {
    if (!selectedSubjectId) {
      toast.error("অনুগ্রহ করে একটি বিষয় (Subject) নির্বাচন করুন।")
      return
    }

    if (parsedItems.length === 0) {
      toast.error("ইমপোর্ট করার জন্য কোনো প্রশ্ন পাওয়া যায়নি।")
      return
    }

    // Validate items
    for (let i = 0; i < parsedItems.length; i++) {
      const item = parsedItems[i]
      if (!item.context || !String(item.context).trim()) {
        toast.error(`প্রশ্ন #${toBengaliDigits(i + 1)} এর উদ্দীপক অনুপস্থিত।`)
        setExpandedIndex(i)
        return
      }
      if (!item.questionA || !String(item.questionA).trim()) {
        toast.error(`প্রশ্ন #${toBengaliDigits(i + 1)} এর ক উপ-প্রশ্ন অনুপস্থিত।`)
        setExpandedIndex(i)
        return
      }
      if (!item.questionB || !String(item.questionB).trim()) {
        toast.error(`প্রশ্ন #${toBengaliDigits(i + 1)} এর খ উপ-প্রশ্ন অনুপস্থিত।`)
        setExpandedIndex(i)
        return
      }
      if (!item.questionC || !String(item.questionC).trim()) {
        toast.error(`প্রশ্ন #${toBengaliDigits(i + 1)} এর গ উপ-প্রশ্ন অনুপস্থিত।`)
        setExpandedIndex(i)
        return
      }
      if (!item.questionD || !String(item.questionD).trim()) {
        toast.error(`প্রশ্ন #${toBengaliDigits(i + 1)} এর ঘ উপ-প্রশ্ন অনুপস্থিত।`)
        setExpandedIndex(i)
        return
      }
      if (!item.questionE || !String(item.questionE).trim()) {
        toast.error(`প্রশ্ন #${toBengaliDigits(i + 1)} এর ঙ উপ-প্রশ্ন অনুপস্থিত।`)
        setExpandedIndex(i)
        return
      }
    }

    try {
      const formattedPbqs = parsedItems.map((item) => {
        const marksObj = {
          a: Number(item.marks?.a) || 2,
          b: Number(item.marks?.b) || 2,
          c: Number(item.marks?.c) || 2,
          d: Number(item.marks?.d) || 2,
          e: Number(item.marks?.e) || 2,
        }

        const itemSource = item.source ? String(item.source).trim() : (selectedSource || DEFAULT_SOURCE)
        const itemSession = item.session
          ? String(item.session).trim()
          : item.year
          ? String(item.year).trim()
          : null

        const parsedYear = item.year && !isNaN(Number(item.year))
          ? Number(item.year)
          : itemSession && !isNaN(Number(itemSession))
          ? Number(itemSession)
          : null

        return {
          subjectId: selectedSubjectId,
          chapterId: selectedChapterId && selectedChapterId !== "none" ? selectedChapterId : null,
          context: String(item.context).trim(),
          questionA: String(item.questionA).trim(),
          questionB: String(item.questionB).trim(),
          questionC: String(item.questionC).trim(),
          questionD: String(item.questionD).trim(),
          questionE: String(item.questionE).trim(),
          difficulty: (item.difficulty as any) || QUESTION_DIFFICULTY.MEDIUM,
          source: itemSource,
          session: itemSession,
          year: parsedYear,
          reference: Array.isArray(item.reference) ? item.reference : [],
          marks: marksObj,
          isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
        }
      })

      const res = await importMutation.mutateAsync({
        pbqs: formattedPbqs as any,
      })

      toast.success(`সফলভাবে ${toBengaliDigits(res.importedCount)}টি অনুচ্ছেদভিত্তিক প্রশ্ন ইমপোর্ট করা হয়েছে।`)
      setTimeout(() => {
        router.push("/pbqs")
      }, 800)
    } catch (err: any) {
      toast.error(err.message || "PBQ ইমপোর্ট করা সম্ভব হয়নি")
    }
  }

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200 pb-12">
      {/* Shared Page Header */}
      <PageHeader
        title="PBQ বাল্ক JSON ইমপোর্ট"
        description="একসাথে একাধিক অনুচ্ছেদভিত্তিক প্রশ্ন JSON ফরম্যাটে আপলোড, যাচাই ও উৎস নির্ধারণ করে প্রশ্ন ব্যাংকে যোগ করুন।"
        icon={Upload}
        badge={{ label: "PBQ বাল্ক ইমপোর্ট", variant: "indigo" }}
        breadcrumbs={[
          { label: "PBQ তালিকা", href: "/pbqs" },
          { label: "JSON ইমপোর্ট" },
        ]}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Link href="/pbqs" prefetch={true}>
            <ArrowLeft className="w-4 h-4" />
            <span>তালিকায় ফিরে যান</span>
          </Link>
        </Button>
      </PageHeader>

      {/* 1. Academic Hierarchy & Source Scope Bar */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs p-5 sm:p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-primary font-headline mb-4 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4" />
          ইমপোর্টের গন্তব্য ও ডিফল্ট উৎস নির্ধারণ (Target Scope & Source Setup)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Class */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              শ্রেণি (Class) <span className="text-rose-500">*</span>
            </Label>
            <Select
              key={`class-select-${selectedClassId}-${academicClasses.length}`}
              value={selectedClassId}
              onValueChange={(val) => {
                setSelectedClassId(val)
                setSelectedSubjectId("")
                setSelectedChapterId("")
              }}
            >
              <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] h-11 px-3.5 text-sm">
                <SelectValue placeholder="শ্রেণি নির্বাচন করুন..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] rounded-xl max-h-60 font-body">
                {academicClasses.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.nameBn || cls.nameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              বিষয় (Subject) <span className="text-rose-500">*</span>
            </Label>
            <Select
              key={`subject-select-${selectedSubjectId}-${subjects.length}`}
              disabled={!selectedClassId}
              value={selectedSubjectId}
              onValueChange={(val) => {
                setSelectedSubjectId(val)
                setSelectedChapterId("")
              }}
            >
              <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] h-11 px-3.5 text-sm disabled:opacity-50">
                <SelectValue
                  placeholder={
                    selectedClassId ? "বিষয় নির্বাচন করুন..." : "প্রথমে শ্রেণি নির্বাচন করুন"
                  }
                />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] rounded-xl max-h-60 font-body">
                {subjects.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.nameBn || sub.nameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Chapter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              ডিফল্ট অধ্যায় (Chapter)
            </Label>
            <Select
              key={`chapter-select-${selectedChapterId}-${chapters.length}`}
              disabled={!selectedSubjectId}
              value={selectedChapterId}
              onValueChange={setSelectedChapterId}
            >
              <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] h-11 px-3.5 text-sm disabled:opacity-50">
                <SelectValue
                  placeholder={
                    selectedSubjectId ? "অধ্যায় নির্বাচন করুন..." : "প্রথমে বিষয় নির্বাচন করুন"
                  }
                />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] rounded-xl max-h-60 font-body">
                <SelectItem value="none">কোনো নির্দিষ্ট অধ্যায় নয় (General)</SelectItem>
                {chapters.map((ch) => (
                  <SelectItem key={ch.id} value={ch.id}>
                    {ch.nameBn || ch.nameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Default Source */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              ডিফল্ট উৎস (Default Source)
            </Label>
            <Select
              key={`default-source-select-${selectedSource}`}
              value={selectedSource}
              onValueChange={setSelectedSource}
            >
              <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] h-11 px-3.5 text-sm font-body">
                <SelectValue placeholder="উৎস নির্বাচন করুন...">
                  {selectedSource}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] rounded-xl max-h-60 font-body">
                {PBQ_SOURCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* 2. JSON Input & Editor Card */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-600 dark:text-primary" />
            <h3 className="text-sm sm:text-base font-bold font-headline text-foreground">
              JSON ইনপুট এডিটর
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyTemplate}
              className="h-8 px-3 rounded-lg border-slate-200 dark:border-white/[0.08] text-xs font-semibold gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>নমুনা কোড কপি করুন</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFixJsonSyntax}
              className="h-8 px-3 rounded-lg border-indigo-200 dark:border-primary/30 text-indigo-700 dark:text-primary text-xs font-semibold gap-1.5 hover:bg-indigo-50 dark:hover:bg-primary/10 cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>অটো সিনট্যাক্স ফিক্স</span>
            </Button>
          </div>
        </div>

        <CardContent className="p-4 sm:p-6 space-y-4">
          <Textarea
            rows={10}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="এখানে JSON অ্যারে পেস্ট করুন বা উপরের 'নমুনা কোড কপি করুন' বাটনে ক্লিক করুন..."
            className="w-full font-mono text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-4 leading-relaxed"
          />

          {/* Error Banner with Line Diagnostics */}
          {jsonError && (
            <div className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 p-4 text-xs font-body text-rose-700 dark:text-rose-400 space-y-2">
              <div className="flex items-center gap-2 font-bold font-headline">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>JSON সিনট্যাক্স ত্রুটি: {jsonError.message}</span>
              </div>
              {jsonError.details && (
                <div className="bg-card/80 p-3 rounded-lg border border-rose-200/60 dark:border-rose-900/30 font-mono text-[11px] space-y-1">
                  <p className="font-semibold text-rose-800 dark:text-rose-300">
                    লাইন {toBengaliDigits(jsonError.details.line)}, কলাম {toBengaliDigits(jsonError.details.col)} এর কাছাকাছি ত্রুটি:
                  </p>
                  {jsonError.details.linesContext.map((lc: any) => (
                    <div
                      key={lc.num}
                      className={cn(
                        "px-2 py-0.5 rounded",
                        lc.isError && "bg-rose-100 dark:bg-rose-900/40 font-bold text-rose-900 dark:text-rose-200"
                      )}
                    >
                      <span className="text-muted-foreground mr-2">{lc.num}:</span>
                      <span>{lc.content}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Parsed Cards Preview Section */}
      {parsedItems.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 p-1">
            <div>
              <h3 className="text-base sm:text-lg font-bold font-headline text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>যাচাইকৃত প্রশ্নসমূহ ({toBengaliDigits(parsedItems.length)}টি প্রস্তুত)</span>
              </h3>
              <p className="text-xs text-muted-foreground font-body mt-0.5">
                প্রতিটি কার্ডে ক্লিক করে উদ্দীপক, উপ-প্রশ্ন, উৎস ও সেশন সরাসরি সম্পাদনা করতে পারেন।
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setExpandedIndex(expandedIndex === null ? 0 : null)}
                className="h-8 px-3 rounded-lg text-xs font-semibold cursor-pointer"
              >
                {expandedIndex === null ? "সব খুলুন" : "সব সংক্ষেপ করুন"}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {parsedItems.map((item, idx) => (
              <ParsedPbqCard
                key={idx}
                index={idx}
                item={item}
                defaultSource={selectedSource}
                isExpanded={expandedIndex === idx}
                onToggleExpand={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                onChange={(updated) => handleUpdateItem(idx, updated)}
                onDelete={() => handleDeleteItem(idx)}
                onDuplicate={() => handleDuplicateItem(idx)}
              />
            ))}
          </div>

          {/* Bottom Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 dark:border-white/[0.08] pt-6 mt-6">
            <p className="text-xs text-muted-foreground font-body">
              নির্বাচিত বিষয় ও উৎসে মোট {toBengaliDigits(parsedItems.length)}টি অনুচ্ছেদভিত্তিক প্রশ্ন যুক্ত হতে যাচ্ছে।
            </p>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                asChild
                variant="outline"
                className="flex-1 sm:flex-initial rounded-xl border border-slate-200 dark:border-white/[0.08] h-11 px-6 text-sm font-bold font-headline cursor-pointer"
              >
                <Link href="/pbqs" prefetch={true}>
                  বাতিল
                </Link>
              </Button>

              <Button
                type="button"
                disabled={isSubmitting || !selectedSubjectId}
                onClick={handleImportSubmit}
                className="flex-1 sm:flex-initial rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 px-8 text-sm gap-2 shadow-sm shadow-indigo-200 dark:shadow-none font-headline cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                ) : (
                  <Upload className="w-4 h-4 shrink-0" />
                )}
                <span>
                  {isSubmitting
                    ? "ইমপোর্ট করা হচ্ছে..."
                    : `সবগুলো ইমপোর্ট করুন (${toBengaliDigits(parsedItems.length)}টি)`}
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
