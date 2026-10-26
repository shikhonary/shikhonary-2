"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@workspace/ui/components/sonner"
import {
  useImportMcqs,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-mcq"
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@workspace/ui/components/dropdown-menu"
import type { CreateMcqInput } from "@workspace/api"
import { cn } from "@workspace/ui/lib/utils"
import { RenderMath } from "@workspace/ui/components/render-math"
import { QuestionAttachments } from "@workspace/ui/components/question-attachments"
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
  ArrowLeftRight,
  Shuffle,
  Code,
  FileCode,
  Upload,
  ArrowLeft,
  Sparkles,
  Layers,
  AlertCircle,
  Loader2,
  ChevronsUpDown,
  Maximize2,
  Minimize2,
  BookOpen,
} from "lucide-react"
import { QUESTION_DIFFICULTY, QUESTION_DIFFICULTY_OPTIONS, toBengaliDigits } from "@workspace/utils"
import { MCQ_SOURCE_OPTIONS, DEFAULT_SOURCE } from "../constants"
import { PageHeader } from "@/components/shared/page-header"

const BENGALI_OPTION_LABELS = ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ"]
const ROMAN_NUMERALS = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii"]

const sampleJsonTemplate = `[
  {
    "question": "নিউটনের গতির দ্বিতীয় সূত্রটি কী?",
    "answer": "F = ma",
    "options": ["F = ma", "F = mv", "E = mc^2", "P = IV"],
    "statements": [],
    "type": "SINGLE",
    "isMath": true,
    "reference": ["পদার্থবিজ্ঞান বোর্ড ২০২৪"],
    "explanation": "বল = ভর × ত্বরণ (Force equals mass times acceleration)।",
    "questionUrl": null,
    "difficulty": "MEDIUM",
    "year": 2024,
    "source": "গাইড বুক",
    "session": "2026",
    "questionTypeId": null,
    "isActive": true,
    "attachments": [
      {
        "type": "image",
        "caption": "চিত্র ১: বল ও ত্বরণের সম্পর্ক",
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

interface ParsedMcqCardProps {
  index: number
  item: CreateMcqInput
  isExpanded: boolean
  onToggleExpand: () => void
  onChange: (updatedItem: CreateMcqInput) => void
  onDelete: () => void
  onDuplicate: () => void
}

/**
 * Parsed MCQ Card matching the exact visual design concept of CreateMcqView
 */
function ParsedMcqCard({
  index,
  item,
  isExpanded,
  onToggleExpand,
  onChange,
  onDelete,
  onDuplicate,
}: ParsedMcqCardProps) {
  const handleUpdateOption = (optIndex: number, newVal: string) => {
    const newOptions = [...item.options]
    const oldVal = newOptions[optIndex]
    newOptions[optIndex] = newVal

    let newAnswer = item.answer
    if (item.answer === oldVal) {
      newAnswer = newVal
    }

    onChange({
      ...item,
      options: newOptions,
      answer: newAnswer,
    })
  }

  const handleAddOption = () => {
    const newOptions = [...item.options, ""]
    onChange({
      ...item,
      options: newOptions,
    })
  }

  const handleRemoveOption = (optIndex: number) => {
    if (item.options.length <= 2) return
    const optToRemove = item.options[optIndex]
    const newOptions = item.options.filter((_, idx) => idx !== optIndex)
    let newAnswer = item.answer
    if (item.answer === optToRemove && newOptions.length > 0) {
      newAnswer = newOptions[0] ?? ""
    }

    onChange({
      ...item,
      options: newOptions,
      answer: newAnswer,
    })
  }

  const handleSetCorrectAnswer = (optText: string) => {
    onChange({
      ...item,
      answer: optText,
    })
  }

  const handleSwapOptions = (fromIdx: number, toIdx: number) => {
    if (
      fromIdx < 0 ||
      fromIdx >= item.options.length ||
      toIdx < 0 ||
      toIdx >= item.options.length ||
      fromIdx === toIdx
    ) {
      return
    }
    const newOptions = [...item.options]
    const temp = newOptions[fromIdx]!
    newOptions[fromIdx] = newOptions[toIdx]!
    newOptions[toIdx] = temp

    onChange({
      ...item,
      options: newOptions,
    })
  }

  const handleMoveOption = (fromIdx: number, direction: "prev" | "next") => {
    const targetIdx = direction === "prev" ? fromIdx - 1 : fromIdx + 1
    handleSwapOptions(fromIdx, targetIdx)
  }

  const handleShuffleOptions = () => {
    if (item.options.length <= 1) return
    const shuffled = [...item.options]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = shuffled[i]!
      shuffled[i] = shuffled[j]!
      shuffled[j] = temp
    }
    onChange({
      ...item,
      options: shuffled,
    })
  }

  const handleAddStatement = () => {
    const currentStatements = Array.isArray(item.statements) ? [...item.statements] : []
    onChange({
      ...item,
      statements: [...currentStatements, ""],
    })
  }

  const handleUpdateStatement = (stmtIndex: number, newVal: string) => {
    const currentStatements = Array.isArray(item.statements) ? [...item.statements] : []
    currentStatements[stmtIndex] = newVal
    onChange({
      ...item,
      statements: currentStatements,
    })
  }

  const handleRemoveStatement = (stmtIndex: number) => {
    const currentStatements = Array.isArray(item.statements) ? [...item.statements] : []
    onChange({
      ...item,
      statements: currentStatements.filter((_, idx) => idx !== stmtIndex),
    })
  }

  const handleMoveStatement = (fromIdx: number, direction: "prev" | "next") => {
    const currentStatements = Array.isArray(item.statements) ? [...item.statements] : []
    const targetIdx = direction === "prev" ? fromIdx - 1 : fromIdx + 1
    if (
      fromIdx < 0 ||
      fromIdx >= currentStatements.length ||
      targetIdx < 0 ||
      targetIdx >= currentStatements.length
    ) {
      return
    }
    const temp = currentStatements[fromIdx]!
    currentStatements[fromIdx] = currentStatements[targetIdx]!
    currentStatements[targetIdx] = temp
    onChange({
      ...item,
      statements: currentStatements,
    })
  }

  const isAnswerMatchingOptions = item.options.includes(item.answer)

  return (
    <Card className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs overflow-hidden transition-all hover:shadow-md">
      {/* Header Bar matching Create CardHeader */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-4 sm:p-5">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-primary font-bold text-xs sm:text-sm border border-indigo-100 dark:border-primary/20 shrink-0">
            #{toBengaliDigits(index + 1)}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm sm:text-base font-bold font-headline text-foreground truncate">
              {item.question ? item.question : `প্রশ্ন #${toBengaliDigits(index + 1)} (বিবরণ নেই)`}
            </h4>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[11px] text-muted-foreground">
                অপশন: {toBengaliDigits(item.options.length)}টি | সঠিক উত্তর: {item.answer || "নির্ধারিত নয়"}
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
              title="প্রশ্ন ডুপ্লিকেট করুন"
              className="size-8 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-primary/10 rounded-xl cursor-pointer"
            >
              <Copy className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onDelete}
              title="প্রশ্ন মুছে ফেলুন"
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
      {(!isAnswerMatchingOptions || !item.question.trim()) && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200/60 dark:border-amber-800/40 px-5 py-2.5 text-xs text-amber-800 dark:text-amber-400 flex flex-wrap items-center justify-between gap-2 font-medium">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-600 shrink-0" />
            <span>
              {!item.question.trim()
                ? "প্রশ্নের বিবরণ ফাঁকা রয়েছে।"
                : `উত্তর "${item.answer}" অপশন তালিকায় বিদ্যমান নেই।`}
            </span>
          </div>
          {item.answer && !isAnswerMatchingOptions && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                const newOptions = [...item.options, item.answer]
                onChange({ ...item, options: newOptions })
              }}
              className="rounded-xl bg-white dark:bg-card border-amber-300 text-amber-900 dark:text-amber-300 hover:bg-amber-100 text-xs font-bold h-7 px-2.5 cursor-pointer shrink-0"
            >
              + অপশনে উত্তর যোগ করুন
            </Button>
          )}
        </div>
      )}

      {/* Card Content - Visible when expanded, matching CreateMcqView */}
      {isExpanded && (
        <CardContent className="p-6 sm:p-7 space-y-7 animate-in fade-in duration-150">
          {/* Question Stem Textarea */}
          <div className="space-y-2">
            <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              প্রশ্নের মূল বিবরণ (Question Stem) <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              rows={3}
              placeholder="বহুনির্বাচনি প্রশ্নের মূল বিবরণ লিখুন..."
              value={item.question}
              onChange={(e) => onChange({ ...item, question: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 p-3.5"
            />
            {item.isMath && item.question && (
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] text-xs text-foreground">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                  LaTeX ম্যাথ প্রিভিউ:
                </span>
                <RenderMath text={item.question} isMath={true} />
              </div>
            )}
          </div>

          {/* Statements (Optional for Roman Numeral MCQ) */}
          <div className="space-y-3 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/40 dark:bg-white/[0.01] p-5">
            <div className="flex items-center justify-between">
              <div>
                <Label className="block text-xs font-semibold uppercase tracking-wider text-foreground">
                  বিবৃতি / উপ-উক্তি (ঐচ্ছিক - বহুপদী প্রশ্নের জন্য)
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  যেমন: i. প্রথম উক্তি ii. দ্বিতীয় উক্তি iii. তৃতীয় উক্তি
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddStatement}
                className="rounded-xl border border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-primary/20 dark:text-primary dark:hover:bg-primary/10 text-xs font-bold h-8 px-3 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                বিবৃতি যোগ করুন
              </Button>
            </div>

            {Array.isArray(item.statements) && item.statements.length > 0 ? (
              <div className="space-y-2.5 pt-2">
                {item.statements.map((stmt, stmtIdx) => (
                  <div key={stmtIdx} className="flex items-center gap-2.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-primary/10 text-xs font-bold text-indigo-700 dark:text-primary font-mono border border-indigo-100 dark:border-primary/20">
                      {ROMAN_NUMERALS[stmtIdx] || stmtIdx + 1}.
                    </span>
                    <Input
                      type="text"
                      placeholder={`বিবৃতি #${stmtIdx + 1}...`}
                      value={stmt}
                      onChange={(e) => handleUpdateStatement(stmtIdx, e.target.value)}
                      className="flex-1 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={stmtIdx === 0}
                      onClick={() => handleMoveStatement(stmtIdx, "prev")}
                      className="size-8 text-muted-foreground hover:text-indigo-600 rounded-lg disabled:opacity-25 cursor-pointer"
                    >
                      <ChevronUp className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={stmtIdx === (item.statements?.length || 0) - 1}
                      onClick={() => handleMoveStatement(stmtIdx, "next")}
                      className="size-8 text-muted-foreground hover:text-indigo-600 rounded-lg disabled:opacity-25 cursor-pointer"
                    >
                      <ChevronDown className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveStatement(stmtIdx)}
                      className="size-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs italic text-muted-foreground pt-1">
                কোনো উক্তি যোগ করা হয়নি। বহুপদী প্রশ্নের জন্য "+ বিবৃতি যোগ করুন"-এ ক্লিক করুন।
              </p>
            )}
          </div>

          {/* Answer Options Grid matching Create View */}
          <div className="space-y-4 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="block text-xs font-semibold uppercase tracking-wider text-foreground">
                  উত্তর অপশনসমূহ (Answer Options) <span className="text-rose-500">*</span>
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  প্রতিটি অপশনের বিবরণ লিখুন এবং সঠিক উত্তর চিহ্নে ক্লিক করুন।
                </p>
              </div>
              <div className="flex items-center gap-2">
                {item.options.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleShuffleOptions}
                    className="rounded-xl text-xs font-bold text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-primary/10 h-8 px-3 cursor-pointer"
                  >
                    <Shuffle className="size-3.5 mr-1" />
                    শাফল
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  className="rounded-xl border border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-primary/20 dark:text-primary dark:hover:bg-primary/10 text-xs font-bold h-8 px-3 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  নতুন অপশন যোগ করুন
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {item.options.map((opt, optIdx) => {
                const isCorrect = item.answer === opt
                const optionLabel = BENGALI_OPTION_LABELS[optIdx] || String(optIdx + 1)

                return (
                  <div
                    key={optIdx}
                    className={cn(
                      "space-y-2 rounded-2xl border p-3.5 transition-all",
                      isCorrect
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-emerald-500/20"
                        : "border-slate-200/80 dark:border-white/[0.08] bg-slate-50/30 dark:bg-white/[0.01]"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleSetCorrectAnswer(opt)}
                        className="flex items-center gap-2 cursor-pointer text-left"
                      >
                        <span
                          className={cn(
                            "flex size-6 items-center justify-center rounded-lg font-bold text-xs transition-colors",
                            isCorrect
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "bg-indigo-50 dark:bg-primary/10 text-indigo-700 dark:text-primary border border-indigo-100 dark:border-primary/20"
                          )}
                        >
                          {isCorrect ? <CheckCircle2 className="size-3.5" /> : optionLabel}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-bold",
                            isCorrect
                              ? "text-emerald-900 dark:text-emerald-300"
                              : "text-foreground"
                          )}
                        >
                          অপশন {optionLabel} {isCorrect && "(সঠিক উত্তর)"}
                        </span>
                      </button>

                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={optIdx === 0}
                          onClick={() => handleMoveOption(optIdx, "prev")}
                          className="size-7 text-muted-foreground hover:text-indigo-600 rounded-lg disabled:opacity-25 cursor-pointer"
                        >
                          <ChevronUp className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={optIdx === item.options.length - 1}
                          onClick={() => handleMoveOption(optIdx, "next")}
                          className="size-7 text-muted-foreground hover:text-indigo-600 rounded-lg disabled:opacity-25 cursor-pointer"
                        >
                          <ChevronDown className="size-3.5" />
                        </Button>

                        {/* Swap Dropdown */}
                        {item.options.length > 1 && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-7 text-muted-foreground hover:text-indigo-600 rounded-lg cursor-pointer"
                              >
                                <ArrowLeftRight className="size-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-52 bg-popover text-popover-foreground border border-slate-200/80 rounded-xl shadow-lg p-1.5"
                            >
                              <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground px-2 py-1">
                                ({optionLabel}) এর সাথে অদলবদল:
                              </DropdownMenuLabel>
                              {item.options.map((otherOpt, otherIdx) => {
                                if (otherIdx === optIdx) return null
                                const otherLabel = BENGALI_OPTION_LABELS[otherIdx] || String(otherIdx + 1)
                                return (
                                  <DropdownMenuItem
                                    key={otherIdx}
                                    onClick={() => handleSwapOptions(optIdx, otherIdx)}
                                    className="cursor-pointer text-xs flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg"
                                  >
                                    <span>অপশন {otherLabel}: {otherOpt || "(ফাঁকা)"}</span>
                                    <ArrowLeftRight className="size-3 text-muted-foreground" />
                                  </DropdownMenuItem>
                                )
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}

                        {item.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(optIdx)}
                            className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline cursor-pointer ml-1"
                          >
                            মুছুন
                          </button>
                        )}
                      </div>
                    </div>

                    <Input
                      type="text"
                      placeholder={`অপশন ${optionLabel}-এর বিবরণ লিখুন...`}
                      value={opt}
                      onChange={(e) => handleUpdateOption(optIdx, e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5"
                    />
                    {item.isMath && opt && (
                      <div className="text-[11px] text-muted-foreground px-1">
                        <RenderMath text={opt} isMath={true} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Correct Answer & Question Type */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
            <div className="space-y-2">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                সঠিক উত্তর (Correct Answer) <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={item.answer}
                onValueChange={(val) => onChange({ ...item, answer: val })}
              >
                <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between">
                  <SelectValue placeholder="সঠিক উত্তর নির্বাচন করুন..." />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg max-h-64">
                  {item.options.map((opt, idx) => {
                    const label = BENGALI_OPTION_LABELS[idx] || String(idx + 1)
                    return (
                      <SelectItem key={idx} value={opt || `Option ${label}`}>
                        অপশন {label}: {opt || "(ফাঁকা)"}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                প্রশ্নের ধরন (Question Type) <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={item.type || "SINGLE"}
                onValueChange={(val) => onChange({ ...item, type: val })}
              >
                <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4 justify-between">
                  <SelectValue placeholder="ধরন নির্বাচন করুন..." />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg">
                  <SelectItem value="SINGLE">একক সঠিক উত্তর (SINGLE)</SelectItem>
                  <SelectItem value="MULTIPLE">একাধিক সঠিক উত্তর (MULTIPLE)</SelectItem>
                  <SelectItem value="COMBINED">বহুপদী সমাপ্তিসূচক (COMBINED)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Math & Active Flags */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-4">
              <div>
                <p className="text-sm font-bold text-foreground">গণিত / LaTeX সমীকরণ</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  KaTeX দিয়ে গাণিতিক সমীকরণ রেন্ডার করতে অ্যাক্টিভ করুন।
                </p>
              </div>
              <input
                type="checkbox"
                checked={item.isMath}
                onChange={(e) => onChange({ ...item, isMath: e.target.checked })}
                className="size-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-4">
              <div>
                <p className="text-sm font-bold text-foreground">অ্যাক্টিভ প্রশ্নের অবস্থা</p>
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

          {/* Explanation & Reference */}
          <div className="space-y-6 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
            <div className="space-y-2">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                সঠিক উত্তরের ব্যাখ্যা / সমাধান (Explanation)
              </Label>
              <Textarea
                rows={3}
                placeholder="সঠিক উত্তরের বিস্তারিত ব্যাখ্যা বা সমাধান লিখুন..."
                value={item.explanation || ""}
                onChange={(e) => onChange({ ...item, explanation: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 p-3.5"
              />
            </div>

            <div className="space-y-2">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                রেফারেন্স / উৎস (কমা দিয়ে একাধিক উল্লেখ করুন)
              </Label>
              <Input
                type="text"
                placeholder="যেমন: ঢাকা বোর্ড ২০২৩, পাঠ্যবই পৃষ্ঠা ৪২..."
                value={Array.isArray(item.reference) ? item.reference.join(", ") : ""}
                onChange={(e) => {
                  const refs = e.target.value
                    .split(",")
                    .map((r) => r.trim())
                    .filter(Boolean)
                  onChange({ ...item, reference: refs })
                }}
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 px-4"
              />
            </div>
          </div>

          {/* Metadata Settings */}
          <div className="space-y-6 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
            <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-primary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              মেটাডাটা ও অতিরিক্ত সেটিংস
            </h5>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  কাঠিন্যের মাত্রা (Difficulty) <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={item.difficulty || "MEDIUM"}
                  onValueChange={(val) => onChange({ ...item, difficulty: val as any })}
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
                    {MCQ_SOURCE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export function ImportMcqView() {
  const router = useRouter()
  const importMutation = useImportMcqs()

  const [jsonText, setJsonText] = useState<string>("")
  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState<string>("")
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("")
  const [selectedChapterId, setSelectedChapterId] = useState<string>("")
  const [selectedSource, setSelectedSource] = useState<string>(DEFAULT_SOURCE)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(QUESTION_DIFFICULTY.MEDIUM)
  const [showSample, setShowSample] = useState<boolean>(false)
  const [parsedItems, setParsedItems] = useState<CreateMcqInput[]>([])
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({ 0: true })
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

      const validated: CreateMcqInput[] = []
      const errors: string[] = []

      const fallbackSource = overrideSource || selectedSource || DEFAULT_SOURCE
      const fallbackSession = new Date().getFullYear().toString()
      const fallbackDifficulty =
        overrideDifficulty || selectedDifficulty || QUESTION_DIFFICULTY.MEDIUM

      itemsArray.forEach((item: any, idx: number) => {
        const itemNum = idx + 1
        const subjectId = item.subjectId || overrideSubjectId
        const chapterId = item.chapterId || overrideChapterId

        if (!item.question || typeof item.question !== "string") {
          errors.push(`প্রশ্ন #${itemNum}: 'question' ফিল্ড অনুপস্থিত বা সঠিক নয়।`)
        }
        if (!item.answer || typeof item.answer !== "string") {
          errors.push(`প্রশ্ন #${itemNum}: 'answer' ফিল্ড অনুপস্থিত বা সঠিক নয়।`)
        }
        if (!Array.isArray(item.options) || item.options.length < 1) {
          errors.push(`প্রশ্ন #${itemNum}: 'options' একটি খালি নয় এমন স্ট্রিং অ্যারে হতে হবে।`)
        }
        if (!subjectId) {
          errors.push(
            `প্রশ্ন #${itemNum}: 'subjectId' পাওয়া যায়নি। উপরের ড্রপডাউন থেকে বিষয় নির্বাচন করুন।`
          )
        }
        if (!chapterId) {
          errors.push(
            `প্রশ্ন #${itemNum}: 'chapterId' পাওয়া যায়নি। উপরের ড্রপডাউন থেকে অধ্যায় নির্বাচন করুন।`
          )
        }

        let questionText = String(item.question || "").trim()
        let contextText = item.context ? String(item.context).trim() : undefined

        const attachmentsArray = Array.isArray(item.attachments)
          ? item.attachments
          : Array.isArray(item.attachment)
          ? item.attachment
          : []

        const mappedAttachments = attachmentsArray
          .filter((att: any) => att && typeof att === "object")
          .map((att: any, aIdx: number) => ({
            type: String(att.type || (att.url ? "image" : att.table ? "table" : "text")),
            caption: att.caption ? String(att.caption) : null,
            content: att.content ? String(att.content) : null,
            url: att.url && att.url !== "text-context" ? String(att.url) : null,
            table: att.table !== undefined ? att.table : null,
            bottomContent: att.bottomContent ? String(att.bottomContent) : null,
            tableBorder: att.tableBorder !== undefined ? Boolean(att.tableBorder) : false,
            position:
              att.position !== undefined && att.position !== null ? Number(att.position) : aIdx,
          }))

        if (!contextText && questionText.includes("\n\n")) {
          const parts = questionText.split(/\n\n(?:প্রশ্ন|প্রশ্নঃ|Q|Question)[\s:]*/i)
          if (parts.length >= 2) {
            contextText = parts[0]?.trim()
            questionText = parts.slice(1).join("\n\n").trim()
          } else {
            const doubleNewlineIdx = questionText.indexOf("\n\n")
            if (
              doubleNewlineIdx !== -1 &&
              (questionText.includes("উদ্দীপক") || questionText.includes("অনুচ্ছেদ"))
            ) {
              contextText = questionText.slice(0, doubleNewlineIdx).trim()
              questionText = questionText.slice(doubleNewlineIdx + 2).trim()
            }
          }
        }

        const rawDiffStr = (
          item.difficulty ||
          item.difficultyLevel ||
          item.level ||
          item.diff ||
          item.Difficulty ||
          item.DifficultyLevel ||
          ""
        )
          .toString()
          .trim()

        let itemDifficulty = fallbackDifficulty

        if (rawDiffStr) {
          const upper = rawDiffStr.toUpperCase()
          if (upper === "EASY" || upper === "সহজ" || upper.includes("EASY") || upper === "1") {
            itemDifficulty = "EASY"
          } else if (
            upper === "HARD" ||
            upper === "কঠিন" ||
            upper.includes("HARD") ||
            upper === "3"
          ) {
            itemDifficulty = "HARD"
          } else if (
            upper === "MEDIUM" ||
            upper === "মধ্যম" ||
            upper === "সাধারণ" ||
            upper.includes("MED") ||
            upper === "2"
          ) {
            itemDifficulty = "MEDIUM"
          } else if (["EASY", "MEDIUM", "HARD"].includes(upper)) {
            itemDifficulty = upper as any
          }
        }

        const itemSource = item.source || item.sourceBook || fallbackSource
        const itemSession = item.session ? String(item.session).trim() : fallbackSession

        validated.push({
          question: questionText,
          answer: String(item.answer || "").trim(),
          options: Array.isArray(item.options) ? item.options.map(String) : [],
          statements: Array.isArray(item.statements) ? item.statements.map(String) : [],
          type: item.type || "SINGLE",
          isMath: item.isMath !== undefined ? Boolean(item.isMath) : true,
          reference: Array.isArray(item.reference) ? item.reference.map(String) : [],
          explanation: item.explanation ? String(item.explanation).trim() : null,
          questionUrl: item.questionUrl ? String(item.questionUrl).trim() : null,
          difficulty: itemDifficulty as any,
          year: item.year && !isNaN(Number(item.year)) ? Number(item.year) : null,
          source: itemSource,
          session: itemSession,
          questionTypeId: item.questionTypeId || null,
          isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
          subjectId,
          chapterId,
          attachments: mappedAttachments,
          context: contextText,
        } as any)
      })

      if (errors.length > 0) {
        setParseError(errors.slice(0, 5).join(" | ") + (errors.length > 5 ? ` (+${errors.length - 5} আরও ত্রুটি)` : ""))
        return
      }

      setParsedItems(validated)
      // Expand first question by default
      setExpandedCards({ 0: true })
    } catch (err: any) {
      setParseError(err.message || "JSON যাচাইয়ে ত্রুটি ঘটেছে")
    }
  }

  const handleAutoFixJson = () => {
    if (!jsonText.trim()) return
    const fixed = repairJsonSyntax(jsonText)
    setJsonText(fixed)
    validateAndParseJson(
      fixed,
      selectedAcademicClassId,
      selectedSubjectId,
      selectedChapterId,
      selectedSource,
      selectedDifficulty
    )
    toast.success("JSON ফরম্যাট ও সিনট্যাক্স স্বয়ংক্রিয়ভাবে ঠিক করা হয়েছে!")
  }

  const syncParsedItemsToText = (newItems: CreateMcqInput[]) => {
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
      selectedSource,
      selectedDifficulty
    )
  }

  const handleAcademicClassChange = (val: string) => {
    const value = val === "all" ? "" : (val ?? "")
    setSelectedAcademicClassId(value)
    setSelectedSubjectId("")
    setSelectedChapterId("")
    if (jsonText) {
      validateAndParseJson(
        jsonText,
        value,
        "",
        "",
        selectedSource,
        selectedDifficulty
      )
    }
  }

  const handleSubjectChange = (val: string | null) => {
    const value = val ?? ""
    setSelectedSubjectId(value)
    setSelectedChapterId("")
    if (jsonText) {
      validateAndParseJson(
        jsonText,
        selectedAcademicClassId,
        value,
        "",
        selectedSource,
        selectedDifficulty
      )
    }
  }

  const handleChapterChange = (val: string | null) => {
    const value = val ?? ""
    setSelectedChapterId(value)
    if (jsonText) {
      validateAndParseJson(
        jsonText,
        selectedAcademicClassId,
        selectedSubjectId,
        value,
        selectedSource,
        selectedDifficulty
      )
    }
  }

  const handleUpdateParsedItem = (idx: number, updated: CreateMcqInput) => {
    const next = [...parsedItems]
    next[idx] = updated
    syncParsedItemsToText(next)
  }

  const handleDeleteParsedItem = (idx: number) => {
    const next = parsedItems.filter((_, i) => i !== idx)
    syncParsedItemsToText(next)
    toast.info(`প্রশ্ন #${toBengaliDigits(idx + 1)} তালিকা থেকে সরানো হয়েছে।`)
  }

  const handleDuplicateParsedItem = (idx: number) => {
    const itemToCopy = parsedItems[idx]
    if (!itemToCopy) return
    const next = [...parsedItems]
    next.splice(idx + 1, 0, { ...itemToCopy, question: `${itemToCopy.question} (কপি)` })
    syncParsedItemsToText(next)
    toast.success(`প্রশ্ন #${toBengaliDigits(idx + 1)} সফলভাবে ডুপ্লিকেট করা হয়েছে।`)
  }

  const handleAddNewQuestionCard = () => {
    const newMcq: CreateMcqInput = {
      question: "",
      answer: "",
      options: ["", "", "", ""],
      statements: [],
      type: "SINGLE",
      isMath: false,
      reference: [],
      isActive: true,
      difficulty: selectedDifficulty || "MEDIUM",
      source: selectedSource || DEFAULT_SOURCE,
      session: new Date().getFullYear().toString(),
      attachments: [],
      subjectId: selectedSubjectId || "",
      chapterId: selectedChapterId || "",
    } as any
    const next = [...parsedItems, newMcq]
    syncParsedItemsToText(next)
    setExpandedCards((prev) => ({ ...prev, [next.length - 1]: true }))
  }

  const toggleAllExpanded = (expand: boolean) => {
    const newMap: Record<number, boolean> = {}
    parsedItems.forEach((_, idx) => {
      newMap[idx] = expand
    })
    setExpandedCards(newMap)
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
      const result = await importMutation.mutateAsync({
        mcqs: parsedItems,
        source: selectedSource || DEFAULT_SOURCE,
        session: new Date().getFullYear().toString(),
        difficulty: selectedDifficulty as any,
      })

      toast.success(`সফলভাবে ${toBengaliDigits(result.importedCount)}টি MCQ প্রশ্ন ইম্পোর্ট করা হয়েছে!`)
      setTimeout(() => {
        router.push("/mcqs")
      }, 800)
    } catch (err: any) {
      toast.error(err.message || "বাল্ক ইম্পোর্ট ব্যর্থ হয়েছে")
    }
  }

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200 pb-12">
      {/* Shared Page Header */}
      <PageHeader
        title="JSON থেকে MCQ ইম্পোর্ট"
        description="JSON ফাইল আপলোড বা সরাসরি টেক্সট পেস্ট করে একসাথে একাধিক বহুনির্বাচনি প্রশ্ন যাচাই, সম্পাদনা ও ইম্পোর্ট করুন।"
        icon={Upload}
        badge={{ label: "বাল্ক ইম্পোর্ট", variant: "indigo" }}
        breadcrumbs={[
          { label: "MCQ তালিকা", href: "/mcqs" },
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
            <Link href="/mcqs" prefetch={true}>
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
              ১. শ্রেণি, বিষয় ও ডেটা সোর্স কনফিগারেশন
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
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
                  {MCQ_SOURCE_OPTIONS.map((opt) => (
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
                  className="rounded-xl border border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-primary/20 dark:text-primary text-xs font-bold h-8 px-3 cursor-pointer"
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
              className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-card p-3.5 font-mono text-xs text-foreground focus-visible:ring-2 focus-visible:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Validation Diagnostics / Error Locator */}
          {parseError && (
            <div className="space-y-3 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 p-5 text-rose-700 dark:text-rose-400">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="size-5 text-rose-600 shrink-0" />
                  <p className="font-bold text-sm">JSON সিনট্যাক্স ডায়াগনস্টিক ত্রুটি</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAutoFixJson}
                  className="rounded-xl bg-rose-600 text-white hover:bg-rose-700 font-bold text-xs h-8 px-3 cursor-pointer shadow-xs w-full sm:w-auto justify-center"
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
                  <p className="text-xs font-bold uppercase tracking-wider text-rose-700/80">
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

          {/* Validation Success Banner */}
          {!parseError && parsedItems.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/20 p-4 text-emerald-800 dark:text-emerald-300 text-sm">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold">JSON যাচাইকরণ সফল হয়েছে!</p>
                  <p className="text-xs text-emerald-700/80 dark:text-emerald-400">
                    মোট {toBengaliDigits(parsedItems.length)}টি বহুনির্বাচনি প্রশ্ন সফলভাবে পার্স করা হয়েছে। নিচের প্রিভিউ কার্ডে পর্যালোচনা ও সম্পাদনা করুন।
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddNewQuestionCard}
                className="rounded-xl bg-white dark:bg-card border-emerald-300 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 font-bold text-xs h-9 px-4 cursor-pointer shrink-0 w-full sm:w-auto justify-center"
              >
                <Plus className="size-3.5 mr-1" />
                নতুন প্রশ্ন কার্ড যোগ করুন
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2 Section: Parsed Questions Review & Edit Cards */}
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
                  প্রতিটি প্রশ্নের বিবরণ, অপশন ও সঠিক উত্তর চেক করুন এবং প্রয়োজনে সরাসরি সংশোধন করুন।
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => toggleAllExpanded(true)}
                className="rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 text-xs font-semibold h-9 px-3 cursor-pointer"
              >
                <Maximize2 className="size-3.5 mr-1" />
                সব প্রসারিত করুন
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => toggleAllExpanded(false)}
                className="rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 text-xs font-semibold h-9 px-3 cursor-pointer"
              >
                <Minimize2 className="size-3.5 mr-1" />
                সব সংকুচিত করুন
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddNewQuestionCard}
                className="rounded-xl border border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-primary/20 dark:text-primary font-bold text-xs h-9 px-3.5 cursor-pointer"
              >
                <Plus className="size-3.5 mr-1" />
                প্রশ্ন যোগ করুন
              </Button>
            </div>
          </div>

          {/* List of Parsed MCQ Cards */}
          <div className="space-y-6">
            {parsedItems.map((item, idx) => (
              <ParsedMcqCard
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
              className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold px-6 h-11 text-sm transition-all active:scale-95 cursor-pointer justify-center"
            >
              <Link href="/mcqs" prefetch={true}>
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
              className="w-full sm:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 h-11 text-sm shadow-sm shadow-indigo-200 dark:shadow-none transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
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
