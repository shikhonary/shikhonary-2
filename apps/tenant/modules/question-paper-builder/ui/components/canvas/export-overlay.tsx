"use client";

import React from "react";
import { useBuilderStore } from "../../../store/use-builder-store";
import { Loader2 } from "lucide-react";

const toBengaliDigits = (num: number | string): string => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .split("")
    .map((digit) => (/\d/.test(digit) ? bengaliDigits[parseInt(digit)] : digit))
    .join("");
};

export const ExportOverlay: React.FC = () => {
  const isExporting = useBuilderStore((state) => state.isExporting);
  const exportProgress = useBuilderStore((state) => state.exportProgress);

  if (!isExporting) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 min-w-[280px]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <div className="text-center">
          <p className="font-semibold text-lg font-display">
            পিডিএফ তৈরি হচ্ছে...
          </p>
          {exportProgress && (
            <p className="text-sm text-muted-foreground mt-1 font-display">
              পৃষ্ঠা {toBengaliDigits(exportProgress.current)}/
              {toBengaliDigits(exportProgress.total)}
            </p>
          )}
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-300"
            style={{
              width: exportProgress
                ? `${(exportProgress.current / exportProgress.total) * 100}%`
                : "0%",
            }}
          />
        </div>
      </div>
    </div>
  );
};
