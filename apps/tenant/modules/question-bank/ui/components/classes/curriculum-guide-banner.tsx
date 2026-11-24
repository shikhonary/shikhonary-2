"use client"

import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Wrench,
} from "lucide-react"
import { BUILDER_TIPS, type BuilderTipItem } from "@/modules/question-paper-builder/constants/builder-tips"

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "০"
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
  return num
    .toString()
    .split("")
    .map((char) => (/\d/.test(char) ? bengaliDigits[parseInt(char, 10)] : char))
    .join("")
}

const DEFAULT_INTERVAL_MS = 5000

interface CurriculumGuideBannerProps {
  className?: string
  autoPlayIntervalMs?: number
}

export const CurriculumGuideBanner: React.FC<CurriculumGuideBannerProps> = ({
  className = "",
  autoPlayIntervalMs = DEFAULT_INTERVAL_MS,
}) => {
  // Random initial index to give variety on load
  const [index, setIndex] = useState(() => Math.floor(Math.random() * BUILDER_TIPS.length))
  const [isPaused, setIsPaused] = useState(false)
  const [direction, setDirection] = useState<1 | -1>(1)

  const total = BUILDER_TIPS.length
  const tip: BuilderTipItem = BUILDER_TIPS[index] ?? BUILDER_TIPS[0]!
  const Icon = tip.icon

  const handleNext = useCallback(() => {
    setDirection(1)
    setIndex((i) => (i + 1) % total)
  }, [total])

  const handlePrev = useCallback(() => {
    setDirection(-1)
    setIndex((i) => (i - 1 + total) % total)
  }, [total])

  useEffect(() => {
    if (isPaused) return
    const id = setInterval(() => {
      handleNext()
    }, autoPlayIntervalMs)
    return () => clearInterval(id)
  }, [isPaused, autoPlayIntervalMs, handleNext])

  return (
    <section
      aria-label="প্রশ্ন প্রণয়ন ও মূল্যায়ন টিপস"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-5 sm:p-6 md:p-7 shadow-xs group transition-all select-none ${className}`}
    >
      {/* Decorative ambient background glows */}
      <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-indigo-500/10 dark:bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-1/4 -top-16 w-48 h-48 bg-sky-500/10 dark:bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col justify-between gap-4 sm:gap-5">
        {/* Top bar: Badge, counter & Prev/Next buttons */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-primary/10 text-indigo-700 dark:text-primary border border-indigo-100 dark:border-primary/20 text-xs font-semibold font-body">
              <Lightbulb className="w-3.5 h-3.5 stroke-[2]" />
              <span>প্রশ্ন প্রণয়ন ও লেআউট টিপস</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
            </div>

            <span className="text-xs text-slate-400 dark:text-muted-foreground font-body font-medium hidden sm:inline-flex">
              টিপস {toBengaliDigits(index + 1)} / {toBengaliDigits(total)}
            </span>
          </div>

          {/* Controls: Prev & Next buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handlePrev}
              className="w-8 h-8 rounded-full border border-slate-200/90 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.08] active:scale-95 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all cursor-pointer shadow-2xs"
              title="পূর্ববর্তী টিপস"
              aria-label="পূর্ববর্তী টিপস"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="w-8 h-8 rounded-full border border-slate-200/90 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.08] active:scale-95 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all cursor-pointer shadow-2xs"
              title="পরবর্তী টিপস"
              aria-label="পরবর্তী টিপস"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Animated Slide Content */}
        <div className="relative min-h-[120px] sm:min-h-[105px] flex items-center overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={tip.id}
              custom={direction}
              initial={{ opacity: 0, x: direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 24 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="flex items-start gap-3.5 sm:gap-4 w-full"
            >
              {/* Animated Icon badge */}
              <motion.div
                initial={{ scale: 0.65, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 14 }}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100 dark:border-primary/20 text-indigo-600 dark:text-primary flex items-center justify-center shrink-0 shadow-2xs mt-0.5"
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
              </motion.div>

              {/* Text Information */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold border ${tip.categoryBadgeClass}`}
                  >
                    {tip.categoryLabelBn}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold font-headline text-slate-900 dark:text-foreground mt-1 leading-snug">
                  {tip.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-600 dark:text-muted-foreground font-body leading-relaxed mt-1 max-w-4xl">
                  {tip.advice}
                </p>

                {/* Super Readable Action Path Pill */}
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.08] rounded-xl px-2.5 sm:px-3 py-1.5 text-slate-600 dark:text-slate-300 font-body mt-2.5 w-fit max-w-full">
                  <Wrench className="w-3.5 h-3.5 text-indigo-600 dark:text-primary shrink-0" />
                  <span className="font-semibold text-slate-900 dark:text-foreground shrink-0 font-headline">কীভাবে করবেন:</span>
                  <span className="truncate">{tip.actionPath}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom bar: Dots & interactive hint */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/[0.06] text-xs">
          <span className="text-[11px] text-slate-400 dark:text-muted-foreground/75 font-body hidden md:inline-flex">
            মাউস রাখলে স্লাইড থামবে • টিপস পরিবর্তন করতে তীর বা ডট চাপুন
          </span>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1 sm:gap-1.5 ml-auto sm:ml-0 flex-wrap">
            {BUILDER_TIPS.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setDirection(i > index ? 1 : -1)
                  setIndex(i)
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  i === index
                    ? "w-5 sm:w-6 bg-indigo-600 dark:bg-primary"
                    : "w-1.5 bg-slate-200 dark:bg-white/20 hover:bg-slate-300 dark:hover:bg-white/40"
                }`}
                title={`টিপস ${toBengaliDigits(i + 1)}: ${item.title}`}
                aria-label={`টিপস ${toBengaliDigits(i + 1)}: ${item.title}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
