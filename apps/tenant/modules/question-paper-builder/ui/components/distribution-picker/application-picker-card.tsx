"use client";

import React from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { PickerCardWrapper } from "./picker-card-wrapper";

interface ApplicationPickerCardProps {
  question: any;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const ApplicationPickerCard: React.FC<ApplicationPickerCardProps> = ({
  question: q,
  isSelected,
  onToggle,
}) => {
  const typeLabel =
    q.questionType?.nameBn ||
    (q.title && q.title.includes("দরখাস্ত") ? "দরখাস্ত" : "আবেদনপত্র");

  const titleText = q.title || q.name || q.question || "";

  return (
    <PickerCardWrapper
      id={q.id}
      isAssigned={q.isAssigned}
      isSelected={isSelected}
      onToggle={onToggle}
      chapterName={q.chapter?.nameBn || q.chapter?.nameEn}
      typeLabel={typeLabel}
    >
      <div className="flex flex-col gap-3 font-body">
        <div className="text-sm font-semibold text-foreground leading-relaxed">
          <RenderMath text={titleText} />
        </div>

        {Array.isArray(q.reference) && q.reference.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2 border-t border-outline-variant/30 pt-2.5">
            {q.reference.map((ref: string, rIdx: number) => (
              <span
                key={rIdx}
                className="px-2 py-0.5 bg-muted text-[10px] font-medium rounded text-muted-foreground"
              >
                🏷️ {ref}
              </span>
            ))}
          </div>
        )}
      </div>
    </PickerCardWrapper>
  );
};
