"use client";

import React from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { PickerCardWrapper } from "./picker-card-wrapper";

interface PbqPickerCardProps {
  question: any;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const PbqPickerCard: React.FC<PbqPickerCardProps> = ({
  question: q,
  isSelected,
  onToggle,
}) => {
  const chapterName = q.academicChapter?.nameBn || q.academicChapter?.nameEn || q.chapter?.nameBn || q.chapter?.nameEn;
  const typeLabel = q.questionType?.nameBn || q.questionType?.nameEn || "অনুচ্ছেদভিত্তিক (PBQ)";

  return (
    <PickerCardWrapper
      id={q.id}
      isAssigned={q.isAssigned}
      isSelected={isSelected}
      onToggle={onToggle}
      chapterName={chapterName}
      typeLabel={typeLabel}
    >
      <div className="flex flex-col gap-3 font-body">
        {q.context && (
          <div className="text-xs bg-muted/40 p-2 rounded-md border text-muted-foreground line-clamp-3">
            <RenderMath text={q.context} />
          </div>
        )}

        <div className="space-y-2 mt-1">
          {q.questionA && (
            <div className="flex items-start gap-2">
              <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full border border-primary/20 bg-primary/5 text-primary font-bold text-xs">
                ক
              </span>
              <span className="text-xs mt-1 line-clamp-2">
                <RenderMath text={q.questionA} />
              </span>
            </div>
          )}
          {q.questionB && (
            <div className="flex items-start gap-2">
              <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full border border-primary/20 bg-primary/5 text-primary font-bold text-xs">
                খ
              </span>
              <span className="text-xs mt-1 line-clamp-2">
                <RenderMath text={q.questionB} />
              </span>
            </div>
          )}
          {q.questionC && (
            <div className="flex items-start gap-2">
              <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full border border-primary/20 bg-primary/5 text-primary font-bold text-xs">
                গ
              </span>
              <span className="text-xs mt-1 line-clamp-2">
                <RenderMath text={q.questionC} />
              </span>
            </div>
          )}
          {q.questionD && (
            <div className="flex items-start gap-2">
              <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full border border-primary/20 bg-primary/5 text-primary font-bold text-xs">
                ঘ
              </span>
              <span className="text-xs mt-1 line-clamp-2">
                <RenderMath text={q.questionD} />
              </span>
            </div>
          )}
          {q.questionE && (
            <div className="flex items-start gap-2">
              <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full border border-primary/20 bg-primary/5 text-primary font-bold text-xs">
                ঙ
              </span>
              <span className="text-xs mt-1 line-clamp-2">
                <RenderMath text={q.questionE} />
              </span>
            </div>
          )}
        </div>
      </div>
    </PickerCardWrapper>
  );
};
