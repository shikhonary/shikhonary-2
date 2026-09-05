"use client";

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
    .map((digit) => (/\d/.test(digit) ? bengaliDigits[parseInt(digit)] : digit))
    .join("");
};

const ApplicationEditableText = ({ 
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
  const setItemStyle = useBuilderStore(state => state.setItemStyle);
  const itemStyles = useBuilderStore(state => state.settings.itemStyles);
  
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
    <div className="relative group flex-1">
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
      
      <div 
        ref={textRef}
        onClick={() => setIsActive(true)}
        className={`cursor-pointer transition-colors ${isActive ? "bg-primary/5 ring-1 ring-primary/20 rounded-sm" : "hover:bg-muted/30 rounded-sm"} ${className}`}
        style={{
          fontSize: mergedStyle.fontSize,
          fontFamily: mergedStyle.fontFamily,
          lineHeight: mergedStyle.lineHeight,
          textAlign: mergedStyle.textAlign,
          fontWeight: mergedStyle.fontWeight,
        }}
      >
        <RenderMath text={text} />
      </div>
    </div>
  );
};

export const ApplicationBlock = ({ item }: { item: any }) => {
  const paperId = useBuilderStore((state) => state.paperId);
  const settings = useBuilderStore((state) => state.settings);
  const data = item.data || {};

  const { mutate: removeQuestion, isPending: isRemoving } = useRemoveQuestion();
  const { data: statuses } = useQuestionPaperDistributionStatuses(paperId || "");
  const distStatus = statuses?.find((s: any) => s.distributionId === (item.distributionId || data.distributionId || item.distribution?.id));
  const rawMarkDist = distStatus?.markDistribution || item.distribution?.markDistribution || item.markDistribution;
  let markDist = rawMarkDist;
  if (typeof rawMarkDist === "string") {
    try {
      markDist = JSON.parse(rawMarkDist);
    } catch (e) {
      markDist = rawMarkDist;
    }
  }

  const getQuestionMark = (index: number, defaultMark?: number) => {
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

        // If object has numeric values, pick by index or fallback to the first entry
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
    10
  );

  const marksPerQuestion = getQuestionMark(item.orderIndex, defaultMark) || 10;
  const mark = marksPerQuestion;
  const attemptCount = Number(
    (distStatus as any)?.questionsToAttempt ??
    item.distribution?.questionsToAttempt ??
    item.attemptCount ??
    distStatus?.targetCount ??
    item.totalQuestions ??
    1
  );

  const rawLabel = 
    distStatus?.questionTypeLabel ||
    item.distribution?.questionTypeLabel ||
    item.questionTypeLabel ||
    distStatus?.questionTypeName ||
    item.distribution?.questionTypeName;

  const questionType = "APPLICATION";

  const handleRemove = () => {
    if (!paperId) return;
    removeQuestion({
      questionPaperId: paperId,
      questionId: data.id || item.id,
      questionType,
    });
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

  const subLabels = ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ", "ঝ", "ঞ", "ট", "ঠ", "ড", "ঢ", "ণ", "ত", "থ", "দ", "ধ", "ন"];
  const label = subLabels[item.orderIndex] || "";

  const renderSubQuestionLabel = (labelStr: string) => {
    const cleanLabel = (labelStr || "").replace(/^\(+|\)+$/g, "").trim();
    return (
      <span
        className="font-bold shrink-0 min-w-[1.6em]"
        style={{
          fontSize: questionStyle.fontSize,
          fontFamily: questionStyle.fontFamily,
        }}
      >
        ({cleanLabel})
      </span>
    );
  };

  const isFirst = item.isFirstApplication !== undefined ? item.isFirstApplication : (item.orderIndex === 0);
  const masterNum = item.masterNumber || (item.orderIndex + 1);

  const [showAddAlternative, setShowAddAlternative] = useState(false);

  const titleText = data.title || data.name || "";

  return (
    <div className={`group relative -mx-4 px-4 hover:bg-muted/10 rounded-lg transition-colors flex flex-col break-inside-avoid ${isFirst ? "pt-0.5 pb-0" : "py-0 my-0"}`}>
      {/* Hover Controls */}
      <div className="absolute top-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border shadow-sm rounded-md flex overflow-hidden z-10 print:hidden">
        <button
          type="button"
          onClick={() => setShowAddAlternative(true)}
          className="px-2 py-1 text-xs hover:bg-primary/10 transition-colors text-primary flex items-center gap-1 border-r"
          title="বিকল্প (অথবা) প্রশ্ন যুক্ত করুন"
        >
          <Split className="w-3 h-3" />
          অথবা
        </button>
        <button 
          onClick={handleRemove}
          disabled={isRemoving}
          className={`px-2 py-1 text-xs hover:bg-destructive/10 transition-colors text-destructive flex items-center gap-1 ${isRemoving ? "opacity-50" : ""}`}
          title="Remove Question"
        >
          {isRemoving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
          Remove
        </button>
      </div>

      {isFirst && (
        <div className="flex justify-between items-start w-full">
          <div 
            className="font-bold ml-[0px] flex items-baseline gap-2" 
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
              {toBengaliDigits(masterNum)}।
            </span>
            <EditableSectionLabel
              distributionId={item.distributionId || data.distributionId || item.distribution?.id}
              initialLabel={rawLabel}
              fallbackLabel="যেকোনো একটি বিষয়ে আবেদনপত্র লেখো:"
              questionType="APPLICATION"
              style={{
                fontSize: questionStyle.fontSize,
                fontFamily: questionStyle.fontFamily,
              }}
            />
          </div>
          <div className="font-bold whitespace-nowrap text-right shrink-0" style={{
            fontSize: questionStyle.fontSize,
            fontFamily: questionStyle.fontFamily,
          }}>
            {toBengaliDigits(marksPerQuestion * (attemptCount || 1))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-start gap-2 w-full">
        <div className="flex gap-1 flex-1 relative flex-col">
          <div className="flex gap-2 items-start w-full">
            <span
              className="font-bold shrink-0 min-w-[1.8em] invisible select-none pointer-events-none"
              style={{
                fontSize: questionStyle.fontSize,
                fontFamily: questionStyle.fontFamily,
              }}
              aria-hidden="true"
            >
              {toBengaliDigits(masterNum)}।
            </span>
            {renderSubQuestionLabel(label)}
            <div className="flex-1 w-full min-w-0">
              <ApplicationEditableText 
                text={titleText}
                itemKey={`${item.id}-question`}
                defaultStyle={questionStyle}
                className="m-0 w-full whitespace-pre-wrap font-medium text-foreground"
              />
            </div>
          </div>

          {/* Attached Alternatives */}
          {item.alternatives && item.alternatives.length > 0 && (
            <AlternativeQuestionRenderer
              paperId={paperId || ""}
              parentQuestionId={item.id}
              alternatives={item.alternatives}
              settings={settings}
              masterNumber={item.masterNumber || (item.orderIndex + 1)}
              primaryMarks={item.assignedMarks ?? item.distribution?.marksPerQuestion ?? mark}
            />
          )}
        </div>
      </div>

      <AddAlternativeModal
        open={showAddAlternative}
        onOpenChange={setShowAddAlternative}
        paperId={paperId || ""}
        primaryQuestionId={item.id}
        primaryQuestionContentId={data.id}
        primaryQuestionType={questionType}
        subjectId={item.subjectId || distStatus?.subjectId || ""}
        primaryMarks={item.assignedMarks ?? item.distribution?.marksPerQuestion ?? mark}
        masterNumber={item.masterNumber || (item.orderIndex + 1)}
        distributionId={item.distributionId || data.distributionId || distStatus?.distributionId}
      />
    </div>
  );
};
