"use client";

import React from "react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { CheckCircle2, Check, Plus, ArrowRight, X, BookOpen, Tag, Calculator, Bookmark } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { QuestionAnswerAccordion } from "@/modules/question-bank/ui/components/cards/question-answer-accordion";

export interface PickerContextType {
  isExchangeMode?: boolean;
  currentQuestionId?: string;
  isBankMode?: boolean;
  isBookmarked?: (id: string) => boolean;
  onToggleBookmark?: (id: string) => void;
  onPreview?: (id: string) => void;
  hasSubscription?: boolean;
  getQuestion?: (id: string) => any;
}

export const PickerContext = React.createContext<PickerContextType>({});
export const usePickerContext = () => React.useContext(PickerContext);

interface PickerCardWrapperProps {
  id: string;
  question?: any;
  isAssigned?: boolean;
  isSelected: boolean;
  onToggle: (id: string) => void;
  index?: number | null;
  chapterName?: string | null;
  typeLabel?: string | null;
  difficulty?: string | null;
  isMath?: boolean;
  marks?: number | string | null;
  referenceTags?: string[] | null;
  source?: string | null;
  session?: string | number | null;
  language?: "bn" | "en";
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

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "";
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .split("")
    .map((char) => (/\d/.test(char) ? bengaliDigits[parseInt(char, 10)] : char))
    .join("");
};

export const PickerCardWrapper: React.FC<PickerCardWrapperProps> = ({
  id,
  question,
  isAssigned,
  isSelected,
  onToggle,
  index,
  chapterName,
  typeLabel,
  difficulty,
  isMath,
  marks,
  referenceTags,
  source,
  session,
  language = "bn",
  extraBadges,
  footerLeft,
  footerRight,
  children,
}) => {
  const isEn = language === "en";
  const {
    isExchangeMode,
    currentQuestionId,
    isBankMode,
    isBookmarked: checkBookmarked,
    onToggleBookmark: handleToggleBookmark,
    onPreview: handlePreview,
    hasSubscription,
    getQuestion,
  } = usePickerContext();
  const isCurrentQuestion = currentQuestionId === id;
  const isBlocked = isExchangeMode ? false : Boolean(isAssigned);
  const bookmarked = checkBookmarked ? checkBookmarked(id) : false;

  const refList = Array.isArray(referenceTags) ? referenceTags.filter(Boolean) : [];
  const refString = refList.join(", ");
  const sourceText = source ? `${source}${session ? ` (${toBengaliDigits(session)})` : ""}` : "";

  if (isBankMode) {
    const finalRef = refString || sourceText || "শিখনারী প্রশ্নভাণ্ডার";
    const questionData = question || (getQuestion ? getQuestion(id) : null) || { id, marks };

    return (
      <article
        onClick={() => {
          if (handlePreview) handlePreview(id);
        }}
        className={cn(
          "rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-0 shadow-xs",
          "transition-all duration-200 hover:shadow-md hover:border-indigo-500/30 flex flex-col justify-between overflow-hidden relative font-display cursor-pointer",
          "h-full"
        )}
      >
        <div className="p-4 sm:p-5 pb-3.5 flex-1 flex flex-col">
          {/* Bank Mode Header: NO difficulty, NO mark, NO checkbox */}
          <div className="flex items-center justify-between gap-2.5 pb-2.5 mb-3 border-b border-border/40 select-none">
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              {index !== undefined && index !== null && (
                <span className="px-2 py-0.5 bg-muted/70 text-muted-foreground font-solaiman text-[11px] font-bold rounded-md border border-border/60">
                  #{toBengaliDigits(index)}
                </span>
              )}
              {chapterName && (
                <span
                  className="px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/25 rounded-md text-[11px] font-semibold font-body truncate max-w-[150px] sm:max-w-[240px]"
                  title={chapterName}
                >
                  {chapterName}
                </span>
              )}
              {extraBadges}
            </div>
          </div>

          {/* Children (Question Content) */}
          <div className="flex-1">
            {children}
          </div>

          {/* Question Bank Answer Accordion */}
          <div className="mt-3 pt-2.5 border-t border-border/30">
            <QuestionAnswerAccordion
              question={questionData}
              hasSubscription={hasSubscription}
            />
          </div>
        </div>

        {/* Bank Mode Footer: Reference left, ONLY "Add to Bookmark" button right */}
        <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-white/[0.02] border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between text-xs font-body mt-auto relative z-10">
          <div className="flex items-center gap-1.5 min-w-0 pr-2">
            <span
              className="text-[11px] text-muted-foreground/80 flex items-center gap-1.5 truncate max-w-[150px] sm:max-w-[220px] font-body"
              title={finalRef}
            >
              <Tag className="w-3 h-3 shrink-0 text-muted-foreground/60" />
              <span className="truncate">{finalRef}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {handleToggleBookmark && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleBookmark(id);
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-headline transition-all cursor-pointer active:scale-95",
                  bookmarked
                    ? "bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400"
                    : "bg-white dark:bg-card border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-800 shadow-2xs hover:bg-rose-50/50 dark:hover:bg-rose-950/20"
                )}
                title={bookmarked ? "বুকমার্ক থেকে মুছুন" : "বুকমার্কে সংরক্ষণ করুন"}
              >
                <Bookmark
                  className={cn(
                    "w-3.5 h-3.5",
                    bookmarked ? "fill-rose-500 text-rose-500" : "text-slate-500"
                  )}
                />
                <span>{bookmarked ? "বুকমার্কে সংরক্ষিত" : "বুকমার্কে যোগ করুন"}</span>
              </button>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      onClick={() => {
        if (!isBlocked) onToggle(id);
      }}
      className={cn(
        "rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden group select-none relative font-display active:scale-[0.99]",
        isBlocked
          ? "bg-slate-50/70 dark:bg-white/[0.02] border-slate-200/90 dark:border-white/10 cursor-default shadow-none"
          : isCurrentQuestion
            ? "border-amber-400 dark:border-amber-500/60 ring-2 ring-amber-400/20 bg-amber-500/[0.03] dark:bg-amber-950/[0.1] shadow-md cursor-pointer"
            : isSelected
              ? "border-emerald-600 dark:border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/[0.025] dark:bg-emerald-950/[0.06] shadow-md -translate-y-0.5 cursor-pointer"
              : "bg-card border-border/70 hover:border-emerald-500/40 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
      )}
    >
      {/* Top Container */}
      <div className="p-3.5 sm:p-5 pb-3 sm:pb-3.5 flex-1 flex flex-col">
        {/* Card Header: Badges & Right Action (Checkbox) */}
        <div className="flex items-start justify-between gap-2.5 mb-3">
          {/* Left Metadata Badges: ONLY Numbering and Chapter Name */}
          <div className="flex flex-wrap items-center gap-1.5">
            {index !== undefined && index !== null && (
              <span className="px-2 py-0.5 bg-muted/70 text-muted-foreground font-solaiman text-[11px] font-bold rounded-md border border-border/60">
                #{toBengaliDigits(index)}
              </span>
            )}
            {chapterName && (
              <span
                className="px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/25 rounded-md text-[11px] font-semibold font-body truncate max-w-[130px] sm:max-w-[200px]"
                title={chapterName}
              >
                {chapterName}
              </span>
            )}
          </div>

          {/* Right Group: Checkbox */}
          <div className="flex items-center gap-2 shrink-0">
            {isBlocked ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-muted-foreground text-[11px] font-bold font-headline">
                <Check className="w-3 h-3 text-slate-500 dark:text-muted-foreground shrink-0" />
                <span>{isEn ? "Added to Paper" : "ইতিমধ্যে যুক্ত"}</span>
              </span>
            ) : (
              <div
                className={cn(
                  "w-6.5 h-6.5 rounded-lg border flex items-center justify-center shrink-0 transition-all duration-150",
                  isSelected
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-xs scale-105"
                    : "border-border/80 bg-background/80 hover:border-emerald-500/60 group-hover:border-emerald-500/50"
                )}
              >
                {isSelected && <Check className="w-4 h-4 text-white stroke-[2.5]" />}
              </div>
            )}
          </div>
        </div>

        {/* Children (Question Content) */}
        <div className="transition-opacity flex-1 flex flex-col justify-between">
          <div className="flex-1">
            {children}
          </div>

          {/* Comma-separated References at the end of content section */}
          {refString && (
            <div className="pt-2.5 mt-3 border-t border-border/40 flex items-center gap-1.5 text-[11px] text-muted-foreground font-body">
              <Tag className="w-3 h-3 shrink-0 text-muted-foreground/60" />
              <span className="truncate" title={refString}>{refString}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Card Footer Action Bar */}
      <div className="px-3.5 sm:px-5 py-2.5 sm:py-3 bg-muted/25 dark:bg-white/[0.02] border-t border-border/50 flex items-center justify-between text-xs font-body mt-auto">
        {/* Left Side: Source Info or Selection Status */}
        <div className="flex items-center gap-2 min-w-0 pr-2">
          {footerLeft ? (
            footerLeft
          ) : sourceText ? (
            <span
              className="text-[11px] text-muted-foreground flex items-center gap-1.5 truncate max-w-[130px] sm:max-w-none font-body"
              title={sourceText}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0 text-muted-foreground/70" />
              <span className="truncate">{sourceText}</span>
            </span>
          ) : isSelected ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 font-headline">
              <Check className="h-3.5 w-3.5 shrink-0" />
              <span>{isEn ? "Selected" : "নির্বাচিত"}</span>
            </span>
          ) : isCurrentQuestion ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300/50 dark:border-amber-700/50 font-headline">
              <span>{isEn ? "Current Question" : "বিদ্যমান প্রশ্ন"}</span>
            </span>
          ) : isBlocked ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-muted-foreground border border-slate-200/80 dark:border-white/[0.08] font-headline">
              <Check className="h-3.5 w-3.5 shrink-0 text-slate-500 dark:text-muted-foreground" />
              <span>{isEn ? "Already added" : "ইতিমধ্যে যুক্ত রয়েছে"}</span>
            </span>
          ) : (
            <span className="text-muted-foreground font-medium text-xs font-body">
              {isEn ? "Select question" : "প্রশ্ন সিলেক্ট করুন"}
            </span>
          )}
        </div>

        {/* Right Side: CTA Action Button */}
        <div className="shrink-0">
          {footerRight ? (
            footerRight
          ) : isBlocked ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-muted-foreground bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] px-2.5 py-1 rounded-lg font-headline">
              <span>{isEn ? "Included in paper" : "ইতিমধ্যে যুক্ত রয়েছে"}</span>
            </span>
          ) : isSelected ? (
            <Button
              size="sm"
              variant="ghost"
              type="button"
              className="h-8 px-3 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 gap-1.5 transition-all cursor-pointer font-headline active:scale-95"
            >
              <X className="w-3.5 h-3.5" />
              <span>{isEn ? "Deselect" : "বাদ দিন"}</span>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              type="button"
              className="h-8 px-3 rounded-lg text-xs font-bold text-primary bg-primary/5 hover:bg-primary/15 gap-1.5 group-hover:translate-x-0.5 transition-all cursor-pointer font-headline active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isEn ? "Select" : "সিলেক্ট করুন"}</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </article>
  );
};
