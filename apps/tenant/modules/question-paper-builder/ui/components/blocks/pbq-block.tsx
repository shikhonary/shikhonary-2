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

const PBQEditableText = ({ 
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

export const PBQBlock = ({ item }: { item: any }) => {
  const paperId = useBuilderStore((state) => state.paperId);
  const settings = useBuilderStore((state) => state.settings);
  const data = item.data || {};

  const { mutate: removeQuestion, isPending: isRemoving } = useRemoveQuestion();
  const { data: statuses } = useQuestionPaperDistributionStatuses(paperId || "");
  const distStatus = statuses?.find((s: any) => s.distributionId === (item.distributionId || data.distributionId || item.distribution?.id));
  const rawMarkDist = item.markDistribution || item.distribution?.markDistribution || distStatus?.markDistribution;
  let markDist = rawMarkDist;
  if (typeof rawMarkDist === "string") {
    try {
      markDist = JSON.parse(rawMarkDist);
    } catch (e) {
      markDist = rawMarkDist;
    }
  }

  const handleRemove = () => {
    if (!paperId) return;
    removeQuestion({
      questionPaperId: paperId,
      questionId: data.id || item.id,
      questionType: "PBQ",
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

  const getContextStyle = () => {
    return {
      fontSize: settings.fontSize,
      fontFamily: settings.fontFamily,
      textAlign: "left" as const,
      lineHeight: settings.lineHeight,
      fontWeight: "normal" as const
    };
  };

  const questionStyle = getQuestionStyle();
  const contextStyle = getContextStyle();

  const totalMarks = Number(
    item.distribution?.totalMarks ??
    distStatus?.totalMarks ??
    item.totalMarks ??
    item.assignedMarks ??
    5
  );

  const rawLabel = 
    distStatus?.questionTypeLabel ||
    item.distribution?.questionTypeLabel ||
    item.questionTypeLabel ||
    distStatus?.questionTypeName ||
    item.distribution?.questionTypeName ||
    distStatus?.questionType?.nameBn ||
    item.distribution?.questionType?.nameBn;

  const getSubQuestionMark = (id: string, index: number, defaultMark: number) => {
    if (id === "A" && (data.markA ?? data.marksA) !== undefined) return data.markA ?? data.marksA;
    if (id === "B" && (data.markB ?? data.marksB) !== undefined) return data.markB ?? data.marksB;
    if (id === "C" && (data.markC ?? data.marksC) !== undefined) return data.markC ?? data.marksC;
    if (id === "D" && (data.markD ?? data.marksD) !== undefined) return data.markD ?? data.marksD;
    if (id === "E" && (data.markE ?? data.marksE) !== undefined) return data.markE ?? data.marksE;

    if (!markDist) return defaultMark;

    if (Array.isArray(markDist)) {
      if (markDist[index] !== undefined && !isNaN(Number(markDist[index]))) {
        return Number(markDist[index]);
      }
    } else if (typeof markDist === "object") {
      const labelBn = index === 0 ? "ক" : index === 1 ? "খ" : index === 2 ? "গ" : index === 3 ? "ঘ" : "ঙ";
      const keysToTry = [id, id.toLowerCase(), String(index + 1), labelBn, `mark${id}`];
      for (const k of keysToTry) {
        if (markDist[k] !== undefined && !isNaN(Number(markDist[k]))) {
          return Number(markDist[k]);
        }
      }
    }

    return defaultMark;
  };

  const subQuestions = [
    { id: "A", label: "ক", text: data.questionA, marks: getSubQuestionMark("A", 0, 1) },
    { id: "B", label: "খ", text: data.questionB, marks: getSubQuestionMark("B", 1, 1) },
    { id: "C", label: "গ", text: data.questionC, marks: getSubQuestionMark("C", 2, 1) },
    { id: "D", label: "ঘ", text: data.questionD, marks: getSubQuestionMark("D", 3, 1) },
    { id: "E", label: "ঙ", text: data.questionE, marks: getSubQuestionMark("E", 4, 1) },
  ].filter((sq) => sq.text);

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

  const isFirst = item.isFirstPbq !== undefined ? item.isFirstPbq : (item.orderIndex === 0);
  const masterNum = item.masterNumber || (item.orderIndex + 1);

  const [showAddAlternative, setShowAddAlternative] = useState(false);

  return (
    <div className={`group relative -mx-4 px-4 hover:bg-muted/10 rounded-lg transition-colors flex flex-col break-inside-avoid ${isFirst ? "pt-0.5 pb-0" : "py-0 my-0"}`}>
      {/* Hover Controls */}
      <div className="absolute top-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border shadow-sm rounded-md flex overflow-hidden z-10 print:hidden">
        <button
          type="button"
          onClick={() => setShowAddAlternative(true)}
          className="px-2 py-1 text-xs hover:bg-primary/10 transition-colors text-primary flex items-center gap-1 border-r cursor-pointer"
          title="বিকল্প (অথবা) প্রশ্ন যুক্ত করুন"
        >
          <Split className="w-3 h-3" />
          অথবা
        </button>
        <button 
          onClick={handleRemove}
          disabled={isRemoving}
          className={`px-2 py-1 text-xs hover:bg-destructive/10 transition-colors text-destructive flex items-center gap-1 cursor-pointer ${isRemoving ? "opacity-50" : ""}`}
          title="Remove Question"
        >
          {isRemoving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
          Remove
        </button>
      </div>

      {isFirst && (
        <div className="flex justify-between items-start w-full">
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
              {toBengaliDigits(masterNum)}।
            </span>
            <EditableSectionLabel
              distributionId={item.distributionId || data.distributionId || item.distribution?.id}
              initialLabel={rawLabel}
              fallbackLabel="নিচের অনুচ্ছেদটি পড়ে প্রশ্নগুলোর উত্তর দাও:"
              questionType="PBQ"
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
            {toBengaliDigits(totalMarks)}
          </div>
        </div>
      )}

      <div className="flex justify-between items-start gap-2 w-full mt-1">
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
              {/* Reading Passage Stimulus / Context */}
              {data.context && (
                <div className="mb-2 whitespace-pre-wrap leading-relaxed text-justify w-full">
                  <PBQEditableText
                    text={data.context}
                    itemKey={`${item.id}-context`}
                    defaultStyle={contextStyle}
                    className="m-0 w-full"
                  />
                </div>
              )}

              {/* 5 Sub-Questions Stems */}
              {subQuestions.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {subQuestions.map((sq, idx) => (
                    <div key={idx} className="flex gap-2 items-start w-full">
                      {renderSubQuestionLabel(sq.label)}
                      
                      <PBQEditableText 
                        text={sq.text}
                        itemKey={`${item.id}-q${sq.id}`}
                        defaultStyle={questionStyle}
                        className="m-0 w-full"
                      />
                      
                      <span className="font-bold text-sm text-[12px] ml-2 shrink-0">
                        {toBengaliDigits(sq.marks)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Attached Alternatives */}
              {item.alternatives && item.alternatives.length > 0 && (
                <AlternativeQuestionRenderer
                  paperId={paperId || ""}
                  parentQuestionId={item.id}
                  alternatives={item.alternatives}
                  settings={settings}
                  masterNumber={masterNum}
                  primaryMarks={totalMarks}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <AddAlternativeModal
        open={showAddAlternative}
        onOpenChange={setShowAddAlternative}
        paperId={paperId || ""}
        primaryQuestionId={item.id}
        primaryQuestionContentId={data.id}
        primaryQuestionType="PBQ"
        subjectId={item.subjectId || distStatus?.subjectId || ""}
        primaryMarks={totalMarks}
        masterNumber={masterNum}
        distributionId={item.distributionId || data.distributionId || distStatus?.distributionId}
      />
    </div>
  );
};
