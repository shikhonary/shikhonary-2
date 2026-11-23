"use client";

import React from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { PickerCardWrapper } from "./picker-card-wrapper";
import { isResourceEnglish } from "@workspace/utils";

interface EssayPickerCardProps {
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

export const EssayPickerCard: React.FC<EssayPickerCardProps> = ({
  question: q,
  index,
  isSelected,
  onToggle,
}) => {
  const chapterName =
    q.academicChapter?.nameBn ||
    q.academicChapter?.nameEn ||
    q.chapter?.nameBn ||
    q.chapter?.nameEn;

  const titleText = q.title || q.name || q.question || "";
  const isEnglish = isResourceEnglish({
    subjectName: q.academicSubject?.nameEn || q.subject?.nameEn || q.academicSubject?.nameBn || q.subject?.nameBn,
    content: titleText,
  });

  return (
    <PickerCardWrapper
      id={q.id}
      index={index}
      isAssigned={q.isAssigned}
      isSelected={isSelected}
      onToggle={onToggle}
      chapterName={chapterName}
      difficulty={q.difficulty}
      typeLabel={isEnglish ? (q.questionType?.nameEn || "Essay") : (q.questionType?.nameBn || "রচনা")}
      language={isEnglish ? "en" : "bn"}
    
      referenceTags={Array.isArray(q.reference) ? q.reference : []}
      source={q.source}
      session={q.session}
      marks={q.marks}>
      <div className="flex flex-col gap-3 font-body">
        <div className="text-sm font-semibold text-foreground leading-relaxed">
          <RenderMath text={titleText} />
        </div>
      </div>
    </PickerCardWrapper>
  );
};
