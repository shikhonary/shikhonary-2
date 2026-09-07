"use client";

import React from "react";
import { RenderPartsOfSpeechContent } from "../blocks/parts-of-speech-block";
import { PickerCardWrapper } from "./picker-card-wrapper";

interface PartsOfSpeechPickerCardProps {
  question: any;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const PartsOfSpeechPickerCard: React.FC<PartsOfSpeechPickerCardProps> = ({
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
      typeLabel="Parts of Speech"
    >
      <div className="flex flex-col gap-3 font-body">
        <div className="text-sm font-medium text-on-surface leading-relaxed whitespace-pre-wrap">
          <RenderPartsOfSpeechContent text={q.content || ""} />
        </div>
      </div>
    </PickerCardWrapper>
  );
};
