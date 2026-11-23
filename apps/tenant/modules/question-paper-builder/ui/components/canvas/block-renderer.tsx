import React from "react";
import { PaperBlock, isBlockCompletelyHidden } from "../../../types";
import { useBuilderStore } from "../../../store/use-builder-store";
import { toBengaliDigits } from "@workspace/utils";
import { MCQBlock } from "../blocks/mcq-block";
import { CQBlock } from "../blocks/cq-block";
import { CSBlock } from "../blocks/cs-block";
import { PBQBlock } from "../blocks/pbq-block";
import { ShortAnswerBlock } from "../blocks/short-answer-block";
import { ParagraphBlock } from "../blocks/paragraph-block";
import { EssenceBlock } from "../blocks/essence-block";
import { PoemEssenceBlock } from "../blocks/poem-essence-block";
import { FormFillupBlock } from "../blocks/form-fillup-block";
import { ProseEssenceBlock } from "../blocks/prose-essence-block";
import { PoemBlock } from "../blocks/poem-block";
import { SummaryBlock } from "../blocks/summary-block";
import { AmplificationBlock } from "../blocks/amplification-block";
import { LetterBlock } from "../blocks/letter-block";
import { ApplicationBlock } from "../blocks/application-block";
import { MathQuestionBlock } from "../blocks/math-question-block";
import { GrammarQuestionBlock } from "../blocks/grammar-question-block";
import { SeenComprehensionBlock } from "../blocks/seen-comprehension-block";
import { NewsReportBlock } from "../blocks/news-report-block";
import { EssayBlock } from "../blocks/essay-block";
import { NumberInWordsBlock } from "../blocks/number-in-words-block";
import { WordMeaningBlock } from "../blocks/word-meaning-block";
import { MakeSentenceBlock } from "../blocks/make-sentence-block";
import { MakeQuestionBlock } from "../blocks/make-question-block";
import { OppositeWordBlock } from "../blocks/opposite-word-block";
import { GenderChangeBlock } from "../blocks/gender-change-block";
import { JuktobornoBlock } from "../blocks/juktoborno-block";
import { EkKothayProkashBlock } from "../blocks/ek-kothay-prokash-block";
import { SynonymBlock } from "../blocks/synonym-block";
import { SadhuToCholitoBlock } from "../blocks/sadhu-to-cholito-block";
import { PodNirnoyBlock } from "../blocks/pod-nirnoy-block";
import { VerbTenseBlock } from "../blocks/verb-tense-block";
import { PartsOfSpeechBlock } from "../blocks/parts-of-speech-block";
import { RightFormOfVerbBlock } from "../blocks/right-form-of-verb-block";
import { ChangingSentenceBlock } from "../blocks/changing-sentence-block";
import { FillInTheBlanksWithCluesBlock } from "../blocks/fill-in-the-blanks-with-clues-block";
import { FillInTheBlanksWithoutCluesBlock } from "../blocks/fill-in-the-blanks-without-clues-block";
import { SubstitutionTableBlock } from "../blocks/substitution-table-block";
import { PunctuationBlock } from "../blocks/punctuation-block";
import { ShortCompositionBlock } from "../blocks/short-composition-block";
import { DescriptiveQuestionBlock } from "../blocks/descriptive-question-block";
import { ShortQuestionBlock } from "../blocks/short-question-block";
import { ShuddhoAshuddhoBlock } from "../blocks/shuddho-ashuddho-block";
import { DanBamMilkoronBlock } from "../blocks/dan-bam-milkoron-block";
import { RearrangeBlock } from "../blocks/rearrange-block";
import { CorrectAnswerBlock } from "../blocks/correct-answer-block";
import { HeaderBlock } from "../blocks/header-block";
import { DistActionBlock } from "./dist-action-block";
import { X, Target, Eye, EyeOff } from "lucide-react";
import { useDeleteSubSection } from "@/modules/question-paper/services/use-question-paper";
import { toast } from "sonner";
import { cn } from "@workspace/ui/lib/utils";

const SectionTitleBlock = ({ data }: { data: any }) => {
  const { id, sectionId, title, titleBn, instructions, hasQuestions, isSectionFilled, isFirstSection } = data || {};
  const secId = id || sectionId;
  const isExporting = useBuilderStore((state) => state.isExporting);
  const activeSectionId = useBuilderStore((state) => state.activeSectionId);
  const activeSubSectionId = useBuilderStore((state) => state.activeSubSectionId);
  const setActiveTarget = useBuilderStore((state) => state.setActiveTarget);
  const settings = useBuilderStore((state) => state.settings);
  const updateSettings = useBuilderStore((state) => state.updateSettings);

  const isActive = !isSectionFilled && activeSectionId === secId && !activeSubSectionId;

  const rawTitle = (titleBn || title)?.trim() || "";
  const isGenericSection = rawTitle.toLowerCase() === "section";
  const hasTitle = Boolean(rawTitle && !isGenericSection);

  const rawInst = typeof instructions === "string" ? instructions.trim() : "";
  const hasInstruction = Boolean(rawInst);
  const formattedInst = hasInstruction
    ? rawInst.startsWith("[") && rawInst.endsWith("]")
      ? rawInst
      : rawInst.startsWith("(") && rawInst.endsWith(")")
      ? rawInst
      : `[${rawInst}]`
    : null;

  const isTitleHidden = Boolean(secId && settings.hiddenSectionTitleIds?.includes(secId));
  const isInstructionHidden = Boolean(secId && settings.hiddenSectionInstructionIds?.includes(secId));

  const showTitle = hasTitle && !isTitleHidden;
  const showInstruction = hasInstruction && !isInstructionHidden;

  const toggleTitle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!secId) return;
    const current = new Set(settings.hiddenSectionTitleIds || []);
    if (current.has(secId)) {
      current.delete(secId);
      toast.success("সেকশন শিরোনাম দৃশ্যমান করা হয়েছে");
    } else {
      current.add(secId);
      toast.info("সেকশন শিরোনাম লুকানো হয়েছে");
    }
    updateSettings({ hiddenSectionTitleIds: Array.from(current) });
  };

  const toggleInstruction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!secId) return;
    const current = new Set(settings.hiddenSectionInstructionIds || []);
    if (current.has(secId)) {
      current.delete(secId);
      toast.success("সেকশন নির্দেশিকা দৃশ্যমান করা হয়েছে");
    } else {
      current.add(secId);
      toast.info("সেকশন নির্দেশিকা লুকানো হয়েছে");
    }
    updateSettings({ hiddenSectionInstructionIds: Array.from(current) });
  };

  const renderActionControls = (mode: "floating" | "inline") => (
    <div
      className={cn(
        "z-20 flex items-center gap-1 transition-all print:hidden select-none",
        mode === "floating"
          ? "absolute -top-3.5 right-1 opacity-0 group-hover:opacity-100 bg-card/95 backdrop-blur-md border border-border shadow-md px-1.5 py-0.5 rounded-full text-[11px]"
          : "text-[11px]"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {hasTitle && (
        <button
          type="button"
          onClick={toggleTitle}
          title={showTitle ? "শিরোনাম লুকান" : "শিরোনাম দেখান"}
          className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full font-medium transition-colors cursor-pointer",
            showTitle
              ? "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              : "bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 font-bold"
          )}
        >
          {showTitle ? <Eye className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> : <EyeOff className="w-3 h-3 text-amber-600" />}
          <span>{showTitle ? "শিরোনাম" : "শিরোনাম লুকানো"}</span>
        </button>
      )}

      {hasInstruction && (
        <button
          type="button"
          onClick={toggleInstruction}
          title={showInstruction ? "নির্দেশিকা লুকান" : "নির্দেশিকা দেখান"}
          className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full font-medium transition-colors cursor-pointer",
            showInstruction
              ? "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              : "bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 font-bold"
          )}
        >
          {showInstruction ? <Eye className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> : <EyeOff className="w-3 h-3 text-amber-600" />}
          <span>{showInstruction ? "নির্দেশিকা" : "নির্দেশিকা লুকানো"}</span>
        </button>
      )}
    </div>
  );

  // Case 1: Neither title nor instruction visible on page
  if (!showTitle && !showInstruction) {
    if (isExporting) return null;
    return (
      <div
        onClick={() => secId && setActiveTarget({ sectionId: secId, subSectionId: null })}
        className={`group relative w-full my-1.5 py-1 px-2.5 flex items-center justify-between cursor-pointer border border-dashed rounded-xl print:hidden transition-all ${
          isActive
            ? "bg-primary/5 border-primary/40 ring-1 ring-primary/30"
            : "bg-muted/15 border-border/70 hover:bg-muted/30"
        }`}
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
          <EyeOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="font-bold text-foreground/85 font-headline">{rawTitle || "বিভাগ"}</span>
          <span className="text-[11px] text-muted-foreground">(হাইড করা সেকশন)</span>
          {isActive && (
            <span className="ml-1 text-[9px] bg-primary text-white font-normal px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5">
              <Target className="w-2.5 h-2.5" /> সিলেক্টেড সেকশন
            </span>
          )}
        </div>
        {renderActionControls("inline")}
      </div>
    );
  }

  // Case 2: Only instruction visible
  if (!showTitle && showInstruction) {
    return (
      <div 
        onClick={() => secId && setActiveTarget({ sectionId: secId, subSectionId: null })}
        className={`group relative w-full ${isFirstSection ? "mt-0" : "mt-4"} mb-2.5 flex flex-col items-center cursor-pointer transition-all ${
          isActive ? "bg-primary/5 ring-1 ring-primary/30 rounded px-2 py-0.5" : "hover:bg-muted/20"
        }`}
      >
        {renderActionControls("floating")}
        <div className="flex items-center justify-between w-full">
          <div className="w-6 print:hidden"></div>
          <div 
            className="font-semibold text-[12pt] text-center flex-1 italic text-black leading-normal font-body"
            style={{ color: "#000000" }}
          >
            {formattedInst}
            {isActive && (
              <span className="ml-2 text-[9px] bg-primary text-white font-normal px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 print:hidden not-italic">
                <Target className="w-2.5 h-2.5" /> সিলেক্টেড সেকশন
              </span>
            )}
          </div>
          <div className="w-6 print:hidden"></div>
        </div>
      </div>
    );
  }

  // Case 3: Title visible (and optional instruction)
  return (
    <div 
      onClick={() => secId && setActiveTarget({ sectionId: secId, subSectionId: null })}
      className={`group relative w-full ${isFirstSection ? "mt-0" : "mt-6"} mb-3 border-b border-black/10 pb-1 flex flex-col items-center cursor-pointer transition-all ${
        isActive ? "bg-primary/5 ring-1 ring-primary/30 rounded px-2" : "hover:bg-muted/20"
      }`}
    >
      {renderActionControls("floating")}
      <div className="flex items-center justify-between w-full">
        <div className="w-6 print:hidden"></div>
        <h3
          className="font-bold text-center flex-1 text-black"
          style={{
            fontSize: `${(settings.fontSize || 13) + 2}pt`,
            fontFamily: settings.fontFamily,
            color: "#000000",
          }}
        >
          {rawTitle}
          {isActive && (
            <span className="ml-2 text-[9px] bg-primary text-white font-normal px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 print:hidden">
              <Target className="w-2.5 h-2.5" /> সিলেক্টেড সেকশন
            </span>
          )}
        </h3>
        <div className="w-6 print:hidden"></div>
      </div>
      {showInstruction && formattedInst && (
        <p 
          className="text-[12pt] text-black italic text-center mt-0.5 font-body"
          style={{ color: "#000000" }}
        >
          {formattedInst}
        </p>
      )}
    </div>
  );
};

const SubSectionTitleBlock = ({ data }: { data: any }) => {
  const {
    id,
    subSectionId,
    sectionId,
    title,
    titleBn,
    instructions,
    prevSubSectionId,
    nextSubSectionId,
    nextSubSectionTitle,
    hasQuestions,
    hideTitle,
    isSectionFilled,
    isFirstSubSection,
    marksPerQuestion,
    attemptCount,
    showMarkDistribution,
    distName,
    isSharedQuestionType,
  } = data || {};
  const subId = id || subSectionId;
  const isExporting = useBuilderStore((state) => state.isExporting);
  const activeSubSectionId = useBuilderStore((state) => state.activeSubSectionId);
  const setActiveTarget = useBuilderStore((state) => state.setActiveTarget);
  const settings = useBuilderStore((state) => state.settings);
  const updateSettings = useBuilderStore((state) => state.updateSettings);
  const { mutateAsync: deleteSubSection } = useDeleteSubSection();

  const isActive = !isSectionFilled && activeSubSectionId === subId;
  const canDeleteSubSection = !hasQuestions;

  const rawSubTitle = (titleBn || title)?.trim() || "";
  const isGenericSub = !rawSubTitle || rawSubTitle.toLowerCase() === "sub-section" || rawSubTitle.toLowerCase() === "subsection";
  const displayTitle = !isGenericSub ? rawSubTitle : (isSharedQuestionType ? "" : (distName?.trim() || ""));
  const hasSubTitle = Boolean(displayTitle && !hideTitle);

  const formattedInst = !isSharedQuestionType && instructions
    ? instructions.trim().startsWith("(") && instructions.trim().endsWith(")")
      ? instructions.trim()
      : instructions.trim().startsWith("[") && instructions.trim().endsWith("]")
      ? `(${instructions.trim().slice(1, -1)})`
      : `(${instructions.trim()})`
    : null;

  const isSubTitleHidden = Boolean(subId && settings.hiddenSectionTitleIds?.includes(subId));
  const isSubInstructionHidden = Boolean(subId && settings.hiddenSectionInstructionIds?.includes(subId));

  const showSubTitle = hasSubTitle && !isSubTitleHidden;
  const showSubInstruction = Boolean(formattedInst) && !isSubInstructionHidden;

  const toggleSubTitle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!subId) return;
    const current = new Set(settings.hiddenSectionTitleIds || []);
    if (current.has(subId)) {
      current.delete(subId);
      toast.success("সাব-সেকশন শিরোনাম দেখানো হচ্ছে");
    } else {
      current.add(subId);
      toast.info("সাব-সেকশন শিরোনাম হাইড করা হয়েছে");
    }
    updateSettings({ hiddenSectionTitleIds: Array.from(current) });
  };

  const toggleSubInstruction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!subId) return;
    const current = new Set(settings.hiddenSectionInstructionIds || []);
    if (current.has(subId)) {
      current.delete(subId);
      toast.success("সাব-সেকশন নির্দেশিকা দেখানো হচ্ছে");
    } else {
      current.add(subId);
      toast.info("সাব-সেকশন নির্দেশিকা হাইড করা হয়েছে");
    }
    updateSettings({ hiddenSectionInstructionIds: Array.from(current) });
  };

  const marks = marksPerQuestion ? Number(marksPerQuestion) : 0;
  const attempts = attemptCount ? Number(attemptCount) : 0;
  const totalMarks = marks * attempts;
  const canShowMarkFormula = !isSharedQuestionType && showMarkDistribution !== false && marks > 0 && attempts > 0;
  const canShowBottomRow = Boolean((showSubInstruction && formattedInst) || canShowMarkFormula);

  const isCompletelyHidden = !showSubTitle && !showSubInstruction && !canShowMarkFormula;

  if (isCompletelyHidden) {
    if (isExporting) return null;
    return (
      <div
        onClick={() => subId && setActiveTarget({ sectionId: sectionId || null, subSectionId: subId })}
        className={`group relative w-full my-1 py-1 px-2.5 flex items-center justify-between cursor-pointer border border-dashed rounded-lg print:hidden transition-all ${
          isActive
            ? "bg-primary/5 border-primary/40 ring-1 ring-primary/30"
            : "bg-muted/15 border-border/70 hover:bg-muted/30"
        }`}
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
          <EyeOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="font-semibold text-foreground/85 font-headline">{displayTitle || "সাব-সেকশন"}</span>
          <span className="text-[11px] text-muted-foreground">(হাইড করা সাব-সেকশন)</span>
          {isActive && (
            <span className="ml-1 text-[9px] bg-primary text-white font-normal px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5">
              <Target className="w-2.5 h-2.5" /> সিলেক্টেড সাব-সেকশন
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {hasSubTitle && (
            <button
              type="button"
              onClick={toggleSubTitle}
              title="সাব-সেকশন শিরোনাম দেখান"
              className="p-1 rounded text-amber-600 bg-amber-50 dark:bg-amber-950/60 font-bold hover:bg-amber-100 flex items-center gap-0.5 cursor-pointer text-xs"
            >
              <EyeOff className="h-3 w-3" />
              <span>শিরোনাম</span>
            </button>
          )}
          {Boolean(formattedInst) && (
            <button
              type="button"
              onClick={toggleSubInstruction}
              title="সাব-সেকশন নির্দেশিকা দেখান"
              className="p-1 rounded text-amber-600 bg-amber-50 dark:bg-amber-950/60 font-bold hover:bg-amber-100 flex items-center gap-0.5 cursor-pointer text-xs"
            >
              <EyeOff className="h-3 w-3" />
              <span>নির্দেশিকা</span>
            </button>
          )}
          {canDeleteSubSection && (
            <button
              type="button"
              onClick={async (e) => {
                e.stopPropagation();
                if (subId && sectionId) {
                  try {
                    await deleteSubSection({ sectionId, id: subId });
                    toast.success("সাব-সেকশন ডিলিট করা হয়েছে");
                    if (nextSubSectionId) {
                      setActiveTarget({ sectionId: sectionId || null, subSectionId: nextSubSectionId });
                    } else if (prevSubSectionId) {
                      setActiveTarget({ sectionId: sectionId || null, subSectionId: prevSubSectionId });
                    } else {
                      setActiveTarget({ sectionId: sectionId || null, subSectionId: null });
                    }
                  } catch (err: any) {
                    toast.error(err?.message || "ডিলিট করা যায়নি");
                  }
                }
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded print:hidden"
              title="সাব-সেকশন ডিলিট"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => subId && setActiveTarget({ sectionId: sectionId || null, subSectionId: subId })}
      className={`group relative -mx-4 px-4 ${isFirstSubSection || !showSubTitle ? "mt-0.5" : "mt-3"} mb-1 flex flex-col items-start cursor-pointer transition-all ${
        isActive ? "bg-primary/5 ring-1 ring-primary/30 rounded" : "hover:bg-muted/20"
      }`}
    >
      {hasSubTitle ? (
        <div className={cn("flex items-center justify-between w-full", !showSubTitle && "print:hidden")}>
          <div className="w-6 print:hidden"></div>
          {showSubTitle ? (
            <h4
              className="font-semibold text-center flex-1 text-black"
              style={{
                fontSize: `${(settings.fontSize || 13) + 1}pt`,
                fontFamily: settings.fontFamily,
                color: "#000000",
              }}
            >
              {displayTitle}
              {isActive && (
                <span className="ml-2 text-[9px] bg-primary text-white font-normal px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 print:hidden">
                  <Target className="w-2.5 h-2.5" /> সিলেক্টেড সাব-সেকশন
                </span>
              )}
            </h4>
          ) : (
            <div className="flex-1 text-center print:hidden">
              <span className="text-[11px] text-muted-foreground italic">
                {displayTitle} (হাইড করা)
              </span>
            </div>
          )}
          <div className="flex items-center gap-1 print:hidden">
            <button
              type="button"
              onClick={toggleSubTitle}
              title={showSubTitle ? "সাব-সেকশন শিরোনাম হাইড করুন" : "সাব-সেকশন শিরোনাম দেখান"}
              className={cn(
                "p-1 rounded print:hidden transition-all flex items-center gap-0.5 cursor-pointer",
                showSubTitle
                  ? "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  : "opacity-100 text-amber-600 bg-amber-50 dark:bg-amber-950/60 font-bold"
              )}
            >
              {showSubTitle ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </button>
            {Boolean(formattedInst) && (
              <button
                type="button"
                onClick={toggleSubInstruction}
                title={showSubInstruction ? "সাব-সেকশন নির্দেশিকা হাইড করুন" : "সাব-সেকশন নির্দেশিকা দেখান"}
                className={cn(
                  "p-1 rounded print:hidden transition-all flex items-center gap-0.5 cursor-pointer",
                  showSubInstruction
                    ? "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    : "opacity-100 text-amber-600 bg-amber-50 dark:bg-amber-950/60 font-bold"
                )}
              >
                {showSubInstruction ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </button>
            )}
            {canDeleteSubSection && (
              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (subId && sectionId) {
                    try {
                      await deleteSubSection({ sectionId, id: subId });
                      toast.success("সাব-সেকশন ডিলিট করা হয়েছে");
                      if (nextSubSectionId) {
                        setActiveTarget({ sectionId: sectionId || null, subSectionId: nextSubSectionId });
                      } else if (prevSubSectionId) {
                        setActiveTarget({ sectionId: sectionId || null, subSectionId: prevSubSectionId });
                      } else {
                        setActiveTarget({ sectionId: sectionId || null, subSectionId: null });
                      }
                    } catch (err: any) {
                      toast.error(err?.message || "ডিলিট করা যায়নি");
                    }
                  }
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded print:hidden"
                title="সাব-সেকশন ডিলিট"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : isActive ? (
        <div className="flex items-center justify-between w-full print:hidden">
          <div className="w-6 print:hidden"></div>
          <span className="text-[10px] bg-primary text-white font-normal px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 mx-auto">
            <Target className="w-2.5 h-2.5" /> সিলেক্টেড সাব-সেকশন
          </span>
          {canDeleteSubSection ? (
            <button
              type="button"
              onClick={async (e) => {
                e.stopPropagation();
                if (subId && sectionId) {
                  try {
                    await deleteSubSection({ sectionId, id: subId });
                    toast.success("সাব-সেকশন ডিলিট করা হয়েছে");
                    if (nextSubSectionId) {
                      setActiveTarget({ sectionId: sectionId || null, subSectionId: nextSubSectionId });
                    } else if (prevSubSectionId) {
                      setActiveTarget({ sectionId: sectionId || null, subSectionId: prevSubSectionId });
                    } else {
                      setActiveTarget({ sectionId: sectionId || null, subSectionId: null });
                    }
                  } catch (err: any) {
                    toast.error(err?.message || "ডিলিট করা যায়নি");
                  }
                }
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded print:hidden"
              title="সাব-সেকশন ডিলিট"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <div className="w-6 print:hidden" />
          )}
        </div>
      ) : null}
      {canShowBottomRow && (
        <div className="flex justify-between items-center w-full mt-0.5 mb-0.5 text-black" style={{ color: "#000000" }}>
          <div className="text-left font-normal text-black text-[12pt] ml-[30px]" style={{ color: "#000000" }}>
            {showSubInstruction ? formattedInst : null}
          </div>
          {canShowMarkFormula && (
            <div className="text-right font-bold whitespace-nowrap shrink-0 text-black" style={{ color: "#000000" }}>
              {toBengaliDigits(marks)} <span className="font-sans px-1">×</span> {toBengaliDigits(attempts)} = {toBengaliDigits(totalMarks)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const DistTitleBlock = (_props: { data?: any }) => {
  return null;
};

const SubjectTitleBlock = ({ data }: { data: any }) => {
  const { nameBn, nameEn, subjectTotal } = data || {};
  const title = nameBn || nameEn || "";
  const totalMarksText = typeof subjectTotal === "number" || subjectTotal ? ` - ${toBengaliDigits(subjectTotal)}` : "";
  return (
    <h3 className="font-bold text-center text-base text-black" style={{ color: "#000000" }}>
      {title}{totalMarksText}
    </h3>
  );
};

const EmptyBlock = () => {
  const isExporting = useBuilderStore((state) => state.isExporting);
  if (isExporting) return null;
  return (
    <div className="text-center py-20 text-muted-foreground print:hidden border-2 border-dashed rounded-lg">
      কোনো বিষয় বা নম্বর বণ্টন যুক্ত করা হয়নি। অনুগ্রহ করে পাশের সেটিংস থেকে নম্বর বণ্টন সেটআপ করুন।
    </div>
  );
};

export const BlockRenderer = ({ block }: { block: PaperBlock }) => {
  const highlightedItemIds = useBuilderStore((state) => state.highlightedItemIds);
  const isHighlighted = Boolean(
    (block.id && highlightedItemIds?.includes(block.id)) ||
    (block.data?.item?.id && highlightedItemIds?.includes(block.data.item.id)) ||
    (block.data?.item?.questionId && highlightedItemIds?.includes(block.data.item.questionId)) ||
    (block.data?.distributionId && highlightedItemIds?.includes(block.data.distributionId))
  );

  const renderContent = () => {
    switch (block.type) {
    case "header-full":
    case "header-column":
      return <HeaderBlock />;
    case "subject-title":
      return <SubjectTitleBlock data={block.data} />;
    case "section-title":
      return <SectionTitleBlock data={block.data} />;
    case "sub-section-title":
      return <SubSectionTitleBlock data={block.data} />;
    case "dist-title":
      return null;
    case "question-mcq":
      return <MCQBlock item={block.data.item} hideContext={block.data.hideContext} contextInstruction={block.data.contextInstruction} />;
    case "question-cq":
      return <CQBlock item={block.data.item} />;
    case "question-cs":
      return <CSBlock item={block.data.item} />;
    case "question-pbq":
      return <PBQBlock item={block.data.item} />;
    case "question-short":
      return <ShortAnswerBlock item={block.data.item} />;
    case "question-paragraph":
      return <ParagraphBlock item={block.data.item} />;
    case "question-essence":
      return <EssenceBlock item={block.data.item} />;
    case "question-poem":
      return <PoemBlock item={block.data.item} />;
    case "question-summary":
      return <SummaryBlock item={block.data.item} />;
    case "question-amplification":
      return <AmplificationBlock item={block.data.item} />;
    case "question-letter":
      return <LetterBlock item={block.data.item} />;
    case "question-application":
      return <ApplicationBlock item={block.data.item} />;
    case "question-news-report":
      return <NewsReportBlock item={block.data.item} />;
    case "question-essay":
      return <EssayBlock item={block.data.item} />;
    case "question-poem-essence":
      return <PoemEssenceBlock item={block.data.item} />;
    case "question-form-fillup":
      return <FormFillupBlock item={block.data.item} />;
    case "question-prose-essence":
      return <ProseEssenceBlock item={block.data.item} />;
    case "question-number-in-words":
      return <NumberInWordsBlock item={block.data.item} />;
    case "question-word-meaning":
      return <WordMeaningBlock item={block.data.item} />;
    case "question-make-sentence":
      return <MakeSentenceBlock item={block.data.item} />;
    case "question-make-question":
      return <MakeQuestionBlock item={block.data.item} />;
    case "question-opposite-word":
      return <OppositeWordBlock item={block.data.item} />;
    case "question-gender-change":
      return <GenderChangeBlock item={block.data.item} />;
    case "question-juktoborno":
      return <JuktobornoBlock item={block.data.item} />;
    case "question-ek-kothay-prokash":
      return <EkKothayProkashBlock item={block.data.item} />;
    case "question-synonym":
      return <SynonymBlock item={block.data.item} />;
    case "question-sadhu-to-cholito":
      return <SadhuToCholitoBlock item={block.data.item} />;
    case "question-pod-nirnoy":
      return <PodNirnoyBlock item={block.data.item} />;
    case "question-verb-tense":
      return <VerbTenseBlock item={block.data.item} />;
    case "question-parts-of-speech":
      return <PartsOfSpeechBlock item={block.data.item} />;
    case "question-right-form-of-verb":
      return <RightFormOfVerbBlock item={block.data.item} />;
    case "question-changing-sentence":
      return <ChangingSentenceBlock item={block.data.item} />;
    case "question-fill-in-the-blanks-with-clues":
      return <FillInTheBlanksWithCluesBlock item={block.data.item} />;
    case "question-fill-in-the-blanks-without-clues":
      return <FillInTheBlanksWithoutCluesBlock item={block.data.item} />;
    case "question-substitution-table":
      return <SubstitutionTableBlock item={block.data.item} />;
    case "question-punctuation":
      return <PunctuationBlock item={block.data.item} />;
    case "question-short-composition":
      return <ShortCompositionBlock item={block.data.item} />;
    case "question-descriptive-question":
      return <DescriptiveQuestionBlock item={block.data.item} />;
    case "question-short-question":
      return <ShortQuestionBlock item={block.data.item} />;
    case "question-shuddho-ashuddho":
      return <ShuddhoAshuddhoBlock item={block.data.item} />;
    case "question-dan-bam-milkoron":
      return <DanBamMilkoronBlock item={block.data.item} />;
    case "question-rearrange":
      return <RearrangeBlock item={block.data.item} />;
    case "question-math-question":
      return <MathQuestionBlock item={block.data.item} />;
    case "question-grammar-question":
      return <GrammarQuestionBlock item={block.data.item} />;
    case "question-seen-comprehension":
      return <SeenComprehensionBlock item={block.data.item} />;
    case "question-correct-answer":
      return <CorrectAnswerBlock item={block.data.item} hideContext={block.data.hideContext} contextInstruction={block.data.contextInstruction} />;
    case "dist-action":
      return <DistActionBlock blockData={block.data} />;
    case "empty":
      return <EmptyBlock />;
    default:
      return null;
    }
  };

  const content = renderContent();
  if (!content) return null;

  if (isHighlighted) {
    return (
      <div className="relative rounded-md ring-2 ring-primary/80 bg-primary/10 transition-all duration-500 animate-pulse">
        {content}
      </div>
    );
  }

  return content;
};
