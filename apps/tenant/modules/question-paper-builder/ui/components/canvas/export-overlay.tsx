"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBuilderStore } from "../../../store/use-builder-store";
import {
  Columns2,
  FileText,
  Lightbulb,
  Printer,
  Ruler,
  ScanLine,
  Stamp,
  TriangleAlert,
  Type,
  BookOpen,
} from "lucide-react";

const toBengaliDigits = (num: number | string): string => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .split("")
    .map((digit) => (/\d/.test(digit) ? bengaliDigits[parseInt(digit)] : digit))
    .join("");
};

const TIPS = [
  {
    icon: Printer,
    title: "প্রিন্ট স্কেল",
    text: "প্রিন্ট করার সময় স্কেল ১০০% বা \"Actual size\" রাখুন, \"Fit to page\" নয়।",
  },
  {
    icon: Columns2,
    title: "একাধিক কলাম",
    text: "কলাম সংখ্যা বাড়ালে কাগজ বাঁচে — ২ কলামে প্রশ্ন ঘন হয়ে বসে।",
  },
  {
    icon: Ruler,
    title: "মার্জিন",
    text: "পেজ সেটিংসে মার্জিন কমিয়ে বেশি প্রশ্ন এক পৃষ্ঠায় আনতে পারেন।",
  },
  {
    icon: BookOpen,
    title: "বুকলেট মোড",
    text: "বুক-ফোল্ড লেআউটে দুই পাশে প্রিন্ট করে ভাঁজ করলেই বুকলেট তৈরি।",
  },
  {
    icon: Type,
    title: "ফন্ট সাইজ",
    text: "ফন্ট সাইজ ও লাইন-হাইট বদলালে পৃষ্ঠার বিন্যাস সঙ্গে সঙ্গে আপডেট হয়।",
  },
  {
    icon: ScanLine,
    title: "OMR শিট",
    text: "MCQ থাকলে OMR শিট চালু করুন — এটি শেষ পৃষ্ঠায় যুক্ত হবে।",
  },
  {
    icon: Stamp,
    title: "ওয়াটারমার্ক",
    text: "প্রতিষ্ঠানের নাম ওয়াটারমার্ক হিসেবে দিলে প্রশ্নপত্র কপি করা কঠিন হয়।",
  },
  {
    icon: FileText,
    title: "হেডার টেমপ্লেট",
    text: "ক্লাসিক, মডার্ন, মিনিমাল — যে হেডারটি আপনার প্রতিষ্ঠানের সাথে মানায় সেটি বেছে নিন।",
  },
];

const TIP_INTERVAL_MS = 3500;

function TipsCarousel() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * TIPS.length));

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % TIPS.length), TIP_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const tip = TIPS[index]!;
  const Icon = tip.icon;

  return (
    <div className="w-full rounded-xl border border-primary/15 bg-primary/5 p-4">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-primary font-display">
        <Lightbulb className="h-3.5 w-3.5" />
        প্রশ্নপত্র টিপস
      </div>
      <div className="relative h-[72px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex items-start gap-3"
          >
            <motion.div
              initial={{ scale: 0.6, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 14 }}
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            >
              <Icon className="h-5 w-5" />
            </motion.div>
            <div className="min-w-0">
              <p className="text-sm font-semibold font-display">{tip.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground font-display">
                {tip.text}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-2 flex justify-center gap-1">
        {TIPS.map((_, i) => (
          <span
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === index ? "w-4 bg-primary" : "w-1 bg-primary/25"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export const ExportOverlay: React.FC = () => {
  const isExporting = useBuilderStore((state) => state.isExporting);
  const exportProgress = useBuilderStore((state) => state.exportProgress);

  // `current` = pages already captured. The bar creeps towards the next page while
  // it is being captured, so it never looks frozen during heavy work.
  const total = exportProgress?.total ?? 0;
  const done = exportProgress?.current ?? 0;
  const target = total > 0 ? Math.min(1, (done + 0.85) / total) : 0.04;

  return (
    <AnimatePresence>
      {isExporting && (
        <motion.div
          key="export-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-5 w-[380px] max-w-[92vw]"
          >
            <div className="text-center">
              <p className="font-semibold text-lg font-display">পিডিএফ তৈরি হচ্ছে...</p>
              <p className="text-sm text-muted-foreground mt-1 font-display">
                {total > 0
                  ? `${toBengaliDigits(Math.min(done + 1, total))}/${toBengaliDigits(total)} পৃষ্ঠা প্রক্রিয়া হচ্ছে`
                  : "প্রস্তুত হচ্ছে..."}
              </p>
            </div>
            <div className="relative w-full bg-muted rounded-full h-2 overflow-hidden">
              {/* transform/opacity animations run on the compositor, so they keep
                  moving even while the main thread is busy capturing pages */}
              <style>{`@keyframes export-shimmer{from{transform:translateX(-100%)}to{transform:translateX(300%)}}`}</style>
              <div
                className="absolute inset-0 bg-primary rounded-full overflow-hidden"
                style={{
                  transformOrigin: "left",
                  transform: `scaleX(${target})`,
                  transition: `transform ${total > 0 ? 6 : 2}s cubic-bezier(0.1, 0.6, 0.3, 1)`,
                  willChange: "transform",
                }}
              >
                <div
                  className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                  style={{ animation: "export-shimmer 1.4s linear infinite", willChange: "transform" }}
                />
              </div>
            </div>
            <div className="flex w-full items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 font-display">
              <TriangleAlert className="h-4 w-4 shrink-0" />
              <span>ডাউনলোড শেষ না হওয়া পর্যন্ত এই ট্যাব বন্ধ করবেন না বা অন্য ট্যাবে যাবেন না।</span>
            </div>
            <TipsCarousel />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
