"use client";

import React from "react";
import { Badge } from "@workspace/ui/components/badge";
import { CheckCircle2 } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";

interface PickerCardWrapperProps {
  id: string;
  isAssigned?: boolean;
  isSelected: boolean;
  onToggle: (id: string) => void;
  chapterName?: string | null;
  typeLabel?: string | null;
  difficulty?: string | null;
  extraBadges?: React.ReactNode;
  children: React.ReactNode;
}

const DIFFICULTY_BN_MAP: Record<string, string> = {
  EASY: "সহজ",
  MEDIUM: "মধ্যম",
  HARD: "কঠিন",
};

export const PickerCardWrapper: React.FC<PickerCardWrapperProps> = ({
  id,
  isAssigned,
  isSelected,
  onToggle,
  chapterName,
  typeLabel,
  difficulty,
  extraBadges,
  children,
}) => {
  return (
    <div
      onClick={() => {
        if (!isAssigned) onToggle(id);
      }}
      className={cn(
        "border rounded-2xl p-4 sm:p-5 transition-all relative font-display",
        isAssigned
          ? "bg-slate-50/70 dark:bg-muted/20 border-slate-200/90 dark:border-border/70 cursor-not-allowed select-none shadow-none"
          : isSelected
            ? "border-primary/70 bg-primary/[0.02] shadow-sm cursor-pointer"
            : "bg-card hover:border-primary/50 hover:shadow-sm border-outline-variant cursor-pointer"
      )}
    >
      {/* Animated selection corner borders for selected state */}
      {!isAssigned && (
        <>
          <div
            className={`absolute -top-[1px] -left-[1px] w-14 h-14 border-t-3 border-l-3 border-primary rounded-tl-2xl pointer-events-none transition-all duration-200 origin-top-left ${
              isSelected ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          />
          <div
            className={`absolute -top-[1px] -right-[1px] w-14 h-14 border-t-3 border-r-3 border-primary rounded-tr-2xl pointer-events-none transition-all duration-200 origin-top-right ${
              isSelected ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          />
          <div
            className={`absolute -bottom-[1px] -left-[1px] w-14 h-14 border-b-3 border-l-3 border-primary rounded-bl-2xl pointer-events-none transition-all duration-200 origin-bottom-left ${
              isSelected ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          />
          <div
            className={`absolute -bottom-[1px] -right-[1px] w-14 h-14 border-b-3 border-r-3 border-primary rounded-br-2xl pointer-events-none transition-all duration-200 origin-bottom-right ${
              isSelected ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          />
        </>
      )}

      {/* Card Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className={cn("flex flex-wrap items-center gap-2", isAssigned && "opacity-60")}>
          {chapterName && (
            <span className="px-2.5 py-0.5 bg-muted text-muted-foreground border border-border/60 rounded-md text-xs font-medium">
              {chapterName}
            </span>
          )}
          {typeLabel && (
            <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary text-xs font-medium">
              {typeLabel}
            </Badge>
          )}
          {difficulty && (
            <span
              className={cn(
                "px-2 py-0.5 rounded text-[11px] font-bold border uppercase tracking-wide",
                difficulty === "EASY" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                difficulty === "MEDIUM" && "bg-amber-50 text-amber-700 border-amber-200",
                difficulty === "HARD" && "bg-red-50 text-red-700 border-red-200"
              )}
            >
              {DIFFICULTY_BN_MAP[difficulty.toUpperCase()] || difficulty}
            </span>
          )}
          {extraBadges}
        </div>

        {/* Top-Right Status Indicator */}
        <div className="shrink-0">
          {isAssigned ? (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/70 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>যুক্ত করা হয়েছে</span>
            </div>
          ) : (
            <div
              className={cn(
                "w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all",
                isSelected
                  ? "bg-primary border-primary text-white shadow-xs"
                  : "border-outline-variant bg-white dark:bg-card hover:border-primary/60"
              )}
            >
              {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
            </div>
          )}
        </div>
      </div>

      <div className={cn("transition-opacity", isAssigned && "opacity-55")}>
        {children}
      </div>
    </div>
  );
};
