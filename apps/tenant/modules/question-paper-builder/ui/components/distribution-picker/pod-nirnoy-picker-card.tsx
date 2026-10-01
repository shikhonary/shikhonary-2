"use client";

import React from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { cn } from "@workspace/ui/lib/utils";
import { PickerCardWrapper } from "./picker-card-wrapper";

interface PodNirnoyPickerCardProps {
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

export const PodNirnoyPickerCard: React.FC<PodNirnoyPickerCardProps> = ({
  question: q,
  isSelected,
  onToggle,
}) => {
  const item = q.podNirnoy || q;

  const chapterName =
    item.academicChapter?.nameBn ||
    item.academicChapter?.nameEn ||
    item.chapter?.nameBn ||
    item.chapter?.nameEn ||
    q.academicChapter?.nameBn ||
    q.academicChapter?.nameEn ||
    q.chapter?.nameBn ||
    q.chapter?.nameEn;

  const wordsList = Array.isArray(item.words)
    ? item.words.filter(Boolean)
    : Array.isArray(q.words)
    ? q.words.filter(Boolean)
    : typeof item.words === "string" && item.words.trim()
    ? [item.words.trim()]
    : [];

  const content = item.content || q.content || "";
  const difficulty = item.difficulty || q.difficulty;
  const source = item.source || q.source;
  const session = item.session || q.session;
  const reference =
    Array.isArray(item.reference) && item.reference.length > 0
      ? item.reference
      : Array.isArray(q.reference)
      ? q.reference
      : [];

  return (
    <PickerCardWrapper
      id={q.id}
      isAssigned={q.isAssigned}
      isSelected={isSelected}
      onToggle={onToggle}
      chapterName={chapterName}
      difficulty={difficulty}
    >
      <div className="flex flex-col gap-2 font-body">
        {/* Content Box */}
        {content && (
          <div className="text-xs sm:text-sm text-on-surface-variant bg-muted/40 p-2.5 rounded-md border border-border/50 whitespace-pre-line font-solaiman leading-relaxed text-justify">
            <RenderMath text={content} isMath={true} />
          </div>
        )}

        {/* Words Row below content - every word on a single line with - after */}
        {wordsList.length > 0 && (
          <div className="flex flex-col gap-0.5 text-sm text-primary font-bold font-solaiman py-0.5">
            {wordsList.map((w: string, wIdx: number) => {
              const cleanW = w.trim().replace(/^-+\s*|\s*-+$/g, "").trim();
              return <div key={wIdx}>{cleanW} -</div>;
            })}
          </div>
        )}

        {/* Reference Tags & Source Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/30 pt-2.5 mt-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {(source || session) && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[11px] font-semibold border border-primary/20">
                📚 {source || "N/A"}
                {session ? ` (${toBengaliDigits(session)})` : ""}
              </span>
            )}
            {reference.length > 0 ? (
              reference.map((ref: string, rIdx: number) => (
                <span
                  key={rIdx}
                  className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant rounded text-[11px] font-medium"
                >
                  🏷️ {ref}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-on-surface-variant/60 italic">No board reference</span>
            )}
          </div>
        </div>
      </div>
    </PickerCardWrapper>
  );
};
