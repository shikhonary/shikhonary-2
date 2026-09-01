"use client";

import React from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { PickerCardWrapper } from "./picker-card-wrapper";

interface CqPickerCardProps {
  question: any;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const CqPickerCard: React.FC<CqPickerCardProps> = ({
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
      typeLabel="সৃজনশীল (CQ)"
    >
      <div className="flex flex-col gap-3 font-body">
        {q.context && (
          <div className="text-xs text-on-surface-variant bg-muted/40 p-3 rounded-xl whitespace-pre-wrap border border-outline-variant">
            <RenderMath text={q.context} />
          </div>
        )}
        <div className="space-y-2 mt-1">
          {q.questionA && (
            <div className="flex items-start gap-2">
              <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full border border-primary/20 bg-primary/5 text-primary font-bold text-xs">
                ক
              </span>
              <span className="text-xs mt-1">
                <RenderMath text={q.questionA} />
              </span>
            </div>
          )}
          {q.questionB && (
            <div className="flex items-start gap-2">
              <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full border border-primary/20 bg-primary/5 text-primary font-bold text-xs">
                খ
              </span>
              <span className="text-xs mt-1">
                <RenderMath text={q.questionB} />
              </span>
            </div>
          )}
          {q.questionC && (
            <div className="flex items-start gap-2">
              <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full border border-primary/20 bg-primary/5 text-primary font-bold text-xs">
                গ
              </span>
              <span className="text-xs mt-1">
                <RenderMath text={q.questionC} />
              </span>
            </div>
          )}
          {q.questionD && (
            <div className="flex items-start gap-2">
              <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full border border-primary/20 bg-primary/5 text-primary font-bold text-xs">
                ঘ
              </span>
              <span className="text-xs mt-1">
                <RenderMath text={q.questionD} />
              </span>
            </div>
          )}
        </div>
      </div>
    </PickerCardWrapper>
  );
};
