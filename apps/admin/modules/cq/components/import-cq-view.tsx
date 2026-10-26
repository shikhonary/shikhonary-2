"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@workspace/ui/components/sonner"
import {
  useImportCqs,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-cq"
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
import { QuestionAttachments, type QuestionAttachmentItemData } from "@workspace/ui/components/question-attachments"
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
} from "lucide-react"
import { QUESTION_DIFFICULTY, QUESTION_DIFFICULTY_OPTIONS, toBengaliDigits } from "@workspace/utils"
import { CQ_SOURCE_OPTIONS, DEFAULT_SOURCE } from "../constants"
import { PageHeader } from "@/components/shared/page-header"

const sampleJsonTemplate = `[
  {
    "context": "উদ্দীপক: একটি ৫ কেজি ভরের বস্তুর ওপর ১০ নিউটন বল প্রয়োগ করা হলো।",
    "questionA": "বল কাকে বলে?",
    "questionB": "নিউটনের গতিবিদ্যার ২য় সূত্রটি ব্যাখ্যা কর।",
    "questionC": "বস্তুটির ত্বরণ নির্ণয় কর।",
    "questionD": "বস্তুটির বেগ দ্বিগুণ করতে কত বল লাগবে গাণিতিক বিশ্লেষণ দাও।",
    "difficulty": "MEDIUM",
    "source": "সহায়ক সংকলন",
    "session": "2024",
    "year": 2024,
    "reference": ["ঢাকা বোর্ড ২০২৪"],
    "attachments": [
      {
        "type": "image",
        "caption": "চিত্র ১: গতিশীল বস্তুর চিত্র",
        "content": null,
        "url": "https://images.unsplash.com/photo-1543269865-cbf427effbad",
        "table": null,
        "bottomContent": null,
        "tableBorder": false,
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

interface ParsedCqCardProps {
  index: number
  item: any
  isExpanded: boolean
  onToggleExpand: () => void
  onChange: (updatedItem: any) => void
  onDelete: () => void
  onDuplicate: () => void
}

/**
 * Parsed CQ Card matching the visual benchmark of MCQ and CreateCqView
 */
function ParsedCqCard({
  index,
  item,
  isExpanded,
  onToggleExpand,
  onChange,
  onDelete,
  onDuplicate,
}: ParsedCqCardProps) {
  const totalMarks =
    (Number(item.marks?.a) || 1) +
    (Number(item.marks?.b) || 2) +
    (item.questionC ? Number(item.marks?.c) || 3 : 0) +
    (item.questionD ? Number(item.marks?.d) || 4 : 0)

  const hasStimulus = Boolean(item.context && String(item.context).trim().length > 0)
  const hasQuestionA = Boolean(item.questionA && String(item.questionA).trim().length > 0)
  const hasQuestionB = Boolean(item.questionB && String(item.questionB).trim().length > 0)

  const referenceString = Array.isArray(item.reference) ? item.reference.join(", ") : ""

  const handleUpdateMarks = (part: "a" | "b" | "c" | "d", val: string) => {
    const num = Number(val) || 0
    onChange({
      ...item,
      marks: {
        ...(item.marks || {}),
        [part]: num,
      },
    })
  }

  const handleUpdateAnswer = (part: "answerA" | "answerB" | "answerC" | "answerD" | "explanation", val: string) => {
    onChange({
      ...item,
      answer: {
        ...(item.answer || {}),
        [part]: val,
      },
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
              {hasStimulus
                ? item.context
                : hasQuestionA
                ? `ক. ${item.questionA}`
                : `সৃজনশীল প্রশ্ন #${toBengaliDigits(index + 1)}`}
            </h4>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[11px] text-muted-foreground font-body">
                উপ-প্রশ্ন: ক, খ{item.questionC ? ", গ" : ""}{item.questionD ? ", ঘ" : ""} | মোট নম্বর:{" "}
                {toBengaliDigits(totalMarks)}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Badges & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Difficulty Badge */}
          <Badge
            variant="outline"
            className={cn(
              "px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-lg font-headline",
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

          {/* Active Status Badge */}
          <Badge
            variant="outline"
            className={cn(
              "px-2 py-0.5 text-[11px] font-bold rounded-lg font-body",
              item.isActive !== false
                ? "border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "border-slate-300 text-slate-500 bg-slate-50 dark:bg-white/[0.04]"
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
              title="CQ ডুপ্লিকেট করুন"
              className="size-8 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-primary/10 rounded-xl cursor-pointer"
            >
              <Copy className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onDelete}
              title="CQ মুছে ফেলুন"
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
          {hasStimulus && (
            <div className="rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] p-3 leading-relaxed">
              <span className="font-bold text-foreground font-headline mr-1.5">উদ্দীপক:</span>
              <RenderMath text={item.context} isMath={true} />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-slate-50/30 dark:bg-white/[0.01]">
              <span className="font-bold text-indigo-600 dark:text-primary font-headline mr-1">ক:</span>
              <span>{item.questionA || "(জ্ঞানমূলক প্রশ্ন ফাঁকা)"}</span>
              <span className="ml-1 text-muted-foreground font-mono">[{toBengaliDigits(item.marks?.a || 1)}]</span>
            </div>
            <div className="p-2.5 rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-slate-50/30 dark:bg-white/[0.01]">
              <span className="font-bold text-indigo-600 dark:text-primary font-headline mr-1">খ:</span>
              <span>{item.questionB || "(অনুধাবনমূলক প্রশ্ন ফাঁকা)"}</span>
              <span className="ml-1 text-muted-foreground font-mono">[{toBengaliDigits(item.marks?.b || 2)}]</span>
            </div>
            {item.questionC && (
              <div className="p-2.5 rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-slate-50/30 dark:bg-white/[0.01]">
                <span className="font-bold text-indigo-600 dark:text-primary font-headline mr-1">গ:</span>
                <span>{item.questionC}</span>
                <span className="ml-1 text-muted-foreground font-mono">[{toBengaliDigits(item.marks?.c || 3)}]</span>
              </div>
            )}
            {item.questionD && (
              <div className="p-2.5 rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-slate-50/30 dark:bg-white/[0.01]">
                <span className="font-bold text-indigo-600 dark:text-primary font-headline mr-1">ঘ:</span>
                <span>{item.questionD}</span>
                <span className="ml-1 text-muted-foreground font-mono">[{toBengaliDigits(item.marks?.d || 4)}]</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Validation Warning Banner */}
      {(!hasQuestionA || !hasQuestionB) && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border-t border-b border-amber-200/60 dark:border-amber-800/40 px-5 py-2.5 text-xs text-amber-800 dark:text-amber-400 flex flex-wrap items-center justify-between gap-2 font-medium">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-600 shrink-0" />
            <span>সৃজনশীল প্রশ্নের জন্য &apos;ক&apos; (জ্ঞান) এবং &apos;খ&apos; (অনুধাবন) উপ-প্রশ্ন থাকা আবশ্যক।</span>
          </div>
        </div>
      )}

      {/* Card Content - Visible when expanded */}
      {isExpanded && (
        <CardContent className="p-6 sm:p-7 space-y-7 animate-in fade-in duration-150">
          {/* Stimulus Passage Textarea */}
          <div className="space-y-2">
            <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              উদ্দীপক / অনুচ্ছেদ (Stimulus Passage)
            </Label>
            <Textarea
              rows={3}
              placeholder="সৃজনশীল প্রশ্নের উদ্দীপক লিখুন..."
              value={item.context || ""}
              onChange={(e) => onChange({ ...item, context: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 p-3.5 font-body leading-relaxed"
            />
            {item.context && (
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] text-xs text-foreground">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                  LaTeX ম্যাথ প্রিভিউ:
                </span>
                <RenderMath text={item.context} isMath={true} />
              </div>
            )}
          </div>

          {/* Sub-Questions A, B, C, D Stems and Marks */}
          <div className="space-y-4 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-primary flex items-center gap-1.5 font-headline">
              <BookOpen className="w-3.5 h-3.5" />
              উপ-প্রশ্ন ও নম্বর বণ্টন
            </h4>

            {/* Part A */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
              <div className="md:col-span-3 space-y-1.5">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  ক. জ্ঞানমূলক উপ-প্রশ্ন (A) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="ক উপ-প্রশ্ন..."
                  value={item.questionA || ""}
                  onChange={(e) => onChange({ ...item, questionA: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5 font-body"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  নম্বর (ক)
                </Label>
                <Input
                  type="number"
                  value={item.marks?.a ?? 1}
                  onChange={(e) => handleUpdateMarks("a", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5 font-body"
                />
              </div>
            </div>

            {/* Part B */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
              <div className="md:col-span-3 space-y-1.5">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  খ. অনুধাবনমূলক উপ-প্রশ্ন (B) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="খ উপ-প্রশ্ন..."
                  value={item.questionB || ""}
                  onChange={(e) => onChange({ ...item, questionB: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5 font-body"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  নম্বর (খ)
                </Label>
                <Input
                  type="number"
                  value={item.marks?.b ?? 2}
                  onChange={(e) => handleUpdateMarks("b", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5 font-body"
                />
              </div>
            </div>

            {/* Part C */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
              <div className="md:col-span-3 space-y-1.5">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  গ. প্রয়োগমূলক উপ-প্রশ্ন (C) (ঐচ্ছিক)
                </Label>
                <Input
                  type="text"
                  placeholder="গ উপ-প্রশ্ন..."
                  value={item.questionC || ""}
                  onChange={(e) => onChange({ ...item, questionC: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5 font-body"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  নম্বর (গ)
                </Label>
                <Input
                  type="number"
                  value={item.marks?.c ?? 3}
                  onChange={(e) => handleUpdateMarks("c", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5 font-body"
                />
              </div>
            </div>

            {/* Part D */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
              <div className="md:col-span-3 space-y-1.5">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  ঘ. উচ্চতর দক্ষতামূলক উপ-প্রশ্ন (D) (ঐচ্ছিক)
                </Label>
                <Input
                  type="text"
                  placeholder="ঘ উপ-প্রশ্ন..."
                  value={item.questionD || ""}
                  onChange={(e) => onChange({ ...item, questionD: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5 font-body"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  নম্বর (ঘ)
                </Label>
                <Input
                  type="number"
                  value={item.marks?.d ?? 4}
                  onChange={(e) => handleUpdateMarks("d", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5 font-body"
                />
              </div>
            </div>
          </div>

          {/* Solution Answers Section */}
          <div className="space-y-4 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-primary flex items-center gap-1.5 font-headline">
              <Sparkles className="w-3.5 h-3.5" />
              সমাধান ও উত্তরপত্র (ঐচ্ছিক)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  উত্তর ক (Answer A)
                </Label>
                <Textarea
                  rows={2}
                  placeholder="ক প্রশ্নের আদর্শ উত্তর..."
                  value={item.answer?.answerA || ""}
                  onChange={(e) => handleUpdateAnswer("answerA", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 p-3 font-body"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  উত্তর খ (Answer B)
                </Label>
                <Textarea
                  rows={2}
                  placeholder="খ প্রশ্নের আদর্শ উত্তর..."
                  value={item.answer?.answerB || ""}
                  onChange={(e) => handleUpdateAnswer("answerB", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 p-3 font-body"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  উত্তর গ (Answer C)
                </Label>
                <Textarea
                  rows={2}
                  placeholder="গ প্রশ্নের আদর্শ উত্তর..."
                  value={item.answer?.answerC || ""}
                  onChange={(e) => handleUpdateAnswer("answerC", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 p-3 font-body"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  উত্তর ঘ (Answer D)
                </Label>
                <Textarea
                  rows={2}
                  placeholder="ঘ প্রশ্নের আদর্শ উত্তর..."
                  value={item.answer?.answerD || ""}
                  onChange={(e) => handleUpdateAnswer("answerD", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 p-3 font-body"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                উত্তর বিশ্লেষণ ও সামগ্রিক ব্যাখ্যা
              </Label>
              <Textarea
                rows={2}
                placeholder="প্রশ্নটির সামগ্রিক ব্যাখ্যা..."
                value={item.answer?.explanation || ""}
                onChange={(e) => handleUpdateAnswer("explanation", e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 p-3 font-body"
              />
            </div>
          </div>

          {/* Metadata Section */}
          <div className="space-y-4 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-primary flex items-center gap-1.5 font-headline">
              <Sparkles className="w-3.5 h-3.5" />
              মেটাডাটা ও সেটিংস
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Difficulty */}
              <div className="space-y-1.5">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  কাঠিন্য
                </Label>
                <Select
                  value={item.difficulty || "MEDIUM"}
                  onValueChange={(val) => onChange({ ...item, difficulty: val })}
                >
                  <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-xs h-10 px-3">
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

              {/* Source */}
              <div className="space-y-1.5">
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
                  <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg">
                    {CQ_SOURCE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year */}
              <div className="space-y-1.5">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  সাল / বছর
                </Label>
                <Input
                  type="number"
                  placeholder="যেমন: ২০২৪"
                  value={item.year || ""}
                  onChange={(e) => onChange({ ...item, year: e.target.value ? Number(e.target.value) : null })}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-xs h-10 px-3 font-body"
                />
              </div>
            </div>

            {/* References */}
            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                রেফারেন্স ট্যাগ (কমা দিয়ে একাধিক উল্লেখ করুন)
              </Label>
              <Input
                type="text"
                placeholder="যেমন: ঢাকা বোর্ড ২০২৪, পাঠ্যবই পৃষ্ঠা ৪২"
                value={referenceString}
                onChange={(e) => {
                  const arr = e.target.value
                    .split(",")
                    .map((r) => r.trim())
                    .filter(Boolean)
                  onChange({ ...item, reference: arr })
                }}
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-xs h-10 px-3.5 font-body"
              />
            </div>

            {/* Active Status Checkbox */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-3.5">
              <div>
                <p className="text-xs font-bold text-foreground font-headline">অ্যাক্টিভ প্রশ্ন স্ট্যাটাস</p>
                <p className="text-[11px] text-muted-foreground font-body">প্রশ্নটি শিক্ষার্থী ও পরীক্ষার মডিউলে সক্রিয় থাকবে।</p>
              </div>
              <input
                type="checkbox"
                checked={item.isActive !== false}
                onChange={(e) => onChange({ ...item, isActive: e.target.checked })}
                className="h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
              />
            </div>
          </div>

          {/* Attachments Section */}
          {Array.isArray(item.attachments) && item.attachments.length > 0 && (
            <div className="space-y-2 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                সংযুক্ত চিত্র / মিডিয়া ({toBengaliDigits(item.attachments.length)}টি)
              </Label>
              <QuestionAttachments attachments={item.attachments} isMath={true} />
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

export function ImportCqView() {
  const router = useRouter()
  const importMutation = useImportCqs()

  const [jsonText, setJsonText] = useState("")
  const [parsedItems, setParsedItems] = useState<any[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [errorContext, setErrorContext] = useState<{
    line: number
    col: number
    linesContext: { num: number; content: string; isError: boolean }[]
  } | null>(null)
  const [showSample, setShowSample] = useState(false)
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({})

  // Dropdown States for Hierarchy
  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState("")
  const [selectedSubjectId, setSelectedSubjectId] = useState("")
  const [selectedChapterId, setSelectedChapterId] = useState("")
  const [selectedSource, setSelectedSource] = useState(DEFAULT_SOURCE)

  // Data queries
  const { data: academicClasses = [] } = useAcademicClassesForSelection()
  const { data: subjects = [] } = useSubjectsForSelection(
    selectedAcademicClassId ? { academicClassId: selectedAcademicClassId } : undefined
  )
  const { data: chapters = [] } = useChaptersForSelection(
    selectedSubjectId ? { subjectId: selectedSubjectId } : undefined
  )

  const handleAcademicClassChange = (classId: string) => {
    setSelectedAcademicClassId(classId === "all" ? "" : classId)
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

  // Parse and validate raw JSON input
  const validateAndParseJson = (
    rawText: string,
    classId: string,
    subId: string,
    chapId: string,
    src: string
  ) => {
    setParseError(null)
    setErrorContext(null)

    if (!rawText.trim()) {
      setParsedItems([])
      return
    }

    try {
      const parsed = JSON.parse(rawText)
      const list = Array.isArray(parsed) ? parsed : [parsed]

      const normalizedList = list.map((item) => {
        const marksObj = {
          a: item.marks?.a || 1,
          b: item.marks?.b || 2,
          c: item.questionC ? item.marks?.c || 3 : 0,
          d: item.questionD ? item.marks?.d || 4 : 0,
        }

        return {
          classId: item.classId || classId || undefined,
          subjectId: item.subjectId || subId || undefined,
          chapterId: item.chapterId || chapId || undefined,
          context: item.context?.trim() || null,
          questionA: String(item.questionA || "").trim(),
          questionB: String(item.questionB || "").trim(),
          questionC: item.questionC ? String(item.questionC).trim() : null,
          questionD: item.questionD ? String(item.questionD).trim() : null,
          difficulty: item.difficulty || QUESTION_DIFFICULTY.MEDIUM,
          year: item.year !== undefined && item.year !== null ? Number(item.year) : null,
          source: item.source ? String(item.source).trim() : src,
          session: item.session ? String(item.session).trim() : (item.year ? String(item.year) : null),
          reference: Array.isArray(item.reference) ? item.reference : [],
          isActive: item.isActive !== false,
          marks: marksObj,
          answer: item.answer ? {
            answerA: item.answer.answerA?.trim() || null,
            answerB: item.answer.answerB?.trim() || null,
            answerC: item.answer.answerC?.trim() || null,
            answerD: item.answer.answerD?.trim() || null,
            explanation: item.answer.explanation?.trim() || null,
          } : null,
          attachments: Array.isArray(item.attachments) ? item.attachments : [],
        }
      })

      setParsedItems(normalizedList)
    } catch (err: any) {
      setParseError(err.message || "Invalid JSON syntax")
      const diag = findJsonErrorPosition(rawText, err.message || "")
      setErrorContext(diag)
    }
  }

  const handleJsonChange = (text: string) => {
    setJsonText(text)
    validateAndParseJson(
      text,
      selectedAcademicClassId,
      selectedSubjectId,
      selectedChapterId,
      selectedSource
    )
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setJsonText(content)
      validateAndParseJson(
        content,
        selectedAcademicClassId,
        selectedSubjectId,
        selectedChapterId,
        selectedSource
      )
      toast.success("JSON ফাইল সফলভাবে লোড করা হয়েছে।")
    }
    reader.onerror = () => {
      toast.error("ফাইল পড়তে ত্রুটি হয়েছে।")
    }
    reader.readAsText(file)
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
    toast.success("সিনট্যাক্স স্বয়ংক্রিয়ভাবে মেরামত করা হয়েছে!")
  }

  const syncParsedItemsToText = (updatedItems: any[]) => {
    try {
      const formatted = JSON.stringify(updatedItems, null, 2)
      setJsonText(formatted)
      setParseError(null)
      setErrorContext(null)
    } catch (e) {
      // ignore serialization error
    }
  }

  const handleUpdateParsedItem = (idx: number, updatedItem: any) => {
    const next = [...parsedItems]
    next[idx] = updatedItem
    setParsedItems(next)
    syncParsedItemsToText(next)
  }

  const handleDeleteParsedItem = (idx: number) => {
    const next = parsedItems.filter((_, i) => i !== idx)
    setParsedItems(next)
    syncParsedItemsToText(next)
    toast.success(`প্রশ্ন #${toBengaliDigits(idx + 1)} মুছে ফেলা হয়েছে।`)
  }

  const handleDuplicateParsedItem = (idx: number) => {
    const itemToClone = parsedItems[idx]
    if (!itemToClone) return
    const cloned = JSON.parse(JSON.stringify(itemToClone))
    const next = [...parsedItems.slice(0, idx + 1), cloned, ...parsedItems.slice(idx + 1)]
    setParsedItems(next)
    syncParsedItemsToText(next)
    toast.success(`প্রশ্ন #${toBengaliDigits(idx + 1)} ডুপ্লিকেট করা হয়েছে।`)
  }

  const handleAddNewQuestionCard = () => {
    const newCard = {
      context: "",
      questionA: "",
      questionB: "",
      questionC: "",
      questionD: "",
      difficulty: "MEDIUM",
      source: selectedSource || DEFAULT_SOURCE,
      session: new Date().getFullYear().toString(),
      year: new Date().getFullYear(),
      reference: [],
      isActive: true,
      marks: { a: 1, b: 2, c: 3, d: 4 },
      answer: {
        answerA: "",
        answerB: "",
        answerC: "",
        answerD: "",
        explanation: "",
      },
      attachments: [],
    }
    const next = [newCard, ...parsedItems]
    setParsedItems(next)
    syncParsedItemsToText(next)
    setExpandedCards((prev) => ({ ...prev, 0: true }))
    toast.success("নতুন CQ কার্ড যোগ করা হয়েছে।")
  }

  const toggleAllExpanded = (expand: boolean) => {
    const newExpanded: Record<number, boolean> = {}
    parsedItems.forEach((_, idx) => {
      newExpanded[idx] = expand
    })
    setExpandedCards(newExpanded)
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
      const currentYear = new Date().getFullYear().toString()
      const payload = parsedItems.map((item) => {
        const marksObj = {
          a: Number(item.marks?.a) || 1,
          b: Number(item.marks?.b) || 2,
          c: item.questionC ? Number(item.marks?.c) || 3 : 0,
          d: item.questionD ? Number(item.marks?.d) || 4 : 0,
        }

        const sessionVal = item.session
          ? String(item.session).trim()
          : item.year
          ? String(item.year)
          : currentYear
        const parsedYear =
          item.year !== undefined && item.year !== null
            ? Number(item.year)
            : !isNaN(Number(sessionVal))
            ? Number(sessionVal)
            : null

        return {
          classId: item.classId || selectedAcademicClassId || undefined,
          subjectId: item.subjectId || selectedSubjectId,
          chapterId: item.chapterId || selectedChapterId,
          context: item.context?.trim() || null,
          questionA: String(item.questionA || "").trim(),
          questionB: String(item.questionB || "").trim(),
          questionC: item.questionC ? String(item.questionC).trim() : null,
          questionD: item.questionD ? String(item.questionD).trim() : null,
          difficulty: item.difficulty as any,
          year: parsedYear,
          source: item.source ? String(item.source).trim() : (selectedSource || DEFAULT_SOURCE),
          session: sessionVal,
          reference: Array.isArray(item.reference) ? item.reference : [],
          isActive: item.isActive !== false,
          marks: marksObj,
          answer: item.answer ? {
            answerA: item.answer.answerA?.trim() || null,
            answerB: item.answer.answerB?.trim() || null,
            answerC: item.answer.answerC?.trim() || null,
            answerD: item.answer.answerD?.trim() || null,
            explanation: item.answer.explanation?.trim() || null,
          } : null,
          attachments: Array.isArray(item.attachments) ? item.attachments : [],
        }
      })

      const res = await importMutation.mutateAsync({ cqs: payload as any })
      toast.success(`মোট ${toBengaliDigits(res.importedCount)}টি সৃজনশীল প্রশ্ন সফলভাবে ইম্পোর্ট করা হয়েছে!`)
      setTimeout(() => {
        router.push("/cqs")
      }, 1000)
    } catch (err: any) {
      toast.error(err.message || "বাল্ক CQ ইম্পোর্ট করা সম্ভব হয়নি।")
    }
  }

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200 pb-12">
      {/* Shared Page Header matching MCQ Benchmark */}
      <PageHeader
        title="JSON থেকে CQ ইম্পোর্ট"
        description="JSON ফাইল আপলোড বা সরাসরি টেক্সট পেস্ট করে একসাথে একাধিক সৃজনশীল প্রশ্ন যাচাই, সম্পাদনা ও ইম্পোর্ট করুন।"
        icon={Upload}
        badge={{ label: "বাল্ক ইম্পোর্ট", variant: "indigo" }}
        breadcrumbs={[
          { label: "CQ তালিকা", href: "/cqs" },
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
            <Link href="/cqs" prefetch={true}>
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

      {/* Step 1 Card: Data Source & Hierarchy Setup */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs overflow-hidden">
        <CardHeader className="border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-5 sm:p-7 flex flex-row items-center gap-3.5 sm:gap-4">
          <div className="flex size-11 sm:size-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-primary border border-indigo-100/80 dark:border-primary/20 shrink-0">
            <Layers className="h-5 w-5 sm:h-6 sm:w-6 stroke-[1.8]" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold font-headline text-foreground">
              ১. শ্রেণি, বিষয় ও ডেটা সোর্স কনফিগারেশন
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5 font-body">
              যেসব প্রশ্নে বিষয় বা অধ্যায় আইডি নেই, সেগুলোর জন্য ডিফল্ট তথ্য ও সোর্স নির্বাচন করে ফাইল আপলোড বা পেস্ট করুন।
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Hierarchy Dropdowns matching Create View */}
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
                <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg font-body">
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
                <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg font-body">
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
                <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg font-body">
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
                <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg font-body">
                  {CQ_SOURCE_OPTIONS.map((opt) => (
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
            <div className="flex items-center gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/70 dark:bg-amber-950/20 p-4 text-amber-800 dark:text-amber-400 text-xs font-medium font-body">
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
              className="block w-full text-sm text-foreground file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 dark:file:bg-primary/10 file:text-indigo-700 dark:file:text-primary hover:file:bg-indigo-100 dark:hover:file:bg-primary/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed file:disabled:pointer-events-none font-body"
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
            <div className="space-y-3 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 p-5 text-rose-700 dark:text-rose-400 font-body">
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
                          <span className="ml-auto text-[10px] uppercase font-bold tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded-md shrink-0 font-headline">
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

          {/* Validation Success Banner */}
          {!parseError && parsedItems.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/20 p-4 text-emerald-800 dark:text-emerald-300 text-sm font-body">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold font-headline">JSON যাচাইকরণ সফল হয়েছে!</p>
                  <p className="text-xs text-emerald-700/80 dark:text-emerald-400">
                    মোট {toBengaliDigits(parsedItems.length)}টি সৃজনশীল প্রশ্ন সফলভাবে পার্স করা হয়েছে। নিচের প্রিভিউ কার্ডে পর্যালোচনা ও সম্পাদনা করুন।
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
                নতুন CQ কার্ড যোগ করুন
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2 Section: Parsed CQ Review & Edit Cards */}
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
                  <Badge variant="secondary" className="px-2.5 py-0.5 rounded-full text-xs font-bold font-solaiman">
                    {toBengaliDigits(parsedItems.length)}টি প্রশ্ন
                  </Badge>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-body">
                  প্রতিটি সৃজনশীল প্রশ্নের উদ্দীপক, উপ-প্রশ্ন (ক, খ, গ, ঘ) ও সমাধান চেক করুন এবং প্রয়োজনে সরাসরি সংশোধন করুন।
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
                CQ যোগ করুন
              </Button>
            </div>
          </div>

          {/* List of Parsed CQ Cards */}
          <div className="space-y-6">
            {parsedItems.map((item, idx) => (
              <ParsedCqCard
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

          {/* Form Actions Footer */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:items-center sm:justify-between border-t border-slate-200/80 dark:border-white/[0.08] pt-6 sm:pt-8 mt-6">
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold px-6 h-11 text-sm transition-all active:scale-95 cursor-pointer justify-center font-headline"
            >
              <Link href="/cqs" prefetch={true}>
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
                  : `মোট ${toBengaliDigits(parsedItems.length)}টি CQ ইম্পোর্ট করুন`}
              </span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
