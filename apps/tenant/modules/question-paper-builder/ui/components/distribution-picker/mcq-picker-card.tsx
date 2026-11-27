"use client";

import React from "react";
import { cn } from "@workspace/ui/lib/utils";
import { RenderMath } from "@workspace/ui/components/render-math";
import { QuestionAttachments } from "@workspace/ui/components/question-attachments";
import { toBengaliDigits, MCQ_TYPE_OPTIONS } from "@workspace/utils";
import { PickerCardWrapper } from "./picker-card-wrapper";

interface McqPickerCardProps {
  question: any;
  index?: number;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

const OPTION_LETTERS = ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ"];
const ROMAN_NUMERALS = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii"];

export const McqPickerCard: React.FC<McqPickerCardProps> = ({
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

  const passageAttachment = Array.isArray(q.attachments)
    ? q.attachments.find(
        (att: any) =>
          ((att.type || "").toUpperCase() === "PASSAGE" || (att.type || "").toUpperCase() === "TEXT") &&
          Boolean(att.content?.trim())
      )
    : null;

  const combinedContext =
    q.type === "COMBINED" && Array.isArray(q.attachments)
      ? q.attachments.find((att: any) => att.caption)?.caption
      : null;

  const contextText = q.questionContext?.text || q.context || passageAttachment?.content || combinedContext;

  const mediaAttachments = Array.isArray(q.attachments)
    ? q.attachments.filter((att: any) => {
        const t = (att.type || "").toUpperCase();
        if (t === "PASSAGE" || (t === "TEXT" && !att.url && !att.table)) return false;
        return Boolean(att.url || att.table || att.caption);
      })
    : [];

  const mcqType = q.type || (q.statements && q.statements.length > 0 ? "MULTIPLE" : "SINGLE");
  const mcqTypeMatch = MCQ_TYPE_OPTIONS.find(
    (t) => t.value === mcqType || t.value === q.type || (mcqType === "GENERAL" && t.value === "SINGLE")
  );
  const mcqTypeLabel =
    mcqTypeMatch?.labelBn ||
    (q.type === "MULTIPLE_COMPLETION" || q.type === "MULTIPLE"
      ? "বহুপদী সমাপ্তিসূচক"
      : q.type === "COMBINED"
      ? "অভিন্ন তথ্যভিত্তিক"
      : undefined);

  return (
    <PickerCardWrapper
      id={q.id}
      index={index}
      isAssigned={q.isAssigned}
      isSelected={isSelected}
      onToggle={onToggle}
      chapterName={chapterName}
      typeLabel={mcqTypeLabel}
      difficulty={q.difficulty}
      isMath={q.isMath}
      marks={q.marks || 1}
      referenceTags={Array.isArray(q.reference) ? q.reference : []}
      source={q.source}
      session={q.session}
    >
      <div className="flex flex-col gap-2.5 font-body">
        {/* 1. Stimulus / Context (উদ্দীপক) & Attachments at Top */}
        {contextText && (
          <div className="text-xs text-foreground/90 bg-muted/30 dark:bg-white/[0.02] p-3 rounded-r-xl border-l-2 border-primary whitespace-pre-wrap font-body">
            <span className="font-bold text-primary block mb-1 text-[11px] font-headline">উদ্দীপক:</span>
            <RenderMath text={contextText} isMath={q.isMath} />
          </div>
        )}

        {/* Attachments */}
        {mediaAttachments.length > 0 && (
          <div className="space-y-1">
            {!contextText && q.type === "COMBINED" && (
              <span className="font-bold text-primary block text-[11px] font-headline">
                উদ্দীপক (চিত্র / ছক):
              </span>
            )}
            <QuestionAttachments attachments={mediaAttachments} isMath={q.isMath} compact />
          </div>
        )}

        {/* 2. Question Stem / Title */}
        <div className="text-sm sm:text-base font-bold text-foreground leading-snug font-headline">
          <RenderMath text={q.question || q.title || q.name || ""} isMath={q.isMath} />
        </div>

        {/* 3. Statements (বহুপদী সমাপ্তিসূচক বিবৃতিসমূহ) */}
        {Array.isArray(q.statements) && q.statements.length > 0 && (
          <div className="space-y-1.5 pl-3 border-l-2 border-primary/70 py-1.5 bg-muted/15 dark:bg-white/[0.02] rounded-r-xl pr-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5 font-headline">
              বিবৃতিসমূহ:
            </span>
            {q.statements.map((stmt: string, sIdx: number) => (
              <div key={sIdx} className="flex items-start gap-2 text-xs text-foreground/90 font-medium font-body">
                <span className="font-mono font-bold text-primary shrink-0">
                  {ROMAN_NUMERALS[sIdx] || `${sIdx + 1}.`}
                </span>
                <span className="flex-1 leading-relaxed">
                  <RenderMath text={stmt} isMath={q.isMath} />
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 4. Options (No outer box border, styled badge with border) */}
        {Array.isArray(q.options) && q.options.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pt-1 font-body">
            {q.options.map((opt: string, optIdx: number) => {
              const letter = OPTION_LETTERS[optIdx] || String(optIdx + 1);

              return (
                <div
                  key={optIdx}
                  className="flex items-start gap-2.5 text-xs sm:text-[13px] text-foreground/90 font-body py-0.5"
                >
                  <span className="shrink-0 flex items-center justify-center w-5.5 h-5.5 rounded-lg border border-primary/30 bg-primary/10 text-primary font-bold text-xs font-headline mt-0.5">
                    {letter}
                  </span>
                  <span className="flex-1 min-w-0 whitespace-normal break-words leading-relaxed pt-0.5">
                    <RenderMath text={opt} isMath={q.isMath} />
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PickerCardWrapper>
  );
};
