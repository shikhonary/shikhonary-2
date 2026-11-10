"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@workspace/ui/components/sonner"
import {
  useImportEssences,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
} from "../services/use-essence"
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
  Feather,
} from "lucide-react"
import { QUESTION_DIFFICULTY, QUESTION_DIFFICULTY_OPTIONS, toBengaliDigits } from "@workspace/utils"
import { ESSENCE_SOURCE_OPTIONS, DEFAULT_SOURCE } from "../constants"
import { PageHeader } from "@/components/shared/page-header"

const sampleJsonTemplate = `[
  {
    "title": "পরের কারণে স্বার্থ দিয়া বলি,\\nএ জীবন মন সকলি দাও,\\nতার মত সুখ কোথাও কি আছে?\\nআপনার কথা ভুলিয়া যাও।\\n\\nপরের কারণে মরণেও সুখ,\\n'সুখ' 'সুখ' করি কেঁদো না আর,\\nনিজেরে ভুলায়ে পরের লাগিয়া\\nজীবন সঁপিলে আনন্দ অপার।",
    "isMath": true,
    "reference": ["ঢাকা বোর্ড ২০২৪", "রাজশাহী বোর্ড ২০২৩"],
    "difficulty": "EASY",
    "source": "পাঠ্যবই",
    "session": "2026",
    "popularityCount": 12,
    "isActive": true
  },
  {
    "title": "শৈবাল দীঘিরে কহে উচ্চ করি শির,\\nলিখে রেখো, এক ফোঁটা দিলেম শিশির।\\nক্ষুদ্রের দত্ত চিরকালই হাস্যকর,\\nবিনা ত্যাগে আত্মখ্যাতি মূল্যহীন বর।",
    "isMath": true,
    "reference": ["চট্টগ্রাম বোর্ড ২০২৪"],
    "difficulty": "MEDIUM",
    "source": "বোর্ড প্রশ্ন",
    "session": "2026",
    "popularityCount": 8,
    "isActive": true
  }
]`

// Smart JSON Syntax Repair Engine
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

  // 5. Fix unescaped backslashes not part of valid JSON escapes
  cleaned = cleaned.replace(/(?<!\\)\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, "\\\\")

  // 6. Remove trailing commas in objects & arrays
  cleaned = cleaned.replace(/,\s*([\]}])/g, "$1")

  // 7. Wrap single object in array if needed
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

interface ParsedEssenceCardProps {
  index: number
  item: any
  questionTypes: any[]
  isExpanded: boolean
  onToggleExpand: () => void
  onChange: (updatedItem: any) => void
  onDelete: () => void
  onDuplicate: () => void
}

/**
 * Parsed Essence Card matching the exact visual design concept of Summary/MCQ module
 */
function ParsedEssenceCard({
  index,
  item,
  questionTypes,
  isExpanded,
  onToggleExpand,
  onChange,
  onDelete,
  onDuplicate,
}: ParsedEssenceCardProps) {
  const isTitleMissing = !item.title || !String(item.title).trim()

  return (
    <Card className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs overflow-hidden transition-all hover:shadow-md">
      {/* Header Bar matching Summary Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-4 sm:p-5">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-primary font-bold text-xs sm:text-sm border border-indigo-100 dark:border-primary/20 shrink-0">
            #{toBengaliDigits(index + 1)}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm sm:text-base font-bold font-headline text-foreground truncate">
              {item.title ? item.title : `সারমর্ম #${toBengaliDigits(index + 1)} (বিবরণ নেই)`}
            </h4>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[11px] text-muted-foreground">
                উৎস: {item.source || DEFAULT_SOURCE} {item.session ? `(${item.session})` : ""}
                {item.reference && item.reference.length > 0
                  ? ` | রেফারেন্স: ${toBengaliDigits(item.reference.length)}টি`
                  : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Toggles & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Difficulty Badge */}
          <Badge
            variant="outline"
            className={cn(
              "px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-lg",
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

          {/* Math Mode Badge */}
          {item.isMath && (
            <Badge
              variant="outline"
              className="px-2 py-0.5 text-[11px] font-bold rounded-lg border-indigo-200 text-indigo-700 bg-indigo-50 dark:bg-primary/10 dark:text-primary"
            >
              ∑ ম্যাথ
            </Badge>
          )}

          {/* Active Status Badge */}
          <Badge
            variant="outline"
            className={cn(
              "px-2 py-0.5 text-[11px] font-bold rounded-lg",
              item.isActive !== false
                ? "border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "border-slate-300 text-slate-500 bg-slate-50"
            )}
          >
            {item.isActive !== false ? "অ্যাক্টিভ" : "ইনঅ্যাক্টিভ"}
          </Badge>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 ml-1 pl-1 border-l border-slate-200 dark:border-white/[0.08]">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onDuplicate}
              title="সারমর্ম ডুপ্লিকেট করুন"
              className="size-8 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-primary/10 rounded-xl cursor-pointer"
            >
              <Copy className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onDelete}
              title="সারমর্ম মুছে ফেলুন"
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

      {/* Validation Warning Banner */}
      {isTitleMissing && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200/60 dark:border-amber-800/40 px-5 py-2.5 text-xs text-amber-800 dark:text-amber-400 flex items-center gap-2 font-medium">
          <AlertTriangle className="size-4 text-amber-600 shrink-0" />
          <span>সারমর্ম বা মূলভাব অনুচ্ছেদ ফাঁকা রাখা যাবে না।</span>
        </div>
      )}

      {/* Card Content View: Summary Text / Live Math Preview */}
      <div className="p-4 sm:p-6 space-y-4">
        {/* Compact View Preview when not expanded */}
        {!isExpanded && (
          <div className="space-y-2">
            <div className="text-sm text-foreground font-body leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">
              <RenderMath text={item.title || "কোনো অনুচ্ছেদ নেই"} isMath={item.isMath !== false} />
            </div>
            {Array.isArray(item.reference) && item.reference.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-white/[0.04]">
                {item.reference.map((ref: string, rIdx: number) => (
                  <span
                    key={rIdx}
                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.05] text-[10px] text-muted-foreground font-medium"
                  >
                    🏷️ {ref}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Expanded Full Edit Mode */}
        {isExpanded && (
          <div className="space-y-6 pt-2 border-t border-slate-100 dark:border-white/[0.04]">
            {/* Essence Title/Passage Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  সারমর্ম বা মূলভাব অনুচ্ছেদ <span className="text-rose-500">*</span>
                </Label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={item.isMath !== false}
                      onChange={(e) => onChange({ ...item, isMath: e.target.checked })}
                      className="size-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>ম্যাথ/LaTeX মোড</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={item.isActive !== false}
                      onChange={(e) => onChange({ ...item, isActive: e.target.checked })}
                      className="size-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>অ্যাক্টিভ</span>
                  </label>
                </div>
              </div>
              <Textarea
                rows={5}
                value={item.title || ""}
                onChange={(e) => onChange({ ...item, title: e.target.value })}
                placeholder="সারমর্ম বা মূলভাব অনুচ্ছেদ এখানে লিখুন..."
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 p-3.5 font-body leading-relaxed"
              />

              {/* KaTeX Live Math Preview */}
              {item.isMath !== false && item.title && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] text-xs text-foreground space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                    LaTeX ম্যাথ প্রিভিউ:
                  </span>
                  <div className="text-sm sm:text-base leading-relaxed text-foreground font-body whitespace-pre-wrap">
                    <RenderMath text={item.title} isMath={true} />
                  </div>
                </div>
              )}
            </div>

            {/* Reference Tags & Metadata Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Difficulty */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">কাঠিন্য</Label>
                <Select
                  value={item.difficulty || "MEDIUM"}
                  onValueChange={(val) => onChange({ ...item, difficulty: val })}
                >
                  <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-xs h-9 px-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 rounded-xl">
                    {QUESTION_DIFFICULTY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Question Type Template */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">কাঠামো টেমপ্লেট</Label>
                <Select
                  value={item.questionTypeId || "none"}
                  onValueChange={(val) =>
                    onChange({ ...item, questionTypeId: val === "none" ? undefined : val })
                  }
                >
                  <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-xs h-9 px-3">
                    <SelectValue placeholder="টেমপ্লেট..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 rounded-xl max-h-56">
                    <SelectItem value="none">ডিফল্ট</SelectItem>
                    {questionTypes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.nameEn} ({t.label})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Source */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">উৎস (Source)</Label>
                <Select
                  value={item.source || DEFAULT_SOURCE}
                  onValueChange={(val) => onChange({ ...item, source: val })}
                >
                  <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-xs h-9 px-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 rounded-xl">
                    {ESSENCE_SOURCE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Session */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">সেশন</Label>
                <Input
                  type="text"
                  value={item.session || ""}
                  onChange={(e) => onChange({ ...item, session: e.target.value })}
                  placeholder="যেমন: ২০২৬"
                  className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-xs h-9 px-3"
                />
              </div>
            </div>

            {/* Reference Tags Input */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">
                রেফারেন্স (কমা দিয়ে একাধিক উল্লেখ করুন)
              </Label>
              <Input
                type="text"
                value={Array.isArray(item.reference) ? item.reference.join(", ") : ""}
                onChange={(e) => {
                  const arr = e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                  onChange({ ...item, reference: arr })
                }}
                placeholder="যেমন: ঢাকা বোর্ড ২০২৪, পাঠ্যবই পৃষ্ঠা ৪২..."
                className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-xs h-9 px-3"
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export function ImportEssenceView() {
  const router = useRouter()
  const importMutation = useImportEssences()

  // Selectors Data
  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: questionTypesData } = useQuestionTypesList({ limit: 100 })
  const questionTypes = questionTypesData?.questionTypes ?? []

  // Global Configuration State
  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("")
  const [defaultSource, setDefaultSource] = useState<string>(DEFAULT_SOURCE)
  const [defaultSession, setDefaultSession] = useState<string>(new Date().getFullYear().toString())
  const [defaultDifficulty, setDefaultDifficulty] = useState<string>(QUESTION_DIFFICULTY.MEDIUM)
  const [selectedQuestionTypeId, setSelectedQuestionTypeId] = useState<string>("")

  const { data: subjects = [] } = useSubjectsForSelection(
    selectedClassId ? { academicClassId: selectedClassId } : undefined
  )

  // Raw JSON & Parsing State
  const [rawJson, setRawJson] = useState<string>("")
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [parsedItems, setParsedItems] = useState<any[]>([])
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({})

  // Full Screen / Expanded Studio Mode
  const [isEditorExpanded, setIsEditorExpanded] = useState<boolean>(false)

  // Handle parsing JSON text
  const handleParseJson = (text: string) => {
    setRawJson(text)
    if (!text.trim()) {
      setJsonError(null)
      setParsedItems([])
      return
    }

    try {
      const parsed = JSON.parse(text)
      if (!Array.isArray(parsed)) {
        throw new Error("JSON ডাটা অবশ্যই একটি Array (যেমন: [ { ... }, { ... } ]) হতে হবে।")
      }
      setJsonError(null)
      setParsedItems(parsed)
    } catch (err: any) {
      setJsonError(err.message || "অবৈধ JSON সিনট্যাক্স")
    }
  }

  // Handle Auto-Repair
  const handleAutoRepair = () => {
    if (!rawJson.trim()) return
    try {
      const repaired = repairJsonSyntax(rawJson)
      // Check if it now parses
      JSON.parse(repaired)
      setRawJson(repaired)
      setJsonError(null)
      const parsed = JSON.parse(repaired)
      setParsedItems(parsed)
      toast.success("JSON সিনট্যাক্স সফলভাবে ঠিক করা হয়েছে!")
    } catch (err: any) {
      toast.error("স্বয়ংক্রিয়ভাবে JSON ঠিক করা সম্ভব হয়নি। অনুগ্রহ করে ম্যানুয়ালি লাইন পরীক্ষা করুন।")
      setJsonError(err.message || "অবৈধ JSON")
    }
  }

  // Load Sample Template
  const handleLoadSample = () => {
    setRawJson(sampleJsonTemplate)
    handleParseJson(sampleJsonTemplate)
    toast.success("নমুনা JSON টেমপ্লেট লোড করা হয়েছে!")
  }

  // Format Prettify JSON
  const handleFormatJson = () => {
    if (!rawJson.trim()) return
    try {
      const parsed = JSON.parse(rawJson)
      const formatted = JSON.stringify(parsed, null, 2)
      setRawJson(formatted)
      setJsonError(null)
      toast.success("JSON ফরম্যাট করা হয়েছে!")
    } catch (err: any) {
      toast.error("ফরম্যাট করার জন্য বৈধ JSON প্রয়োজন")
    }
  }

  // Parsed Card Management
  const handleItemChange = (index: number, updatedItem: any) => {
    const updated = [...parsedItems]
    updated[index] = updatedItem
    setParsedItems(updated)
    setRawJson(JSON.stringify(updated, null, 2))
  }

  const handleItemDelete = (index: number) => {
    const updated = parsedItems.filter((_, i) => i !== index)
    setParsedItems(updated)
    setRawJson(JSON.stringify(updated, null, 2))
    toast.info("সারমর্ম কার্ডটি সরানো হয়েছে")
  }

  const handleItemDuplicate = (index: number) => {
    const itemToClone = parsedItems[index]
    const updated = [
      ...parsedItems.slice(0, index + 1),
      { ...itemToClone },
      ...parsedItems.slice(index + 1),
    ]
    setParsedItems(updated)
    setRawJson(JSON.stringify(updated, null, 2))
    toast.success("সারমর্মটি ক্লোন করা হয়েছে")
  }

  const handleAddNewItem = () => {
    const newItem = {
      title: "",
      isMath: true,
      reference: [],
      difficulty: defaultDifficulty,
      source: defaultSource,
      session: defaultSession,
      popularityCount: 0,
      isActive: true,
    }
    const updated = [...parsedItems, newItem]
    setParsedItems(updated)
    setRawJson(JSON.stringify(updated, null, 2))
    setExpandedIndices((prev) => ({ ...prev, [updated.length - 1]: true }))
  }

  const toggleAllExpanded = (expand: boolean) => {
    const newExpanded: Record<number, boolean> = {}
    parsedItems.forEach((_, idx) => {
      newExpanded[idx] = expand
    })
    setExpandedIndices(newExpanded)
  }

  // Batch Submit Action
  const handleSubmitBatch = async () => {
    if (!selectedClassId) {
      toast.error("অনুগ্রহ করে একটি শ্রেণি নির্বাচন করুন")
      return
    }
    if (!selectedSubjectId) {
      toast.error("অনুগ্রহ করে একটি বিষয় নির্বাচন করুন")
      return
    }
    if (parsedItems.length === 0) {
      toast.error("ইমপোর্ট করার জন্য কোনো সারমর্ম পাওয়া যায়নি")
      return
    }

    const invalidItems = parsedItems.filter((it) => !it.title || !String(it.title).trim())
    if (invalidItems.length > 0) {
      toast.error("কিছু সারমর্মের অনুচ্ছেদ ফাঁকা রয়েছে। অনুগ্রহ করে সংশোধন করুন।")
      return
    }

    try {
      const payload = parsedItems.map((it) => ({
        subjectId: selectedSubjectId,
        title: String(it.title).trim(),
        reference: Array.isArray(it.reference) ? it.reference : [],
        source: it.source || defaultSource,
        session: it.session || defaultSession,
        difficulty: (it.difficulty as any) || defaultDifficulty,
        popularityCount: Number(it.popularityCount) || 0,
        questionTypeId: it.questionTypeId || selectedQuestionTypeId || undefined,
        isActive: it.isActive !== false,
      }))

      const res = await importMutation.mutateAsync({
        essences: payload,
        source: defaultSource,
        session: defaultSession,
        difficulty: defaultDifficulty as any,
      })

      toast.success(`সফলভাবে ${res.importedCount}টি সারমর্ম ও মূলভাব ইমপোর্ট করা হয়েছে!`)
      setTimeout(() => {
        router.push("/essences")
      }, 600)
    } catch (err: any) {
      toast.error(err.message || "সারমর্ম ইমপোর্ট করতে সমস্যা হয়েছে")
    }
  }

  const isSubmitting = importMutation.isPending

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Shared Page Header matching MCQ/Summary Module */}
      <PageHeader
        title="JSON থেকে সারমর্ম ও মূলভাব ইমপোর্ট"
        description="একসাথে একাধিক সারমর্ম ও মূলভাব প্রশ্ন JSON কোড বা ফাইলের মাধ্যমে দ্রুত যুক্ত করুন।"
        icon={Upload}
        badge={{ label: "JSON ইমপোর্ট", variant: "indigo" }}
        breadcrumbs={[
          { label: "সারমর্ম তালিকা", href: "/essences" },
          { label: "JSON ইমপোর্ট" },
        ]}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Link href="/essences" prefetch={true}>
            <ArrowLeft className="w-4 h-4" />
            <span>তালিকায় ফিরে যান</span>
          </Link>
        </Button>
      </PageHeader>

      {/* 1. Global Context & Hierarchy Configuration Card */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs overflow-hidden">
        <CardHeader className="border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-5 sm:p-6 flex flex-row items-center gap-3.5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-primary border border-indigo-100/80 dark:border-primary/20 shrink-0">
            <BookOpen className="h-5 w-5 stroke-[1.8]" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg font-bold font-headline text-foreground">
              ইমপোর্ট কনফিগারেশন ও বিষয় ম্যাপিং
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              ইমপোর্টকৃত সারমর্মসমূহ কোন শ্রেণি ও বিষয়ে জমা হবে তা নির্বাচন করুন।
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Class Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                শ্রেণি (Class) <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={selectedClassId}
                onValueChange={(val) => {
                  setSelectedClassId(val)
                  setSelectedSubjectId("")
                }}
              >
                <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-xs sm:text-sm h-10 px-3.5">
                  <SelectValue placeholder="শ্রেণি নির্বাচন করুন..." />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-slate-200/80 rounded-xl max-h-60">
                  {academicClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.nameBn || cls.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                বিষয় (Subject) <span className="text-rose-500">*</span>
              </Label>
              <Select
                disabled={!selectedClassId}
                value={selectedSubjectId}
                onValueChange={setSelectedSubjectId}
              >
                <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-xs sm:text-sm h-10 px-3.5 disabled:opacity-50">
                  <SelectValue
                    placeholder={
                      selectedClassId ? "বিষয় নির্বাচন করুন..." : "প্রথমে শ্রেণি নির্বাচন করুন"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-slate-200/80 rounded-xl max-h-60">
                  {subjects.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.nameBn || sub.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Question Type Template */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                প্রশ্ন কাঠামো টেমপ্লেট (ঐচ্ছিক)
              </Label>
              <Select
                value={selectedQuestionTypeId || "none"}
                onValueChange={(val) => setSelectedQuestionTypeId(val === "none" ? "" : val)}
              >
                <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-xs sm:text-sm h-10 px-3.5">
                  <SelectValue placeholder="টেমপ্লেট নির্বাচন করুন..." />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-slate-200/80 rounded-xl max-h-60">
                  <SelectItem value="none">ডিফল্ট সারমর্ম টেমপ্লেট</SelectItem>
                  {questionTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.nameEn} ({t.label})
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
              <Select value={defaultSource} onValueChange={setDefaultSource}>
                <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-xs sm:text-sm h-10 px-3.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-slate-200/80 rounded-xl">
                  {ESSENCE_SOURCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Default Session */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                ডিফল্ট সেশন (Default Session)
              </Label>
              <Input
                type="text"
                value={defaultSession}
                onChange={(e) => setDefaultSession(e.target.value)}
                placeholder="যেমন: ২০২৬"
                className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-xs sm:text-sm h-10 px-3.5"
              />
            </div>

            {/* Default Difficulty */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                ডিফল্ট কাঠিন্য (Default Difficulty)
              </Label>
              <Select value={defaultDifficulty} onValueChange={setDefaultDifficulty}>
                <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-xs sm:text-sm h-10 px-3.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-slate-200/80 rounded-xl">
                  {QUESTION_DIFFICULTY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Interactive JSON Code Editor Studio */}
      <Card
        className={cn(
          "rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs overflow-hidden transition-all",
          isEditorExpanded && "ring-2 ring-indigo-500/30"
        )}
      >
        <CardHeader className="border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-4 sm:p-5 flex flex-row items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-primary border border-indigo-100/80 dark:border-primary/20 shrink-0">
              <Code className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold font-headline text-foreground flex items-center gap-2">
                <span>JSON কোড ইনপুট</span>
                {parsedItems.length > 0 && !jsonError && (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] font-bold">
                    ✓ {toBengaliDigits(parsedItems.length)}টি সারমর্ম শনাক্তকৃত
                  </Badge>
                )}
              </CardTitle>
            </div>
          </div>

          {/* Quick Helper Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLoadSample}
              className="h-8 px-3 rounded-xl text-xs font-semibold gap-1.5 border-slate-200 dark:border-white/[0.08]"
            >
              <FileCode className="size-3.5 text-indigo-600" />
              <span>নমুনা JSON</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAutoRepair}
              className="h-8 px-3 rounded-xl text-xs font-semibold gap-1.5 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 bg-indigo-50/50 hover:bg-indigo-100/70"
            >
              <Wand2 className="size-3.5" />
              <span>স্বয়ংক্রিয় মেরামত</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleFormatJson}
              className="h-8 px-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              ফরম্যাট
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsEditorExpanded(!isEditorExpanded)}
              title={isEditorExpanded ? "সংকুচিত করুন" : "বড় করুন"}
              className="size-8 rounded-xl text-muted-foreground hover:text-foreground"
            >
              {isEditorExpanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-3">
          <Textarea
            rows={isEditorExpanded ? 20 : 10}
            value={rawJson}
            onChange={(e) => handleParseJson(e.target.value)}
            placeholder={`[\n  {\n    "title": "কবিতাংশ বা অনুচ্ছেদ...",\n    "isMath": true,\n    "reference": ["ঢাকা বোর্ড ২০২৪"],\n    "difficulty": "MEDIUM"\n  }\n]`}
            className="w-full font-mono text-xs sm:text-sm leading-relaxed rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-950 text-slate-100 p-4 focus-visible:ring-2 focus-visible:ring-indigo-500/30"
          />

          {/* Diagnostic Error Message */}
          {jsonError && (
            <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold font-headline">
                <AlertCircle className="size-4 shrink-0" />
                <span>JSON সিনট্যাক্স ত্রুটি: {jsonError}</span>
              </div>
              <p className="text-[11px] text-rose-600/90 font-body">
                টিপস: উপরের &quot;স্বয়ংক্রিয় মেরামত&quot; বাটনে ক্লিক করে সাধারণ কোট বা কমা সংক্রান্ত সমস্যা সমাধান করতে পারেন।
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Parsed Question Cards Studio / Review Section */}
      {parsedItems.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold font-headline text-foreground">
                ইমপোর্ট পর্যালোচনা ও কার্ড এডিটর
              </h3>
              <Badge variant="secondary" className="rounded-lg text-xs font-bold">
                {toBengaliDigits(parsedItems.length)}টি প্রশ্ন
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => toggleAllExpanded(true)}
                className="h-8 px-3 rounded-xl text-xs font-semibold"
              >
                সব প্রসারিত করুন
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => toggleAllExpanded(false)}
                className="h-8 px-3 rounded-xl text-xs font-semibold"
              >
                সব সংকুচিত করুন
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleAddNewItem}
                className="h-8 px-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-1"
              >
                <Plus className="size-3.5" />
                <span>নতুন কার্ড যোগ করুন</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {parsedItems.map((item, idx) => (
              <ParsedEssenceCard
                key={idx}
                index={idx}
                item={item}
                questionTypes={questionTypes}
                isExpanded={Boolean(expandedIndices[idx])}
                onToggleExpand={() =>
                  setExpandedIndices((prev) => ({ ...prev, [idx]: !prev[idx] }))
                }
                onChange={(updated) => handleItemChange(idx, updated)}
                onDelete={() => handleItemDelete(idx)}
                onDuplicate={() => handleItemDuplicate(idx)}
              />
            ))}
          </div>

          {/* Sticky Bottom Actions Bar */}
          <div className="sticky bottom-4 z-20 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card/95 backdrop-blur-md p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
              <Sparkles className="size-4 text-indigo-600 dark:text-primary shrink-0" />
              <span>
                মোট {toBengaliDigits(parsedItems.length)}টি সারমর্ম ও মূলভাব ডাটাবেজে যুক্ত হতে প্রস্তুত।
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/essences")}
                className="w-full sm:w-auto rounded-xl px-5 h-10 text-xs sm:text-sm font-semibold"
              >
                বাতিল
              </Button>
              <Button
                type="button"
                disabled={isSubmitting || !selectedClassId || !selectedSubjectId}
                onClick={handleSubmitBatch}
                className="w-full sm:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-7 h-10 text-xs sm:text-sm shadow-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                ) : (
                  <Upload className="w-4 h-4 shrink-0" />
                )}
                <span>
                  {isSubmitting
                    ? "ইমপোর্ট করা হচ্ছে..."
                    : `${toBengaliDigits(parsedItems.length)}টি সারমর্ম সংরক্ষণ করুন`}
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
