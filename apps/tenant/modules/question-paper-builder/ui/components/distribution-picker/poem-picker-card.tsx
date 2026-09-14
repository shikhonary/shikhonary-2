"use client";

import React from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { PickerCardWrapper } from "./picker-card-wrapper";

interface PoemPickerCardProps {
  question: any;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const PoemPickerCard: React.FC<PoemPickerCardProps> = ({
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
      typeLabel="কবিতা"
    >
      <div className="flex flex-col gap-3 font-body">
        <div className="text-sm font-semibold text-on-surface whitespace-pre-wrap">
          <RenderMath text={q.title || q.name || q.question || ""} />
        </div>
      </div>
    </PickerCardWrapper>
  );
};
