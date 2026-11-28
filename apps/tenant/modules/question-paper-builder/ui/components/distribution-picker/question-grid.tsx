import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, FileQuestion, SearchX, FilterX, BookmarkX, RotateCcw, PlusCircle, Sparkles } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { cn } from "@workspace/ui/lib/utils";
import { useAvailableQuestions } from "@/modules/question-paper/services/use-question-paper";
import type { QuestionTypeCode } from "@workspace/utils";
import { PickerContext } from "./picker-card-wrapper";
import { McqPickerCard } from "./mcq-picker-card";
import { CqPickerCard } from "./cq-picker-card";
import { CsPickerCard } from "./cs-picker-card";
import { SaPickerCard } from "./sa-picker-card";
import { ParagraphPickerCard } from "./paragraph-picker-card";
import { EssencePickerCard } from "./essence-picker-card";
import { PoemEssencePickerCard } from "./poem-essence-picker-card";
import { FormFillupPickerCard } from "./form-fillup-picker-card";
import { ProseEssencePickerCard } from "./prose-essence-picker-card";
import { PoemPickerCard } from "./poem-picker-card";
import { SummaryPickerCard } from "./summary-picker-card";
import { AmplificationPickerCard } from "./amplification-picker-card";
import { LetterPickerCard } from "./letter-picker-card";
import { ApplicationPickerCard } from "./application-picker-card";
import { MathQuestionPickerCard } from "./math-question-picker-card";
import { GrammarQuestionPickerCard } from "./grammar-question-picker-card";
import { NewsReportPickerCard } from "./news-report-picker-card";
import { EssayPickerCard } from "./essay-picker-card";
import { NumberInWordsPickerCard } from "./number-in-words-picker-card";
import { WordMeaningPickerCard } from "./word-meaning-picker-card";
import { MakeSentencePickerCard } from "./make-sentence-picker-card";
import { MakeQuestionPickerCard } from "./make-question-picker-card";
import { OppositeWordPickerCard } from "./opposite-word-picker-card";
import { GenderChangePickerCard } from "./gender-change-picker-card";
import { JuktobornoPickerCard } from "./juktoborno-picker-card";
import { EkKothayProkashPickerCard } from "./ek-kothay-prokash-picker-card";
import { SynonymPickerCard } from "./synonym-picker-card";
import { SadhuToCholitoPickerCard } from "./sadhu-to-cholito-picker-card";
import { PodNirnoyPickerCard } from "./pod-nirnoy-picker-card";
import { VerbTensePickerCard } from "./verb-tense-picker-card";
import { PbqPickerCard } from "./pbq-picker-card";
import { PartsOfSpeechPickerCard } from "./parts-of-speech-picker-card";
import { RightFormOfVerbPickerCard } from "./right-form-of-verb-picker-card";
import { FillInTheBlanksWithCluesPickerCard } from "./fill-in-the-blanks-with-clues-picker-card";
import { FillInTheBlanksWithoutCluesPickerCard } from "./fill-in-the-blanks-without-clues-picker-card";
import { SubstitutionTablePickerCard } from "./substitution-table-picker-card";
import { ChangingSentencePickerCard } from "./changing-sentence-picker-card";
import { PunctuationPickerCard } from "./punctuation-picker-card";
import { ShortCompositionPickerCard } from "./short-composition-picker-card";
import { DescriptiveQuestionPickerCard } from "./descriptive-question-picker-card";
import { ShortQuestionPickerCard } from "./short-question-picker-card";
import { ShuddhoAshuddhoPickerCard } from "./shuddho-ashuddho-picker-card";
import { DanBamMilkoronPickerCard } from "./dan-bam-milkoron-picker-card";
import { RearrangePickerCard } from "./rearrange-picker-card";
import { SeenComprehensionPickerCard } from "./seen-comprehension-picker-card";

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "০";
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .split("")
    .map((digit) => (/\d/.test(digit) ? bengaliDigits[parseInt(digit, 10)] : digit))
    .join("");
};

const fromBengaliDigits = (str: string): string => {
  const bengaliToEnglish: Record<string, string> = {
    "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
    "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",
  };
  return str.replace(/[০-৯]/g, (match) => bengaliToEnglish[match] || match);
};

function getPaginationPages(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 3) {
    return [1, 2, 3, 4, "...", totalPages];
  }
  if (currentPage >= totalPages - 2) {
    return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

export interface QuestionGridProps {
  subjectId: string;
  questionTypeId: string;
  category: QuestionTypeCode;
  search: string;
  chapterId: string;
  board: string;
  source?: string;
  sort?: "newest" | "oldest";
  mcqType?: string;
  ownership?: "ALL" | "OWN" | "GLOBAL";
  excludePaperId: string;
  distributionId?: string;
  selectedIds: string[];
  selectedSubQuestionIdsMap?: Record<string, string[]>;
  onToggle: (id: string) => void;
  onToggleSubQuestion?: (passageId: string, subQuestionId: string, allSubIds: string[]) => void;
  onSelectGroup?: (passageId: string, groupSubIds: string[], allSubIds: string[]) => void;
  page?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onlyBookmarked?: boolean;
  bookmarkedIds?: string[];
  isExchangeMode?: boolean;
  currentQuestionId?: string;
  onResetFilters?: () => void;
  onClearSearch?: () => void;
  onResetBookmarks?: () => void;
  onResetOwnership?: () => void;
  onCreateCustomQuestion?: () => void;
}

export const QuestionGrid: React.FC<QuestionGridProps> = ({
  subjectId,
  questionTypeId,
  category,
  search,
  chapterId,
  board,
  source,
  sort,
  mcqType,
  ownership = "ALL",
  excludePaperId,
  distributionId,
  selectedIds,
  selectedSubQuestionIdsMap,
  onToggle,
  onToggleSubQuestion,
  onSelectGroup,
  page = 1,
  limit = 20,
  onPageChange,
  onLimitChange,
  onlyBookmarked = false,
  bookmarkedIds,
  isExchangeMode = false,
  currentQuestionId,
  onResetFilters,
  onClearSearch,
  onResetBookmarks,
  onResetOwnership,
  onCreateCustomQuestion,
}) => {
  const { data: result, isLoading } = useAvailableQuestions({
    subjectId,
    questionTypeId,
    category,
    search: search.trim() || undefined,
    chapterId: chapterId !== "All" ? chapterId : undefined,
    board: board !== "All" ? board : undefined,
    source: source && source !== "All" ? source : undefined,
    sort,
    mcqType: mcqType && mcqType !== "All" ? mcqType : undefined,
    ownership,
    excludePaperId,
    distributionId,
    page,
    limit,
  });

  const rawQuestions = result?.items || [];
  const questions =
    onlyBookmarked && bookmarkedIds
      ? rawQuestions.filter((q: any) => bookmarkedIds.includes(q.id))
      : rawQuestions;

  const totalItems = onlyBookmarked ? questions.length : result?.totalItems || 0;
  const totalPages = onlyBookmarked
    ? Math.max(1, Math.ceil(totalItems / limit))
    : result?.totalPages || 1;
  const currentPage = result?.page || page;
  const currentLimit = result?.limit || limit;
  const displayStart = totalItems === 0 ? 0 : (currentPage - 1) * currentLimit + 1;
  const displayEnd = Math.min(totalItems, currentPage * currentLimit);

  const gridTopRef = React.useRef<HTMLDivElement>(null);
  const [jumpPage, setJumpPage] = React.useState<string>("");

  const questionMap = React.useMemo(() => {
    const map = new Map<string, any>();
    questions.forEach((q: any) => map.set(q.id, q));
    return map;
  }, [questions]);

  const handlePageChange = (newPage: number) => {
    onPageChange?.(newPage);
    gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleJumpSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleanStr = fromBengaliDigits(jumpPage.trim());
    const parsed = parseInt(cleanStr, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
      handlePageChange(parsed);
      setJumpPage("");
    }
  };


  if (isLoading) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
        <p className="text-sm font-semibold text-muted-foreground font-body">প্রশ্নসমূহ লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    const hasSearch = Boolean(search && search.trim() !== "");
    const hasFilters =
      (chapterId && chapterId !== "All") ||
      (board && board !== "All") ||
      (source && source !== "All") ||
      (mcqType && mcqType !== "All");

    if (ownership === "OWN") {
      return (
        <div className="w-full py-10 sm:py-20 rounded-3xl border border-purple-200/50 dark:border-purple-900/30 bg-purple-500/[0.03] dark:bg-purple-950/[0.05] flex flex-col items-center justify-center text-center px-4 sm:px-6 select-none animate-in fade-in duration-200 font-display shadow-2xs">
          <div className="relative mb-4 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 ring-8 ring-purple-500/5 border border-purple-500/20 shadow-2xs">
              <Sparkles className="w-7 h-7" />
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-foreground font-headline mb-1">কোনো নিজস্ব প্রশ্ন পাওয়া যায়নি</h3>
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

    if (onlyBookmarked) {
      return (
        <div className="w-full py-10 sm:py-20 rounded-3xl border border-border/40 bg-muted/[0.08] dark:bg-white/[0.015] flex flex-col items-center justify-center text-center px-4 sm:px-6 select-none animate-in fade-in duration-200 font-display shadow-2xs">
          <div className="relative mb-4 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400 ring-8 ring-rose-500/5 border border-rose-500/20 shadow-2xs">
              <BookmarkX className="w-7 h-7" />
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-foreground font-headline mb-1">কোনো বুকমার্ক পাওয়া যায়নি</h3>
          <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed max-w-sm mx-auto mb-5">
            এই বিষয়ের কোনো প্রশ্ন এখনো আপনার বুকমার্ক তালিকায় যুক্ত করা হয়নি।
          </p>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {onResetBookmarks && (
              <Button
                type="button"
                variant="outline"
                onClick={onResetBookmarks}
                className="h-9 px-4 rounded-xl border-border/80 bg-card hover:bg-muted font-bold font-headline text-xs cursor-pointer flex items-center gap-2 active:scale-95 shadow-2xs transition-all"
              >
                <span>সকল প্রশ্ন দেখুন</span>
              </Button>
            )}
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
                    আপনার সার্চ অনুযায়ী নতুন প্রশ্ন তৈরি করে সরাসরি প্রশ্নপত্রে যুক্ত করুন
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
                    আপনার প্রয়োজনমতো নিজস্ব প্রশ্ন তৈরি করে সরাসরি প্রশ্নপত্রে যুক্ত করুন
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
          এই বিভাগ বা বিষয়ের জন্য প্রশ্নব্যাংকে কোনো প্রশ্ন পাওয়া যায়নি। আপনি নিজেই আপনার প্রয়োজনীয় প্রশ্ন তৈরি করে সরাসরি প্রশ্নপত্রে যুক্ত করতে পারেন।
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
                  নতুন প্রশ্ন তৈরি করে সাথে সাথে এই প্রশ্নপত্রে যুক্ত করে নিন
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

  const effectiveCategory = (result?.category || category) as QuestionTypeCode;

  const renderCard = (q: any, globalIndex?: number) => {
    const isSelected = selectedIds.includes(q.id);

    switch (effectiveCategory as string) {
      case "PARTS_OF_SPEECH":
        return <PartsOfSpeechPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "RIGHT_FORM_OF_VERBS":
        return <RightFormOfVerbPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "CHANGING_SENTENCES":
        return <ChangingSentencePickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "FILL_IN_THE_BLANKS_WITH_CLUES":
        return <FillInTheBlanksWithCluesPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "FILL_IN_THE_BLANKS_WITHOUT_CLUES":
        return <FillInTheBlanksWithoutCluesPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "SUBSTITUTION_TABLE":
        return <SubstitutionTablePickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "PUNCTUATION":
        return <PunctuationPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "SHORT_COMPOSITION":
        return <ShortCompositionPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "DESCRIPTIVE_QUESTION":
        return <DescriptiveQuestionPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "SHORT_QUESTION":
        return <ShortQuestionPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "SHUDDHO_ASHUDDHO":
        return <ShuddhoAshuddhoPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "DAN_BAM_MILKORON":
        return <DanBamMilkoronPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "REARRANGE":
        return <RearrangePickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "POEM":
        return <PoemPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "MAKE_SENTENCES":
        return <MakeSentencePickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "MAKE_QUESTION":
        return <MakeQuestionPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "NUMBER_IN_WORDS":
        return <NumberInWordsPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "WORD_MEANING":
        return <WordMeaningPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "OPPOSITE_WORD":
        return <OppositeWordPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "GENDER_CHANGE":
        return <GenderChangePickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "JUKTOBORNO":
        return <JuktobornoPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "EK_KOTHAY_PROKASH":
        return <EkKothayProkashPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "SYNONYM":
        return <SynonymPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "SADHU_TO_CHOLITO":
        return <SadhuToCholitoPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "POD_NIRNOY":
        return <PodNirnoyPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "VERB_TENSE":
        return <VerbTensePickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "CQ":
        return <CqPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "PBQ":
        return <PbqPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "SEEN_COMPREHENSION_1":
      case "SEEN_COMPREHENSION_2":
        return (
          <SeenComprehensionPickerCard
            key={q.id}
            question={q}
            isSelected={isSelected}
            selectedSubQuestionIds={selectedSubQuestionIdsMap?.[q.id]}
            onToggle={onToggle}
            onToggleSubQuestion={onToggleSubQuestion}
            onSelectGroup={onSelectGroup}
           index={globalIndex} />
        );
      case "CS":
        return <CsPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "SA":
        return <SaPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "PARAGRAPH":
        return <ParagraphPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "ESSENCE":
        return <EssencePickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "FORM_FILLUP":
      case "FORM_FILLING":
        return <FormFillupPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "PROSE_ESSENCE":
        return <ProseEssencePickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "POEM_ESSENCE":
        return <PoemEssencePickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "SUMMARY":
        return <SummaryPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "THOUGHT_EXPANSION":
        return <AmplificationPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "APPLICATION":
        return <ApplicationPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "MATH_QUESTION":
        return <MathQuestionPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "GRAMMAR_QUESTION":
        return <GrammarQuestionPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "NEWS_REPORT":
        return <NewsReportPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "ESSAY":
        return <EssayPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "LETTER":
        return <LetterPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle}  index={globalIndex} />;
      case "MCQ":
      default:
        return <McqPickerCard key={q.id} question={q} index={globalIndex} isSelected={isSelected} onToggle={onToggle} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top anchor for smooth scrolling on page change */}
      <div ref={gridTopRef} className="scroll-mt-6" />

      <PickerContext.Provider
        value={{
          isExchangeMode,
          currentQuestionId,
          getQuestion: (id: string) => questionMap.get(id),
        }}
      >
        <div
          className={`grid gap-4 ${
            category === "CQ" || category === "SEEN_COMPREHENSION_1" || category === "SEEN_COMPREHENSION_2"
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {questions.map((q: any, idx: number) => {
            const globalIndex = (page - 1) * limit + idx + 1;
            return renderCard(q, globalIndex);
          })}
        </div>
      </PickerContext.Provider>

      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 bg-card/90 backdrop-blur-xs border border-border/70 rounded-2xl p-2.5 sm:px-4 sm:py-3 shadow-2xs font-display text-xs">
          {/* Summary & Limit Selector */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap justify-center sm:justify-start w-full sm:w-auto text-xs text-muted-foreground font-body">
            <span>
              প্রদর্শিত: <strong className="text-foreground font-headline font-bold">{toBengaliDigits(displayStart)}–{toBengaliDigits(displayEnd)}</strong>
              <span className="mx-1.5 opacity-40">•</span>
              মোট: <strong className="text-primary font-headline font-bold">{toBengaliDigits(totalItems)}</strong>টি প্রশ্ন
            </span>

            {onLimitChange && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-border/60">
                <Select
                  value={String(currentLimit)}
                  onValueChange={(val) => {
                    onLimitChange(Number(val) || 20);
                    handlePageChange(1);
                  }}
                >
                  <SelectTrigger className="h-7 rounded-lg border border-border/60 bg-muted/40 px-2 text-[11px] font-bold text-foreground w-auto gap-1 focus:ring-1 focus:ring-primary shadow-none hover:bg-muted/70 cursor-pointer font-headline">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-md rounded-xl min-w-[80px] font-body text-xs">
                    <SelectItem value="10">১০টি / পেজ</SelectItem>
                    <SelectItem value="20">২০টি / পেজ</SelectItem>
                    <SelectItem value="30">৩০টি / পেজ</SelectItem>
                    <SelectItem value="50">৫০টি / পেজ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center font-display">
              {/* Mobile Compact Page Indicator (sm:hidden) */}
              <div className="flex sm:hidden items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 active:scale-95 cursor-pointer"
                  title="পূর্ববর্তী পেজ"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <span className="px-2.5 py-1 rounded-lg bg-muted/50 border border-border/50 text-xs font-bold text-foreground font-headline">
                  {toBengaliDigits(currentPage)} / {toBengaliDigits(totalPages)}
                </span>

                <Button
                  variant="ghost"
                  size="icon"
                  disabled={currentPage >= totalPages}
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 active:scale-95 cursor-pointer"
                  title="পরবর্তী পেজ"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Desktop Full Navigation with Chevrons and Windowed Buttons (hidden sm:flex) */}
              <div className="hidden sm:flex items-center gap-1">
                {/* First Page (<<) */}
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(1)}
                  className="h-8 w-8 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 cursor-pointer transition-all active:scale-95"
                  title="প্রথম পেজ (১)"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </Button>

                {/* Previous Page (<) */}
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className="h-8 px-2 rounded-lg text-xs font-semibold gap-1 text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 cursor-pointer font-headline transition-all active:scale-95"
                  title="পূর্ববর্তী পেজ"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">পূর্ববর্তী</span>
                </Button>

                {/* Numbered Buttons */}
                <div className="flex items-center gap-1 px-1">
                  {getPaginationPages(currentPage, totalPages).map((p, idx) => {
                    if (p === "...") {
                      return (
                        <span
                          key={`dots-${idx}`}
                          className="px-1 text-xs text-muted-foreground/60 select-none font-bold tracking-widest"
                        >
                          ...
                        </span>
                      );
                    }
                    const pageNum = p as number;
                    const isCurrent = currentPage === pageNum;
                    return (
                      <Button
                        key={pageNum}
                        variant={isCurrent ? "default" : "ghost"}
                        size="icon"
                        onClick={() => handlePageChange(pageNum)}
                        className={cn(
                          "h-8 w-8 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer font-headline",
                          isCurrent
                            ? "bg-primary text-primary-foreground shadow-2xs hover:bg-primary/95 scale-105"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {toBengaliDigits(pageNum)}
                      </Button>
                    );
                  })}
                </div>

                {/* Next Page (>) */}
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  className="h-8 px-2 rounded-lg text-xs font-semibold gap-1 text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 cursor-pointer font-headline transition-all active:scale-95"
                  title="পরবর্তী পেজ"
                >
                  <span className="hidden md:inline">পরবর্তী</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>

                {/* Last Page (>>) */}
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={currentPage >= totalPages}
                  onClick={() => handlePageChange(totalPages)}
                  className="h-8 w-8 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 cursor-pointer transition-all active:scale-95"
                  title={`শেষ পেজ (${toBengaliDigits(totalPages)})`}
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Jump to Page Input (When totalPages > 5 on tablet/desktop) */}
              {totalPages > 5 && (
                <form
                  onSubmit={handleJumpSubmit}
                  className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-border/60 text-xs font-body text-muted-foreground shrink-0"
                >
                  <span className="hidden lg:inline text-[11px]">পেজে যান:</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder={toBengaliDigits(currentPage)}
                    value={jumpPage}
                    onChange={(e) => setJumpPage(e.target.value)}
                    className="w-10 h-7 rounded-lg border border-border/60 bg-muted/30 focus:bg-background text-center text-xs font-bold text-foreground font-headline focus:ring-1 focus:ring-primary focus:outline-hidden transition-all shadow-2xs"
                    title={`১ থেকে ${toBengaliDigits(totalPages)} এর মধ্যে একটি পেজ নম্বর লিখুন`}
                  />
                  <span className="text-[11px] text-muted-foreground/80">/{toBengaliDigits(totalPages)}</span>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    disabled={!jumpPage.trim()}
                    className="h-7 px-2 rounded-lg text-[11px] font-bold text-primary hover:bg-primary/10 disabled:opacity-30 cursor-pointer font-headline transition-all active:scale-95"
                  >
                    যান
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
