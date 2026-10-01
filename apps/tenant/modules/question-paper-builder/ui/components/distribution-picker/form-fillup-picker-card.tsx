"use client";

import React from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { cn } from "@workspace/ui/lib/utils";
import { PickerCardWrapper } from "./picker-card-wrapper";

interface FormFillupPickerCardProps {
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

interface ParsedFormField {
  sl?: string;
  label: string;
}

function parseFormFields(formData: any): ParsedFormField[] {
  if (!formData) return [];

  let formObj = formData;
  if (typeof formData === "string") {
    try {
      formObj = JSON.parse(formData);
    } catch {
      return [];
    }
  }

  const bengaliDigits = ["১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯", "১০", "১১", "১২", "১৩", "১৪", "১৫"];

  if (Array.isArray(formObj)) {
    return formObj.map((item, idx) => {
      const defaultSl = bengaliDigits[idx] ? `${bengaliDigits[idx]}.` : `${idx + 1}.`;
      if (typeof item === "string") {
        return {
          sl: defaultSl,
          label: item,
        };
      }
      return {
        sl: item.sl || defaultSl,
        label: item.label || item.name || item.key || `Field ${idx + 1}`,
      };
    });
  }

  if (typeof formObj === "object" && formObj !== null) {
    return Object.entries(formObj).map(([key], idx) => {
      const matchPrefix = key.match(/^([\d১-৯]+[\.\:\-]?)\s*(.*)$/);
      let sl = bengaliDigits[idx] ? `${bengaliDigits[idx]}.` : `${idx + 1}.`;
      let label = key;

      if (matchPrefix && matchPrefix[1] && matchPrefix[2]) {
        sl = matchPrefix[1];
        label = matchPrefix[2];
      }

      return {
        sl,
        label,
      };
    });
  }

  return [];
}

export const FormFillupPickerCard: React.FC<FormFillupPickerCardProps> = ({
  question: q,
  isSelected,
  onToggle,
}) => {
  const chapterName =
    q.academicChapter?.nameBn ||
    q.academicChapter?.nameEn ||
    q.chapter?.nameBn ||
    q.chapter?.nameEn;

  const scenarioText = q.scenario || q.title || "নিচের ফরমটি পূরণ করো:";
  const fields = parseFormFields(q.formData);
  const signatures = Array.isArray(q.signatures) && q.signatures.length > 0
    ? q.signatures
    : ["প্রার্থীর স্বাক্ষর"];

  return (
    <PickerCardWrapper
      id={q.id}
      isAssigned={q.isAssigned}
      isSelected={isSelected}
      onToggle={onToggle}
      chapterName={chapterName}
      difficulty={q.difficulty}
    >
      <div className="flex flex-col gap-3 font-body">
        {/* Scenario / Prompt */}
        <div className="text-sm text-on-surface leading-relaxed py-0.5">
          <div
            className={cn(
              "whitespace-pre-wrap font-bold text-sm text-neutral-900 leading-snug",
              /[\u0980-\u09FF]/.test(scenarioText) && "font-solaiman text-base"
            )}
          >
            <RenderMath text={scenarioText} isMath={true} />
          </div>
        </div>

        {/* Mini Authentic Form Box Preview */}
        <div className="border border-neutral-800 rounded-sm bg-neutral-50/50 p-3 sm:p-4 space-y-3 text-neutral-900 font-solaiman text-xs relative">
          {q.hasPhoto && (
            <div className="absolute right-3 top-3 w-12 h-14 border border-neutral-800 rounded-xs flex items-center justify-center bg-white text-neutral-900 font-bold text-[10px] select-none">
              ছবি
            </div>
          )}

          {/* Institution & Form Title */}
          <div className={cn(
            "text-center space-y-0.5 pb-0.5",
            q.hasPhoto ? "pr-14 pl-1" : "px-1"
          )}>
            {q.institution && (
              <h4 className="text-xs sm:text-sm font-bold tracking-tight text-neutral-900 leading-snug">
                {q.institution}
              </h4>
            )}
            {q.title && (
              <h5 className="text-[11px] sm:text-xs font-bold text-neutral-800">
                {q.title}
              </h5>
            )}
            {q.description && (
              <p className="text-[10px] font-medium text-neutral-600">
                {q.description}
              </p>
            )}
          </div>

          {/* Form Fields Preview */}
          <div className="space-y-1.5 pt-0.5">
            {fields.length > 0 ? (
              fields.slice(0, 6).map((field, fIdx) => (
                <div key={fIdx} className="flex items-baseline text-[11px] leading-tight">
                  <div className="flex items-baseline shrink-0 gap-1 min-w-[100px] sm:min-w-[120px]">
                    {field.sl && <span className="font-bold">{field.sl}</span>}
                    <span className="font-semibold">{field.label}</span>
                    <span className="font-bold ml-auto mr-1">:</span>
                  </div>
                  <div className="flex-1 relative border-b border-dotted border-neutral-700 min-h-[0.8rem]" />
                </div>
              ))
            ) : (
              <div className="text-[11px] text-neutral-400 italic text-center py-1">
                (কোনো ফর্ম ফিল্ড নেই)
              </div>
            )}
            {fields.length > 6 && (
              <p className="text-[10px] text-muted-foreground text-center pt-0.5 italic">
                + আরও {toBengaliDigits(fields.length - 6)}টি ফিল্ড রয়েছে...
              </p>
            )}
          </div>

          {/* Signatures Preview */}
          <div className="pt-2 flex flex-wrap items-end justify-end gap-4">
            {signatures.map((sig: string, sIdx: number) => (
              <div key={sIdx} className="text-center min-w-[80px]">
                <div className="w-full border-b border-neutral-800 mb-0.5" />
                <span className="text-[9px] font-bold text-neutral-800">{sig}</span>
              </div>
            ))}
          </div>
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
        </div>
      </div>
    </PickerCardWrapper>
  );
};
