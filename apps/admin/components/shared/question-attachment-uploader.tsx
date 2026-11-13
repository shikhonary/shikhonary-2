"use client"

import * as React from "react"
import { useState, useRef } from "react"
import { useUploadThing } from "@/lib/uploadthing"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Progress } from "@workspace/ui/components/progress"
import { RenderMath } from "@workspace/ui/components/render-math"
import { toast } from "@workspace/ui/components/sonner"
import { normalizeTableData } from "@workspace/ui/components/question-attachments"
import { toBengaliDigits } from "@workspace/utils"
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ExternalLink,
  Table,
  Plus,
  Columns3,
  Rows3,
  X,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Layers,
  FileText,
  Link2,
} from "lucide-react"

export interface AttachmentItem {
  id?: string
  type: string
  url?: string | null
  caption?: string | null
  content?: string | null
  table?: any
  tableBorder?: boolean | null
  bottomContent?: string | null
  position?: number
}

interface QuestionAttachmentUploaderProps {
  resourceId?: string
  resourceType: "MCQ" | "CQ" | "CS" | "GENERAL"
  attachments: AttachmentItem[]
  onChange: (attachments: AttachmentItem[]) => void
  disabled?: boolean
  isMath?: boolean
}

/**
 * Creates a safe, sanitized filename prefixed with resource type and resource ID.
 * Pattern: [resourceType]_[resourceId]_[timestamp]_[safeBaseName].[ext]
 */
function createResourceFileName(
  file: File,
  resourceType: string,
  resourceId: string
): string {
  const parts = file.name.split(".")
  const ext = parts.length > 1 ? parts.pop()!.toLowerCase() : "png"
  const baseName = parts.join(".")
  const sanitizedBase = baseName
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 30)
    .replace(/^_+|_+$/g, "")

  const timestamp = Date.now()
  const cleanBase = sanitizedBase ? `_${sanitizedBase}` : ""
  return `${resourceType.toLowerCase()}_${resourceId}_${timestamp}${cleanBase}.${ext}`
}

export function QuestionAttachmentUploader({
  resourceId: initialResourceId,
  resourceType,
  attachments,
  onChange,
  disabled = false,
  isMath = false,
}: QuestionAttachmentUploaderProps) {
  // Stable temporary ID for create forms before a database ID is assigned
  const [stableId] = useState(() =>
    initialResourceId || `temp_${Math.random().toString(36).substring(2, 10)}`
  )
  const resourceId = initialResourceId || stableId

  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isDragging, setIsDragging] = useState(false)
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null)
  const [collapsedIndices, setCollapsedIndices] = useState<Set<number>>(new Set())

  const fileInputRef = useRef<HTMLInputElement>(null)
  const replaceInputRef = useRef<HTMLInputElement>(null)

  const { startUpload, isUploading } = useUploadThing("questionAttachment", {
    onUploadProgress: (progress) => {
      setUploadProgress(progress)
    },
    onClientUploadComplete: (res) => {
      setUploadProgress(0)
      if (!res || res.length === 0) return

      if (replacingIndex !== null && replacingIndex >= 0 && replacingIndex < attachments.length) {
        // Replacing existing attachment image (e.g. fixing a missing image)
        const updated = [...attachments]
        const first = res[0]
        if (first) {
          const uploadedUrl = first.ufsUrl || first.url
          updated[replacingIndex] = {
            ...updated[replacingIndex],
            url: uploadedUrl,
            type: "image",
          }
          onChange(updated)
          setReplacingIndex(null)
          toast.success("ছবি সফলভাবে হালনাগাদ করা হয়েছে!")
        }
      } else {
        // Appending newly uploaded images
        const newItems: AttachmentItem[] = res.map((fileRes, i) => ({
          type: "image",
          url: fileRes.ufsUrl || fileRes.url,
          caption: "",
          bottomContent: "",
          position: attachments.length + i,
        }))
        onChange([...attachments, ...newItems])
        toast.success(`${toBengaliDigits(res.length)}টি ছবি সফলভাবে সংযোজন করা হয়েছে!`)
      }
    },
    onUploadError: (error: Error) => {
      setUploadProgress(0)
      setReplacingIndex(null)
      toast.error(`আপলোড ব্যর্থ হয়েছে: ${error.message}`)
    },
  })

  // Handle file upload with resource ID prefixed filename
  const handleUploadFiles = async (files: FileList | File[], replaceIdx: number | null = null) => {
    if (disabled || isUploading || files.length === 0) return

    setReplacingIndex(replaceIdx)
    const fileList = Array.from(files)

    // Prepare renamed files
    const renamedFiles = fileList.map((file) => {
      const newName = createResourceFileName(file, resourceType, resourceId)
      return new File([file], newName, { type: file.type })
    })

    try {
      await startUpload(renamedFiles, {
        resourceId,
        resourceType,
      })
    } catch (err: any) {
      toast.error(err?.message || "ছবি আপলোডে সমস্যা হয়েছে")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUploadFiles(e.target.files, null)
      e.target.value = ""
    }
  }

  const handleReplaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && replacingIndex !== null) {
      handleUploadFiles(e.target.files, replacingIndex)
      e.target.value = ""
    }
  }

  // --- Add New Attachment Actions ---
  const handleAddTableAttachment = () => {
    const newTableItem: AttachmentItem = {
      type: "TABLE",
      caption: "",
      content: "",
      url: null,
      table: {
        headers: ["কলাম ১", "কলাম ২"],
        rows: [["", ""]],
      },
      tableBorder: true,
      bottomContent: "",
      position: attachments.length,
    }
    onChange([...attachments, newTableItem])
    toast.success("নতুন ছক (Table) সংযোজন করা হয়েছে")
  }

  const handleAddImageAttachment = () => {
    fileInputRef.current?.click()
  }

  const handleAddBlankImageAttachment = () => {
    const newImageItem: AttachmentItem = {
      type: "image",
      url: "",
      caption: "",
      bottomContent: "",
      position: attachments.length,
    }
    onChange([...attachments, newImageItem])
    toast.success("নতুন ছবি সংযুক্তি যোগ করা হয়েছে। ছবি আপলোড করুন অথবা লিঙ্ক প্রদান করুন।")
  }

  const handleAddTextAttachment = () => {
    const newTextItem: AttachmentItem = {
      type: "text",
      content: "",
      caption: "",
      bottomContent: "",
      url: null,
      position: attachments.length,
    }
    onChange([...attachments, newTextItem])
    toast.success("নতুন পাঠ্য / নোট (Text) সংযুক্তি যোগ করা হয়েছে")
  }

  // --- Multiple Attachments Reorder / Delete Handlers ---
  const handleMoveUp = (index: number) => {
    if (index <= 0) return
    const updated = [...attachments]
    const [movedItem] = updated.splice(index, 1)
    if (!movedItem) return
    updated.splice(index - 1, 0, movedItem)
    const reindexed = updated.map((item, idx) => ({ ...item, position: idx }))
    onChange(reindexed)

    setCollapsedIndices((prev) => {
      const next = new Set<number>()
      for (const idx of prev) {
        if (idx === index) next.add(index - 1)
        else if (idx === index - 1) next.add(index)
        else next.add(idx)
      }
      return next
    })

    toast.success(`সংযুক্তি #${toBengaliDigits(index + 1)} কে উপরে সরানো হয়েছে`)
  }

  const handleMoveDown = (index: number) => {
    if (index >= attachments.length - 1) return
    const updated = [...attachments]
    const [movedItem] = updated.splice(index, 1)
    if (!movedItem) return
    updated.splice(index + 1, 0, movedItem)
    const reindexed = updated.map((item, idx) => ({ ...item, position: idx }))
    onChange(reindexed)

    setCollapsedIndices((prev) => {
      const next = new Set<number>()
      for (const idx of prev) {
        if (idx === index) next.add(index + 1)
        else if (idx === index + 1) next.add(index)
        else next.add(idx)
      }
      return next
    })

    toast.success(`সংযুক্তি #${toBengaliDigits(index + 1)} কে নিচে সরানো হয়েছে`)
  }

  const handleRemove = (indexToRemove: number) => {
    const updated: AttachmentItem[] = attachments
      .filter((_, idx) => idx !== indexToRemove)
      .map((item, idx) => ({
        ...item,
        type: item.type || (item.table ? "TABLE" : "image"),
        position: idx,
      }))
    onChange(updated)

    setCollapsedIndices((prev) => {
      const next = new Set<number>()
      for (const idx of prev) {
        if (idx < indexToRemove) next.add(idx)
        else if (idx > indexToRemove) next.add(idx - 1)
      }
      return next
    })

    toast.info("সংযুক্তি মুছে ফেলা হয়েছে")
  }

  const toggleCollapse = (index: number) => {
    setCollapsedIndices((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const handleCollapseAll = () => {
    setCollapsedIndices(new Set(attachments.map((_, i) => i)))
  }

  const handleExpandAll = () => {
    setCollapsedIndices(new Set())
  }

  const handleUpdateField = (
    index: number,
    field: "caption" | "bottomContent" | "content" | "url",
    value: string
  ) => {
    const current = attachments[index]
    if (!current) return
    const updated: AttachmentItem[] = [...attachments]
    updated[index] = {
      ...current,
      [field]: value,
    }
    onChange(updated)
  }

  // --- Table Attachment Helpers ---
  const getTableData = (att: AttachmentItem): { headers: string[]; rows: string[][] } => {
    const normalized = normalizeTableData(att.table)
    if (normalized && (normalized.headers.length > 0 || normalized.rows.length > 0)) {
      const colCount = Math.max(
        normalized.headers.length,
        ...normalized.rows.map((r) => r.length),
        1
      )
      const headers =
        normalized.headers.length > 0
          ? normalized.headers
          : Array.from({ length: colCount }, (_, i) => `কলাম ${i + 1}`)
      const rows =
        normalized.rows.length > 0
          ? normalized.rows.map((row) => {
              const padded = [...row]
              while (padded.length < headers.length) padded.push("")
              return padded
            })
          : [Array.from({ length: headers.length }, () => "")]
      return { headers, rows }
    }
    return {
      headers: ["কলাম ১", "কলাম ২"],
      rows: [["", ""]],
    }
  }

  const handleUpdateTable = (
    index: number,
    updater: (current: { headers: string[]; rows: string[][] }) => { headers: string[]; rows: string[][] }
  ) => {
    const current = attachments[index]
    if (!current) return
    const currentTable = getTableData(current)
    const newTable = updater(currentTable)

    const updated = [...attachments]
    updated[index] = {
      ...current,
      type: "TABLE",
      table: newTable,
    }
    onChange(updated)
  }

  const handleUpdateHeaderCell = (attIdx: number, colIdx: number, value: string) => {
    handleUpdateTable(attIdx, (table) => {
      const headers = [...table.headers]
      headers[colIdx] = value
      return { ...table, headers }
    })
  }

  const handleUpdateTableCell = (
    attIdx: number,
    rowIdx: number,
    colIdx: number,
    value: string
  ) => {
    handleUpdateTable(attIdx, (table) => {
      const rows = table.rows.map((r, rIndex) => {
        if (rIndex !== rowIdx) return r
        const newRow = [...r]
        newRow[colIdx] = value
        return newRow
      })
      return { ...table, rows }
    })
  }

  const handleAddColumn = (attIdx: number) => {
    handleUpdateTable(attIdx, (table) => {
      const headers = [...table.headers, `কলাম ${table.headers.length + 1}`]
      const rows = table.rows.map((r) => [...r, ""])
      return { headers, rows }
    })
    toast.success("নতুন কলাম যোগ করা হয়েছে")
  }

  const handleRemoveColumn = (attIdx: number, colIdx: number) => {
    handleUpdateTable(attIdx, (table) => {
      if (table.headers.length <= 1) {
        toast.error("কমপক্ষে একটি কলাম থাকা আবশ্যক")
        return table
      }
      const headers = table.headers.filter((_, i) => i !== colIdx)
      const rows = table.rows.map((r) => r.filter((_, i) => i !== colIdx))
      return { headers, rows }
    })
  }

  const handleAddRow = (attIdx: number) => {
    handleUpdateTable(attIdx, (table) => {
      const newRow = Array.from({ length: table.headers.length }, () => "")
      return {
        ...table,
        rows: [...table.rows, newRow],
      }
    })
    toast.success("নতুন সারি যোগ করা হয়েছে")
  }

  const handleRemoveRow = (attIdx: number, rowIdx: number) => {
    handleUpdateTable(attIdx, (table) => {
      if (table.rows.length <= 1) {
        toast.error("কমপক্ষে একটি সারি থাকা আবশ্যক")
        return table
      }
      return {
        ...table,
        rows: table.rows.filter((_, i) => i !== rowIdx),
      }
    })
  }

  const handleToggleBorder = (attIdx: number) => {
    const current = attachments[attIdx]
    if (!current) return
    const updated = [...attachments]
    const currentBorder = current.tableBorder ?? true
    updated[attIdx] = {
      ...current,
      tableBorder: !currentBorder,
    }
    onChange(updated)
  }

  // --- Drag and Drop Handlers ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && !isUploading) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (disabled || isUploading) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const validFiles = Array.from(files).filter((f) => f.type.startsWith("image/"))
      if (validFiles.length > 0) {
        handleUploadFiles(validFiles, null)
      } else {
        toast.error("শুধুমাত্র ছবি ফাইল আপলোড করা যাবে (.png, .jpg, .webp, .svg)")
      }
    }
  }

  const tableCount = attachments.filter(
    (a) => (a.type || "").toUpperCase() === "TABLE" || Boolean(a.table && !a.url)
  ).length
  const imageCount = attachments.filter(
    (a) => (a.type || "").toLowerCase() === "image" || Boolean(a.url && (a.type || "").toUpperCase() !== "TABLE")
  ).length
  const textCount = attachments.length - tableCount - imageCount

  return (
    <div className="space-y-4">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleReplaceChange}
        disabled={disabled || isUploading}
      />

      {/* ============================================================ */}
      {/* 1. PROMINENT "ADD NEW ATTACHMENT" ACTION CARD (Always Visible) */}
      {/* ============================================================ */}
      <div className="rounded-2xl border-2 border-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 sm:p-5 space-y-3.5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-indigo-700 dark:text-primary font-headline flex items-center gap-1.5">
              <Plus className="size-4 stroke-[2.5]" />
              নতুন সংযুক্তি যোগ করুন (Add New Attachment)
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5 font-body">
              প্রশ্নে ছক (Table), ছবি (Image) বা বিবরণী পাঠ্য যোগ করতে নিচের যেকোনো একটি নির্বাচন করুন:
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-background text-foreground border border-slate-200 dark:border-white/[0.08] shadow-2xs font-body">
              <Layers className="size-3.5 text-indigo-600 dark:text-primary" />
              <span>মোট {toBengaliDigits(attachments.length)}টি সংযুক্তি</span>
              {attachments.length > 0 && (
                <span className="text-muted-foreground font-normal">
                  ({tableCount > 0 ? `${toBengaliDigits(tableCount)}টি ছক` : ""}{tableCount > 0 && (imageCount > 0 || textCount > 0) ? ", " : ""}{imageCount > 0 ? `${toBengaliDigits(imageCount)}টি ছবি` : ""}{imageCount > 0 && textCount > 0 ? ", " : ""}{textCount > 0 ? `${toBengaliDigits(textCount)}টি পাঠ্য` : ""})
                </span>
              )}
            </span>

            {attachments.length >= 2 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled || isUploading}
                onClick={collapsedIndices.size > 0 ? handleExpandAll : handleCollapseAll}
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground rounded-xl gap-1"
                title={collapsedIndices.size > 0 ? "সবগুলো খুলুন" : "সবগুলো সংকুচিত করুন"}
              >
                <ChevronsUpDown className="size-3.5" />
                <span>{collapsedIndices.size > 0 ? "সবগুলো খুলুন" : "সবগুলো সংকুচিত"}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Action Buttons Group */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {/* Button 1: Add Table */}
          <button
            type="button"
            disabled={disabled || isUploading}
            onClick={handleAddTableAttachment}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-bold shadow-xs transition-all cursor-pointer font-headline disabled:opacity-50"
          >
            <Table className="size-4 shrink-0" />
            <span>+ নতুন ছক (Table)</span>
          </button>

          {/* Button 2: Upload Image */}
          <button
            type="button"
            disabled={disabled || isUploading}
            onClick={handleAddImageAttachment}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-xs font-bold shadow-xs transition-all cursor-pointer font-headline disabled:opacity-50"
          >
            <Upload className="size-4 shrink-0" />
            <span>+ ছবি আপলোড করুন</span>
          </button>

          {/* Button 3: Add Image via Link / Blank */}
          <button
            type="button"
            disabled={disabled || isUploading}
            onClick={handleAddBlankImageAttachment}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-background hover:bg-slate-100 dark:hover:bg-white/[0.06] text-foreground border border-slate-200 dark:border-white/[0.12] active:scale-[0.99] text-xs font-semibold shadow-2xs transition-all cursor-pointer font-body disabled:opacity-50"
          >
            <Link2 className="size-4 shrink-0 text-muted-foreground" />
            <span>+ ছবি লিঙ্ক (Image Link)</span>
          </button>

          {/* Button 4: Add Text Note */}
          <button
            type="button"
            disabled={disabled || isUploading}
            onClick={handleAddTextAttachment}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-background hover:bg-amber-50 dark:hover:bg-amber-950/20 text-foreground border border-amber-300/80 dark:border-amber-800/40 active:scale-[0.99] text-xs font-semibold shadow-2xs transition-all cursor-pointer font-body disabled:opacity-50"
          >
            <FileText className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>+ পাঠ্য / নোট (Text Note)</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. EXISTING ATTACHMENTS LIST                                 */}
      {/* ============================================================ */}
      {attachments.length > 0 ? (
        <div className="space-y-4">
          {attachments.map((att, idx) => {
            const type = (att.type || "").toUpperCase()
            const isTable = type === "TABLE" || Boolean(att.table && !att.url)
            const isText = type === "TEXT" || type === "PASSAGE" || Boolean(att.content && !att.url && !att.table)
            const hasUrl = Boolean(att.url && att.url.trim() && att.url !== "text-context")
            const isCurrentlyReplacing = isUploading && replacingIndex === idx
            const isCollapsed = collapsedIndices.has(idx)
            const isFirst = idx === 0
            const isLast = idx === attachments.length - 1

            // ------------------------------------------------------------
            // CASE A: TABLE ATTACHMENT VIEW & EDITOR
            // ------------------------------------------------------------
            if (isTable) {
              const tableData = getTableData(att)
              const hasBorder = att.tableBorder ?? true

              return (
                <div
                  key={att.id || `att-table-${idx}`}
                  className="rounded-2xl border-2 border-emerald-300/80 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/15 p-4 sm:p-5 space-y-4 transition-all shadow-xs"
                >
                  {/* Table Card Header Bar */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200/70 dark:border-emerald-800/40">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Order Controls (Move Up / Down) */}
                      <div className="flex items-center gap-0.5 bg-background/90 dark:bg-emerald-950/70 rounded-lg p-0.5 border border-emerald-300/70 dark:border-emerald-800/50 shadow-2xs">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={disabled || isUploading || isFirst}
                          onClick={() => handleMoveUp(idx)}
                          className="size-6 p-0 rounded-md text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 disabled:opacity-30 cursor-pointer"
                          title="এই ছকটি ১ ধাপ উপরে সরান"
                        >
                          <ArrowUp className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={disabled || isUploading || isLast}
                          onClick={() => handleMoveDown(idx)}
                          className="size-6 p-0 rounded-md text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 disabled:opacity-30 cursor-pointer"
                          title="এই ছকটি ১ ধাপ নিচে সরান"
                        >
                          <ArrowDown className="size-3.5" />
                        </Button>
                      </div>

                      <span className="flex items-center justify-center size-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        <Table className="size-3.5" />
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 font-headline">
                        সংযুক্তি #{toBengaliDigits(idx + 1)} (ছক / Table)
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100/90 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 font-body">
                        {toBengaliDigits(tableData.headers.length)} কলাম × {toBengaliDigits(tableData.rows.length)} সারি
                      </span>
                      {att.caption?.trim() && isCollapsed && (
                        <span className="text-xs text-muted-foreground truncate max-w-[220px] font-body italic">
                          — {att.caption.trim()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center flex-wrap gap-1.5 self-end sm:self-auto">
                      {!isCollapsed && (
                        <>
                          {/* Border Toggle Button */}
                          <button
                            type="button"
                            disabled={disabled || isUploading}
                            onClick={() => handleToggleBorder(idx)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer select-none ${
                              hasBorder
                                ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700"
                                : "bg-background text-muted-foreground border-slate-200 dark:border-white/[0.08] hover:bg-muted"
                            }`}
                            title="ছক বর্ডার দৃশ্যমানতা পরিবর্তন করুন"
                          >
                            <span>বর্ডার: {hasBorder ? "অন" : "অফ"}</span>
                          </button>

                          {/* Add Column Button */}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={disabled || isUploading}
                            onClick={() => handleAddColumn(idx)}
                            className="h-7 px-2.5 text-xs gap-1 rounded-lg border-emerald-300 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                          >
                            <Columns3 className="size-3" />
                            <span>কলাম যোগ</span>
                          </Button>

                          {/* Add Row Button */}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={disabled || isUploading}
                            onClick={() => handleAddRow(idx)}
                            className="h-7 px-2.5 text-xs gap-1 rounded-lg border-emerald-300 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                          >
                            <Rows3 className="size-3" />
                            <span>সারি যোগ</span>
                          </Button>
                        </>
                      )}

                      {/* Collapse / Expand Toggle Button */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={disabled || isUploading}
                        onClick={() => toggleCollapse(idx)}
                        className="size-7 p-0 text-muted-foreground hover:text-foreground rounded-lg"
                        title={isCollapsed ? "ছক বিস্তারিত খুলুন" : "সংকুচিত করুন"}
                      >
                        {isCollapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
                      </Button>

                      {/* Delete Table Button */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={disabled || isUploading}
                        onClick={() => handleRemove(idx)}
                        className="size-7 p-0 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        title="এই ছকটি মুছে ফেলুন"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Card Content (Hidden when collapsed) */}
                  {!isCollapsed && (
                    <>
                      {/* Top Caption Input */}
                      <div className="space-y-1">
                        <Label className="block text-[11px] font-semibold text-muted-foreground font-body">
                          ছকের শীর্ষ ক্যাপশন / শিরোনাম (Top Caption - ঐচ্ছিক)
                        </Label>
                        <Input
                          disabled={disabled || isUploading}
                          placeholder="যেমন: ছক-১: বিভিন্ন শ্রেণির খাদ্য তালিকা (A, B, C)..."
                          value={att.caption || ""}
                          onChange={(e) => handleUpdateField(idx, "caption", e.target.value)}
                          className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5 font-body"
                        />
                      </div>

                      {/* Interactive Table Grid Editor */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="block text-[11px] font-semibold text-muted-foreground font-body">
                            ছকের উপাদান ও সেল সম্পাদন (Table Structure & Cells)
                          </Label>
                          <span className="text-[10px] text-muted-foreground font-body">
                            প্রতিটি সেলে সাধারণ বাংলা লেখা বা KaTeX সমীকরণ (যেমন: $x^2$) ব্যবহার করা যাবে
                          </span>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-card p-2 shadow-xs">
                          <table className="w-full border-collapse text-xs font-body">
                            {/* Headers Editor Row */}
                            <thead>
                              <tr className="border-b border-slate-200 dark:border-white/[0.08] bg-slate-50/80 dark:bg-white/[0.02]">
                                <th className="w-10 px-2 py-2 text-center text-muted-foreground font-mono text-[11px]">
                                  #
                                </th>
                                {tableData.headers.map((h, colIdx) => (
                                  <th key={colIdx} className="p-1 min-w-[150px]">
                                    <div className="flex items-center gap-1">
                                      <Input
                                        disabled={disabled || isUploading}
                                        placeholder={`হেডার ${colIdx + 1}`}
                                        value={h}
                                        onChange={(e) =>
                                          handleUpdateHeaderCell(idx, colIdx, e.target.value)
                                        }
                                        className="h-8 text-xs font-bold font-headline bg-background/90 rounded-lg border-slate-200 dark:border-white/[0.08] px-2 text-foreground"
                                      />
                                      {tableData.headers.length > 1 && (
                                        <button
                                          type="button"
                                          disabled={disabled || isUploading}
                                          onClick={() => handleRemoveColumn(idx, colIdx)}
                                          className="size-6 shrink-0 flex items-center justify-center rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                          title="এই কলামটি মুছুন"
                                        >
                                          <X className="size-3" />
                                        </button>
                                      )}
                                    </div>
                                  </th>
                                ))}
                                <th className="w-8"></th>
                              </tr>
                            </thead>

                            {/* Body Cells Editor Rows */}
                            <tbody>
                              {tableData.rows.map((row, rowIdx) => (
                                <tr
                                  key={rowIdx}
                                  className="border-b border-slate-100 dark:border-white/[0.04] last:border-0 hover:bg-slate-50/40 dark:hover:bg-white/[0.01]"
                                >
                                  <td className="px-2 py-1 text-center font-mono text-muted-foreground text-[11px]">
                                    {rowIdx + 1}
                                  </td>
                                  {row.map((cell, colIdx) => (
                                    <td key={colIdx} className="p-1">
                                      <Input
                                        disabled={disabled || isUploading}
                                        placeholder={`সারি ${rowIdx + 1}, কলাম ${colIdx + 1}`}
                                        value={cell}
                                        onChange={(e) =>
                                          handleUpdateTableCell(idx, rowIdx, colIdx, e.target.value)
                                        }
                                        className="h-8 text-xs bg-background/60 rounded-lg border-slate-200 dark:border-white/[0.08] px-2 text-foreground"
                                      />
                                    </td>
                                  ))}
                                  <td className="p-1 text-center">
                                    {tableData.rows.length > 1 && (
                                      <button
                                        type="button"
                                        disabled={disabled || isUploading}
                                        onClick={() => handleRemoveRow(idx, rowIdx)}
                                        className="size-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                        title="এই সারিটি মুছুন"
                                      >
                                        <X className="size-3" />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Bottom Content / Notes Input */}
                      <div className="space-y-1">
                        <Label className="block text-[11px] font-semibold text-muted-foreground font-body">
                          ছকের নিচের পাদটীকা / বিবরণ (Bottom Content / Notes - ঐচ্ছিক)
                        </Label>
                        <Input
                          disabled={disabled || isUploading}
                          placeholder="যেমন: — উৎস: জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড..."
                          value={att.bottomContent || ""}
                          onChange={(e) => handleUpdateField(idx, "bottomContent", e.target.value)}
                          className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5 font-body"
                        />
                      </div>

                      {/* Real-time Math & Table Preview */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block font-headline">
                          ছকের লাইভ প্রিভিউ (Live Preview):
                        </span>
                        <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/[0.02] p-3.5 space-y-2">
                          {att.caption?.trim() && (
                            <div className="font-bold text-xs text-foreground font-headline">
                              <RenderMath text={att.caption.trim()} isMath={isMath} />
                            </div>
                          )}

                          <div className="overflow-x-auto w-full p-px">
                            <table
                              className={`w-full text-left border-collapse text-xs font-body ${
                                hasBorder
                                  ? "border border-slate-300 dark:border-white/20"
                                  : "border-b border-slate-300 dark:border-white/20"
                              }`}
                            >
                              {tableData.headers.some((h) => h.trim()) && (
                                <thead className="bg-slate-100 dark:bg-white/[0.06] font-bold text-foreground">
                                  <tr>
                                    {tableData.headers.map((header, hIdx) => (
                                      <th
                                        key={hIdx}
                                        className={`px-3 py-1.5 leading-tight ${
                                          hasBorder
                                            ? "border border-slate-300 dark:border-white/20"
                                            : "border-b border-slate-300 dark:border-white/20"
                                        }`}
                                      >
                                        <RenderMath text={header} isMath={isMath} />
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                              )}
                              <tbody>
                                {tableData.rows.map((row, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-slate-100/50 dark:hover:bg-white/[0.02]">
                                    {row.map((cell, cIdx) => (
                                      <td
                                        key={cIdx}
                                        className={`px-3 py-1.5 leading-tight text-foreground ${
                                          hasBorder
                                            ? "border border-slate-300 dark:border-white/20"
                                            : "border-b border-slate-200 dark:border-white/10"
                                        }`}
                                      >
                                        <RenderMath text={cell} isMath={isMath} />
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {att.bottomContent?.trim() && (
                            <div className="text-muted-foreground text-[11px] italic pt-1 font-body">
                              <RenderMath text={att.bottomContent.trim()} isMath={isMath} />
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )
            }

            // ------------------------------------------------------------
            // CASE B: TEXT / NOTE ATTACHMENT VIEW & EDITOR
            // ------------------------------------------------------------
            if (isText) {
              return (
                <div
                  key={att.id || `att-text-${idx}`}
                  className="rounded-2xl border-2 border-amber-300/80 dark:border-amber-800/60 bg-amber-50/20 dark:bg-amber-950/15 p-4 sm:p-5 space-y-3.5 transition-all shadow-xs"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-amber-200/70 dark:border-amber-800/40">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-0.5 bg-background/90 dark:bg-amber-950/70 rounded-lg p-0.5 border border-amber-300/70 dark:border-amber-800/50 shadow-2xs">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={disabled || isUploading || isFirst}
                          onClick={() => handleMoveUp(idx)}
                          className="size-6 p-0 rounded-md text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 disabled:opacity-30 cursor-pointer"
                          title="এই পাঠ্য সংযুক্তিটি উপরে সরান"
                        >
                          <ArrowUp className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={disabled || isUploading || isLast}
                          onClick={() => handleMoveDown(idx)}
                          className="size-6 p-0 rounded-md text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 disabled:opacity-30 cursor-pointer"
                          title="এই পাঠ্য সংযুক্তিটি নিচে সরান"
                        >
                          <ArrowDown className="size-3.5" />
                        </Button>
                      </div>

                      <span className="flex items-center justify-center size-6 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-xs font-bold text-amber-700 dark:text-amber-300">
                        <FileText className="size-3.5" />
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 font-headline">
                        সংযুক্তি #{toBengaliDigits(idx + 1)} (পাঠ্য / Text Note)
                      </span>
                      {att.caption?.trim() && isCollapsed && (
                        <span className="text-xs text-muted-foreground truncate max-w-[220px] font-body italic">
                          — {att.caption.trim()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={disabled || isUploading}
                        onClick={() => toggleCollapse(idx)}
                        className="size-7 p-0 text-muted-foreground hover:text-foreground rounded-lg"
                        title={isCollapsed ? "বিস্তারিত খুলুন" : "সংকুচিত করুন"}
                      >
                        {isCollapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={disabled || isUploading}
                        onClick={() => handleRemove(idx)}
                        className="size-7 p-0 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        title="এই সংযুক্তিটি মুছে ফেলুন"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  {!isCollapsed && (
                    <>
                      {/* Top Caption */}
                      <div className="space-y-1">
                        <Label className="block text-[11px] font-semibold text-muted-foreground font-body">
                          পাঠ্যের শিরোনাম / ক্যাপশন (Top Caption - ঐচ্ছিক)
                        </Label>
                        <Input
                          disabled={disabled || isUploading}
                          placeholder="যেমন: অনুচ্ছেদ-১, বিশেষ দ্রষ্টব্য..."
                          value={att.caption || ""}
                          onChange={(e) => handleUpdateField(idx, "caption", e.target.value)}
                          className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm h-10 px-3.5 font-body"
                        />
                      </div>

                      {/* Content Area */}
                      <div className="space-y-1">
                        <Label className="block text-[11px] font-semibold text-muted-foreground font-body">
                          পাঠ্য বিবরণ / অনুচ্ছেদ (Text Content)
                        </Label>
                        <textarea
                          disabled={disabled || isUploading}
                          rows={3}
                          placeholder="এখানে বিস্তারিত বিবরণ বা অনুচ্ছেদ লিখুন..."
                          value={att.content || ""}
                          onChange={(e) => handleUpdateField(idx, "content", e.target.value)}
                          className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm p-3 font-body focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20"
                        />
                      </div>

                      {/* Bottom Content */}
                      <div className="space-y-1">
                        <Label className="block text-[11px] font-semibold text-muted-foreground font-body">
                          নিচের পাদটীকা / বিবরণ (Bottom Content - ঐচ্ছিক)
                        </Label>
                        <Input
                          disabled={disabled || isUploading}
                          placeholder="যেমন: — উৎস..."
                          value={att.bottomContent || ""}
                          onChange={(e) => handleUpdateField(idx, "bottomContent", e.target.value)}
                          className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm h-10 px-3.5 font-body"
                        />
                      </div>

                      {/* Math Preview */}
                      {(att.caption?.trim() || att.content?.trim() || att.bottomContent?.trim()) && (
                        <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/[0.02] p-3 text-xs space-y-1 font-body">
                          {att.caption?.trim() && (
                            <div className="font-bold text-foreground">
                              <RenderMath text={att.caption.trim()} isMath={isMath} />
                            </div>
                          )}
                          {att.content?.trim() && (
                            <div className="text-foreground whitespace-pre-wrap">
                              <RenderMath text={att.content.trim()} isMath={isMath} />
                            </div>
                          )}
                          {att.bottomContent?.trim() && (
                            <div className="text-muted-foreground italic pt-1 border-t border-slate-200/40">
                              <RenderMath text={att.bottomContent.trim()} isMath={isMath} />
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            }

            // ------------------------------------------------------------
            // CASE C: IMAGE ATTACHMENT VIEW & EDITOR
            // ------------------------------------------------------------
            return (
              <div
                key={att.id || `att-img-${idx}`}
                className="rounded-2xl border-2 border-indigo-300/80 dark:border-indigo-800/60 bg-slate-50/40 dark:bg-white/[0.01] p-4 sm:p-5 space-y-3.5 transition-all shadow-xs"
              >
                {/* Header with Title, Reordering and Actions */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/[0.06]">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Order Controls (Move Up / Down) */}
                    <div className="flex items-center gap-0.5 bg-background/90 dark:bg-indigo-950/70 rounded-lg p-0.5 border border-indigo-300/70 dark:border-indigo-800/50 shadow-2xs">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={disabled || isUploading || isFirst}
                        onClick={() => handleMoveUp(idx)}
                        className="size-6 p-0 rounded-md text-indigo-700 dark:text-primary hover:bg-indigo-100 dark:hover:bg-indigo-900/40 disabled:opacity-30 cursor-pointer"
                        title="এই ছবিটি ১ ধাপ উপরে সরান"
                      >
                        <ArrowUp className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={disabled || isUploading || isLast}
                        onClick={() => handleMoveDown(idx)}
                        className="size-6 p-0 rounded-md text-indigo-700 dark:text-primary hover:bg-indigo-100 dark:hover:bg-indigo-900/40 disabled:opacity-30 cursor-pointer"
                        title="এই ছবিটি ১ ধাপ নিচে সরান"
                      >
                        <ArrowDown className="size-3.5" />
                      </Button>
                    </div>

                    <span className="flex items-center justify-center size-5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-[11px] font-bold text-indigo-600 dark:text-primary">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-primary font-headline">
                      সংযুক্তি #{toBengaliDigits(idx + 1)} (ছবি / Image)
                    </span>
                    {!hasUrl && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <AlertTriangle className="size-3" /> ছবি অনুপস্থিত (Missing Image)
                      </span>
                    )}
                    {att.caption?.trim() && isCollapsed && (
                      <span className="text-xs text-muted-foreground truncate max-w-[220px] font-body italic">
                        — {att.caption.trim()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!isCollapsed && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={disabled || isUploading}
                        onClick={() => {
                          setReplacingIndex(idx)
                          replaceInputRef.current?.click()
                        }}
                        className="h-7 px-2 text-xs gap-1 rounded-lg border-slate-200 dark:border-white/[0.08] text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {isCurrentlyReplacing ? (
                          <>
                            <Loader2 className="size-3 animate-spin" /> আপলোড হচ্ছে...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="size-3" />
                            {hasUrl ? "ছবি পরিবর্তন" : "ছবি আপলোড"}
                          </>
                        )}
                      </Button>
                    )}

                    {/* Collapse / Expand Toggle Button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={disabled || isUploading}
                      onClick={() => toggleCollapse(idx)}
                      className="size-7 p-0 text-muted-foreground hover:text-foreground rounded-lg"
                      title={isCollapsed ? "ছবি বিস্তারিত খুলুন" : "সংকুচিত করুন"}
                    >
                      {isCollapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
                    </Button>

                    {/* Delete Attachment Button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={disabled || isUploading}
                      onClick={() => handleRemove(idx)}
                      className="size-7 p-0 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="সংযুক্তি মুছে ফেলুন"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Card Content (Hidden when collapsed) */}
                {!isCollapsed && (
                  <>
                    {/* Image Preview or Placeholder */}
                    <div className="relative rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-black/30 p-2.5 flex flex-col items-center justify-center min-h-[140px] overflow-hidden">
                      {hasUrl ? (
                        <div className="relative group max-w-full">
                          <img
                            src={att.url!}
                            alt={att.caption || `সংযুক্তি #${idx + 1}`}
                            className="max-h-56 max-w-full rounded-lg object-contain"
                          />
                          <a
                            href={att.url!}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 hover:bg-black/90 text-white rounded-lg p-1.5 text-xs flex items-center gap-1 backdrop-blur-sm"
                            title="মূল ছবি দেখুন"
                          >
                            <ExternalLink className="size-3" />
                            <span>মূল ফাইল</span>
                          </a>
                        </div>
                      ) : (
                        <div className="text-center py-4 space-y-2">
                          <div className="size-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                            <ImageIcon className="size-5" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-foreground">
                              কোনো ছবি ফাইল যুক্ত করা হয়নি
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              কম্পিউটার থেকে ছবি আপলোড করুন অথবা সরাসরি ওয়েব লিঙ্ক দিন
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={disabled || isUploading}
                            onClick={() => {
                              setReplacingIndex(idx)
                              replaceInputRef.current?.click()
                            }}
                            className="h-8 text-xs gap-1.5 rounded-xl border-indigo-500/30 text-indigo-600 dark:text-primary hover:bg-indigo-500/10 cursor-pointer"
                          >
                            <Upload className="size-3.5" /> ফাইল থেকে ছবি আপলোড করুন
                          </Button>
                        </div>
                      )}

                      {/* Progress overlay if replacing this image */}
                      {isCurrentlyReplacing && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 p-4">
                          <Loader2 className="size-6 animate-spin text-indigo-600 dark:text-primary" />
                          <p className="text-xs font-medium text-foreground">
                            আপলোড হচ্ছে... {uploadProgress}%
                          </p>
                          <Progress value={uploadProgress} className="w-48 h-2" />
                        </div>
                      )}
                    </div>

                    {/* Direct Image URL input (allows pasting a link or editing URL) */}
                    <div className="space-y-1">
                      <Label className="block text-[11px] font-semibold text-muted-foreground font-body">
                        ছবির সরাসরি ওয়েব লিঙ্ক (Image URL - ঐচ্ছিক)
                      </Label>
                      <Input
                        disabled={disabled || isUploading}
                        placeholder="https://..."
                        value={att.url || ""}
                        onChange={(e) => handleUpdateField(idx, "url", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-xs h-9 px-3.5 font-mono"
                      />
                    </div>

                    {/* Top Caption Input */}
                    <div className="space-y-1">
                      <Label className="block text-[11px] font-semibold text-muted-foreground font-body">
                        ছবির ক্যাপশন (Top Caption - ঐচ্ছিক)
                      </Label>
                      <Input
                        disabled={disabled || isUploading}
                        placeholder="ছবির শিরোনাম/ক্যাপশন লিখুন..."
                        value={att.caption || ""}
                        onChange={(e) => handleUpdateField(idx, "caption", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5 font-body"
                      />
                    </div>

                    {/* Bottom Caption Content Input */}
                    <div className="space-y-1">
                      <Label className="block text-[11px] font-semibold text-muted-foreground font-body">
                        নিচের বিবরণ বা উৎস (Bottom Caption Content - ঐচ্ছিক)
                      </Label>
                      <Input
                        disabled={disabled || isUploading}
                        placeholder="নিচের বিবরণ বা উৎস লিখুন..."
                        value={att.bottomContent || ""}
                        onChange={(e) => handleUpdateField(idx, "bottomContent", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5 font-body"
                      />
                    </div>

                    {/* Real-time Math Preview */}
                    {(att.caption?.trim() || att.bottomContent?.trim()) && (
                      <div className="rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-slate-50/60 dark:bg-white/[0.02] p-3 text-xs space-y-1 font-body">
                        {att.caption?.trim() && (
                          <div className="font-semibold text-foreground">
                            <RenderMath text={att.caption.trim()} isMath={isMath} />
                          </div>
                        )}
                        {att.bottomContent?.trim() && (
                          <div className="text-muted-foreground italic">
                            <RenderMath text={att.bottomContent.trim()} isMath={isMath} />
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}

          {/* Bottom Quick-Add Actions Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-dashed border-slate-300 dark:border-white/[0.12] bg-slate-50/40 dark:bg-white/[0.01]">
            <span className="text-xs text-muted-foreground font-body">
              আরও সংযুক্তি যোগ করতে চান?
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || isUploading}
                onClick={handleAddTableAttachment}
                className="h-8 px-3 rounded-xl border-emerald-300 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-xs font-bold gap-1.5 cursor-pointer font-headline"
              >
                <Table className="size-3.5" />
                <span>+ আরেকটি ছক (Table)</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || isUploading}
                onClick={handleAddImageAttachment}
                className="h-8 px-3 rounded-xl border-indigo-300 text-indigo-700 dark:text-primary hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-xs font-bold gap-1.5 cursor-pointer font-headline"
              >
                <Upload className="size-3.5" />
                <span>+ আরেকটি ছবি আপলোড</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || isUploading}
                onClick={handleAddTextAttachment}
                className="h-8 px-3 rounded-xl border-amber-300 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-xs font-bold gap-1.5 cursor-pointer font-headline"
              >
                <FileText className="size-3.5" />
                <span>+ আরেকটি পাঠ্য (Text)</span>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/[0.12] p-6 sm:p-8 text-center space-y-3">
          <div className="size-12 rounded-2xl bg-slate-100 dark:bg-white/[0.04] text-muted-foreground flex items-center justify-center mx-auto">
            <Layers className="size-6 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground font-headline">
              এখনও কোনো সংযুক্তি যোগ করা হয়নি
            </p>
            <p className="text-xs text-muted-foreground font-body">
              উপরে দেওয়া বোতামগুলো ব্যবহার করে অথবা নিচে ফাইল ড্রপ করে নতুন ছক বা ছবি সংযোজন করুন
            </p>
          </div>
        </div>
      )}

      {/* Upload Dropzone / Drag-and-Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled && !isUploading) {
            fileInputRef.current?.click()
          }
        }}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-7 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 scale-[0.99]"
            : "border-slate-200/90 dark:border-white/[0.12] hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-slate-50/50 dark:hover:bg-white/[0.02]"
        } ${disabled || isUploading ? "pointer-events-none opacity-60" : ""}`}
      >
        {isUploading && replacingIndex === null ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="size-8 animate-spin text-indigo-600 dark:text-primary" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                ছবি আপলোড হচ্ছে... ({uploadProgress}%)
              </p>
              <p className="text-xs text-muted-foreground">
                অনুগ্রহ করে ফাইল সম্পূর্ণ আপলোড হওয়া পর্যন্ত অপেক্ষা করুন
              </p>
            </div>
            <Progress value={uploadProgress} className="w-56 h-2" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="size-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-primary flex items-center justify-center shadow-xs">
              <Upload className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground font-headline">
                <span className="text-indigo-600 dark:text-primary hover:underline">
                  সরাসরি ছবি ফাইল আপলোড করতে ক্লিক করুন
                </span>{" "}
                অথবা ড্র্যাগ করে এনে ছেড়ে দিন
              </p>
              <p className="text-xs text-muted-foreground font-body">
                এক বা একাধিক PNG, JPG, WEBP অথবা SVG (সর্বোচ্চ ৮ মেগাবাইট)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
