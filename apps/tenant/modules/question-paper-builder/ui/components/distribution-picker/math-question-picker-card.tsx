"use client";

import React from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { PickerCardWrapper, usePickerContext } from "./picker-card-wrapper";

interface MathQuestionPickerCardProps {
  question: any;
  index?: number;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const MathQuestionPickerCard: React.FC<MathQuestionPickerCardProps> = ({
  question: q,
  index,
  isSelected,
  onToggle,
}) => {
  const { isBankMode } = usePickerContext();
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
      marks={q.marks}
      referenceTags={Array.isArray(q.reference) ? q.reference : []}
      source={q.source}
      session={q.session}
      extraBadges={
        q.isMath ? (
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300/50">
            ∑ Math
          </span>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-3 font-body">
        {/* Question Prompt */}
        <div className="text-sm font-semibold text-foreground leading-relaxed">
          <RenderMath text={questionText} isMath={q.isMath ?? false} />
        </div>

        {/* Optional Answer Preview */}
        {!isBankMode && q.answer && (
          <div className="text-xs bg-muted/30 border border-border/50 rounded-xl p-2.5 text-foreground/90 flex items-start gap-1.5">
            <span className="font-bold text-primary shrink-0">সমাধান/উত্তর:</span>
            <span className="flex-1">
              <RenderMath text={q.answer} isMath={q.isMath ?? false} />
            </span>
          </div>
        )}
      </div>
    </PickerCardWrapper>
  );
};
