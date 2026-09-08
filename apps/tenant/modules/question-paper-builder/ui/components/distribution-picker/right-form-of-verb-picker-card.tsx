"use client";

import React from "react";
import { RenderRightFormOfVerbContent } from "../blocks/right-form-of-verb-block";
import { PickerCardWrapper } from "./picker-card-wrapper";

interface RightFormOfVerbPickerCardProps {
  question: any;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const RightFormOfVerbPickerCard: React.FC<RightFormOfVerbPickerCardProps> = ({
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
      chapterName={q.academicChapter?.nameBn || q.academicChapter?.nameEn || q.chapter?.nameBn || q.chapter?.nameEn}
      typeLabel="Right Form of Verbs"
    >
      <div className="flex flex-col gap-3 font-body">
        <div className="text-sm font-medium text-on-surface leading-relaxed whitespace-pre-wrap">
          <RenderRightFormOfVerbContent text={q.content || ""} />
        </div>
      </div>
    </PickerCardWrapper>
  );
};
