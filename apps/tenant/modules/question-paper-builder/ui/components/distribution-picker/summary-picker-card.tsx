"use client";

import React from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { PickerCardWrapper } from "./picker-card-wrapper";

interface SummaryPickerCardProps {
  question: any;
  index?: number;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const SummaryPickerCard: React.FC<SummaryPickerCardProps> = ({
  question: q,
  index,
  isSelected,
  onToggle,
}) => {
  return (
    <PickerCardWrapper index={index}
      id={q.id}
      isAssigned={q.isAssigned}
      isSelected={isSelected}
      onToggle={onToggle}
      chapterName={q.chapter?.nameBn || q.chapter?.nameEn}
      typeLabel="সারাংশ"
    >
      <div className="flex flex-col gap-3 font-body">
        <div className="text-sm font-semibold text-on-surface">
          <RenderMath text={q.title || q.name || q.question || ""} />
        </div>
      </div>
    </PickerCardWrapper>
  );
};
