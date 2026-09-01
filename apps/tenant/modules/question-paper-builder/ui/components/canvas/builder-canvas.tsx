import React, { useEffect, useLayoutEffect, useState, useRef, useMemo } from "react";
import { useBuilderStore } from "../../../store/use-builder-store";
import { MCQBlock } from "../blocks/mcq-block";
import { CQBlock } from "../blocks/cq-block";
import { CSBlock } from "../blocks/cs-block";
import { ShortAnswerBlock } from "../blocks/short-answer-block";
import { ParagraphBlock } from "../blocks/paragraph-block";
import { AmplificationBlock } from "../blocks/amplification-block";
import { HeaderBlock } from "../blocks/header-block";
import { OMRBlock } from "../blocks/omr-block";
import { Button } from "@workspace/ui/components/button";
import { useQuestionPaperById, useQuestionPaperDistributionStatuses, useUpsertDistribution } from "@/modules/question-paper/services/use-question-paper";
import { toast } from "@workspace/ui/components/sonner";
import Link from "next/link";
import { X, Target, ArrowRight, ArrowLeft } from "lucide-react";

const PAPER_DIMENSIONS = {
  A4: { w: 210, h: 297 },
  Letter: { w: 216, h: 279 },
  Legal: { w: 216, h: 356 },
  A5: { w: 148, h: 210 },
};

const toBengaliDigits = (num: number | string): string => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .split("")
    .map((digit) => (/\d/.test(digit) ? bengaliDigits[parseInt(digit)] : digit))
    .join("");
};

import { PaperBlock } from "../../../types";

const DistActionBlock: React.FC<{ blockData: any }> = ({ blockData }) => {
  const isExporting = useBuilderStore((state) => state.isExporting);
  const setActiveTarget = useBuilderStore((state) => state.setActiveTarget);
  const { mutateAsync: upsertDistribution } = useUpsertDistribution();

  if (isExporting) return null;

  const { dist, status, statusInfo, paperId, prevSubSectionId, prevSubSectionTitle, nextSubSectionId, nextSubSectionTitle, sectionId, subSectionId } = blockData || {};

  const { data: paperQuery } = useQuestionPaperById(paperId);

  const sectionTotalProvided = Math.max(5, blockData?.secTotalProvided || dist.questionCount || 0);
  const otherSubOccupied = blockData?.otherSubOccupied ?? blockData?.otherSubAttemptSum ?? 0;
  const subRequired = blockData?.subQuestionsToAttempt ?? dist.questionsToAttempt ?? 1;

  const subPickLimit = blockData?.subPickLimit ?? Math.max(subRequired, sectionTotalProvided - otherSubOccupied);
  const targetLimit = subSectionId ? subPickLimit : (statusInfo?.targetCount || dist.questionCount || 0);

  const nameEn = (dist.questionTypeName || dist.questionType?.nameEn || "").toLowerCase();
  const nameBn = (dist.questionType?.nameBn || "").toLowerCase();
  const label = (dist.questionTypeLabel || dist.questionType?.label || "").toLowerCase();
  const code = (dist.questionType?.code || "").toLowerCase();

  let subTitleStr = "";
  if (subSectionId && paperQuery?.sections) {
    for (const sec of paperQuery.sections) {
      if (sec.subSections) {
        const matchingSub = sec.subSections.find((s: any) => s.id === subSectionId);
        if (matchingSub) {
          subTitleStr = `${matchingSub.title || ""} ${matchingSub.titleBn || ""} ${matchingSub.instructions || ""}`.toLowerCase();
          break;
        }
      }
    }
  }

  let secTitleStr = "";
  if (sectionId && paperQuery?.sections) {
    const matchingSec = paperQuery.sections.find((s: any) => s.id === sectionId);
    if (matchingSec) {
      secTitleStr = `${matchingSec.title || ""} ${matchingSec.titleBn || ""} ${matchingSec.instructions || ""}`.toLowerCase();
    }
  }

  const combinedStr = `${nameEn} ${nameBn} ${label} ${code} ${subTitleStr} ${secTitleStr}`.toLowerCase();

  const rawTypeName = (dist?.questionTypeName || dist?.questionType?.nameEn || "").trim().toUpperCase();
  const validCategories = ["MCQ", "CQ", "CS", "SA", "PARAGRAPH", "AMPLIFICATION"];

  let resolvedCategory = "MCQ";
  if (validCategories.includes(rawTypeName)) {
    resolvedCategory = rawTypeName as any;
  } else if (/\bcs\b/i.test(combinedStr) || combinedStr.includes("creative scenario") || combinedStr.includes("creative short") || combinedStr.includes("scenario") || combinedStr.includes("উদ্দীপক")) {
    resolvedCategory = "CS";
  } else if ((combinedStr.includes("creative") || combinedStr.includes("cq") || combinedStr.includes("সৃজনশীল")) && !combinedStr.includes("mcq")) {
    resolvedCategory = "CQ";
  } else if (combinedStr.includes("short") || combinedStr.includes("sa") || combinedStr.includes("সংক্ষিপ্ত")) {
    resolvedCategory = "SA";
  } else if (combinedStr.includes("paragraph") || combinedStr.includes("অনুচ্ছেদ")) {
    resolvedCategory = "PARAGRAPH";
  } else if (combinedStr.includes("amplification") || combinedStr.includes("ভাবসম্প্রসারণ")) {
    resolvedCategory = "AMPLIFICATION";
  }

  const queryParams = new URLSearchParams();
  if (sectionId) queryParams.set("sectionId", sectionId);
  if (subSectionId) queryParams.set("subSectionId", subSectionId);
  if (dist.questionTypeId) queryParams.set("questionTypeId", dist.questionTypeId);
  queryParams.set("category", resolvedCategory);
  if (targetLimit > 0) {
    queryParams.set("limit", String(targetLimit));
  }
  const pickUrl = `/question-papers/${paperId}/distributions/${dist.id}/pick` + 
    (queryParams.toString() ? `?${queryParams.toString()}` : "");

  const maxOptionCount = Math.max(1, dist.questionCount || statusInfo?.targetCount || 5);
  const currentAttempt = subSectionId 
    ? (blockData?.subQuestionsToAttempt ?? dist.questionsToAttempt ?? 1)
    : (dist.questionsToAttempt ?? dist.questionCount ?? 1);

  if (status !== "COMPLETED") {
    return (
      <div className="border-2 border-dashed border-primary/40 bg-primary/5 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center gap-2.5 text-center transition-colors hover:bg-primary/10 my-2 print:hidden">
        <p className="text-xs sm:text-sm font-semibold text-primary">
          {dist.questionType?.nameBn || dist.questionType?.nameEn} ({statusInfo?.addedCount || 0}/{statusInfo?.targetCount || dist.questionCount}টি)
        </p>

        {subSectionId && (
          <div className="flex items-center gap-1.5 text-xs text-primary font-semibold bg-background/90 px-3 py-1 rounded-full border border-primary/30 shadow-xs">
            <span>উত্তর দিতে হবে:</span>
            <select
              value={currentAttempt}
              onChange={async (e) => {
                const val = parseInt(e.target.value, 10);
                const sectionTotalRequired = blockData?.secTotalRequired || statusInfo?.targetCount || 3;
                const otherSubAttemptSum = blockData?.otherSubAttemptSum || 0;
                const maxAllowedTarget = Math.max(1, sectionTotalRequired - otherSubAttemptSum);

                if (val > maxAllowedTarget) {
                  toast.error(`ভুল মান: সেকশনের মোট আবশ্যক প্রশ্নের সংখ্যা (${toBengaliDigits(sectionTotalRequired)}টি) অতিক্রম করা যাবে না। এই উপ-বিভাগে সর্বোচ্চ ${toBengaliDigits(maxAllowedTarget)}টি উত্তর নির্ধারণ করতে পারবেন।`);
                  return;
                }

                try {
                  await upsertDistribution({
                    id: dist.id,
                    paperSubjectId: dist.paperSubjectId,
                    questionTypeId: dist.questionTypeId,
                    questionTypeName: resolvedCategory || dist.questionTypeName || dist.questionType?.nameBn || dist.questionType?.nameEn || "Question",
                    questionTypeLabel: dist.questionTypeLabel || undefined,
                    marksPerQuestion: dist.marksPerQuestion ?? 1,
                    questionCount: dist.questionCount ?? 1,
                    questionsToAttempt: val,
                    orderIndex: dist.orderIndex ?? 0,
                    sectionId: sectionId || dist.sectionId || undefined,
                    subSectionId: subSectionId || dist.subSectionId || undefined,
                  });
                  toast.success(`উত্তর দিতে হবে: ${toBengaliDigits(val)}টি নির্ধারিত হয়েছে`);
                } catch (err: any) {
                  toast.error(err?.message || "হালনাগাদ করতে ব্যর্থ হয়েছে");
                }
              }}
              className="bg-transparent font-bold cursor-pointer focus:outline-none text-primary"
            >
              {Array.from({ length: maxOptionCount }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{toBengaliDigits(n)}টি</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-2">
          {prevSubSectionId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveTarget({ sectionId: sectionId || null, subSectionId: prevSubSectionId })}
              className="rounded-full border-primary/40 text-primary hover:bg-primary/10 font-bold text-xs h-8 cursor-pointer flex items-center gap-1"
              title={`পূর্ববর্তী উপ-বিভাগে যান: ${prevSubSectionTitle}`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>পূর্ববর্তী</span>
            </Button>
          )}
          <Button asChild size="sm" className="rounded-full shadow-xs cursor-pointer font-bold">
            <Link href={pickUrl}>
              + প্রশ্ন নির্বাচন করুন
            </Link>
          </Button>
          {nextSubSectionId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveTarget({ sectionId: sectionId || null, subSectionId: nextSubSectionId })}
              className="rounded-full border-primary/40 text-primary hover:bg-primary/10 font-bold text-xs h-8 cursor-pointer flex items-center gap-1"
              title={`পরবর্তী উপ-বিভাগে যান: ${nextSubSectionTitle}`}
            >
              <span>পরবর্তী</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const BlockRenderer = ({ block }: { block: PaperBlock }) => {
  const isExporting = useBuilderStore((state) => state.isExporting);
  switch (block.type) {
    case "header-full":
    case "header-column":
      return <HeaderBlock />;
    case "subject-title": {
      const { nameBn, nameEn, subjectTotal } = block.data || {};
      const title = nameBn || nameEn || "";
      const totalMarksText = typeof subjectTotal === "number" || subjectTotal ? ` - ${toBengaliDigits(subjectTotal)}` : "";
      return (
        <h3 className="font-bold text-center text-base">
          {title}{totalMarksText}
        </h3>
      );
    }
    case "section-title": {
      const { id, sectionId, title, titleBn, instructions, hasQuestions, isSectionFilled } = block.data || {};
      const secId = id || sectionId;
      const activeSectionId = useBuilderStore((state) => state.activeSectionId);
      const activeSubSectionId = useBuilderStore((state) => state.activeSubSectionId);
      const setActiveTarget = useBuilderStore((state) => state.setActiveTarget);
      const dismissSection = useBuilderStore((state) => state.dismissSection);

      const isActive = !isSectionFilled && activeSectionId === secId && !activeSubSectionId;
      const formattedInst = instructions
        ? instructions.trim().startsWith("[") && instructions.trim().endsWith("]")
          ? instructions.trim()
          : `[${instructions.trim()}]`
        : null;

      return (
        <div 
          onClick={() => secId && setActiveTarget({ sectionId: secId, subSectionId: null })}
          className={`group relative w-full mt-6 mb-3 border-b border-on-surface/10 pb-1 flex flex-col items-center cursor-pointer transition-all ${
            isActive ? "bg-primary/5 ring-1 ring-primary/30 rounded px-2" : "hover:bg-muted/20"
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-6"></div>
            <h3 className="font-bold text-base text-center flex-1">
              {titleBn || title}
              {isActive && (
                <span className="ml-2 text-[9px] bg-primary text-white font-normal px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 print:hidden">
                  <Target className="w-2.5 h-2.5" /> নির্বাচনযোগ্য
                </span>
              )}
            </h3>
            {!hasQuestions && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (secId) dismissSection(secId);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded print:hidden"
                title="বিভাগ বন্ধ করুন"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {formattedInst && (
            <p className="text-[9px] text-muted-foreground italic text-center mt-0.5">{formattedInst}</p>
          )}
        </div>
      );
    }
    case "sub-section-title": {
      const { id, subSectionId, sectionId, title, titleBn, instructions, nextSubSectionId, nextSubSectionTitle, hasQuestions, hideTitle, isSectionFilled } = block.data || {};
      const subId = id || subSectionId;
      const activeSubSectionId = useBuilderStore((state) => state.activeSubSectionId);
      const setActiveTarget = useBuilderStore((state) => state.setActiveTarget);
      const dismissSubSection = useBuilderStore((state) => state.dismissSubSection);

      const isActive = !isSectionFilled && activeSubSectionId === subId;
      const formattedInst = instructions
        ? instructions.trim().startsWith("[") && instructions.trim().endsWith("]")
          ? instructions.trim()
          : `[${instructions.trim()}]`
        : null;

      return (
        <div 
          onClick={() => subId && setActiveTarget({ sectionId: sectionId || null, subSectionId: subId })}
          className={`group relative w-full mt-4 mb-2 flex flex-col items-center cursor-pointer transition-all ${
            isActive ? "bg-primary/5 ring-1 ring-primary/30 rounded p-1" : "hover:bg-muted/20"
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-6"></div>
            <h4 className="font-semibold text-sm text-center flex-1">
              {titleBn || title}
              {isActive && (
                <span className="ml-2 text-[9px] bg-primary text-white font-normal px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 print:hidden">
                  <Target className="w-2.5 h-2.5" /> নির্বাচনযোগ্য
                </span>
              )}
            </h4>
            {!hasQuestions && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (subId) dismissSubSection(subId);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded print:hidden"
                  title="উপ-বিভাগ বন্ধ করুন"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
          {formattedInst && (
            <p className="text-[9px] text-muted-foreground italic text-center mt-0.5">{formattedInst}</p>
          )}
        </div>
      );
    }
    case "dist-title": {
      const { dist, attemptCount, totalProvided, isCq, isMcq } = block.data;
      if (isCq || (dist?.questionTypeLabel && dist.questionTypeLabel.trim() !== "")) return null;

      const instructionText = isCq && attemptCount < totalProvided && attemptCount > 0 
        ? `[${toBengaliDigits(totalProvided)}টি প্রশ্ন থেকে যে কোনো ${toBengaliDigits(attemptCount)}টি প্রশ্নের উত্তর দাও]`
        : isCq && block.data.questionsLen > attemptCount && attemptCount > 0 
        ? `[যে কোনো ${toBengaliDigits(attemptCount)}টি প্রশ্নের উত্তর দাও]`
        : null;

      const titleText = isMcq ? "বহুনির্বাচনি অভীক্ষা" : (dist.questionType?.nameBn || dist.questionType?.nameEn);

      return (
        <div className="flex flex-col items-stretch w-full">
          {isMcq ? (
            <div className="flex justify-between items-center w-full">
              <div className="flex-1"></div>
              <div className="font-semibold text-center flex-[2]">{titleText}</div>
              <div className="flex-1 text-right font-bold whitespace-nowrap text-[12px] shrink-0">
                {toBengaliDigits(dist.marksPerQuestion || 1)} <span className="font-sans px-1">×</span> {toBengaliDigits(attemptCount || 1)} = {toBengaliDigits((dist.marksPerQuestion || 1) * (attemptCount || 1))}
              </div>
            </div>
          ) : (
            <>
              <div className="font-semibold text-center">
                {titleText}
              </div>
              {(instructionText || isCq) && (
                <div className="flex justify-between items-center text-[12px]">
                  <div className="flex-1"></div>
                  <div className="text-center font-normal flex-[2]">
                    {instructionText}
                  </div>
                  <div className="flex-1 text-right font-bold whitespace-nowrap shrink-0">
                    {isCq && (
                      <>
                        {toBengaliDigits(dist.marksPerQuestion || 10)} <span className="font-sans px-1">×</span> {toBengaliDigits(attemptCount || 1)} = {toBengaliDigits((dist.marksPerQuestion || 10) * (attemptCount || 1))}
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      );
    }
    case "question-mcq":
      return <MCQBlock item={block.data.item} hideContext={block.data.hideContext} contextInstruction={block.data.contextInstruction} />;
    case "question-cq":
      return <CQBlock item={block.data.item} />;
    case "question-cs":
      return <CSBlock item={block.data.item} />;
    case "question-short":
      return <ShortAnswerBlock item={block.data.item} />;
    case "question-paragraph":
      return <ParagraphBlock item={block.data.item} />;
    case "question-amplification":
      return <AmplificationBlock item={block.data.item} />;
    case "dist-action":
      return <DistActionBlock blockData={block.data} />;
    case "empty":
      if (isExporting) return null;
      return (
        <div className="text-center py-20 text-muted-foreground print:hidden border-2 border-dashed rounded-lg">
          কোনো বিষয় বা বণ্টন সাজানো হয়নি। অনুগ্রহ করে পাশের সেটিংস প্যানেল থেকে নম্বর বণ্টন প্রস্তুত করুন।
        </div>
      );
    default:
      return null;
  }
};

export const BuilderCanvas: React.FC = () => {
  const paperId = useBuilderStore((state) => state.paperId);
  const zoom = useBuilderStore((state) => state.zoom);
  const settings = useBuilderStore((state) => state.settings);
  const activeSectionId = useBuilderStore((state) => state.activeSectionId);
  const activeSubSectionId = useBuilderStore((state) => state.activeSubSectionId);
  const dismissedSectionIds = useBuilderStore((state) => state.dismissedSectionIds);
  const dismissedSubSectionIds = useBuilderStore((state) => state.dismissedSubSectionIds);

  const { data: paperQuery } = useQuestionPaperById(paperId || "");
  const { data: statuses } = useQuestionPaperDistributionStatuses(paperId || "");

  const [measuredHeights, setMeasuredHeights] = useState<Record<string, number>>({});
  const [pageContentHeight, setPageContentHeight] = useState<number>(0);
  const [autoZoom, setAutoZoom] = useState(1);
  const measureContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const dims = PAPER_DIMENSIONS[settings.paperSize as keyof typeof PAPER_DIMENSIONS] || PAPER_DIMENSIONS.A4;
  const canvasWidth = settings.paperOrientation === "portrait" ? dims.w : dims.h;
  const canvasMinHeight = settings.paperOrientation === "portrait" ? dims.h : dims.w;

  useLayoutEffect(() => {
    if (zoom !== "auto" || !containerRef.current) return;
    
    // The parent element (main tag) dictates the available width
    const parent = containerRef.current.parentElement;
    if (!parent) return;

    const updateZoom = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      // 1mm = 3.779527559px
      const canvasPx = canvasWidth * 3.78; 
      const padding = 64; // 32px padding on each side (p-8)
      let calculatedZoom = (width - padding - 4) / canvasPx; // Subtract 4px safety margin for rounding errors
      
      // Don't scale up past 100% on huge screens
      if (calculatedZoom > 1) calculatedZoom = 1;
      // Don't scale down past 30% to keep it readable
      if (calculatedZoom < 0.3) calculatedZoom = 0.3;
      
      setAutoZoom(calculatedZoom);
    };

    // Calculate synchronously on mount to avoid delay/layout flashes
    updateZoom();

    const observer = new ResizeObserver(updateZoom);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [zoom, canvasWidth]);

  const zoomFactor = zoom === "auto" ? autoZoom : zoom;

  const blocks = useMemo(() => {
    // 1. If this paper has pre-generated blocks (e.g. Generated Sets), render them immediately!
    if (settings.blocks && settings.blocks.length > 0) {
      return settings.blocks;
    }

    // 2. Otherwise, dynamically generate blocks from relations
    if (!paperQuery) return [];
    const newBlocks: PaperBlock[] = [];
    let globalWrittenNumber = 0;

    if (!settings.bookletMode || settings.columns === 1) {
      newBlocks.push({ id: "header-full", type: "header-full", data: null, gap: 0 });
    } else {
      newBlocks.push({ id: "header-column", type: "header-column", data: null, gap: 0 });
    }

    if (paperQuery.subjects?.length === 0) {
      newBlocks.push({ id: "empty", type: "empty", data: null, gap: 0 });
    }

    paperQuery.subjects?.forEach((subject: any) => {
      if (paperQuery.subjects.length > 1) {
        newBlocks.push({
          id: `subj-${subject.id}`,
          type: "subject-title",
          data: {
            nameBn: subject.subject?.nameBn || subject.subjectName,
            nameEn: subject.subject?.nameEn,
            subjectTotal: subject.subjectTotal,
          },
          gap: 0,
        });
      }

      const hasSections = paperQuery.sections && paperQuery.sections.length > 0;

      const renderDistribution = (dist: any, extraOptions?: { prevSubSectionId?: string; prevSubSectionTitle?: string; nextSubSectionId?: string; nextSubSectionTitle?: string; sectionId?: string; subSectionId?: string; showAction?: boolean; hideDistTitle?: boolean; maxAllowedTarget?: number; secTotalProvided?: number; secTotalRequired?: number; subPickLimit?: number; otherSubAttemptSum?: number; subQuestionsToAttempt?: number; otherSubOccupied?: number }) => {
        const statusInfo = statuses?.find((s: any) => s.distributionId === dist.id);
        const questions = (paperQuery.questions || []).filter((q: any) => {
          if (q.distributionId !== dist.id) return false;
          if (extraOptions?.subSectionId) {
            return q.subSectionId === extraOptions.subSectionId;
          }
          if (extraOptions?.sectionId) {
            return q.sectionId === extraOptions.sectionId && !q.subSectionId;
          }
          return true;
        });

        const totalProvided = Number(dist.questionCount || 0);
        const attemptCount = Number(dist.questionsToAttempt || totalProvided);
        const nameEn = dist.questionType?.nameEn?.toLowerCase() || "";
        const isCq = (!nameEn.includes("mcq") && (nameEn.includes("cq") || nameEn.includes("cs") || nameEn.includes("creative"))) || dist.questionType?.nameBn?.includes("সৃজনশীল");
        const isMcq = nameEn.includes("mcq") || nameEn.includes("multiple choice") || dist.questionType?.nameBn?.includes("বহুনির্বাচনি");
        const hasQuestionTypeLabel = Boolean(dist.questionTypeLabel && dist.questionTypeLabel.trim() !== "");
        const shouldHideDistTitle = extraOptions?.hideDistTitle || hasQuestionTypeLabel;

        const subPrefix = extraOptions?.subSectionId ? `-sub-${extraOptions.subSectionId}` : (extraOptions?.sectionId ? `-sec-${extraOptions.sectionId}` : "");

        if (!isCq && !shouldHideDistTitle) {
          newBlocks.push({
            id: `dist-${dist.id}${subPrefix}`,
            type: "dist-title",
            data: { dist, statusInfo, attemptCount, totalProvided, questionsLen: questions.length, isCq, isMcq },
            gap: 0
          });
        }

        questions.forEach((q: any, idx: number) => {
          if (q.mcq) {
            let hideContext = false;
            let contextInstruction = "";

            const currMcq = q.mcq as any;
            const currText = currMcq?.questionContext?.text || currMcq?.context;

            if (idx > 0 && questions[idx - 1]?.mcq) {
              const prevMcq = questions[idx - 1]?.mcq as any;
              const prevText = prevMcq?.questionContext?.text || prevMcq?.context;
              if (currText && prevText === currText) {
                hideContext = true;
              }
            }

            if (!hideContext && currText) {
              let sharedCount = 1;
              for (let j = idx + 1; j < questions.length; j++) {
                const nextMcq = questions[j]?.mcq as any;
                const nextText = nextMcq?.questionContext?.text || nextMcq?.context;
                if (nextText && nextText === currText) {
                  sharedCount++;
                } else {
                  break;
                }
              }
              const startNumBn = toBengaliDigits(idx + 1);
              if (sharedCount === 1) {
                contextInstruction = `নিচের উদ্দীপকের আলোকে ${startNumBn} নং প্রশ্নের উত্তর দাও:`;
              } else if (sharedCount === 2) {
                const endNumBn = toBengaliDigits(idx + 2);
                contextInstruction = `নিচের উদ্দীপকের আলোকে ${startNumBn} ও ${endNumBn} নং প্রশ্নগুলোর উত্তর দাও:`;
              } else {
                const endNumBn = toBengaliDigits(idx + sharedCount);
                contextInstruction = `নিচের উদ্দীপকের আলোকে ${startNumBn} - ${endNumBn} নং প্রশ্নগুলোর উত্তর দাও:`;
              }
            }

            newBlocks.push({
              id: `q-${q.id}`,
              type: "question-mcq",
              data: { item: { id: q.id, type: "MCQ", data: q.mcq, orderIndex: idx }, hideContext, contextInstruction },
              gap: 0
            });
          }
          if (q.cq) {
            globalWrittenNumber++;
            newBlocks.push({
              id: `q-${q.id}`,
              type: "question-cq",
              data: {
                item: {
                  id: q.id,
                  type: "CQ",
                  data: q.cq,
                  orderIndex: idx,
                  masterNumber: globalWrittenNumber,
                  distributionId: dist.id,
                  distribution: dist,
                  markDistribution: dist.markDistribution,
                },
              },
              gap: 4
            });
          }
          if (q.cs) {
            globalWrittenNumber++;
            newBlocks.push({
              id: `q-${q.id}`,
              type: "question-cs",
              data: {
                item: {
                  id: q.id,
                  type: "CS",
                  data: q.cs,
                  orderIndex: idx,
                  masterNumber: globalWrittenNumber,
                  distributionId: dist.id,
                  distribution: dist,
                  markDistribution: dist.markDistribution,
                },
              },
              gap: 4
            });
          }
          if (q.shortAnswer) {
            if (idx === 0) {
              globalWrittenNumber++;
            }
            newBlocks.push({
              id: `q-${q.id}`,
              type: "question-short",
              data: { item: { id: q.id, type: "SHORT", data: q.shortAnswer, orderIndex: idx, masterNumber: globalWrittenNumber, isFirstShortAnswer: idx === 0, totalQuestions: questions.length, attemptCount, marksPerQuestion: dist.marksPerQuestion } },
              gap: idx === questions.length - 1 ? 4 : 0
            });
          }
          if (q.paragraph) {
            if (idx === 0) {
              globalWrittenNumber++;
            }
            newBlocks.push({
              id: `q-${q.id}`,
              type: "question-paragraph",
              data: { 
                item: { 
                  id: q.id, 
                  type: "PARAGRAPH", 
                  data: q.paragraph, 
                  orderIndex: idx, 
                  masterNumber: globalWrittenNumber, 
                  isFirstParagraph: idx === 0, 
                  totalQuestions: questions.length, 
                  attemptCount,
                  marksPerQuestion: dist.marksPerQuestion,
                  questionTypeLabel: dist.questionTypeLabel || dist.questionType?.label || dist.questionType?.nameBn || dist.questionType?.nameEn || "অনুচ্ছেদ লিখ"
                } 
              },
              gap: idx === questions.length - 1 ? 4 : 0
            });
          }
          if (q.amplification) {
            globalWrittenNumber++;
            newBlocks.push({
              id: `q-${q.id}`,
              type: "question-amplification",
              data: { item: { id: q.id, type: "AMPLIFICATION", data: q.amplification, orderIndex: idx, masterNumber: globalWrittenNumber } },
              gap: 4
            });
          }
        });

        const targetCount = statusInfo?.targetCount || dist.questionCount || 0;
        const addedCount = statusInfo?.addedCount !== undefined ? statusInfo.addedCount : questions.length;
        const isDistCompleted = statusInfo?.status === "COMPLETED" || (targetCount > 0 && addedCount >= targetCount);

        const shouldShowAction = extraOptions?.showAction !== false && !isDistCompleted;
        if (shouldShowAction) {
          newBlocks.push({
            id: `action-${dist.id}${subPrefix}`,
            type: "dist-action",
            data: { 
              dist, 
              status: isDistCompleted ? "COMPLETED" : "ACTIVE", 
              statusInfo, 
              paperId,
              prevSubSectionId: extraOptions?.prevSubSectionId,
              prevSubSectionTitle: extraOptions?.prevSubSectionTitle,
              nextSubSectionId: extraOptions?.nextSubSectionId,
              sectionId: extraOptions?.sectionId || dist.sectionId,
              subSectionId: extraOptions?.subSectionId || dist.subSectionId,
              maxAllowedTarget: extraOptions?.maxAllowedTarget,
              secTotalProvided: extraOptions?.secTotalProvided,
              secTotalRequired: extraOptions?.secTotalRequired,
              subPickLimit: extraOptions?.subPickLimit,
              otherSubAttemptSum: extraOptions?.otherSubAttemptSum,
              subQuestionsToAttempt: extraOptions?.subQuestionsToAttempt,
              otherSubOccupied: extraOptions?.otherSubOccupied,
            },
            gap: 0
          });
        }
      };

      if (hasSections) {
        const subjectSections = (paperQuery.sections || []).filter((sec: any) => {
          if (dismissedSectionIds.includes(sec.id)) return false;

          if (paperQuery.subjects && paperQuery.subjects.length > 1) {
            const belongsToSubject = subject.distributions?.some(
              (d: any) => d.sectionId === sec.id || sec.subSections?.some((sub: any) => d.subSectionId === sub.id)
            );
            return belongsToSubject;
          }
          return true;
        });

        subjectSections.forEach((sec: any) => {
          const secQuestionsCount = paperQuery.questions?.filter((q: any) => {
            if (q.sectionId === sec.id) return true;
            return sec.subSections?.some((sub: any) => sub.id === q.subSectionId);
          }).length || 0;

          const secDists = subject.distributions?.filter(
            (d: any) => d.sectionId === sec.id || sec.subSections?.some((sub: any) => sub.id === d.subSectionId)
          ) || [];

          const secTotalProvided = Math.max(5, secDists.reduce((sum: number, d: any) => sum + (d.questionCount || 0), 0));
          const totalSectionTarget = secDists.reduce((sum: number, d: any) => {
            const st = statuses?.find((s: any) => s.distributionId === d.id);
            return sum + (st?.targetCount || d.questionCount || 0);
          }, 0);
          const secTotalRequired = totalSectionTarget > 0 ? totalSectionTarget : 7;

          const totalSectionAdded = secDists.reduce((sum: number, d: any) => {
            const st = statuses?.find((s: any) => s.distributionId === d.id);
            return sum + (st?.addedCount || 0);
          }, 0);

          const isSectionFilled = totalSectionTarget > 0 && totalSectionAdded >= totalSectionTarget;

          const validSubSections = (sec.subSections || []).filter((sub: any) => {
            if (dismissedSubSectionIds.includes(sub.id)) return false;

            const subQuestionsCount = paperQuery.questions?.filter((q: any) => q.subSectionId === sub.id).length || 0;
            if (isSectionFilled && subQuestionsCount === 0) {
              return false;
            }

            return true;
          });

          let finalSecInstruction = sec.instructions;
          if (validSubSections.length > 0) {
            const subRequiredSum = validSubSections.reduce((sum: number, sub: any) => {
              const subDists = subject.distributions?.filter((d: any) => d.subSectionId === sub.id) || [];
              const distAttempt = subDists.length > 0 ? subDists[0]?.questionsToAttempt : null;
              const req = sub.questionsToAttempt ?? distAttempt ?? 1;
              return sum + req;
            }, 0);

            const effectiveSecRequired = subRequiredSum > 0 ? subRequiredSum : secTotalRequired;

            const clauseParts = validSubSections.map((sub: any) => {
              const subDists = subject.distributions?.filter((d: any) => d.subSectionId === sub.id) || [];
              const distAttempt = subDists.length > 0 ? subDists[0]?.questionsToAttempt : null;
              const req = sub.questionsToAttempt ?? distAttempt ?? 1;
              const prov = subDists.length > 0 ? (subDists[0]?.questionCount || 0) : 0;
              const name = sub.titleBn || sub.title || "উপ-বিভাগ";

              if (prov > 0 && prov !== req) {
                return `${name} ${toBengaliDigits(prov)}টি প্রশ্ন থেকে ${toBengaliDigits(req)}টি`;
              }
              return `${name} থেকে ন্যূনতম ${toBengaliDigits(req)}টি`;
            });

            let clauseText = "";
            if (clauseParts.length === 1) {
              clauseText = (clauseParts[0] || "") + " প্রশ্নের উত্তর দিতে হবে।";
            } else if (clauseParts.length === 2) {
              clauseText = `${clauseParts[0]} এবং ${clauseParts[1]} করে মোট ${toBengaliDigits(effectiveSecRequired)}টি প্রশ্নের উত্তর দিতে হবে।`;
            } else {
              const copyParts = [...clauseParts];
              const lastClause = copyParts.pop();
              clauseText = `${copyParts.join(", ")} এবং ${lastClause} করে মোট ${toBengaliDigits(effectiveSecRequired)}টি প্রশ্নের উত্তর দিতে হবে।`;
            }

            const boardNotice = "দ্রষ্টব্য: ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক। প্রদত্ত উদ্দীপকগুলো মনোযোগ দিয়ে পড়ো এবং সংশ্লিষ্ট প্রশ্নগুলোর যথাযথ উত্তর দাও।";
            const grammarNotice = "একই প্রশ্নের উত্তরে সাধু ও চলিত ভাষারীতির মিশ্রণ দূষণীয়।";

            finalSecInstruction = `${boardNotice} ${clauseText} ${grammarNotice}`;
          }

          newBlocks.push({
            id: `subj-${subject.id}-sec-${sec.id}`,
            type: "section-title",
            data: { 
              id: sec.id, 
              sectionId: sec.id, 
              title: sec.title, 
              titleBn: sec.titleBn, 
              instructions: finalSecInstruction,
              hasQuestions: secQuestionsCount > 0,
              isSectionFilled,
            },
            gap: 0
          });

          if (validSubSections.length > 0) {
            const activeSub = validSubSections.find((s: any) => s.id === activeSubSectionId) || validSubSections[0];

            validSubSections.forEach((sub: any, subIndex: number) => {
              const prevSub = subIndex > 0 ? validSubSections[subIndex - 1] : null;
              const nextSub = subIndex < validSubSections.length - 1 ? validSubSections[subIndex + 1] : null;
              const isSubActive = sub.id === activeSub.id;
              const subQuestionsCount = paperQuery.questions?.filter((q: any) => q.subSectionId === sub.id).length || 0;

              const subDists = subject.distributions?.filter((d: any) => d.subSectionId === sub.id) || [];
              let targetDists = subDists;
              if (targetDists.length === 0) {
                const secDists = subject.distributions?.filter((d: any) => d.sectionId === sec.id) || subject.distributions || [];
                if (secDists[subIndex]) {
                  targetDists = [secDists[subIndex]];
                } else {
                  const subTitleStr = `${sub.title || ""} ${sub.titleBn || ""} ${sub.instructions || ""}`.toLowerCase();
                  const isSubCs = /\bcs\b/i.test(subTitleStr) || subTitleStr.includes("scenario") || subTitleStr.includes("সৃজনশীল");
                  const isSubMcq = subTitleStr.includes("mcq") || subTitleStr.includes("বহুনির্বাচনি");

                  if (isSubCs && !isSubMcq) {
                    const csDist = secDists.filter((d: any) => {
                      const nameEn = (d.questionTypeName || d.questionType?.nameEn || "").toLowerCase();
                      const nameBn = (d.questionType?.nameBn || "").toLowerCase();
                      const label = (d.questionTypeLabel || d.questionType?.label || "").toLowerCase();
                      const code = (d.questionType?.code || "").toLowerCase();
                      const dStr = `${nameEn} ${nameBn} ${label} ${code}`;
                      return /\bcs\b/i.test(dStr) || dStr.includes("scenario") || (dStr.includes("সৃজনশীল") && !dStr.includes("mcq")) || dStr.includes("creative");
                    });
                    targetDists = csDist.length > 0 ? csDist : (secDists[0] ? [secDists[0]] : secDists);
                  } else {
                    targetDists = secDists[0] ? [secDists[0]] : secDists;
                  }
                }
              }

              const hasQuestionTypeLabel = targetDists.some(
                (d: any) => Boolean(d.questionTypeLabel && d.questionTypeLabel.trim() !== "")
              );

              const otherSubAttemptSum = (sec.subSections || [])
                .filter((s: any) => s.id !== sub.id)
                .reduce((sum: number, s: any) => {
                  const sDists = subject.distributions?.filter((d: any) => d.subSectionId === s.id) || [];
                  const distAttempt = sDists.length > 0 ? sDists[0]?.questionsToAttempt : null;
                  const explicitAttempt = s.questionsToAttempt ?? distAttempt ?? 0;
                  return sum + explicitAttempt;
                }, 0);

              const otherSubAddedCount = (sec.subSections || [])
                .filter((s: any) => s.id !== sub.id)
                .reduce((sum: number, s: any) => {
                  const qCount = paperQuery.questions?.filter((q: any) => q.subSectionId === s.id).length || 0;
                  return sum + qCount;
                }, 0);

              const otherSubOccupied = Math.max(otherSubAttemptSum, otherSubAddedCount);

              const secRequiredTarget = totalSectionTarget > 0 ? totalSectionTarget : 3;

              const maxAllowedTarget = secRequiredTarget > 0 
                ? Math.max(1, secRequiredTarget - otherSubAttemptSum)
                : undefined;

              const subPickLimit = secTotalProvided > 0 
                ? Math.max(1, secTotalProvided - otherSubOccupied)
                : (targetDists[0]?.questionCount || 5);

              newBlocks.push({
                id: `subj-${subject.id}-sub-${sub.id}`,
                type: "sub-section-title",
                data: { 
                  id: sub.id, 
                  subSectionId: sub.id, 
                  sectionId: sec.id, 
                  title: sub.title, 
                  titleBn: sub.titleBn, 
                  instructions: sub.instructions,
                  nextSubSectionId: nextSub?.id,
                  nextSubSectionTitle: nextSub?.titleBn || nextSub?.title,
                  hasQuestions: subQuestionsCount > 0,
                  hideTitle: hasQuestionTypeLabel,
                  isSectionFilled,
                },
                gap: 0
              });

              targetDists.forEach((d: any) => renderDistribution(d, {
                prevSubSectionId: prevSub?.id,
                prevSubSectionTitle: prevSub?.titleBn || prevSub?.title,
                nextSubSectionId: nextSub?.id,
                nextSubSectionTitle: nextSub?.titleBn || nextSub?.title,
                sectionId: sec.id,
                subSectionId: sub.id,
                showAction: isSubActive && !isSectionFilled,
                maxAllowedTarget,
                secTotalProvided,
                secTotalRequired,
                subPickLimit,
                otherSubAttemptSum,
                subQuestionsToAttempt: sub.questionsToAttempt,
                otherSubOccupied,
              }));
            });
          } else {
            const secDists = subject.distributions?.filter((d: any) => d.sectionId === sec.id && !d.subSectionId) || [];
            secDists.forEach((d: any) => renderDistribution(d, {
              sectionId: sec.id,
              showAction: !isSectionFilled,
              hideDistTitle: true,
            }));
          }
        });

        const unassignedDists = subject.distributions?.filter((d: any) => !d.sectionId && !d.subSectionId) || [];
        if (unassignedDists.length > 0) {
          unassignedDists.forEach(renderDistribution);
        }
      } else {
        subject.distributions?.forEach(renderDistribution);
      }
    });

    return newBlocks;
  }, [paperQuery, statuses, settings.bookletMode, settings.columns, paperId, settings.blocks, dismissedSectionIds, dismissedSubSectionIds, activeSectionId, activeSubSectionId]);

  // Expose the calculated blocks to the store for GenerateSetsModal
  useEffect(() => {
    if (blocks && blocks.length > 0) {
      useBuilderStore.setState({ calculatedBlocks: blocks });
    }
  }, [blocks]);

  useEffect(() => {
    if (!measureContainerRef.current) return;
    
    // Measure available page content height
    const pageMeasurer = document.getElementById("page-content-measurer");
    if (pageMeasurer) {
      setPageContentHeight(pageMeasurer.getBoundingClientRect().height);
    }

    // Measure blocks
    const newHeights: Record<string, number> = {};
    blocks.forEach((b) => {
      const el = document.getElementById(`measure-block-${b.id}`);
      if (el) {
        // add a small buffer for safety to prevent actual overflow
        newHeights[b.id] = el.getBoundingClientRect().height + 4;
      }
    });
    setMeasuredHeights(newHeights);
  }, [blocks, settings.fontSize, settings.fontFamily, settings.margins, canvasMinHeight, settings.mcqOptionLayouts, settings.mcqOptionColumns, settings.itemStyles]);

  const pages = useMemo(() => {
    if (pageContentHeight === 0 || Object.keys(measuredHeights).length === 0) return [];

    const result: { fullHeader?: PaperBlock, columns: PaperBlock[][], isOMRPage?: boolean }[] = [];
    
    let currentPage: { fullHeader?: PaperBlock, columns: PaperBlock[][], isOMRPage?: boolean } = { 
      columns: Array.from({ length: settings.columns }, () => []) 
    };
    let currentColumnIdx = 0;
    let currentColumnHeight = 0;

    // If full header exists, put it on first page
    const fullHeaderBlock = blocks.find(b => b.type === "header-full");
    let availableHeight = pageContentHeight - 10; // 10px tolerance

    if (fullHeaderBlock) {
      currentPage.fullHeader = fullHeaderBlock;
      availableHeight -= (measuredHeights[fullHeaderBlock.id] || 0) + 32; // 32px for mt-8
    }

    const contentBlocks = blocks.filter(b => b.type !== "header-full");

    contentBlocks.forEach((b, idx) => {
      const h = measuredHeights[b.id] || 0;
      
      // If it's a heading, look ahead to see if the first question fits on this page
      let needsEarlyWrap = false;
      if (b.type === "dist-title" || b.type === "subject-title") {
        const nextBlock = contentBlocks[idx + 1];
        if (nextBlock && nextBlock.type.startsWith("question-")) {
          const hNext = measuredHeights[nextBlock.id] || 0;
          if (currentColumnHeight + h + hNext > availableHeight && currentColumnHeight > 0) {
            needsEarlyWrap = true;
          }
        }
      }
      
      // Check if adding this block exceeds column height
      if ((currentColumnHeight + h > availableHeight || needsEarlyWrap) && currentColumnHeight > 0) {
        currentColumnIdx++;
        currentColumnHeight = 0;
        
        if (currentColumnIdx >= settings.columns) {
          result.push(currentPage);
          currentPage = { columns: Array.from({ length: settings.columns }, () => []) };
          currentColumnIdx = 0;
          availableHeight = pageContentHeight - 10;
        }
      }
      
      currentPage.columns[currentColumnIdx]?.push(b);
      currentColumnHeight += h + (b.gap || 0);
    });

    if (currentPage.columns.some(col => col.length > 0) || currentPage.fullHeader) {
      result.push(currentPage);
    }
    
    if (settings.showOMRSheet) {
      result.push({ isOMRPage: true, columns: [] });
    }

    return result;
  }, [blocks, measuredHeights, pageContentHeight, settings.columns, settings.showOMRSheet]);



  const renderPage = (page: typeof pages[0] & { isBlank?: boolean }, seqIndex: number) => {
    return (
      <div 
        key={`page-renderer-${seqIndex}`}
        className="bg-white shadow-xl relative shrink-0 border border-slate-200/80"
        data-page-content="true"
        data-page-seq-index={seqIndex}
        style={{
          width: `${canvasWidth}mm`,
          minHeight: `${canvasMinHeight}mm`,
          transform: `scale(${zoomFactor})`,
          transformOrigin: "top left",
          paddingTop: (page.isOMRPage || page.isBlank) ? '0mm' : `${settings.margins.top}mm`,
          paddingBottom: (page.isOMRPage || page.isBlank) ? '0mm' : `${settings.margins.bottom}mm`,
          paddingLeft: (page.isOMRPage || page.isBlank) ? '0mm' : `${settings.margins.left}mm`,
          paddingRight: (page.isOMRPage || page.isBlank) ? '0mm' : `${settings.margins.right}mm`,
          fontFamily: settings.fontFamily,
          fontSize: `${settings.fontSize}px`,
        }}
      >
        {settings.showWatermark && !page.isBlank && (settings.watermark || settings.institutionName) && (
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none"
            style={{ zIndex: 0 }}
          >
            <div 
              className="font-bold whitespace-nowrap text-black/10"
              style={{ 
                fontSize: '100px', 
                transform: 'rotate(-45deg)',
              }}
            >
              {settings.watermark || settings.institutionName}
            </div>
          </div>
        )}
        
        <div className="relative z-10 w-full h-full flex flex-col">
          {page.isBlank ? (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/60 text-sm italic select-none">
              খালি পৃষ্ঠা (Blank Page)
            </div>
          ) : page.isOMRPage ? (
            <OMRBlock />
          ) : (
            <>
              {page.fullHeader && (
                <div className="mb-8">
                  <BlockRenderer block={page.fullHeader} />
                </div>
              )}
              
              <div 
                className="flex h-full"
                style={{ gap: "40px" }}
              >
                {page.columns.map((col, colIdx) => (
                  <div 
                    key={`col-${colIdx}`} 
                    className="flex-1 flex flex-col"
                    style={{ 
                      borderRight: (settings.showColumnDivider && colIdx < page.columns.length - 1) ? "1px solid #e2e8f0" : "none",
                      paddingRight: (settings.showColumnDivider && colIdx < page.columns.length - 1) ? "20px" : "0",
                      marginRight: (settings.showColumnDivider && colIdx < page.columns.length - 1) ? "-20px" : "0",
                    }}
                  >
                    {col.map(b => (
                      <div key={b.id} className="w-full" style={{ marginBottom: `${b.gap || 0}px` }}>
                        <BlockRenderer block={b} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* WYSIWYG Marketing Footer */}
        <div 
          className="absolute left-0 right-0 text-center text-[10px] text-black/40 italic pointer-events-none select-none"
          style={{ bottom: '8px' }}
        >
          Generated via Shikhonary
        </div>
      </div>
    );
  };

  if (!paperQuery) return null;

  return (
    <div ref={containerRef} id="print-container" className="w-full h-full overflow-auto p-8 pb-24 flex flex-col items-center gap-12 print:p-0 print:gap-0 print:block print:overflow-visible bg-slate-100 print:bg-white">
      
      {/* Invisible Measurement Container */}
      <div 
        ref={measureContainerRef} 
        className="absolute top-[-9999px] left-[-9999px] opacity-0 pointer-events-none print:hidden"
        style={{
          width: `${canvasWidth}mm`,
          fontFamily: settings.fontFamily,
          fontSize: `${settings.fontSize}px`,
          paddingTop: `${settings.margins.top}mm`,
          paddingBottom: `${settings.margins.bottom}mm`,
          paddingLeft: `${settings.margins.left}mm`,
          paddingRight: `${settings.margins.right}mm`,
        }}
      >
        <div id="page-content-measurer" style={{ height: `${canvasMinHeight}mm` }} className="w-full"></div>
        {/* We need the column width for accurate text wrapping measurements */}
        <div style={{ width: settings.columns > 1 ? `calc((100% - 40px) / ${settings.columns})` : '100%' }}>
          {blocks.map((b, idx) => (
            <div key={`measure-${b.id}-${idx}`} id={`measure-block-${b.id}`}>
              <BlockRenderer block={b} />
            </div>
          ))}
        </div>
      </div>

      {/* WYSIWYG Editor Layout (Hidden in Print) */}
      <div className="flex flex-col items-center gap-12 print:hidden">
        {pages.map((page, pageIdx) => (
          <div
            key={`page-wrapper-${pageIdx}`}
            className="shrink-0 flex flex-col items-center gap-3"
            data-page-index={pageIdx}
          >
            {settings.bookFoldLayout ? (
              <div className="text-xs font-semibold text-muted-foreground bg-white/80 shadow-sm border px-3 py-1 rounded-md select-none">
                বুকলেট পৃষ্ঠা - {pageIdx + 1} (Booklet Page {pageIdx + 1})
              </div>
            ) : (
              <div className="text-xs font-semibold text-muted-foreground bg-white/80 shadow-sm border px-3 py-1 rounded-md select-none">
                পৃষ্ঠা - {pageIdx + 1} (Page {pageIdx + 1})
              </div>
            )}
            <div
              style={{
                width: `${canvasWidth * 3.78 * zoomFactor}px`,
                height: `${canvasMinHeight * 3.78 * zoomFactor}px`,
                position: "relative",
                overflow: "visible",
              }}
            >
              {renderPage(page, pageIdx)}
            </div>
          </div>
        ))}
      </div>

      {/* Native Browser Print Layout (Hidden in UI) */}
      <style type="text/css" media="print">
        {`
          @page {
            size: ${settings.paperSize || 'A4'} ${settings.paperOrientation || 'portrait'};
            margin: 0 !important;
          }
        `}
      </style>
      <div 
        className="hidden print:block w-full bg-white text-black"
        style={{
          fontFamily: settings.fontFamily,
          fontSize: `${settings.fontSize}px`,
        }}
      >
        {settings.showWatermark && (settings.watermark || settings.institutionName) && (
          <div 
            className="fixed inset-0 flex items-center justify-center pointer-events-none select-none z-0"
          >
            <div 
              className="font-bold whitespace-nowrap text-black/10"
              style={{ 
                fontSize: '100px', 
                transform: 'rotate(-45deg)',
              }}
            >
              {settings.watermark || settings.institutionName}
            </div>
          </div>
        )}

        <table className="w-full">
          <thead>
            <tr>
              <td style={{ height: `${settings.margins.top}mm` }}></td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ 
                paddingLeft: `${settings.margins.left}mm`, 
                paddingRight: `${settings.margins.right}mm` 
              }}>
                <div className="relative z-10 w-full">
                  {blocks.filter(b => b.type === "header-full").map(b => (
                    <div key={`print-header-${b.id}`} className="mb-8 w-full">
                      <BlockRenderer block={b} />
                    </div>
                  ))}

                  <div style={{ 
                    columnCount: settings.columns, 
                    columnGap: '40px',
                    columnRule: settings.showColumnDivider ? '1px solid #e2e8f0' : 'none'
                  }}>
                    {blocks.filter(b => b.type !== "header-full").map((b, idx) => {
                      const blockBreak = settings.blockBreaks?.[b.id] || "none";
                      const breakClass = blockBreak === "page" ? "break-before-page" : blockBreak === "column" ? "break-before-column" : "break-inside-avoid";
                      
                      return (
                        <div key={`print-block-${b.id}-${idx}`} className={`w-full ${breakClass}`} style={{ marginBottom: `${b.gap || 0}px` }}>
                          <BlockRenderer block={b} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td style={{ height: `${settings.margins.bottom}mm`, verticalAlign: 'bottom', paddingBottom: '8px' }}>
                <div className="text-center text-[10px] text-black/40 italic w-full">
                  Generated via Shikhonary
                </div>
              </td>
            </tr>
          </tfoot>
        </table>

        {/* OMR Block is placed outside the margin-constrained table to span the full edge-to-edge width! */}
        {settings.showOMRSheet && (
          <div className="break-before-page w-full bg-white relative">
            <OMRBlock />
          </div>
        )}
      </div>
    </div>
  );
};
