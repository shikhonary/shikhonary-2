"use client";

import React from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { QuestionAttachments } from "@workspace/ui/components/question-attachments";
import { PickerCardWrapper, usePickerContext } from "./picker-card-wrapper";

interface CqPickerCardProps {
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
    .map((char) => (/\d/.test(char) ? bengaliDigits[parseInt(char, 10)] : char))
    .join("");
};

export const CqPickerCard: React.FC<CqPickerCardProps> = ({
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

  const stimulus = q.stimulus || q.context || q.scenario || q.questionContext?.text || null;

  const subQuestions = [
    { label: "ক", text: q.questionA, mark: q.markA ?? q.marksA ?? 1 },
    { label: "খ", text: q.questionB, mark: q.markB ?? q.marksB ?? 2 },
    { label: "গ", text: q.questionC, mark: q.markC ?? q.marksC ?? 3 },
    { label: "ঘ", text: q.questionD, mark: q.markD ?? q.marksD ?? 4 },
  ].filter((item) => item.text);

  const totalMarks = q.totalMarks || q.marks || 10;

  return (
    <PickerCardWrapper
      id={q.id}
      index={index}
      isAssigned={q.isAssigned}
      isSelected={isSelected}
      onToggle={onToggle}
      chapterName={chapterName}
      typeLabel="সৃজনশীল (CQ)"
      difficulty={q.difficulty}
      marks={totalMarks}
      referenceTags={Array.isArray(q.reference) ? q.reference : []}
      source={q.source}
      session={q.session}
    >
      <div className="flex flex-col gap-2.5 font-body">
        {/* Stimulus / Scenario */}
        {stimulus && (
          <div className="text-xs text-foreground/90 bg-muted/30 p-2.5 rounded-r-xl border-l-2 border-primary/50 whitespace-pre-wrap font-body">
            <span className="font-semibold text-primary/90 block mb-1 text-[11px] font-headline">উদ্দীপক:</span>
            <RenderMath text={stimulus} />
          </div>
        )}

        {/* Attachments */}
        {Array.isArray(q.attachments) && q.attachments.length > 0 && (
          <div className="space-y-1">
            <span className="font-bold text-primary block text-[11px] font-headline">
              উদ্দীপক:
            </span>
            <QuestionAttachments attachments={q.attachments} compact />
          </div>
        )}

        {/* Sub-questions List (No whole box border, badge with border) */}
        {subQuestions.length > 0 && (
          <div className="space-y-2 mt-1 font-body">
            {subQuestions.map((sq, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-2.5 py-0.5 text-xs sm:text-[13px]"
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <span className="shrink-0 flex items-center justify-center w-5.5 h-5.5 rounded-lg border border-primary/30 bg-primary/10 text-primary font-bold text-xs font-headline mt-0.5">
                    {sq.label}
                  </span>
                  <div className="flex-1 leading-relaxed text-foreground/95 pt-0.5">
                    <RenderMath text={sq.text} />
                  </div>
                </div>
                {!isBankMode && (
                  <span className="shrink-0 px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground font-headline font-semibold text-[11px] mt-0.5">
                    {toBengaliDigits(sq.mark)} নম্বর
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PickerCardWrapper>
  );
};
