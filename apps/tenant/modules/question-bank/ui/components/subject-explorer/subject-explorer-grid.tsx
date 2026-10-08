"use client"

import React, { useState } from "react"
import {
  Bookmark,
  Copy,
  Eye,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText,
  Sparkles,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { cn } from "@workspace/ui/lib/utils"
import { useAvailableQuestions } from "@/modules/question-paper/services/use-question-paper"
import { useBookmarkedQuestionsStore } from "@/modules/question-bank/store/use-bookmarked-questions-store"
import { useQuestionPreviewStore } from "@/modules/question-bank/store/use-question-preview-store"
import type { QuestionTypeCode } from "@workspace/utils"

// Import all Question Picker Cards
import { McqPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/mcq-picker-card"
import { CqPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/cq-picker-card"
import { CsPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/cs-picker-card"
import { SaPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/sa-picker-card"
import { ParagraphPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/paragraph-picker-card"
import { EssencePickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/essence-picker-card"
import { PoemEssencePickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/poem-essence-picker-card"
import { FormFillupPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/form-fillup-picker-card"
import { ProseEssencePickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/prose-essence-picker-card"
import { PoemPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/poem-picker-card"
import { SummaryPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/summary-picker-card"
import { AmplificationPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/amplification-picker-card"
import { LetterPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/letter-picker-card"
import { ApplicationPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/application-picker-card"
import { NewsReportPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/news-report-picker-card"
import { EssayPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/essay-picker-card"
import { WordMeaningPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/word-meaning-picker-card"
import { MakeSentencePickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/make-sentence-picker-card"
import { MakeQuestionPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/make-question-picker-card"
import { OppositeWordPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/opposite-word-picker-card"
import { JuktobornoPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/juktoborno-picker-card"
import { EkKothayProkashPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/ek-kothay-prokash-picker-card"
import { SynonymPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/synonym-picker-card"
import { SadhuToCholitoPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/sadhu-to-cholito-picker-card"
import { PodNirnoyPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/pod-nirnoy-picker-card"
import { VerbTensePickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/verb-tense-picker-card"
import { PbqPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/pbq-picker-card"
import { PartsOfSpeechPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/parts-of-speech-picker-card"
import { RightFormOfVerbPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/right-form-of-verb-picker-card"
import { FillInTheBlanksWithCluesPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/fill-in-the-blanks-with-clues-picker-card"
import { FillInTheBlanksWithoutCluesPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/fill-in-the-blanks-without-clues-picker-card"
import { SubstitutionTablePickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/substitution-table-picker-card"
import { ChangingSentencePickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/changing-sentence-picker-card"
import { PunctuationPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/punctuation-picker-card"
import { ShortCompositionPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/short-composition-picker-card"
import { DescriptiveQuestionPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/descriptive-question-picker-card"
import { ShortQuestionPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/short-question-picker-card"
import { ShuddhoAshuddhoPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/shuddho-ashuddho-picker-card"
import { DanBamMilkoronPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/dan-bam-milkoron-picker-card"

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "০"
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
  return num
    .toString()
    .split("")
    .map((char) => (/\d/.test(char) ? bengaliDigits[parseInt(char)] : char))
    .join("")
}

function getPaginationPages(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages]
  }
  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages]
}

interface SubjectExplorerGridProps {
  subjectId: string
  category: QuestionTypeCode
  search: string
  chapterId: string
  board: string
  source?: string
  difficulty?: string
  sort: "newest" | "oldest"
  page: number
  limit: number
  onPageChange: (page: number) => void
  isBookmarkedOnly?: boolean
}

export const SubjectExplorerGrid: React.FC<SubjectExplorerGridProps> = ({
  subjectId,
  category,
  search,
  chapterId,
  board,
  source,
  difficulty,
  sort,
  page,
  limit,
  onPageChange,
  isBookmarkedOnly = false,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const isBookmarked = useBookmarkedQuestionsStore((s) => s.isBookmarked)
  const toggleBookmark = useBookmarkedQuestionsStore((s) => s.toggleBookmark)
  const openPreview = useQuestionPreviewStore((s) => s.openPreview)

  const { data: result, isLoading } = useAvailableQuestions({
    subjectId,
    category: category === "ALL" as any ? undefined : category,
    search: search.trim() || undefined,
    chapterId: chapterId !== "All" ? chapterId : undefined,
    board: board !== "All" ? board : undefined,
    source: source && source !== "All" ? source : undefined,
    difficulty: difficulty && difficulty !== "All" ? difficulty : undefined,
    sort,
    page,
    limit,
  })

  const rawQuestions = result?.items || []
  const effectiveCategory = (result?.category || category) as QuestionTypeCode

  // If filtered by bookmarked only, filter locally by store bookmarks
  const questions = isBookmarkedOnly
    ? rawQuestions.filter((q: any) => isBookmarked(q.id))
    : rawQuestions

  const totalItems = isBookmarkedOnly ? questions.length : result?.totalItems || 0
  const totalPages = isBookmarkedOnly
    ? Math.max(1, Math.ceil(totalItems / limit))
    : result?.totalPages || 1
  const currentPage = result?.page || page

  const handleCopyQuestion = (q: any) => {
    let text = q.question || q.title || q.name || ""
    if (q.context) text = `উদ্দীপক:\n${q.context}\n\nপ্রশ্ন:\n${text}`
    if (q.options && Array.isArray(q.options)) {
      text += `\n\nবিকল্পসমূহ:\n` + q.options.map((opt: string, i: number) => `${i + 1}) ${opt}`).join("\n")
    }
    if (q.answer) text += `\n\nসঠিক উত্তর: ${q.answer}`

    navigator.clipboard.writeText(text)
    setCopiedId(q.id)
    toast.success("প্রশ্নটি কপি করা হয়েছে")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handlePreviewQuestion = (q: any) => {
    openPreview({
      id: q.id,
      category: effectiveCategory as string,
      categoryLabelEn: effectiveCategory as string,
      categoryLabelBn: effectiveCategory as string,
      subjectId,
      subjectNameEn: "",
      subjectNameBn: "",
      chapterId: q.academicChapterId || q.chapterId,
      chapterNameEn: q.academicChapter?.nameEn || q.chapter?.nameEn,
      chapterNameBn: q.academicChapter?.nameBn || q.chapter?.nameBn,
      questionText: q.question || q.title || q.name || "",
      context: q.context,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation,
      difficulty: q.difficulty || "MEDIUM",
      reference: q.reference || [],
      source: q.source,
      isMath: false,
      attachments: q.attachments,
      subQuestions: q.subQuestions,
      createdAt: q.createdAt,
    })
  }

  const renderCard = (q: any) => {
    const cardProps = {
      question: q,
      isSelected: false,
      onToggle: () => {},
    }

    switch (effectiveCategory as string) {
      case "PARTS_OF_SPEECH":
        return <PartsOfSpeechPickerCard {...cardProps} />
      case "DAN_BAM_MILKORON":
        return <DanBamMilkoronPickerCard {...cardProps} />
      case "RIGHT_FORM_OF_VERBS":
        return <RightFormOfVerbPickerCard {...cardProps} />
      case "FILL_IN_THE_BLANKS_WITH_CLUES":
        return <FillInTheBlanksWithCluesPickerCard {...cardProps} />
      case "FILL_IN_THE_BLANKS_WITHOUT_CLUES":
        return <FillInTheBlanksWithoutCluesPickerCard {...cardProps} />
      case "SUBSTITUTION_TABLE":
        return <SubstitutionTablePickerCard {...cardProps} />
      case "CHANGING_SENTENCES":
        return <ChangingSentencePickerCard {...cardProps} />
      case "PUNCTUATION":
        return <PunctuationPickerCard {...cardProps} />
      case "SHORT_COMPOSITION":
        return <ShortCompositionPickerCard {...cardProps} />
      case "DESCRIPTIVE_QUESTION":
        return <DescriptiveQuestionPickerCard {...cardProps} />
      case "SHORT_QUESTION":
        return <ShortQuestionPickerCard {...cardProps} />
      case "SHUDDHO_ASHUDDHO":
        return <ShuddhoAshuddhoPickerCard {...cardProps} />
      case "FORM_FILLUP":
      case "FORM_FILLING":
        return <FormFillupPickerCard {...cardProps} />
      case "PROSE_ESSENCE":
        return <ProseEssencePickerCard {...cardProps} />
      case "POEM_ESSENCE":
        return <PoemEssencePickerCard {...cardProps} />
      case "POEM":
        return <PoemPickerCard {...cardProps} />
      case "ESSENCE":
        return <EssencePickerCard {...cardProps} />
      case "SUMMARY":
        return <SummaryPickerCard {...cardProps} />
      case "PARAGRAPH":
        return <ParagraphPickerCard {...cardProps} />
      case "AMPLIFICATION":
        return <AmplificationPickerCard {...cardProps} />
      case "LETTER":
        return <LetterPickerCard {...cardProps} />
      case "APPLICATION":
        return <ApplicationPickerCard {...cardProps} />
      case "NEWS_REPORT":
        return <NewsReportPickerCard {...cardProps} />
      case "ESSAY":
        return <EssayPickerCard {...cardProps} />
      case "WORD_MEANING":
        return <WordMeaningPickerCard {...cardProps} />
      case "MAKE_SENTENCES":
        return <MakeSentencePickerCard {...cardProps} />
      case "MAKE_QUESTION":
        return <MakeQuestionPickerCard {...cardProps} />
      case "OPPOSITE_WORD":
        return <OppositeWordPickerCard {...cardProps} />
      case "JUKTOBORNO":
        return <JuktobornoPickerCard {...cardProps} />
      case "EK_KOTHAY_PROKASH":
        return <EkKothayProkashPickerCard {...cardProps} />
      case "SYNONYM":
        return <SynonymPickerCard {...cardProps} />
      case "SADHU_TO_CHOLITO":
        return <SadhuToCholitoPickerCard {...cardProps} />
      case "POD_NIRNOY":
        return <PodNirnoyPickerCard {...cardProps} />
      case "VERB_TENSE":
        return <VerbTensePickerCard {...cardProps} />
      case "PBQ":
        return <PbqPickerCard {...cardProps} />
      case "CQ":
        return <CqPickerCard {...cardProps} />
      case "CS":
        return <CsPickerCard {...cardProps} />
      case "SA":
        return <SaPickerCard {...cardProps} />
      case "MCQ":
      default:
        return <McqPickerCard {...cardProps} />
    }
  }

  // Exact Layout Skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-5 shadow-xs space-y-4 animate-pulse flex flex-col justify-between h-72 select-none"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-24 bg-slate-200/80 dark:bg-white/10 rounded-md" />
                  <div className="h-5 w-14 bg-slate-100 dark:bg-white/[0.06] rounded-full" />
                </div>
                <div className="h-4 w-full bg-slate-100 dark:bg-white/[0.06] rounded" />
                <div className="h-4 w-3/4 bg-slate-100 dark:bg-white/[0.06] rounded" />
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/[0.04]">
                <div className="h-8 w-full bg-slate-100/70 dark:bg-white/[0.03] rounded-lg" />
                <div className="h-8 w-full bg-slate-100/70 dark:bg-white/[0.03] rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="py-20 text-center bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-8 font-body space-y-3 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-primary mx-auto flex items-center justify-center">
          <FileText className="w-6 h-6 stroke-[1.8]" />
        </div>
        <h3 className="text-base font-bold font-headline text-slate-900 dark:text-foreground">
          কোনো প্রশ্ন পাওয়া যায়নি
        </h3>
        <p className="text-xs text-slate-500 dark:text-muted-foreground max-w-sm mx-auto">
          {isBookmarkedOnly
            ? "আপনার এখনও কোনো প্রশ্ন বুকমার্কে সংরক্ষিত নেই। প্রশ্নের কোণে বুকমার্ক আইকনে ক্লিক করে সংরক্ষণ করতে পারেন।"
            : "নির্বাচিত ফিল্টার বা অনুসন্ধান শব্দের বিপরীতে কোনো প্রশ্ন পাওয়া যায়নি। ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Question Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {questions.map((q: any) => {
          const bookmarked = isBookmarked(q.id)

          return (
            <div
              key={q.id}
              className="group/card relative flex flex-col justify-between rounded-2xl transition-all duration-200"
            >
              {/* Card Main Body */}
              <div className="flex-1">{renderCard(q)}</div>

              {/* Action Toolbar on Bottom Edge of Card */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/80 dark:bg-white/[0.02] border border-t-0 border-slate-200/80 dark:border-white/[0.08] rounded-b-2xl -mt-3 relative z-10">
                <span className="text-[11px] text-slate-400 dark:text-muted-foreground font-body truncate max-w-[140px]">
                  {q.reference && q.reference[0] ? q.reference[0] : "শিখনারী প্রশ্নভাণ্ডার"}
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Bookmark Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleBookmark({
                        id: q.id,
                        category: effectiveCategory as string,
                        subjectId,
                        chapterId: q.academicChapterId || q.chapterId,
                        questionText: q.question || q.title || q.name || "",
                      })
                    }}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      bookmarked
                        ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400"
                        : "bg-white dark:bg-card border-slate-200 dark:border-white/[0.08] text-slate-500 hover:text-rose-600 hover:border-rose-300"
                    }`}
                    title={bookmarked ? "বুকমার্ক থেকে মুছুন" : "বুকমার্কে সংরক্ষণ করুন"}
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${
                        bookmarked ? "fill-rose-500 text-rose-500" : ""
                      }`}
                    />
                  </button>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCopyQuestion(q)
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-card text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors cursor-pointer"
                    title="প্রশ্ন কপি করুন"
                  >
                    {copiedId === q.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Preview Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePreviewQuestion(q)
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-primary/10 border border-indigo-100 dark:border-primary/20 text-indigo-700 dark:text-primary text-[11px] font-bold font-headline hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>বিস্তারিত</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80 dark:border-white/[0.08]">
          <div className="text-xs text-slate-500 dark:text-muted-foreground font-body">
            মোট {toBengaliDigits(totalItems)}টি প্রশ্নের মধ্যে{" "}
            {toBengaliDigits((currentPage - 1) * limit + 1)}-
            {toBengaliDigits(Math.min(currentPage * limit, totalItems))} প্রদর্শিত হচ্ছে
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="h-8 px-2.5 text-xs rounded-lg border-slate-200 dark:border-white/[0.08] cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              <span>পূর্ববর্তী</span>
            </Button>

            <div className="flex items-center gap-1 px-1">
              {getPaginationPages(currentPage, totalPages).map((p, idx) =>
                p === "..." ? (
                  <span key={idx} className="px-2 text-xs text-slate-400">
                    ...
                  </span>
                ) : (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onPageChange(p as number)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold font-headline transition-colors cursor-pointer ${
                      currentPage === p
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/[0.06]"
                    }`}
                  >
                    {toBengaliDigits(p)}
                  </button>
                )
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="h-8 px-2.5 text-xs rounded-lg border-slate-200 dark:border-white/[0.08] cursor-pointer"
            >
              <span>পরবর্তী</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
