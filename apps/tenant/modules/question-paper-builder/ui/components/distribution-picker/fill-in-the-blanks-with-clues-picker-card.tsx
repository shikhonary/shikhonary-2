"use client";

import React from "react";
import { RenderFillInTheBlanksContent, RenderCluesTable } from "../blocks/fill-in-the-blanks-with-clues-block";
import { PickerCardWrapper } from "./picker-card-wrapper";

interface FillInTheBlanksWithCluesPickerCardProps {
  question: any;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const FillInTheBlanksWithCluesPickerCard: React.FC<FillInTheBlanksWithCluesPickerCardProps> = ({
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
      typeLabel="Fill in the Blanks with Clues"
    >
      <div className="flex flex-col gap-2 font-body">
        {/* Clues Box Preview */}
        {q.clues && q.clues.length > 0 && (
          <div className="w-full">
            <RenderCluesTable clues={q.clues} />
          </div>
        )}

        {/* Formatted Passage / Options Preview */}
        {q.content ? (
          <div className="text-sm font-medium text-on-surface leading-relaxed whitespace-pre-wrap">
            <RenderFillInTheBlanksContent text={q.content} />
          </div>
        ) : null}

        {Array.isArray(q.options) && q.options.length > 0 && (
          <div className="space-y-1">
            {q.options.map((opt: string, idx: number) => (
              <div key={idx} className="text-sm font-medium text-on-surface leading-relaxed">
                <RenderFillInTheBlanksContent text={opt} />
              </div>
            ))}
          </div>
        )}
      </div>
    </PickerCardWrapper>
  );
};
