"use client";

import React from "react";
import { useBuilderStore } from "../../../../store/use-builder-store";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import { toast } from "@workspace/ui/components/sonner";
import { Columns, BookOpen, Scissors, Lock } from "lucide-react";

export const PrintLayoutCard: React.FC = () => {
  const settings = useBuilderStore((state) => state.settings);
  const updateSettings = useBuilderStore((state) => state.updateSettings);
  const pageCount = useBuilderStore((state) => state.pageCount);

  const isDuplicateActive = Boolean(settings.duplicateSinglePage);
  const isGapLocked = Boolean(settings.bookFoldLayout || settings.duplicateSinglePage);
  const currentGap = isGapLocked
    ? (settings.bookFoldLayout ? 30 : 25)
    : (settings.columnGap ?? (settings.columns === 2 ? 12 : 10));

  const handleToggleDuplicate = () => {
    if (!isDuplicateActive) {
      if (pageCount > 1) {
        toast.error("আপনার প্রশ্নপত্রটি ১ পৃষ্ঠার বেশি। ডুপ্লিকেট কপির জন্য প্রশ্ন ১ পৃষ্ঠায় সীমাবদ্ধ রাখুন অথবা নিচের 'বুক ফোল্ড লেআউট' ব্যবহার করুন।");
        return;
      }

      updateSettings({
        duplicateSinglePage: true,
        paperOrientation: "landscape",
        columns: 2,
        showColumnDivider: true,
        bookFoldLayout: false,
      });
      toast.success("ল্যান্ডস্কেপ ২-কলামে ১ পাতায় ২টি কপির লেআউট তৈরি হয়েছে!");
    } else {
      updateSettings({ duplicateSinglePage: false });
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-4 shadow-xs space-y-4">
      {/* Card Header */}
      <div className="flex items-center gap-2.5 pb-1 border-b border-border/60">
        <div className="size-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/50 dark:border-indigo-800/30">
          <Columns className="w-3.5 h-3.5" />
        </div>
        <div>
          <h3 className="font-headline font-bold text-xs sm:text-sm text-foreground">
            কলাম ও প্রিন্ট লেআউট
          </h3>
          <p className="text-[11px] text-muted-foreground font-body">
            কলাম সংখ্যা ও বুকলেট লেআউট
          </p>
        </div>
      </div>

      {/* Columns */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground font-headline">
          কলাম সংখ্যা
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((cols) => {
            const isSelected = settings.columns === cols;
            return (
              <button
                key={cols}
                type="button"
                onClick={() => updateSettings({ columns: cols as 1 | 2 | 3 })}
                className={`py-2 px-2.5 text-xs rounded-xl font-headline transition-all cursor-pointer border flex items-center justify-between ${
                  isSelected
                    ? "bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-500 text-indigo-950 dark:text-indigo-200 font-bold shadow-2xs"
                    : "bg-muted/30 hover:bg-muted/60 text-muted-foreground border-slate-200/60 dark:border-white/[0.06] hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-1">
                  <Columns className="w-3 h-3 opacity-70" />
                  <span>{cols} কলাম</span>
                </div>
                <span className={`size-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                  isSelected
                    ? "border-indigo-600 dark:border-indigo-400"
                    : "border-slate-300 dark:border-zinc-600"
                }`}>
                  {isSelected && (
                    <span className="size-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Column Gap (when columns > 1) */}
      {settings.columns > 1 && (
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-muted-foreground font-headline">
              কলামের ফাঁকা জায়গা (গ্যাপ)
            </Label>
            {isGapLocked ? (
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold font-headline flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/50 dark:border-indigo-800/40">
                <Lock className="w-3 h-3" />
                <span>{settings.bookFoldLayout ? "বুকলেট স্পাইন (৩০ মিমি)" : "কাটার দাগ (২৫ মিমি)"}</span>
              </span>
            ) : (
              <span className="text-[11px] text-foreground font-bold font-headline">
                {currentGap} মিমি
              </span>
            )}
          </div>

          {isGapLocked ? (
            <p className="text-[11px] text-muted-foreground font-body bg-muted/20 px-2.5 py-1.5 rounded-xl border border-dashed border-border/70">
              {settings.bookFoldLayout
                ? "বুকলেট লেআউটে কাগজ ভাঁজ ও স্পাইনের সুরক্ষার জন্য ৩০ মিমি ফাঁকা জায়গা স্বয়ংক্রিয়ভাবে সংরক্ষিত রয়েছে।"
                : "১ পাতায় ২টি কপি লেআউটে মাঝখানে কাটার দাগের জন্য ২৫ মিমি ফাঁকা জায়গা স্বয়ংক্রিয়ভাবে লক করা হয়েছে।"}
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: "কম (৮ মিমি)", val: 8 },
                { label: "স্বাভাবিক (১২)", val: 12 },
                { label: "মাঝারি (১৬)", val: 16 },
                { label: "বেশি (২০)", val: 20 },
              ].map((item) => {
                const isSelected = (settings.columnGap ?? (settings.columns === 2 ? 12 : 10)) === item.val;
                return (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => updateSettings({ columnGap: item.val })}
                    className={`py-1.5 px-1 text-[11px] rounded-xl font-headline transition-all cursor-pointer border text-center ${
                      isSelected
                        ? "bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-500 text-indigo-950 dark:text-indigo-200 font-bold shadow-2xs"
                        : "bg-muted/30 hover:bg-muted/60 text-muted-foreground border-slate-200/60 dark:border-white/[0.06] hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Column Divider */}
      <div 
        onClick={() => {
          if (settings.columns > 1) {
            updateSettings({ showColumnDivider: !settings.showColumnDivider });
          }
        }}
        className={`flex items-center justify-between py-2 px-2.5 rounded-xl border transition-all ${
          settings.columns === 1
            ? "opacity-50 cursor-not-allowed border-transparent bg-muted/10"
            : settings.showColumnDivider
              ? "bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-200/60 dark:border-indigo-800/40 cursor-pointer"
              : "bg-muted/20 hover:bg-muted/50 border-transparent text-muted-foreground hover:text-foreground cursor-pointer"
        }`}
      >
        <div>
          <Label htmlFor="column-divider" className="text-xs sm:text-sm font-semibold font-headline cursor-pointer pointer-events-none">
            কলাম ডিভাইডার
          </Label>
          <p className="text-[11px] text-muted-foreground font-body">
            কলামের মাঝে ডিভাইডার দাগ দেখান
          </p>
        </div>
        <Switch 
          id="column-divider"
          checked={settings.showColumnDivider}
          onCheckedChange={(c) => updateSettings({ showColumnDivider: c })}
          disabled={settings.columns === 1}
          className="pointer-events-none"
        />
      </div>

      {/* Advanced Layout Toggles */}
      <div className="pt-2 border-t border-border/60 space-y-2">
        {/* 1 Sheet 2 Copies (Duplicate Half-Sheet) */}
        <div 
          onClick={handleToggleDuplicate}
          className={`flex items-center justify-between py-2 px-2.5 rounded-xl border transition-all cursor-pointer ${
            isDuplicateActive
              ? "bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-500/60 text-foreground ring-1 ring-indigo-500/20"
              : "bg-muted/20 hover:bg-muted/50 border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <Label htmlFor="duplicate-single-page" className="text-xs sm:text-sm font-semibold font-headline cursor-pointer pointer-events-none">
                ১ পাতায় ২টি কপি (হাফ-শিট)
              </Label>
              {pageCount === 1 && !isDuplicateActive && (
                <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded-md font-bold font-headline">
                  ছোট পরীক্ষা
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground font-body pl-5">
              ১ পৃষ্ঠার প্রশ্ন A4 পাতায় পাশাপাশি ২টি কপি বসবে (মাঝখানে কাটার দাগসহ)
            </p>
          </div>
          <Switch 
            id="duplicate-single-page"
            checked={isDuplicateActive}
            onCheckedChange={handleToggleDuplicate}
            className="pointer-events-none"
          />
        </div>

        <div 
          onClick={() => updateSettings({ bookFoldLayout: !settings.bookFoldLayout })}
          className={`flex items-center justify-between py-2 px-2.5 rounded-xl border transition-all cursor-pointer ${
            settings.bookFoldLayout
              ? "bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-200/60 dark:border-indigo-800/40"
              : "bg-muted/20 hover:bg-muted/50 border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <Label htmlFor="book-fold" className="text-xs sm:text-sm font-semibold font-headline cursor-pointer pointer-events-none">
                বুক ফোল্ড লেআউট
              </Label>
            </div>
            <p className="text-[11px] text-muted-foreground font-body pl-5">
              বইয়ের মতো ভাঁজ করার বুকলেট লেআউট
            </p>
          </div>
          <Switch 
            id="book-fold"
            checked={settings.bookFoldLayout}
            onCheckedChange={(c) => updateSettings({ bookFoldLayout: c })}
            className="pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
};
