"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@workspace/ui/components/sonner"
import {
  useImportJuktoborno,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-juktoborno"
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
import { JUKTOBORNO_SOURCE_OPTIONS, DEFAULT_SOURCE } from "../constants"
import {
  Upload,
  ArrowLeft,
  Code,
  FileCode,
  Wand2,
  AlertCircle,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  BookOpen,
  Layers,
} from "lucide-react"

const sampleJsonTemplate = `[
  {
    "juktoborno": "ক্ষ",
    "reference": ["ঢাকা বোর্ড ২০২৪", "রাজশাহী বোর্ড ২০২৩"],
    "source": "বোর্ড বই",
    "session": "2024",
    "difficulty": "EASY",
    "popularityCount": 12
  },
  {
    "juktoborno": "জ্ঞ",
    "reference": ["চট্টগ্রাম বোর্ড ২০২২"],
    "source": "বৃত্তি সহায়িকা",
    "session": "2023",
    "difficulty": "MEDIUM",
    "popularityCount": 8
  }
]`

// Smart JSON Syntax Repair Engine
export function repairJsonSyntax(raw: string): string {
  let cleaned = raw.trim()

  // 1. Strip markdown code fencing
  cleaned = cleaned.replace(/^```(?:json)?\s*/gi, "").replace(/\s*```$/g, "").trim()

  // Remove trailing comma at the end of input
  if (cleaned.endsWith(",")) {
    cleaned = cleaned.slice(0, -1).trim()
  }

  // 2. Normalize smart quotes to standard quotes
  cleaned = cleaned.replace(/[“”]/g, '"').replace(/[‘’]/g, "'")

  // 3. Strip single-line comments
  cleaned = cleaned.replace(/^\s*\/\/.*$/gm, "")

  // 4. Escape LaTeX backslashes that are unescaped
  cleaned = cleaned.replace(
    /(?<!\\)\\(rightarrow|right|rho|rangle|Rightarrow|roots|rceil|rfloor|times|theta|text|tan|tau|tilde|to|therefore|triangle|tanh|top|tiny|textbf|textit|texttt|tfrac|tag|frac|forall|flat|beta|begin|bar|mathbf|binom|big|Big|bullet|bot|boldsymbol|bmatrix|bmod|neq|nabla|nu|not|null|neg|natural|ni|norm|sqrt|pm|cdot|alpha|pi|sigma|sum|int|infty|leq|geq|approx)\b/g,
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

  let errorLine = -1
  let errorCol = -1

  if (lineMatch?.[1] && colMatch?.[1]) {
    errorLine = parseInt(lineMatch[1], 10)
    errorCol = parseInt(colMatch[1], 10)
  } else if (charPos >= 0) {
    let count = 0
    for (let i = 0; i < lines.length; i++) {
      const lineLen = (lines[i]?.length ?? 0) + 1
      if (count + lineLen > charPos) {
        errorLine = i + 1
        errorCol = charPos - count + 1
        break
      }
      count += lineLen
    }
  }

  if (errorLine > 0) {
    const start = Math.max(0, errorLine - 3)
    const end = Math.min(lines.length, errorLine + 2)
    const linesContext = lines.slice(start, end).map((content, idx) => ({
      num: start + idx + 1,
      content,
      isError: start + idx + 1 === errorLine,
    }))
    return { line: errorLine, col: errorCol, linesContext }
  }

  return null
}

interface ParsedJuktobornoCardProps {
  item: any
  index: number
  isExpanded: boolean
  onToggleExpand: () => void
  onChange: (updated: any) => void
  onDuplicate: () => void
  onDelete: () => void
}

function ParsedJuktobornoCard({
  item,
  index,
  isExpanded,
  onToggleExpand,
  onChange,
  onDuplicate,
  onDelete,
}: ParsedJuktobornoCardProps) {
  const hasErrors = !item.juktoborno || item.juktoborno.trim() === ""

  return (
    <Card
      className={cn(
        "rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs",
        hasErrors
          ? "border-rose-400 bg-rose-50/20 dark:bg-rose-950/10"
          : "border-slate-200/80 dark:border-white/[0.08] bg-card hover:border-indigo-300"
      )}
    >
      <div className="p-4 sm:p-5 space-y-3">
        {/* Card Header Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-primary/10 font-solaiman text-xs font-bold text-indigo-700 dark:text-primary rounded-lg border border-indigo-200/60 dark:border-primary/20">
              #{toBengaliDigits(index + 1)}
            </span>
            <Badge
              variant="outline"
              className={cn(
                "rounded-md text-[11px] font-bold font-body",
                item.difficulty === "HARD"
                  ? "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/40"
                  : item.difficulty === "EASY"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40"
                  : "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/40"
              )}
            >
              {item.difficulty === "HARD" ? "কঠিন" : item.difficulty === "EASY" ? "সহজ" : "মাঝারি"}
            </Badge>
            {item.source && (
              <span className="text-[11px] text-muted-foreground font-semibold font-body">
                • {item.source} {item.session || item.year ? `(${item.session || item.year})` : ""}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onDuplicate}
              className="h-8 px-2.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-indigo-600 cursor-pointer"
              title="ডুপ্লিকেট করুন"
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 px-2.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
              title="মুছে ফেলুন"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onToggleExpand}
              className="h-8 px-2.5 rounded-lg text-xs font-semibold gap-1 border-slate-200 dark:border-white/[0.08] cursor-pointer"
            >
              <span>{isExpanded ? "সংক্ষেপ" : "সম্পাদনা"}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>

        {/* Collapsed Preview */}
        {!isExpanded && (
          <div className="space-y-1.5">
            <p className="text-base sm:text-lg font-bold text-foreground line-clamp-1 font-headline">
              <RenderMath text={item.juktoborno || "(যুক্তবর্ণ অনুপস্থিত)"} isMath={false} />
            </p>
          </div>
        )}

        {/* Expanded In-Place Editor Form */}
        {isExpanded && (
          <div className="space-y-4 pt-3 border-t border-slate-200/80 dark:border-white/[0.08]">
            {/* Juktoborno Input */}
            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                যুক্তবর্ণ <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="text"
                value={item.juktoborno || ""}
                onChange={(e) => onChange({ ...item, juktoborno: e.target.value })}
                placeholder="যুক্তবর্ণ লিখুন..."
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-sm h-11 px-3 font-headline font-bold"
              />
            </div>

            {/* Difficulty & Source Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  কাঠিন্য
                </Label>
                <Select
                  value={item.difficulty || "MEDIUM"}
                  onValueChange={(val) => onChange({ ...item, difficulty: val })}
                >
                  <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-xs h-10 px-3 font-body">
                    <SelectValue placeholder="কাঠিন্য" />
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
              <div className="space-y-1.5">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  উৎস
                </Label>
                <Input
                  type="text"
                  value={item.source || ""}
                  onChange={(e) => onChange({ ...item, source: e.target.value })}
                  placeholder="যেমন: বোর্ড প্রশ্ন"
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-xs h-10 px-3 font-body"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export function ImportJuktobornoView() {
  const router = useRouter()
  const importMutation = useImportJuktoborno()

  // Step state: 1 = JSON Input, 2 = Review & Confirm
  const [step, setStep] = useState<1 | 2>(1)

  // Step 1: Target hierarchy setup state
  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState<string>("")
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("")
  const [selectedChapterId, setSelectedChapterId] = useState<string>("")
  const [selectedSource, setSelectedSource] = useState<string>(DEFAULT_SOURCE)

  // JSON input state
  const [jsonText, setJsonText] = useState<string>("")
  const [parseError, setParseError] = useState<string | null>(null)
  const [errorContext, setErrorContext] = useState<ReturnType<typeof findJsonErrorPosition> | null>(null)

  // Step 2: Parsed items state
  const [parsedItems, setParsedItems] = useState<any[]>([])
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({})

  // Dependent selection queries
  const { data: academicClasses = [] } = useAcademicClassesForSelection()

  const { data: subjects = [] } = useSubjectsForSelection(
    selectedAcademicClassId && selectedAcademicClassId !== "all"
      ? { academicClassId: selectedAcademicClassId }
      : undefined
  )

  const { data: chapters = [] } = useChaptersForSelection(
    selectedSubjectId && selectedSubjectId !== "all"
      ? { subjectId: selectedSubjectId }
      : undefined
  )

  const isSetupValid = Boolean(selectedAcademicClassId && selectedSubjectId && selectedChapterId)

  // Auto-fill template
  const handleLoadSample = () => {
    setJsonText(sampleJsonTemplate)
    setParseError(null)
    setErrorContext(null)
    toast.success("নমুনা যুক্তবর্ণ JSON লোড করা হয়েছে")
  }

  // Repair syntax
  const handleRepairSyntax = () => {
    if (!jsonText.trim()) return
    const repaired = repairJsonSyntax(jsonText)
    setJsonText(repaired)
    toast.success("JSON সিনট্যাক্স স্বয়ংক্রিয়ভাবে পরিমার্জন করা হয়েছে")
  }

  // Parse Step 1 to Step 2
  const handleProceedToReview = () => {
    setParseError(null)
    setErrorContext(null)

    if (!selectedAcademicClassId) {
      toast.error("অনুগ্রহ করে একটি শ্রেণি নির্বাচন করুন")
      return
    }
    if (!selectedSubjectId) {
      toast.error("অনুগ্রহ করে একটি বিষয় নির্বাচন করুন")
      return
    }
    if (!selectedChapterId) {
      toast.error("অনুগ্রহ করে একটি অধ্যায় নির্বাচন করুন")
      return
    }
    if (!jsonText.trim()) {
      toast.error("JSON ডেটা ফাঁকা রাখা যাবে না")
      return
    }

    try {
      const parsed = JSON.parse(jsonText)
      const list = Array.isArray(parsed) ? parsed : [parsed]

      if (list.length === 0) {
        setParseError("JSON অ্যারেতে কমপক্ষে একটি যুক্তবর্ণ থাকতে হবে")
        return
      }

      const normalized = list.map((item: any) => ({
        juktoborno: typeof item.juktoborno === "string" ? item.juktoborno.trim() : "",
        reference: Array.isArray(item.reference)
          ? item.reference.map(String)
          : item.referenceText
          ? String(item.referenceText).split(",").map((s) => s.trim())
          : [],
        source: item.source || selectedSource || DEFAULT_SOURCE,
        session: item.session ? String(item.session) : item.year ? String(item.year) : new Date().getFullYear().toString(),
        difficulty: (item.difficulty as any) || QUESTION_DIFFICULTY.MEDIUM,
        popularityCount: typeof item.popularityCount === "number" ? item.popularityCount : 0,
        isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
      }))

      setParsedItems(normalized)
      setStep(2)
      toast.success(`${toBengaliDigits(normalized.length)}টি যুক্তবর্ণ সফলভাবে পার্স করা হয়েছে!`)
    } catch (e: any) {
      const text = jsonText
      const cleaned = repairJsonSyntax(text)
      try {
        const parsedCleaned = JSON.parse(cleaned)
        const list = Array.isArray(parsedCleaned) ? parsedCleaned : [parsedCleaned]
        const normalized = list.map((item: any) => ({
          juktoborno: typeof item.juktoborno === "string" ? item.juktoborno.trim() : "",
          reference: Array.isArray(item.reference) ? item.reference.map(String) : [],
          source: item.source || selectedSource || DEFAULT_SOURCE,
          session: item.session ? String(item.session) : new Date().getFullYear().toString(),
          difficulty: (item.difficulty as any) || QUESTION_DIFFICULTY.MEDIUM,
          popularityCount: typeof item.popularityCount === "number" ? item.popularityCount : 0,
          isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
        }))
        setParsedItems(normalized)
        setStep(2)
        toast.success(`স্বয়ংক্রিয় সিনট্যাক্স সংশোধনের মাধ্যমে ${toBengaliDigits(normalized.length)}টি যুক্তবর্ণ পার্স করা হয়েছে!`)
      } catch (err: any) {
        const errMsg = err.message || "ভুল JSON ফরম্যাট"
        setParseError(`পার্সিং ত্রুটি: ${errMsg}`)
        const errLoc = findJsonErrorPosition(text, errMsg)
        setErrorContext(errLoc)
        return
      }
    }
  }

  // Card list operations
  const handleItemChange = (index: number, updated: any) => {
    setParsedItems((prev) => {
      const copy = [...prev]
      copy[index] = updated
      return copy
    })
  }

  const handleDuplicateItem = (index: number) => {
    setParsedItems((prev) => {
      const copy = [...prev]
      const dup = { ...copy[index] }
      copy.splice(index + 1, 0, dup)
      return copy
    })
    toast.success(`যুক্তবর্ণ #${toBengaliDigits(index + 1)} ডুপ্লিকেট করা হয়েছে`)
  }

  const handleDeleteItem = (index: number) => {
    setParsedItems((prev) => prev.filter((_, idx) => idx !== index))
    toast.success(`যুক্তবর্ণ #${toBengaliDigits(index + 1)} তালিকা থেকে বাদ দেওয়া হয়েছে`)
  }

  const handleExpandAll = (expanded: boolean) => {
    const next: Record<number, boolean> = {}
    parsedItems.forEach((_, idx) => {
      next[idx] = expanded
    })
    setExpandedCards(next)
  }

  // Step 2: Final Submission
  const handleExecuteImport = async () => {
    if (parsedItems.length === 0) {
      toast.error("ইমপোর্ট করার জন্য কোনো যুক্তবর্ণ নেই")
      return
    }

    const invalid = parsedItems.filter((q) => !q.juktoborno || q.juktoborno.trim() === "")
    if (invalid.length > 0) {
      toast.error(`${toBengaliDigits(invalid.length)}টি এন্ট্রিতে যুক্তবর্ণ অনুপস্থিত`)
      return
    }

    try {
      const payload = {
        questions: parsedItems.map((item) => ({
          subjectId: selectedSubjectId,
          chapterId: selectedChapterId,
          academicChapterId: selectedChapterId,
          juktoborno: item.juktoborno.trim(),
          difficulty: item.difficulty || QUESTION_DIFFICULTY.MEDIUM,
          reference: item.reference || [],
          source: item.source || selectedSource || DEFAULT_SOURCE,
          session: item.session || new Date().getFullYear().toString(),
          popularityCount: item.popularityCount || 0,
          isActive: item.isActive !== undefined ? item.isActive : true,
        })),
      }

      const res = await importMutation.mutateAsync(payload)
      toast.success(`অভিনন্দন! মোট ${toBengaliDigits(res.importedCount)}টি যুক্তবর্ণ সফলভাবে ইমপোর্ট সম্পন্ন হয়েছে।`)
      router.push("/juktoborno")
    } catch (err: any) {
      toast.error(err.message || "বাল্ক ইমপোর্ট সম্পন্ন করা সম্ভব হয়নি")
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="যুক্তবর্ণ বাল্ক JSON ইমপোর্ট"
        description="JSON ফরম্যাট ব্যবহার করে একসাথে একাধিক যুক্তবর্ণ ভ্যালিডেট ও ইমপোর্ট করুন।"
        badge={{ label: "বাল্ক ইমপোর্ট পাইপলাইন", variant: "indigo" }}
        icon={BookOpen}
        breadcrumbs={[
          { label: "ড্যাশবোর্ড", href: "/" },
          { label: "যুক্তবর্ণ", href: "/juktoborno" },
          { label: "JSON ইমপোর্ট" },
        ]}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-foreground font-semibold text-xs sm:text-sm gap-2 font-headline cursor-pointer"
        >
          <Link href="/juktoborno" prefetch={true}>
            <ArrowLeft className="w-4 h-4" />
            <span>তালিকায় ফিরে যান</span>
          </Link>
        </Button>
      </PageHeader>

      {/* Pipeline Step Progress Bar */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div
          onClick={() => setStep(1)}
          className={cn(
            "flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer",
            step === 1
              ? "border-indigo-600 bg-indigo-50/20 dark:bg-primary/10 ring-2 ring-indigo-500/20"
              : "border-slate-200/80 dark:border-white/[0.08] bg-card opacity-80"
          )}
        >
          <div
            className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 font-headline",
              step === 1 ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-white/10 text-muted-foreground"
            )}
          >
            ১
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-foreground font-headline truncate">
              JSON ইনপুট ও ভ্যালিডেশন
            </p>
            <p className="text-[11px] text-muted-foreground truncate font-body">শ্রেণি ও সিনট্যাক্স যাচাই</p>
          </div>
        </div>

        <div
          onClick={() => {
            if (parsedItems.length > 0) setStep(2)
          }}
          className={cn(
            "flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border transition-all",
            parsedItems.length > 0 ? "cursor-pointer" : "cursor-not-allowed opacity-50",
            step === 2
              ? "border-indigo-600 bg-indigo-50/20 dark:bg-primary/10 ring-2 ring-indigo-500/20"
              : "border-slate-200/80 dark:border-white/[0.08] bg-card"
          )}
        >
          <div
            className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 font-headline",
              step === 2 ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-white/10 text-muted-foreground"
            )}
          >
            ২
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-foreground font-headline truncate">
              প্রিভিউ ও সম্পাদনা ({toBengaliDigits(parsedItems.length)}টি)
            </p>
            <p className="text-[11px] text-muted-foreground truncate font-body">যাচাই ও চূড়ান্ত সংরক্ষণ</p>
          </div>
        </div>
      </div>

      {/* STEP 1: HIERARCHY SETUP & JSON INPUT */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Target Academic Hierarchy Setup Card */}
          <Card className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs overflow-hidden">
            <CardHeader className="border-b border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-6 bg-slate-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-indigo-600 dark:text-primary" />
                <CardTitle className="text-base font-bold text-foreground font-headline">
                  টার্গেট শ্রেণি ও পাঠ্যক্রম সেটিংস
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Academic Class */}
                <div className="space-y-2">
                  <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                    শ্রেণি (Class) <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={selectedAcademicClassId}
                    onValueChange={(val) => {
                      setSelectedAcademicClassId(val)
                      setSelectedSubjectId("")
                      setSelectedChapterId("")
                    }}
                  >
                    <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-sm h-11 px-4 font-body">
                      <SelectValue placeholder="শ্রেণি নির্বাচন করুন..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg">
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
                  <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                    বিষয় (Subject) <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={selectedSubjectId}
                    disabled={!selectedAcademicClassId}
                    onValueChange={(val) => {
                      setSelectedSubjectId(val)
                      setSelectedChapterId("")
                    }}
                  >
                    <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-sm h-11 px-4 disabled:opacity-50 font-body">
                      <SelectValue placeholder="বিষয় নির্বাচন করুন..." />
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

                {/* Chapter */}
                <div className="space-y-2">
                  <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                    অধ্যায় (Chapter) <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={selectedChapterId}
                    disabled={!selectedSubjectId}
                    onValueChange={setSelectedChapterId}
                  >
                    <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-sm h-11 px-4 disabled:opacity-50 font-body">
                      <SelectValue placeholder="অধ্যায় নির্বাচন করুন..." />
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
                  <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                    ডিফল্ট উৎস (Default Source)
                  </Label>
                  <Select value={selectedSource} onValueChange={setSelectedSource}>
                    <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-sm h-11 px-4 font-body">
                      <SelectValue placeholder="উৎস নির্বাচন করুন..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg">
                      {JUKTOBORNO_SOURCE_OPTIONS.map((opt) => (
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

          {/* JSON Text Input Card */}
          <Card className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs overflow-hidden">
            <CardHeader className="border-b border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-6 bg-slate-50/50 dark:bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <FileCode className="w-5 h-5 text-indigo-600 dark:text-primary" />
                <CardTitle className="text-base font-bold text-foreground font-headline">
                  JSON ডেটা এডিটর
                </CardTitle>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleLoadSample}
                  className="rounded-xl border-slate-200 dark:border-white/[0.08] text-xs font-semibold gap-1.5 cursor-pointer font-headline"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>নমুনা ফরম্যাট লোড করুন</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRepairSyntax}
                  className="rounded-xl border-slate-200 dark:border-white/[0.08] text-xs font-semibold gap-1.5 cursor-pointer text-indigo-600 dark:text-primary font-headline"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>সিনট্যাক্স ঠিক করুন</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-5 sm:p-6 space-y-4">
              <Textarea
                rows={16}
                value={jsonText}
                onChange={(e) => {
                  setJsonText(e.target.value)
                  if (parseError) setParseError(null)
                  if (errorContext) setErrorContext(null)
                }}
                placeholder="এখানে যুক্তবর্ণের JSON কোড পেস্ট করুন..."
                className="w-full rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-card text-foreground font-mono text-xs sm:text-sm p-4 leading-relaxed focus:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/20"
              />

              {/* Diagnostic Error Locator Callout */}
              {parseError && (
                <div className="rounded-2xl border border-rose-300 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm font-headline">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{parseError}</span>
                  </div>

                  {errorContext && (
                    <div className="space-y-1 bg-slate-950 rounded-xl p-3 font-mono text-xs overflow-x-auto">
                      <p className="text-[11px] text-muted-foreground pb-1 font-sans">
                        ভুল শনাক্তকারী লাইন: {toBengaliDigits(errorContext.line)}, কলাম: {toBengaliDigits(errorContext.col)}
                      </p>
                      {errorContext.linesContext.map((l) => (
                        <div
                          key={l.num}
                          className={cn(
                            "flex items-start gap-3 py-0.5 px-2 rounded",
                            l.isError ? "bg-rose-900/40 text-rose-300 font-bold" : "text-slate-400"
                          )}
                        >
                          <span className="w-8 shrink-0 text-right opacity-50 select-none">{l.num} |</span>
                          <span className="whitespace-pre-wrap">{l.content}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Proceed Action Button */}
              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  onClick={handleProceedToReview}
                  disabled={!isSetupValid || !jsonText.trim()}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 px-6 gap-2 shadow-sm shadow-indigo-200 dark:shadow-none transition-all font-headline cursor-pointer disabled:opacity-50"
                >
                  <span>যাচাই ও প্রিভিউ করুন</span>
                  <CheckCircle2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* STEP 2: REVIEW & CONFIRMATION CARDS LIST */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Review Summary Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-xl font-headline">
                মোট {toBengaliDigits(parsedItems.length)}টি যুক্তবর্ণ
              </span>
              <span className="text-xs text-muted-foreground font-body">
                প্রয়োজনমতো যুক্তবর্ণের তথ্য সরাসরি এডিট করে সংরক্ষণ করুন।
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleExpandAll(true)}
                className="rounded-xl text-xs font-semibold gap-1.5 h-9 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>সব প্রসারিত করুন</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleExpandAll(false)}
                className="rounded-xl text-xs font-semibold gap-1.5 h-9 cursor-pointer"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>সব সংক্ষেপ করুন</span>
              </Button>
            </div>
          </div>

          {/* Cards List */}
          <div className="grid grid-cols-1 gap-4">
            {parsedItems.map((item, idx) => (
              <ParsedJuktobornoCard
                key={idx}
                item={item}
                index={idx}
                isExpanded={Boolean(expandedCards[idx])}
                onToggleExpand={() =>
                  setExpandedCards((prev) => ({
                    ...prev,
                    [idx]: !prev[idx],
                  }))
                }
                onChange={(updated) => handleItemChange(idx, updated)}
                onDuplicate={() => handleDuplicateItem(idx)}
                onDelete={() => handleDeleteItem(idx)}
              />
            ))}
          </div>

          {/* Bottom Execution Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="rounded-xl border-slate-200 dark:border-white/[0.08] text-foreground font-semibold px-6 h-11 font-headline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>পূর্বের ধাপে ফিরে যান</span>
            </Button>

            <Button
              type="button"
              onClick={handleExecuteImport}
              disabled={importMutation.isPending || parsedItems.length === 0}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 h-11 gap-2 shadow-sm shadow-indigo-200 dark:shadow-none transition-all font-headline cursor-pointer"
            >
              {importMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>ইমপোর্ট হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>সবগুলো ({toBengaliDigits(parsedItems.length)}টি) সংরক্ষণ করুন</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
