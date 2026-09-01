"use client";

import React from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { PickerCardWrapper } from "./picker-card-wrapper";

interface SaPickerCardProps {
  question: any;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const SaPickerCard: React.FC<SaPickerCardProps> = ({
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
      typeLabel="সংক্ষিপ্ত"
    >
      <div className="flex flex-col gap-3 font-body">
        <div className="text-sm font-semibold text-on-surface">
          <RenderMath text={q.question} />
        </div>
        {q.answer && (
          <div className="text-xs text-muted-foreground mt-1 border-l-2 border-primary/40 pl-3">
            <span className="font-semibold text-primary block mb-0.5">উত্তর:</span>
            <RenderMath text={q.answer} />
          </div>
        )}
      </div>
    </PickerCardWrapper>
  );
};
