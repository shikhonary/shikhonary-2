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
import { isResourceEnglish } from "@workspace/utils";

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

const ENGLISH_ROW_LABELS = ["(a)", "(b)", "(c)", "(d)", "(e)", "(f)", "(g)", "(h)", "(i)", "(j)"];
const ENGLISH_NUM_LABELS = [
  "(i)", "(ii)", "(iii)", "(iv)", "(v)", "(vi)", "(vii)", "(viii)", "(ix)", "(x)",
  "(xi)", "(xii)", "(xiii)", "(xiv)", "(xv)"
];

export const parseDanBamColumn = (col: any): string[] => {
  if (Array.isArray(col)) return col;
  if (typeof col === "string") {
    try {
      const parsed = JSON.parse(col);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [col];
    }
  }
  return [];
};

/**
 * 2-column examination table grid layout for Dan-Bam Milkoron (Matching Columns)
 */
export function RenderDanBamMilkoronTable({
  leftColumn = [],
  rightColumn = [],
  className = "",
  style,
  isEnglish: propIsEnglish,
}: {
  leftColumn?: string[];
  rightColumn?: string[];
  className?: string;
  style?: React.CSSProperties;
  isEnglish?: boolean;
}) {
  const safeLeft = parseDanBamColumn(leftColumn);
  const safeRight = parseDanBamColumn(rightColumn);
  const maxRows = Math.max(safeLeft.length, safeRight.length);
  if (maxRows === 0) return null;

  const isEnglish =
    propIsEnglish !== undefined
      ? propIsEnglish
      : isResourceEnglish({
          content: `${safeLeft.join(" ")} ${safeRight.join(" ")}`.trim(),
        });

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
              {isEnglish ? "Column A" : "বামপাশ"}
            </th>
            <th
              className="border border-black px-2.5 py-1 text-black font-bold text-center w-1/2 align-middle"
              style={style ? { fontSize: style.fontSize, fontFamily: style.fontFamily } : undefined}
            >
              {isEnglish ? "Column B" : "ডানপাশ"}
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: maxRows }).map((_, rIdx) => {
            const valLeft = safeLeft?.[rIdx] || "";
            const valRight = safeRight?.[rIdx] || "";
            const leftLabel = isEnglish
              ? ENGLISH_ROW_LABELS[rIdx] || (rIdx < 26 ? `(${String.fromCharCode(97 + rIdx)})` : `(${rIdx + 1})`)
              : BENGALI_ROW_LABELS[rIdx] || `(${toBengaliDigits(rIdx + 1)})`;
            const rightLabel = isEnglish
              ? ENGLISH_NUM_LABELS[rIdx] || `(${rIdx + 1})`
              : BENGALI_NUM_LABELS[rIdx] || `(${toBengaliDigits(rIdx + 1)})`;

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
    if ((data.mark ?? data.marks ?? data.totalMarks) !== undefined && (data.mark ?? data.marks ?? data.totalMarks) !== null) {
      return Number(data.mark ?? data.marks ?? data.totalMarks);
    }
    return defaultMark;
  };

  const defaultMark = Number(
    distStatus?.marksPerQuestion ??
    item.distribution?.marksPerQuestion ??
    item.marksPerQuestion ??
    item.assignedMarks ??
    data.mark ??
    data.marks ??
    data.totalMarks ??
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

  const isFirstItem = item.isFirstDanBamMilkoron !== undefined ? item.isFirstDanBamMilkoron : (item.orderIndex === 0);
  const masterNum = item.masterNumber || (item.orderIndex !== undefined ? item.orderIndex + 1 : 1);
  const [showAddAlternative, setShowAddAlternative] = useState(false);

  const defaultBnLabel = "বাম পাশের বাক্যাংশের সাথে ডান পাশের বাক্যাংশ মিল করে বাক্য লেখো:";
  const defaultEnLabel = "Match the phrases from Column A with Column B to make complete sentences:";

  // Dynamic question type label resolving from distStatus or item
  const rawLabel =
    distStatus?.questionTypeLabel ||
    item.distribution?.questionTypeLabel ||
    item.questionTypeLabel ||
    distStatus?.questionTypeName ||
    item.distribution?.questionTypeName ||
    distStatus?.questionType?.nameBn ||
    item.distribution?.questionType?.nameBn ||
    distStatus?.questionType?.nameEn ||
    item.distribution?.questionType?.nameEn;

  const leftCol: string[] = parseDanBamColumn(data.leftColumn);
  const rightCol: string[] = parseDanBamColumn(data.rightColumn);
  const combinedContent = [
    data.prompt,
    data.title,
    ...leftCol,
    ...rightCol,
  ].filter(Boolean).join(" ");

  // Dynamic language resolution
  const isEnglish = isResourceEnglish({
    subjectName: distStatus?.subjectName || item.distribution?.subjectName || item.subjectName,
    questionTypeLabel: rawLabel,
    content: combinedContent,
  });

  const initialLabel =
    isEnglish && (!rawLabel || rawLabel === defaultBnLabel)
      ? defaultEnLabel
      : !isEnglish && (!rawLabel || rawLabel === defaultEnLabel)
        ? defaultBnLabel
        : rawLabel;

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
          title={isEnglish ? "Add alternative (Or) question" : "বিকল্প (অথবা) প্রশ্ন যুক্ত করুন"}
        >
          <Split className="w-3 h-3" />
          {isEnglish ? "Or" : "অথবা"}
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
              {isEnglish ? `${masterNum}.` : `${toBengaliDigits(masterNum)}।`}
            </span>
            <EditableSectionLabel
              distributionId={item.distributionId || data.distributionId || item.distribution?.id}
              initialLabel={initialLabel}
              fallbackLabel={isEnglish ? defaultEnLabel : defaultBnLabel}
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
                attemptCount
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
            {attemptCount > 1
              ? isEnglish
                ? `${marksPerQuestion} × ${attemptCount} = ${marksPerQuestion * attemptCount}`
                : `${toBengaliDigits(marksPerQuestion)} × ${toBengaliDigits(attemptCount)} = ${toBengaliDigits(marksPerQuestion * attemptCount)}`
              : isEnglish
                ? marksPerQuestion * (attemptCount || 1)
                : toBengaliDigits(marksPerQuestion * (attemptCount || 1))}
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
              {isEnglish ? `${masterNum}.` : `${toBengaliDigits(masterNum)}।`}
            </span>

            <div className="flex-1 w-full min-w-0 flex flex-col items-center">
              {/* 2-column table */}
              <RenderDanBamMilkoronTable
                leftColumn={leftCol}
                rightColumn={rightCol}
                isEnglish={isEnglish}
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
            masterNumber={masterNum}
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
          distributionId={item.distributionId || data.distributionId || distStatus?.distributionId}
          primaryQuestionId={item.id}
          primaryQuestionContentId={data.id}
          primaryQuestionType="DAN_BAM_MILKORON"
          subjectId={item.subjectId || distStatus?.subjectId || ""}
          primaryMarks={marksPerQuestion}
          masterNumber={masterNum}
        />
      )}
    </div>
  );
};
