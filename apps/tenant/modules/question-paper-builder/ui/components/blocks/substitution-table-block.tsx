"use client";

import React, { useState } from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { useBuilderStore } from "../../../store/use-builder-store";
import { Trash2, Loader2, Split } from "lucide-react";
import { useRemoveQuestion, useQuestionPaperDistributionStatuses } from "@/modules/question-paper/services/use-question-paper";
import { AlternativeQuestionRenderer } from "./alternative-question-renderer";
import { AddAlternativeModal } from "../modals/add-alternative-modal";
import { EditableSectionLabel } from "./editable-section-label";
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

/**
 * 3-column table grid layout for Substitution Table
 */
export function RenderSubstitutionTable({
  columnA = [],
  columnB = [],
  columnC = [],
  className = "",
  style,
}: {
  columnA?: string[];
  columnB?: string[];
  columnC?: string[];
  className?: string;
  style?: React.CSSProperties;
}) {
  const maxRows = Math.max(columnA?.length || 0, columnB?.length || 0, columnC?.length || 0);
  if (maxRows === 0) return null;

  return (
    <div className={cn("w-full max-w-3xl overflow-x-auto my-1.5", className)}>
      <table
        className="w-full table-auto border-collapse border border-black text-left bg-white text-sm"
        style={style}
      >
        <tbody>
          {Array.from({ length: maxRows }).map((_, rIdx) => {
            const valA = columnA?.[rIdx] || "";
            const valB = columnB?.[rIdx] || "";
            const valC = columnC?.[rIdx] || "";

            return (
              <tr key={rIdx}>
                <td
                  className="border border-black px-2.5 py-1 text-black align-top font-medium leading-normal break-words"
                  style={style ? { fontSize: style.fontSize, fontFamily: style.fontFamily } : undefined}
                >
                  {valA ? <RenderMath text={valA} /> : ""}
                </td>
                <td
                  className="border border-black px-2.5 py-1 text-black align-top font-medium leading-normal break-words"
                  style={style ? { fontSize: style.fontSize, fontFamily: style.fontFamily } : undefined}
                >
                  {valB ? <RenderMath text={valB} /> : ""}
                </td>
                <td
                  className="border border-black px-2.5 py-1 text-black align-top font-medium leading-normal break-words"
                  style={style ? { fontSize: style.fontSize, fontFamily: style.fontFamily } : undefined}
                >
                  {valC ? <RenderMath text={valC} /> : ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export const SubstitutionTableBlock = ({ item }: { item: any }) => {
  const paperId = useBuilderStore((state) => state.paperId);
  const settings = useBuilderStore((state) => state.settings);
  const data = item.data || {};

  const { mutate: removeQuestion, isPending: isRemoving } = useRemoveQuestion();
  const { data: statuses } = useQuestionPaperDistributionStatuses(paperId || "");
  const distStatus = statuses?.find((s: any) => s.distributionId === (item.distributionId || data.distributionId || item.distribution?.id));

  const marksPerQuestion = Number(
    item.assignedMarks ??
    item.marksPerQuestion ??
    distStatus?.marksPerQuestion ??
    item.distribution?.marksPerQuestion ??
    0
  );

  const attemptCount = Number(
    (distStatus as any)?.questionsToAttempt ??
    item.distribution?.questionsToAttempt ??
    item.attemptCount ??
    distStatus?.targetCount ??
    item.totalQuestions ??
    1
  );

  const handleRemove = () => {
    if (!paperId) return;
    removeQuestion({
      questionPaperId: paperId,
      questionId: data.id || item.id,
      questionType: "SUBSTITUTION_TABLE",
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

  const subLabels = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
  const label = subLabels[item.orderIndex] || "";

  const renderSubQuestionLabel = (labelStr: string) => {
    const cleanLabel = (labelStr || "").replace(/^\(+|\)+$/g, "").trim();
    return (
      <span
        className="font-bold shrink-0 min-w-[1.6em]"
        style={{
          fontSize: questionStyle.fontSize,
          fontFamily: questionStyle.fontFamily,
          lineHeight: questionStyle.lineHeight,
        }}
      >
        ({cleanLabel})
      </span>
    );
  };

  const isFirstItem = item.isFirstSubstitutionTable ?? item.orderIndex === 0;
  const [showAddAlternative, setShowAddAlternative] = useState(false);

  return (
    <div className={`group relative -mx-4 px-4 hover:bg-muted/10 rounded-lg transition-colors flex flex-col break-inside-avoid ${isFirstItem ? "pt-0.5 pb-0" : "py-0 my-0"}`}>
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

      {isFirstItem && (
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
              initialLabel={item.questionTypeLabel || distStatus?.questionTypeLabel}
              fallbackLabel="Make meaningful sentences using parts of sentences given in the following substitution table:"
              questionType="SUBSTITUTION_TABLE"
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
            {marksPerQuestion * (attemptCount || 1)}
          </div>
        </div>
      )}

      {/* QUESTION CONTENT */}
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
              {item.masterNumber || 1}.
            </span>
            {item.totalQuestions > 1 && renderSubQuestionLabel(label)}
            
            <div className="flex-1 w-full min-w-0 flex flex-col items-center">
              {/* 3-column table */}
              <RenderSubstitutionTable
                columnA={data.columnA || []}
                columnB={data.columnB || []}
                columnC={data.columnC || []}
                style={{
                  fontSize: questionStyle.fontSize,
                  fontFamily: questionStyle.fontFamily,
                  lineHeight: questionStyle.lineHeight,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ALTERNATIVE QUESTIONS (OR Questions) */}
      {item.alternatives && item.alternatives.length > 0 && (
        <div className="w-full mt-1">
          <AlternativeQuestionRenderer
            paperId={paperId || ""}
            parentQuestionId={item.id}
            alternatives={item.alternatives}
            settings={settings}
            masterNumber={item.masterNumber}
            primaryMarks={marksPerQuestion}
          />
        </div>
      )}

      {/* ADD ALTERNATIVE MODAL */}
      {showAddAlternative && (
        <AddAlternativeModal
          open={showAddAlternative}
          onOpenChange={setShowAddAlternative}
          paperId={paperId || ""}
          distributionId={item.distributionId}
          primaryQuestionId={item.id}
          primaryQuestionContentId={data.id}
          primaryQuestionType="SUBSTITUTION_TABLE"
          subjectId={item.subjectId}
          primaryMarks={marksPerQuestion}
          masterNumber={item.masterNumber}
        />
      )}
    </div>
  );
};
