"use client";

import React from "react";
import { useBuilderStore } from "../../../../store/use-builder-store";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import { Columns, BookOpen, Layers } from "lucide-react";

export const PrintLayoutCard: React.FC = () => {
  const settings = useBuilderStore((state) => state.settings);
  const updateSettings = useBuilderStore((state) => state.updateSettings);

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
            কলাম বিভাজন ও বিশেষ বুকলেট বিন্যাস
          </p>
        </div>
      </div>

      {/* Columns */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground font-headline">
          কলাম বিন্যাস
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
            কলামগুলোর মাঝে বিভাজন রেখা প্রদর্শন
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
        <div 
          onClick={() => updateSettings({ twoPagesPerSheet: !settings.twoPagesPerSheet })}
          className={`flex items-center justify-between py-2 px-2.5 rounded-xl border transition-all cursor-pointer ${
            settings.twoPagesPerSheet
              ? "bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-200/60 dark:border-indigo-800/40"
              : "bg-muted/20 hover:bg-muted/50 border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <Label htmlFor="two-pages-per-sheet" className="text-xs sm:text-sm font-semibold font-headline cursor-pointer pointer-events-none">
                ২ পৃষ্ঠা প্রতি শিট
              </Label>
            </div>
            <p className="text-[11px] text-muted-foreground font-body pl-5">
              প্রতি শিটে পাশাপাশি ২টি পৃষ্ঠা (১+২, ৩+৪) বিন্যাস
            </p>
          </div>
          <Switch 
            id="two-pages-per-sheet"
            checked={settings.twoPagesPerSheet}
            onCheckedChange={(c) => updateSettings({ twoPagesPerSheet: c })}
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
              বুকলেট প্রিন্ট করার সুবিধাজনক ভাঁজ বিন্যাস
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
