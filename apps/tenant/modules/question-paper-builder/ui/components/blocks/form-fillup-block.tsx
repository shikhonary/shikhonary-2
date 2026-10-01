"use client";

import React, { useState, useRef, useEffect } from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { useBuilderStore } from "../../../store/use-builder-store";
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Trash2, Loader2, Split } from "lucide-react";
import { useRemoveQuestion, useQuestionPaperDistributionStatuses } from "@/modules/question-paper/services/use-question-paper";
import { AlternativeQuestionRenderer } from "./alternative-question-renderer";
import { AddAlternativeModal } from "../modals/add-alternative-modal";
import { cn } from "@workspace/ui/lib/utils";

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "";
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .split("")
    .map((digit) => (/\d/.test(digit) ? bengaliDigits[parseInt(digit)] : digit))
    .join("");
};

interface ParsedFormField {
  sl?: string;
  label: string;
  solutionValue?: string;
}

function parseFormFields(formData: any, solutionData?: any): ParsedFormField[] {
  if (!formData) return [];

  let formObj = formData;
  if (typeof formData === "string") {
    try {
      formObj = JSON.parse(formData);
    } catch {
      return [];
    }
  }

  let solObj = solutionData;
  if (typeof solutionData === "string") {
    try {
      solObj = JSON.parse(solutionData);
    } catch {
      solObj = null;
    }
  }

  const bengaliDigits = ["১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯", "১০", "১১", "১২", "১৩", "১৪", "১৫"];

  if (Array.isArray(formObj)) {
    return formObj.map((item, idx) => {
      const defaultSl = bengaliDigits[idx] ? `${bengaliDigits[idx]}.` : `${idx + 1}.`;
      if (typeof item === "string") {
        return {
          sl: defaultSl,
          label: item,
          solutionValue: Array.isArray(solObj) ? String(solObj[idx] ?? "") : (solObj && typeof solObj === "object" ? String(solObj[item] ?? "") : "")
        };
      }
      return {
        sl: item.sl || defaultSl,
        label: item.label || item.name || item.key || `Field ${idx + 1}`,
        solutionValue: item.value || (solObj && typeof solObj === "object" ? String(solObj[item.key || item.label] ?? "") : "")
      };
    });
  }

  if (typeof formObj === "object" && formObj !== null) {
    return Object.entries(formObj).map(([key, val], idx) => {
      const matchPrefix = key.match(/^([\d১-৯]+[\.\:\-]?)\s*(.*)$/);
      let sl = bengaliDigits[idx] ? `${bengaliDigits[idx]}.` : `${idx + 1}.`;
      let label = key;

      if (matchPrefix && matchPrefix[1] && matchPrefix[2]) {
        sl = matchPrefix[1];
        label = matchPrefix[2];
      }

      let solVal = "";
      if (solObj && typeof solObj === "object") {
        solVal = solObj[key] ?? solObj[label] ?? "";
      } else if (val) {
        solVal = String(val);
      }

      return {
        sl,
        label,
        solutionValue: String(solVal || ""),
      };
    });
  }

  return [];
}

const FormFillupEditableText = ({ 
  text, 
  itemKey, 
  defaultStyle,
  className = ""
}: { 
  text: string; 
  itemKey: string; 
  defaultStyle: any;
  className?: string;
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
          fontWeight: mergedStyle.fontWeight || "bold",
        }}
      >
        <RenderMath text={text} className="font-bold" />
      </div>
    </div>
  );
};

export const FormFillupBlock = ({ item }: { item: any }) => {
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

  const questionType = "FORM_FILLUP";

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
      fontWeight: settings.fontWeight || "bold",
    };
  };

  const questionStyle = getQuestionStyle();

  const isFirst = item.isFirstFormFillup !== undefined ? item.isFirstFormFillup : (item.orderIndex === 0);
  const masterNum = item.masterNumber || (item.orderIndex + 1);

  const [showAddAlternative, setShowAddAlternative] = useState(false);

  // Scenario is rendered directly as question text
  const scenarioText = data.scenario || data.title || "নিচের ফরমটি পূরণ করো:";
  const fields = parseFormFields(data.formData, data.solutionData);
  const signatures = Array.isArray(data.signatures) && data.signatures.length > 0
    ? data.signatures
    : ["প্রার্থীর স্বাক্ষর"];

  return (
    <div className="group relative -mx-4 px-4 hover:bg-muted/10 rounded-lg transition-colors flex flex-col break-inside-avoid py-2">
      {/* Hover Controls */}
      <div className="absolute top-0 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white border shadow-sm rounded-md flex overflow-hidden z-10 print:hidden">
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

      <div className="flex justify-between items-start gap-2 w-full">
        <div className="flex gap-2 flex-1 relative flex-col">
          {/* 1. SCENARIO / QUESTION LABEL & NUMBERING */}
          <div className="flex gap-2 items-start w-full">
            {isFirst ? (
              <span
                className="font-bold shrink-0 min-w-[1.8em]"
                style={{
                  fontSize: questionStyle.fontSize,
                  fontFamily: questionStyle.fontFamily,
                }}
              >
                {toBengaliDigits(masterNum)}।
              </span>
            ) : (
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
            )}

            <div className="flex-1 w-full min-w-0">
              <FormFillupEditableText 
                text={scenarioText}
                itemKey={`${item.id}-scenario`}
                defaultStyle={questionStyle}
                className="m-0 w-full whitespace-pre-wrap font-bold text-foreground"
              />
            </div>

            {marksPerQuestion !== undefined && marksPerQuestion !== null && (
              <div
                className="font-bold whitespace-nowrap text-right shrink-0 ml-2"
                style={{
                  fontSize: questionStyle.fontSize,
                  fontFamily: questionStyle.fontFamily,
                }}
              >
                {attemptCount > 1 && !isFirst ? null : attemptCount > 1
                  ? `${toBengaliDigits(marksPerQuestion)} × ${toBengaliDigits(attemptCount)} = ${toBengaliDigits(marksPerQuestion * attemptCount)}`
                  : toBengaliDigits(marksPerQuestion)}
              </div>
            )}
          </div>

          {/* 2. AUTHENTIC FORM BOX */}
          <div className="w-full mt-2">
            <div className="border-2 border-neutral-900 rounded-sm bg-white p-4 sm:p-6 shadow-xs space-y-4 text-neutral-900 font-solaiman relative">
              {/* Photo Slot (Top Right Corner) */}
              {data.hasPhoto && (
                <div className="absolute right-4 sm:right-6 top-4 sm:top-6 w-16 h-20 sm:w-20 sm:h-24 border-2 border-neutral-900 rounded-xs flex items-center justify-center bg-white text-neutral-900 font-bold text-xs sm:text-sm select-none z-10">
                  ছবি
                </div>
              )}

              {/* Header Title & Institution */}
              <div className={cn(
                "text-center space-y-0.5 pb-1",
                data.hasPhoto ? "pr-20 sm:pr-24 pl-2" : "px-2"
              )}>
                {data.institution && (
                  <h3 className="text-sm sm:text-base font-bold tracking-tight text-neutral-900 leading-snug">
                    {data.institution}
                  </h3>
                )}
                {data.title && (
                  <h4 className="text-xs sm:text-sm font-bold text-neutral-900">
                    {data.title}
                  </h4>
                )}
                {data.description && (
                  <p className="text-[11px] sm:text-xs font-semibold text-neutral-700">
                    {data.description}
                  </p>
                )}
              </div>

              {/* Form Fields with Dotted Lines */}
              <div className="space-y-2 sm:space-y-3 pt-1">
                {fields.length > 0 ? (
                  fields.map((field, fIdx) => (
                    <div key={fIdx} className="flex items-baseline text-xs sm:text-sm leading-relaxed">
                      {/* Label with serial and colon */}
                      <div className="flex items-baseline shrink-0 gap-1.5 min-w-[120px] sm:min-w-[150px]">
                        {field.sl && <span className="font-bold">{field.sl}</span>}
                        <span className="font-bold">{field.label}</span>
                        <span className="font-bold ml-auto mr-1.5">:</span>
                      </div>

                      {/* Dotted underline fill area */}
                      <div className="flex-1 relative min-h-[1.2rem] flex items-baseline">
                        <div className="w-full border-b-2 border-dotted border-neutral-800 translate-y-[-2px]" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-2 text-xs text-neutral-500 italic text-center">
                    (কোনো ফর্ম ফিল্ড নির্ধারিত নেই)
                  </div>
                )}
              </div>

              {/* Declaration Note */}
              {data.declaration && (
                <div className="pt-2 text-[11px] sm:text-xs text-neutral-900 leading-relaxed font-semibold">
                  {data.declaration}
                </div>
              )}

              {/* Signatures */}
              <div className="pt-4 sm:pt-6 flex flex-wrap items-end justify-end gap-6 sm:gap-8">
                {signatures.map((sig: string, sIdx: number) => (
                  <div key={sIdx} className="text-center min-w-[110px] sm:min-w-[130px]">
                    <div className="w-full border-b-2 border-neutral-900 mb-1" />
                    <span className="text-[11px] sm:text-xs font-bold text-neutral-900">{sig}</span>
                  </div>
                ))}
              </div>
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
              primaryMarks={item.assignedMarks ?? item.distribution?.marksPerQuestion ?? marksPerQuestion}
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
        primaryMarks={item.assignedMarks ?? item.distribution?.marksPerQuestion ?? marksPerQuestion}
        masterNumber={item.masterNumber || (item.orderIndex + 1)}
        distributionId={item.distributionId || data.distributionId || distStatus?.distributionId}
      />
    </div>
  );
};
