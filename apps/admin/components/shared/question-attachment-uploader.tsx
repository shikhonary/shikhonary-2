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
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ExternalLink,
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
        toast.success(`${res.length} টি ছবি সফলভাবে আপলোড হয়েছে!`)
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

  const handleRemove = (indexToRemove: number) => {
    const updated: AttachmentItem[] = attachments
      .filter((_, idx) => idx !== indexToRemove)
      .map((item, idx) => ({
        ...item,
        type: item.type || "image",
        position: idx,
      }))
    onChange(updated)
    toast.info("সংযুক্তি মুছে ফেলা হয়েছে")
  }

  const handleUpdateField = (
    index: number,
    field: "caption" | "bottomContent",
    value: string
  ) => {
    const current = attachments[index]
    if (!current) return
    const updated: AttachmentItem[] = [...attachments]
    updated[index] = {
      ...current,
      type: current.type || "image",
      [field]: value,
    }
    onChange(updated)
  }

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

      {/* Existing Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-4">
          {attachments.map((att, idx) => {
            const hasUrl = Boolean(att.url && att.url.trim() && att.url !== "text-context")
            const isCurrentlyReplacing = isUploading && replacingIndex === idx

            return (
              <div
                key={att.id || `att-${idx}`}
                className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/40 dark:bg-white/[0.01] p-4 sm:p-5 space-y-3.5 transition-all"
              >
                {/* Header with Title and Actions */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center size-5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-[11px] font-bold text-indigo-600 dark:text-primary">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-primary font-headline">
                      সংযুক্ত ছবি #{idx + 1}
                    </span>
                    {!hasUrl && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <AlertTriangle className="size-3" /> ছবি অনুপস্থিত (Missing Image)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Replace / Re-upload Button */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={disabled || isUploading}
                      onClick={() => {
                        setReplacingIndex(idx)
                        replaceInputRef.current?.click()
                      }}
                      className="h-7 px-2 text-xs gap-1 rounded-lg border-slate-200 dark:border-white/[0.08] text-muted-foreground hover:text-foreground"
                    >
                      {isCurrentlyReplacing ? (
                        <>
                          <Loader2 className="size-3 animate-spin" /> আপলোড হচ্ছে...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="size-3" />
                          {hasUrl ? "ছবি পরিবর্তন" : "ছবি যুক্ত করুন"}
                        </>
                      )}
                    </Button>

                    {/* Delete Attachment Button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={disabled || isUploading}
                      onClick={() => handleRemove(idx)}
                      className="size-7 p-0 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="সংযুক্তি মুছে ফেলুন"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

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
                          তথ্যসূত্র থেকে আমদানির সময় ছবির ফাইল খালি ছিল
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
                        className="h-8 text-xs gap-1.5 rounded-xl border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                      >
                        <Upload className="size-3.5" /> এখানে ছবি আপলোড করুন
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

                {/* Top Caption Input */}
                <div className="space-y-1">
                  <Label className="block text-[11px] font-semibold text-muted-foreground">
                    ক্যাপশন (Top Caption)
                  </Label>
                  <Input
                    disabled={disabled || isUploading}
                    placeholder="ছবির শিরোনাম/ক্যাপশন লিখুন..."
                    value={att.caption || ""}
                    onChange={(e) => handleUpdateField(idx, "caption", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5"
                  />
                </div>

                {/* Bottom Caption Content Input */}
                <div className="space-y-1">
                  <Label className="block text-[11px] font-semibold text-muted-foreground">
                    নিচের ক্যাপশন / বিবরণ (Bottom Caption Content)
                  </Label>
                  <Input
                    disabled={disabled || isUploading}
                    placeholder="নিচের বিবরণ বা উৎস লিখুন..."
                    value={att.bottomContent || ""}
                    onChange={(e) => handleUpdateField(idx, "bottomContent", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5"
                  />
                </div>

                {/* Real-time Math Preview */}
                {(att.caption?.trim() || att.bottomContent?.trim()) && (
                  <div className="rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-slate-50/60 dark:bg-white/[0.02] p-3 text-xs space-y-1">
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
              </div>
            )
          })}
        </div>
      )}

      {/* Upload Dropzone / Trigger Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled && !isUploading) {
            fileInputRef.current?.click()
          }
        }}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
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
          <div className="flex flex-col items-center justify-center gap-2.5">
            <div className="size-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-primary flex items-center justify-center shadow-xs">
              <Upload className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                <span className="text-indigo-600 dark:text-primary hover:underline">
                  ছবি আপলোড করতে ক্লিক করুন
                </span>{" "}
                অথবা ড্র্যাগ করে এনে ছেড়ে দিন
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WEBP অথবা SVG (সর্বোচ্চ ৮ মেগাবাইট) • রিসোর্স ID:{" "}
                <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-[11px] font-mono">
                  {resourceId}
                </code>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
