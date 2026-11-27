"use client";

import React from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { QuestionAttachments } from "@workspace/ui/components/question-attachments";
import { PickerCardWrapper, usePickerContext } from "./picker-card-wrapper";

interface DescriptiveQuestionPickerCardProps {
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

export const DescriptiveQuestionPickerCard: React.FC<DescriptiveQuestionPickerCardProps> = ({
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

  const passageAttachment = Array.isArray(q.attachments)
    ? q.attachments.find(
        (a: any) =>
          (a.type || "").toUpperCase() === "PASSAGE" ||
          (a.type || "").toUpperCase() === "CONTEXT"
      )
    : null;
  const contextText =
    q.context ||
    q.stimulus ||
    q.scenario ||
    q.questionContext?.text ||
    passageAttachment?.content ||
    null;

  const mediaAttachments = Array.isArray(q.attachments)
    ? q.attachments.filter(
        (a: any) =>
          (a.type || "").toUpperCase() !== "PASSAGE" &&
          (a.type || "").toUpperCase() !== "CONTEXT"
      )
    : [];

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
        {/* Stimulus / Context (উদ্দীপক অনুচ্ছেদ) at Top if present */}
        {contextText && (
          <div className="text-xs text-foreground/90 bg-muted/30 p-2.5 rounded-r-xl border-l-2 border-primary whitespace-pre-wrap font-body">
            <span className="font-semibold text-primary block mb-1 text-[11px] font-headline">উদ্দীপক:</span>
            <RenderMath text={contextText} isMath={true} />
          </div>
        )}

        {/* If contextText was present, show mediaAttachments under it */}
        {contextText && mediaAttachments.length > 0 && (
          <QuestionAttachments attachments={mediaAttachments} compact />
        )}

        {/* Question Text */}
        <div className="text-sm font-semibold text-on-surface leading-relaxed py-0.5">
          <RenderMath text={q.question || q.name || q.title || ""} isMath={true} />
        </div>

        {/* If no contextText, show media attachments directly under the question */}
        {!contextText && mediaAttachments.length > 0 && (
          <QuestionAttachments attachments={mediaAttachments} compact />
        )}

        {/* Answer Box if available */}
        {!isBankMode && q.answer && (
          <div className="text-xs text-muted-foreground/80 bg-muted/30 p-2 rounded border border-border/50 line-clamp-3">
            <span className="font-semibold text-primary">উত্তর: </span>
            <RenderMath text={q.answer} isMath={true} />
          </div>
        )}
      </div>
    </PickerCardWrapper>
  );
};
