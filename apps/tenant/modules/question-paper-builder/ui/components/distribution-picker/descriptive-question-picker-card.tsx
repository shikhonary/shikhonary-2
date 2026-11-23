"use client";

import React from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { PickerCardWrapper } from "./picker-card-wrapper";

interface DescriptiveQuestionPickerCardProps {
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

export const DescriptiveQuestionPickerCard: React.FC<DescriptiveQuestionPickerCardProps> = ({
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

  return (
    <PickerCardWrapper
      id={q.id}
      index={index}
      isAssigned={q.isAssigned}
      isSelected={isSelected}
      onToggle={onToggle}
      chapterName={chapterName}
      difficulty={q.difficulty}
    
      referenceTags={Array.isArray(q.reference) ? q.reference : []}
      source={q.source}
      session={q.session}
      marks={q.marks}>
      <div className="flex flex-col gap-2 font-body">
        {/* Question Text */}
        <div className="text-sm font-semibold text-on-surface leading-relaxed py-0.5">
          <RenderMath text={q.question || q.name || q.title || ""} isMath={true} />
        </div>

        {/* Answer Box if available */}
        {q.answer && (
          <div className="text-xs text-muted-foreground/80 bg-muted/30 p-2 rounded border border-border/50 line-clamp-3">
            <span className="font-semibold text-primary">উত্তর: </span>
            <RenderMath text={q.answer} isMath={true} />
          </div>
        )}
      </div>
    </PickerCardWrapper>
  );
};
