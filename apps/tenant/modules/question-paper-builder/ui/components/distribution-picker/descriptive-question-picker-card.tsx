"use client";

import React from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { PickerCardWrapper } from "./picker-card-wrapper";

interface DescriptiveQuestionPickerCardProps {
  question: any;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const DescriptiveQuestionPickerCard: React.FC<DescriptiveQuestionPickerCardProps> = ({
  question: q,
  isSelected,
  onToggle,
}) => {
  return (
    <PickerCardWrapper
      id={q.id}
      isAssigned={q.isAssigned}
      isSelected={isSelected}
      onToggle={onToggle}
      chapterName={q.chapter?.nameBn || q.chapter?.nameEn}
      typeLabel="রচনামূলক প্রশ্ন"
    >
      <div className="flex flex-col gap-3 font-body">
        <div className="text-sm font-semibold text-on-surface">
          <RenderMath text={q.question || q.name || q.title || ""} />
        </div>
        {q.answer && (
          <div className="text-xs text-muted-foreground/80 bg-muted/30 p-2 rounded border border-border/50 line-clamp-3">
            <span className="font-semibold text-primary">উত্তর: </span>
            <RenderMath text={q.answer} />
          </div>
        )}
        {q.reference && Array.isArray(q.reference) && q.reference.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {q.reference.map((ref: string, idx: number) => (
              <span
                key={idx}
                className="text-[10px] bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded"
              >
                {ref}
              </span>
            ))}
          </div>
        )}
      </div>
    </PickerCardWrapper>
  );
};
