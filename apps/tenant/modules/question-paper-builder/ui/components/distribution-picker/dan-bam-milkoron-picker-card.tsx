"use client";

import React from "react";
import { RenderDanBamMilkoronTable } from "../blocks/dan-bam-milkoron-block";
import { PickerCardWrapper } from "./picker-card-wrapper";
import { isResourceEnglish } from "@workspace/utils";
import { toEnglishDigits, translateTag } from "./number-in-words-picker-card";

interface DanBamMilkoronPickerCardProps {
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

export const DanBamMilkoronPickerCard: React.FC<DanBamMilkoronPickerCardProps> = ({
  question: q,
  index,
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
      index={index}
      isAssigned={q.isAssigned}
      isSelected={isSelected}
      onToggle={onToggle}
      chapterName={chapterName}
      difficulty={q.difficulty}
      typeLabel={isEnglish ? "Matching" : "ডান-বাম মিলকরণ"}
      language={isEnglish ? "en" : "bn"}
    
      referenceTags={Array.isArray(q.reference) ? q.reference : []}
      source={q.source}
      session={q.session}
      marks={q.marks}>
      <div className="flex flex-col gap-2 font-body">
        <div className="w-full">
          <RenderDanBamMilkoronTable
            leftColumn={leftCol}
            rightColumn={rightCol}
            isEnglish={isEnglish}
          />
        </div>
      </div>
    </PickerCardWrapper>
  );
};
