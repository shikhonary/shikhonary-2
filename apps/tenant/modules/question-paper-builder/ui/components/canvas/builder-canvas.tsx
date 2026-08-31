import React, { useEffect, useLayoutEffect, useState, useRef, useMemo } from "react";
import { useBuilderStore } from "../../../store/use-builder-store";
import { MCQBlock } from "../blocks/mcq-block";
import { CQBlock } from "../blocks/cq-block";
import { ShortAnswerBlock } from "../blocks/short-answer-block";
import { ParagraphBlock } from "../blocks/paragraph-block";
import { AmplificationBlock } from "../blocks/amplification-block";
import { HeaderBlock } from "../blocks/header-block";
import { OMRBlock } from "../blocks/omr-block";
import { Button } from "@workspace/ui/components/button";
import { useQuestionPaperById, useQuestionPaperDistributionStatuses } from "@/modules/question-paper/services/use-question-paper";
import Link from "next/link";

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
      const { title, titleBn, instructions } = block.data;
      return (
        <div className="w-full mt-6 mb-3 border-b border-on-surface/10 pb-1 flex flex-col items-center">
          <h3 className="font-bold text-base text-center">
            {titleBn || title}
          </h3>
          {instructions && (
            <p className="text-xs text-muted-foreground italic text-center mt-0.5">{instructions}</p>
          )}
        </div>
      );
    }
    case "sub-section-title": {
      const { title, titleBn } = block.data;
      return (
        <div className="w-full mt-4 mb-2 pl-2">
          <h4 className="font-semibold text-sm border-l-2 border-primary/50 pl-2 text-left">
            {titleBn || title}
          </h4>
        </div>
      );
    }
    case "dist-title": {
      const { dist, attemptCount, totalProvided, isCq, isMcq } = block.data;
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
    case "question-short":
      return <ShortAnswerBlock item={block.data.item} />;
    case "question-paragraph":
      return <ParagraphBlock item={block.data.item} />;
    case "question-amplification":
      return <AmplificationBlock item={block.data.item} />;
    case "dist-action": {
      if (isExporting) return null;
      const { dist, status, statusInfo, paperId } = block.data;
      if (status === "ACTIVE") {
        return (
          <div className="border-2 border-dashed border-primary/50 bg-primary/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center transition-colors hover:bg-primary/10">
            <p className="text-sm font-medium text-primary">
              {dist.questionType?.nameBn || dist.questionType?.nameEn} ({statusInfo?.addedCount || 0}/{statusInfo?.targetCount || dist.questionCount}টি)
            </p>
            <Button asChild className="rounded-full shadow-sm">
              <Link href={`/question-papers/${paperId}/distributions/${dist.id}/pick`}>
                + প্রশ্ন নির্বাচন করুন
              </Link>
            </Button>
          </div>
        );
      }
      if (status === "LOCKED") {
        return (
          <div className="border border-dashed border-muted bg-muted/20 rounded-2xl p-4 flex items-center justify-center text-center opacity-60">
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border border-muted-foreground flex items-center justify-center">🔒</span>
              পূর্ববর্তী অংশসমূহ সম্পন্ন করে {dist.questionType?.nameBn || dist.questionType?.nameEn} আনলক করুন
            </p>
          </div>
        );
      }
      return null;
    }
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

      const renderDistribution = (dist: any) => {
        const statusInfo = statuses?.find((s: any) => s.distributionId === dist.id);
        const status = statusInfo?.status || "LOCKED";
        const questions = paperQuery.questions?.filter((q: any) => q.distributionId === dist.id) || [];

        const totalProvided = Number(dist.questionCount || 0);
        const attemptCount = Number(dist.questionsToAttempt || totalProvided);
        const nameEn = dist.questionType?.nameEn?.toLowerCase() || "";
        const isCq = (!nameEn.includes("mcq") && (nameEn.includes("cq") || nameEn.includes("creative"))) || dist.questionType?.nameBn?.includes("সৃজনশীল");

        const isMcq = nameEn.includes("mcq") || nameEn.includes("multiple choice") || dist.questionType?.nameBn?.includes("বহুনির্বাচনি");

        newBlocks.push({
          id: `dist-${dist.id}`,
          type: "dist-title",
          data: { dist, statusInfo, attemptCount, totalProvided, questionsLen: questions.length, isCq, isMcq },
          gap: 0
        });

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
              data: { item: { id: q.id, type: "CQ", data: q.cq, orderIndex: idx, masterNumber: globalWrittenNumber } },
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
              data: { item: { id: q.id, type: "SHORT", data: q.shortAnswer, orderIndex: idx, masterNumber: globalWrittenNumber, isFirstShortAnswer: idx === 0, totalQuestions: questions.length, marksPerQuestion: dist.marksPerQuestion } },
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

        newBlocks.push({
          id: `action-${dist.id}`,
          type: "dist-action",
          data: { dist, status, statusInfo, paperId },
          gap: 0
        });
      };

      if (hasSections) {
        const subjectSections = paperQuery.sections.filter((sec: any) => {
          return subject.distributions?.some((d: any) => d.sectionId === sec.id);
        });

        subjectSections.forEach((sec: any) => {
          newBlocks.push({
            id: `subj-${subject.id}-sec-${sec.id}`,
            type: "section-title",
            data: { title: sec.title, titleBn: sec.titleBn, instructions: sec.instructions },
            gap: 0
          });

          const subjectSubSections = sec.subSections?.filter((sub: any) => {
            return subject.distributions?.some((d: any) => d.subSectionId === sub.id);
          }) || [];

          if (subjectSubSections.length > 0) {
            subjectSubSections.forEach((sub: any) => {
              newBlocks.push({
                id: `subj-${subject.id}-sub-${sub.id}`,
                type: "sub-section-title",
                data: { title: sub.title, titleBn: sub.titleBn },
                gap: 0
              });

              const subDists = subject.distributions?.filter((d: any) => d.subSectionId === sub.id) || [];
              subDists.forEach(renderDistribution);
            });
          } else {
            const secDists = subject.distributions?.filter((d: any) => d.sectionId === sec.id && !d.subSectionId) || [];
            secDists.forEach(renderDistribution);
          }
        });

        const unassignedDists = subject.distributions?.filter((d: any) => !d.sectionId) || [];
        if (unassignedDists.length > 0) {
          unassignedDists.forEach(renderDistribution);
        }
      } else {
        subject.distributions?.forEach(renderDistribution);
      }
    });

    return newBlocks;
  }, [paperQuery, statuses, settings.bookletMode, settings.columns, paperId, settings.blocks]);

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
          {blocks.map(b => (
            <div key={`measure-${b.id}`} id={`measure-block-${b.id}`}>
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
                    {blocks.filter(b => b.type !== "header-full").map(b => {
                      const blockBreak = settings.blockBreaks?.[b.id] || "none";
                      const breakClass = blockBreak === "page" ? "break-before-page" : blockBreak === "column" ? "break-before-column" : "break-inside-avoid";
                      
                      return (
                        <div key={`print-block-${b.id}`} className={`w-full ${breakClass}`} style={{ marginBottom: `${b.gap || 0}px` }}>
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
