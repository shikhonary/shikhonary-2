"use client";

import React from "react";
import { RenderDanBamMilkoronTable } from "../blocks/dan-bam-milkoron-block";
import { PickerCardWrapper } from "./picker-card-wrapper";
import { isResourceEnglish } from "@workspace/utils";
import { toEnglishDigits, translateTag } from "./number-in-words-picker-card";

interface DanBamMilkoronPickerCardProps {
  question: any;
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

export const DanBamMilkoronPickerCard: React.FC<DanBamMilkoronPickerCardProps> = ({
  question: q,
  isSelected,
  onToggle,
}) => {
  const parseColumn = (col: any): string[] => {
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

  const leftCol: string[] = parseColumn(q.leftColumn);
  const rightCol: string[] = parseColumn(q.rightColumn);
  const combinedContent = [
    q.prompt,
    q.title,
    ...leftCol,
    ...rightCol,
  ].filter(Boolean).join(" ");

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
      isAssigned={q.isAssigned}
      isSelected={isSelected}
      onToggle={onToggle}
      chapterName={chapterName}
      difficulty={q.difficulty}
      typeLabel={isEnglish ? "Matching" : "ডান-বাম মিলকরণ"}
      language={isEnglish ? "en" : "bn"}
    >
      <div className="flex flex-col gap-2 font-body">
        <div className="w-full">
          <RenderDanBamMilkoronTable
            leftColumn={leftCol}
            rightColumn={rightCol}
            isEnglish={isEnglish}
          />
        </div>

        {/* Reference Tags & Source Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/30 pt-2.5 mt-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {(q.source || q.session) && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[11px] font-semibold border border-primary/20">
                📚 {isEnglish ? translateTag(q.source || "Textbook") : (q.source || "N/A")}
                {q.session ? ` (${isEnglish ? toEnglishDigits(q.session) : toBengaliDigits(q.session)})` : ""}
              </span>
            )}
            {Array.isArray(q.reference) && q.reference.length > 0 ? (
              q.reference.map((ref: string, rIdx: number) => (
                <span
                  key={rIdx}
                  className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant rounded text-[11px] font-medium"
                >
                  🏷️ {isEnglish ? translateTag(ref) : ref}
                </span>
              ))
            ) : (
              !(q.source || q.session) && (
                <span className="text-[11px] text-muted-foreground italic">
                  {isEnglish ? "No reference tags" : "কোনো রেফারেন্স ট্যাগ নেই"}
                </span>
              )
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
            <span>
              {isEnglish ? "Rows:" : "সারি সংখ্যা:"}{" "}
              {isEnglish
                ? (leftCol.length || 0).toString()
                : toBengaliDigits((leftCol.length || 0).toString())}
            </span>
          </div>
        </div>
      </div>
    </PickerCardWrapper>
  );
};
