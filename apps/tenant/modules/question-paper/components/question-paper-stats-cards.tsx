"use client"

import { Skeleton } from "@workspace/ui/components/skeleton"
import { Badge } from "@workspace/ui/components/badge"
import { FileText, CheckCircle2, Copy, BookOpen } from "lucide-react"

interface QuestionPaperStatsCardsProps {
  totalPapers?: number
  publishedPapers?: number
  templatePapers?: number
  averageMarks?: number
  isLoading?: boolean
}

export function QuestionPaperStatsCards({
  totalPapers = 0,
  publishedPapers = 0,
  templatePapers = 0,
  averageMarks = 0,
  isLoading = false,
}: QuestionPaperStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 sm:hidden">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-md bg-surface-container-high animate-pulse" />
          ))}
        </div>
        <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl bg-surface-container-high animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      {/* Mobile View */}
      <div className="flex flex-wrap items-center gap-2 sm:hidden">
        <Badge variant="outline" className="rounded-md border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary normal-case tracking-normal">
          মোট প্রশ্নপত্র: {totalPapers}
        </Badge>
        <Badge variant="outline" className="rounded-md border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 normal-case tracking-normal">
          প্রকাশিত: {publishedPapers}
        </Badge>
        <Badge variant="outline" className="rounded-md border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-600 normal-case tracking-normal">
          টেমপ্লেট: {templatePapers}
        </Badge>
        <Badge variant="outline" className="rounded-md border-teal-500/20 bg-teal-500/10 px-3 py-1.5 text-xs font-bold text-teal-600 normal-case tracking-normal">
          গড় নম্বর: {averageMarks}
        </Badge>
      </div>

      {/* Desktop & Tablet View */}
      <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Papers */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              মোট প্রশ্নপত্র
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-on-surface">
              {totalPapers}
            </h3>
            <p className="text-[10px] text-outline mt-0.5">
              ড্রাফট ও প্রকাশিত প্রশ্ন
            </p>
          </div>
        </div>

        {/* Published Papers */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              প্রকাশিত প্রশ্নপত্র
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-emerald-600">
              {publishedPapers}
            </h3>
            <p className="text-[10px] text-outline mt-0.5">
              পরীক্ষার জন্য প্রস্তুত
            </p>
          </div>
        </div>

        {/* Template Papers */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
            <Copy className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              টেমপ্লেট প্রশ্নপত্র
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-amber-600">
              {templatePapers}
            </h3>
            <p className="text-[10px] text-outline mt-0.5">
              পুনরায় ব্যবহারযোগ্য প্রশ্নপত্র
            </p>
          </div>
        </div>

        {/* Average Marks */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 shrink-0">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="font-label-sm text-xs font-medium uppercase tracking-wider text-outline">
              গড় পূর্ণমান
            </p>
            <h3 className="font-headline-md text-2xl font-bold text-teal-600">
              {averageMarks}
            </h3>
            <p className="text-[10px] text-outline mt-0.5">
              প্রতিটি প্রশ্নপত্রের গড় নম্বর
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
