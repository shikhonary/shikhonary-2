import React from "react";
import type { PaperSettings } from "../../../types";
import { cn } from "@workspace/ui/lib/utils";

const OPTION_LETTER_INDEX_MAP: Record<string, number> = {
  // Bengali letters
  "ক": 0,
  "খ": 1,
  "গ": 2,
  "ঘ": 3,
  "ঙ": 4,
  "চ": 5,

  // English letters
  a: 0,
  b: 1,
  c: 2,
  d: 3,
  e: 4,
  f: 5,

  // Bengali digits
  "১": 0,
  "২": 1,
  "৩": 2,
  "৪": 3,
  "৫": 4,
  "৬": 5,

  // English digits
  "1": 0,
  "2": 1,
  "3": 2,
  "4": 3,
  "5": 4,
  "6": 5,

  // Roman numerals
  i: 0,
  ii: 1,
  iii: 2,
  iv: 3,
  v: 4,
  vi: 5,
};

/** Strips HTML tags, trims, and normalizes whitespace */
function normalizeText(text: string | null | undefined): string {
  if (!text) return "";
  return String(text)
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u00a0\u200b\u200e\u200f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Strips leading option prefixes like "ক)", "(ক)", "ক.", "ক।", "1.", "A)", "(a)", etc.
 * Only strips if there is actual remaining text after the prefix.
 */
function stripOptionPrefix(text: string | null | undefined): string {
  if (!text) return "";
  const clean = normalizeText(text);
  const prefixMatch = clean.match(
    /^[\s([（{<]*([কখগঘঙচabcdefABCDEF১২৩৪৫৬123456]|(?:i{1,3}|iv|v|vi))[\s)\]）}>.:\-–—|।]*(.+)$/i
  );
  if (prefixMatch && prefixMatch[2] && prefixMatch[2].trim().length > 0) {
    return prefixMatch[2].trim();
  }
  return clean;
}

/** Normalizes an answer indicator like "(ক)", "Ans: B", "উত্তর: ৩।" into a clean key */
function cleanAnswerIndicator(text: string | null | undefined): string {
  if (!text) return "";
  let cleaned = normalizeText(text);
  cleaned = cleaned.replace(/^(উত্তর|সঠিক উত্তর|ans|answer)[\s:：\-–—]*/i, "").trim();
  cleaned = cleaned.replace(/^[\(\[\{（<'"“‘]+|[\)\]\}）>'"”’]+$/g, "").trim();
  cleaned = cleaned.replace(/[\.:\-–—\)\]\s|।]+$/, "").trim();
  return cleaned.toLowerCase();
}

/** Determines whether a displayed MCQ option corresponds to the question's correct answer. */
export function isCorrectMcqOption(
  mcqData: {
    answer?: string | null;
    options?: string[] | null;
    shuffledOptions?: string[] | null;
    overrides?: { answer?: string | null; shuffledOptions?: string[] | null } | null;
    contentSnapshot?: { answer?: string | null; options?: string[] | null } | null;
  } | null | undefined,
  displayedOption: string,
  displayedIndex: number
): boolean {
  if (!mcqData) return false;

  const rawAnswer = String(
    mcqData.overrides?.answer ??
    mcqData.answer ??
    mcqData.contentSnapshot?.answer ??
    ""
  ).trim();

  if (!rawAnswer) return false;

  const rawOpt = String(displayedOption ?? "").trim();
  const normOpt = normalizeText(rawOpt);
  const normAnswer = normalizeText(rawAnswer);

  // 1. Direct text equality
  if (normOpt && normAnswer && normOpt.toLowerCase() === normAnswer.toLowerCase()) {
    return true;
  }

  // 2. Text equality after stripping prefixes (e.g. "ক) ঢাকা" vs "ঢাকা")
  const strippedOpt = stripOptionPrefix(rawOpt);
  const strippedAnswer = stripOptionPrefix(rawAnswer);
  if (strippedOpt && strippedAnswer && strippedOpt.toLowerCase() === strippedAnswer.toLowerCase()) {
    return true;
  }
  if (strippedOpt && normAnswer && strippedOpt.toLowerCase() === normAnswer.toLowerCase()) {
    return true;
  }
  if (strippedAnswer && normOpt && strippedAnswer.toLowerCase() === normOpt.toLowerCase()) {
    return true;
  }

  // 3. Answer expressed as an indicator (letter / numeral / label)
  const cleanedIndicator = cleanAnswerIndicator(rawAnswer);
  const mappedIdx = OPTION_LETTER_INDEX_MAP[cleanedIndicator];

  const originalOptions: string[] =
    mcqData.options ??
    mcqData.contentSnapshot?.options ??
    [];

  const isShuffled = Array.isArray(mcqData.shuffledOptions) && mcqData.shuffledOptions.length > 0;

  if (mappedIdx !== undefined) {
    if (isShuffled && originalOptions[mappedIdx] !== undefined) {
      const origTarget = originalOptions[mappedIdx];
      const normOrig = normalizeText(origTarget).toLowerCase();
      const strippedOrig = stripOptionPrefix(origTarget).toLowerCase();

      if (
        normOpt.toLowerCase() === normOrig ||
        strippedOpt.toLowerCase() === strippedOrig ||
        strippedOpt.toLowerCase() === normOrig
      ) {
        return true;
      }
    } else {
      // Natural unshuffled order: match by index
      if (displayedIndex === mappedIdx) {
        return true;
      }
    }
  }

  // 4. If rawAnswer matches text of an option in originalOptions
  if (originalOptions.length > 0) {
    const matchedOriginalIdx = originalOptions.findIndex((opt) => {
      const nOpt = normalizeText(opt).toLowerCase();
      const sOpt = stripOptionPrefix(opt).toLowerCase();
      const nAns = normAnswer.toLowerCase();
      const sAns = strippedAnswer.toLowerCase();
      return nOpt === nAns || sOpt === sAns || sOpt === nAns || nOpt === sAns;
    });

    if (matchedOriginalIdx !== -1) {
      if (isShuffled) {
        const origTarget = originalOptions[matchedOriginalIdx];
        const normOrig = normalizeText(origTarget).toLowerCase();
        const strippedOrig = stripOptionPrefix(origTarget).toLowerCase();
        if (
          normOpt.toLowerCase() === normOrig ||
          strippedOpt.toLowerCase() === strippedOrig ||
          strippedOpt.toLowerCase() === normOrig
        ) {
          return true;
        }
      } else {
        if (displayedIndex === matchedOriginalIdx) {
          return true;
        }
      }
    }
  }

  return false;
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


/**
 * Computes smart adaptive grid classes for MCQ options:
 * - On desktop & print, respects the exact configured column layout (1, 2, or 4 cols).
 * - On mobile (< sm):
 *   - If any option is long (> 14 chars) or contains Math formulas, collapses to 1 column so content never blows out.
 *   - If options are short (e.g. single numbers or short words), keeps 2 columns on mobile.
 */
export function getMcqOptionGridClass(
  columns: number,
  options?: (string | null | undefined)[]
): string {
  if (columns === 1) {
    return "grid-cols-1";
  }

  const opts = options || [];
  const hasFormulasOrMath = opts.some((opt) => {
    if (!opt || typeof opt !== "string") return false;
    return (
      opt.includes("$") ||
      opt.includes("\\") ||
      opt.includes("frac") ||
      opt.includes("sqrt")
    );
  });

  const maxOptionLength = opts.reduce((max, opt) => {
    if (!opt || typeof opt !== "string") return max;
    const cleanText = opt.replace(/<[^>]*>/g, "").replace(/[$_^{}]/g, "").trim();
    return Math.max(max, cleanText.length);
  }, 0);

  const isComplexOrLong = hasFormulasOrMath || maxOptionLength > 14;

  if (columns === 4) {
    if (isComplexOrLong) {
      return "grid-cols-1 sm:grid-cols-4 print:!grid-cols-4";
    }
    return "grid-cols-2 sm:grid-cols-4 print:!grid-cols-4";
  }

  // columns === 2
  if (isComplexOrLong) {
    return "grid-cols-1 sm:grid-cols-2 print:!grid-cols-2";
  }
  return "grid-cols-2 print:!grid-cols-2";
}
