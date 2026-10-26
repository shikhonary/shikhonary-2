"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@workspace/ui/components/sonner"
import {
  useImportShortAnswers,
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "../services/use-short-answer"
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
import { QuestionAttachments } from "@workspace/ui/components/question-attachments"
import { PageHeader } from "@/components/shared/page-header"
import { toBengaliDigits, QUESTION_DIFFICULTY_OPTIONS } from "@workspace/utils"
import { SHORT_ANSWER_SOURCE_OPTIONS, DEFAULT_SOURCE } from "../constants"
import "katex/dist/katex.min.css"
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
  Loader2,
  Sparkles,
} from "lucide-react"

const sampleJsonTemplate = `[
  {
    "question": "একটি ভেক্টরের মান শূন্য হলে তাকে কী বলে?",
    "answer": "যে ভেক্টরের মান শূন্য তাকে শূন্য ভেক্টর বা নাল ভেক্টর (Null Vector) বলে।",
    "options": [],
    "isMath": false,
    "difficulty": "EASY",
    "source": "গাইড বুক",
    "session": "2026",
    "reference": ["পদার্থবিজ্ঞান ১ম অধ্যায়"],
    "attachments": [
      {
        "type": "image",
        "caption": "চিত্র ১: নাল ভেক্টরের নির্দেশক",
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
  cleaned = cleaned.replace(/^```(?:json)?\s*/gi, "").replace(/\s*```$/g, "").trim()
  if (cleaned.endsWith(",")) {
    cleaned = cleaned.slice(0, -1).trim()
  }
  cleaned = cleaned.replace(/[“”]/g, '"').replace(/[‘’]/g, "'")
  cleaned = cleaned.replace(/^\s*\/\/.*$/gm, "")
  cleaned = cleaned.replace(
    /(?<!\\)\\(rightarrow|right|rho|rangle|Rightarrow|roots|rceil|rfloor|times|theta|text|tan|tau|tilde|to|therefore|triangle|tanh|top|tiny|textbf|textit|texttt|tfrac|tag|frac|forall|flat|beta|begin|bar|mathbf|binom|big|Big|bullet|bot|boldsymbol|bmatrix|bmod|neq|nabla|nu|not|null|neg|natural|ni|norm)\b/g,
    "\\\\$1"
  )
  cleaned = cleaned.replace(/,\s*([\]}])/g, "$1")
  if (cleaned.startsWith("{") && cleaned.endsWith("}")) {
    cleaned = `[\n${cleaned}\n]`
  }
  return cleaned
}

// Diagnostic Extractor
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
  placeholder = "সম্পাদনা করতে ক্লিক করুন...",
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
          <span className="font-headline text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
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
              className="w-full rounded-xl border-2 border-indigo-500 bg-background p-2.5 text-sm font-medium focus:outline-hidden font-body"
            />
          ) : (
            <Input
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full rounded-xl border-2 border-indigo-500 bg-background px-3 py-2 text-sm font-medium focus:outline-hidden font-body"
            />
          )}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1 font-body">
            <span>সংরক্ষণে Enter চাপুন, বাতিলের জন্য Esc চাপুন</span>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                handleBlur()
              }}
              className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
            >
              সংরক্ষণ
            </button>
          </div>
        </div>
      ) : (
        <div
          onDoubleClick={() => setIsEditing(true)}
          title="সম্পাদনা করতে ডাবল-ক্লিক করুন"
          className={cn(
            "group/edit min-h-9 cursor-pointer rounded-xl border border-transparent bg-slate-50/50 dark:bg-white/[0.02] p-2.5 transition-all hover:border-indigo-300 hover:bg-indigo-50/30",
            !value && "italic text-muted-foreground",
            textClassName
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <span className="flex-1 whitespace-pre-wrap font-medium text-foreground text-sm leading-relaxed font-body">
              <RenderMath text={value || placeholder} isMath={isMath} />
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing(true)
              }}
              className="opacity-100 md:opacity-0 md:group-hover/edit:opacity-100 transition-opacity text-[10px] font-bold text-indigo-600 dark:text-primary shrink-0 bg-indigo-50 dark:bg-primary/10 px-2 py-0.5 rounded-md select-none cursor-pointer border-0 outline-hidden font-headline"
            >
              এডিট
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

interface EditableSaCardProps {
  index: number
  item: any
  defaultSource?: string
  onChange: (updated: any) => void
  onDelete: () => void
  onDuplicate: () => void
}

function EditableSaCard({ index, item, defaultSource, onChange, onDelete, onDuplicate }: EditableSaCardProps) {
  const handleToggleDifficulty = () => {
    const difficulties = ["EASY", "MEDIUM", "HARD"]
    const nextIdx = (difficulties.indexOf(item.difficulty || "MEDIUM") + 1) % difficulties.length
    onChange({ ...item, difficulty: difficulties[nextIdx] })
  }

  const handleToggleActive = () => {
    onChange({ ...item, isActive: item.isActive !== false ? false : true })
  }

  const handleSaveReferences = (val: string) => {
    const refs = val.split(",").map((r) => r.trim()).filter(Boolean)
    onChange({ ...item, reference: refs })
  }

  const diffMap: Record<string, { label: string; className: string }> = {
    EASY: { label: "সহজ", className: "border-emerald-500 text-emerald-700 bg-emerald-50" },
    MEDIUM: { label: "মাঝারি", className: "border-amber-500 text-amber-700 bg-amber-50" },
    HARD: { label: "কঠিন", className: "border-rose-500 text-rose-700 bg-rose-50" },
  }

  return (
    <Card className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs hover:shadow-md transition-shadow">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-100 dark:bg-primary/20 font-solaiman text-xs font-bold text-indigo-700 dark:text-primary">
            #{toBengaliDigits(index + 1)}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
            সংক্ষিপ্ত উত্তর প্রিভিউ
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Difficulty */}
          <button type="button" onClick={handleToggleDifficulty} className="cursor-pointer">
            <Badge
              variant="outline"
              className={cn(
                "px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider font-body",
                diffMap[item.difficulty]?.className || diffMap["MEDIUM"]!.className
              )}
            >
              {diffMap[item.difficulty]?.label || "মাঝারি"}
            </Badge>
          </button>

          {/* Math Mode Toggle */}
          <button
            type="button"
            onClick={() => onChange({ ...item, isMath: !item.isMath })}
            title="গণিত মোড পরিবর্তন করুন"
            className="cursor-pointer"
          >
            <Badge
              variant={item.isMath ? "outline" : "ghost"}
              className={cn(
                "px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-transform active:scale-95 font-body",
                item.isMath ? "border-indigo-500 text-indigo-600 bg-indigo-50 dark:bg-primary/10" : "text-muted-foreground"
              )}
            >
              {item.isMath ? "∑ গণিত সক্রিয়" : "টেক্সট"}
            </Badge>
          </button>

          {/* Visibility */}
          <button type="button" onClick={handleToggleActive} className="cursor-pointer">
            <Badge
              variant="outline"
              className={cn(
                "px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider font-body",
                item.isActive !== false ? "border-emerald-500 text-emerald-600 bg-emerald-50" : "border-slate-400 text-slate-500 bg-slate-50"
              )}
            >
              {item.isActive !== false ? "অ্যাক্টিভ" : "ইনঅ্যাক্টিভ"}
            </Badge>
          </button>

          {/* Delete & Duplicate */}
          <div className="flex items-center gap-1 ml-2 border-l border-slate-200 dark:border-white/[0.08] pl-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={onDuplicate}
              title="কপি করুন"
              className="text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer size-7"
            >
              <Copy className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={onDelete}
              title="মুছুন"
              className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer size-7"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Attachments Section */}
        {Array.isArray(item.attachments) && item.attachments.length > 0 && (
          <div className="space-y-1.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-3.5">
            <span className="font-headline text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              সংযুক্তি ({toBengaliDigits(item.attachments.length)}টি)
            </span>
            <QuestionAttachments attachments={item.attachments} isMath={item.isMath} />
          </div>
        )}

        {/* Question Text */}
        <EditableField
          label="প্রশ্ন (Question Stem) *"
          value={item.question || ""}
          multiline
          isMath={item.isMath}
          placeholder="প্রশ্নের বিষয়বস্তু লিখুন..."
          onSave={(newVal) => onChange({ ...item, question: newVal })}
        />

        {/* Options (Optional) */}
        <EditableField
          label="উত্তর অপশনসমূহ (ঐচ্ছিক, কমা দিয়ে আলাদা করুন)"
          value={Array.isArray(item.options) ? item.options.join(", ") : ""}
          isMath={item.isMath}
          placeholder="যেমন: অপশন ১, অপশন ২, অপশন ৩, অপশন ৪"
          onSave={(newVal) => {
            const arr = newVal ? newVal.split(",").map((s: string) => s.trim()).filter(Boolean) : []
            onChange({ ...item, options: arr })
          }}
        />

        {/* Answer Text */}
        <EditableField
          label="আদর্শ উত্তর / সমাধান (ঐচ্ছিক)"
          value={item.answer || ""}
          multiline
          isMath={item.isMath}
          placeholder="উত্তর বা সমাধান নির্দেশিকা লিখুন..."
          onSave={(newVal) => onChange({ ...item, answer: newVal || undefined })}
        />

        {/* Clean Metadata: Source & References (Zero Session Input Clutter) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200/80 dark:border-white/[0.08] pt-3 items-center">
          <div className="space-y-1.5">
            <span className="font-headline text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              উৎস (Source)
            </span>
            <Select
              value={item.source || defaultSource || DEFAULT_SOURCE}
              onValueChange={(val) => onChange({ ...item, source: val })}
            >
              <SelectTrigger className="w-full bg-background h-10 text-xs rounded-xl border border-slate-200 dark:border-white/[0.08] font-body">
                <SelectValue placeholder="উৎস নির্বাচন করুন..." />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground border border-slate-200 dark:border-white/[0.08] shadow-md font-body">
                {SHORT_ANSWER_SOURCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <EditableField
            label="রেফারেন্স ট্যাগ (কমা দিয়ে আলাদা করুন)"
            value={Array.isArray(item.reference) ? item.reference.join(", ") : ""}
            placeholder="যেমন: পদার্থবিজ্ঞান ১ম অধ্যায়, পাঞ্জেরী ২০২৪..."
            onSave={handleSaveReferences}
          />
        </div>
      </div>
    </Card>
  )
}

export function ImportShortAnswerView() {
  const router = useRouter()
  const importMutation = useImportShortAnswers()

  const [jsonText, setJsonText] = useState<string>("")
  const [selectedAcademicClassId, setSelectedAcademicClassId] = useState<string>("")
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("")
  const [selectedChapterId, setSelectedChapterId] = useState<string>("")
  const [selectedSource, setSelectedSource] = useState<string>(DEFAULT_SOURCE)
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

  const handleSourceChange = (sourceVal: string) => {
    setSelectedSource(sourceVal)
    if (parsedItems.length > 0) {
      const updated = parsedItems.map((item) => ({
        ...item,
        source: item.source || sourceVal,
      }))
      syncParsedItemsToText(updated)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        setJsonText(content)
        validateAndParseJson(content, selectedAcademicClassId, selectedSubjectId, selectedChapterId, selectedSource)
      }
    }
    reader.readAsText(file)
  }

  const validateAndParseJson = (
    text: string,
    overrideClassId: string,
    overrideSubjectId: string,
    overrideChapterId: string,
    overrideSource?: string
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
          toast.success("JSON ফরম্যাট স্বয়ংক্রিয়ভাবে সংশোধন করা হয়েছে!")
        } catch {
          // Keep raw errors
        }
      }

      if (!rawData) {
        const errMsg = err.message || "Invalid JSON syntax"
        setParseError(`Syntax Error: ${errMsg}`)
        setErrorContext(findJsonErrorPosition(text, errMsg))
        return
      }
    }

    try {
      const itemsArray = Array.isArray(rawData) ? rawData : [rawData]
      if (itemsArray.length === 0) {
        setParseError("JSON অ্যারে খালি পাওয়া গেছে।")
        return
      }

      const validated: any[] = []
      const errors: string[] = []

      itemsArray.forEach((item: any, idx: number) => {
        const itemNum = idx + 1
        const subjectId = item.subjectId || overrideSubjectId
        const chapterId = item.chapterId || overrideChapterId

        if (!item.question || typeof item.question !== "string") {
          errors.push(`আইটেম #${toBengaliDigits(itemNum)}: 'question' ফিল্ড অনুপস্থিত।`)
        }
        if (!subjectId) {
          errors.push(`আইটেম #${toBengaliDigits(itemNum)}: বিষয় অনুপস্থিত।`)
        }
        if (!chapterId) {
          errors.push(`আইটেম #${toBengaliDigits(itemNum)}: অধ্যায় অনুপস্থিত।`)
        }

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
            position: att.position !== undefined && att.position !== null ? Number(att.position) : aIdx,
          }))

        const optionsList = Array.isArray(item.options)
          ? item.options.map((o: any) => String(o).trim()).filter(Boolean)
          : typeof item.options === "string"
          ? item.options.split(",").map((s: string) => s.trim()).filter(Boolean)
          : []

        const currentDefaultSource = overrideSource || selectedSource || DEFAULT_SOURCE
        const currentYear = new Date().getFullYear().toString()

        validated.push({
          subjectId,
          chapterId,
          question: String(item.question || "").trim(),
          answer: item.answer ? String(item.answer).trim() : null,
          options: optionsList,
          isMath: item.isMath !== undefined ? Boolean(item.isMath) : false,
          difficulty: item.difficulty || "MEDIUM",
          year: item.year !== undefined && item.year !== null ? Number(item.year) : null,
          source: item.source ? String(item.source).trim() : currentDefaultSource,
          session: item.session ? String(item.session).trim() : (item.year ? String(item.year) : currentYear),
          reference: Array.isArray(item.reference) ? item.reference : [],
          isActive: item.isActive !== false,
          attachments: mappedAttachments,
        })
      })

      if (errors.length > 0) {
        setParseError(errors.slice(0, 5).join(" | ") + (errors.length > 5 ? ` (+${errors.length - 5} আরও ত্রুটি)` : ""))
      }

      setParsedItems(validated)
    } catch (err: any) {
      setParseError(`যাচাইকরণে ত্রুটি: ${err.message || "সংক্ষিপ্ত উত্তর প্রসেস করা সম্ভব হয়নি।"}`)
    }
  }

  const handleAutoFixJson = () => {
    if (!jsonText.trim()) return
    const repaired = repairJsonSyntax(jsonText)
    setJsonText(repaired)
    validateAndParseJson(repaired, selectedAcademicClassId, selectedSubjectId, selectedChapterId, selectedSource)
    toast.success("JSON ফরম্যাট স্বয়ংক্রিয়ভাবে সংশোধন করা হয়েছে!")
  }

  const syncParsedItemsToText = (newItems: any[]) => {
    setParsedItems(newItems)
    setParseError(null)
    setErrorContext(null)
    setJsonText(JSON.stringify(newItems, null, 2))
  }

  const handleJsonChange = (val: string) => {
    setJsonText(val)
    validateAndParseJson(val, selectedAcademicClassId, selectedSubjectId, selectedChapterId, selectedSource)
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

  const handleUpdateParsedItem = (idx: number, updated: any) => {
    const next = [...parsedItems]
    next[idx] = updated
    syncParsedItemsToText(next)
  }

  const handleDeleteParsedItem = (idx: number) => {
    const next = parsedItems.filter((_, i) => i !== idx)
    syncParsedItemsToText(next)
  }

  const handleDuplicateParsedItem = (idx: number) => {
    const itemToCopy = parsedItems[idx]
    if (!itemToCopy) return
    const next = [...parsedItems]
    next.splice(idx + 1, 0, {
      ...itemToCopy,
      question: `${itemToCopy.question} (কপি)`,
    })
    syncParsedItemsToText(next)
  }

  const handleAddNewQuestionCard = () => {
    const next = [
      ...parsedItems,
      {
        question: "নতুন প্রশ্ন...",
        answer: "",
        options: [],
        isMath: false,
        difficulty: "MEDIUM",
        source: selectedSource || DEFAULT_SOURCE,
        session: new Date().getFullYear().toString(),
        isActive: true,
        reference: [],
      },
    ]
    syncParsedItemsToText(next)
  }

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(sampleJsonTemplate)
    toast.success("টেমপ্লেট কপি করা হয়েছে!")
  }

  const handleImport = async () => {
    if (parsedItems.length === 0 || parseError) {
      toast.error("অনুগ্রহ করে প্রথমে JSON ত্রুটি সমাধান করুন।")
      return
    }

    try {
      const currentYear = new Date().getFullYear().toString()
      const payload = parsedItems.map((item) => ({
        classId: selectedAcademicClassId,
        subjectId: selectedSubjectId,
        chapterId: selectedChapterId,
        question: item.question.trim(),
        answer: item.answer?.trim() || null,
        options: Array.isArray(item.options) ? item.options : [],
        isMath: Boolean(item.isMath),
        difficulty: item.difficulty as any,
        year: item.year !== undefined && item.year !== null ? Number(item.year) : null,
        source: item.source ? String(item.source).trim() : (selectedSource || DEFAULT_SOURCE),
        session: item.session ? String(item.session).trim() : (item.year ? String(item.year) : currentYear),
        reference: Array.isArray(item.reference) ? item.reference : [],
        isActive: item.isActive !== false,
        attachments: Array.isArray(item.attachments) ? item.attachments : [],
      }))

      const res = await importMutation.mutateAsync({ shortAnswers: payload })
      toast.success(`সফলভাবে ${toBengaliDigits(res.importedCount)}টি সংক্ষিপ্ত উত্তর ইমপোর্ট করা হয়েছে!`)
      setTimeout(() => {
        router.push("/short-answers")
      }, 800)
    } catch (err: any) {
      toast.error(err.message || "সংক্ষিপ্ত উত্তর ইমপোর্ট করা সম্ভব হয়নি।")
    }
  }

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200 pb-12">
      {/* Shared Page Header */}
      <PageHeader
        title="JSON থেকে সংক্ষিপ্ত উত্তর ইমপোর্ট"
        description="একসাথে একাধিক সংক্ষিপ্ত উত্তর প্রশ্ন আপলোড করুন এবং সংরক্ষণ করার পূর্বে প্রিভিউ দেখে সম্পাদনা করুন।"
        icon={Upload}
        badge={{ label: "JSON ইমপোর্ট", variant: "indigo" }}
        breadcrumbs={[
          { label: "সংক্ষিপ্ত উত্তর তালিকা", href: "/short-answers" },
          { label: "JSON ইমপোর্ট" },
        ]}
      >
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowSample(!showSample)}
            className="h-10 px-4 rounded-xl border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-foreground font-semibold text-xs sm:text-sm gap-2 font-headline"
          >
            <Code className="size-4" />
            <span>{showSample ? "টেমপ্লেট লুকান" : "নমুনা JSON দেখুন"}</span>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-10 px-4 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-xs font-headline"
          >
            <Link href="/short-answers" prefetch={true}>
              <ArrowLeft className="w-4 h-4" />
              <span>তালিকায় ফিরে যান</span>
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* Sample JSON Template Card */}
      {showSample && (
        <Card className="overflow-hidden rounded-2xl border border-indigo-200 dark:border-primary/20 bg-indigo-50/20 dark:bg-primary/5 p-5 sm:p-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <h4 className="font-headline text-base font-bold text-indigo-700 dark:text-primary flex items-center gap-2">
              <FileCode className="size-5" />
              প্রত্যাশিত JSON ফরম্যাট
            </h4>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleCopyTemplate}
              className="rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold text-xs cursor-pointer font-headline"
            >
              টেমপ্লেট কপি করুন
            </Button>
          </div>
          <pre className="whitespace-pre-wrap break-all sm:break-normal overflow-x-auto rounded-xl bg-card p-4 font-mono text-xs text-foreground leading-relaxed border border-slate-200/80 dark:border-white/[0.08]">
            {sampleJsonTemplate}
          </pre>
        </Card>
      )}

      {/* Main Hierarchy & Input Section */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-xs overflow-hidden">
        <CardHeader className="border-b border-slate-200/80 dark:border-white/[0.08] p-6 bg-slate-50/50 dark:bg-white/[0.02]">
          <CardTitle className="font-headline text-lg font-bold text-foreground">
            শ্রেণি, বিষয় ও অধ্যায় নির্ধারণ (ডিফল্ট মান)
          </CardTitle>
          <p className="font-body text-xs text-muted-foreground mt-1">
            ডিফল্ট মান নির্বাচন করুন। যে প্রশ্নগুলোতে নির্দিষ্ট বিষয় বা অধ্যায় উল্লেখ থাকবে না, সেগুলো স্বয়ংক্রিয়ভাবে এই মানগুলো গ্রহণ করবে।
          </p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Taxonomy Grid (4 Columns: Class, Subject, Chapter, Default Source - ZERO manual session input) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Academic Class */}
            <div className="space-y-2">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                শ্রেণি (Academic Class)
              </Label>
              <Select
                value={selectedAcademicClassId || "all"}
                onValueChange={handleAcademicClassChange}
              >
                <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm h-11 px-4 cursor-pointer font-body">
                  <SelectValue placeholder="শ্রেণি নির্বাচন করুন..." />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border border-slate-200 dark:border-white/[0.08] font-body">
                  <SelectItem value="all">সকল শ্রেণি</SelectItem>
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
                ডিফল্ট বিষয় (Subject)
              </Label>
              <Select
                value={selectedSubjectId}
                onValueChange={handleSubjectChange}
              >
                <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm h-11 px-4 cursor-pointer font-body">
                  <SelectValue placeholder="বিষয় নির্বাচন করুন..." />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border border-slate-200 dark:border-white/[0.08] font-body">
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
                ডিফল্ট অধ্যায় (Chapter)
              </Label>
              <Select
                disabled={!selectedSubjectId}
                value={selectedChapterId}
                onValueChange={handleChapterChange}
              >
                <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm h-11 px-4 cursor-pointer font-body disabled:opacity-50">
                  <SelectValue placeholder={selectedSubjectId ? "অধ্যায় নির্বাচন করুন..." : "প্রথমে বিষয় নির্বাচন করুন"} />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border border-slate-200 dark:border-white/[0.08] font-body">
                  {chapters.map((ch) => (
                    <SelectItem key={ch.id} value={ch.id}>
                      {ch.nameBn || ch.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Default Source Select */}
            <div className="space-y-2">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                উৎস (Source) *
              </Label>
              <Select
                value={selectedSource}
                onValueChange={(val) => handleSourceChange(val ?? DEFAULT_SOURCE)}
              >
                <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm h-11 px-4 cursor-pointer font-body">
                  <SelectValue placeholder="উৎস নির্বাচন করুন..." />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border border-slate-200 dark:border-white/[0.08] font-body">
                  {SHORT_ANSWER_SOURCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Warning Notification */}
          {(!selectedAcademicClassId || !selectedSubjectId || !selectedChapterId) && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 p-3.5 text-amber-800 dark:text-amber-400 text-xs font-semibold font-body">
              <AlertTriangle className="size-4 text-amber-600 shrink-0" />
              <span>উপরে শ্রেণি, বিষয় এবং অধ্যায় নির্বাচন করুন যাতে JSON আপলোড সক্রিয় হয়।</span>
            </div>
          )}

          {/* JSON File Uploader */}
          <div className="border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
            <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 font-headline">
              JSON ফাইল আপলোড করুন
            </Label>
            <input
              type="file"
              accept=".json"
              disabled={!selectedAcademicClassId || !selectedSubjectId || !selectedChapterId}
              onChange={handleFileUpload}
              className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer disabled:opacity-50 font-body"
            />
          </div>

          {/* Textarea Paste */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                অথবা নিচে JSON কোড পেস্ট করুন
              </Label>
              {jsonText.trim() && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAutoFixJson}
                  className="rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold text-xs cursor-pointer font-headline gap-1.5"
                >
                  <Wand2 className="size-3.5" />
                  <span>অটো-ফিক্স ও ফরম্যাট JSON</span>
                </Button>
              )}
            </div>
            <Textarea
              rows={6}
              disabled={!selectedAcademicClassId || !selectedSubjectId || !selectedChapterId}
              placeholder={
                !selectedAcademicClassId || !selectedSubjectId || !selectedChapterId
                  ? "প্রথমে উপরে শ্রেণি, বিষয় ও অধ্যায় নির্বাচন করুন..."
                  : "এখানে JSON অ্যারে পেস্ট করুন..."
              }
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] p-3.5 font-mono text-xs text-foreground focus:border-indigo-600 disabled:opacity-50"
            />
          </div>

          {/* Validation Diagnostics */}
          {parseError && (
            <div className="space-y-3 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/20 p-4 text-rose-700 dark:text-rose-400">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-5 text-rose-600 shrink-0" />
                  <p className="font-bold text-sm font-headline">JSON সিনট্যাক্স ত্রুটি</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAutoFixJson}
                  className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-xs font-headline gap-1.5"
                >
                  <Wand2 className="size-3.5" />
                  <span>স্বয়ংক্রিয়ভাবে সংশোধন করুন</span>
                </Button>
              </div>

              <p className="font-mono text-xs leading-relaxed bg-card p-3 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600">
                {parseError}
              </p>

              {/* Code Snippet Error Pointer */}
              {errorContext && errorContext.linesContext.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-rose-700/80 font-headline">
                    ত্রুটির স্থান (লাইন {toBengaliDigits(errorContext.line)}
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
                          {toBengaliDigits(l.num)}
                        </span>
                        <span className="whitespace-pre">{l.content}</span>
                        {l.isError && (
                          <span className="ml-auto text-[10px] uppercase tracking-wider bg-rose-600 text-white px-1.5 py-0.5 rounded shrink-0">
                            ত্রুটি এখানে
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 text-emerald-800 dark:text-emerald-400 text-sm">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold font-headline">JSON সফলভাবে যাচাই করা হয়েছে!</p>
                  <p className="text-xs font-body">{toBengaliDigits(parsedItems.length)}টি সংক্ষিপ্ত উত্তর প্রশ্ন পাওয়া গেছে।</p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddNewQuestionCard}
                className="rounded-xl bg-card border-emerald-300 text-emerald-800 hover:bg-emerald-50 font-bold text-xs cursor-pointer shrink-0 font-headline gap-1.5"
              >
                <Plus className="size-3.5" />
                <span>নতুন কার্ড যোগ করুন</span>
              </Button>
            </div>
          )}

          {/* List Previews */}
          {parsedItems.length > 0 && (
            <div className="border-t border-slate-200/80 dark:border-white/[0.08] pt-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h4 className="font-headline text-base font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="size-4 text-indigo-600 dark:text-primary shrink-0" />
                  সম্পাদনাযোগ্য প্রিভিউ ({toBengaliDigits(parsedItems.length)}টি প্রশ্ন)
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddNewQuestionCard}
                  className="rounded-xl font-bold text-xs text-indigo-600 dark:text-primary border-indigo-200 hover:bg-indigo-50 cursor-pointer font-headline gap-1.5"
                >
                  <Plus className="size-3.5" />
                  <span>প্রশ্ন যোগ করুন</span>
                </Button>
              </div>

              <div className="space-y-6">
                {parsedItems.map((item, idx) => (
                  <EditableSaCard
                    key={idx}
                    index={idx}
                    item={item}
                    defaultSource={selectedSource}
                    onChange={(updated) => handleUpdateParsedItem(idx, updated)}
                    onDelete={() => handleDeleteParsedItem(idx)}
                    onDuplicate={() => handleDuplicateParsedItem(idx)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Submit Action buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:items-center sm:justify-between border-t border-slate-200/80 dark:border-white/[0.08] pt-6 font-bold">
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold px-6 h-11 text-sm transition-all active:scale-95 cursor-pointer font-headline"
            >
              <Link href="/short-answers" prefetch={true}>
                বাতিল
              </Link>
            </Button>
            <Button
              type="button"
              disabled={parsedItems.length === 0 || Boolean(parseError) || importMutation.isPending}
              onClick={handleImport}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 h-11 text-sm shadow-sm shadow-indigo-200 dark:shadow-none transition-all active:scale-95 cursor-pointer font-headline disabled:opacity-50"
            >
              {importMutation.isPending ? (
                <Loader2 className="size-4 animate-spin shrink-0" />
              ) : (
                <Upload className="size-4 shrink-0" />
              )}
              <span>
                {importMutation.isPending
                  ? "ইমপোর্ট করা হচ্ছে..."
                  : `${toBengaliDigits(parsedItems.length)}টি সংক্ষিপ্ত উত্তর ইমপোর্ট করুন`}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
