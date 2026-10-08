"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Lightbulb,
  Sparkles,
  Layers,
  CheckCircle2,
  Columns2,
  Award,
  BookOpen,
  Type,
  Stamp,
  ScanLine,
  HelpCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "০"
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
  return num
    .toString()
    .split("")
    .map((char) => (/\d/.test(char) ? bengaliDigits[parseInt(char)] : char))
    .join("")
}

const TIPS = [
  {
    icon: Sparkles,
    tag: "সৃজনশীল প্রশ্ন (CQ)",
    title: "বাস্তবমুখী ও প্রাসঙ্গিক উদ্দীপক",
    text: "উদ্দীপকে শিক্ষার্থীদের পরিচিত পরিবেশ ও বাস্তব জীবনের প্রাসঙ্গিক ঘটনা তুলে ধরুন, যাতে মুখস্থবিদ্যার বদলে অনুধাবন ও প্রয়োগের মাধ্যমে উত্তর লিখতে পারে।",
  },
  {
    icon: Layers,
    tag: "প্রশ্ন কাঠামো ও ব্লুপ্রিন্ট",
    title: "জ্ঞান, অনুধাবন ও প্রয়োগের ভারসাম্য",
    text: "এনসিটিবি কারিকুলাম নির্দেশিকা অনুযায়ী জ্ঞান, অনুধাবন, প্রয়োগ ও উচ্চতর দক্ষতার মানানসই অনুপাত বজায় রেখে প্রশ্নপত্র প্রণয়ন করুন।",
  },
  {
    icon: CheckCircle2,
    tag: "বহুনির্বাচনি (MCQ)",
    title: "কার্যকর বিভ্রান্তিকারক (Distractors) বিকল্প",
    text: "MCQ প্রশ্নে অবাস্তব বা হাস্যকর বিকল্প পরিহার করুন; শিক্ষার্থীদের সম্ভাব্য সাধারণ ভুল ধারণার ওপর ভিত্তি করে যুক্তিযুক্ত বিকল্প নির্ধারণ করুন।",
  },
  {
    icon: Columns2,
    tag: "প্রিন্ট ও লেআউট",
    title: "২-কলাম লেআউটে কাগজ সাশ্রয়",
    text: "প্রশ্নপত্র প্রিন্ট করার সময় ২-কলাম মোড ব্যবহার করলে পৃষ্ঠায় প্রশ্ন ঘন ও সুবিন্যস্ত হয় এবং কাগজের খরচ প্রায় ৩০% পর্যন্ত কমে যায়।",
  },
  {
    icon: Award,
    tag: "মূল্যায়ন মান",
    title: "কঠিনতার স্তরের সুষম বণ্টন",
    text: "একটি আদর্শ প্রশ্নপত্রে সহজ (৩০%), মধ্যম (৫০%) ও চ্যালেঞ্জিং (২০%) প্রশ্নের ভারসাম্য রাখুন, যাতে সব মেধার শিক্ষার্থীদের নিরপেক্ষ মূল্যায়ন নিশ্চিত হয়।",
  },
  {
    icon: BookOpen,
    tag: "সিলেবাস কভারেজ",
    title: "অধ্যায়ের গুরুত্বভিত্তিক প্রশ্ন বণ্টন",
    text: "একটি নির্দিষ্ট অধ্যায়ের ওপর অতিরিক্ত জোর না দিয়ে পাঠ্যসূচির প্রতিটি সক্রিয় অধ্যায় থেকে সমানুপাতিক হারে প্রশ্ন নির্বাচন করুন।",
  },
  {
    icon: Type,
    tag: "পৃষ্ঠা বিন্যাস",
    title: "সুস্পষ্ট ফন্ট সাইজ ও মার্জিন বিন্যাস",
    text: "প্রশ্নপত্র মুদ্রণের ক্ষেত্রে ১১-১২pt ফন্ট সাইজ এবং ০.৫ ইঞ্চি মার্জিন আদর্শ। এতে প্রশ্ন সহজে পড়া যায় এবং পরীক্ষার হলে অস্পষ্টতা থাকে না।",
  },
  {
    icon: Stamp,
    tag: "নিরাপত্তা ও স্বত্ব",
    title: "প্রতিষ্ঠানের নিজস্ব ডিজিটাল ওয়াটারমার্ক",
    text: "প্রশ্নপত্রে প্রতিষ্ঠানের নাম বা মনোগ্রাম হালকা ওয়াটারমার্ক হিসেবে যুক্ত রাখলে প্রশ্নপত্রের স্বত্বাধিকার সংরক্ষিত থাকে ও অননুমোদিত নকল রোধ হয়।",
  },
  {
    icon: ScanLine,
    tag: "স্বয়ংক্রিয় মূল্যায়ন",
    title: "MCQ মূল্যায়নে ডিজিটাল OMR শিট",
    text: "বহুনির্বাচনি পরীক্ষার জন্য প্রশ্নপত্রের সাথে ওএমআর শিট যুক্ত রাখুন, যা শিক্ষক ও পরীক্ষকদের দ্রুত ও নির্ভুলভাবে উত্তরপত্র যাচাই করতে সহায়তা করে।",
  },
  {
    icon: FileText,
    tag: "উত্তর নির্দেশিকা",
    title: "সংক্ষিপ্ত মূল্যায়ন নির্দেশিকা ও রুব্রিক্স",
    text: "প্রশ্নপত্র চূড়ান্ত করার পাশাপাশি সংক্ষিপ্ত মূল্যায়ন রুব্রিক্স বা উত্তরমালা সংরক্ষণ করুন, যা খাতা মূল্যায়নে সমতা ও দ্রুততা নিশ্চিত করে।",
  },
]

const TIP_INTERVAL_MS = 4500

interface CurriculumGuideBannerProps {
  className?: string
}

export const CurriculumGuideBanner: React.FC<CurriculumGuideBannerProps> = ({
  className = "",
}) => {
  // Random initial index to surprise the user on each mount, just like the export overlay modal
  const [index, setIndex] = useState(() => Math.floor(Math.random() * TIPS.length))
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % TIPS.length)
    }, TIP_INTERVAL_MS)
    return () => clearInterval(id)
  }, [isPaused])

  const handleNext = () => setIndex((i) => (i + 1) % TIPS.length)
  const handlePrev = () => setIndex((i) => (i - 1 + TIPS.length) % TIPS.length)

  const tip = TIPS[index] ?? TIPS[0]!
  const Icon = tip.icon

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

      <div className="relative z-10 flex flex-col justify-between gap-5">
        {/* Top bar: Badge, counter & Prev/Next buttons */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-primary/10 text-indigo-700 dark:text-primary border border-indigo-100 dark:border-primary/20 text-xs font-semibold font-body">
              <Lightbulb className="w-3.5 h-3.5 stroke-[2]" />
              <span>প্রশ্ন প্রণয়ন ও মূল্যায়ন টিপস</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
            </div>

            <span className="text-xs text-slate-400 dark:text-muted-foreground font-body font-medium hidden sm:inline-flex">
              টিপস {toBengaliDigits(index + 1)} / {toBengaliDigits(TIPS.length)}
            </span>
          </div>

          {/* Controls: Prev & Next buttons */}
          <div className="flex items-center gap-1.5">
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
        <div className="relative min-h-[94px] sm:min-h-[82px] flex items-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
              className="flex items-start gap-4 w-full"
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
                  <span className="text-[11px] font-semibold text-indigo-600 dark:text-primary tracking-wide font-body">
                    {tip.tag}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold font-headline text-slate-900 dark:text-foreground mt-0.5 leading-snug">
                  {tip.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-600 dark:text-muted-foreground font-body leading-relaxed mt-1 max-w-4xl">
                  {tip.text}
                </p>
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
          <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
            {TIPS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  i === index
                    ? "w-6 bg-indigo-600 dark:bg-primary"
                    : "w-1.5 bg-slate-200 dark:bg-white/20 hover:bg-slate-300 dark:hover:bg-white/40"
                }`}
                title={`টিপস ${toBengaliDigits(i + 1)}`}
                aria-label={`টিপস ${toBengaliDigits(i + 1)}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
