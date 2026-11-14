"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Progress } from "@workspace/ui/components/progress"
import { DataTableEmptyState } from "@/components/shared/data-table-empty-state"
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Upload,
  FileCheck2,
  Image as ImageIcon,
  Layers,
} from "lucide-react"
import { toBengaliDigits } from "@workspace/utils"

export interface ChapterPipelineData {
  id: string
  nameBn: string
  nameEn: string
  position: number
  totalQuestions: number
  activeQuestions: number
  inactiveQuestions: number
  mcqCount: number
  cqCount: number
  shortAnswerCount: number
  visualAttachmentsCount: number
  uploadedVisualCount: number
  missingVisualCount: number
  tableCount: number
  pendingReportsCount: number
  statusBadge: "READY" | "MISSING_ATTACHMENTS" | "NEEDS_REVIEW" | "EMPTY"
  readinessScore: number
}

interface PipelineMatrixProps {
  chapters: ChapterPipelineData[]
  isLoading?: boolean
  onSelectChapterForAttachments: (chapterId: string) => void
  onSelectChapterForProofing: (chapterId: string) => void
}

export function PipelineMatrix({
  chapters,
  isLoading,
  onSelectChapterForAttachments,
  onSelectChapterForProofing,
}: PipelineMatrixProps) {
  if (isLoading) {
    return (
      <div className="w-full rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-12 text-center shadow-xs">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 dark:border-primary border-t-transparent mx-auto" />
        <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-3">
          সিলেবাসের অগ্রগতি লোড হচ্ছে...
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200/80 dark:border-white/[0.06]">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-14 text-center font-bold text-xs text-slate-700 dark:text-muted-foreground">
                নং
              </TableHead>
              <TableHead className="min-w-[220px] font-bold text-xs text-slate-700 dark:text-muted-foreground">
                অধ্যায়
              </TableHead>
              <TableHead className="min-w-[150px] text-center font-bold text-xs text-slate-700 dark:text-muted-foreground">
                প্রশ্ন বিন্যাস (M / C / S)
              </TableHead>
              <TableHead className="min-w-[120px] text-center font-bold text-xs text-slate-700 dark:text-muted-foreground">
                মোট প্রশ্ন
              </TableHead>
              <TableHead className="min-w-[200px] font-bold text-xs text-slate-700 dark:text-muted-foreground">
                চিত্র / মিডিয়া সংযুক্তি
              </TableHead>
              <TableHead className="min-w-[150px] font-bold text-xs text-slate-700 dark:text-muted-foreground">
                সক্রিয় অনুপাত
              </TableHead>
              <TableHead className="min-w-[130px] text-center font-bold text-xs text-slate-700 dark:text-muted-foreground">
                স্থিতি (Status)
              </TableHead>
              <TableHead className="min-w-[180px] text-right font-bold text-xs text-slate-700 dark:text-muted-foreground">
                অ্যাকশন
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-sm divide-y divide-slate-200/60 dark:divide-white/[0.04]">
            {chapters.length === 0 ? (
              <DataTableEmptyState
                columns={8}
                icon={Layers}
                title="কোনো অধ্যায় পাওয়া যায়নি"
                description="অনুগ্রহ করে অন্য একটি বিষয় বা শ্রেণি নির্বাচন করুন।"
              />
            ) : (
              chapters.map((ch, idx) => {
                const attachPct =
                  ch.visualAttachmentsCount === 0
                    ? 100
                    : Math.round(
                        (ch.uploadedVisualCount / ch.visualAttachmentsCount) *
                          100,
                      )

                const activePct =
                  ch.totalQuestions === 0
                    ? 100
                    : Math.round(
                        (ch.activeQuestions / ch.totalQuestions) * 100,
                      )

                return (
                  <TableRow
                    key={ch.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Index */}
                    <TableCell className="text-center font-mono font-bold text-muted-foreground text-xs">
                      #{toBengaliDigits(idx + 1)}
                    </TableCell>

                    {/* Chapter Info */}
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="font-bold text-foreground text-sm font-headline line-clamp-1">
                          {ch.nameBn}
                        </p>
                        <p className="text-xs text-muted-foreground font-body line-clamp-1">
                          {ch.nameEn}
                        </p>
                      </div>
                    </TableCell>

                    {/* Format breakdown */}
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5 text-xs font-mono">
                        <span
                          className="rounded-lg px-2 py-0.5 bg-indigo-50 dark:bg-primary/10 text-indigo-700 dark:text-primary border border-indigo-100 dark:border-primary/20 font-bold"
                          title="MCQ"
                        >
                          M: {toBengaliDigits(ch.mcqCount)}
                        </span>
                        <span
                          className="rounded-lg px-2 py-0.5 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40 font-bold"
                          title="CQ"
                        >
                          C: {toBengaliDigits(ch.cqCount)}
                        </span>
                        {ch.shortAnswerCount > 0 && (
                          <span
                            className="rounded-lg px-2 py-0.5 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/40 font-bold"
                            title="Short Answer"
                          >
                            S: {toBengaliDigits(ch.shortAnswerCount)}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Total Questions */}
                    <TableCell className="text-center">
                      <span className="font-mono font-extrabold text-foreground text-sm">
                        {toBengaliDigits(ch.totalQuestions)}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">
                        টি
                      </span>
                    </TableCell>

                    {/* Visual Media Attachments */}
                    <TableCell>
                      {ch.visualAttachmentsCount > 0 ? (
                        <div className="space-y-1.5 max-w-[190px]">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono text-muted-foreground">
                              {toBengaliDigits(ch.uploadedVisualCount)} /{" "}
                              {toBengaliDigits(ch.visualAttachmentsCount)} চিত্র
                            </span>
                            {ch.missingVisualCount > 0 ? (
                              <span className="font-bold text-rose-500 text-[11px]">
                                বাকি: {toBengaliDigits(ch.missingVisualCount)}
                              </span>
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] flex items-center gap-0.5">
                                <CheckCircle2 className="h-3 w-3 inline" /> সম্পন্ন
                              </span>
                            )}
                          </div>
                          <Progress
                            value={attachPct}
                            className="h-1.5 bg-slate-100 dark:bg-white/[0.06] [&>div]:bg-indigo-600 dark:[&>div]:bg-primary"
                          />
                          {ch.tableCount > 0 && (
                            <p className="text-[11px] text-muted-foreground font-body">
                              + {toBengaliDigits(ch.tableCount)}টি সারণি (ছক)
                            </p>
                          )}
                        </div>
                      ) : ch.tableCount > 0 ? (
                        <span className="text-xs text-muted-foreground font-mono">
                          {toBengaliDigits(ch.tableCount)}টি সারণি (চিত্র নেই)
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic font-body">
                          সংযুক্তি নেই
                        </span>
                      )}
                    </TableCell>

                    {/* Active Quality Rate */}
                    <TableCell>
                      <div className="space-y-1.5 max-w-[140px]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-foreground">
                            {toBengaliDigits(activePct)}%
                          </span>
                          {ch.inactiveQuestions > 0 && (
                            <span className="text-amber-600 dark:text-amber-400 text-[11px] font-semibold">
                              নিষ্ক্রিয়: {toBengaliDigits(ch.inactiveQuestions)}
                            </span>
                          )}
                        </div>
                        <Progress
                          value={activePct}
                          className="h-1.5 bg-slate-100 dark:bg-white/[0.06] [&>div]:bg-emerald-500"
                        />
                      </div>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell className="text-center">
                      {ch.statusBadge === "READY" && (
                        <Badge className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 hover:bg-emerald-100/50 text-xs font-semibold rounded-lg px-2.5 py-0.5">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          প্রস্তুত
                        </Badge>
                      )}
                      {ch.statusBadge === "MISSING_ATTACHMENTS" && (
                        <Badge className="bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40 hover:bg-rose-100/50 text-xs font-semibold rounded-lg px-2.5 py-0.5">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          চিত্র বাকি
                        </Badge>
                      )}
                      {ch.statusBadge === "NEEDS_REVIEW" && (
                        <Badge className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40 hover:bg-amber-100/50 text-xs font-semibold rounded-lg px-2.5 py-0.5">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          রিভিউ প্রয়োজন
                        </Badge>
                      )}
                      {ch.statusBadge === "EMPTY" && (
                        <Badge
                          variant="outline"
                          className="text-muted-foreground text-xs rounded-lg px-2.5 py-0.5"
                        >
                          খালি
                        </Badge>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {ch.missingVisualCount > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSelectChapterForAttachments(ch.id)}
                            className="h-8 px-2.5 rounded-xl text-xs gap-1 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold cursor-pointer"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            <span>চিত্র দিন</span>
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelectChapterForProofing(ch.id)}
                          className="h-8 px-2.5 rounded-xl text-xs gap-1 hover:bg-slate-100 dark:hover:bg-white/[0.04] text-foreground font-semibold cursor-pointer border border-slate-200/60 dark:border-white/[0.04]"
                        >
                          <FileCheck2 className="h-3.5 w-3.5 text-indigo-600 dark:text-primary" />
                          <span>প্রুফিং</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
