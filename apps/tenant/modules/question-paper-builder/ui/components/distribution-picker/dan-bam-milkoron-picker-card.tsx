"use client";

import React from "react";
import { RenderDanBamMilkoronTable } from "../blocks/dan-bam-milkoron-block";
import { PickerCardWrapper } from "./picker-card-wrapper";

interface DanBamMilkoronPickerCardProps {
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

export const DanBamMilkoronPickerCard: React.FC<DanBamMilkoronPickerCardProps> = ({
  question: q,
  isSelected,
  onToggle,
}) => {
  const chapterName =
    q.academicChapter?.nameBn ||
    q.academicChapter?.nameEn ||
    q.chapter?.nameBn ||
    q.chapter?.nameEn;

  return (
    <PickerCardWrapper
      id={q.id}
      isAssigned={q.isAssigned}
      isSelected={isSelected}
      onToggle={onToggle}
      chapterName={chapterName}
      difficulty={q.difficulty}
    >
      <div className="flex flex-col gap-2 font-body">
        <div className="w-full">
          <RenderDanBamMilkoronTable
            leftColumn={q.leftColumn || []}
            rightColumn={q.rightColumn || []}
          />
        </div>

        {/* Reference Tags & Source Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/30 pt-2.5 mt-0.5">
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

          <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
            <span>কলাম সংখ্যা: {toBengaliDigits((q.leftColumn?.length || 0).toString())}</span>
          </div>
        </div>
      </div>
    </PickerCardWrapper>
  );
};
