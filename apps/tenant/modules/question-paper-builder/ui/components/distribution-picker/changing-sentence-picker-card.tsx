"use client";

import React from "react";
import { RenderChangingSentenceContent } from "../blocks/changing-sentence-block";
import { PickerCardWrapper } from "./picker-card-wrapper";

interface ChangingSentencePickerCardProps {
  question: any;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const ChangingSentencePickerCard: React.FC<ChangingSentencePickerCardProps> = ({
  question: q,
  isSelected,
  onToggle,
}) => {
  const hasPassageContent = Boolean(q.content && typeof q.content === "string" && q.content.trim());
  const optionsList: string[] = Array.isArray(q.options) ? q.options : [];
  const hasOptionsList = optionsList.length > 0;

  return (
    <PickerCardWrapper
      id={q.id}
      isAssigned={q.isAssigned}
      isSelected={isSelected}
      onToggle={onToggle}
      chapterName={q.academicChapter?.nameBn || q.academicChapter?.nameEn || q.chapter?.nameBn || q.chapter?.nameEn}
      typeLabel="Changing Sentences"
    >
      <div className="flex flex-col gap-3 font-body">
        {hasPassageContent ? (
          <div className="text-sm font-medium text-on-surface leading-relaxed whitespace-pre-wrap">
            <RenderChangingSentenceContent text={q.content || ""} />
          </div>
        ) : hasOptionsList ? (
          <div className="space-y-1 text-sm font-medium text-on-surface leading-relaxed">
            {optionsList.map((opt: string, idx: number) => {
              const match = opt.match(/^\s*\(?([a-zA-Z0-9]+)\)[\s.:-]*(.*)$/);
              const optLabel = match ? match[1] : (["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"][idx] || String(idx + 1));
              const optText = match ? match[2] : opt;

              return (
                <div key={idx} className="flex gap-2 items-start">
                  <span className="font-bold text-muted-foreground shrink-0 min-w-[1.6em]">
                    ({optLabel})
                  </span>
                  <div className="flex-1 min-w-0">
                    <RenderChangingSentenceContent text={optText} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </PickerCardWrapper>
  );
};
