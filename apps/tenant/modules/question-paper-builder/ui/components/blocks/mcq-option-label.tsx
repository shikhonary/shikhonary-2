import React from "react";
import type { PaperSettings } from "../../../types";
import { cn } from "@workspace/ui/lib/utils";

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

export interface McqOptionLabelProps {
  label: string;
  optionStyle?: PaperSettings["optionStyle"];
  isFilledAnswer?: boolean;
  fontSize?: string | number;
  baseFontSize?: string | number;
  fontFamily?: string;
  style?: React.CSSProperties;
  className?: string;
}

/** Computes option indicator font size (1pt lower than the given base/paper font size). */
export function getIndicatorFontSize(baseFontSize?: string | number | null): string | undefined {
  if (baseFontSize === undefined || baseFontSize === null || baseFontSize === "") return undefined;
  const num = typeof baseFontSize === "number" ? baseFontSize : parseFloat(String(baseFontSize));
  if (isNaN(num)) return typeof baseFontSize === "string" ? baseFontSize : undefined;
  return `${Math.max(4, Math.round((num - 1) * 100) / 100)}pt`;
}

/** Renders the option indicator (`ক`, `(ক)`, `ক.`, circle, or solid black circle in answer mode). */
export const McqOptionLabel: React.FC<McqOptionLabelProps> = ({
  label,
  optionStyle = "round",
  isFilledAnswer = false,
  fontSize,
  baseFontSize,
  fontFamily,
  style,
  className,
}) => {
  const resolvedFontSize = fontSize ?? (baseFontSize !== undefined ? getIndicatorFontSize(baseFontSize) : undefined);
  const sizeStyle = resolvedFontSize 
    ? (typeof resolvedFontSize === "number" ? `${resolvedFontSize}pt` : resolvedFontSize) 
    : undefined;

  if (isFilledAnswer) {
    return (
      <div
        className={cn(
          "shrink-0 flex items-center justify-center rounded-full border border-black leading-none p-0",
          className
        )}
        style={{
          width: "1.35em",
          height: "1.35em",
          minWidth: "1.35em",
          maxWidth: "1.35em",
          minHeight: "1.35em",
          maxHeight: "1.35em",
          aspectRatio: "1 / 1",
          padding: 0,
          boxSizing: "border-box",
          fontSize: sizeStyle,
          fontFamily,
          marginTop: "0.08em",
          lineHeight: "1",
          borderColor: "#000000",
          backgroundColor: "#000000",
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
          ...style,
        }}
        aria-label="সঠিক উত্তর"
      />
    );
  }

  switch (optionStyle) {
    case "dot":
      return (
        <span
          className={cn("shrink-0 font-medium select-none text-black inline-flex items-baseline", className)}
          style={{
            fontSize: sizeStyle,
            fontFamily,
            lineHeight: "inherit",
            color: "#000000",
            ...style,
          }}
        >
          {label}.
        </span>
      );

    case "parentheses":
      return (
        <span
          className={cn("shrink-0 font-medium select-none text-black inline-flex items-baseline", className)}
          style={{
            fontSize: sizeStyle,
            fontFamily,
            lineHeight: "inherit",
            color: "#000000",
            ...style,
          }}
        >
          ({label})
        </span>
      );

    case "circle":
      return (
        <div
          className={cn(
            "font-bold shrink-0 grid place-items-center rounded-full border border-black select-none text-black p-0",
            className
          )}
          style={{
            fontSize: sizeStyle,
            fontFamily,
            color: "#000000",
            borderColor: "#000000",
            width: "1.35em",
            height: "1.35em",
            minWidth: "1.35em",
            maxWidth: "1.35em",
            minHeight: "1.35em",
            maxHeight: "1.35em",
            aspectRatio: "1 / 1",
            padding: 0,
            marginTop: "0.08em",
            lineHeight: 1,
            boxSizing: "border-box",
            ...style,
          }}
        >
          <span
            className="flex items-center justify-center select-none w-full h-full text-center"
            style={{
              fontSize: "0.82em",
              lineHeight: 1,
              padding: 0,
              margin: 0,
              transform: "translateY(0.095em)",
            }}
          >
            {label}
          </span>
        </div>
      );

    case "round":
    default:
      return (
        <span
          className={cn("shrink-0 font-medium select-none text-black inline-flex items-baseline", className)}
          style={{
            fontSize: sizeStyle,
            fontFamily,
            lineHeight: "inherit",
            color: "#000000",
            ...style,
          }}
        >
          {label})
        </span>
      );
  }
};
