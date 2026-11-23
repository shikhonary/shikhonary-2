"use client";

import React from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { cn } from "@workspace/ui/lib/utils";
import { PickerCardWrapper } from "./picker-card-wrapper";

interface GenderChangePickerCardProps {
  question: any;
  index?: number;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "";
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .split("")
    .map((char) => (/\d/.test(char) ? bengaliDigits[parseInt(char)] : char))
    .join("");
};

export const GenderChangePickerCard: React.FC<GenderChangePickerCardProps> = ({
  question: q,
  index,
  isSelected,
  onToggle,
}) => {
  const chapterName =
    q.academicChapter?.nameBn ||
    q.academicChapter?.nameEn ||
    q.chapter?.nameBn ||
    q.chapter?.nameEn;

  const wordText = q.word || q.title || q.name || q.question || "";
  const genderWord = q.genderWord || "";

  return (
    <PickerCardWrapper
      id={q.id}
      index={index}
      isAssigned={q.isAssigned}
      isSelected={isSelected}
      onToggle={onToggle}
      chapterName={chapterName}
      difficulty={q.difficulty}
    
      referenceTags={Array.isArray(q.reference) ? q.reference : []}
      source={q.source}
      session={q.session}
      marks={q.marks}>
      <div className="flex flex-col gap-2 font-body">
        {/* Word Box */}
        <div className="text-sm text-on-surface leading-relaxed py-0.5 flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <div
              className={cn(
                "whitespace-pre-wrap font-bold text-base text-primary leading-snug",
                /[\u0980-\u09FF]/.test(wordText) && "font-solaiman text-lg"
              )}
            >
              <RenderMath text={wordText} isMath={true} />
            </div>

            {genderWord && (
              <div
                className={cn(
                  "whitespace-pre-wrap font-bold text-xs text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200",
                  /[\u0980-\u09FF]/.test(genderWord) && "font-solaiman text-sm"
                )}
              >
                <span className="text-[11px] font-medium text-emerald-600">স্ত্রীবাচক:</span>
                <RenderMath text={genderWord} isMath={true} />
              </div>
            )}
          </div>
        </div>
      </div>
    </PickerCardWrapper>
  );
};
