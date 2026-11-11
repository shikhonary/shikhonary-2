import React from "react";
import type { PaperSettings } from "../../../types";

const OPTION_LETTER_INDEX_MAP: Record<string, number> = {
  "1": 0,
  "১": 0,
  "ক": 0,
  a: 0,
  "2": 1,
  "২": 1,
  "খ": 1,
  b: 1,
  "3": 2,
  "৩": 2,
  "গ": 2,
  c: 2,
  "4": 3,
  "৪": 3,
  "ঘ": 3,
  d: 3,
  "5": 4,
  "৫": 4,
  "ঙ": 4,
  e: 4,
  "6": 5,
  "৬": 5,
  "চ": 5,
  f: 5,
};

/** Determines whether a displayed MCQ option corresponds to the question's correct answer. */
export function isCorrectMcqOption(
  mcqData: { answer?: string | null; options?: string[] | null } | null | undefined,
  displayedOption: string,
  displayedIndex: number
): boolean {
  const rawAnswer = String(mcqData?.answer ?? "").trim();
  if (!rawAnswer) return false;

  const optText = String(displayedOption ?? "").trim();
  if (optText && rawAnswer === optText) {
    return true;
  }

  const normalizedKey = rawAnswer
    .replace(/^\(+|\)+$/g, "")
    .replace(/\.$/, "")
    .trim()
    .toLowerCase();

  const mappedIdx = OPTION_LETTER_INDEX_MAP[normalizedKey];
  if (mappedIdx === undefined) return false;

  // Match against the original options array when present so shuffledOptions stay accurate
  if (Array.isArray(mcqData?.options) && mcqData.options[mappedIdx] !== undefined) {
    return String(mcqData.options[mappedIdx]).trim() === optText;
  }

  return displayedIndex === mappedIdx;
}

/** Renders the option indicator (`ক`, `(ক)`, `ক.`, circle, or solid black circle in answer mode). */
export const McqOptionLabel: React.FC<{
  label: string;
  optionStyle?: PaperSettings["optionStyle"];
  isFilledAnswer?: boolean;
}> = ({ label, optionStyle, isFilledAnswer = false }) => {
  if (isFilledAnswer) {
    return (
      <div
        className="shrink-0 flex items-center justify-center rounded-full border border-black leading-none"
        style={{
          width: "1.6em",
          height: "1.6em",
          fontSize: "calc(100% - 2px)",
          marginTop: "2px",
          lineHeight: "1",
          backgroundColor: "#000000",
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
        }}
        aria-label="সঠিক উত্তর"
      />
    );
  }

  switch (optionStyle) {
    case "dot":
      return <span className="shrink-0">{label}.</span>;
    case "parentheses":
      return <span className="shrink-0">({label})</span>;
    case "circle":
      return (
        <div
          className="font-bold shrink-0 flex items-center justify-center rounded-full border border-black/50 leading-none"
          style={{
            width: "1.6em",
            height: "1.6em",
            fontSize: "calc(100% - 2px)",
            marginTop: "2px",
            lineHeight: "1",
          }}
        >
          {label}
        </div>
      );
    case "round":
    default:
      return <span className="shrink-0">{label})</span>;
  }
};
