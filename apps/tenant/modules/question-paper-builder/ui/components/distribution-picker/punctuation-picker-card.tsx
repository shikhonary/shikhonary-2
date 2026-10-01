"use client";

import React from "react";
import { RenderPunctuationContent } from "../blocks/punctuation-block";
import { PickerCardWrapper } from "./picker-card-wrapper";
import { RenderMath } from "@workspace/ui/components/render-math";

interface PunctuationPickerCardProps {
  question: any;
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

export const PunctuationPickerCard: React.FC<PunctuationPickerCardProps> = ({
  question: q,
  isSelected,
  onToggle,
}) => {
  const chapterName =
    q.academicChapter?.nameBn ||
    q.academicChapter?.nameEn ||
    q.chapter?.nameBn ||
    q.chapter?.nameEn;

  const mainText = q.rawText || q.content || q.prompt || "";
  const promptText = q.prompt && q.prompt !== q.rawText && q.prompt !== q.content ? q.prompt : "";
  const answerText = q.answerText || q.answer || "";

  return (
    <PickerCardWrapper
      id={q.id}
      isAssigned={q.isAssigned}
      isSelected={isSelected}
      onToggle={onToggle}
      chapterName={chapterName}
      difficulty={q.difficulty}
    >
      <div className="flex flex-col gap-2.5 font-body">
        {/* Optional Prompt header if present */}
        {promptText && (
          <div className="text-xs text-muted-foreground font-semibold">
            <RenderMath text={promptText} />
          </div>
        )}

        {/* Main Raw Text */}
        <div className="text-sm font-medium text-on-surface leading-relaxed whitespace-pre-wrap">
          <RenderPunctuationContent text={mainText} />
        </div>

        {/* Answer preview if present */}
        {answerText && (
          <div className="text-xs text-muted-foreground bg-surface-container-low p-2 rounded border border-outline-variant/30">
            <span className="font-semibold text-primary mr-1">Ans:</span>
            <RenderMath text={answerText} />
          </div>
        )}

        {/* References & Source Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/30 pt-2 mt-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {(q.source || q.session) && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[11px] font-semibold border border-primary/20">
                📚 {q.source || "N/A"}
                {q.session ? ` (${toBengaliDigits(q.session)})` : ""}
              </span>
            )}
            {Array.isArray(q.reference) && q.reference.length > 0 ? (
              q.reference.map((ref: string, rIdx: number) => (
                <span
                  key={rIdx}
                  className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant rounded text-[11px] font-medium"
                >
                  🏷️ {ref}
                </span>
              ))
            ) : (
              !(q.source || q.session) && (
                <span className="text-[11px] text-muted-foreground italic">
                  No reference tags
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </PickerCardWrapper>
  );
};
