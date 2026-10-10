"use client";

import React from "react";
import { useBuilderStore } from "../../../../store/use-builder-store";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import { CheckSquare2, Columns, UserCheck } from "lucide-react";

export const OMRSettingsCard: React.FC = () => {
  const settings = useBuilderStore((state) => state.settings);
  const toggleOMRSheet = useBuilderStore((state) => state.toggleOMRSheet);
  const setOMRSetting = useBuilderStore((state) => state.setOMRSetting);

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-4 shadow-xs space-y-4">
      {/* Card Header */}
      <div className="flex items-center gap-2.5 pb-1 border-b border-border/60">
        <div className="size-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/50 dark:border-indigo-800/30">
          <CheckSquare2 className="w-3.5 h-3.5" />
        </div>
        <div>
          <h3 className="font-headline font-bold text-xs sm:text-sm text-foreground">
            OMR শিট সেটিং
          </h3>
          <p className="text-[11px] text-muted-foreground font-body">
            স্বয়ংক্রিয় OMR উত্তরপত্র সংযোজন
          </p>
        </div>
      </div>

      {/* Main OMR Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="omr-toggle" className="text-xs sm:text-sm font-semibold text-foreground font-headline block cursor-pointer">
            OMR শিট যুক্ত করুন
          </Label>
          <span className="text-[11px] text-muted-foreground font-body">
            প্রশ্নপত্রের শেষে পৃথক OMR উত্তরপত্র পাতা তৈরি হবে
          </span>
        </div>
        <Switch 
          id="omr-toggle"
          checked={settings.showOMRSheet}
          onCheckedChange={(c) => toggleOMRSheet(c)}
          className="data-[state=checked]:bg-indigo-600 cursor-pointer"
        />
      </div>

      {settings.showOMRSheet && (
        <div className="pt-3 border-t border-border/60 space-y-3.5 animate-in fade-in-50 duration-200">
          {/* OMR Columns */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground font-headline">
              OMR কলাম সংখ্যা
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {[2, 3, 4].map((cols) => {
                const isSelected = settings.omrSettings?.columns === cols;
                return (
                  <button
                    key={cols}
                    type="button"
                    onClick={() => setOMRSetting('columns', cols)}
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

          {/* Roll & Reg Grid */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <Label htmlFor="roll-toggle" className="text-xs sm:text-sm font-semibold text-foreground font-headline cursor-pointer">
                  রোল ও রেজিঃ নম্বর গ্রিড
                </Label>
              </div>
              <span className="text-[11px] text-muted-foreground font-body pl-5">
                শিক্ষার্থীদের রোল ও রেজিঃ ভরাট করার বাবল গ্রিড
              </span>
            </div>
            <Switch 
              id="roll-toggle"
              checked={Boolean(settings.omrSettings?.includeRollNumber)}
              onCheckedChange={(c) => setOMRSetting('includeRollNumber', c)}
              className="data-[state=checked]:bg-indigo-600 cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
