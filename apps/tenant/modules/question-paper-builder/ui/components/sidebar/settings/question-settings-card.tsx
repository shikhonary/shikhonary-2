"use client";

import React from "react";
import { useBuilderStore } from "../../../../store/use-builder-store";
import { Label } from "@workspace/ui/components/label";

export const QuestionSettingsCard: React.FC = () => {
  const settings = useBuilderStore((state) => state.settings);
  const updateSettings = useBuilderStore((state) => state.updateSettings);

  return (
    <div className="p-4 border rounded-xl bg-card space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-semibold text-sm">প্রশ্নের সেটিং</h3>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">বহুনির্বাচনির অপশন স্টাইল</Label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: "parentheses", label: "(ক)" },
            { id: "dot", label: "ক." },
            { id: "circle", label: <span className="rounded-full border border-current w-4 h-4 flex items-center justify-center text-[10px]">ক</span> },
            { id: "round", label: "ক)" }
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => updateSettings({ optionStyle: opt.id as any })}
              className={`py-2 text-xs rounded-lg border flex items-center justify-center ${settings.optionStyle === opt.id ? "bg-primary/10 border-primary font-medium text-primary" : "bg-muted"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">বহুনির্বাচনির কলাম সংখ্যা</Label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 1, label: "১ কলাম" },
            { id: 2, label: "২ কলাম" },
            { id: 4, label: "৪ কলাম" }
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => updateSettings({ mcqOptionColumns: opt.id as any })}
              className={`py-2 text-xs rounded-lg border flex items-center justify-center ${settings.mcqOptionColumns === opt.id || (!settings.mcqOptionColumns && opt.id === 2) ? "bg-primary/10 border-primary font-medium text-primary" : "bg-muted"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
