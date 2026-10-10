"use client";

import React from "react";
import { useBuilderStore } from "../../../../store/use-builder-store";
import { Label } from "@workspace/ui/components/label";
import { ListOrdered, LayoutGrid } from "lucide-react";

export const QuestionSettingsCard: React.FC = () => {
  const settings = useBuilderStore((state) => state.settings);
  const updateSettings = useBuilderStore((state) => state.updateSettings);

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-4 shadow-xs space-y-4">
      {/* Card Header */}
      <div className="flex items-center gap-2.5 pb-1 border-b border-border/60">
        <div className="size-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/50 dark:border-indigo-800/30">
          <ListOrdered className="w-3.5 h-3.5" />
        </div>
        <div>
          <h3 className="font-headline font-bold text-xs sm:text-sm text-foreground">
            প্রশ্নের বিন্যাস
          </h3>
          <p className="text-[11px] text-muted-foreground font-body">
            MCQ অপশন ও নাম্বারিং স্টাইল
          </p>
        </div>
      </div>

      {/* MCQ Option Style */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground font-headline">
          বহুনির্বাচনির অপশন স্টাইল
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: "parentheses", label: "(ক)" },
            { id: "dot", label: "ক." },
            { id: "circle", label: <span className="rounded-full border border-current size-4.5 flex items-center justify-center text-[10px] font-bold">ক</span> },
            { id: "round", label: "ক)" }
          ].map((opt) => {
            const isSelected = settings.optionStyle === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateSettings({ optionStyle: opt.id as any })}
                className={`py-2 px-2.5 text-xs rounded-xl font-headline transition-all cursor-pointer border flex items-center justify-between ${
                  isSelected
                    ? "bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-500 text-indigo-950 dark:text-indigo-200 font-bold shadow-2xs"
                    : "bg-muted/30 hover:bg-muted/60 text-muted-foreground border-slate-200/60 dark:border-white/[0.06] hover:text-foreground"
                }`}
              >
                <div className="flex items-center justify-center min-w-[24px]">
                  {opt.label}
                </div>
                <span className={`size-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                  isSelected
                    ? "border-indigo-600 dark:border-indigo-400"
                    : "border-slate-300 dark:border-zinc-600"
                }`}>
                  {isSelected && (
                    <span className="size-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MCQ Option Columns */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground font-headline">
          বহুনির্বাচনির কলাম সংখ্যা
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 1, label: "১ কলাম" },
            { id: 2, label: "২ কলাম" },
            { id: 4, label: "৪ কলাম" }
          ].map((opt) => {
            const isSelected = settings.mcqOptionColumns === opt.id || (!settings.mcqOptionColumns && opt.id === 2);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateSettings({ mcqOptionColumns: opt.id as any })}
                className={`py-2 px-2.5 text-xs rounded-xl font-headline transition-all cursor-pointer border flex items-center justify-between ${
                  isSelected
                    ? "bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-500 text-indigo-950 dark:text-indigo-200 font-bold shadow-2xs"
                    : "bg-muted/30 hover:bg-muted/60 text-muted-foreground border-slate-200/60 dark:border-white/[0.06] hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-1">
                  <LayoutGrid className="w-3 h-3 opacity-70" />
                  <span>{opt.label}</span>
                </div>
                <span className={`size-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                  isSelected
                    ? "border-indigo-600 dark:border-indigo-400"
                    : "border-slate-300 dark:border-zinc-600"
                }`}>
                  {isSelected && (
                    <span className="size-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
