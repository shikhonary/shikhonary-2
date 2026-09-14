"use client";

import React from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { PickerCardWrapper } from "./picker-card-wrapper";

interface ShortQuestionPickerCardProps {
  question: any;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const ShortQuestionPickerCard: React.FC<ShortQuestionPickerCardProps> = ({
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
      typeLabel="সংক্ষিপ্ত প্রশ্ন"
    >
      <div className="flex flex-col gap-3 font-body">
        <div className="text-sm font-semibold text-on-surface">
          <RenderMath text={q.question || q.name || q.title || ""} />
        </div>
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
