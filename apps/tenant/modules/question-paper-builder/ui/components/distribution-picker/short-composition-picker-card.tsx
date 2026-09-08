"use client";

import React from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { PickerCardWrapper } from "./picker-card-wrapper";
import { Badge } from "@workspace/ui/components/badge";
import { formatShortCompositionPrompt } from "../blocks/short-composition-block";

interface ShortCompositionPickerCardProps {
  question: any;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const ShortCompositionPickerCard: React.FC<ShortCompositionPickerCardProps> = ({
  question: q,
  isSelected,
  onToggle,
}) => {
  const displayPrompt = formatShortCompositionPrompt(
    undefined,
    q.title || q.name || q.question || "",
    q.wordLimit
  );

  return (
    <PickerCardWrapper
      id={q.id}
      isAssigned={q.isAssigned}
      isSelected={isSelected}
      onToggle={onToggle}
      chapterName={q.chapter?.nameBn || q.chapter?.nameEn}
      typeLabel="Short Composition"
    >
      <div className="flex flex-col gap-2.5 font-body">
        <div className="text-sm font-semibold text-on-surface leading-relaxed">
          <RenderMath text={displayPrompt} />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {q.wordLimit ? (
            <Badge variant="outline" className="text-[11px] font-medium bg-primary/5 text-primary border-primary/20">
              {q.wordLimit} words
            </Badge>
          ) : null}

          {q.difficulty ? (
            <Badge variant="secondary" className="text-[10px] uppercase font-normal">
              {q.difficulty}
            </Badge>
          ) : null}

          {Array.isArray(q.reference) && q.reference.length > 0 ? (
            q.reference.map((ref: string, idx: number) => (
              <Badge key={idx} variant="outline" className="text-[10px] text-muted-foreground border-outline-variant/60 font-normal">
                {ref}
              </Badge>
            ))
          ) : null}
        </div>
      </div>
    </PickerCardWrapper>
  );
};
