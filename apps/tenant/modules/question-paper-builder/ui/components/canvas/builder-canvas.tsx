import React, { useEffect, useLayoutEffect, useState, useRef, useMemo } from "react";
import { useBuilderStore } from "../../../store/use-builder-store";
import { BlockRenderer } from "./block-renderer";
import { OMRBlock } from "../blocks/omr-block";
import { useQuestionPaperById, useQuestionPaperDistributionStatuses } from "@/modules/question-paper/services/use-question-paper";

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

interface BuilderCanvasProps {
  paperId?: string;
  paper?: any;
}

export const BuilderCanvas: React.FC<BuilderCanvasProps> = ({ paperId: propPaperId, paper: propPaper }) => {
  const storePaperId = useBuilderStore((state) => state.paperId);
  const paperId = propPaperId || storePaperId;
  const zoom = useBuilderStore((state) => state.zoom);
  const settings = useBuilderStore((state) => state.settings);
  const activeSectionId = useBuilderStore((state) => state.activeSectionId);
  const activeSubSectionId = useBuilderStore((state) => state.activeSubSectionId);
  const dismissedSectionIds = useBuilderStore((state) => state.dismissedSectionIds || state.settings?.dismissedSectionIds || []);
  const dismissedSubSectionIds = useBuilderStore((state) => state.dismissedSubSectionIds || state.settings?.dismissedSubSectionIds || []);

  const { data: fetchedPaper } = useQuestionPaperById(paperId || "");
  const paperQuery = propPaper || fetchedPaper;
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
    const renderedQuestionIds = new Set<string>();
    let globalWrittenNumber = 0;
    let globalSectionIndex = 0;

    const isColumnHeader = settings.paperOrientation === "landscape" && settings.columns === 2;
    if (!isColumnHeader) {
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

      const subjectDistIds = new Set(subject.distributions?.map((d: any) => d.id) || []);
      const subjectSectionIds = new Set((paperQuery.sections || []).map((s: any) => s.id));
      const subjectSubSectionIds = new Set(
        (paperQuery.sections || []).flatMap((s: any) => (s.subSections || []).map((sub: any) => sub.id))
      );

      const subjectQuestions = (paperQuery.questions || []).filter((q: any) => {
        if (q.distributionId && subjectDistIds.has(q.distributionId)) return true;
        if (q.subSectionId && subjectSubSectionIds.has(q.subSectionId)) return true;
        if (q.sectionId && subjectSectionIds.has(q.sectionId)) return true;
        return false;
      });

      const hasSections = paperQuery.sections && paperQuery.sections.length > 0;

      const renderDistribution = (dist: any, extraOptions?: { prevSubSectionId?: string; prevSubSectionTitle?: string; nextSubSectionId?: string; nextSubSectionTitle?: string; sectionId?: string; subSectionId?: string; showAction?: boolean; hideDistTitle?: boolean; maxAllowedTarget?: number; secTotalProvided?: number; secTotalRequired?: number; subPickLimit?: number; otherSubAttemptSum?: number; subQuestionsToAttempt?: number; otherSubOccupied?: number; isSharedQuestionType?: boolean; siblingSubSectionIds?: string[] }) => {
        const statusInfo = statuses?.find((s: any) => s.distributionId === dist.id);
        const questions = subjectQuestions.filter((q: any) => {
          if (renderedQuestionIds.has(q.id)) return false;
          if (extraOptions?.subSectionId) {
            return q.subSectionId === extraOptions.subSectionId || (q.distributionId === dist.id && (!q.subSectionId || q.subSectionId === extraOptions.subSectionId));
          }
          if (extraOptions?.sectionId) {
            return (q.sectionId === extraOptions.sectionId && !q.subSectionId) || (q.distributionId === dist.id && !q.subSectionId);
          }
          return q.distributionId === dist.id;
        });

        const totalProvided = Number(dist.questionCount || 0);
        const attemptCount = Number(dist.questionsToAttempt || totalProvided);
        const nameEn = dist.questionType?.nameEn?.toLowerCase() || "";
        const isCq = (!nameEn.includes("mcq") && (nameEn.includes("cq") || nameEn.includes("cs") || nameEn.includes("creative"))) || dist.questionType?.nameBn?.includes("সৃজনশীল");
        const isMcq = nameEn.includes("mcq") || nameEn.includes("multiple choice") || dist.questionType?.nameBn?.includes("বহুনির্বাচনি");
        const hasQuestionTypeLabel = Boolean(dist.questionTypeLabel && dist.questionTypeLabel.trim() !== "");
        const shouldHideDistTitle = extraOptions?.hideDistTitle || hasQuestionTypeLabel;

        const subPrefix = extraOptions?.subSectionId ? `-sub-${extraOptions.subSectionId}` : (extraOptions?.sectionId ? `-sec-${extraOptions.sectionId}` : "");

        if (!shouldHideDistTitle && questions.length > 0) {
          newBlocks.push({
            id: `dist-${dist.id}${subPrefix}`,
            type: "dist-title",
            data: { dist, statusInfo, attemptCount, totalProvided, questionsLen: questions.length, isCq, isMcq },
            gap: 0
          });
        }

        questions.forEach((q: any, idx: number) => {
          if (renderedQuestionIds.has(q.id)) return;
          renderedQuestionIds.add(q.id);
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
                  alternatives: q.alternatives || [],
                  subjectId: subject.subjectId,
                  assignedMarks: q.assignedMarks,
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
                  alternatives: q.alternatives || [],
                  subjectId: subject.subjectId,
                  assignedMarks: q.assignedMarks,
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
              data: {
                item: {
                  id: q.id,
                  type: "SHORT",
                  data: q.shortAnswer,
                  orderIndex: idx,
                  masterNumber: globalWrittenNumber,
                  isFirstShortAnswer: idx === 0,
                  totalQuestions: questions.length,
                  attemptCount,
                  marksPerQuestion: dist.marksPerQuestion,
                  distributionId: dist.id,
                  distribution: dist,
                  markDistribution: dist.markDistribution,
                  alternatives: q.alternatives || [],
                  subjectId: subject.subjectId,
                  assignedMarks: q.assignedMarks,
                },
              },
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
                  questionTypeLabel: dist.questionTypeLabel || dist.questionType?.label || dist.questionType?.nameBn || dist.questionType?.nameEn || "অনুচ্ছেদ লিখ",
                  distributionId: dist.id,
                  distribution: dist,
                  markDistribution: dist.markDistribution,
                  alternatives: q.alternatives || [],
                  subjectId: subject.subjectId,
                  assignedMarks: q.assignedMarks,
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
              data: {
                item: {
                  id: q.id,
                  type: "AMPLIFICATION",
                  data: q.amplification,
                  orderIndex: idx,
                  masterNumber: globalWrittenNumber,
                  distributionId: dist.id,
                  distribution: dist,
                  markDistribution: dist.markDistribution,
                  alternatives: q.alternatives || [],
                  subjectId: subject.subjectId,
                  assignedMarks: q.assignedMarks,
                },
              },
              gap: 4
            });
          }
          if (q.letter) {
            globalWrittenNumber++;
            newBlocks.push({
              id: `q-${q.id}`,
              type: "question-letter",
              data: {
                item: {
                  id: q.id,
                  type: "LETTER",
                  data: q.letter,
                  orderIndex: idx,
                  masterNumber: globalWrittenNumber,
                  totalQuestions: questions.length,
                  attemptCount,
                  marksPerQuestion: dist.marksPerQuestion,
                  distributionId: dist.id,
                  distribution: dist,
                  markDistribution: dist.markDistribution,
                  alternatives: q.alternatives || [],
                  subjectId: subject.subjectId,
                  assignedMarks: q.assignedMarks,
                },
              },
              gap: 4
            });
          }
          if (q.application) {
            globalWrittenNumber++;
            newBlocks.push({
              id: `q-${q.id}`,
              type: "question-application",
              data: {
                item: {
                  id: q.id,
                  type: "APPLICATION",
                  data: q.application,
                  orderIndex: idx,
                  masterNumber: globalWrittenNumber,
                  totalQuestions: questions.length,
                  attemptCount,
                  marksPerQuestion: dist.marksPerQuestion,
                  distributionId: dist.id,
                  distribution: dist,
                  markDistribution: dist.markDistribution,
                  alternatives: q.alternatives || [],
                  subjectId: subject.subjectId,
                  assignedMarks: q.assignedMarks,
                },
              },
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
              isSharedQuestionType: extraOptions?.isSharedQuestionType,
              siblingSubSectionIds: extraOptions?.siblingSubSectionIds,
            },
            gap: 0
          });
        }
      };

      if (hasSections) {
        const subjectSections = (paperQuery.sections || []).filter((sec: any) => {
          if ((dismissedSectionIds || []).includes(sec.id)) return false;

          const belongsToSubject = subject.distributions?.some(
            (d: any) => d.sectionId === sec.id || d.subSections?.some((s: any) => sec.subSections?.some((sub: any) => sub.id === s.subSectionId))
          );
          const hasQuestionsInSec = subjectQuestions.some(
            (q: any) => q.sectionId === sec.id || sec.subSections?.some((sub: any) => sub.id === q.subSectionId)
          );

          if (!belongsToSubject && !hasQuestionsInSec) {
            return false;
          }

          return true;
        });

        subjectSections.forEach((sec: any) => {
          const secQuestionsCount = subjectQuestions.filter((q: any) => {
            if (q.sectionId === sec.id) return true;
            return sec.subSections?.some((sub: any) => sub.id === q.subSectionId);
          }).length;

          const secDists = subject.distributions?.filter(
            (d: any) => d.sectionId === sec.id || d.subSections?.some((s: any) => sec.subSections?.some((sub: any) => sub.id === s.subSectionId))
          ) || [];

          const distsProvidedSum = secDists.reduce((sum: number, d: any) => sum + (d.questionCount || 0), 0);
          const secTotalProvided = distsProvidedSum;
          const totalSectionTarget = secDists.reduce((sum: number, d: any) => {
            const st = statuses?.find((s: any) => s.distributionId === d.id);
            return sum + (st?.targetCount || d.questionCount || 0);
          }, 0);
          const secTotalRequired = sec.questionsToAttempt ?? (totalSectionTarget > 0 ? totalSectionTarget : secTotalProvided);

          const totalSectionAdded = secDists.reduce((sum: number, d: any) => {
            const st = statuses?.find((s: any) => s.distributionId === d.id);
            return sum + (st?.addedCount || 0);
          }, 0);

          const isSectionFilled = totalSectionTarget > 0 && totalSectionAdded >= totalSectionTarget;

          const validSubSections = (sec.subSections || []).filter((sub: any) => {
            if ((dismissedSubSectionIds || []).includes(sub.id)) return false;
            return true;
          });

          let finalSecInstruction = (sec.instructions && sec.instructions.trim() !== "") ? sec.instructions : null;

          if (validSubSections.length > 0) {
            const secReqSum = secDists.reduce((sum: number, d: any) => {
              const st = statuses?.find((s: any) => s.distributionId === d.id);
              return sum + (d.questionsToAttempt ?? st?.targetCount ?? d.questionCount ?? 0);
            }, 0);
            const secProvSum = secDists.reduce((sum: number, d: any) => sum + (d.questionCount || 0), 0);

            const reqCount = secReqSum > 0 ? secReqSum : secTotalRequired;
            const provCount = secProvSum > 0 ? secProvSum : secTotalProvided;

            // Compute active sub-section breakdowns
            const activeSubBreakdowns = validSubSections
              .filter((s: any) => (s.questionsToAttempt && s.questionsToAttempt > 0))
              .map((s: any) => {
                const name = s.titleBn || s.title || "";
                const count = toBengaliDigits(s.questionsToAttempt);
                return `${name} থেকে ${count}টি`;
              });

            let subSectionClauseBreakdown = "";
            let subSectionBracketBreakdown = "";

            if (activeSubBreakdowns.length > 0) {
              if (activeSubBreakdowns.length === 1) {
                subSectionClauseBreakdown = `${activeSubBreakdowns[0]} সহ`;
                subSectionBracketBreakdown = `${activeSubBreakdowns[0]} প্রশ্ন আবশ্যক`;
              } else {
                const allExceptLast = activeSubBreakdowns.slice(0, -1).join(", ");
                const last = activeSubBreakdowns[activeSubBreakdowns.length - 1];
                subSectionClauseBreakdown = `${allExceptLast} এবং ${last} সহ`;
                subSectionBracketBreakdown = `${allExceptLast} এবং ${last} প্রশ্ন আবশ্যক`;
              }
            }

            const prefix = "[দ্রষ্টব্য: ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক।";

            // Scenario 1: All questions are required (no optional choice)
            if (provCount > 0 && reqCount >= provCount) {
              finalSecInstruction = `${prefix} সবগুলো প্রশ্নের উত্তর দিতে হবে।]`;
            } 
            // Scenario 2: Optional choice with sub-section specific quotas
            else if (provCount > reqCount && activeSubBreakdowns.length > 0) {
              finalSecInstruction = `${prefix} মোট ${toBengaliDigits(reqCount)}টি প্রশ্নের উত্তর দিতে হবে। ${subSectionBracketBreakdown}]`;
            } 
            // Scenario 3: Optional choice without specific sub-section quotas
            else if (provCount > reqCount && reqCount > 0) {
              finalSecInstruction = `${prefix} যেকোনো ${toBengaliDigits(reqCount)}টি প্রশ্নের উত্তর দিতে হবে।]`;
            } 
            // Fallback
            else if (reqCount > 0) {
              finalSecInstruction = `${prefix} যেকোনো ${toBengaliDigits(reqCount)}টি প্রশ্নের উত্তর দিতে হবে।]`;
            }
          } else if (finalSecInstruction) {
            const secReqSum = secDists.reduce((sum: number, d: any) => {
              const st = statuses?.find((s: any) => s.distributionId === d.id);
              return sum + (d.questionsToAttempt ?? st?.targetCount ?? d.questionCount ?? 0);
            }, 0);
            const secProvSum = secDists.reduce((sum: number, d: any) => sum + (d.questionCount || 0), 0);

            const reqCount = secReqSum > 0 ? secReqSum : secTotalRequired;
            const provCount = secProvSum > 0 ? secProvSum : secTotalProvided;

            let updatedInst = finalSecInstruction;
            if (provCount > 0 && reqCount > 0 && (updatedInst.includes("প্রশ্ন থেকে") || updatedInst.includes("প্রশ্নের উত্তর"))) {
              updatedInst = updatedInst.replace(/([০-৯\d]+)টি প্রশ্ন থেকে\s*(যে কোনো|যেকোনো)?\s*([০-৯\d]+)টি/, `${toBengaliDigits(provCount)}টি প্রশ্ন থেকে যে কোনো ${toBengaliDigits(reqCount)}টি`);
            } else if (reqCount > 0 && (updatedInst.includes("যে কোনো") || updatedInst.includes("যেকোনো"))) {
              updatedInst = updatedInst.replace(/(যে কোনো|যেকোনো)\s*([০-৯\d]+)টি/, `যে কোনো ${toBengaliDigits(reqCount)}টি`);
            }
            finalSecInstruction = updatedInst;
          }

          const isFirstSection = globalSectionIndex === 0;
          globalSectionIndex++;

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
              isFirstSection,
            },
            gap: 0
          });

          if (validSubSections.length > 0) {
            const activeSub = (activeSubSectionId && validSubSections.find((s: any) => s.id === activeSubSectionId))
              || validSubSections[0];

            // Group sub-sections by unique title/structure so repeated sub-sections share their corresponding distribution
            const uniqueSubTitles: string[] = [];
            validSubSections.forEach((s: any) => {
              const key = (s.title || s.titleBn || s.id).trim().toLowerCase();
              if (!uniqueSubTitles.includes(key)) {
                uniqueSubTitles.push(key);
              }
            });

            const topicKeywords = [
              "সহপাঠ", "গদ্য", "কবিতা", "ব্যাকরণ", "নির্মিতি", 
              "পাটিগণিত", "বীজগণিত", "জ্যামিতি", "ত্রিকোণমিতি", "পরিসংখ্যান", 
              "পদার্থ", "রসায়ন", "জীববিজ্ঞান", "পৌরনীতি", "অর্থনীতি", "ইতিহাস", "ভূগোল"
            ];

            // Resolve which distribution matches each sub-section
            const subToDistMap = new Map<string, any>();
            validSubSections.forEach((s: any) => {
              const sSubStr = `${s.title || ""} ${s.titleBn || ""} ${s.instructions || ""}`.toLowerCase();
              const scored = secDists.map((d: any) => {
                let score = 10;
                const distStr = `${d.questionTypeLabel || ""} ${d.questionTypeName || ""} ${d.questionType?.nameBn || ""} ${d.questionType?.nameEn || ""}`.toLowerCase();
                for (const kw of topicKeywords) {
                  const distHasKw = distStr.includes(kw);
                  const subHasKw = sSubStr.includes(kw);
                  if (distHasKw && subHasKw) score += 150;
                  else if (distHasKw && !subHasKw) score -= 300;
                }
                if (d.subSections?.some((subRel: any) => subRel.subSectionId === s.id)) score += 1000;
                const hasAddedQ = subjectQuestions.some((q: any) => q.subSectionId === s.id && q.distributionId === d.id);
                if (hasAddedQ) score += 500;
                return { dist: d, score };
              });
              scored.sort((a: any, b: any) => b.score - a.score);
              const matchedDist = scored.length > 0 && scored[0].score > 0 ? scored[0].dist : (secDists[0] || null);
              subToDistMap.set(s.id, matchedDist);
            });

            validSubSections.forEach((sub: any, subIndex: number) => {
              const prevSub = subIndex > 0 ? validSubSections[subIndex - 1] : null;
              const nextSub = subIndex < validSubSections.length - 1 ? validSubSections[subIndex + 1] : null;
              const isSubActive = sub.id === activeSub.id;
              const subQuestionsCount = subjectQuestions.filter((q: any) => q.subSectionId === sub.id).length;

              const targetDist = subToDistMap.get(sub.id) || secDists[0];
              const targetDists = targetDist ? [targetDist] : [];

              const siblingSubSectionIds = validSubSections
                .filter((s: any) => {
                  const sDist = subToDistMap.get(s.id);
                  return sDist && targetDist && (sDist.id === targetDist.id || sDist.questionTypeId === targetDist.questionTypeId);
                })
                .map((s: any) => s.id);

              const isSharedQuestionType = siblingSubSectionIds.length > 1;

              const hasQuestionTypeLabel = targetDists.some(
                (d: any) => Boolean(d.questionTypeLabel && d.questionTypeLabel.trim() !== "")
              );

              const currDistTypeId = targetDist?.questionTypeId;

              const otherSubAttemptSum = validSubSections
                .filter((s: any) => s.id !== sub.id && siblingSubSectionIds.includes(s.id))
                .reduce((sum: number, s: any) => {
                  const explicitAttempt = (s.questionsToAttempt && s.questionsToAttempt > 0) ? s.questionsToAttempt : 0;
                  return sum + explicitAttempt;
                }, 0);

              const otherSubOccupied = validSubSections
                .filter((s: any) => s.id !== sub.id && siblingSubSectionIds.includes(s.id))
                .reduce((sum: number, s: any) => {
                  const qCount = subjectQuestions.filter((q: any) => q.subSectionId === s.id).length;
                  const sReq = (s.questionsToAttempt && s.questionsToAttempt > 0) ? s.questionsToAttempt : 0;
                  return sum + Math.max(qCount, sReq);
                }, 0);

              const secRequiredTarget = totalSectionTarget > 0 ? totalSectionTarget : secTotalRequired;

              const maxAllowedTarget = secRequiredTarget > 0 
                ? Math.max(1, secRequiredTarget - otherSubAttemptSum)
                : undefined;

              const subDist = targetDist;
              const subDistCount = subDist?.questionCount || 0;

              const secRemainingQuota = secTotalProvided > 0 
                ? Math.max(1, secTotalProvided - otherSubOccupied)
                : (subDistCount || 1);

              const subPickLimit = subDistCount > 0 
                ? Math.min(subDistCount, secRemainingQuota)
                : secRemainingQuota;

              const subDistAttempt = targetDist?.questionsToAttempt;
              const subReq = (sub.questionsToAttempt && sub.questionsToAttempt > 0) ? sub.questionsToAttempt : 0;
              const subProv = targetDist?.questionCount || 0;

              let finalSubInstruction = (sub.instructions && sub.instructions.trim() !== "") ? sub.instructions : null;
              if (finalSubInstruction) {
                if (subProv > 0 && subProv !== subReq && (finalSubInstruction.includes("প্রশ্ন থেকে") || finalSubInstruction.includes("প্রশ্নের উত্তর"))) {
                  finalSubInstruction = finalSubInstruction.replace(/([০-৯\d]+)টি প্রশ্ন থেকে\s*(যে কোনো|যেকোনো)?\s*([০-৯\d]+)টি/, `${toBengaliDigits(subProv)}টি প্রশ্ন থেকে যে কোনো ${toBengaliDigits(subReq)}টি`);
                } else if (subReq > 0 && (finalSubInstruction.includes("যে কোনো") || finalSubInstruction.includes("যেকোনো"))) {
                  finalSubInstruction = finalSubInstruction.replace(/(যে কোনো|যেকোনো)\s*([০-৯\d]+)টি/, `যে কোনো ${toBengaliDigits(subReq)}টি`);
                }
              }

              newBlocks.push({
                id: `subj-${subject.id}-sub-${sub.id}`,
                type: "sub-section-title",
                data: { 
                  id: sub.id, 
                  subSectionId: sub.id, 
                  sectionId: sec.id, 
                  title: sub.title, 
                  titleBn: sub.titleBn, 
                  instructions: finalSubInstruction,
                  nextSubSectionId: nextSub?.id,
                  nextSubSectionTitle: nextSub?.titleBn || nextSub?.title,
                  hasQuestions: subQuestionsCount > 0,
                  hideTitle: hasQuestionTypeLabel,
                  isSectionFilled,
                  isFirstSubSection: subIndex === 0,
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
                isSharedQuestionType,
                siblingSubSectionIds,
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
  }, [paperQuery, statuses, settings.paperOrientation, settings.columns, paperId, settings.blocks, dismissedSectionIds, dismissedSubSectionIds, activeSectionId, activeSubSectionId]);

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
    if (!blocks || blocks.length === 0) return [];

    const effectivePageHeight = pageContentHeight > 0 
      ? pageContentHeight 
      : (canvasMinHeight * 3.7795 - (settings.margins.top + settings.margins.bottom) * 3.7795);

    const colCount = Math.max(1, Number(settings.columns) || 1);
    const result: { fullHeader?: PaperBlock, columns: PaperBlock[][], isOMRPage?: boolean }[] = [];
    
    let currentPage: { fullHeader?: PaperBlock, columns: PaperBlock[][], isOMRPage?: boolean } = { 
      columns: Array.from({ length: colCount }, () => []) 
    };
    let currentColumnIdx = 0;
    let currentColumnHeight = 0;

    // If full header exists, put it on first page
    const fullHeaderBlock = blocks.find(b => b.type === "header-full");
    let availableHeight = effectivePageHeight - 10; // 10px tolerance

    if (fullHeaderBlock) {
      currentPage.fullHeader = fullHeaderBlock;
      availableHeight -= (measuredHeights[fullHeaderBlock.id] || 80) + 12; // 12px for mb-3
    }

    const contentBlocks = blocks.filter(b => b.type !== "header-full");

    contentBlocks.forEach((b, idx) => {
      const h = measuredHeights[b.id] || (b.type.startsWith("question-") ? 80 : 40);
      
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
        
        if (currentColumnIdx >= colCount) {
          result.push(currentPage);
          currentPage = { columns: Array.from({ length: colCount }, () => []) };
          currentColumnIdx = 0;
          availableHeight = effectivePageHeight - 10;
        }
      }
      
      currentPage.columns[currentColumnIdx]?.push(b);
      currentColumnHeight += h + (b.gap || 0);
    });

    if (currentPage.columns.some(col => col.length > 0) || currentPage.fullHeader) {
      result.push(currentPage);
    }

    // Safeguard: result must NEVER be empty if any blocks exist
    if (result.length === 0) {
      result.push({
        fullHeader: fullHeaderBlock,
        columns: [contentBlocks],
      });
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
                <div className="mb-3">
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
                    {col.map((b, bIdx) => (
                      <div key={`${b.id}-${bIdx}`} className="w-full" style={{ marginBottom: `${b.gap || 0}px` }}>
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
                    <div key={`print-header-${b.id}`} className="mb-3 w-full">
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
