"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBuilderStore } from "../../../store/use-builder-store";
import { TriangleAlert } from "lucide-react";
import { QuestionPaperTipsBanner } from "../tips";

const toBengaliDigits = (num: number | string): string => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .split("")
    .map((digit) => (/\d/.test(digit) ? bengaliDigits[parseInt(digit, 10)] : digit))
    .join("");
};

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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 select-none"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-card text-foreground rounded-2xl shadow-2xl p-6 sm:p-7 flex flex-col items-center gap-4 w-[420px] max-w-[94vw] border border-border"
          >
            <div className="text-center">
              <p className="font-bold text-lg font-headline text-foreground">পিডিএফ তৈরি হচ্ছে...</p>
              <p className="text-xs text-muted-foreground mt-0.5 font-body">
                {total > 0
                  ? `${toBengaliDigits(Math.min(done + 1, total))}/${toBengaliDigits(total)} পৃষ্ঠা প্রক্রিয়া হচ্ছে`
                  : "প্রস্তুত হচ্ছে..."}
              </p>
            </div>

            <div className="relative w-full bg-muted rounded-full h-2 overflow-hidden">
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

            <div className="flex w-full items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300 font-body">
              <TriangleAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>ডাউনলোড শেষ না হওয়া পর্যন্ত এই ট্যাব বন্ধ করবেন না বা অন্য ট্যাবে যাবেন না।</span>
            </div>

            {/* Super Readable Tips Slider */}
            <div className="w-full">
              <QuestionPaperTipsBanner compact autoPlayIntervalMs={4500} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
