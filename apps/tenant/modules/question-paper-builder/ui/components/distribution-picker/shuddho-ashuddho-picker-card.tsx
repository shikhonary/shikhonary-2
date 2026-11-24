"use client";

import React from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { cn } from "@workspace/ui/lib/utils";
import { PickerCardWrapper, usePickerContext } from "./picker-card-wrapper";

interface ShuddhoAshuddhoPickerCardProps {
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

export const ShuddhoAshuddhoPickerCard: React.FC<ShuddhoAshuddhoPickerCardProps> = ({
  question: q,
  index,
  isSelected,
  onToggle,
}) => {
  const { isBankMode } = usePickerContext();
  const chapterName =
    q.academicChapter?.nameBn ||
    q.academicChapter?.nameEn ||
    q.chapter?.nameBn ||
    q.chapter?.nameEn;

  const sentenceText = q.sentence || q.question || q.text || q.title || "";
  const answerText = q.answer || "";

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
        {/* Sentence Text */}
        <div className="text-sm text-on-surface leading-relaxed py-0.5">
          <div
            className={cn(
              "whitespace-pre-wrap font-medium text-sm text-on-surface leading-snug",
              /[\u0980-\u09FF]/.test(sentenceText) && "font-solaiman text-base"
            )}
          >
            <RenderMath text={sentenceText} isMath={true} />
          </div>
        </div>

        {/* Answer Pill (if available) */}
        {!isBankMode && answerText && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-semibold text-primary/80">উত্তর:</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded text-[11px] font-semibold border",
                answerText.includes("শুদ্ধ") || answerText.toLowerCase() === "true"
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : answerText.includes("অশুদ্ধ") || answerText.toLowerCase() === "false"
                  ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                  : "bg-muted text-foreground border-border"
              )}
            >
              {answerText}
            </span>
          </div>
        )}
      </div>
    </PickerCardWrapper>
  );
};
