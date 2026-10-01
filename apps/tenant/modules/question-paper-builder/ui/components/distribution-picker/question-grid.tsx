import React from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { cn } from "@workspace/ui/lib/utils";
import { useAvailableQuestions } from "@/modules/question-paper/services/use-question-paper";
import type { QuestionTypeCode } from "@workspace/utils";
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
import { NewsReportPickerCard } from "./news-report-picker-card";
import { EssayPickerCard } from "./essay-picker-card";
import { WordMeaningPickerCard } from "./word-meaning-picker-card";
import { MakeSentencePickerCard } from "./make-sentence-picker-card";
import { MakeQuestionPickerCard } from "./make-question-picker-card";
import { OppositeWordPickerCard } from "./opposite-word-picker-card";
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

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "০";
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .split("")
    .map((digit) => (/\d/.test(digit) ? bengaliDigits[parseInt(digit, 10)] : digit))
    .join("");
};

function getPaginationPages(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
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
  excludePaperId: string;
  selectedIds: string[];
  onToggle: (id: string) => void;
  page?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export const QuestionGrid: React.FC<QuestionGridProps> = ({
  subjectId,
  questionTypeId,
  category,
  search,
  chapterId,
  board,
  source,
  excludePaperId,
  selectedIds,
  onToggle,
  page = 1,
  limit = 20,
  onPageChange,
  onLimitChange,
}) => {
  const { data: result, isLoading } = useAvailableQuestions({
    subjectId,
    questionTypeId,
    category,
    search: search.trim() || undefined,
    chapterId: chapterId !== "All" ? chapterId : undefined,
    board: board !== "All" ? board : undefined,
    source: source && source !== "All" ? source : undefined,
    excludePaperId,
    page,
    limit,
  });

  const questions = result?.items || [];
  const totalItems = result?.totalItems || 0;
  const totalPages = result?.totalPages || 1;
  const currentPage = result?.page || page;
  const currentLimit = result?.limit || limit;
  const displayStart = totalItems === 0 ? 0 : (currentPage - 1) * currentLimit + 1;
  const displayEnd = Math.min(totalItems, currentPage * currentLimit);

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="py-20 text-center text-muted-foreground bg-card border rounded-2xl p-8 font-body">
        কোনো প্রশ্ন পাওয়া যায়নি। অন্য কোনো ফিল্টার বা অনুসন্ধান শব্দ ব্যবহার করুন।
      </div>
    );
  }

  const effectiveCategory = (result?.category || category) as QuestionTypeCode;

  const renderCard = (q: any) => {
    const isSelected = selectedIds.includes(q.id);

    switch (effectiveCategory as string) {
      case "PARTS_OF_SPEECH":
        return <PartsOfSpeechPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "RIGHT_FORM_OF_VERBS":
        return <RightFormOfVerbPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "CHANGING_SENTENCES":
        return <ChangingSentencePickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "FILL_IN_THE_BLANKS_WITH_CLUES":
        return <FillInTheBlanksWithCluesPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "FILL_IN_THE_BLANKS_WITHOUT_CLUES":
        return <FillInTheBlanksWithoutCluesPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "SUBSTITUTION_TABLE":
        return <SubstitutionTablePickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "PUNCTUATION":
        return <PunctuationPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "SHORT_COMPOSITION":
        return <ShortCompositionPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "DESCRIPTIVE_QUESTION":
        return <DescriptiveQuestionPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "SHORT_QUESTION":
        return <ShortQuestionPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "POEM":
        return <PoemPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "MAKE_SENTENCES":
        return <MakeSentencePickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "MAKE_QUESTION":
        return <MakeQuestionPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "WORD_MEANING":
        return <WordMeaningPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "OPPOSITE_WORD":
        return <OppositeWordPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "JUKTOBORNO":
        return <JuktobornoPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "EK_KOTHAY_PROKASH":
        return <EkKothayProkashPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "SYNONYM":
        return <SynonymPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "SADHU_TO_CHOLITO":
        return <SadhuToCholitoPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "POD_NIRNOY":
        return <PodNirnoyPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "VERB_TENSE":
        return <VerbTensePickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "CQ":
        return <CqPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "PBQ":
        return <PbqPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "CS":
        return <CsPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "SA":
        return <SaPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "PARAGRAPH":
        return <ParagraphPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "ESSENCE":
        return <EssencePickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "FORM_FILLUP":
      case "FORM_FILLING":
        return <FormFillupPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "PROSE_ESSENCE":
        return <ProseEssencePickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "POEM_ESSENCE":
        return <PoemEssencePickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "SUMMARY":
        return <SummaryPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "AMPLIFICATION":
        return <AmplificationPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "APPLICATION":
        return <ApplicationPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "NEWS_REPORT":
        return <NewsReportPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "ESSAY":
        return <EssayPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "LETTER":
        return <LetterPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "MCQ":
      default:
        return <McqPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
    }
  };

  return (
    <div className="space-y-6">
      <div
        className={`grid gap-4 ${
          category === "CQ"
            ? "grid-cols-1 md:grid-cols-2"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {questions.map((q: any) => renderCard(q))}
      </div>

      {totalItems > 0 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 bg-card border border-outline-variant/70 rounded-2xl p-3 sm:px-5 sm:py-3.5 shadow-xs font-display">
          {/* Summary & Limit Selector */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center md:justify-start w-full md:w-auto text-xs text-on-surface-variant">
            <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-xl border border-outline-variant/40">
              <span className="text-muted-foreground">মোট</span>
              <span className="font-bold text-primary">{toBengaliDigits(totalItems)}</span>
              <span className="text-muted-foreground">টি প্রশ্নের মধ্যে</span>
              <span className="font-bold text-foreground">
                {toBengaliDigits(displayStart)}-{toBengaliDigits(displayEnd)}
              </span>
              <span className="text-muted-foreground">টি প্রদর্শিত</span>
            </div>

            {onLimitChange && (
              <div className="flex items-center gap-1.5 bg-muted/40 px-2.5 py-1 rounded-xl border border-outline-variant/40">
                <span className="text-muted-foreground">প্রতি পাতায়:</span>
                <Select
                  value={String(currentLimit)}
                  onValueChange={(val) => {
                    onLimitChange(Number(val) || 20);
                    onPageChange?.(1);
                  }}
                >
                  <SelectTrigger className="h-7 rounded-lg border-0 bg-transparent px-2 text-xs font-bold text-foreground w-auto gap-1 focus:ring-0 shadow-none hover:bg-muted/70 cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border border-outline-variant shadow-md rounded-xl min-w-[80px]">
                    <SelectItem value="10">১০টি</SelectItem>
                    <SelectItem value="20">২০টি</SelectItem>
                    <SelectItem value="30">৩০টি</SelectItem>
                    <SelectItem value="50">৫০টি</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
                className="h-8.5 px-2.5 sm:px-3 rounded-xl border-outline-variant/70 text-xs font-medium gap-1 hover:bg-muted/80 disabled:opacity-30 cursor-pointer shadow-none"
                title="পূর্ববর্তী পাতা"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">পূর্ববর্তী</span>
              </Button>

              <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-xl border border-outline-variant/40">
                {getPaginationPages(currentPage, totalPages).map((p, idx) => {
                  if (p === "...") {
                    return (
                      <span
                        key={`dots-${idx}`}
                        className="px-1.5 text-xs text-muted-foreground select-none font-bold tracking-widest"
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
                      onClick={() => onPageChange?.(pageNum)}
                      className={cn(
                        "h-7.5 w-7.5 sm:h-8 sm:w-8 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer",
                        isCurrent
                          ? "bg-primary text-white shadow-xs hover:bg-primary/95 scale-105"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {toBengaliDigits(pageNum)}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
                className="h-8.5 px-2.5 sm:px-3 rounded-xl border-outline-variant/70 text-xs font-medium gap-1 hover:bg-muted/80 disabled:opacity-30 cursor-pointer shadow-none"
                title="পরবর্তী পাতা"
              >
                <span className="hidden sm:inline">পরবর্তী</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
