"use client";

import React from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { cn } from "@workspace/ui/lib/utils";
import { PickerCardWrapper } from "./picker-card-wrapper";

interface EssencePickerCardProps {
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

export const EssencePickerCard: React.FC<EssencePickerCardProps> = ({
  question: q,
  isSelected,
  onToggle,
}) => {
  const essence = q.essence || q;

  const chapterName =
    essence.academicChapter?.nameBn ||
    essence.academicChapter?.nameEn ||
    essence.chapter?.nameBn ||
    essence.chapter?.nameEn ||
    q.academicChapter?.nameBn ||
    q.academicChapter?.nameEn ||
    q.chapter?.nameBn ||
    q.chapter?.nameEn;

  const titleText = essence.title || essence.name || q.title || q.name || q.question || "";
  const contentText = essence.content || essence.poemStanza || q.content || q.poemStanza || "";
  const difficulty = essence.difficulty || q.difficulty;
  const source = essence.source || q.source;
  const session = essence.session || q.session;
  const reference =
    Array.isArray(essence.reference) && essence.reference.length > 0
      ? essence.reference
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
        {/* Title / Question */}
        {titleText && (
          <div className="text-sm text-on-surface leading-relaxed py-0.5">
            <div
              className={cn(
                "whitespace-pre-wrap font-bold text-base text-primary leading-snug",
                /[\u0980-\u09FF]/.test(titleText) && "font-solaiman text-lg"
              )}
            >
              <RenderMath text={titleText} isMath={true} />
            </div>
          </div>
        )}

        {/* Content / Stanza Preview if present */}
        {contentText && (
          <div className="text-xs sm:text-sm text-on-surface-variant bg-muted/40 p-2.5 rounded-md border border-border/50 whitespace-pre-line font-solaiman leading-relaxed">
            <RenderMath text={contentText} isMath={true} />
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
              !(source || session) && (
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
