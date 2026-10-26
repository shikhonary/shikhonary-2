"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@workspace/ui/components/sonner"
import {
  useImportCs,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-cs"
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
  BookOpen,
  Clock,
  Loader2,
  Layers,
} from "lucide-react"
import { QUESTION_DIFFICULTY, QUESTION_DIFFICULTY_OPTIONS, toBengaliDigits } from "@workspace/utils"
import { CS_SOURCE_OPTIONS, DEFAULT_SOURCE } from "../constants"
import { PageHeader } from "@/components/shared/page-header"

const sampleJsonTemplate = `[
  {
    "questionA": "বল কাকে বলে?",
    "questionB": "নিউটনের গতিবিদ্যার ২য় সূত্রটি ব্যাখ্যা কর।",
    "difficulty": "MEDIUM",
    "source": "বোর্ড প্রশ্ন",
    "reference": ["ঢাকা বোর্ড ২০২৪"]
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

  // 4. Fix known LaTeX commands starting with characters that are valid JSON escapes
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

interface ParsedCsCardProps {
  index: number
  item: any
  questionTypes: any[]
  isExpanded: boolean
  onToggleExpand: () => void
  onChange: (updated: any) => void
  onDelete: () => void
  onDuplicate: () => void
}

function ParsedCsCard({
  index,
  item,
  questionTypes,
  isExpanded,
  onToggleExpand,
  onChange,
  onDelete,
  onDuplicate,
}: ParsedCsCardProps) {
  const hasQuestionA = Boolean(item.questionA && String(item.questionA).trim().length > 0)
  const hasQuestionB = Boolean(item.questionB && String(item.questionB).trim().length > 0)

  const referenceString = Array.isArray(item.reference) ? item.reference.join(", ") : ""

  const handleToggleDifficulty = () => {
    const difficulties = [
      QUESTION_DIFFICULTY.EASY,
      QUESTION_DIFFICULTY.MEDIUM,
      QUESTION_DIFFICULTY.HARD,
    ]
    const nextIdx = (difficulties.indexOf(item.difficulty || QUESTION_DIFFICULTY.MEDIUM) + 1) % difficulties.length
    onChange({
      ...item,
      difficulty: difficulties[nextIdx],
    })
  }

  const handleToggleActive = () => {
    onChange({
      ...item,
      isActive: item.isActive !== false ? false : true,
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

  return (
    <Card className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs overflow-hidden transition-all hover:shadow-md">
      {/* Header Bar matching Benchmark */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-4 sm:p-5">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-primary font-bold text-xs sm:text-sm border border-indigo-100 dark:border-primary/20 shrink-0 font-solaiman">
            #{toBengaliDigits(index + 1)}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm sm:text-base font-bold font-headline text-foreground truncate">
              {hasQuestionA ? `ক. ${item.questionA}` : `CS দৃশ্যপট প্রশ্ন #${toBengaliDigits(index + 1)}`}
            </h4>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[11px] text-muted-foreground font-body">
                উপ-প্রশ্ন: ক, খ | উৎস: {item.source || DEFAULT_SOURCE} {referenceString ? `| রেফারেন্স: ${referenceString}` : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Badges & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Source Badge */}
          {item.source && (
            <Badge
              variant="outline"
              className="px-2.5 py-0.5 text-[11px] font-bold rounded-lg font-body bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/40"
            >
              {item.source}
            </Badge>
          )}

          {/* Difficulty Badge */}
          <button
            type="button"
            onClick={handleToggleDifficulty}
            title="কাঠিন্যের মাত্রা পরিবর্তন করতে ক্লিক করুন"
            className="cursor-pointer"
          >
            <Badge
              variant="outline"
              className={cn(
                "px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-lg font-headline transition-opacity hover:opacity-80",
                item.difficulty === "EASY" &&
                  "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/60",
                (item.difficulty === "MEDIUM" || !item.difficulty) &&
                  "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200/60",
                item.difficulty === "HARD" &&
                  "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200/60"
              )}
            >
              {item.difficulty || "MEDIUM"}
            </Badge>
          </button>

          {/* Active Status Badge */}
          <button
            type="button"
            onClick={handleToggleActive}
            title="স্ট্যাটাস পরিবর্তন করতে ক্লিক করুন"
            className="cursor-pointer"
          >
            <Badge
              variant="outline"
              className={cn(
                "px-2 py-0.5 text-[11px] font-bold rounded-lg font-body transition-opacity hover:opacity-80",
                item.isActive !== false
                  ? "border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "border-slate-300 text-slate-500 bg-slate-50 dark:bg-white/[0.04]"
              )}
            >
              {item.isActive !== false ? "অ্যাক্টিভ" : "ইনঅ্যাক্টিভ"}
            </Badge>
          </button>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 ml-1 pl-1 border-l border-slate-200 dark:border-white/[0.08]">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onDuplicate}
              title="CS ডুপ্লিকেট করুন"
              className="size-8 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-primary/10 rounded-xl cursor-pointer"
            >
              <Copy className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onDelete}
              title="CS মুছে ফেলুন"
              className="size-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl cursor-pointer"
            >
              <Trash2 className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onToggleExpand}
              title={isExpanded ? "সংকুচিত করুন" : "প্রসারিত করে সম্পাদনা করুন"}
              className="size-8 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 text-foreground cursor-pointer shadow-none"
            >
              {isExpanded ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Collapsed State Summary Preview */}
      {!isExpanded && (
        <div className="p-4 sm:p-5 space-y-3 bg-card font-body text-xs text-foreground">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-slate-50/30 dark:bg-white/[0.01]">
              <span className="font-bold text-indigo-600 dark:text-primary font-headline mr-1.5">ক:</span>
              <RenderMath text={item.questionA || "(ক উপ-প্রশ্ন ফাঁকা)"} isMath={true} />
            </div>
            <div className="p-3 rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-slate-50/30 dark:bg-white/[0.01]">
              <span className="font-bold text-indigo-600 dark:text-primary font-headline mr-1.5">খ:</span>
              <RenderMath text={item.questionB || "(খ উপ-প্রশ্ন ফাঁকা)"} isMath={true} />
            </div>
          </div>
        </div>
      )}

      {/* Validation Warning Banner */}
      {(!hasQuestionA || !hasQuestionB) && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border-t border-b border-amber-200/60 dark:border-amber-800/40 px-5 py-2.5 text-xs text-amber-800 dark:text-amber-400 flex flex-wrap items-center justify-between gap-2 font-medium">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-600 shrink-0" />
            <span>দৃশ্যপট প্রশ্নের জন্য &apos;ক&apos; এবং &apos;খ&apos; উপ-প্রশ্ন থাকা আবশ্যক।</span>
          </div>
        </div>
      )}

      {/* Expanded Content - Inline Form Editing */}
      {isExpanded && (
        <CardContent className="p-5 sm:p-7 space-y-6 animate-in fade-in duration-150">
          <div className="space-y-4">
            {/* Question A Stem */}
            <div className="space-y-2">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                ক. উপ-প্রশ্ন (A) <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                rows={2}
                value={item.questionA || ""}
                onChange={(e) => onChange({ ...item, questionA: e.target.value })}
                placeholder="যেমন: বল কাকে বলে?"
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 p-3.5 font-body"
              />
            </div>

            {/* Question B Stem */}
            <div className="space-y-2">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                খ. উপ-প্রশ্ন (B) <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                rows={2}
                value={item.questionB || ""}
                onChange={(e) => onChange({ ...item, questionB: e.target.value })}
                placeholder="যেমন: নিউটনের গতিবিদ্যার ২য় সূত্রটি ব্যাখ্যা কর।"
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 p-3.5 font-body"
              />
            </div>
          </div>

          {/* Metadata Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-200/80 dark:border-white/[0.08] pt-5">
            {/* Difficulty Select */}
            <div className="space-y-2">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                কাঠিন্য (Difficulty)
              </Label>
              <Select
                value={item.difficulty || QUESTION_DIFFICULTY.MEDIUM}
                onValueChange={(val) => onChange({ ...item, difficulty: val })}
              >
                <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-xs h-10 px-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg font-body">
                  {QUESTION_DIFFICULTY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Source Select */}
            <div className="space-y-2">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                উৎস (Source)
              </Label>
              <Select
                value={item.source || DEFAULT_SOURCE}
                onValueChange={(val) => onChange({ ...item, source: val })}
              >
                <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-xs h-10 px-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg font-body">
                  {CS_SOURCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Question Type Template */}
            <div className="space-y-2">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                প্রশ্ন কাঠামো টেমপ্লেট
              </Label>
              <Select
                value={item.questionTypeId || "none"}
                onValueChange={(val) => onChange({ ...item, questionTypeId: val === "none" ? null : val })}
              >
                <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-xs h-10 px-3">
                  <SelectValue placeholder="টেমপ্লেট নির্বাচন করুন..." />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-60 font-body">
                  <SelectItem value="none">কোনোটি নয় (None)</SelectItem>
                  {questionTypes.map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.nameEn} ({t.label} - {t.mark} নম্বর)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* References */}
            <div className="space-y-2">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                রেফারেন্স ট্যাগ
              </Label>
              <Input
                type="text"
                value={referenceString}
                onChange={(e) => handleSaveReferences(e.target.value)}
                placeholder="যেমন: Dhaka Board 2024"
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-xs h-10 px-3 font-body"
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export function ImportCsView() {
  const router = useRouter()
  const importMutation = useImportCs()

  const [jsonText, setJsonText] = useState<string>("")
  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState<string>("")
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("")
  const [selectedChapterId, setSelectedChapterId] = useState<string>("")
  const [selectedSource, setSelectedSource] = useState<string>(DEFAULT_SOURCE)
  const [showSample, setShowSample] = useState<boolean>(false)
  const [parsedItems, setParsedItems] = useState<any[]>([])
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({})
  const [parseError, setParseError] = useState<string | null>(null)
  const [errorContext, setErrorContext] = useState<ReturnType<typeof findJsonErrorPosition>>(null)

  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedAcademicClassId ? { academicClassId: selectedAcademicClassId } : undefined
  )
  const { data: chapters = [] } = useChaptersForSelection(
    selectedSubjectId ? { subjectId: selectedSubjectId } : undefined
  )

  const { data: questionTypesData } = useQuestionTypesList({ limit: 100 })
  const questionTypes = questionTypesData?.questionTypes ?? []

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
          selectedSource
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
    overrideSource: string
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
      // Attempt silent auto-repair for common AI paste artifacts
      const repaired = repairJsonSyntax(text)
      if (repaired && repaired !== text) {
        try {
          rawData = JSON.parse(repaired)
          textToParse = repaired
          setJsonText(repaired)
          toast.success("JSON ফরম্যাট স্বয়ংক্রিয়ভাবে মেরামত করা হয়েছে!")
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
        setParseError("JSON অ্যারে খালি।")
        return
      }

      const validated: any[] = []
      const errors: string[] = []

      itemsArray.forEach((item: any, idx: number) => {
        const itemNum = idx + 1
        const subjectId = item.subjectId || overrideSubjectId
        const chapterId = item.chapterId || overrideChapterId

        if (!item.questionA || typeof item.questionA !== "string") {
          errors.push(`আইটেম #${itemNum}: 'questionA' (ক উপ-প্রশ্ন) অনুপস্থিত বা অবৈধ।`)
        }
        if (!item.questionB || typeof item.questionB !== "string") {
          errors.push(`আইটেম #${itemNum}: 'questionB' (খ উপ-প্রশ্ন) অনুপস্থিত বা অবৈধ।`)
        }
        if (!subjectId) {
          errors.push(`আইটেম #${itemNum}: 'subjectId' অনুপস্থিত। ডিফল্ট বিষয় নির্বাচন করুন।`)
        }
        if (!chapterId) {
          errors.push(`আইটেম #${itemNum}: 'chapterId' অনুপস্থিত। ডিফল্ট অধ্যায় নির্বাচন করুন।`)
        }

        validated.push({
          subjectId,
          chapterId,
          questionA: String(item.questionA || "").trim(),
          questionB: String(item.questionB || "").trim(),
          difficulty: item.difficulty || QUESTION_DIFFICULTY.MEDIUM,
          source: item.source ? String(item.source).trim() : overrideSource,
          session: item.session ? String(item.session).trim() : (item.year ? String(item.year) : null),
          reference: Array.isArray(item.reference) ? item.reference : [],
          questionTypeId: item.questionTypeId || null,
          isActive: item.isActive !== false,
        })
      })

      if (errors.length > 0) {
        setParseError(
          errors.slice(0, 5).join(" | ") +
            (errors.length > 5 ? ` (+${errors.length - 5}টি অতিরিক্ত ত্রুটি)` : "")
        )
      }

      setParsedItems(validated)
    } catch (err: any) {
      setParseError(`যাচাইকরণ ত্রুটি: ${err.message || "CS আইটেম যাচাই করা যায়নি।"}`)
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
      selectedSource
    )
    toast.success("JSON সিনট্যাক্স মেরামত এবং ফরম্যাট করা হয়েছে!")
  }

  const syncParsedItemsToText = (newItems: any[]) => {
    setParsedItems(newItems)
    setParseError(null)
    setErrorContext(null)
    setJsonText(JSON.stringify(newItems, null, 2))
  }

  const handleJsonChange = (val: string) => {
    setJsonText(val)
    validateAndParseJson(
      val,
      selectedAcademicClassId,
      selectedSubjectId,
      selectedChapterId,
      selectedSource
    )
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
    if (jsonText) {
      validateAndParseJson(jsonText, selectedAcademicClassId, selectedSubjectId, selectedChapterId, val)
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
    toast.info(`তালিকা থেকে #${idx + 1} প্রশ্নটি বাদ দেওয়া হয়েছে।`)
  }

  const handleDuplicateParsedItem = (idx: number) => {
    const itemToCopy = parsedItems[idx]
    if (!itemToCopy) return
    const next = [...parsedItems]
    next.splice(idx + 1, 0, {
      ...itemToCopy,
      questionA: `${itemToCopy.questionA} (অনুলিপি)`,
    })
    syncParsedItemsToText(next)
    toast.success(`#${idx + 1} প্রশ্নটি সফলভাবে অনুলিপি করা হয়েছে।`)
  }

  const handleAddNewQuestionCard = () => {
    const newCs = {
      subjectId: selectedSubjectId,
      chapterId: selectedChapterId,
      questionA: "ক. নতুন প্রশ্ন",
      questionB: "খ. নতুন প্রশ্ন",
      difficulty: QUESTION_DIFFICULTY.MEDIUM,
      source: selectedSource,
      isActive: true,
      reference: [],
      questionTypeId: null,
    }
    const next = [...parsedItems, newCs]
    syncParsedItemsToText(next)
  }

  const handleToggleExpand = (idx: number) => {
    setExpandedIndices((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }))
  }

  const handleExpandAll = () => {
    const allExpanded: Record<number, boolean> = {}
    parsedItems.forEach((_, i) => {
      allExpanded[i] = true
    })
    setExpandedIndices(allExpanded)
  }

  const handleCollapseAll = () => {
    setExpandedIndices({})
  }

  const handleClearAll = () => {
    setParsedItems([])
    setJsonText("")
    setParseError(null)
    setErrorContext(null)
  }

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(sampleJsonTemplate)
    toast.success("নমুনা JSON টেমপ্লেট ক্লিপবোর্ডে কপি করা হয়েছে!")
  }

  const handleImport = async () => {
    if (parsedItems.length === 0 || parseError) {
      toast.error("ইম্পোর্ট করার পূর্বে JSON ত্রুটি সমাধান করুন।")
      return
    }

    try {
      const payload = parsedItems.map((item) => ({
        subjectId: item.subjectId || selectedSubjectId,
        chapterId: item.chapterId || selectedChapterId,
        questionA: item.questionA.trim(),
        questionB: item.questionB.trim(),
        difficulty: item.difficulty as any,
        source: item.source || selectedSource || null,
        session: item.session || null,
        reference: Array.isArray(item.reference) ? item.reference : [],
        questionTypeId: item.questionTypeId || null,
        isActive: item.isActive !== false,
      }))

      const res = await importMutation.mutateAsync({ cses: payload as any })
      toast.success(`মোট ${res.importedCount}টি CS প্রশ্ন সফলভাবে ইম্পোর্ট করা হয়েছে!`)
      setTimeout(() => {
        router.push("/cs")
      }, 800)
    } catch (err: any) {
      toast.error(err.message || "CS প্রশ্ন বাল্ক ইম্পোর্ট করা সম্ভব হয়নি।")
    }
  }

  const isHierarchyConfigured = Boolean(
    selectedAcademicClassId && selectedSubjectId && selectedChapterId
  )

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200 pb-12">
      {/* Shared Page Header matching MCQ Benchmark */}
      <PageHeader
        title="CS প্রশ্ন বাল্ক ইম্পোর্ট (JSON)"
        description="JSON ডেটা সরাসরি পেস্ট করে বা ফাইল আপলোড করে একই সাথে একাধিক সৃজনশীল দৃশ্যপট প্রশ্ন (ক ও খ) তৈরি করুন।"
        icon={Upload}
        badge={{ label: "বাল্ক ইম্পোর্ট", variant: "indigo" }}
        breadcrumbs={[
          { label: "CS তালিকা", href: "/cs" },
          { label: "JSON ইম্পোর্ট" },
        ]}
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowSample(!showSample)}
            className="h-10 px-4 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Code className="size-4" />
            <span>{showSample ? "টেমপ্লেট লুকান" : "নমুনা টেমপ্লেট"}</span>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-10 px-4 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Link href="/cs" prefetch={true}>
              <ArrowLeft className="size-4" />
              <span>তালিকায় ফিরে যান</span>
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* Sample JSON Template Card */}
      {showSample && (
        <Card className="rounded-2xl border border-indigo-200/80 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 p-5 sm:p-6 animate-in fade-in duration-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <h4 className="text-base font-bold font-headline text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
              <FileCode className="size-5 text-indigo-600 dark:text-primary" />
              প্রত্যাশিত JSON ফরম্যাট স্ট্রাকচার
            </h4>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleCopyTemplate}
              className="font-bold text-xs rounded-xl border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 cursor-pointer justify-center"
            >
              <Copy className="size-3.5 mr-1" />
              টেমপ্লেট কপি করুন
            </Button>
          </div>
          <pre className="whitespace-pre-wrap break-all sm:break-normal overflow-x-auto rounded-xl bg-card p-4 font-mono text-xs text-foreground leading-relaxed border border-indigo-100 dark:border-indigo-950/40 shadow-inner">
            {sampleJsonTemplate}
          </pre>
        </Card>
      )}

      {/* Step 1: Hierarchy Configuration with 4-Column Source Integration */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs overflow-hidden">
        <CardHeader className="border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-5 sm:p-6 flex flex-row items-center gap-3.5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-primary border border-indigo-100 dark:border-primary/20 shrink-0 font-solaiman font-bold">
            ১
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg font-bold font-headline text-foreground">
              শ্রেণি, বিষয়, অধ্যায় ও ডেটা সোর্স কনফিগারেশন (ডিফল্ট অ্যাসাইনমেন্ট)
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5 font-body">
              ইম্পোর্টকৃত সব দৃশ্যপট প্রশ্ন স্বয়ংক্রিয়ভাবে এই শ্রেণি, বিষয়, অধ্যায় ও সোর্সের অধীনে যুক্ত হবে।
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Academic Class */}
            <div className="space-y-2">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                শ্রেণি (Academic Class) <span className="text-rose-500">*</span>
              </Label>
              <Select
                key={`import-class-${selectedAcademicClassId}`}
                value={selectedAcademicClassId}
                onValueChange={handleAcademicClassChange}
              >
                <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between">
                  <SelectValue placeholder="শ্রেণি নির্বাচন করুন..." />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-64 font-body">
                  {academicClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.nameBn || cls.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                ডিফল্ট বিষয় (Subject) <span className="text-rose-500">*</span>
              </Label>
              <Select
                key={`import-subject-${selectedSubjectId}`}
                disabled={!selectedAcademicClassId}
                value={selectedSubjectId}
                onValueChange={handleSubjectChange}
              >
                <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between disabled:opacity-50">
                  <SelectValue
                    placeholder={
                      selectedAcademicClassId
                        ? "বিষয় নির্বাচন করুন..."
                        : "প্রথমে শ্রেণি নির্বাচন করুন"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-64 font-body">
                  {subjects.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.nameBn || sub.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Chapter */}
            <div className="space-y-2">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                ডিফল্ট অধ্যায় (Chapter) <span className="text-rose-500">*</span>
              </Label>
              <Select
                key={`import-chapter-${selectedChapterId}`}
                disabled={!selectedSubjectId}
                value={selectedChapterId}
                onValueChange={handleChapterChange}
              >
                <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between disabled:opacity-50">
                  <SelectValue
                    placeholder={
                      selectedSubjectId
                        ? "অধ্যায় নির্বাচন করুন..."
                        : "প্রথমে বিষয় নির্বাচন করুন"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-64 font-body">
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
                ডিফল্ট উৎস (Default Source)
              </Label>
              <Select
                key={`import-source-${selectedSource}`}
                value={selectedSource}
                onValueChange={handleSourceChange}
              >
                <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between">
                  <SelectValue placeholder="ডিফল্ট উৎস নির্বাচন করুন..." />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg font-body">
                  {CS_SOURCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!isHierarchyConfigured && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-3 text-amber-800 dark:text-amber-400 text-xs font-semibold">
              <AlertTriangle className="size-4 text-amber-600 shrink-0" />
              <span>
                প্রথমে ওপর থেকে ডিফল্ট শ্রেণি, বিষয় এবং অধ্যায় নির্বাচন করুন যাতে JSON ইনপুট সক্রিয় হতে পারে।
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: JSON Input / File Upload Area */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs overflow-hidden">
        <CardHeader className="border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-5 sm:p-6 flex flex-row items-center gap-3.5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-primary border border-indigo-100 dark:border-primary/20 shrink-0 font-solaiman font-bold">
            ২
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg font-bold font-headline text-foreground">
              JSON ডেটা ইনপুট বা ফাইল আপলোড
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5 font-body">
              আপনার প্রশ্নের JSON অ্যারে নিচে পেস্ট করুন অথবা সরাসরি .json ফাইল আপলোড করুন।
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* File Upload Box */}
          <div className="space-y-2">
            <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              JSON ফাইল আপলোড
            </Label>
            <input
              type="file"
              accept=".json,application/json"
              disabled={!isHierarchyConfigured}
              onChange={handleFileUpload}
              className="block w-full text-sm text-foreground file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 dark:file:bg-primary/10 file:text-indigo-600 dark:file:text-primary hover:file:bg-indigo-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 dark:border-white/[0.08] rounded-xl p-1 bg-slate-50/40 dark:bg-white/[0.01]"
            />
          </div>

          {/* Paste JSON Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                অথবা JSON কোড সরাসরি পেস্ট করুন
              </Label>
              {jsonText.trim() && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAutoFixJson}
                  className="text-xs font-bold text-indigo-600 dark:text-primary border-indigo-200 dark:border-primary/30 hover:bg-indigo-50 dark:hover:bg-primary/10 rounded-xl cursor-pointer h-8"
                >
                  <Wand2 className="size-3.5 mr-1" />
                  স্বয়ংক্রিয় মেরামত (Auto-Fix)
                </Button>
              )}
            </div>
            <Textarea
              rows={7}
              disabled={!isHierarchyConfigured}
              placeholder={
                !isHierarchyConfigured
                  ? "প্রথমে শ্রেণি, বিষয় এবং অধ্যায় নির্বাচন করুন..."
                  : "এখানে JSON অ্যারে পেস্ট করুন..."
              }
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-4 font-mono text-xs text-foreground focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Validation Diagnostics / Errors */}
          {parseError && (
            <div className="space-y-3 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/20 p-5 text-rose-700 dark:text-rose-400 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-5 text-rose-600 shrink-0" />
                  <p className="font-bold text-sm font-headline">JSON সিনট্যাক্স যাচাইকরণে ত্রুটি</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAutoFixJson}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs w-full sm:w-auto justify-center"
                >
                  <Wand2 className="size-3.5 mr-1" />
                  ফরমেট স্বয়ংক্রিয় মেরামত করুন
                </Button>
              </div>

              <p className="font-mono text-xs leading-relaxed bg-card p-3 rounded-xl border border-rose-200/80 dark:border-rose-900/40 text-rose-700 dark:text-rose-400">
                {parseError}
              </p>

              {/* Error Code Pointer */}
              {errorContext && errorContext.linesContext.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                    ত্রুটির সম্ভাব্য স্থান (লাইন {toBengaliDigits(errorContext.line)}
                    {errorContext.col > 0 ? `, কলাম ${toBengaliDigits(errorContext.col)}` : ""}):
                  </p>
                  <div className="overflow-x-auto rounded-xl bg-slate-900 p-3.5 font-mono text-xs text-slate-200">
                    {errorContext.linesContext.map((l) => (
                      <div
                        key={l.num}
                        className={cn(
                          "flex items-center gap-3 px-2 py-0.5 rounded",
                          l.isError && "bg-rose-900/80 text-white font-bold border-l-4 border-rose-500"
                        )}
                      >
                        <span className="w-8 shrink-0 text-right text-slate-500 select-none">
                          {toBengaliDigits(l.num)}
                        </span>
                        <span className="whitespace-pre">{l.content}</span>
                        {l.isError && (
                          <span className="ml-auto text-[10px] uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded-md shrink-0">
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

          {/* Success Banner */}
          {!parseError && parsedItems.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 text-emerald-800 dark:text-emerald-400 text-sm">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold font-headline">JSON সফলভাবে যাচাই হয়েছে!</p>
                  <p className="text-xs font-body">
                    মোট {toBengaliDigits(parsedItems.length)}টি দৃশ্যপট প্রশ্ন প্রস্তুত।
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddNewQuestionCard}
                className="bg-card border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-100 rounded-xl font-bold text-xs cursor-pointer shrink-0 w-full sm:w-auto justify-center"
              >
                <Plus className="size-3.5 mr-1" />
                নতুন প্রশ্ন কার্ড যোগ করুন
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 3: Parsed CS Preview Cards */}
      {parsedItems.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold font-headline text-foreground flex items-center gap-2">
                <Layers className="size-5 text-indigo-600 dark:text-primary shrink-0" />
                প্রিভিউ ও যাচাইকরণ ({toBengaliDigits(parsedItems.length)}টি CS)
              </h3>
              <p className="text-xs text-muted-foreground font-body">
                ইম্পোর্ট করার আগে যেকোনো কার্ডের বিবরণ সরাসরি সম্পাদনা করুন।
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExpandAll}
                className="h-8 text-xs font-bold rounded-xl border border-slate-200 dark:border-white/[0.08]"
              >
                সবগুলো প্রসারিত করুন
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCollapseAll}
                className="h-8 text-xs font-bold rounded-xl border border-slate-200 dark:border-white/[0.08]"
              >
                সবগুলো সংকুচিত করুন
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="h-8 text-xs font-bold rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
              >
                সব মুছুন
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {parsedItems.map((item, idx) => (
              <ParsedCsCard
                key={idx}
                index={idx}
                item={item}
                questionTypes={questionTypes}
                isExpanded={Boolean(expandedIndices[idx])}
                onToggleExpand={() => handleToggleExpand(idx)}
                onChange={(updated) => handleUpdateParsedItem(idx, updated)}
                onDelete={() => handleDeleteParsedItem(idx)}
                onDuplicate={() => handleDuplicateParsedItem(idx)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Submit Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 dark:border-white/[0.08] pt-6 sm:pt-8 mt-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
          <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
          <span>নির্বাচিত শ্রেণি, বিষয়, অধ্যায় ও সোর্সে প্রশ্নগুলো যুক্ত হবে</span>
        </div>
        <div className="flex flex-col-reverse sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-3">
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold px-6 h-11 text-sm transition-all active:scale-95 cursor-pointer font-headline"
          >
            <Link href="/cs" prefetch={true}>
              বাতিল
            </Link>
          </Button>
          <Button
            type="button"
            disabled={
              parsedItems.length === 0 ||
              Boolean(parseError) ||
              importMutation.isPending ||
              !isHierarchyConfigured
            }
            onClick={handleImport}
            className="w-full sm:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 h-11 text-sm shadow-sm shadow-indigo-200 dark:shadow-none transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 font-headline disabled:opacity-50"
          >
            {importMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            ) : (
              <Upload className="w-4 h-4 shrink-0" />
            )}
            <span>
              {importMutation.isPending
                ? "ইম্পোর্ট করা হচ্ছে..."
                : `মোট ${toBengaliDigits(parsedItems.length)}টি CS ইম্পোর্ট করুন`}
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}
