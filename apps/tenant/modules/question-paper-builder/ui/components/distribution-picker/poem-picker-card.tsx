"use client";

import React from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { cn } from "@workspace/ui/lib/utils";
import { PickerCardWrapper } from "./picker-card-wrapper";

interface PoemPickerCardProps {
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

export const PoemPickerCard: React.FC<PoemPickerCardProps> = ({
  question: q,
  isSelected,
  onToggle,
}) => {
  const poem = q.poem || q;
  const chapterName =
    poem.academicChapter?.nameBn ||
    poem.academicChapter?.nameEn ||
    poem.chapter?.nameBn ||
    poem.chapter?.nameEn ||
    q.academicChapter?.nameBn ||
    q.academicChapter?.nameEn ||
    q.chapter?.nameBn ||
    q.chapter?.nameEn;

  const poemTitle = poem.title || poem.name || q.title || q.name || q.question || "";
  const difficulty = poem.difficulty || q.difficulty;
  const rawSource = poem.source || q.source;
  const session = poem.session || q.session;
  const reference =
    Array.isArray(poem.reference) && poem.reference.length > 0
      ? poem.reference
      : Array.isArray(q.reference)
      ? q.reference
      : [];

  const source =
    rawSource ||
    reference.find((r: string) => typeof r === "string" && (r.includes("বোর্ড") || r.includes("গাইড") || r.includes("বই"))) ||
    "বোর্ড বই";

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
        {/* Poem Title Box */}
        <div className="text-sm text-on-surface leading-relaxed py-0.5">
          <div
            className={cn(
              "whitespace-pre-wrap font-bold text-base text-primary leading-snug",
              /[\u0980-\u09FF]/.test(poemTitle) && "font-solaiman text-lg"
            )}
          >
            <RenderMath text={poemTitle} isMath={true} />
          </div>
        </div>

        {/* Reference Tags & Source Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/30 pt-2.5 mt-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[11px] font-semibold border border-primary/20">
              📚 {source}
              {session ? ` (${toBengaliDigits(session)})` : ""}
            </span>
            {reference
              .filter((ref: string) => ref !== source)
              .map((ref: string, rIdx: number) => (
                <span
                  key={rIdx}
                  className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant rounded text-[11px] font-medium"
                >
                  🏷️ {ref}
                </span>
              ))}
          </div>
        </div>
      </div>
    </PickerCardWrapper>
  );
};
