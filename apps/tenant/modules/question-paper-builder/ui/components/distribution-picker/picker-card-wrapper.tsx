"use client";

import React from "react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { CheckCircle2, Check, Plus, ArrowRight, X } from "lucide-react";
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
  footerLeft?: React.ReactNode;
  footerRight?: React.ReactNode;
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
  footerLeft,
  footerRight,
  children,
}) => {
  return (
    <article
      onClick={() => {
        if (!isAssigned) onToggle(id);
      }}
      className={cn(
        "bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group select-none relative font-display",
        isAssigned
          ? "bg-slate-50/70 dark:bg-muted/20 border-slate-200/90 dark:border-border/70 cursor-not-allowed shadow-none"
          : isSelected
            ? "border-primary/80 ring-2 ring-primary/20 bg-primary/[0.02] cursor-pointer"
            : "hover:border-indigo-300 dark:hover:border-primary/40 cursor-pointer"
      )}
    >
      {/* Animated selection corner borders for selected state */}
      {!isAssigned && (
        <>
          <div
            className={`absolute -top-[1px] -left-[1px] w-12 h-12 border-t-3 border-l-3 border-primary rounded-tl-2xl pointer-events-none transition-all duration-200 origin-top-left ${
              isSelected ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          />
          <div
            className={`absolute -top-[1px] -right-[1px] w-12 h-12 border-t-3 border-r-3 border-primary rounded-tr-2xl pointer-events-none transition-all duration-200 origin-top-right ${
              isSelected ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          />
          <div
            className={`absolute -bottom-[1px] -left-[1px] w-12 h-12 border-b-3 border-l-3 border-primary rounded-bl-2xl pointer-events-none transition-all duration-200 origin-bottom-left ${
              isSelected ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          />
          <div
            className={`absolute -bottom-[1px] -right-[1px] w-12 h-12 border-b-3 border-r-3 border-primary rounded-br-2xl pointer-events-none transition-all duration-200 origin-bottom-right ${
              isSelected ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          />
        </>
      )}

      {/* Top Container */}
      <div className="p-4 sm:p-5 pb-3 sm:pb-4 flex-1 flex flex-col">
        {/* Card Header: Badges & Checkbox */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className={cn("flex flex-wrap items-center gap-1.5 sm:gap-2", isAssigned && "opacity-60")}>
            {chapterName && (
              <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-muted-foreground border border-slate-200 dark:border-white/[0.08] rounded-md text-xs font-medium font-body">
                {chapterName}
              </span>
            )}
            {typeLabel && (
              <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary text-xs font-medium font-headline">
                {typeLabel}
              </Badge>
            )}
            {difficulty && (
              <span
                className={cn(
                  "px-2 py-0.5 rounded text-[11px] font-bold border uppercase tracking-wide font-headline",
                  difficulty === "EASY" && "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40",
                  difficulty === "MEDIUM" && "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40",
                  difficulty === "HARD" && "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/40"
                )}
              >
                {DIFFICULTY_BN_MAP[difficulty.toUpperCase()] || difficulty}
              </span>
            )}
            {extraBadges}
          </div>

          {/* Top-Right Status / Selection Checkbox */}
          <div className="shrink-0">
            {isAssigned ? (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/70 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shadow-2xs font-headline">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="hidden sm:inline">যুক্ত</span>
              </div>
            ) : (
              <div
                className={cn(
                  "w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all",
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground shadow-xs scale-105"
                    : "border-slate-300 dark:border-white/10 bg-background hover:border-primary/60"
                )}
              >
                {isSelected && <Check className="w-4 h-4 text-white stroke-[2.5]" />}
              </div>
            )}
          </div>
        </div>

        {/* Children (Question Content) */}
        <div className={cn("transition-opacity flex-1", isAssigned && "opacity-55")}>
          {children}
        </div>
      </div>

      {/* Bottom Card Footer Action Bar - Matching Question Paper Card Footer */}
      <div className="px-4 sm:px-5 py-2.5 sm:py-3 bg-slate-50/70 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs font-body mt-auto">
        {/* Left Side: Status / Info */}
        <div className="flex items-center gap-2">
          {footerLeft ? (
            footerLeft
          ) : isAssigned ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40 font-headline">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>যুক্ত রয়েছে</span>
            </span>
          ) : isSelected ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/40 font-headline">
              <Check className="h-3.5 w-3.5 shrink-0" />
              <span>নির্বাচিত</span>
            </span>
          ) : (
            <span className="text-slate-400 dark:text-muted-foreground font-medium text-xs font-body">
              প্রশ্ন নির্বাচন
            </span>
          )}
        </div>

        {/* Right Side: CTA Action Button */}
        <div>
          {footerRight ? (
            footerRight
          ) : isAssigned ? (
            <span className="text-xs font-medium text-muted-foreground italic font-body">
              প্রশ্নপত্রে বিদ্যমান
            </span>
          ) : isSelected ? (
            <Button
              size="sm"
              variant="ghost"
              type="button"
              className="h-8 px-3 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 gap-1.5 transition-all cursor-pointer font-headline active:scale-95"
            >
              <X className="w-3.5 h-3.5" />
              <span>বাছাই বাতিল</span>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              type="button"
              className="h-8 px-3 rounded-lg text-xs font-bold text-primary hover:bg-primary/10 hover:text-primary gap-1.5 group-hover:translate-x-0.5 transition-all cursor-pointer font-headline active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>বাছাই করুন</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </article>
  );
};
