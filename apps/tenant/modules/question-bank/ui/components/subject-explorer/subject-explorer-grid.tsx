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
  SearchX,
  FilterX,
  PlusCircle,
  RotateCcw,
  BookmarkX,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { cn } from "@workspace/ui/lib/utils"
import { useAvailableQuestions } from "@/modules/question-paper/services/use-question-paper"
import { useMySubscription } from "@/modules/subscription-plan/services/use-subscription"
import { useBookmarkedQuestionsStore } from "@/modules/question-bank/store/use-bookmarked-questions-store"
import { useQuestionPreviewStore } from "@/modules/question-bank/store/use-question-preview-store"
import type { QuestionTypeCode } from "@workspace/utils"
import { McqBankCard } from "../cards"
import { PickerContext } from "@/modules/question-paper-builder/ui/components/distribution-picker/picker-card-wrapper"

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
import { MathQuestionPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/math-question-picker-card"
import { GrammarQuestionPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/grammar-question-picker-card"
import { NewsReportPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/news-report-picker-card"
import { EssayPickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/essay-picker-card"
import { NumberInWordsPickerCard, formatNumberInWords, toEnglishDigits } from "@/modules/question-paper-builder/ui/components/distribution-picker/number-in-words-picker-card"
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
import { RearrangePickerCard } from "@/modules/question-paper-builder/ui/components/distribution-picker/rearrange-picker-card"

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
  ownership?: "ALL" | "OWN" | "GLOBAL"
  onResetOwnership?: () => void
  onResetFilters?: () => void
  onClearSearch?: () => void
  onCreateCustomQuestion?: () => void
}

export const SubjectExplorerGrid: React.FC<SubjectExplorerGridProps> = ({
  subjectId,
  category,
  search,
  chapterId,
  board,
  source,
  sort,
  page,
  limit,
  onPageChange,
  isBookmarkedOnly = false,
  ownership = "ALL",
  onResetOwnership,
  onResetFilters,
  onClearSearch,
  onCreateCustomQuestion,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const isBookmarked = useBookmarkedQuestionsStore((s) => s.isBookmarked)
  const toggleBookmark = useBookmarkedQuestionsStore((s) => s.toggleBookmark)
  const openPreview = useQuestionPreviewStore((s) => s.openPreview)

  const { data: subData } = useMySubscription()
  const hasSubscription = Boolean(
    subData?.subscription &&
    subData.subscription.status === "ACTIVE" &&
    subData.subscription.plan?.name !== "free" &&
    (subData.remainingDays ?? 1) > 0
  )

  const { data: result, isLoading } = useAvailableQuestions({
    subjectId,
    category: category === "ALL" as any ? undefined : category,
    search: search.trim() || undefined,
    chapterId: chapterId !== "All" ? chapterId : undefined,
    board: board !== "All" ? board : undefined,
    source: source && source !== "All" ? source : undefined,
    sort,
    ownership: ownership && ownership !== "ALL" ? ownership : undefined,
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

  const questionsMap = React.useMemo(() => {
    const map = new Map<string, any>()
    questions.forEach((q: any) => {
      if (q?.id) map.set(q.id, q)
    })
    return map
  }, [questions])

  const handleCopyQuestion = (q: any) => {
    let text = q.number
      ? `${formatNumberInWords(q).numberText} - ${formatNumberInWords(q).inWordsText || q.inWords}`
      : q.word
        ? `${q.word} - ${q.meaning}`
        : q.rawText || q.content || q.question || q.title || q.name || ""
    if (q.context) text = `উদ্দীপক:\n${q.context}\n\nপ্রশ্ন:\n${text}`
    if (q.options && Array.isArray(q.options)) {
      const OPTION_LETTERS = ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ"]
      text += `\n\nবিকল্পসমূহ:\n` + q.options.map((opt: string, i: number) => `${OPTION_LETTERS[i] || i + 1}) ${opt}`).join("\n")
    }
    if (q.answer || q.answerText) text += `\n\nসঠিক উত্তর: ${q.answer || q.answerText}`

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
      questionText: q.number
        ? `${formatNumberInWords(q).numberText} - ${formatNumberInWords(q).inWordsText || q.inWords}`
        : q.word
          ? `${q.word} - ${q.meaning}`
          : q.rawText || q.content || q.question || q.title || q.name || "",
      context: q.context,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation,
      difficulty: q.difficulty || "MEDIUM",
      reference: q.reference || [],
      source: q.source,
      isMath: Boolean(q.isMath),
      attachments: q.attachments,
      subQuestions: q.subQuestions,
      createdAt: q.createdAt,
    })
  }

  const renderCard = (q: any, idx?: number) => {
    const cardProps = {
      question: q,
      index: idx !== undefined ? (currentPage - 1) * limit + idx + 1 : undefined,
      isSelected: false,
      onToggle: () => {},
    }

    switch (effectiveCategory as string) {
      case "PARTS_OF_SPEECH":
        return <PartsOfSpeechPickerCard {...cardProps} />
      case "DAN_BAM_MILKORON":
        return <DanBamMilkoronPickerCard {...cardProps} />
      case "REARRANGE":
        return <RearrangePickerCard {...cardProps} />
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
      case "THOUGHT_EXPANSION":
        return <AmplificationPickerCard {...cardProps} />
      case "LETTER":
        return <LetterPickerCard {...cardProps} />
      case "APPLICATION":
        return <ApplicationPickerCard {...cardProps} />
      case "MATH_QUESTION":
        return <MathQuestionPickerCard {...cardProps} />
      case "GRAMMAR_QUESTION":
        return <GrammarQuestionPickerCard {...cardProps} />
      case "NEWS_REPORT":
        return <NewsReportPickerCard {...cardProps} />
      case "ESSAY":
        return <EssayPickerCard {...cardProps} />
      case "NUMBER_IN_WORDS":
        return <NumberInWordsPickerCard {...cardProps} />
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
    const hasSearch = Boolean(search && search.trim() !== "");
    const hasFilters =
      (chapterId && chapterId !== "All") ||
      (board && board !== "All") ||
      (source && source !== "All");

    if (ownership === "OWN") {
      return (
        <div className="w-full py-10 sm:py-16 rounded-3xl border border-purple-200/50 dark:border-purple-900/30 bg-purple-500/[0.03] dark:bg-purple-950/[0.05] flex flex-col items-center justify-center text-center px-4 sm:px-6 select-none animate-in fade-in duration-200 font-display shadow-2xs">
          <div className="relative mb-3 flex items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 ring-8 ring-purple-500/5 border border-purple-500/20 shadow-2xs">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-foreground font-headline mb-1">
            কোনো নিজস্ব প্রশ্ন পাওয়া যায়নি
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed max-w-sm mx-auto mb-5">
            এই বিষয়ে আপনার প্রতিষ্ঠানের কোনো নিজস্ব প্রশ্ন এখনো তৈরি করা হয়নি। আপনি চাইলে সরাসরি নতুন প্রশ্ন যোগ করতে পারেন।
          </p>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {onCreateCustomQuestion && (
              <Button
                type="button"
                onClick={onCreateCustomQuestion}
                className="h-10 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold font-headline text-xs sm:text-sm cursor-pointer flex items-center gap-2 active:scale-95 shadow-xs transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>নতুন নিজস্ব প্রশ্ন তৈরি করুন</span>
              </Button>
            )}
            {onResetOwnership && (
              <Button
                type="button"
                variant="outline"
                onClick={onResetOwnership}
                className="h-10 px-4 rounded-xl border-border/80 bg-card hover:bg-muted font-bold font-headline text-xs cursor-pointer flex items-center gap-2 active:scale-95 shadow-2xs transition-all"
              >
                <span>সকল প্রশ্ন দেখুন</span>
              </Button>
            )}
          </div>
        </div>
      );
    }

    if (isBookmarkedOnly) {
      return (
        <div className="w-full py-10 sm:py-16 rounded-3xl border border-border/40 bg-muted/[0.08] dark:bg-white/[0.015] flex flex-col items-center justify-center text-center px-4 sm:px-6 select-none animate-in fade-in duration-200 font-display shadow-2xs">
          <div className="relative mb-3 flex items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400 ring-8 ring-rose-500/5 border border-rose-500/20 shadow-2xs">
              <BookmarkX className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-foreground font-headline mb-1">
            কোনো বুকমার্ক পাওয়া যায়নি
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed max-w-sm mx-auto mb-5">
            এই বিষয়ের কোনো প্রশ্ন এখনো আপনার বুকমার্ক তালিকায় যুক্ত করা হয়নি।
          </p>
          {onCreateCustomQuestion && (
            <Button
              type="button"
              onClick={onCreateCustomQuestion}
              className="h-9 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold font-headline text-xs cursor-pointer flex items-center gap-2 active:scale-95 shadow-xs transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>নিজস্ব প্রশ্ন তৈরি করুন</span>
            </Button>
          )}
        </div>
      );
    }

    if (hasSearch) {
      return (
        <div className="w-full py-10 sm:py-16 rounded-3xl border border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 dark:from-white/[0.02] dark:to-transparent flex flex-col items-center justify-center text-center px-4 sm:px-6 select-none animate-in fade-in duration-200 font-display shadow-2xs">
          <div className="relative mb-3 flex items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-8 ring-primary/5 border border-primary/20 shadow-2xs">
              <SearchX className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-foreground font-headline mb-1">
            &quot;{search}&quot;-এর কোনো ফলাফল নেই
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed max-w-md mx-auto mb-4">
            সার্চের সাথে মিলে এমন কোনো প্রশ্ন প্রশ্নব্যাংকে পাওয়া যায়নি।
          </p>

          {/* Prominent Custom Question Suggestion Card */}
          {onCreateCustomQuestion && (
            <div className="w-full max-w-md my-2 mb-5 p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-primary/5 to-purple-500/10 border border-purple-500/25 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/15 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold font-headline text-foreground">
                    &quot;{search}&quot; নিয়ে নিজস্ব প্রশ্ন তৈরি করবেন?
                  </div>
                  <p className="text-[11px] text-muted-foreground font-body mt-0.5">
                    আপনার সার্চ অনুযায়ী নতুন প্রশ্ন তৈরি করে প্রশ্নব্যাংকে যুক্ত করুন
                  </p>
                </div>
              </div>
              <Button
                type="button"
                onClick={onCreateCustomQuestion}
                className="w-full sm:w-auto h-9 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold font-headline text-xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-xs shrink-0 transition-transform"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>তৈরি করুন</span>
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap justify-center">
            {onClearSearch && (
              <Button
                type="button"
                variant="outline"
                onClick={onClearSearch}
                className="h-9 px-4 rounded-xl border-border/80 bg-card hover:bg-muted font-bold font-headline text-xs cursor-pointer flex items-center gap-2 active:scale-95 shadow-2xs transition-all"
              >
                <span>সার্চ ক্লিয়ার করুন</span>
              </Button>
            )}
            {hasFilters && onResetFilters && (
              <Button
                type="button"
                variant="ghost"
                onClick={onResetFilters}
                className="h-9 px-3.5 rounded-xl font-bold font-headline text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>সব ফিল্টার রিসেট</span>
              </Button>
            )}
          </div>
        </div>
      );
    }

    if (hasFilters) {
      return (
        <div className="w-full py-10 sm:py-16 rounded-3xl border border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 dark:from-white/[0.02] dark:to-transparent flex flex-col items-center justify-center text-center px-4 sm:px-6 select-none animate-in fade-in duration-200 font-display shadow-2xs">
          <div className="relative mb-3 flex items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 ring-8 ring-amber-500/5 border border-amber-500/20 shadow-2xs">
              <FilterX className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-foreground font-headline mb-1">
            সিলেক্টেড ফিল্টারে কোনো প্রশ্ন পাওয়া যায়নি
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed max-w-md mx-auto mb-4">
            বর্তমান ফিল্টারের আওতায় প্রশ্নব্যাংকে কোনো প্রশ্ন মেলেনি।
          </p>

          {/* Prominent Custom Question Suggestion Card */}
          {onCreateCustomQuestion && (
            <div className="w-full max-w-md my-2 mb-5 p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-primary/5 to-purple-500/10 border border-purple-500/25 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/15 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold font-headline text-foreground">
                    কাঙ্ক্ষিত প্রশ্নটি খুঁজে পাচ্ছেন না?
                  </div>
                  <p className="text-[11px] text-muted-foreground font-body mt-0.5">
                    আপনার প্রয়োজনমতো নিজস্ব প্রশ্ন তৈরি করে প্রশ্নব্যাংকে যুক্ত করুন
                  </p>
                </div>
              </div>
              <Button
                type="button"
                onClick={onCreateCustomQuestion}
                className="w-full sm:w-auto h-9 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold font-headline text-xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-xs shrink-0 transition-transform"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>তৈরি করুন</span>
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap justify-center">
            {onResetFilters && (
              <Button
                type="button"
                variant="outline"
                onClick={onResetFilters}
                className="h-9 px-4 rounded-xl border-border/80 bg-card hover:bg-muted font-bold font-headline text-xs cursor-pointer flex items-center gap-2 active:scale-95 shadow-2xs transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ফিল্টার রিসেট করুন</span>
              </Button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="w-full py-10 sm:py-16 rounded-3xl border border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 dark:from-white/[0.02] dark:to-transparent flex flex-col items-center justify-center text-center px-4 sm:px-6 select-none animate-in fade-in duration-200 font-display shadow-2xs">
        <div className="relative mb-3 flex items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 ring-8 ring-purple-500/5 border border-purple-500/20 shadow-2xs">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
        <h3 className="text-base sm:text-lg font-bold text-foreground font-headline mb-1">
          প্রশ্ন তালিকা ফাঁকা
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed max-w-md mx-auto mb-4">
          এই বিভাগ বা বিষয়ের জন্য প্রশ্নব্যাংকে কোনো প্রশ্ন পাওয়া যায়নি। আপনি নিজেই আপনার প্রয়োজনীয় প্রশ্ন তৈরি করে প্রশ্নব্যাংকে সংরক্ষণ করতে পারেন।
        </p>

        {onCreateCustomQuestion && (
          <div className="w-full max-w-md my-2 mb-3 p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-primary/5 to-purple-500/10 border border-purple-500/25 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/15 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold font-headline text-foreground">
                  নিজস্ব প্রশ্ন তৈরি করুন
                </div>
                <p className="text-[11px] text-muted-foreground font-body mt-0.5">
                  নতুন প্রশ্ন তৈরি করে সাথে সাথে আপনার প্রতিষ্ঠানের প্রশ্নব্যাংকে যুক্ত করুন
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={onCreateCustomQuestion}
              className="w-full sm:w-auto h-9 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold font-headline text-xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-xs shrink-0 transition-transform"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>প্রশ্ন তৈরি করুন</span>
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Question Cards Grid */}
      <PickerContext.Provider
        value={{
          isBankMode: true,
          hasSubscription,
          getQuestion: (id) => questionsMap.get(id),
          isBookmarked: (id) => isBookmarked(id),
          onToggleBookmark: (id) => {
            const q = questions.find((item: any) => item.id === id)
            if (q) {
              toggleBookmark({
                id: q.id,
                category: effectiveCategory as string,
                subjectId,
                chapterId: q.academicChapterId || q.chapterId,
                questionText: q.question || q.title || q.name || "",
              })
            }
          },
          onPreview: (id) => {
            const q = questions.find((item: any) => item.id === id)
            if (q) handlePreviewQuestion(q)
          },
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {questions.map((q: any, idx: number) => {
            const isMcq =
              effectiveCategory === "MCQ" ||
              (!effectiveCategory && Array.isArray(q.options) && q.options.length > 0)

            if (isMcq) {
              return (
                <McqBankCard
                  key={q.id}
                  question={q}
                  index={(currentPage - 1) * limit + idx + 1}
                  isBookmarked={isBookmarked(q.id)}
                  onToggleBookmark={() =>
                    toggleBookmark({
                      id: q.id,
                      category: effectiveCategory as string,
                      subjectId,
                      chapterId: q.academicChapterId || q.chapterId,
                      questionText: q.question || q.title || q.name || "",
                    })
                  }
                  onPreview={() => handlePreviewQuestion(q)}
                />
              )
            }

            return (
              <div key={q.id} className="h-full">
                {renderCard(q, idx)}
              </div>
            )
          })}
        </div>
      </PickerContext.Provider>

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
