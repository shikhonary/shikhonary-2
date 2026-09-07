"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { RenderMath } from "@workspace/ui/components/render-math"

export interface QuestionAttachmentTableData {
  headers?: (string | number)[]
  rows?: (string | number)[][]
  columns?: { label: string; align?: "left" | "center" | "right" }[]
  [key: string]: any
}

export interface QuestionAttachmentItemData {
  id?: string
  type?: string | null
  caption?: string | null
  content?: string | null
  url?: string | null
  table?: QuestionAttachmentTableData | any
  bottomContent?: string | null
  tableBorder?: boolean | null
  position?: number | null
}

export interface QuestionAttachmentsProps {
  attachments?: QuestionAttachmentItemData[] | null
  isMath?: boolean
  className?: string
  imageClassName?: string
  compact?: boolean
}

/**
 * Normalizes table data from JSON or object into a standard { headers, rows } structure.
 */
function normalizeTableData(rawTable: any): {
  headers: string[]
  rows: string[][]
} | null {
  if (!rawTable) return null

  let parsed = rawTable
  if (typeof rawTable === "string") {
    try {
      parsed = JSON.parse(rawTable)
    } catch {
      return null
    }
  }

  if (!parsed || typeof parsed !== "object") return null

  // Format 1: { headers: [...], rows: [[...]] }
  if (Array.isArray(parsed.rows)) {
    const headers = Array.isArray(parsed.headers)
      ? parsed.headers.map((h: any) => String(h ?? ""))
      : []
    const rows = parsed.rows.map((row: any) =>
      Array.isArray(row) ? row.map((cell: any) => String(cell ?? "")) : [String(row ?? "")]
    )
    return { headers, rows }
  }

  // Format 2: Array of arrays [ [...headers], [...row1] ] or just rows
  if (Array.isArray(parsed)) {
    if (parsed.length === 0) return null

    if (Array.isArray(parsed[0])) {
      // 2D Array
      return {
        headers: parsed[0].map((h: any) => String(h ?? "")),
        rows: parsed.slice(1).map((r: any) =>
          Array.isArray(r) ? r.map((c: any) => String(c ?? "")) : [String(r ?? "")]
        ),
      }
    }

    if (typeof parsed[0] === "object" && parsed[0] !== null) {
      // Array of objects [{ colA: 1, colB: 2 }]
      const headers = Object.keys(parsed[0])
      const rows = parsed.map((obj: any) =>
        headers.map((k) => String(obj?.[k] ?? ""))
      )
      return { headers, rows }
    }
  }

  return null
}

export function QuestionAttachmentItem({
  attachment,
  isMath = false,
  className,
  imageClassName,
  compact = false,
}: {
  attachment: QuestionAttachmentItemData
  isMath?: boolean
  className?: string
  imageClassName?: string
  compact?: boolean
}) {
  const type = (attachment.type || "").toLowerCase()
  const isImage =
    type === "image" ||
    (attachment.url &&
      attachment.url !== "text-context" &&
      /\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i.test(attachment.url))

  const isTable = type === "table" || (Boolean(attachment.table) && !isImage)
  const isText = type === "text" || type === "context" || (!isImage && !isTable)

  const tableData = isTable && attachment.table ? normalizeTableData(attachment.table) : null
  const hasBorder = attachment.tableBorder ?? true

  const hasAnyContent = Boolean(
    attachment.caption ||
    attachment.content ||
    (isImage && attachment.url) ||
    (isTable && tableData) ||
    attachment.bottomContent
  )

  if (!hasAnyContent) return null

  return (
    <div
      className={cn(
        "space-y-0.5 w-full max-w-full",
        className
      )}
    >
      {/* 1. Attachment Caption (Top) */}
      {attachment.caption && (
        <div
          className={cn(
            "font-semibold text-xs text-foreground leading-tight mb-0.5"
          )}
        >
          <RenderMath text={attachment.caption.trim()} isMath={isMath} />
        </div>
      )}

      {/* 2. Attachment Content */}
      {attachment.content && (
        <div className="text-xs text-foreground whitespace-pre-wrap leading-snug">
          <RenderMath text={attachment.content.trim()} isMath={isMath} />
        </div>
      )}

      {/* 3. Image (if present) */}
      {isImage && attachment.url && attachment.url !== "text-context" && (
        <div className="relative group/att-img inline-block my-0">
          <img
            src={attachment.url}
            alt={attachment.caption || "Question Attachment"}
            className={cn(
              "rounded-md border border-foreground/40 object-contain bg-muted/20 block",
              compact ? "max-h-16" : "max-h-24",
              imageClassName
            )}
          />
        </div>
      )}

      {/* 4. Table (if present) */}
      {isTable && tableData && tableData.rows.length > 0 && (
        <div className="overflow-x-auto w-full my-0.5 p-px">
          <table
            className={cn(
              "w-full text-xs text-left border-collapse",
              hasBorder ? "border border-foreground" : "border-b border-foreground"
            )}
          >
            {tableData.headers.length > 0 && (
              <thead className="bg-muted/40 font-semibold text-foreground">
                <tr>
                  {tableData.headers.map((header, idx) => (
                    <th
                      key={idx}
                      className={cn(
                        compact ? "px-1.5 py-px text-[10px]" : "px-2 py-0.5 text-xs leading-tight",
                        hasBorder ? "border border-foreground" : "border-b border-foreground font-bold"
                      )}
                    >
                      <RenderMath text={header} isMath={isMath} />
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {tableData.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-muted/20 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className={cn(
                        compact ? "px-1.5 py-px text-[10px]" : "px-2 py-0.5 text-xs leading-tight text-foreground",
                        hasBorder ? "border border-foreground" : "border-b border-foreground/60"
                      )}
                    >
                      <RenderMath text={cell} isMath={isMath} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. Attachment Bottom Content / Bottom Caption (End) */}
      {attachment.bottomContent && (
        <div className="text-[11px] text-foreground font-medium italic whitespace-pre-wrap leading-tight mt-0.5 mb-0">
          <RenderMath text={attachment.bottomContent.trim()} isMath={isMath} />
        </div>
      )}
    </div>
  )
}

export function QuestionAttachments({
  attachments,
  isMath = false,
  className,
  imageClassName,
  compact = false,
}: QuestionAttachmentsProps) {
  if (!Array.isArray(attachments) || attachments.length === 0) {
    return null
  }

  const sorted = [...attachments].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0)
  )

  return (
    <div className={cn("flex flex-col gap-0.5 w-full my-0", className)}>
      {sorted.map((att, idx) => (
        <QuestionAttachmentItem
          key={att.id || idx}
          attachment={att}
          isMath={isMath}
          imageClassName={imageClassName}
          compact={compact}
        />
      ))}
    </div>
  )
}
