"use client";

import React from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { PickerCardWrapper } from "./picker-card-wrapper";
import { Badge } from "@workspace/ui/components/badge";

interface LetterPickerCardProps {
  question: any;
  index?: number;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const LetterPickerCard: React.FC<LetterPickerCardProps> = ({
  question: q,
  index,
  isSelected,
  onToggle,
}) => {
  const typeLabel =
    q.questionType?.nameBn ||
    (q.title && (q.title.includes("আবেদন") || q.title.includes("দরখাস্ত"))
      ? "আবেদনপত্র"
      : "চিঠি / পত্র");

  const titleText = q.title || q.name || q.question || "";

  return (
    <PickerCardWrapper index={index}
      id={q.id}
      isAssigned={q.isAssigned}
      isSelected={isSelected}
      onToggle={onToggle}
      chapterName={q.chapter?.nameBn || q.chapter?.nameEn}
      typeLabel={typeLabel}
      difficulty={q.difficulty}
      marks={q.marks || 5}
      referenceTags={Array.isArray(q.reference) ? q.reference : []}
      source={q.source}
      session={q.session}
    >
      <div className="flex flex-col gap-3 font-body">
        <div className="text-sm font-semibold text-foreground leading-relaxed">
          <RenderMath text={titleText} />
        </div>
      </div>
    </PickerCardWrapper>
  );
};
