"use client";

import React, { useState } from "react";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Search, Loader2, Plus, CheckCircle2, ArrowRight, ExternalLink, Shuffle } from "lucide-react";
import { useBuilderStore } from "../../../store/use-builder-store";
import { 
  useQuestionPaperById, 
  useQuestionPaperDistributionStatuses,
  useAvailableQuestions,
  useBulkAssignQuestions
} from "@/modules/question-paper/services/use-question-paper";
import { RenderMath } from "@workspace/ui/components/render-math";
import { QuestionAttachments } from "@workspace/ui/components/question-attachments";
import { toast } from "@workspace/ui/components/sonner";
import { isResourceEnglish, resolveDistCategory, resolvePaperSlots, type QuestionTypeCode } from "@workspace/utils";
import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import { formatNumberInWords, translateTag } from "../distribution-picker/number-in-words-picker-card";

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "";
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .split("")
    .map((char) => (/\d/.test(char) ? bengaliDigits[parseInt(char)] : char))
    .join("");
};

const toEnglishDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "";
  const bengaliToEnglish: Record<string, string> = {
    "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
    "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",
  };
  return num
    .toString()
    .split("")
    .map((char) => bengaliToEnglish[char] ?? char)
    .join("");
};

export const QuestionPickerPanel: React.FC = () => {
  const paperId = useBuilderStore((state) => state.paperId);
  const { data: paperQuery } = useQuestionPaperById(paperId || "");
  const { data: statuses, isLoading: statusesLoading } = useQuestionPaperDistributionStatuses(paperId || "");
  
  const [selectedDistId, setSelectedDistId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const activeSectionId = useBuilderStore((state) => state.activeSectionId);
  const activeSubSectionId = useBuilderStore((state) => state.activeSubSectionId);

  const topology = React.useMemo(
    () => (paperQuery ? resolvePaperSlots(paperQuery, statuses ?? []) : null),
    [paperQuery, statuses]
  );

  const activeSlot = React.useMemo(() => {
    if (!topology) return null;
    if (selectedDistId) {
      return topology.findSlot({
        distributionId: selectedDistId,
        subSectionId: activeSubSectionId,
        sectionId: activeSectionId,
      });
    }
    for (const subj of topology.subjects) {
      if (activeSubSectionId) {
        const match = subj.allSlots.find((sl) => sl.subSectionId === activeSubSectionId);
        if (match) return match;
      }
      if (activeSectionId) {
        const match = subj.allSlots.find((sl) => sl.sectionId === activeSectionId);
        if (match) return match;
      }
    }
    return topology.subjects[0]?.allSlots[0] ?? null;
  }, [topology, selectedDistId, activeSubSectionId, activeSectionId]);

  const activeDist = statuses?.find((st: any) => {
    if (selectedDistId) return st.distributionId === selectedDistId;
    if (activeSlot) return st.distributionId === activeSlot.distributionId;
    if (activeSubSectionId) return st.subSectionId === activeSubSectionId || st.subSectionIds?.includes(activeSubSectionId);
    if (activeSectionId) return st.sectionId === activeSectionId;
    return false;
  }) || statuses?.find((st: any) => st.distributionId === selectedDistId) || statuses?.[0];
  const activeDistId = activeDist?.distributionId || "";

  const category: QuestionTypeCode = activeSlot?.category ?? resolveDistCategory(activeDist);

  const { data: availableData, isLoading: questionsLoading } = useAvailableQuestions(
    {
      subjectId: activeDist?.subjectId || "",
      questionTypeId: activeDist?.questionTypeId,
      category,
      search: search.trim() || undefined,
      sort,
      excludePaperId: paperId || undefined,
      distributionId: activeDistId || undefined,
      limit: 25,
    },
    Boolean(activeDist?.subjectId)
  );

  const setActiveTarget = useBuilderStore((state) => state.setActiveTarget);
  const dismissedSubSectionIds = useBuilderStore((state) => state.dismissedSubSectionIds);

  const allSubSections = React.useMemo(() => {
    if (!paperQuery?.sections) return [];
    const list: { id: string; title: string; titleBn: string | null; sectionId: string }[] = [];
    paperQuery.sections.forEach((sec: any) => {
      if (sec.subSections && sec.subSections.length > 0) {
        sec.subSections.forEach((sub: any) => {
          if (!dismissedSubSectionIds.includes(sub.id)) {
            list.push({
              id: sub.id,
              title: sub.title,
              titleBn: sub.titleBn,
              sectionId: sec.id,
            });
          }
        });
      }
    });
    return list;
  }, [paperQuery?.sections, dismissedSubSectionIds]);

  const currentSubIndex = allSubSections.findIndex((sub) => sub.id === activeSubSectionId);
  const currentSub = currentSubIndex !== -1 ? allSubSections[currentSubIndex] : null;
  const nextSub = currentSubIndex !== -1 && currentSubIndex < allSubSections.length - 1 
    ? allSubSections[currentSubIndex + 1] 
    : (currentSubIndex === -1 && allSubSections.length > 0 ? allSubSections[0] : null);

  const { mutateAsync: assignQuestion, isPending: isAssigning } = useBulkAssignQuestions();

  const handleQuickAssign = async (questionId: string) => {
    if (!paperId || !activeDistId) return;
    try {
      const payloadBase = {
        questionPaperId: paperId,
        distributionId: activeDistId,
        sectionId: activeSlot?.sectionId || activeSectionId || (activeDist as any)?.sectionId || undefined,
        subSectionId: activeSlot?.subSectionId || activeSubSectionId || (activeDist as any)?.subSectionId || undefined,
      };

      if (category === "SA") {
        await assignQuestion({ ...payloadBase, shortAnswerIds: [questionId] });
      } else if (category === "CQ") {
        await assignQuestion({ ...payloadBase, cqIds: [questionId] });
      } else if (category === "CS") {
        await assignQuestion({ ...payloadBase, csIds: [questionId] });
      } else if (category === "PBQ") {
        await assignQuestion({ ...payloadBase, pbqIds: [questionId] });
      } else if (category === "PARAGRAPH") {
        await assignQuestion({ ...payloadBase, paragraphIds: [questionId] });
      } else if (category === "ESSENCE") {
        await assignQuestion({ ...payloadBase, essenceIds: [questionId] });
      } else if (category === "POEM_ESSENCE") {
        await assignQuestion({ ...payloadBase, poemEssenceIds: [questionId] });
      } else if (category === "FORM_FILLUP") {
        await assignQuestion({ ...payloadBase, formFillupIds: [questionId] });
      } else if (category === "PROSE_ESSENCE") {
        await assignQuestion({ ...payloadBase, proseEssenceIds: [questionId] });
      } else if (category === "POEM") {
        await assignQuestion({ ...payloadBase, poemIds: [questionId] });
      } else if (category === "SUMMARY") {
        await assignQuestion({ ...payloadBase, summaryIds: [questionId] });
      } else if (category === "AMPLIFICATION") {
        await assignQuestion({ ...payloadBase, amplificationIds: [questionId] });
      } else if (category === "THOUGHT_EXPANSION") {
        await assignQuestion({ ...payloadBase, thoughtExpansionIds: [questionId] });
      } else if (category === "LETTER") {
        await assignQuestion({ ...payloadBase, letterIds: [questionId] });
      } else if (category === "APPLICATION") {
        await assignQuestion({ ...payloadBase, applicationIds: [questionId] });
      } else if (category === "NEWS_REPORT") {
        await assignQuestion({ ...payloadBase, newsReportIds: [questionId] });
      } else if (category === "ESSAY") {
        await assignQuestion({ ...payloadBase, essayIds: [questionId] });
      } else if (category === "NUMBER_IN_WORDS") {
        await assignQuestion({ ...payloadBase, numberInWordsIds: [questionId] });
      } else if (category === "WORD_MEANING") {
        await assignQuestion({ ...payloadBase, wordMeaningIds: [questionId] });
      } else if (category === "MAKE_SENTENCES") {
        await assignQuestion({ ...payloadBase, makeSentencesIds: [questionId] });
      } else if (category === "MAKE_QUESTION") {
        await assignQuestion({ ...payloadBase, makeQuestionIds: [questionId] });
      } else if (category === "OPPOSITE_WORD") {
        await assignQuestion({ ...payloadBase, oppositeWordIds: [questionId] });
      } else if (category === "GENDER_CHANGE") {
        await assignQuestion({ ...payloadBase, genderChangeIds: [questionId] });
      } else if (category === "JUKTOBORNO") {
        await assignQuestion({ ...payloadBase, juktobornoIds: [questionId] });
      } else if (category === "EK_KOTHAY_PROKASH") {
        await assignQuestion({ ...payloadBase, ekKothayProkashIds: [questionId] });
      } else if (category === "SYNONYM") {
        await assignQuestion({ ...payloadBase, synonymIds: [questionId] });
      } else if (category === "SADHU_TO_CHOLITO") {
        await assignQuestion({ ...payloadBase, sadhuToCholitoIds: [questionId] });
      } else if (category === "POD_NIRNOY") {
        await assignQuestion({ ...payloadBase, podNirnoyIds: [questionId] });
      } else if (category === "VERB_TENSE") {
        await assignQuestion({ ...payloadBase, verbTenseIds: [questionId] });
      } else if (category === "PARTS_OF_SPEECH") {
        await assignQuestion({ ...payloadBase, partsOfSpeechIds: [questionId] });
      } else if (category === "PUNCTUATION") {
        await assignQuestion({ ...payloadBase, punctuationIds: [questionId] });
      } else if (category === "SHORT_COMPOSITION") {
        await assignQuestion({ ...payloadBase, shortCompositionIds: [questionId] });
      } else if (category === "DESCRIPTIVE_QUESTION") {
        await assignQuestion({ ...payloadBase, descriptiveQuestionIds: [questionId] });
      } else if (category === "SHORT_QUESTION") {
        await assignQuestion({ ...payloadBase, shortQuestionIds: [questionId] });
      } else if (category === "SHUDDHO_ASHUDDHO") {
        await assignQuestion({ ...payloadBase, shuddhoAshuddhoIds: [questionId] });
      } else if (category === "DAN_BAM_MILKORON") {
        await assignQuestion({ ...payloadBase, danBamMilkoronIds: [questionId] });
      } else if (category === "REARRANGE") {
        await assignQuestion({ ...payloadBase, rearrangeIds: [questionId] });
      } else if (category === "MATH_QUESTION") {
        await assignQuestion({ ...payloadBase, mathQuestionIds: [questionId] });
      } else if (category === "GRAMMAR_QUESTION") {
        await assignQuestion({ ...payloadBase, grammarQuestionIds: [questionId] });
      } else if (category === "RIGHT_FORM_OF_VERBS") {
        await assignQuestion({ ...payloadBase, rightFormOfVerbIds: [questionId] });
      } else if (category === "CHANGING_SENTENCES") {
        await assignQuestion({ ...payloadBase, changingSentenceIds: [questionId] });
      } else if (category === "FILL_IN_THE_BLANKS_WITH_CLUES") {
        await assignQuestion({ ...payloadBase, fillInTheBlanksWithCluesIds: [questionId] });
      } else if (category === "FILL_IN_THE_BLANKS_WITHOUT_CLUES") {
        await assignQuestion({ ...payloadBase, fillInTheBlanksWithoutCluesIds: [questionId] });
      } else if (category === "SUBSTITUTION_TABLE") {
        await assignQuestion({ ...payloadBase, substitutionTableIds: [questionId] });
      } else if (category === "SEEN_COMPREHENSION_1" || category === "SEEN_COMPREHENSION_2") {
        await assignQuestion({ ...payloadBase, seenComprehensionIds: [questionId] });
      } else {
        await assignQuestion({ ...payloadBase, mcqIds: [questionId] });
      }

      toast.success("প্রশ্নটি প্রশ্নপত্রে যোগ করা হয়েছে!");
    } catch (err: any) {
      toast.error(err?.message || "প্রশ্ন যোগ করতে ব্যর্থ হয়েছে");
    }
  };

  const handleQuickAssignGroup = async (questionId: string, groupSubIds: string[]) => {
    if (!paperId || !activeDistId) return;
    try {
      const payloadBase = {
        questionPaperId: paperId,
        distributionId: activeDistId,
        sectionId: activeSlot?.sectionId || activeSectionId || (activeDist as any)?.sectionId || undefined,
        subSectionId: activeSlot?.subSectionId || activeSubSectionId || (activeDist as any)?.subSectionId || undefined,
      };
      await assignQuestion({
        ...payloadBase,
        seenComprehensionItems: [{ id: questionId, selectedSubQuestionIds: groupSubIds }],
      });
      toast.success("উপ-প্রশ্নসমূহ সফলভাবে যোগ করা হয়েছে!");
    } catch (err: any) {
      toast.error(err?.message || "উপ-প্রশ্ন যোগ করতে ব্যর্থ হয়েছে");
    }
  };

  const questions = availableData?.items || [];

  const handleRandomQuickAssign = async () => {
    const unassigned = questions.filter((q: any) => !q.isAssigned);
    if (unassigned.length === 0) {
      toast.error("যুক্ত করার মতো কোনো নতুন প্রশ্ন পাওয়া যায়নি।");
      return;
    }
    const randomIndex = Math.floor(Math.random() * unassigned.length);
    const randomQuestion = unassigned[randomIndex];
    await handleQuickAssign(randomQuestion.id);
  };

  return (
    <div className="flex flex-col h-full bg-background relative font-display">
      {/* Distribution selector & search bar */}
      <div className="p-3 border-b space-y-2 bg-card">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-on-surface">বণ্টন নির্বাচন করুন:</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRandomQuickAssign}
              disabled={isAssigning || questionsLoading}
              className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
              title="দৈবচয়ন (Random) পদ্ধতিতে একটি প্রশ্ন যুক্ত করুন"
            >
              <Shuffle className="w-3 h-3" />
              <span>র‍্যান্ডম যোগ</span>
            </button>
            {paperId && activeDistId && (
              <Link
                href={(() => {
                  const params = new URLSearchParams({ category });
                  const secId = activeSlot?.sectionId || activeSectionId || (activeDist as any)?.sectionId;
                  const subId = activeSlot?.subSectionId || activeSubSectionId || (activeDist as any)?.subSectionId;
                  if (secId) params.set("sectionId", secId);
                  if (subId) params.set("subSectionId", subId);
                  if (activeDist?.questionTypeId) params.set("questionTypeId", activeDist.questionTypeId);
                  if (activeSlot?.slotPickLimit) params.set("limit", String(activeSlot.slotPickLimit));
                  return `/question-papers/${paperId}/distributions/${activeDistId}/pick?${params}`;
                })()}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>গ্রিড ভিউ</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {statusesLoading ? (
          <div className="h-8 flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {statuses?.map((st: any) => {
              const isSelected = (selectedDistId || statuses[0]?.distributionId) === st.distributionId;
              const isComplete = st.addedCount >= st.targetCount && st.targetCount > 0;

              return (
                <button
                  key={st.distributionId}
                  type="button"
                  onClick={() => setSelectedDistId(st.distributionId)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container border-outline-variant"
                  }`}
                >
                  <span>{st.questionTypeNameBn || st.questionTypeName || st.subjectName}</span>
                  <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-white/20 text-white" : isComplete ? "bg-emerald-500/10 text-emerald-600 font-bold" : "bg-muted text-muted-foreground"}`}>
                    {st.addedCount}/{st.targetCount}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Active Sub-section Banner & Next Button */}
        {allSubSections.length > 0 && (
          <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg p-2 text-xs">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-bold text-primary shrink-0">উপ-বিভাগ:</span>
              <span className="truncate font-medium text-foreground">
                {currentSub ? (currentSub.titleBn || currentSub.title) : "সকল / নির্বাচিত নয়"}
              </span>
            </div>
            {nextSub && (
              <Button
                type="button"
                size="sm"
                variant="default"
                onClick={() => setActiveTarget({ sectionId: nextSub.sectionId, subSectionId: nextSub.id })}
                className="h-6 text-[10px] px-2 bg-primary text-white hover:bg-primary/95 font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                title={`পরবর্তী উপ-বিভাগ: ${nextSub.titleBn || nextSub.title}`}
              >
                <span>পরবর্তী</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}

        {/* Search & Sort */}
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              placeholder="প্রশ্ন খুঁজুন..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs font-body bg-card" 
            />
          </div>
          <Select
            value={sort}
            onValueChange={(val: "newest" | "oldest") => setSort(val ?? "newest")}
          >
            <SelectTrigger className="h-8 w-[100px] text-xs font-body bg-card border border-outline-variant px-2 shrink-0">
              <SelectValue placeholder="সর্ট" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg font-body text-xs">
              <SelectItem value="newest">নতুন যুক্ত</SelectItem>
              <SelectItem value="oldest">পুরাতন যুক্ত</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Available questions list */}
      <ScrollArea className="flex-1 p-3">
        {questionsLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <p className="text-xs">প্রশ্ন লোড হচ্ছে...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-xs font-body">
            কোনো প্রশ্ন পাওয়া যায়নি।
          </div>
        ) : (
          <div className="space-y-2.5">
            {questions.map((q: any) => {
              const isAssigned = q.isAssigned;
              const combinedContext = q.type === "COMBINED" && Array.isArray(q.attachments)
                ? q.attachments.find((att: any) => att.caption)?.caption
                : null;

              const isCurrentEnglish = isResourceEnglish({
                subjectName: activeDist?.subjectName,
                questionTypeLabel: activeDist?.questionTypeLabel,
                content: q.rawText || q.content || q.statement || q.question || (Array.isArray(q.leftColumn) ? q.leftColumn.join(" ") : ""),
              }) || category === "NUMBER_IN_WORDS" || category === "PARTS_OF_SPEECH" || category === "RIGHT_FORM_OF_VERBS" || category === "CHANGING_SENTENCES";

              return (
                <div
                  key={q.id}
                  className={`p-3 rounded-xl border transition-all text-xs font-display relative ${
                    isAssigned 
                      ? "bg-muted/30 border-muted opacity-60" 
                      : "bg-card border-outline-variant hover:border-primary/50 shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex flex-wrap items-center gap-1">
                      {(q.academicChapter || q.chapter) && (
                        <Badge variant="secondary" className="text-[10px] font-normal px-1.5 py-0">
                          {isCurrentEnglish
                            ? (q.academicChapter?.nameEn || q.chapter?.nameEn || translateTag(q.academicChapter?.nameBn || q.chapter?.nameBn || ""))
                            : (q.academicChapter?.nameBn || q.academicChapter?.nameEn || q.chapter?.nameBn || q.chapter?.nameEn)}
                        </Badge>
                      )}
                      {category !== "WORD_MEANING" && category !== "NUMBER_IN_WORDS" && q.type && (
                        <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0 bg-primary/5 text-primary border-primary/20">
                          {q.type === "SINGLE" ? (isCurrentEnglish ? "Single" : "সাধারণ") : q.type === "MULTIPLE" ? (isCurrentEnglish ? "Multiple" : "বহুপদি") : q.type === "COMBINED" ? (isCurrentEnglish ? "Combined" : "অভিন্ন") : q.type}
                        </Badge>
                      )}
                      {q.difficulty && (
                        <span
                          className={cn(
                            "px-1.5 py-0 rounded text-[9px] font-bold border uppercase tracking-wide",
                            q.difficulty === "EASY" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                            q.difficulty === "MEDIUM" && "bg-amber-50 text-amber-700 border-amber-200",
                            q.difficulty === "HARD" && "bg-red-50 text-red-700 border-red-200"
                          )}
                        >
                          {isCurrentEnglish
                            ? (q.difficulty ? q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1).toLowerCase() : "")
                            : (q.difficulty === "EASY" ? "সহজ" : q.difficulty === "MEDIUM" ? "মধ্যম" : q.difficulty === "HARD" ? "কঠিন" : q.difficulty)}
                        </span>
                      )}
                      {q.isMath && (
                        <span className="px-1.5 py-0 rounded text-[9px] font-bold border border-amber-200 bg-amber-50 text-amber-700 tracking-wide">
                          ∑ Math
                        </span>
                      )}
                    </div>
                    {isAssigned ? (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {isCurrentEnglish ? "Added" : "যোগকৃত"}
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isAssigning}
                        onClick={() => handleQuickAssign(q.id)}
                        className="h-6 px-2 text-[11px] gap-1 text-primary hover:bg-primary/10 rounded-md font-bold cursor-pointer shrink-0"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{isCurrentEnglish ? "Add" : "যোগ"}</span>
                      </Button>
                    )}
                  </div>

                  {/* Context for Combined MCQ */}
                  {category !== "CQ" && combinedContext && (
                    <div className="text-[11px] text-on-surface-variant bg-muted/40 p-2 rounded-lg whitespace-pre-wrap border border-outline-variant/60 mb-2 leading-relaxed font-body">
                      <RenderMath text={combinedContext} />
                    </div>
                  )}

                  <div className="font-body text-on-surface line-clamp-3 leading-relaxed mb-2">
                    {category === "CHANGING_SENTENCES" ? (
                      <RenderMath text={q.content || (Array.isArray(q.options) && q.options.length > 0 ? q.options.join("\n") : "")} />
                    ) : category === "POD_NIRNOY" ? (
                      <div className="flex flex-col gap-1">
                        <RenderMath text={q.content || ""} />
                        {Array.isArray(q.words) && q.words.length > 0 && (
                          <div className="flex flex-col gap-0.5 font-bold text-primary">
                            {q.words.map((w: string, wIdx: number) => (
                              <div key={wIdx}>{w.trim().replace(/^-+\s*|\s*-+$/g, "").trim()} -</div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : category === "PUNCTUATION" ? (
                      <div className="flex flex-col gap-1">
                        <RenderMath text={q.rawText || q.content || q.prompt || ""} />
                        {(q.answerText || q.answer) && (
                          <span className="text-[11px] text-muted-foreground">
                            {isCurrentEnglish ? "Ans:" : "উত্তর:"} <RenderMath text={q.answerText || q.answer} />
                          </span>
                        )}
                      </div>
                    ) : category === "PARTS_OF_SPEECH" || category === "RIGHT_FORM_OF_VERBS" || category === "FILL_IN_THE_BLANKS_WITH_CLUES" ? (
                      <RenderMath text={q.content || ""} />
                    ) : category === "SUBSTITUTION_TABLE" ? (
                      <span className="text-xs">
                        টেবিল ({q.columnA?.length || 0} সারি) — {q.columnA?.[0] || ""} | {q.columnB?.[0] || ""} | {q.columnC?.[0] || ""}
                      </span>
                    ) : category === "CQ" || category === "CS" ? (
                      <RenderMath text={q.questionA || q.context || "সৃজনশীল প্রশ্ন"} />
                    ) : category === "PBQ" ? (
                      <RenderMath text={q.context || q.questionA || "অনুচ্ছেদভিত্তিক প্রশ্ন"} />
                    ) : category === "SEEN_COMPREHENSION_1" || category === "SEEN_COMPREHENSION_2" ? (
                      <div className="flex flex-col gap-1.5">
                        {q.title && <div className="font-bold text-primary">{q.title}</div>}
                        <div className="line-clamp-3 text-muted-foreground"><RenderMath text={q.passage || ""} /></div>
                        {Array.isArray(q.questions) && q.questions.length > 0 && (
                          <div className="flex flex-col gap-1 mt-1 pt-1 border-t border-dashed">
                            <div className="text-[10px] text-muted-foreground font-semibold flex items-center justify-between">
                              <span>📝 মোট {toBengaliDigits(q.questions.length)}টি উপ-প্রশ্ন</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {Array.from(new Set(q.questions.map((sq: any) => sq.groupNumber || 1))).map((gNum: any) => {
                                const groupSubIds = q.questions.filter((sq: any) => (sq.groupNumber || 1) === gNum).map((sq: any) => sq.id);
                                return (
                                  <button
                                    key={gNum}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQuickAssignGroup(q.id, groupSubIds);
                                    }}
                                    className="px-1.5 py-0.5 rounded bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                    title={`শুধু গ্রুপ ${toBengaliDigits(gNum)} যোগ করুন`}
                                  >
                                    <Plus className="w-2.5 h-2.5" />
                                    গ্রুপ {toBengaliDigits(gNum)} ({toBengaliDigits(groupSubIds.length)})
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : category === "PARAGRAPH" ? (
                      <RenderMath text={q.name || q.title || ""} />
                    ) : category === "NUMBER_IN_WORDS" ? (
                      (() => {
                        const { numberText, inWordsText } = formatNumberInWords(q);
                        return (
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-baseline gap-2">
                              <span className="font-bold text-primary text-sm">
                                <RenderMath text={numberText || q.title || q.name || ""} isMath={true} />
                              </span>
                              {inWordsText && (
                                <span className="text-xs text-muted-foreground font-semibold">
                                  ({inWordsText})
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()
                    ) : category === "WORD_MEANING" ? (
                      <div className="flex flex-col gap-0.5">
                        <RenderMath text={q.word || q.title || q.name || ""} />
                        {q.meaning && (
                          <span className="text-[11px] text-muted-foreground">
                            অর্থ: <RenderMath text={q.meaning} />
                          </span>
                        )}
                      </div>
                    ) : category === "MAKE_QUESTION" ? (
                      <div className="flex flex-col gap-1">
                        <RenderMath text={`${q.statement || q.content || ""}${q.clue ? ` (${q.clue})` : ""}`} />
                        {q.answer && (
                          <span className="text-[11px] text-muted-foreground">
                            Ans: <RenderMath text={q.answer} />
                          </span>
                        )}
                      </div>
                    ) : category === "VERB_TENSE" ? (
                      <div className="flex flex-col gap-0.5">
                        <RenderMath text={q.verb || q.word || q.title || q.name || ""} />
                      </div>
                    ) : category === "JUKTOBORNO" ? (
                      <div className="flex flex-col gap-0.5 font-bold text-primary">
                        <RenderMath text={q.juktoborno || q.word || q.title || q.name || ""} />
                      </div>
                    ) : category === "EK_KOTHAY_PROKASH" ? (
                      <div className="flex flex-col gap-0.5 font-bold text-primary">
                        <RenderMath text={q.phrase || q.word || q.title || q.name || ""} />
                      </div>
                    ) : category === "FORM_FILLUP" ? (
                      <div className="flex flex-col gap-0.5">
                        <RenderMath text={q.scenario || q.title || "ফরম পূরণ"} />
                        {q.institution && (
                          <span className="text-[11px] text-muted-foreground font-semibold">
                            {q.institution}
                          </span>
                        )}
                      </div>
                    ) : category === "SHUDDHO_ASHUDDHO" ? (
                      <div className="flex flex-col gap-0.5">
                        <RenderMath text={q.sentence || ""} />
                        {q.answer && (
                          <span className="text-[11px] text-muted-foreground font-semibold">
                            উত্তর: {q.answer}
                          </span>
                        )}
                      </div>
                    ) : category === "DAN_BAM_MILKORON" ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-primary">
                          {isCurrentEnglish
                            ? `Matching (${q.leftColumn?.length || 0} rows)`
                            : `ডান-বাম মিলকরণ (${q.leftColumn?.length || 0} সারি)`}
                        </span>
                        {Array.isArray(q.leftColumn) && q.leftColumn[0] && (
                          <span className="text-[11px] text-muted-foreground line-clamp-1">
                            {q.leftColumn[0]} ↔ {q.rightColumn?.[0] || ""}
                          </span>
                        )}
                      </div>
                    ) : category === "REARRANGE" ? (
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-primary">
                          {isCurrentEnglish
                            ? `Rearrange (${q.options?.length || 0} sentences)`
                            : `পুনর্বিন্যাস (${toBengaliDigits(q.options?.length || 0)}টি বাক্য)`}
                        </span>
                        {Array.isArray(q.options) && q.options.length > 0 && (
                          <div className="space-y-1 mt-1 text-xs text-foreground font-medium">
                            {q.options.slice(0, 4).map((opt: string, i: number) => {
                              const optLabel = isCurrentEnglish
                                ? `(${String.fromCharCode(97 + i)})`
                                : `(${["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ", "ঝ", "ঞ"][i] || i + 1})`;
                              return (
                                <div key={i} className="flex items-start gap-1.5">
                                  <span className="font-bold text-primary shrink-0">{optLabel}</span>
                                  <span className="line-clamp-1">
                                    <RenderMath text={opt} />
                                  </span>
                                </div>
                              );
                            })}
                            {q.options.length > 4 && (
                              <span className="text-[11px] text-muted-foreground italic">
                                + {q.options.length - 4} {isCurrentEnglish ? "more sentences" : "টি আরও বাক্য"}
                              </span>
                            )}
                          </div>
                        )}
                        {q.answerKey && (
                          <span className="text-[11px] text-muted-foreground font-semibold mt-0.5 font-mono">
                            {isCurrentEnglish ? "Order: " : "ক্রম: "}{q.answerKey}
                          </span>
                        )}
                      </div>
                    ) : category === "SUMMARY" || category === "AMPLIFICATION" || category === "THOUGHT_EXPANSION" || category === "LETTER" || category === "APPLICATION" || category === "NEWS_REPORT" || category === "ESSAY" || category === "SHORT_COMPOSITION" ? (
                      <div className="flex flex-col gap-1">
                        <RenderMath text={q.title || q.name || ""} />
                        {q.wordLimit ? (
                          <span className="text-[10px] text-primary font-medium">
                            [{q.wordLimit} words]
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <RenderMath text={q.question || ""} isMath={q.isMath} />
                    )}
                    {category !== "REARRANGE" && Array.isArray(q.options) && q.options.length > 0 && (
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1.5 text-xs text-on-surface-variant font-medium">
                        {q.options.map((opt: string, i: number) => {
                          const optLabels = ["(ক)", "(খ)", "(গ)", "(ঘ)", "(ঙ)", "(চ)"];
                          return (
                            <div key={i} className="flex gap-1 items-start">
                              <span className="font-bold text-primary shrink-0">{optLabels[i] || `(${i + 1})`}</span>
                              <RenderMath text={opt} isMath={q.isMath} />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Attachments */}
                  <QuestionAttachments attachments={q.attachments} isMath={q.isMath} compact />


                  {/* References & Source */}
                  {((Array.isArray(q.reference) && q.reference.length > 0) || (q as any).source || (q as any).session) && (
                    <div className="flex flex-wrap items-center gap-1 mt-2 border-t border-outline-variant/30 pt-2">
                      {((q as any).source || (q as any).session) && (
                        <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-semibold border border-primary/20">
                          📚 {isCurrentEnglish ? translateTag((q as any).source || "Textbook") : ((q as any).source || "N/A")}
                          {(q as any).session ? ` (${isCurrentEnglish ? toEnglishDigits((q as any).session) : toBengaliDigits((q as any).session)})` : ""}
                        </span>
                      )}
                      {Array.isArray(q.reference) && q.reference.map((ref: string, rIdx: number) => (
                        <span key={rIdx} className="px-1.5 py-0.5 bg-muted text-[10px] font-medium rounded text-muted-foreground">
                          🏷️ {isCurrentEnglish ? translateTag(ref) : ref}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
