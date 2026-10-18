"use client";

import React from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { PickerCardWrapper } from "./picker-card-wrapper";

interface NumberInWordsPickerCardProps {
  question: any;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const toEnglishDigits = (num?: number | string | null): string => {
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

export const NUMBER_TO_ENGLISH_WORDS: Record<number, string> = {
  1: "One", 2: "Two", 3: "Three", 4: "Four", 5: "Five", 6: "Six", 7: "Seven", 8: "Eight", 9: "Nine", 10: "Ten",
  11: "Eleven", 12: "Twelve", 13: "Thirteen", 14: "Fourteen", 15: "Fifteen", 16: "Sixteen", 17: "Seventeen", 18: "Eighteen", 19: "Nineteen", 20: "Twenty",
  21: "Twenty-one", 22: "Twenty-two", 23: "Twenty-three", 24: "Twenty-four", 25: "Twenty-five", 26: "Twenty-six", 27: "Twenty-seven", 28: "Twenty-eight", 29: "Twenty-nine", 30: "Thirty",
  31: "Thirty-one", 32: "Thirty-two", 33: "Thirty-three", 34: "Thirty-four", 35: "Thirty-five", 36: "Thirty-six", 37: "Thirty-seven", 38: "Thirty-eight", 39: "Thirty-nine", 40: "Forty",
  41: "Forty-one", 42: "Forty-two", 43: "Forty-three", 44: "Forty-four", 45: "Forty-five", 46: "Forty-six", 47: "Forty-seven", 48: "Forty-eight", 49: "Forty-nine", 50: "Fifty",
  51: "Fifty-one", 52: "Fifty-two", 53: "Fifty-three", 54: "Fifty-four", 55: "Fifty-five", 56: "Fifty-six", 57: "Fifty-seven", 58: "Fifty-eight", 59: "Fifty-nine", 60: "Sixty",
  61: "Sixty-one", 62: "Sixty-two", 63: "Sixty-three", 64: "Sixty-four", 65: "Sixty-five", 66: "Sixty-six", 67: "Sixty-seven", 68: "Sixty-eight", 69: "Sixty-nine", 70: "Seventy",
  71: "Seventy-one", 72: "Seventy-two", 73: "Seventy-three", 74: "Seventy-four", 75: "Seventy-five", 76: "Seventy-six", 77: "Seventy-seven", 78: "Seventy-eight", 79: "Seventy-nine", 80: "Eighty",
  81: "Eighty-one", 82: "Eighty-two", 83: "Eighty-three", 84: "Eighty-four", 85: "Eighty-five", 86: "Eighty-six", 87: "Eighty-seven", 88: "Eighty-eight", 89: "Eighty-nine", 90: "Ninety",
  91: "Ninety-one", 92: "Ninety-two", 93: "Ninety-three", 94: "Ninety-four", 95: "Ninety-five", 96: "Ninety-six", 97: "Ninety-seven", 98: "Ninety-eight", 99: "Ninety-nine", 100: "One Hundred"
};

export const BENGALI_TO_ENGLISH_WORDS: Record<string, string> = {
  "এক": "One", "দুই": "Two", "তিন": "Three", "চার": "Four", "পাঁচ": "Five",
  "ছয়": "Six", "ছয়": "Six", "সাত": "Seven", "আট": "Eight", "নয়": "Nine", "নয়": "Nine", "দশ": "Ten",
  "এগারো": "Eleven", "বারো": "Twelve", "তেরো": "Thirteen", "চৌদ্দ": "Fourteen", "পনেরো": "Fifteen",
  "ষোলো": "Sixteen", "সতেরো": "Seventeen", "আঠারো": "Eighteen", "উনিশ": "Nineteen", "বিশ": "Twenty",
  "একুশ": "Twenty-one", "বাইশ": "Twenty-two", "তেইশ": "Twenty-three", "চব্বিশ": "Twenty-four",
  "পঁচিশ": "Twenty-five", "ছাব্বিশ": "Twenty-six", "সাতাশ": "Twenty-seven", "আঠাশ": "Twenty-eight",
  "উনত্রিশ": "Twenty-nine", "ত্রিশ": "Thirty", "একত্রিশ": "Thirty-one", "বত্রিশ": "Thirty-two",
  "তেত্রিশ": "Thirty-three", "চৌত্রিশ": "Thirty-four", "পঁয়ত্রিশ": "Thirty-five", "ছত্রিশ": "Thirty-six",
  "সাঁইত্রিশ": "Thirty-seven", "আটত্রিশ": "Thirty-eight", "উনচল্লিশ": "Thirty-nine", "চল্লিশ": "Forty",
  "একচল্লিশ": "Forty-one", "বিয়াল্লিশ": "Forty-two", "বিয়াল্লিশ": "Forty-two", "তেতাল্লিশ": "Forty-three", "চুয়াল্লিশ": "Forty-four", "চুয়াল্লিশ": "Forty-four",
  "পঁয়তাল্লিশ": "Forty-five", "পঁয়তাল্লিশ": "Forty-five", "ছেচল্লিশ": "Forty-six", "সাতচল্লিশ": "Forty-seven", "আটচল্লিশ": "Forty-eight",
  "উনপঞ্চাশ": "Forty-nine", "পঞ্চাশ": "Fifty", "একান্ন": "Fifty-one", "বায়ান্ন": "Fifty-two", "বায়ান্ন": "Fifty-two",
  "তিপ্পান্ন": "Fifty-three", "চুয়ান্ন": "Fifty-four", "চুয়ান্ন": "Fifty-four", "পঞ্চান্ন": "Fifty-five", "ছাপ্পান্ন": "Fifty-six",
  "সাতান্ন": "Fifty-seven", "আটান্ন": "Fifty-eight", "উনষাট": "Fifty-nine", "ষাট": "Sixty",
  "একষট্টি": "Sixty-one", "বাষট্টি": "Sixty-two", "তেষট্টি": "Sixty-three", "চৌষট্টি": "Sixty-four",
  "পঁয়ষট্টি": "Sixty-five", "পঁয়ষট্টি": "Sixty-five", "ছেষট্টি": "Sixty-six", "সাতষট্টি": "Sixty-seven", "আটষট্টি": "Sixty-eight",
  "উনসত্তর": "Sixty-nine", "সত্তর": "Seventy", "একাত্তর": "Seventy-one", "বাহাত্তর": "Seventy-two",
  "তিয়াত্তর": "Seventy-three", "তেহাত্তর": "Seventy-three", "চুয়াত্তর": "Seventy-four", "চুহাত্তর": "Seventy-four", "পঁচাত্তর": "Seventy-five", "ছিয়াত্তর": "Seventy-six", "ছিয়াত্তর": "Seventy-six",
  "সাতাত্তর": "Seventy-seven", "আটাত্তর": "Seventy-eight", "ঊনআশি": "Seventy-nine", "উনআশি": "Seventy-nine",
  "আশি": "Eighty", "একাশি": "Eighty-one", "বিরাশি": "Eighty-two", "তিরাশি": "Eighty-three",
  "চুরাশি": "Eighty-four", "পঁচাশি": "Eighty-five", "ছিয়াশি": "Eighty-six", "ছিয়াশি": "Eighty-six", "সাতাশি": "Eighty-seven",
  "আটাশি": "Eighty-eight", "ঊননব্বই": "Eighty-nine", "উননব্বই": "Eighty-nine", "নব্বই": "Ninety",
  "একানব্বই": "Ninety-one", "বানব্বই": "Ninety-two", "বায়ানব্বই": "Ninety-two", "তিরানব্বই": "Ninety-three", "চুরানব্বই": "Ninety-four",
  "পঁচানব্বই": "Ninety-five", "ছিয়ানব্বই": "Ninety-six", "ছিয়ানব্বই": "Ninety-six", "সাতানব্বই": "Ninety-seven", "আটানব্বই": "Ninety-eight",
  "নিরানব্বই": "Ninety-nine", "একশত": "One Hundred", "একশো": "One Hundred"
};

export const translateTag = (tag: string): string => {
  if (tag === "পাঠ্যবই") return "Textbook";
  if (tag === "বোর্ড পরীক্ষা") return "Board Exam";
  if (tag === "প্রাথমিক গণিত") return "Primary Mathematics";
  if (tag === "সহায়ক সংকলন") return "Supplementary";
  if (tag.includes("কথায়") || tag.includes("কথায়")) return "Numbers in Words (1-100)";
  return tag;
};

export const formatNumberInWords = (q: any) => {
  const rawNumber = q?.number || q?.num || q?.title || q?.name || q?.question || "";
  const numberText = toEnglishDigits(rawNumber);
  const numInt = parseInt(numberText, 10);

  let inWordsText = q?.inWords || q?.meaning || "";
  if (!isNaN(numInt) && NUMBER_TO_ENGLISH_WORDS[numInt]) {
    inWordsText = NUMBER_TO_ENGLISH_WORDS[numInt];
  } else if (inWordsText && /[\u0980-\u09FF]/.test(inWordsText)) {
    const trimmed = inWordsText.trim();
    inWordsText = BENGALI_TO_ENGLISH_WORDS[trimmed] || inWordsText;
  }

  return { numberText, inWordsText };
};

export const NumberInWordsPickerCard: React.FC<NumberInWordsPickerCardProps> = ({
  question: q,
  isSelected,
  onToggle,
}) => {
  const rawChapterName =
    q.academicChapter?.nameEn ||
    q.chapter?.nameEn ||
    q.academicChapter?.nameBn ||
    q.chapter?.nameBn;

  const chapterName = rawChapterName
    ? translateTag(rawChapterName)
    : "Numbers in Words (1-100)";

  const { numberText, inWordsText } = formatNumberInWords(q);

  return (
    <PickerCardWrapper
      id={q.id}
      isAssigned={q.isAssigned}
      isSelected={isSelected}
      onToggle={onToggle}
      chapterName={chapterName}
      typeLabel="Number in Words"
      difficulty={q.difficulty}
      language="en"
    >
      <div className="flex flex-col gap-2 font-body">
        {/* Number Box */}
        <div className="text-sm text-on-surface leading-relaxed py-0.5">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="whitespace-pre-wrap font-bold text-lg text-primary leading-snug">
              <RenderMath text={numberText} isMath={true} />
            </span>
            {inWordsText && (
              <span className="text-sm font-semibold text-muted-foreground">
                ({inWordsText})
              </span>
            )}
          </div>
        </div>

        {/* Reference Tags & Source Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/30 pt-2.5 mt-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {(q.source || q.session) && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[11px] font-semibold border border-primary/20">
                📚 {translateTag(q.source || "Textbook")}
                {q.session ? ` (${toEnglishDigits(q.session)})` : ""}
              </span>
            )}
            {Array.isArray(q.reference) && q.reference.length > 0 ? (
              q.reference.map((ref: string, rIdx: number) => (
                <span
                  key={rIdx}
                  className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant rounded text-[11px] font-medium"
                >
                  🏷️ {translateTag(ref)}
                </span>
              ))
            ) : (
              !(q.source || q.session) && (
                <span className="text-[11px] text-muted-foreground italic">
                  No reference tags
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </PickerCardWrapper>
  );
};
