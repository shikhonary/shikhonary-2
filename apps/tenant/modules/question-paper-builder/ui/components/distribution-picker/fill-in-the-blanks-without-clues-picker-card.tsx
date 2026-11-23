"use client";

import React from "react";
import { RenderFillInTheBlanksContent } from "../blocks/fill-in-the-blanks-with-clues-block";
import { PickerCardWrapper } from "./picker-card-wrapper";

interface FillInTheBlanksWithoutCluesPickerCardProps {
  question: any;
  index?: number;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const FillInTheBlanksWithoutCluesPickerCard: React.FC<FillInTheBlanksWithoutCluesPickerCardProps> = ({
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
      typeLabel={q.questionType?.nameBn || "শূন্যস্থান পূরণ (ক্লু ছাড়া)"}
      difficulty={q.difficulty}
      marks={q.marks || 5}
      referenceTags={Array.isArray(q.reference) ? q.reference : []}
      source={q.source}
      session={q.session}
    >
      <div className="flex flex-col gap-2 font-body">
        {/* Formatted Content Preview */}
        <div className="text-xs sm:text-sm font-medium text-foreground leading-relaxed whitespace-pre-wrap py-0.5">
          <RenderFillInTheBlanksContent text={q.content || ""} isMath={q.isMath} />
        </div>
      </div>
    </PickerCardWrapper>
  );
};
