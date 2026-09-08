"use client";

import React from "react";
import { RenderPunctuationContent } from "../blocks/punctuation-block";
import { PickerCardWrapper } from "./picker-card-wrapper";

interface PunctuationPickerCardProps {
  question: any;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const PunctuationPickerCard: React.FC<PunctuationPickerCardProps> = ({
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
      typeLabel="Punctuation"
    >
      <div className="flex flex-col gap-3 font-body">
        <div className="text-sm font-medium text-on-surface leading-relaxed whitespace-pre-wrap">
          <RenderPunctuationContent text={q.content || ""} />
        </div>
      </div>
    </PickerCardWrapper>
  );
};
