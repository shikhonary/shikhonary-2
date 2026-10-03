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

const BENGALI_ROW_LABELS = ["(ক)", "(খ)", "(গ)", "(ঘ)", "(ঙ)", "(চ)", "(ছ)", "(জ)", "(ঝ)", "(ঞ)"];
const BENGALI_NUM_LABELS = ["(১)", "(২)", "(৩)", "(৪)", "(৫)", "(৬)", "(৭)", "(৮)", "(৯)", "(১০)"];

/**
 * 2-column examination table grid layout for Dan-Bam Milkoron (Matching Columns)
 */
export function RenderDanBamMilkoronTable({
  leftColumn = [],
  rightColumn = [],
  className = "",
  style,
}: {
  leftColumn?: string[];
  rightColumn?: string[];
  className?: string;
  style?: React.CSSProperties;
}) {
  const maxRows = Math.max(leftColumn?.length || 0, rightColumn?.length || 0);
  if (maxRows === 0) return null;

  return (
    <div className={cn("w-full max-w-3xl overflow-x-auto my-1.5", className)}>
      <table
        className="w-full table-auto border-collapse border border-black text-left bg-white text-sm"
        style={style}
      >
        <thead>
          <tr className="border-b border-black">
            <th
              className="border border-black px-2.5 py-1 text-black font-bold text-center w-1/2 align-middle"
              style={style ? { fontSize: style.fontSize, fontFamily: style.fontFamily } : undefined}
            >
              বামপাশ
            </th>
            <th
              className="border border-black px-2.5 py-1 text-black font-bold text-center w-1/2 align-middle"
              style={style ? { fontSize: style.fontSize, fontFamily: style.fontFamily } : undefined}
            >
              ডানপাশ
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: maxRows }).map((_, rIdx) => {
            const valLeft = leftColumn?.[rIdx] || "";
            const valRight = rightColumn?.[rIdx] || "";
            const leftLabel = BENGALI_ROW_LABELS[rIdx] || `(${toBengaliDigits(rIdx + 1)})`;
            const rightLabel = BENGALI_NUM_LABELS[rIdx] || `(${toBengaliDigits(rIdx + 1)})`;

            return (
              <tr key={rIdx}>
                <td
                  className="border border-black px-2.5 py-1 text-black align-top font-medium leading-normal break-words"
                  style={style ? { fontSize: style.fontSize, fontFamily: style.fontFamily } : undefined}
                >
                  {valLeft ? (
                    <div className="flex items-start gap-1.5">
                      <span className="font-bold shrink-0 select-none">{leftLabel}</span>
                      <span className="flex-1 leading-normal">
                        <RenderMath text={valLeft} />
                      </span>
                    </div>
                  ) : (
                    ""
                  )}
                </td>
                <td
                  className="border border-black px-2.5 py-1 text-black align-top font-medium leading-normal break-words"
                  style={style ? { fontSize: style.fontSize, fontFamily: style.fontFamily } : undefined}
                >
                  {valRight ? (
                    <div className="flex items-start gap-1.5">
                      <span className="font-bold shrink-0 select-none">{rightLabel}</span>
                      <span className="flex-1 leading-normal">
                        <RenderMath text={valRight} />
                      </span>
                    </div>
                  ) : (
                    ""
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export const DanBamMilkoronBlock = ({ item }: { item: any }) => {
  const paperId = useBuilderStore((state) => state.paperId);
  const settings = useBuilderStore((state) => state.settings);
  const data = item.data || {};

  const { mutate: removeQuestion, isPending: isRemoving } = useRemoveQuestion();
  const { data: statuses } = useQuestionPaperDistributionStatuses(paperId || "");
  const distStatus = statuses?.find(
    (s: any) => s.distributionId === (item.distributionId || data.distributionId || item.distribution?.id)
  );

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
      questionType: "DAN_BAM_MILKORON",
    });
  };

  const getQuestionStyle = () => {
    return {
      fontSize: settings.fontSize,
      fontFamily: settings.fontFamily,
      textAlign: "left" as const,
      lineHeight: settings.lineHeight,
      fontWeight: settings.fontWeight || "normal",
    };
  };

  const questionStyle = getQuestionStyle();

  const isFirstItem = item.isFirstDanBamMilkoron ?? item.orderIndex === 0;
  const [showAddAlternative, setShowAddAlternative] = useState(false);

  return (
    <div
      className={`group relative -mx-4 px-4 hover:bg-muted/10 rounded-lg transition-colors flex flex-col break-inside-avoid ${
        isFirstItem ? "pt-0.5 pb-0" : "py-0 my-0"
      }`}
    >
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
          className={`px-2 py-1 text-xs hover:bg-destructive/10 transition-colors text-destructive flex items-center gap-1 ${
            isRemoving ? "opacity-50" : ""
          }`}
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
              {toBengaliDigits(item.masterNumber || 1)}।
            </span>
            <EditableSectionLabel
              distributionId={item.distributionId || data.distributionId || item.distribution?.id}
              initialLabel={
                distStatus?.questionTypeLabel ||
                item.distribution?.questionTypeLabel ||
                item.questionTypeLabel
              }
              fallbackLabel="বাম পাশের বাক্যাংশের সাথে ডান পাশের বাক্যাংশ মিল করে বাক্য লেখো:"
              questionType="DAN_BAM_MILKORON"
              questionCount={
                distStatus?.questionCount ??
                item.distribution?.questionCount ??
                distStatus?.targetCount ??
                item.totalQuestions
              }
              questionsToAttempt={
                (distStatus as any)?.questionsToAttempt ??
                item.distribution?.questionsToAttempt ??
                item.attemptCount
              }
              style={{
                fontSize: questionStyle.fontSize,
                fontFamily: questionStyle.fontFamily,
              }}
            />
          </div>
          <div
            className="font-bold whitespace-nowrap text-right shrink-0 ml-2"
            style={{
              fontSize: questionStyle.fontSize,
              fontFamily: questionStyle.fontFamily,
            }}
          >
            {toBengaliDigits(marksPerQuestion * (attemptCount || 1))}
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
              {toBengaliDigits(item.masterNumber || 1)}।
            </span>

            <div className="flex-1 w-full min-w-0 flex flex-col items-center">
              {/* 2-column table */}
              <RenderDanBamMilkoronTable
                leftColumn={data.leftColumn || []}
                rightColumn={data.rightColumn || []}
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
          primaryQuestionType="DAN_BAM_MILKORON"
          subjectId={item.subjectId}
          primaryMarks={marksPerQuestion}
          masterNumber={item.masterNumber}
        />
      )}
    </div>
  );
};
