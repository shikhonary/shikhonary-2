"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@workspace/ui/components/sonner"
import {
  useImportSummaries,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
} from "../services/use-summary"
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
  Code,
  FileCode,
  Upload,
  ArrowLeft,
  Layers,
  AlertCircle,
  Loader2,
  Sparkles,
  BookOpen,
} from "lucide-react"
import { QUESTION_DIFFICULTY, QUESTION_DIFFICULTY_OPTIONS, toBengaliDigits } from "@workspace/utils"
import { PageHeader } from "@/components/shared/page-header"

const sampleJsonTemplate = `[
  {
    "title": "Passage: A computer is an electronic device that manipulates information, or data. It has the ability to store, retrieve, and process data.",
    "reference": ["Dhaka Board 2024", "Rajshahi Board 2023"],
    "difficulty": "MEDIUM",
    "popularityCount": 5
  },
  {
    "title": "Poem: Hold fast to dreams, for if dreams die, life is a broken-winged bird that cannot fly.",
    "reference": ["Chattogram Board 2024"],
    "difficulty": "EASY",
    "popularityCount": 10
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

  // 4. Fix LaTeX backslashes not escaped in JSON
  cleaned = cleaned.replace(
    /(?<!\\)\\(rightarrow|right|rho|rangle|Rightarrow|roots|rceil|rfloor|times|theta|text|tan|tau|tilde|to|therefore|triangle|tanh|top|tiny|textbf|textit|texttt|tfrac|tag|frac|forall|flat|beta|begin|bar|mathbf|binom|big|Big|bullet|bot|boldsymbol|bmatrix|bmod|neq|nabla|nu|not|null|neg|natural|ni|norm)\b/g,
    "\\\\$1"
  )
  cleaned = cleaned.replace(/(?<!\\)\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, "\\\\")

  // 5. Remove trailing commas in objects & arrays
  cleaned = cleaned.replace(/,\s*([\]}])/g, "$1")

  // 6. Wrap single object in array if not already an array
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
  isMath?: boolean
}

function EditableField({
  label,
  value,
  placeholder = "সম্পাদনা করতে ক্লিক করুন...",
  multiline = false,
  onSave,
  isMath = true,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value || "")

  const handleCommit = () => {
    setIsEditing(false)
    if (editValue !== value) {
      onSave(editValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      handleCommit()
    } else if (e.key === "Escape") {
      setEditValue(value)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <div className="space-y-1">
        {label && (
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block font-headline">
            {label}
          </label>
        )}
        {multiline ? (
          <Textarea
            rows={4}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleCommit}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-full rounded-xl border border-indigo-600 bg-card p-3 text-sm text-foreground focus:ring-2 focus:ring-indigo-500/20 leading-relaxed font-body"
          />
        ) : (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleCommit}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-full rounded-xl border border-indigo-600 bg-card px-3 h-9 text-sm text-foreground focus:ring-2 focus:ring-indigo-500/20"
          />
        )}
      </div>
    )
  }

  return (
    <div
      onClick={() => {
        setEditValue(value || "")
        setIsEditing(true)
      }}
      className="group cursor-pointer rounded-xl border border-dashed border-slate-200 dark:border-white/[0.08] hover:border-indigo-400 p-3 transition-colors bg-slate-50/40 dark:bg-white/[0.01]"
      title="সম্পাদনা করতে ক্লিক করুন"
    >
      {label && (
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-headline">
          {label}
        </span>
      )}
      {value ? (
        <div className="text-sm text-foreground font-body leading-relaxed whitespace-pre-wrap">
          {isMath ? <RenderMath text={value} isMath={true} /> : value}
        </div>
      ) : (
        <span className="text-xs text-muted-foreground italic font-body">{placeholder}</span>
      )}
    </div>
  )
}

interface EditableSummaryCardProps {
  index: number
  item: any
  onChange: (updated: any) => void
  onDelete: () => void
  onDuplicate: () => void
}

function EditableSummaryCard({
  index,
  item,
  onChange,
  onDelete,
  onDuplicate,
}: EditableSummaryCardProps) {
  const handleToggleDifficulty = () => {
    const sequence = ["EASY", "MEDIUM", "HARD"]
    const currentIdx = sequence.indexOf(item.difficulty || "MEDIUM")
    const nextDiff = sequence[(currentIdx + 1) % sequence.length]
    onChange({ ...item, difficulty: nextDiff })
  }

  const handleSaveReferences = (newVal: string) => {
    const splitted = newVal
      .split(",")
      .map((r) => r.trim())
      .filter((r) => r.length > 0)
    onChange({ ...item, reference: splitted })
  }

  const referenceString = Array.isArray(item.reference) ? item.reference.join(", ") : ""

  return (
    <Card className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-50 dark:bg-primary/10 text-xs font-bold text-indigo-700 dark:text-primary font-mono border border-indigo-100 dark:border-primary/20">
            #{toBengaliDigits(index + 1)}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
            সারাংশ / সারমর্ম প্রিভিউ
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Difficulty Toggle */}
          <button type="button" onClick={handleToggleDifficulty} className="cursor-pointer">
            <Badge
              variant="outline"
              className={cn(
                "px-2.5 py-0.5 text-[11px] font-bold rounded-lg border font-body",
                item.difficulty === "EASY" &&
                  "border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400",
                item.difficulty === "MEDIUM" &&
                  "border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400",
                item.difficulty === "HARD" &&
                  "border-rose-200 text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400"
              )}
            >
              {QUESTION_DIFFICULTY_OPTIONS.find((d) => d.value === item.difficulty)?.label ||
                item.difficulty ||
                "মাঝারি"}
            </Badge>
          </button>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 ml-1 pl-1 border-l border-slate-200 dark:border-white/[0.08]">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onDuplicate}
              title="সারাংশ ডুপ্লিকেট করুন"
              className="size-8 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-primary/10 rounded-xl cursor-pointer"
            >
              <Copy className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onDelete}
              title="সারাংশ মুছে ফেলুন"
              className="size-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl cursor-pointer"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        {/* Title / Passage Text */}
        <EditableField
          label="সারাংশ বা সারমর্ম অনুচ্ছেদ (Passage / Poem)"
          value={item.title || ""}
          multiline
          placeholder="অনুচ্ছেদ লিখুন বা পেস্ট করুন..."
          onSave={(newVal) => onChange({ ...item, title: newVal })}
        />

        {/* References & Popularity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200/80 dark:border-white/[0.08] pt-4">
          <EditableField
            label="রেফারেন্স ট্যাগ (কমা দিয়ে আলাদা করুন)"
            value={referenceString}
            placeholder="যেমন: ঢাকা বোর্ড ২০২৪..."
            onSave={handleSaveReferences}
            isMath={false}
          />
          <EditableField
            label="ভিউ সংখ্যা"
            value={item.popularityCount !== undefined ? String(item.popularityCount) : "0"}
            placeholder="০"
            onSave={(newVal) =>
              onChange({
                ...item,
                popularityCount: newVal && !isNaN(Number(newVal)) ? Number(newVal) : 0,
              })
            }
            isMath={false}
          />
        </div>
      </div>
    </Card>
  )
}

export function ImportSummaryView() {
  const router = useRouter()
  const importMutation = useImportSummaries()

  const [jsonText, setJsonText] = useState<string>("")
  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState<string>("")
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("")
  const [showSample, setShowSample] = useState<boolean>(false)
  const [parsedItems, setParsedItems] = useState<any[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [errorContext, setErrorContext] = useState<ReturnType<typeof findJsonErrorPosition>>(null)

  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedAcademicClassId ? { academicClassId: selectedAcademicClassId } : undefined
  )

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        setJsonText(content)
        validateAndParseJson(content, selectedAcademicClassId, selectedSubjectId)
      }
    }
    reader.readAsText(file)
  }

  const validateAndParseJson = (
    text: string,
    overrideClassId: string,
    overrideSubjectId: string
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
          toast.success("JSON ফরম্যাট স্বয়ংক্রিয় মেরামত করা হয়েছে!")
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
        setParseError("JSON অ্যারে ফাঁকা।")
        return
      }

      const validated: any[] = []
      const errors: string[] = []

      itemsArray.forEach((item: any, idx: number) => {
        const itemNum = idx + 1
        const subjectId = item.subjectId || overrideSubjectId
        const title = item.title || item.name

        if (!title || typeof title !== "string" || !title.trim()) {
          errors.push(`আইটেম #${itemNum}: সারাংশ বা সারমর্ম অনুচ্ছেদ ফাঁকা রাখা যাবে না।`)
        }
        if (!subjectId) {
          errors.push(`আইটেম #${itemNum}: বিষয় নির্ধারিত নেই। ডিফল্ট বিষয় নির্বাচন করুন।`)
        }

        validated.push({
          subjectId,
          title: String(title || "").trim(),
          difficulty: item.difficulty || "MEDIUM",
          popularityCount:
            item.popularityCount !== undefined && item.popularityCount !== null
              ? Number(item.popularityCount)
              : 0,
          reference: Array.isArray(item.reference) ? item.reference : [],
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
      setParseError(`Validation Error: ${err.message || "সারাংশ যাচাই করতে সমস্যা হয়েছে।"}`)
    }
  }

  const handleAutoFixJson = () => {
    if (!jsonText.trim()) return
    const repaired = repairJsonSyntax(jsonText)
    setJsonText(repaired)
    validateAndParseJson(repaired, selectedAcademicClassId, selectedSubjectId)
    toast.success("JSON ফরম্যাট স্বয়ংক্রিয় মেরামত সম্পন্ন!")
  }

  const syncParsedItemsToText = (newItems: any[]) => {
    setParsedItems(newItems)
    setParseError(null)
    setErrorContext(null)
    setJsonText(JSON.stringify(newItems, null, 2))
  }

  const handleJsonChange = (val: string) => {
    setJsonText(val)
    validateAndParseJson(val, selectedAcademicClassId, selectedSubjectId)
  }

  const handleAcademicClassChange = (val: string) => {
    const value = val === "all" ? "" : (val ?? "")
    setSelectedAcademicClassId(value)
    setSelectedSubjectId("")
    if (jsonText) {
      validateAndParseJson(jsonText, value, "")
    }
  }

  const handleSubjectChange = (val: string | null) => {
    const value = val ?? ""
    setSelectedSubjectId(value)
    if (jsonText) {
      validateAndParseJson(jsonText, selectedAcademicClassId, value)
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
    toast.info(`সারাংশ #${toBengaliDigits(idx + 1)} সরানো হয়েছে।`)
  }

  const handleDuplicateParsedItem = (idx: number) => {
    const itemToCopy = parsedItems[idx]
    if (!itemToCopy) return
    const next = [...parsedItems]
    next.splice(idx + 1, 0, {
      ...itemToCopy,
      title: `${itemToCopy.title} (কপি)`,
    })
    syncParsedItemsToText(next)
    toast.success(`সারাংশ #${toBengaliDigits(idx + 1)} ডুপ্লিকেট করা হয়েছে।`)
  }

  const handleAddNewQuestionCard = () => {
    const newSummary = {
      title: "নতুন সারাংশ / সারমর্ম অনুচ্ছেদ...",
      difficulty: "MEDIUM",
      popularityCount: 0,
      reference: [],
      subjectId: selectedSubjectId,
    }
    const next = [...parsedItems, newSummary]
    syncParsedItemsToText(next)
  }

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(sampleJsonTemplate)
    toast.success("নমুনা JSON টেমপ্লেট ক্লিপবোর্ডে কপি করা হয়েছে!")
  }

  const handleImport = async () => {
    if (parsedItems.length === 0 || parseError) {
      toast.error("ইম্পোর্ট করার পূর্বে ত্রুটিসমূহ সংশোধন করুন।")
      return
    }

    try {
      const payload = parsedItems.map((item) => ({
        subjectId: selectedSubjectId || item.subjectId,
        title: item.title.trim(),
        difficulty: item.difficulty as any,
        popularityCount: Number(item.popularityCount) || 0,
        reference: Array.isArray(item.reference) ? item.reference : [],
      }))

      const res = await importMutation.mutateAsync({ summaries: payload })
      toast.success(`সফলভাবে ${toBengaliDigits(res.importedCount)}টি সারাংশ ইম্পোর্ট করা হয়েছে!`)
      setTimeout(() => {
        router.push("/summaries")
      }, 800)
    } catch (err: any) {
      toast.error(err.message || "বাল্ক ইম্পোর্ট ব্যর্থ হয়েছে")
    }
  }

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200 pb-12">
      {/* Shared Page Header */}
      <PageHeader
        title="JSON থেকে সারাংশ ও সারমর্ম ইম্পোর্ট"
        description="JSON ফাইল আপলোড বা সরাসরি টেক্সট পেস্ট করে একসাথে একাধিক সারাংশ ও সারমর্ম যাচাই, সম্পাদনা ও ইম্পোর্ট করুন।"
        icon={Upload}
        badge={{ label: "বাল্ক ইম্পোর্ট", variant: "indigo" }}
        breadcrumbs={[
          { label: "সারাংশ তালিকা", href: "/summaries" },
          { label: "JSON ইম্পোর্ট" },
        ]}
      >
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowSample(!showSample)}
            className="h-10 px-4 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Code className="w-4 h-4" />
            <span>{showSample ? "টেমপ্লেট লুকান" : "নমুনা JSON দেখুন"}</span>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-10 px-4 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Link href="/summaries" prefetch={true}>
              <ArrowLeft className="w-4 h-4" />
              <span>তালিকায় ফিরে যান</span>
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* Sample JSON Template Card */}
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
              className="rounded-xl border border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-primary/20 dark:text-primary text-xs font-bold h-8 px-3 cursor-pointer"
            >
              টেমপ্লেট কপি করুন
            </Button>
          </div>
          <pre className="whitespace-pre-wrap break-all sm:break-normal overflow-x-auto rounded-xl bg-card p-4 font-mono text-xs text-foreground leading-relaxed border border-slate-200/80 dark:border-white/[0.08]">
            {sampleJsonTemplate}
          </pre>
        </Card>
      )}

      {/* Step 1 Card: Data Source & Hierarchy Setup */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs overflow-hidden">
        <CardHeader className="border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-5 sm:p-7 flex flex-row items-center gap-3.5 sm:gap-4">
          <div className="flex size-11 sm:size-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-primary border border-indigo-100/80 dark:border-primary/20 shrink-0">
            <Layers className="h-5 w-5 sm:h-6 sm:w-6 stroke-[1.8]" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold font-headline text-foreground">
              ১. শ্রেণি ও বিষয় কনফিগারেশন
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              যেসব সারাংশে বিষয় আইডি নেই, সেগুলোর জন্য ডিফল্ট শ্রেণি ও বিষয় নির্ধারণ করুন।
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
          </div>

          {/* Warning if Subject is not selected */}
          {(!selectedAcademicClassId || !selectedSubjectId) && (
            <div className="flex items-center gap-2.5 rounded-xl border border-amber-200/70 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 p-3.5 text-amber-800 dark:text-amber-400 text-xs font-medium font-body">
              <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>ফাইল আপলোড বা ইনপুট দেওয়ার জন্য শ্রেণি ও ডিফল্ট বিষয় নির্বাচন করুন।</span>
            </div>
          )}

          {/* JSON File Uploader */}
          <div className="border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
            <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              JSON ফাইল আপলোড
            </Label>
            <input
              type="file"
              accept=".json,application/json"
              disabled={!selectedAcademicClassId || !selectedSubjectId}
              onChange={handleFileUpload}
              className="block w-full text-sm text-foreground file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-primary/10 dark:file:text-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed file:disabled:pointer-events-none"
            />
          </div>

          {/* Or Paste JSON Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                অথবা নিচে সরাসরি JSON পেস্ট করুন
              </Label>
              {jsonText.trim() && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAutoFixJson}
                  className="rounded-xl border border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-primary/20 dark:text-primary text-xs font-bold h-8 px-3 cursor-pointer"
                >
                  <Wand2 className="size-3.5 mr-1" />
                  স্বয়ংক্রিয় মেরামত (Auto Repair)
                </Button>
              )}
            </div>
            <Textarea
              rows={6}
              disabled={!selectedAcademicClassId || !selectedSubjectId}
              placeholder={
                !selectedAcademicClassId || !selectedSubjectId
                  ? "ইনপুট সক্রিয় করতে উপরে শ্রেণি ও বিষয় নির্বাচন করুন..."
                  : "JSON অ্যারে পেস্ট করুন..."
              }
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] p-4 font-mono text-xs text-foreground focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 disabled:opacity-50"
            />
          </div>

          {/* Diagnostics Alert */}
          {parseError && (
            <div className="space-y-3 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 p-4 text-rose-700 dark:text-rose-400">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="size-5 shrink-0" />
                  <p className="font-bold text-sm font-headline">JSON পার্সিং ত্রুটি</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAutoFixJson}
                  className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-8 px-3 cursor-pointer shadow-xs"
                >
                  <Wand2 className="size-3.5 mr-1" />
                  স্বয়ংক্রিয় মেরামত করুন
                </Button>
              </div>

              <p className="font-mono text-xs leading-relaxed bg-white/80 dark:bg-black/30 p-3 rounded-xl border border-rose-200 dark:border-rose-900/40">
                {parseError}
              </p>

              {/* Code Snippet Error Pointer */}
              {errorContext && errorContext.linesContext.length > 0 && (
                <div className="space-y-1 pt-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 font-headline">
                    ত্রুটির সম্ভাব্য স্থান (লাইন {toBengaliDigits(errorContext.line)}
                    {errorContext.col > 0 ? `, কলাম ${toBengaliDigits(errorContext.col)}` : ""}):
                  </p>
                  <div className="overflow-x-auto rounded-xl bg-slate-900 p-3 font-mono text-xs text-slate-200">
                    {errorContext.linesContext.map((l) => (
                      <div
                        key={l.num}
                        className={cn(
                          "flex items-center gap-3 px-2 py-0.5 rounded",
                          l.isError && "bg-rose-900/80 text-white font-bold border-l-4 border-rose-500"
                        )}
                      >
                        <span className="w-8 shrink-0 text-right text-slate-500 select-none">
                          {l.num}
                        </span>
                        <span className="whitespace-pre">{l.content}</span>
                        {l.isError && (
                          <span className="ml-auto text-[10px] uppercase tracking-wider bg-rose-600 text-white px-1.5 py-0.5 rounded shrink-0">
                            Error
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-950/20 p-4 text-emerald-800 dark:text-emerald-400 text-sm">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold font-headline">JSON সফলভাবে যাচাই করা হয়েছে!</p>
                  <p className="text-xs font-body">
                    মোট {toBengaliDigits(parsedItems.length)}টি সারাংশ পাওয়া গেছে।
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddNewQuestionCard}
                className="rounded-xl border border-emerald-300 text-emerald-800 dark:border-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 text-xs font-bold h-8 px-3 cursor-pointer"
              >
                <Plus className="size-3.5 mr-1" />
                নতুন সারাংশ কার্ড যোগ করুন
              </Button>
            </div>
          )}

          {/* Parsed Items Card-based Preview */}
          {parsedItems.length > 0 && (
            <div className="border-t border-slate-200/80 dark:border-white/[0.08] pt-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h4 className="text-base font-bold font-headline text-foreground flex items-center gap-2">
                  <Code className="size-4 text-indigo-600 dark:text-primary shrink-0" />
                  কার্ড প্রিভিউ ({toBengaliDigits(parsedItems.length)}টি সারাংশ)
                </h4>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddNewQuestionCard}
                  className="rounded-xl border border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-primary/20 dark:text-primary text-xs font-bold h-8 px-3 cursor-pointer"
                >
                  <Plus className="size-3.5 mr-1" />
                  নতুন সারাংশ যোগ করুন
                </Button>
              </div>

              {/* Grid of Summary Preview Cards */}
              <div className="space-y-4 sm:space-y-6">
                {parsedItems.map((item, idx) => (
                  <EditableSummaryCard
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
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:items-center sm:justify-between border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
            <Button
              asChild
              type="button"
              variant="outline"
              className="rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] font-semibold text-foreground px-5 h-11"
            >
              <Link href="/summaries">বাতিল করুন</Link>
            </Button>

            <Button
              type="button"
              disabled={parsedItems.length === 0 || Boolean(parseError) || importMutation.isPending}
              onClick={handleImport}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 h-11 gap-2 shadow-sm shadow-indigo-200 dark:shadow-none transition-all cursor-pointer font-headline"
            >
              {importMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>ইম্পোর্ট হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>
                    সবগুলো সারাংশ ইম্পোর্ট করুন ({toBengaliDigits(parsedItems.length)}টি)
                  </span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
