"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@workspace/ui/components/sonner"
import {
  useImportMakeSentences,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-make-sentences"
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
import { MAKE_SENTENCES_SOURCE_OPTIONS, DEFAULT_SOURCE } from "../constants"
import {
  Upload,
  ArrowLeft,
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
  BookOpen,
  Sparkles,
  Layers,
} from "lucide-react"

const sampleJsonTemplate = `[
  {
    "word": "বিদ্যালয়",
    "reference": ["ঢাকা বোর্ড ২০২৪", "রাজশাহী বোর্ড ২০২৩"],
    "source": "গাইড বুক",
    "session": "2024",
    "difficulty": "EASY",
    "popularityCount": 12
  },
  {
    "word": "পরিবেশ",
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

  if (errorLine === -1) errorLine = 1
  if (errorCol === -1) errorCol = 1

  const startLineIdx = Math.max(0, errorLine - 3)
  const endLineIdx = Math.min(lines.length - 1, errorLine + 1)
  const context = []

  for (let idx = startLineIdx; idx <= endLineIdx; idx++) {
    context.push({
      num: idx + 1,
      text: lines[idx] || "",
      isError: idx + 1 === errorLine,
    })
  }

  return {
    line: errorLine,
    col: errorCol,
    linesContext: context,
  }
}

export function ImportMakeSentencesView() {
  const router = useRouter()
  const importMutation = useImportMakeSentences()

  // Academic Hierarchy Selection
  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState("")
  const [selectedSubjectId, setSelectedSubjectId] = useState("")
  const [selectedChapterId, setSelectedChapterId] = useState("")
  const [selectedSource, setSelectedSource] = useState(DEFAULT_SOURCE)

  // Pipeline Step State (1: Input & Validate, 2: Preview & Edit)
  const [step, setStep] = useState<1 | 2>(1)
  const [jsonText, setJsonText] = useState("")
  const [parseError, setParseError] = useState<string | null>(null)
  const [errorContext, setErrorContext] = useState<ReturnType<typeof findJsonErrorPosition> | null>(null)

  // Parsed Questions Collection
  const [parsedItems, setParsedItems] = useState<any[]>([])
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({})

  // Queries for selectors
  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedAcademicClassId ? { academicClassId: selectedAcademicClassId } : undefined
  )
  const { data: chapters = [] } = useChaptersForSelection(
    selectedSubjectId ? { subjectId: selectedSubjectId } : undefined
  )

  // Load sample json format
  const handleLoadSample = () => {
    setJsonText(sampleJsonTemplate)
    setParseError(null)
    setErrorContext(null)
    toast.success("নমুনা JSON লোড করা হয়েছে")
  }

  // Repair syntax
  const handleRepairSyntax = () => {
    if (!jsonText.trim()) {
      toast.error("মেরামত করার জন্য কোনো JSON পাওয়া যায়নি")
      return
    }
    const repaired = repairJsonSyntax(jsonText)
    setJsonText(repaired)
    setParseError(null)
    setErrorContext(null)
    toast.success("সিনট্যাক্স স্বয়ংক্রিয়ভাবে পরিমার্জন করা হয়েছে")
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
        setParseError("JSON অ্যারেতে কমপক্ষে একটি বাক্য গঠনের শব্দ থাকতে হবে")
        return
      }

      const normalized = list.map((item: any, idx: number) => ({
        word: typeof item.word === "string" ? item.word.trim() : "",
        reference: Array.isArray(item.reference)
          ? item.reference.map(String)
          : item.referenceText
          ? String(item.referenceText).split(",").map((s) => s.trim())
          : [],
        source: item.source || selectedSource || DEFAULT_SOURCE,
        session: item.session ? String(item.session) : new Date().getFullYear().toString(),
        difficulty: (item.difficulty as any) || QUESTION_DIFFICULTY.MEDIUM,
        popularityCount: typeof item.popularityCount === "number" ? item.popularityCount : 0,
        isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
      }))

      setParsedItems(normalized)
      setStep(2)
      toast.success(`${toBengaliDigits(normalized.length)}টি শব্দ সফলভাবে পার্স করা হয়েছে!`)
    } catch (err: any) {
      const msg = err.message || "Invalid JSON syntax"
      setParseError(msg)
      const ctx = findJsonErrorPosition(jsonText, msg)
      setErrorContext(ctx)
      toast.error("JSON সিনট্যাক্সে ত্রুটি রয়েছে। ঠিক করে আবার চেষ্টা করুন।")
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
    toast.success(`শব্দ #${toBengaliDigits(index + 1)} ডুপ্লিকেট করা হয়েছে`)
  }

  const handleDeleteItem = (index: number) => {
    setParsedItems((prev) => prev.filter((_, idx) => idx !== index))
    toast.success(`শব্দ #${toBengaliDigits(index + 1)} তালিকা থেকে বাদ দেওয়া হয়েছে`)
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
      toast.error("ইমপোর্ট করার জন্য কোনো শব্দ নেই")
      return
    }

    const invalid = parsedItems.filter((q) => !q.word || q.word.trim() === "")
    if (invalid.length > 0) {
      toast.error(`${toBengaliDigits(invalid.length)}টি শব্দ ফাঁকা রয়েছে`)
      return
    }

    try {
      const payload = {
        questions: parsedItems.map((item) => ({
          subjectId: selectedSubjectId,
          chapterId: selectedChapterId,
          academicChapterId: selectedChapterId,
          word: item.word.trim(),
          difficulty: item.difficulty,
          reference: item.reference || [],
          source: item.source || selectedSource || DEFAULT_SOURCE,
          session: item.session || new Date().getFullYear().toString(),
          popularityCount: item.popularityCount || 0,
          isActive: item.isActive !== undefined ? item.isActive : true,
        })),
      }

      const res = await importMutation.mutateAsync(payload)
      toast.success(`সফলভাবে ${toBengaliDigits(res.importedCount)}টি শব্দ প্রশ্ন ব্যাংকে সংরক্ষণ করা হয়েছে!`)
      router.push("/make-sentences")
    } catch (err: any) {
      toast.error(err.message || "শব্দ ইমপোর্ট করতে সমস্যা হয়েছে")
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="JSON থেকে বাক্য গঠনের শব্দ ইমপোর্ট করুন"
        description="একসাথে একাধিক বাক্য গঠনের শব্দ দ্রুত আপলোড, যাচাই ও ব্যাংকে সংরক্ষণ করুন।"
        badge={{ label: "Bulk Import", variant: "indigo" }}
        icon={Upload}
        breadcrumbs={[
          { label: "ড্যাশবোর্ড", href: "/" },
          { label: "বাক্য গঠন", href: "/make-sentences" },
          { label: "JSON ইমপোর্ট" },
        ]}
      >
        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-foreground font-semibold text-xs sm:text-sm gap-2 font-headline"
        >
          <Link href="/make-sentences" prefetch={true}>
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
                      {MAKE_SENTENCES_SOURCE_OPTIONS.map((opt) => (
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

          {/* JSON Textarea Card */}
          <Card className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs overflow-hidden">
            <CardHeader className="border-b border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-6 bg-slate-50/50 dark:bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <FileCode className="w-5 h-5 text-indigo-600 dark:text-primary" />
                <CardTitle className="text-base font-bold text-foreground font-headline">
                  JSON ডেটা কোড ইনপুট
                </CardTitle>
              </div>

              <div className="flex items-center gap-2">
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
                placeholder="এখানে বাক্য গঠনের শব্দের JSON কোড পেস্ট করুন..."
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
                          <span className="w-8 shrink-0 text-slate-500 select-none text-right">
                            {toBengaliDigits(l.num)}
                          </span>
                          <span className="whitespace-pre">{l.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 1 Actions */}
              <div className="flex items-center justify-end pt-2">
                <Button
                  type="button"
                  onClick={handleProceedToReview}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 px-6 gap-2 shadow-sm shadow-indigo-200 dark:shadow-none font-headline cursor-pointer"
                >
                  <span>যাচাই ও প্রিভিউতে এগিয়ে যান</span>
                  <CheckCircle2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* STEP 2: REVIEW, EDIT & SAVE */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Review Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100/80 dark:border-primary/20 flex items-center justify-center text-indigo-600 dark:text-primary font-bold">
                {toBengaliDigits(parsedItems.length)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground font-headline">
                  মোট {toBengaliDigits(parsedItems.length)}টি শব্দ পার্স করা হয়েছে
                </h4>
                <p className="text-xs text-muted-foreground font-body">
                  সংরক্ষণের পূর্বে প্রতিটি শব্দ যাচাই বা সম্পাদনা করুন
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleExpandAll(true)}
                className="rounded-xl border-slate-200 dark:border-white/[0.08] text-xs font-semibold gap-1 font-headline"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>সব প্রসারিত করুন</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleExpandAll(false)}
                className="rounded-xl border-slate-200 dark:border-white/[0.08] text-xs font-semibold gap-1 font-headline"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>সব সংকুচিত করুন</span>
              </Button>
            </div>
          </div>

          {/* Parsed Question Cards */}
          <div className="space-y-4">
            {parsedItems.map((item, idx) => {
              const isExpanded = expandedCards[idx] ?? true

              return (
                <Card
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs overflow-hidden"
                >
                  <CardHeader className="border-b border-slate-200/80 dark:border-white/[0.08] p-4 bg-slate-50/50 dark:bg-white/[0.02] flex flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center font-headline shrink-0">
                        {toBengaliDigits(idx + 1)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-foreground font-headline truncate">
                          {item.word || "(খালি শব্দ)"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDuplicateItem(idx)}
                        className="w-8 h-8 rounded-lg text-muted-foreground hover:text-indigo-600"
                        title="ডুপ্লিকেট করুন"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteItem(idx)}
                        className="w-8 h-8 rounded-lg text-muted-foreground hover:text-rose-600"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setExpandedCards((prev) => ({
                            ...prev,
                            [idx]: !isExpanded,
                          }))
                        }
                        className="w-8 h-8 rounded-lg text-muted-foreground"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="p-5 space-y-4">
                      {/* Word Input */}
                      <div className="space-y-2">
                        <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                          শব্দ (Word) <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          value={item.word}
                          onChange={(e) =>
                            handleItemChange(idx, {
                              ...item,
                              word: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-sm h-11 px-4 font-headline font-semibold"
                        />
                      </div>

                      {/* References & Metadata in Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                        {/* References */}
                        <div className="space-y-2 sm:col-span-2">
                          <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                            রেফারেন্স (কমা দিয়ে পৃথক করুন)
                          </Label>
                          <Input
                            value={Array.isArray(item.reference) ? item.reference.join(", ") : ""}
                            onChange={(e) =>
                              handleItemChange(idx, {
                                ...item,
                                reference: e.target.value
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                              })
                            }
                            className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-sm h-10 px-4 font-body"
                          />
                        </div>

                        {/* Difficulty */}
                        <div className="space-y-2">
                          <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                            কঠিনতার মাত্রা
                          </Label>
                          <Select
                            value={item.difficulty}
                            onValueChange={(val) =>
                              handleItemChange(idx, {
                                ...item,
                                difficulty: val,
                              })
                            }
                          >
                            <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-sm h-10 px-4 font-body">
                              <SelectValue />
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
                      </div>

                      {/* Source & Session Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                            উৎস (Source)
                          </Label>
                          <Input
                            value={item.source}
                            onChange={(e) =>
                              handleItemChange(idx, {
                                ...item,
                                source: e.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-sm h-10 px-4 font-body"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                            সেশন (Session)
                          </Label>
                          <Input
                            value={item.session}
                            onChange={(e) =>
                              handleItemChange(idx, {
                                ...item,
                                session: e.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-sm h-10 px-4 font-body"
                          />
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>

          {/* Sticky Step 2 Action Bar */}
          <div className="sticky bottom-4 z-20 flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card/95 backdrop-blur-md p-4 shadow-lg">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="h-10 px-5 rounded-xl border-slate-200 dark:border-white/[0.08] text-xs font-bold font-headline"
            >
              পিছনে যান (JSON সম্পাদন)
            </Button>

            <Button
              type="button"
              disabled={importMutation.isPending || parsedItems.length === 0}
              onClick={handleExecuteImport}
              className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-2 shadow-sm shadow-indigo-200 dark:shadow-none font-headline cursor-pointer"
            >
              {importMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>ইমপোর্ট করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>{toBengaliDigits(parsedItems.length)}টি শব্দ ইমপোর্ট সম্পন্ন করুন</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
