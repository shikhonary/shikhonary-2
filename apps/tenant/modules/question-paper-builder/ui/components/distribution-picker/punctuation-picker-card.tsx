"use client";

import React from "react";
import { RenderPunctuationContent } from "../blocks/punctuation-block";
import { PickerCardWrapper, usePickerContext } from "./picker-card-wrapper";
import { RenderMath } from "@workspace/ui/components/render-math";
import { isResourceEnglish } from "@workspace/utils";
import { toEnglishDigits, translateTag } from "./number-in-words-picker-card";

interface PunctuationPickerCardProps {
  question: any;
  index?: number;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "";
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .split("")
    .map((char) => (/\d/.test(char) ? bengaliDigits[parseInt(char)] : char))
    .join("");
};

export const PunctuationPickerCard: React.FC<PunctuationPickerCardProps> = ({
  question: q,
  index,
  isSelected,
  onToggle,
}) => {
  const { isBankMode } = usePickerContext();
  const mainText = q.rawText || q.content || q.prompt || "";
  const promptText = q.prompt && q.prompt !== q.rawText && q.prompt !== q.content ? q.prompt : "";
  const answerText = q.answerText || q.answer || "";

  const isEnglish = isResourceEnglish({
    subjectName: q.academicSubject?.nameEn || q.subject?.nameEn || q.academicSubject?.nameBn || q.subject?.nameBn,
    content: mainText,
  });

  const rawChapterName = isEnglish
    ? (q.academicChapter?.nameEn || q.chapter?.nameEn || q.academicChapter?.nameBn || q.chapter?.nameBn)
    : (q.academicChapter?.nameBn || q.academicChapter?.nameEn || q.chapter?.nameBn || q.chapter?.nameEn);

  const chapterName = rawChapterName && isEnglish ? translateTag(rawChapterName) : rawChapterName;

  return (
    <PickerCardWrapper
      id={q.id}
      index={index}
      isAssigned={q.isAssigned}
      isSelected={isSelected}
      onToggle={onToggle}
      chapterName={chapterName}
      difficulty={q.difficulty}
      typeLabel={isEnglish ? "Punctuation" : "বিরাম চিহ্ন"}
      language={isEnglish ? "en" : "bn"}
    
      referenceTags={Array.isArray(q.reference) ? q.reference : []}
      source={q.source}
      session={q.session}
      marks={q.marks}>
      <div className="flex flex-col gap-2.5 font-body">
        {/* Optional Prompt header if present */}
        {promptText && (
          <div className="text-xs text-muted-foreground font-semibold">
            <RenderMath text={promptText} />
          </div>
        )}

        {/* Main Raw Text */}
        <div className="text-sm font-medium text-on-surface leading-relaxed whitespace-pre-wrap">
          <RenderPunctuationContent text={mainText} />
        </div>

        {/* Answer preview if present */}
        {!isBankMode && answerText && (
          <div className="text-xs text-muted-foreground bg-surface-container-low p-2 rounded border border-outline-variant/30">
            <span className="font-semibold text-primary mr-1">Ans:</span>
            <RenderMath text={answerText} />
          </div>
        )}

        {/* References & Source Footer */}
      </div>
    </PickerCardWrapper>
  );
};
