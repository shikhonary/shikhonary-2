"use client";

import React from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { PickerCardWrapper } from "./picker-card-wrapper";

interface ParagraphPickerCardProps {
  question: any;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const ParagraphPickerCard: React.FC<ParagraphPickerCardProps> = ({
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
      typeLabel="অনুচ্ছেদ"
    >
      <div className="flex flex-col gap-3 font-body">
        <div className="text-sm font-semibold text-on-surface">
          <RenderMath text={q.name || q.title || q.question || ""} />
        </div>
      </div>
    </PickerCardWrapper>
  );
};
