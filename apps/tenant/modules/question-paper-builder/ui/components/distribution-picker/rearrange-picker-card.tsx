"use client";

import React from "react";
import { getRearrangeIndicator } from "../blocks/rearrange-block";
import { PickerCardWrapper, usePickerContext } from "./picker-card-wrapper";
import { isResourceEnglish } from "@workspace/utils";
import { toEnglishDigits, translateTag } from "./number-in-words-picker-card";
import { RenderMath } from "@workspace/ui/components/render-math";

interface RearrangePickerCardProps {
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

export const RearrangePickerCard: React.FC<RearrangePickerCardProps> = ({
  question: q,
  index,
  isSelected,
  onToggle,
}) => {
  const { isBankMode } = usePickerContext();
  const parseOptions = (opts: any): string[] => {
    if (Array.isArray(opts)) return opts;
    if (typeof opts === "string") {
      try {
        const parsed = JSON.parse(opts);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return [opts];
      }
    }
    return [];
  };

  const options: string[] = parseOptions(q.options);
  const combinedContent = options.join(" ");

  const isEnglish = isResourceEnglish({
    subjectName:
      q.academicSubject?.nameBn ||
      q.subject?.nameBn ||
      q.academicSubject?.nameEn ||
      q.subject?.nameEn,
    subjectNameEn: q.academicSubject?.nameEn || q.subject?.nameEn,
    subjectNameBn: q.academicSubject?.nameBn || q.subject?.nameBn,
    questionTypeLabel: q.questionTypeLabel || q.questionType?.nameBn,
    content: combinedContent,
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
      typeLabel={isEnglish ? "Rearrange" : "পুনর্বিন্যাস"}
      language={isEnglish ? "en" : "bn"}
    
      referenceTags={Array.isArray(q.reference) ? q.reference : []}
      source={q.source}
      session={q.session}
      marks={q.marks}>
      <div className="flex flex-col gap-2.5 font-body">
        {/* Sentences with indicators */}
        <div className="space-y-1">
          {options.map((option, idx) => {
            const indicator = getRearrangeIndicator(idx, isEnglish);
            return (
              <div key={idx} className="flex items-baseline gap-2 text-xs text-on-surface">
                <span className="font-bold text-primary shrink-0 select-none min-w-[2em]">
                  {indicator}
                </span>
                <span className="flex-1 leading-relaxed">
                  <RenderMath text={option} />
                </span>
              </div>
            );
          })}
        </div>

        {/* Answer key if present */}
        {!isBankMode && q.answerKey && (
          <div className="text-xs text-muted-foreground bg-surface-container-low p-2 rounded border border-outline-variant/30 flex items-center gap-1.5 font-mono">
            <span className="font-semibold text-primary font-body mr-1">
              {isEnglish ? "Answer Order:" : "উত্তর ক্রম:"}
            </span>
            <span>{q.answerKey}</span>
          </div>
        )}

        {/* References & Source Footer */}
      </div>
    </PickerCardWrapper>
  );
};
