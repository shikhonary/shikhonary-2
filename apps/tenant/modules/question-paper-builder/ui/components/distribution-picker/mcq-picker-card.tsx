"use client";

import React from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { PickerCardWrapper } from "./picker-card-wrapper";

interface McqPickerCardProps {
  question: any;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const McqPickerCard: React.FC<McqPickerCardProps> = ({
  question: q,
  isSelected,
  onToggle,
}) => {
  const combinedContext =
    q.type === "COMBINED" && Array.isArray(q.attachments)
      ? q.attachments.find((att: any) => att.caption)?.caption
      : null;

  const typeLabel =
    q.type === "SINGLE"
      ? "সাধারণ"
      : q.type === "MULTIPLE"
        ? "বহুপদি"
        : q.type === "COMBINED"
          ? "অভিন্ন"
          : q.type;

  return (
    <PickerCardWrapper
      id={q.id}
      isAssigned={q.isAssigned}
      isSelected={isSelected}
      onToggle={onToggle}
      chapterName={q.chapter?.nameBn || q.chapter?.nameEn}
      typeLabel={typeLabel}
    >
      <div className="flex flex-col gap-3 font-body">
        {(q.questionContext?.text || combinedContext) && (
          <div className="text-xs text-on-surface-variant bg-muted/40 p-2.5 rounded-xl whitespace-pre-wrap border border-outline-variant">
            <RenderMath text={q.questionContext?.text || combinedContext || ""} />
          </div>
        )}
        {q.statements && q.statements.length > 0 && (
          <div className="text-xs space-y-1">
            {q.statements.map((stmt: string, i: number) => (
              <div key={i} className="flex gap-1.5">
                <span className="font-medium text-muted-foreground">
                  {["i", "ii", "iii", "iv"][i] || i + 1}.
                </span>
                <span>
                  <RenderMath text={stmt} />
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="text-sm font-semibold text-on-surface">
          <RenderMath text={q.question || q.title || q.name || ""} />
        </div>
        {Array.isArray(q.attachments) && q.attachments.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-1">
            {q.attachments.map((att: any, attIdx: number) => {
              const isImage =
                att.type === "image" ||
                /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(att.url);
              if (isImage && att.url !== "text-context") {
                return (
                  <div key={attIdx} className="space-y-1">
                    <img
                      src={att.url}
                      alt={att.caption || "Attachment"}
                      className="max-h-36 rounded-lg border border-outline-variant/60 object-contain bg-muted/20"
                    />
                    {att.caption && (
                      <p className="text-[10px] text-outline font-medium italic pl-1">
                        {att.caption}
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
        {q.options && q.options.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
            {q.options.map((opt: string, i: number) => {
              const label = ["ক", "খ", "গ", "ঘ"][i] || "";
              const isAnswer =
                q.answer === String(i + 1) || q.answer === label || q.answer === opt;

              return (
                <div
                  key={i}
                  className={`flex items-start gap-1.5 p-2 rounded-lg border text-xs ${
                    isAnswer
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-medium"
                      : "bg-muted/30 border-transparent"
                  }`}
                >
                  <span
                    className={`shrink-0 flex items-center justify-center w-5 h-5 rounded-full border text-[11px] font-bold ${
                      isAnswer
                        ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-900"
                        : "border-primary/20 bg-primary/5 text-primary"
                    }`}
                  >
                    {label}
                  </span>
                  <div className="mt-0.5 flex-1 leading-snug">
                    <RenderMath text={opt} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {Array.isArray(q.reference) && q.reference.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2 border-t border-outline-variant/30 pt-2.5">
            {q.reference.map((ref: string, rIdx: number) => (
              <span
                key={rIdx}
                className="px-2 py-0.5 bg-muted text-[10px] font-medium rounded text-muted-foreground"
              >
                🏷️ {ref}
              </span>
            ))}
          </div>
        )}
      </div>
    </PickerCardWrapper>
  );
};
