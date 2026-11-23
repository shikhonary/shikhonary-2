"use client";

import React from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { PickerCardWrapper } from "./picker-card-wrapper";

interface GrammarQuestionPickerCardProps {
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

export const GrammarQuestionPickerCard: React.FC<GrammarQuestionPickerCardProps> = ({
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

  const questionText = q.question || q.prompt || q.title || q.name || "";

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
      <div className="flex flex-col gap-3 font-body">
        {/* Question Prompt */}
        <div className="text-sm font-semibold text-foreground leading-relaxed">
          <RenderMath text={questionText} />
        </div>

        {/* Optional Answer Preview */}
        {q.answer && (
          <div className="text-xs bg-surface-container-low/70 border border-outline-variant/40 rounded-md p-2 text-on-surface-variant flex items-start gap-1.5">
            <span className="font-bold text-primary shrink-0">উত্তর:</span>
            <span className="flex-1">
              <RenderMath text={q.answer} />
            </span>
          </div>
        )}
      </div>
    </PickerCardWrapper>
  );
};
