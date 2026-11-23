"use client";

import React from "react";
import { RenderFillInTheBlanksContent, RenderCluesTable } from "../blocks/fill-in-the-blanks-with-clues-block";
import { PickerCardWrapper } from "./picker-card-wrapper";

interface FillInTheBlanksWithCluesPickerCardProps {
  question: any;
  index?: number;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const FillInTheBlanksWithCluesPickerCard: React.FC<FillInTheBlanksWithCluesPickerCardProps> = ({
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
      typeLabel={q.questionType?.nameBn || "শূন্যস্থান পূরণ (ক্লু সহ)"}
      difficulty={q.difficulty}
      marks={q.marks || 5}
      referenceTags={Array.isArray(q.reference) ? q.reference : []}
      source={q.source}
      session={q.session}
    >
      <div className="flex flex-col gap-2 font-body">
        {/* Clues Box Preview */}
        {q.clues && q.clues.length > 0 && (
          <div className="w-full">
            <RenderCluesTable clues={q.clues} />
          </div>
        )}

        {/* Formatted Passage / Options Preview */}
        {q.content ? (
          <div className="text-xs sm:text-sm font-medium text-foreground leading-relaxed whitespace-pre-wrap">
            <RenderFillInTheBlanksContent text={q.content} />
          </div>
        ) : null}

        {Array.isArray(q.options) && q.options.length > 0 && (
          <div className="space-y-1">
            {q.options.map((opt: string, idx: number) => (
              <div key={idx} className="text-xs sm:text-sm font-medium text-foreground leading-relaxed">
                <RenderFillInTheBlanksContent text={opt} />
              </div>
            ))}
          </div>
        )}
      </div>
    </PickerCardWrapper>
  );
};
