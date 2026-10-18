import React, { useState, useRef, useEffect } from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { useBuilderStore } from "../../../store/use-builder-store";
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Trash2, Loader2, Split } from "lucide-react";
import { useRemoveQuestion, useQuestionPaperDistributionStatuses } from "@/modules/question-paper/services/use-question-paper";
import { AlternativeQuestionRenderer } from "./alternative-question-renderer";
import { AddAlternativeModal } from "../modals/add-alternative-modal";
import { EditableSectionLabel } from "./editable-section-label";

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "";
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .split("")
    .map((digit) => (/\d/.test(digit) ? bengaliDigits[parseInt(digit, 10)] : digit))
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

const NumberInWordsEditableText = ({ 
  text, 
  itemKey, 
  defaultStyle,
  className = ""
}: { 
  text: string, 
  itemKey: string, 
  defaultStyle: any,
  className?: string
}) => {
  const [isActive, setIsActive] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const setItemStyle = useBuilderStore((state) => state.setItemStyle);
  const itemStyles = useBuilderStore((state) => state.settings.itemStyles);
  
  const customStyle = itemStyles?.[itemKey] || {};
  const mergedStyle = { ...defaultStyle, ...customStyle };
  
  useEffect(() => {
    if (!isActive) return;
    const handleClick = (e: MouseEvent) => {
      if (toolbarRef.current?.contains(e.target as Node)) return;
      if (textRef.current?.contains(e.target as Node)) return;
      setIsActive(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isActive]);
  
  const toggleBold = () => {
    const isBold = mergedStyle.fontWeight === "bold" || mergedStyle.fontWeight === 700 || mergedStyle.fontWeight === 600;
    setItemStyle(itemKey, { fontWeight: isBold ? "normal" : "bold" });
  };
  
  const changeSize = (delta: number) => {
    const currentSize = mergedStyle.fontSize || 12;
    setItemStyle(itemKey, { fontSize: currentSize + delta });
  };
  
  const changeAlign = (align: "left" | "center" | "right" | "justify") => {
    setItemStyle(itemKey, { textAlign: align });
  };

  return (
    <div className="relative group/edit inline-block">
      {isActive && (
        <div ref={toolbarRef} className="absolute -top-10 left-0 bg-white border border-border shadow-md rounded-md flex items-center p-1 gap-1 z-50 print:hidden text-xs text-foreground">
          <button onClick={() => changeAlign("left")} className={`p-1 rounded hover:bg-muted ${mergedStyle.textAlign === "left" ? "bg-primary/10 text-primary" : ""}`} title="Align Left"><AlignLeft size={14} /></button>
          <button onClick={() => changeAlign("center")} className={`p-1 rounded hover:bg-muted ${mergedStyle.textAlign === "center" ? "bg-primary/10 text-primary" : ""}`} title="Align Center"><AlignCenter size={14} /></button>
          <button onClick={() => changeAlign("right")} className={`p-1 rounded hover:bg-muted ${mergedStyle.textAlign === "right" ? "bg-primary/10 text-primary" : ""}`} title="Align Right"><AlignRight size={14} /></button>
          <button onClick={() => changeAlign("justify")} className={`p-1 rounded hover:bg-muted ${mergedStyle.textAlign === "justify" ? "bg-primary/10 text-primary" : ""}`} title="Justify"><AlignJustify size={14} /></button>
          
          <div className="w-px h-4 bg-border mx-1"></div>
          
          <button onClick={toggleBold} className={`p-1 rounded hover:bg-muted ${mergedStyle.fontWeight === "bold" || mergedStyle.fontWeight === 700 ? "bg-primary/10 text-primary" : ""}`} title="Toggle Bold"><Bold size={14} /></button>
          
          <div className="w-px h-4 bg-border mx-1"></div>
          
          <button onClick={() => changeSize(-1)} className="p-1 px-2 rounded hover:bg-muted font-mono leading-none" title="Decrease Font Size">-</button>
          <span className="text-[10px] w-4 text-center font-medium">{mergedStyle.fontSize}</span>
          <button onClick={() => changeSize(1)} className="p-1 px-2 rounded hover:bg-muted font-mono leading-none" title="Increase Font Size">+</button>
        </div>
      )}
      
      <span 
        ref={textRef}
        onClick={() => setIsActive(true)}
        className={`cursor-pointer transition-colors inline-block ${isActive ? "bg-primary/5 ring-1 ring-primary/20 rounded-sm" : "hover:bg-muted/30 rounded-sm"} ${className}`}
        style={{
          fontSize: mergedStyle.fontSize,
          fontFamily: mergedStyle.fontFamily,
          lineHeight: mergedStyle.lineHeight,
          textAlign: mergedStyle.textAlign,
          fontWeight: mergedStyle.fontWeight,
        }}
      >
        <RenderMath text={text} />
      </span>
    </div>
  );
};

export const NumberInWordsBlock = ({ item }: { item: any }) => {
  const paperId = useBuilderStore((state) => state.paperId);
  const settings = useBuilderStore((state) => state.settings);
  const data = item.data || {};

  const { mutate: removeQuestion, isPending: isRemoving } = useRemoveQuestion();
  const [removingNumberId, setRemovingNumberId] = useState<string | null>(null);

  const { data: statuses } = useQuestionPaperDistributionStatuses(paperId || "");
  const distStatus = statuses?.find((s: any) => s.distributionId === (item.distributionId || data.distributionId || item.distribution?.id));
  const rawMarkDist = distStatus?.markDistribution || item.distribution?.markDistribution || item.markDistribution;
  let markDist = rawMarkDist;
  if (typeof rawMarkDist === "string") {
    try {
      markDist = JSON.parse(rawMarkDist);
    } catch {
      markDist = rawMarkDist;
    }
  }

  const getQuestionMark = (index: number, defaultMark: number) => {
    if (markDist) {
      if (Array.isArray(markDist)) {
        if (markDist[index] !== undefined && !isNaN(Number(markDist[index]))) {
          return Number(markDist[index]);
        }
      } else if (typeof markDist === "object" && markDist !== null) {
        const alphaKeys = ["a", "b", "c", "d", "e", "f", "g", "h"];
        const upperAlphaKeys = ["A", "B", "C", "D", "E", "F", "G", "H"];
        const bengaliKeys = ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ"];

        const keysToTry = [
          alphaKeys[index],
          upperAlphaKeys[index],
          bengaliKeys[index],
          String(index + 1),
          String(index),
          `q${index + 1}`,
          `mark${index + 1}`,
          `q${alphaKeys[index]}`,
        ].filter(Boolean) as string[];

        for (const k of keysToTry) {
          if (markDist[k] !== undefined && markDist[k] !== null && !isNaN(Number(markDist[k]))) {
            return Number(markDist[k]);
          }
        }

        const values = Object.values(markDist).filter((v: any) => v !== undefined && v !== null && !isNaN(Number(v)));
        if (values.length > 0) {
          if (values[index] !== undefined) {
            return Number(values[index]);
          }
          return Number(values[0]);
        }
      }
    }

    if (item.assignedMarks !== undefined && item.assignedMarks !== null) return Number(item.assignedMarks);
    if ((data.mark ?? data.marks) !== undefined && (data.mark ?? data.marks) !== null) return Number(data.mark ?? data.marks);
    return defaultMark;
  };

  const defaultMark = Number(
    distStatus?.marksPerQuestion ??
    item.distribution?.marksPerQuestion ??
    item.marksPerQuestion ??
    item.assignedMarks ??
    data.mark ??
    data.marks ??
    5
  );

  const marksPerQuestion = getQuestionMark(item.orderIndex || 0, defaultMark);
  const attemptCount = Number(
    (distStatus as any)?.questionsToAttempt ??
    item.distribution?.questionsToAttempt ??
    item.attemptCount ??
    distStatus?.targetCount ??
    item.totalQuestions ??
    1
  );

  const candidateLabel = 
    distStatus?.questionTypeLabel ||
    item.distribution?.questionTypeLabel ||
    item.questionTypeLabel ||
    distStatus?.questionTypeName ||
    item.distribution?.questionTypeName ||
    distStatus?.questionType?.nameEn ||
    item.distribution?.questionType?.nameEn;

  // Filter out any default or legacy Bengali labels so it always uses English
  const rawLabel = candidateLabel && !/[\u0980-\u09FF]/.test(candidateLabel)
    ? candidateLabel
    : null;

  const handleRemove = (questionId: string) => {
    if (!paperId || !questionId) return;
    setRemovingNumberId(questionId);
    removeQuestion(
      {
        questionPaperId: paperId,
        questionId,
        questionType: "NUMBER_IN_WORDS",
      },
      {
        onSettled: () => {
          setRemovingNumberId(null);
        },
      }
    );
  };

  const getQuestionStyle = () => {
    return {
      fontSize: settings.fontSize,
      fontFamily: settings.fontFamily,
      textAlign: "left" as const,
      lineHeight: settings.lineHeight,
      fontWeight: settings.fontWeight || "normal"
    };
  };

  const questionStyle = getQuestionStyle();
  const [showAddAlternative, setShowAddAlternative] = useState(false);
  const [selectedNumberForAlternative, setSelectedNumberForAlternative] = useState<any>(null);

  // Grouped numbers or single number fallback
  const numbers = Array.isArray(item.numbers) && item.numbers.length > 0
    ? item.numbers
    : [{
        id: item.id,
        data: item.data || {},
        alternatives: item.alternatives || [],
        assignedMarks: item.assignedMarks,
        subjectId: item.subjectId,
      }];

  const totalQuestions = item.totalQuestions || numbers.length;

  return (
    <div className="group/nw relative break-inside-avoid w-full">
      {/* Question Header */}
      <div className="flex justify-between items-start w-full mb-1">
        <div 
          className="font-bold ml-[0px] flex items-baseline gap-2 flex-1" 
          style={{
            fontSize: questionStyle.fontSize,
            fontFamily: questionStyle.fontFamily,
          }}
        >
          <span
            className="font-bold shrink-0 min-w-[1.8em]"
            style={{
              fontSize: questionStyle.fontSize,
              fontFamily: questionStyle.fontFamily,
            }}
          >
            {item.masterNumber || 1}.
          </span>
          <EditableSectionLabel
            distributionId={item.distributionId || data.distributionId || item.distribution?.id}
            initialLabel={rawLabel}
            fallbackLabel="Write the following numbers in words:"
            questionType="NUMBER_IN_WORDS"
            questionCount={distStatus?.questionCount ?? item.distribution?.questionCount ?? distStatus?.targetCount ?? totalQuestions}
            questionsToAttempt={(distStatus as any)?.questionsToAttempt ?? item.distribution?.questionsToAttempt ?? attemptCount}
            style={{
              fontSize: questionStyle.fontSize,
              fontFamily: questionStyle.fontFamily,
            }}
          />
        </div>
        <div className="font-bold whitespace-nowrap text-right shrink-0 ml-2" style={{
          fontSize: questionStyle.fontSize,
          fontFamily: questionStyle.fontFamily,
        }}>
          {attemptCount > 1
            ? `${marksPerQuestion} × ${attemptCount} = ${marksPerQuestion * attemptCount}`
            : marksPerQuestion * (attemptCount || 1)}
        </div>
      </div>

      {/* Numbers Container - aligned with the question label */}
      <div className="flex gap-2 items-start w-full">
        {/* Spacer matching question number min-w-[1.8em] to align numbers with question label */}
        <span
          className="font-bold shrink-0 min-w-[1.8em] invisible select-none pointer-events-none"
          style={{
            fontSize: questionStyle.fontSize,
            fontFamily: questionStyle.fontFamily,
          }}
          aria-hidden="true"
        >
          {item.masterNumber || 1}.
        </span>

        {/* All numbers rendered in a single flowing line */}
        <div className="flex-1 flex flex-wrap items-baseline gap-y-1">
          {numbers.map((numItem: any, index: number) => {
            const isLast = index === numbers.length - 1;
            const numData = numItem.data || {};
            const rawNumText = numData.number || numData.num || numData.title || numData.name || "";
            const numText = toEnglishDigits(rawNumText);
            const isNumberRemoving = isRemoving && (removingNumberId === numItem.id || removingNumberId === numItem.data?.id);

            return (
              <div 
                key={numItem.id || index}
                className="group/number relative inline-flex items-baseline rounded-sm hover:bg-muted/20 transition-colors"
              >
                {/* Hover Controls for individual number */}
                <div className="absolute -top-5.5 left-0 opacity-0 group-hover/number:opacity-100 transition-opacity bg-white border shadow-xs rounded-md flex overflow-hidden z-20 print:hidden text-xs whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedNumberForAlternative(numItem);
                      setShowAddAlternative(true);
                    }}
                    className="px-1.5 py-0.5 text-[11px] hover:bg-primary/10 transition-colors text-primary flex items-center gap-1 border-r"
                    title="Add alternative (Or) question"
                  >
                    <Split className="w-3 h-3" />
                    Or
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleRemove(numItem.data?.id || numItem.id)}
                    disabled={isNumberRemoving}
                    className={`px-1.5 py-0.5 text-[11px] hover:bg-destructive/10 transition-colors text-destructive flex items-center gap-1 ${isNumberRemoving ? "opacity-50" : ""}`}
                    title="Remove Question"
                  >
                    {isNumberRemoving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  </button>
                </div>

                <NumberInWordsEditableText 
                  text={numText}
                  itemKey={`${numItem.id}-question`}
                  defaultStyle={questionStyle}
                  className="m-0"
                />

                {!isLast && (
                  <span 
                    className="font-normal select-none mr-1"
                    style={{
                      fontSize: questionStyle.fontSize,
                      fontFamily: questionStyle.fontFamily,
                    }}
                  >
                    ,
                  </span>
                )}

                {/* Attached Alternatives */}
                {numItem.alternatives && numItem.alternatives.length > 0 && (
                  <div className="inline-block ml-1">
                    <AlternativeQuestionRenderer
                      paperId={paperId || ""}
                      parentQuestionId={numItem.id}
                      alternatives={numItem.alternatives}
                      settings={settings}
                      masterNumber={item.masterNumber || 1}
                      primaryMarks={numItem.assignedMarks ?? item.distribution?.marksPerQuestion ?? marksPerQuestion}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <AddAlternativeModal
        open={showAddAlternative}
        onOpenChange={setShowAddAlternative}
        paperId={paperId || ""}
        primaryQuestionId={selectedNumberForAlternative?.id || item.id}
        primaryQuestionContentId={selectedNumberForAlternative?.data?.id || data.id}
        primaryQuestionType="NUMBER_IN_WORDS"
        subjectId={selectedNumberForAlternative?.subjectId || item.subjectId || distStatus?.subjectId || ""}
        primaryMarks={selectedNumberForAlternative?.assignedMarks ?? item.assignedMarks ?? item.distribution?.marksPerQuestion ?? marksPerQuestion}
        masterNumber={item.masterNumber || 1}
        distributionId={item.distributionId || data.distributionId || distStatus?.distributionId}
      />
    </div>
  );
};
