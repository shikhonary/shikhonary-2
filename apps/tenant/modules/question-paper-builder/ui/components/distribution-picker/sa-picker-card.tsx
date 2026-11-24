"use client";

import React from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { QuestionAttachments } from "@workspace/ui/components/question-attachments";
import { PickerCardWrapper, usePickerContext } from "./picker-card-wrapper";

interface SaPickerCardProps {
  question: any;
  index?: number;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const SaPickerCard: React.FC<SaPickerCardProps> = ({
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

  return (
    <PickerCardWrapper
      id={q.id}
      index={index}
      isAssigned={q.isAssigned}
      isSelected={isSelected}
      onToggle={onToggle}
      chapterName={chapterName}
      typeLabel="সংক্ষিপ্ত"
      difficulty={q.difficulty}
      marks={q.marks || 2}
      referenceTags={Array.isArray(q.reference) ? q.reference : []}
      source={q.source}
      session={q.session}
    >
      <div className="flex flex-col gap-2 font-body">
        <div className="text-xs sm:text-sm font-semibold text-foreground leading-relaxed">
          <RenderMath text={q.question || q.name || q.title || ""} />
        </div>
        <QuestionAttachments attachments={q.attachments} compact />
        {!isBankMode && q.answer && (
          <div className="text-xs text-muted-foreground mt-0.5 bg-muted/20 p-2 rounded-xl border border-border/40">
            <span className="font-semibold text-primary block mb-0.5 text-[11px] font-headline">উত্তর:</span>
            <RenderMath text={q.answer} />
          </div>
        )}
      </div>
    </PickerCardWrapper>
  );
};
