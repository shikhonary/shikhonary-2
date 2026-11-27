"use client"

import React, { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { toast } from "@workspace/ui/components/sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Badge } from "@workspace/ui/components/badge"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  PlusCircle,
  Sparkles,
  Loader2,
  BookOpen,
  Info,
  CheckCircle2,
  Layers,
  Image as ImageIcon,
  Table as TableIcon,
  Trash2,
  Upload,
  Plus,
  Minus,
  X,
  FileText,
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { useQuickCreateQuestion } from "@/modules/question-paper/services/use-question-paper"
import { toBengaliDigits, type QuestionTypeCode } from "@workspace/utils"

export interface QuestionAttachmentDraft {
  id: string
  type: "IMAGE" | "TABLE" | "PASSAGE"
  url?: string
  caption?: string
  content?: string
  table?: { headers: string[]; rows: string[][] }
  tableBorder?: boolean
}

export type CqAttachmentDraft = QuestionAttachmentDraft

interface QuestionAttachmentsEditorProps {
  label?: string
  attachments: QuestionAttachmentDraft[]
  onAddText?: () => void
  onAddImage: () => void
  onAddTable: () => void
  onRemove: (id: string) => void
  onUpdate: (id: string, updates: Partial<QuestionAttachmentDraft>) => void
  onAddColumn: (id: string) => void
  onRemoveColumn: (id: string, colIndex: number) => void
  onAddRow: (id: string) => void
  onRemoveRow: (id: string) => void
}

function QuestionAttachmentsEditor({
  label = "ছবি বা ছক সংযুক্তি (ঐচ্ছিক)",
  attachments,
  onAddText,
  onAddImage,
  onAddTable,
  onRemove,
  onUpdate,
  onAddColumn,
  onRemoveColumn,
  onAddRow,
  onRemoveRow,
}: QuestionAttachmentsEditorProps) {
  return (
    <div className="space-y-2 pt-0.5 font-body">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span>{label}</span>
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {onAddText && (
            <button
              type="button"
              onClick={onAddText}
              className="px-2.5 py-1 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary text-[11px] font-bold font-headline flex items-center gap-1 cursor-pointer transition-colors"
            >
              <FileText className="w-3 h-3" />
              <span>+ অনুচ্ছেদ যোগ</span>
            </button>
          )}
          <button
            type="button"
            onClick={onAddImage}
            className="px-2.5 py-1 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary text-[11px] font-bold font-headline flex items-center gap-1 cursor-pointer transition-colors"
          >
            <ImageIcon className="w-3 h-3" />
            <span>+ ছবি যোগ</span>
          </button>
          <button
            type="button"
            onClick={onAddTable}
            className="px-2.5 py-1 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary text-[11px] font-bold font-headline flex items-center gap-1 cursor-pointer transition-colors"
          >
            <TableIcon className="w-3 h-3" />
            <span>+ ছক তৈরি</span>
          </button>
        </div>
      </div>

      {/* List of Attachments */}
      {attachments.length > 0 && (
        <div className="space-y-3 pt-1">
          {attachments.map((att, attIdx) => (
            <div
              key={att.id}
              className="p-3 rounded-xl border border-outline-variant/60 bg-muted/20 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold font-headline text-primary flex items-center gap-1.5">
                  {att.type === "IMAGE" ? (
                    <>
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>সংযুক্তি {toBengaliDigits(attIdx + 1)}: ছবি / চিত্র</span>
                    </>
                  ) : att.type === "TABLE" ? (
                    <>
                      <TableIcon className="w-3.5 h-3.5" />
                      <span>সংযুক্তি {toBengaliDigits(attIdx + 1)}: ছক / টেবিল</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5" />
                      <span>সংযুক্তি {toBengaliDigits(attIdx + 1)}: উদ্দীপক অনুচ্ছেদ / পাঠ্য</span>
                    </>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(att.id)}
                  className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors flex items-center gap-1 text-[11px] font-semibold font-headline"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">মুছুন</span>
                </button>
              </div>

              {/* Caption input */}
              <div className="space-y-1">
                <Input
                  placeholder={
                    att.type === "IMAGE"
                      ? "ক্যাপশন বা শিরোনাম (যেমন: চিত্র-১: মানবদেহের পরিপাকতন্ত্র)"
                      : att.type === "TABLE"
                      ? "ছকের শিরোনাম (যেমন: ছক-১: তথ্য উপাত্ত)"
                      : "অনুচ্ছেদ বা উদ্দীপকের শিরোনাম (ঐচ্ছিক)"
                  }
                  value={att.caption || ""}
                  onChange={(e) => onUpdate(att.id, { caption: e.target.value })}
                  className="h-8 rounded-lg text-xs bg-white border border-outline-variant/60"
                />
              </div>

              {/* If IMAGE */}
              {att.type === "IMAGE" && (
                <div className="space-y-2">
                  {att.url ? (
                    <div className="relative inline-block border rounded-lg p-1 bg-white">
                      <img
                        src={att.url}
                        alt={att.caption || "ছবি"}
                        className="max-h-28 object-contain rounded"
                      />
                      <button
                        type="button"
                        onClick={() => onUpdate(att.id, { url: "" })}
                        className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-0.5 shadow-xs hover:bg-rose-700 cursor-pointer"
                        title="ছবি মুছুন"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <label className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 border-2 border-dashed border-primary/30 rounded-xl hover:border-primary/60 bg-primary/5 cursor-pointer transition-colors text-xs text-primary font-medium">
                        <Upload className="w-4 h-4" />
                        <span>ছবি আপলোড করুন</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) {
                                toast.error("ছবির সাইজ সর্বোচ্চ ৫MB হতে পারবে")
                                return
                              }
                              const reader = new FileReader()
                              reader.onload = () => {
                                onUpdate(att.id, { url: reader.result as string })
                              }
                              reader.readAsDataURL(file)
                            }
                          }}
                        />
                      </label>
                      <span className="text-[11px] text-muted-foreground font-body">অথবা</span>
                      <Input
                        placeholder="ছবির সরাসরি লিংক (URL)..."
                        className="h-9 text-xs rounded-xl flex-1 bg-white border border-outline-variant/60"
                        onBlur={(e) => {
                          if (e.target.value.trim()) {
                            onUpdate(att.id, { url: e.target.value.trim() })
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* If TABLE */}
              {att.type === "TABLE" && att.table && (
                <div className="space-y-2">
                  <div className="overflow-x-auto border border-outline-variant/60 rounded-xl bg-white p-2">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr>
                          {att.table.headers.map((h, hIdx) => (
                            <th key={hIdx} className="p-1 border border-border/70 bg-muted/40 font-bold">
                              <div className="flex items-center gap-1">
                                <Input
                                  value={h}
                                  onChange={(e) => {
                                    const newHeaders = [...att.table!.headers]
                                    newHeaders[hIdx] = e.target.value
                                    onUpdate(att.id, {
                                      table: { ...att.table!, headers: newHeaders },
                                    })
                                  }}
                                  placeholder={`কলাম ${hIdx + 1}`}
                                  className="h-7 text-xs p-1 font-bold bg-transparent border-none shadow-none focus-visible:ring-0"
                                />
                                {att.table!.headers.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => onRemoveColumn(att.id, hIdx)}
                                    className="text-rose-400 hover:text-rose-600 p-0.5 cursor-pointer"
                                    title="কলাম মুছুন"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {att.table.rows.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-1 border border-border/70">
                                <Input
                                  value={cell}
                                  onChange={(e) => {
                                    const newRows = att.table!.rows.map((r, ri) =>
                                      ri === rIdx
                                        ? r.map((c, ci) => (ci === cIdx ? e.target.value : c))
                                        : r
                                    )
                                    onUpdate(att.id, {
                                      table: { ...att.table!, rows: newRows },
                                    })
                                  }}
                                  placeholder="..."
                                  className="h-7 text-xs p-1 bg-transparent border-none shadow-none focus-visible:ring-0"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Controls */}
                  <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onAddColumn(att.id)}
                        className="h-7 px-2 text-[11px] rounded-lg gap-1 font-headline font-bold cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>কলাম যোগ</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onAddRow(att.id)}
                        className="h-7 px-2 text-[11px] rounded-lg gap-1 font-headline font-bold cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>সারি যোগ</span>
                      </Button>
                      {att.table.rows.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveRow(att.id)}
                          className="h-7 px-2 text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg gap-1 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                          <span>শেষ সারি মুছুন</span>
                        </Button>
                      )}
                    </div>

                    <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer select-none">
                      <Checkbox
                        checked={att.tableBorder ?? true}
                        onCheckedChange={(c) =>
                          onUpdate(att.id, { tableBorder: Boolean(c) })
                        }
                      />
                      <span>ছকে দাগ / বর্ডার দেখান</span>
                    </label>
                  </div>
                </div>
              )}

              {/* If PASSAGE / TEXT */}
              {att.type === "PASSAGE" && (
                <div className="space-y-1.5">
                  <Textarea
                    rows={3}
                    placeholder="এখানে উদ্দীপকের অনুচ্ছেদ বা মূল পাঠ্য লিখুন..."
                    value={att.content || ""}
                    onChange={(e) => onUpdate(att.id, { content: e.target.value })}
                    className="rounded-xl border border-outline-variant/60 bg-white text-xs sm:text-sm text-on-surface placeholder:text-outline resize-none focus-visible:ring-primary/20"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface QuickCreateQuestionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paperId: string
  distributionId: string
  subjectId: string
  subjectName?: string
  className?: string
  category: QuestionTypeCode | string
  defaultChapterId?: string
  defaultSearchText?: string
  sectionId?: string
  subSectionId?: string
  autoAssign?: boolean
  onSuccess?: (newQuestionId: string, wasAutoAssigned?: boolean) => void
}

const BENGALI_OPTIONS = ["ক", "খ", "গ", "ঘ"]
const ROMAN_NUMERALS = ["i", "ii", "iii", "iv", "v", "vi"]
const MULTIPLE_DEFAULT_OPTIONS = ["i ও ii", "i ও iii", "ii ও iii", "i, ii ও iii"]

export function QuickCreateQuestionModal({
  open,
  onOpenChange,
  paperId,
  distributionId,
  subjectId,
  subjectName,
  className,
  category,
  defaultChapterId,
  defaultSearchText,
  sectionId,
  subSectionId,
  autoAssign = true,
  onSuccess,
}: QuickCreateQuestionModalProps) {
  const queryClient = useQueryClient()
  const quickCreateMutation = useQuickCreateQuestion()

  // Academic chapters for this subject
  const { data: chaptersData } = useQuery({
    ...trpc.academicChapter.list.queryOptions({ subjectId, limit: 100 }),
    enabled: Boolean(subjectId) && open,
    retry: false,
    refetchOnWindowFocus: false,
  })
  const chapters = (chaptersData?.academicChapters ?? []) as Array<{ id: string; nameBn: string; nameEn: string }>

  const [selectedChapterId, setSelectedChapterId] = useState<string>("")
  const [shouldAutoAssign, setShouldAutoAssign] = useState<boolean>(autoAssign ?? true)

  // Form states
  // MCQ state
  const [mcqType, setMcqType] = useState<"SINGLE" | "MULTIPLE" | "COMBINED">("SINGLE")
  const [mcqStatements, setMcqStatements] = useState<string[]>(["", "", ""])
  const [mcqQuestion, setMcqQuestion] = useState("")
  const [mcqOptions, setMcqOptions] = useState<string[]>(["", "", "", ""])
  const [mcqCorrectIndex, setMcqCorrectIndex] = useState<number>(0)

  // Unified Question Attachments state (MCQ, CQ, SA)
  const [attachments, setAttachments] = useState<QuestionAttachmentDraft[]>([])

  // CQ state
  const [cqQuestionA, setCqQuestionA] = useState("")
  const [cqQuestionB, setCqQuestionB] = useState("")
  const [cqQuestionC, setCqQuestionC] = useState("")
  const [cqQuestionD, setCqQuestionD] = useState("")

  // Generic / Short Question state
  const [textQuestion, setTextQuestion] = useState("")

  useEffect(() => {
    if (open) {
      setShouldAutoAssign(autoAssign ?? true)
      setMcqType("SINGLE")
      setMcqStatements(["", "", ""])
      setMcqOptions(["", "", "", ""])
      setMcqCorrectIndex(0)

      if (category === "CQ") {
        setAttachments([
          {
            id: Math.random().toString(36).substring(2, 9),
            type: "PASSAGE",
            content: "",
            caption: "",
          },
        ])
      } else {
        setAttachments([])
      }

      if (defaultChapterId && defaultChapterId !== "All" && defaultChapterId !== "all") {
        setSelectedChapterId(defaultChapterId)
      } else {
        setSelectedChapterId("")
      }

      if (defaultSearchText) {
        setMcqQuestion(defaultSearchText)
        setTextQuestion(defaultSearchText)
      } else {
        setMcqQuestion("")
        setTextQuestion("")
      }
    }
  }, [open, category, defaultChapterId, defaultSearchText, autoAssign])

  const handleTypeChange = (nextType: "SINGLE" | "MULTIPLE" | "COMBINED") => {
    setMcqType(nextType)
    if (nextType === "COMBINED") {
      setAttachments((prev) => {
        if (prev.length === 0) {
          return [
            {
              id: Math.random().toString(36).substring(2, 9),
              type: "PASSAGE",
              content: "",
              caption: "",
            },
          ]
        }
        return prev
      })
    } else if (nextType === "MULTIPLE") {
      const areOptionsEmpty = mcqOptions.every((o) => !o.trim())
      if (areOptionsEmpty) {
        setMcqOptions([...MULTIPLE_DEFAULT_OPTIONS])
      }
    } else {
      const isUsingMultipleDefaults =
        mcqOptions.length === MULTIPLE_DEFAULT_OPTIONS.length &&
        mcqOptions.every((o, idx) => o.trim() === MULTIPLE_DEFAULT_OPTIONS[idx])
      if (isUsingMultipleDefaults) {
        setMcqOptions(["", "", "", ""])
      }
    }
  }

  const handleOptionChange = (index: number, val: string) => {
    setMcqOptions((prev) => {
      const copy = [...prev]
      copy[index] = val
      return copy
    })
  }

  const handleAddTextAttachment = () => {
    setAttachments((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        type: "PASSAGE",
        content: "",
        caption: "",
      },
    ])
  }

  const handleAddImageAttachment = () => {
    setAttachments((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        type: "IMAGE",
        url: "",
        caption: "",
      },
    ])
  }

  const handleAddTableAttachment = () => {
    setAttachments((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        type: "TABLE",
        caption: "",
        table: {
          headers: ["কলাম ১", "কলাম ২"],
          rows: [
            ["", ""],
            ["", ""],
          ],
        },
        tableBorder: true,
      },
    ])
  }

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  const handleUpdateAttachment = (id: string, updates: Partial<QuestionAttachmentDraft>) => {
    setAttachments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    )
  }

  const handleAddColumn = (id: string) => {
    setAttachments((prev) =>
      prev.map((a) => {
        if (a.id !== id || !a.table) return a
        const newHeaders = [...a.table.headers, `কলাম ${a.table.headers.length + 1}`]
        const newRows = a.table.rows.map((row) => [...row, ""])
        return { ...a, table: { ...a.table, headers: newHeaders, rows: newRows } }
      })
    )
  }

  const handleRemoveColumn = (id: string, colIndex: number) => {
    setAttachments((prev) =>
      prev.map((a) => {
        if (a.id !== id || !a.table || a.table.headers.length <= 1) return a
        const newHeaders = a.table.headers.filter((_, idx) => idx !== colIndex)
        const newRows = a.table.rows.map((row) => row.filter((_, idx) => idx !== colIndex))
        return { ...a, table: { ...a.table, headers: newHeaders, rows: newRows } }
      })
    )
  }

  const handleAddRow = (id: string) => {
    setAttachments((prev) =>
      prev.map((a) => {
        if (a.id !== id || !a.table) return a
        const emptyRow = Array(a.table.headers.length).fill("")
        return { ...a, table: { ...a.table, rows: [...a.table.rows, emptyRow] } }
      })
    )
  }

  const handleRemoveRow = (id: string) => {
    setAttachments((prev) =>
      prev.map((a) => {
        if (a.id !== id || !a.table || a.table.rows.length <= 1) return a
        return { ...a, table: { ...a.table, rows: a.table.rows.slice(0, -1) } }
      })
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const chapterToUse = (selectedChapterId && selectedChapterId !== "none")
      ? selectedChapterId
      : undefined
    const isMcq = category === "MCQ"
    const isCq = category === "CQ"

    const cleanedAttachments = attachments
      .filter((att) => {
        if (att.type === "PASSAGE") return Boolean(att.content?.trim())
        if (att.type === "IMAGE") return Boolean(att.url?.trim())
        if (att.type === "TABLE") {
          return Boolean(
            att.table &&
              (att.table.headers.some((h) => h.trim()) ||
                att.table.rows.some((r) => r.some((c) => c.trim())))
          )
        }
        return false
      })
      .map((att) => ({
        type: att.type,
        content: att.type === "PASSAGE" ? att.content?.trim() || null : null,
        url: att.type === "IMAGE" ? att.url?.trim() || null : null,
        caption: att.caption?.trim() || null,
        table: att.type === "TABLE" ? att.table : null,
        tableBorder: att.tableBorder ?? true,
      }))

    const passageAtt = cleanedAttachments.find((a) => a.type === "PASSAGE")
    const contextToPass = passageAtt?.content || undefined
    const contextCaptionToPass = passageAtt?.caption || undefined
    const nonPassageAttachments = cleanedAttachments.filter((a) => a.type !== "PASSAGE")

    try {
      let res: any = null

      if (isMcq) {
        const effectiveQuestion =
          mcqQuestion.trim() || (mcqType === "MULTIPLE" ? "নিচের কোনটি সঠিক?" : "")
        if (!effectiveQuestion) {
          toast.error("অনুগ্রহ করে বহুনির্বাচনী প্রশ্নটি লিখুন")
          return
        }

        let cleanedStatements: string[] | undefined = undefined
        if (mcqType === "MULTIPLE") {
          cleanedStatements = mcqStatements.map((s) => s.trim()).filter(Boolean)
          if (cleanedStatements.length < 2) {
            toast.error("বহুপদী প্রশ্নের জন্য কমপক্ষে ২টি বিবৃতি লিখুন")
            return
          }
        }

        const filledOptions = mcqOptions.map((o) => o.trim())
        if (filledOptions.some((o) => !o)) {
          toast.error("ক, খ, গ, ঘ - ৪টি অপশনই পূরণ করুন")
          return
        }
        const correctAnswerText = filledOptions[mcqCorrectIndex] ?? filledOptions[0] ?? ""

        res = await quickCreateMutation.mutateAsync({
          questionPaperId: paperId,
          distributionId,
          sectionId,
          subSectionId,
          subjectId,
          chapterId: chapterToUse,
          category: "MCQ",
          mcqData: {
            type: mcqType,
            context: mcqType === "COMBINED" ? contextToPass : undefined,
            contextCaption: mcqType === "COMBINED" ? contextCaptionToPass : undefined,
            statements: mcqType === "MULTIPLE" ? cleanedStatements : undefined,
            question: effectiveQuestion,
            options: filledOptions,
            answer: correctAnswerText,
            attachments: nonPassageAttachments.length > 0 ? nonPassageAttachments : undefined,
          },
          autoAssign: shouldAutoAssign,
        })
      } else if (isCq) {
        if (!cqQuestionA.trim() || !cqQuestionB.trim()) {
          toast.error("সৃজনশীল প্রশ্নের অন্তত 'ক' এবং 'খ' প্রশ্ন পূরণ করুন")
          return
        }

        res = await quickCreateMutation.mutateAsync({
          questionPaperId: paperId,
          distributionId,
          sectionId,
          subSectionId,
          subjectId,
          chapterId: chapterToUse,
          category: "CQ",
          cqData: {
            context: contextToPass,
            attachments: nonPassageAttachments.length > 0 ? nonPassageAttachments : undefined,
            questionA: cqQuestionA.trim(),
            questionB: cqQuestionB.trim(),
            questionC: cqQuestionC.trim() || undefined,
            questionD: cqQuestionD.trim() || undefined,
          },
          autoAssign: shouldAutoAssign,
        })
      } else {
        if (!textQuestion.trim()) {
          toast.error("অনুগ্রহ করে প্রশ্নটি লিখুন")
          return
        }

        res = await quickCreateMutation.mutateAsync({
          questionPaperId: paperId,
          distributionId,
          sectionId,
          subSectionId,
          subjectId,
          chapterId: chapterToUse,
          category: category as any,
          textData: {
            question: textQuestion.trim(),
            context: contextToPass,
            contextCaption: contextCaptionToPass,
            attachments: nonPassageAttachments.length > 0 ? nonPassageAttachments : undefined,
          },
          autoAssign: shouldAutoAssign,
        })
      }

      toast.success(
        shouldAutoAssign
          ? "নিজস্ব প্রশ্ন সফলভাবে তৈরি ও প্রশ্নপত্রে যুক্ত করা হয়েছে!"
          : "নিজস্ব প্রশ্ন তৈরি হয়েছে এবং তালিকায় নির্বাচন করা হয়েছে!"
      )
      onOpenChange(false)
      onSuccess?.(res?.questionId || "", shouldAutoAssign)
      queryClient.invalidateQueries(trpc.questionPaper.pathFilter())
    } catch (err: any) {
      toast.error(err?.message || "প্রশ্ন তৈরি করা যায়নি")
    }
  }

  const isMcq = category === "MCQ"
  const isCq = category === "CQ"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        style={{ minWidth: "320px", maxWidth: "600px", width: "calc(100vw - 2rem)" }}
        className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-white p-5 sm:p-6 shadow-xl text-left gap-4 font-display max-h-[90vh] flex flex-col"
      >
        {/* Header Icon + Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <PlusCircle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-lg font-bold tracking-tight text-on-surface flex items-center gap-2 flex-wrap">
              <span>নিজস্ব প্রশ্ন তৈরি করুন</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-headline">
                প্রতিষ্ঠান নিজস্ব
              </span>
            </DialogTitle>
            <p className="text-xs text-outline mt-0.5 font-body truncate">
              {className && `${className} • `}
              {subjectName && `${subjectName} • `}
              ধরণ: {category}
            </p>
          </div>
        </div>

        <DialogHeader className="pt-1 font-body shrink-0">
          <DialogDescription className="text-xs leading-relaxed text-on-surface-variant">
            প্রশ্নটি শুধুমাত্র আপনার প্রতিষ্ঠানের প্রশ্নব্যাংকে যুক্ত হবে এবং সরাসরি বর্তমান প্রশ্নপত্রে সিলেক্ট হয়ে যাবে।
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 font-body overflow-y-auto pr-1 flex-1">
          {/* Chapter Selector (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                <span>অধ্যায় / পাঠ</span>
              </span>
              <span className="text-[11px] text-muted-foreground font-normal">ঐচ্ছিক</span>
            </label>
            <Select
              value={selectedChapterId || "none"}
              onValueChange={(val) => setSelectedChapterId(val === "none" ? "" : val)}
            >
              <SelectTrigger className="w-full h-10 rounded-xl bg-white border border-outline-variant/60 text-xs sm:text-sm text-on-surface">
                <SelectValue placeholder="অধ্যায় নির্বাচন করুন (ঐচ্ছিক)" />
              </SelectTrigger>
              <SelectContent className="rounded-xl font-body">
                <SelectItem value="none" className="cursor-pointer text-muted-foreground font-medium">
                  কোনো নির্দিষ্ট অধ্যায় নয় (সাধারণ)
                </SelectItem>
                {chapters.map((ch) => (
                  <SelectItem key={ch.id} value={ch.id} className="cursor-pointer">
                    {ch.nameBn || ch.nameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Form Variant: MCQ */}
          {isMcq && (
            <div className="space-y-4">
              {/* MCQ Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span>বহুনির্বাচনি প্রশ্নের ধরন</span>
                  </span>
                  <span className="text-[10px] text-primary font-bold font-headline">
                    {mcqType === "SINGLE" && "সাধারণ বহুনির্বাচনি"}
                    {mcqType === "MULTIPLE" && "বহুপদী সমাপ্তিসূচক"}
                    {mcqType === "COMBINED" && "অভিন্ন তথ্যভিত্তিক / উদ্দীপকযুক্ত"}
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted/40 rounded-xl border border-outline-variant/60">
                  <button
                    type="button"
                    onClick={() => handleTypeChange("SINGLE")}
                    className={cn(
                      "py-2 px-2 rounded-lg text-xs font-bold font-headline transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer",
                      mcqType === "SINGLE"
                        ? "bg-white text-primary shadow-xs border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                    )}
                  >
                    <span>সাধারণ</span>
                    <span className="text-[10px] opacity-70 font-normal hidden sm:inline">(Single)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange("MULTIPLE")}
                    className={cn(
                      "py-2 px-2 rounded-lg text-xs font-bold font-headline transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer",
                      mcqType === "MULTIPLE"
                        ? "bg-white text-primary shadow-xs border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                    )}
                  >
                    <span>বহুপদী</span>
                    <span className="text-[10px] opacity-70 font-normal hidden sm:inline">(Multiple)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange("COMBINED")}
                    className={cn(
                      "py-2 px-2 rounded-lg text-xs font-bold font-headline transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer",
                      mcqType === "COMBINED"
                        ? "bg-white text-primary shadow-xs border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                    )}
                  >
                    <span>অভিন্ন তথ্যভিত্তিক</span>
                    <span className="text-[10px] opacity-70 font-normal hidden sm:inline">(Combined)</span>
                  </button>
                </div>
              </div>

              {/* 1. If COMBINED: Stimulus (Text, Image, Table) at Top */}
              {mcqType === "COMBINED" && (
                <div className="space-y-2 p-3.5 rounded-xl border border-primary/20 bg-primary/[0.03]">
                  <QuestionAttachmentsEditor
                    label="উদ্দীপক সংযুক্তি (অনুচ্ছেদ পাঠ্য, ছবি বা ছক)"
                    attachments={attachments}
                    onAddText={handleAddTextAttachment}
                    onAddImage={handleAddImageAttachment}
                    onAddTable={handleAddTableAttachment}
                    onRemove={handleRemoveAttachment}
                    onUpdate={handleUpdateAttachment}
                    onAddColumn={handleAddColumn}
                    onRemoveColumn={handleRemoveColumn}
                    onAddRow={handleAddRow}
                    onRemoveRow={handleRemoveRow}
                  />
                  {attachments.length === 0 && (
                    <p className="text-[11px] text-muted-foreground font-body italic py-1">
                      কোনো উদ্দীপক যোগ করা হয়নি। উপরের বোতাম চেপে অনুচ্ছেদ (পাঠ্য), ছবি বা ছক যোগ করতে পারেন (ঐচ্ছিক)।
                    </p>
                  )}
                </div>
              )}

              {/* 2. If MULTIPLE: Statements Editor */}
              {mcqType === "MULTIPLE" && (
                <div className="space-y-2.5 rounded-xl border border-outline-variant/60 bg-muted/20 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface flex items-center gap-1.5 font-headline">
                      <span>বিবৃতিসমূহ (Statements)</span>
                      <span className="text-[10px] text-rose-500 font-normal">*কমপক্ষে ২টি আবশ্যক</span>
                    </span>
                    {mcqStatements.length < 5 && (
                      <button
                        type="button"
                        onClick={() => setMcqStatements((prev) => [...prev, ""])}
                        className="px-2 py-0.5 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary text-[11px] font-bold font-headline flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ বিবৃতি যোগ</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {mcqStatements.map((stmt, sIdx) => {
                      const roman = ROMAN_NUMERALS[sIdx] || `${sIdx + 1}.`
                      return (
                        <div key={sIdx} className="flex items-center gap-2">
                          <span className="size-6 rounded-md bg-primary/10 text-primary font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {roman}.
                          </span>
                          <Input
                            value={stmt}
                            onChange={(e) => {
                              const val = e.target.value
                              setMcqStatements((prev) => {
                                const copy = [...prev]
                                copy[sIdx] = val
                                return copy
                              })
                            }}
                            placeholder={`বিবৃতি ${roman}...`}
                            className="h-8 rounded-lg text-xs bg-white border border-outline-variant/60 flex-1"
                          />
                          {mcqStatements.length > 2 && (
                            <button
                              type="button"
                              onClick={() => setMcqStatements((prev) => prev.filter((_, idx) => idx !== sIdx))}
                              className="text-rose-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="মুছুন"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Question Stem */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                  <span>
                    {mcqType === "COMBINED"
                      ? "উদ্দীপক সংশ্লিষ্ট নির্দিষ্ট প্রশ্ন"
                      : mcqType === "MULTIPLE"
                      ? "মূল প্রশ্ন বা সূচনা (ঐচ্ছিক)"
                      : "প্রশ্ন (Question Stem)"}
                  </span>
                  <span className="text-[11px] text-outline font-normal">
                    {mcqType === "MULTIPLE" ? "যেমন: সালোকসংশ্লেষণ প্রক্রিয়ায় —" : "*বাধ্যতামূলক"}
                  </span>
                </label>
                <Textarea
                  rows={2}
                  value={mcqQuestion}
                  onChange={(e) => setMcqQuestion(e.target.value)}
                  placeholder={
                    mcqType === "COMBINED"
                      ? "উদ্দীপকের আলোকে নির্দিষ্ট প্রশ্নটি লিখুন..."
                      : mcqType === "MULTIPLE"
                      ? "যেমন: পানির বৈশিষ্ট্য হলো — (বা খালি রাখলে স্বয়ংক্রিয় 'নিচের কোনটি সঠিক?' প্রযোজ্য হবে)"
                      : "এখানে বহুনির্বাচনী প্রশ্নটি লিখুন..."
                  }
                  className="rounded-xl border border-outline-variant/60 bg-white text-xs sm:text-sm text-on-surface placeholder:text-outline resize-none focus-visible:ring-primary/20"
                  required={mcqType !== "MULTIPLE"}
                />
              </div>

              {/* Attachments for SINGLE or MULTIPLE */}
              {mcqType !== "COMBINED" && (
                <QuestionAttachmentsEditor
                  label="প্রশ্নে ছবি বা ছক (ঐচ্ছিক)"
                  attachments={attachments}
                  onAddText={handleAddTextAttachment}
                  onAddImage={handleAddImageAttachment}
                  onAddTable={handleAddTableAttachment}
                  onRemove={handleRemoveAttachment}
                  onUpdate={handleUpdateAttachment}
                  onAddColumn={handleAddColumn}
                  onRemoveColumn={handleRemoveColumn}
                  onAddRow={handleAddRow}
                  onRemoveRow={handleRemoveRow}
                />
              )}

              {/* If MULTIPLE: helper hint for options */}
              {mcqType === "MULTIPLE" && (
                <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
                  <span className="text-[11px] font-bold text-primary font-headline">
                    সমাপনী নির্দেশ: নিচের কোনটি সঠিক?
                  </span>
                  <button
                    type="button"
                    onClick={() => setMcqOptions([...MULTIPLE_DEFAULT_OPTIONS])}
                    className="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
                  >
                    প্রমিত অপশন বসান (i ও ii, ...)
                  </button>
                </div>
              )}

              {/* 4 Options */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-on-surface">
                      ৪টি বিকল্প অপশন (বিকল্পসমূহ লিখুন)
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      প্রতিটি অপশনের টেক্সট লিখুন এবং নিচে ড্রপডাউন থেকে সঠিক উত্তর বেছে নিন
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {BENGALI_OPTIONS.map((lbl, idx) => {
                    const isCorrect = mcqCorrectIndex === idx
                    return (
                      <div
                        key={lbl}
                        onClick={() => setMcqCorrectIndex(idx)}
                        className={cn(
                          "relative flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer group",
                          isCorrect
                            ? "border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/25 shadow-xs"
                            : "border-outline-variant/60 bg-white hover:border-emerald-300 hover:bg-emerald-50/20"
                        )}
                      >
                        {/* Radio selection circle & option letter */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div
                            className={cn(
                              "size-4 rounded-full border-2 flex items-center justify-center transition-colors",
                              isCorrect
                                ? "border-emerald-600 bg-white"
                                : "border-outline/60 group-hover:border-emerald-400"
                            )}
                          >
                            {isCorrect && (
                              <div className="size-2 rounded-full bg-emerald-600" />
                            )}
                          </div>
                          <span
                            className={cn(
                              "size-5 rounded-md flex items-center justify-center font-bold text-xs font-headline transition-colors",
                              isCorrect
                                ? "bg-emerald-600 text-white"
                                : "bg-muted text-foreground/80 group-hover:bg-emerald-100/70"
                            )}
                          >
                            {lbl}
                          </span>
                        </div>

                        {/* Input field */}
                        <Input
                          value={mcqOptions[idx]}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          placeholder={
                            mcqType === "MULTIPLE"
                              ? MULTIPLE_DEFAULT_OPTIONS[idx] || `অপশন ${lbl}...`
                              : `অপশন ${lbl}...`
                          }
                          className="h-8 rounded-lg border-none bg-transparent shadow-none text-xs text-on-surface placeholder:text-outline p-0 focus-visible:ring-0 flex-1 min-w-0"
                          required
                        />

                        {/* Right side indicator */}
                        {isCorrect && (
                          <div className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold font-headline shadow-2xs">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>সঠিক</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Dedicated Correct Answer Selection Component (Select Dropdown) */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-headline text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>সঠিক উত্তর নির্বাচন করুন (Select Correct Answer)</span>
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold font-headline">
                      *বাধ্যতামূলক
                    </span>
                  </label>
                  <Select
                    value={String(mcqCorrectIndex)}
                    onValueChange={(val) => setMcqCorrectIndex(Number(val))}
                  >
                    <SelectTrigger className="w-full h-10 rounded-xl bg-white border-2 border-emerald-500/50 text-xs sm:text-sm text-on-surface focus-visible:ring-emerald-500/20 shadow-xs">
                      <SelectValue placeholder="সঠিক উত্তর নির্বাচন করুন..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl font-body">
                      {BENGALI_OPTIONS.map((lbl, idx) => (
                        <SelectItem key={lbl} value={String(idx)} className="cursor-pointer py-2">
                          <div className="flex items-center gap-2">
                            <span className="size-5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center font-headline shrink-0">
                              {lbl}
                            </span>
                            <span className="font-medium text-foreground text-xs sm:text-sm">
                              {mcqOptions[idx]?.trim()
                                ? `(${lbl}) ${mcqOptions[idx].trim()}`
                                : `(${lbl}) [অপশন ${lbl} এখনো ফাঁকা]`}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Form Variant: CQ (Creative Question) */}
          {isCq && (
            <div className="space-y-3.5">
              <div className="space-y-2 p-3.5 rounded-xl border border-primary/20 bg-primary/[0.03]">
                <QuestionAttachmentsEditor
                  label="উদ্দীপক সংযুক্তি (অনুচ্ছেদ পাঠ্য, ছবি বা ছক)"
                  attachments={attachments}
                  onAddText={handleAddTextAttachment}
                  onAddImage={handleAddImageAttachment}
                  onAddTable={handleAddTableAttachment}
                  onRemove={handleRemoveAttachment}
                  onUpdate={handleUpdateAttachment}
                  onAddColumn={handleAddColumn}
                  onRemoveColumn={handleRemoveColumn}
                  onAddRow={handleAddRow}
                  onRemoveRow={handleRemoveRow}
                />
                {attachments.length === 0 && (
                  <p className="text-[11px] text-muted-foreground font-body italic py-1">
                    কোনো উদ্দীপক যোগ করা হয়নি। উপরের বোতাম চেপে অনুচ্ছেদ (পাঠ্য), ছবি বা ছক যোগ করতে পারেন (ঐচ্ছিক)।
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                    <span>(ক) জ্ঞানমূলক প্রশ্ন (মান: ১)</span>
                    <span className="text-[10px] text-outline">*বাধ্যতামূলক</span>
                  </label>
                  <Input
                    value={cqQuestionA}
                    onChange={(e) => setCqQuestionA(e.target.value)}
                    placeholder="ক নম্বর প্রশ্ন..."
                    className="h-9 rounded-xl border border-outline-variant/60 bg-white text-xs text-on-surface"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                    <span>(খ) অনুধাবনমূলক প্রশ্ন (মান: ২)</span>
                    <span className="text-[10px] text-outline">*বাধ্যতামূলক</span>
                  </label>
                  <Input
                    value={cqQuestionB}
                    onChange={(e) => setCqQuestionB(e.target.value)}
                    placeholder="খ নম্বর প্রশ্ন..."
                    className="h-9 rounded-xl border border-outline-variant/60 bg-white text-xs text-on-surface"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface">
                    (গ) প্রয়োগমূলক প্রশ্ন (মান: ৩)
                  </label>
                  <Input
                    value={cqQuestionC}
                    onChange={(e) => setCqQuestionC(e.target.value)}
                    placeholder="গ নম্বর প্রশ্ন (যদি প্রযোজ্য হয়)..."
                    className="h-9 rounded-xl border border-outline-variant/60 bg-white text-xs text-on-surface"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface">
                    (ঘ) উচ্চতর দক্ষতামূলক প্রশ্ন (মান: ৪)
                  </label>
                  <Input
                    value={cqQuestionD}
                    onChange={(e) => setCqQuestionD(e.target.value)}
                    placeholder="ঘ নম্বর প্রশ্ন (যদি প্রযোজ্য হয়)..."
                    className="h-9 rounded-xl border border-outline-variant/60 bg-white text-xs text-on-surface"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Variant: Short Question / Descriptive / General Text */}
          {!isMcq && !isCq && (
            <div className="space-y-3.5">
              {/* Stimulus & Attachments (Optional: Passage Text, Images, Tables) */}
              <div className="space-y-2 p-3.5 rounded-xl border border-primary/20 bg-primary/[0.03]">
                <QuestionAttachmentsEditor
                  label="উদ্দীপক সংযুক্তি (অনুচ্ছেদ পাঠ্য, ছবি বা ছক)"
                  attachments={attachments}
                  onAddText={handleAddTextAttachment}
                  onAddImage={handleAddImageAttachment}
                  onAddTable={handleAddTableAttachment}
                  onRemove={handleRemoveAttachment}
                  onUpdate={handleUpdateAttachment}
                  onAddColumn={handleAddColumn}
                  onRemoveColumn={handleRemoveColumn}
                  onAddRow={handleAddRow}
                  onRemoveRow={handleRemoveRow}
                />
                {attachments.length === 0 && (
                  <p className="text-[11px] text-muted-foreground font-body italic py-1">
                    কোনো উদ্দীপক যোগ করা হয়নি। উপরের বোতাম চেপে অনুচ্ছেদ (পাঠ্য), ছবি বা ছক যোগ করতে পারেন (ঐচ্ছিক)।
                  </p>
                )}
              </div>

              {/* Question Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                  <span>প্রশ্ন (Question Text)</span>
                  <span className="text-[11px] text-outline font-normal">*বাধ্যতামূলক</span>
                </label>
                <Textarea
                  rows={4}
                  value={textQuestion}
                  onChange={(e) => setTextQuestion(e.target.value)}
                  placeholder="এখানে আপনার প্রশ্নটি লিখুন..."
                  className="rounded-xl border border-outline-variant/60 bg-white text-xs sm:text-sm text-on-surface placeholder:text-outline resize-none focus-visible:ring-primary/20"
                  required
                />
              </div>
            </div>
          )}

          {/* Auto-assign Checkbox Option */}
          <label className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-on-surface font-body shrink-0 cursor-pointer select-none hover:bg-primary/10 transition-colors">
            <Checkbox
              id="auto-assign-check"
              checked={shouldAutoAssign}
              onCheckedChange={(checked) => setShouldAutoAssign(Boolean(checked))}
              className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-foreground">সরাসরি প্রশ্নপত্রে যুক্ত করুন</span>
              <span className="text-[11px] text-muted-foreground font-normal leading-relaxed">
                {shouldAutoAssign
                  ? "তৈরি হওয়ার সাথে সাথে প্রশ্নটি বর্তমান প্রশ্নপত্রের স্লটে সরাসরি বসে যাবে।"
                  : "শুধুমাত্র স্কুলের নিজস্ব প্রশ্নব্যাংক ও পিকার তালিকায় যুক্ত থাকবে, পরবর্তীতে পছন্দমতো নির্বাচন করতে পারবেন।"}
              </span>
            </div>
          </label>

          {/* Modal Footer Buttons */}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              disabled={quickCreateMutation.isPending}
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto rounded-lg border border-outline-variant px-5 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer h-10"
            >
              বাতিল
            </Button>
            <Button
              type="submit"
              disabled={quickCreateMutation.isPending}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer h-10 disabled:opacity-50 font-bold text-xs shadow-xs"
            >
              {quickCreateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>যুক্ত হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>{shouldAutoAssign ? "সংরক্ষণ ও প্রশ্নপত্রে যুক্ত করুন" : "প্রশ্নব্যাংকে সংরক্ষণ করুন"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
