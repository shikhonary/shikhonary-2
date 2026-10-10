"use client";

import React from "react";
import { useBuilderStore } from "../../../../store/use-builder-store";
import { Label } from "@workspace/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Type } from "lucide-react";

const FONT_FAMILIES = [
  { value: "SolaimanLipi", label: "সোলাইমানলিপি" },
  { value: "Kalpurush", label: "কালপুরুষ" },
  { value: "Nikosh", label: "নিকষ" },
  { value: "AdorshoLipi", label: "আদর্শলিপি" },
];

const toBengaliDigits = (num: number | string): string => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .split("")
    .map((char) => (/\d/.test(char) ? bengaliDigits[parseInt(char)] : char))
    .join("");
};

export const TypographyCard: React.FC = () => {
  const settings = useBuilderStore((state) => state.settings);
  const updateSettings = useBuilderStore((state) => state.updateSettings);

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-4 shadow-xs space-y-4">
      {/* Card Header */}
      <div className="flex items-center gap-2.5 pb-1 border-b border-border/60">
        <div className="size-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/50 dark:border-indigo-800/30">
          <Type className="w-3.5 h-3.5" />
        </div>
        <div>
          <h3 className="font-headline font-bold text-xs sm:text-sm text-foreground">
            ফন্ট ও স্টাইল
          </h3>
          <p className="text-[11px] text-muted-foreground font-body">
            প্রশ্নপত্রের বাংলা ফন্ট ও সাইজ
          </p>
        </div>
      </div>

      {/* Font Family */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground font-headline">
          ফন্টের ধরন
        </Label>
        <Select 
          value={settings.fontFamily} 
          onValueChange={(v) => updateSettings({ fontFamily: v })}
        >
          <SelectTrigger className="w-full text-xs sm:text-sm h-9 px-3.5 rounded-xl bg-card border-slate-200 dark:border-white/10 font-body">
            <SelectValue placeholder="ফন্ট নির্বাচন করুন" />
          </SelectTrigger>
          <SelectContent className="font-body text-xs sm:text-sm rounded-xl">
            {FONT_FAMILIES.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                <span style={{ fontFamily: font.value }} className="font-medium text-sm">
                  {font.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font Size */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-muted-foreground font-headline">
            ফন্টের আকার
          </Label>
          <div className="flex items-center gap-1.5">
            <span className="font-solaiman font-bold text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-200/50 dark:border-indigo-800/40">
              {toBengaliDigits(settings.fontSize)} px
            </span>
          </div>
        </div>

        {/* Quick Size Presets */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "ছোট (১২)", size: 12 },
            { label: "আদর্শ (১৪)", size: 14 },
            { label: "বড় (১৬)", size: 16 },
          ].map((preset) => {
            const isSelected = settings.fontSize === preset.size;
            return (
              <button
                key={preset.size}
                type="button"
                onClick={() => updateSettings({ fontSize: preset.size })}
                className={`py-1.5 px-2 text-[11px] rounded-xl font-headline transition-colors cursor-pointer border flex items-center justify-between ${
                  isSelected
                    ? "bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-500 text-indigo-950 dark:text-indigo-200 font-bold shadow-2xs"
                    : "bg-muted/30 hover:bg-muted/60 text-muted-foreground border-slate-200/60 dark:border-white/[0.06] hover:text-foreground"
                }`}
              >
                <span>{preset.label}</span>
                <span className={`size-3 rounded-full border flex items-center justify-center shrink-0 ${
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

        <input 
          type="range" 
          min={10} 
          max={24} 
          step={1}
          value={settings.fontSize}
          onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
          className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-muted rounded-lg appearance-none"
        />
      </div>
    </div>
  );
};
