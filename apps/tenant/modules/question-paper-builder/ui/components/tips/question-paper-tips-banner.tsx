"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Wrench, Lightbulb } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { BUILDER_TIPS, type BuilderTipItem, type TipCategoryKey } from "../../../constants/builder-tips";

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "০";
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .split("")
    .map((char) => (/\d/.test(char) ? bengaliDigits[parseInt(char, 10)] : char))
    .join("");
};

export interface QuestionPaperTipsBannerProps {
  className?: string;
  category?: TipCategoryKey;
  autoPlayIntervalMs?: number;
  compact?: boolean;
}

export const QuestionPaperTipsBanner: React.FC<QuestionPaperTipsBannerProps> = ({
  className,
  category = "all",
  autoPlayIntervalMs = 5000,
  compact = false,
}) => {
  const filteredTips = React.useMemo(() => {
    if (category === "all") return BUILDER_TIPS;
    return BUILDER_TIPS.filter((t) => t.category === category);
  }, [category]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  const total = filteredTips.length;
  const currentTip: BuilderTipItem = filteredTips[currentIndex] || filteredTips[0]!;

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-slide effect (paused on hover)
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const interval = setInterval(() => {
      handleNext();
    }, autoPlayIntervalMs);

    return () => clearInterval(interval);
  }, [isPaused, total, autoPlayIntervalMs, handleNext]);

  const IconComponent = currentTip.icon;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-4 sm:p-5 shadow-xs font-display select-none transition-all",
        compact ? "p-3.5 sm:p-4 text-xs" : "",
        className
      )}
    >
      {/* Top Header Row: Category Badge + Counter + Navigation Arrows */}
      <div className="flex items-center justify-between gap-2 pb-2.5 mb-2 border-b border-border/40">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold font-headline border shrink-0",
              currentTip.categoryBadgeClass
            )}
          >
            {currentTip.categoryLabelBn}
          </span>
          <span className="text-[11px] text-muted-foreground font-body font-medium truncate">
            টিপস {toBengaliDigits(currentIndex + 1)} / {toBengaliDigits(total)}
          </span>
        </div>

        {/* Next / Prev Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            className="w-6 h-6 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all cursor-pointer active:scale-95"
            title="পূর্ববর্তী টিপস"
            aria-label="Previous tip"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="w-6 h-6 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all cursor-pointer active:scale-95"
            title="পরবর্তী টিপস"
            aria-label="Next tip"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Animated Tip Content */}
      <div className="relative min-h-[96px] sm:min-h-[88px] flex flex-col justify-center overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentTip.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 24 }}
            transition={{ duration: 0.24, ease: "easeInOut" }}
            className="space-y-2"
          >
            {/* Title & Icon */}
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 mt-0.5">
                <IconComponent className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-bold text-foreground font-headline leading-snug">
                  {currentTip.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-muted-foreground font-body leading-relaxed mt-0.5">
                  {currentTip.advice}
                </p>
              </div>
            </div>

            {/* Action Path Pill */}
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] bg-muted/30 dark:bg-white/[0.02] border border-border/50 rounded-xl px-2.5 py-1 text-muted-foreground font-body">
              <Wrench className="w-3 h-3 text-primary shrink-0" />
              <span className="font-semibold text-foreground shrink-0 font-headline">কীভাবে করবেন:</span>
              <span className="truncate">{currentTip.actionPath}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Pagination Dots */}
      {total > 1 && (
        <div className="flex items-center justify-center gap-1 pt-2.5 mt-1 border-t border-border/30">
          {filteredTips.map((tip, i) => (
            <button
              key={tip.id}
              type="button"
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1);
                setCurrentIndex(i);
              }}
              className={cn(
                "h-1.5 rounded-full transition-all cursor-pointer",
                i === currentIndex
                  ? "w-5 bg-primary"
                  : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
              )}
              aria-label={`Go to tip ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
