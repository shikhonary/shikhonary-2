"use client";

import React, { useState, useEffect } from "react";
import { useBuilderStore } from "../../../../store/use-builder-store";
import { Label } from "@workspace/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Type, Minus, Plus } from "lucide-react";

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

const FONT_SIZE_OFFSET = 2;

export const TypographyCard: React.FC = () => {
  const settings = useBuilderStore((state) => state.settings);
  const updateSettings = useBuilderStore((state) => state.updateSettings);
  const displayFontSize = Math.max(6, Math.round(((settings.fontSize || 15) - FONT_SIZE_OFFSET) * 100) / 100);

  const [inputValue, setInputValue] = useState<string>(String(displayFontSize));

  useEffect(() => {
    const currentParsed = parseFloat(inputValue);
    if (isNaN(currentParsed) || Math.abs(currentParsed - displayFontSize) > 0.001) {
      setInputValue(String(displayFontSize));
    }
  }, [displayFontSize]);

  const handleSizeChange = (newSize: number) => {
    const clamped = Math.max(6, Math.min(36, Math.round(newSize * 100) / 100));
    setInputValue(String(clamped));
    updateSettings({ fontSize: Math.round((clamped + FONT_SIZE_OFFSET) * 100) / 100 });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (!val || val.endsWith(".")) return;
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 6 && parsed <= 36) {
      updateSettings({ fontSize: Math.round((parsed + FONT_SIZE_OFFSET) * 100) / 100 });
    }
  };

  const handleInputBlur = () => {
    const parsed = parseFloat(inputValue);
    if (isNaN(parsed) || parsed < 6) {
      handleSizeChange(6);
    } else if (parsed > 36) {
      handleSizeChange(36);
    } else {
      handleSizeChange(parsed);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-card p-4 shadow-xs space-y-4">
      {/* Card Header */}
      <div className="flex items-center gap-2.5 pb-1 border-b border-border/60">
        <div className="size-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200/50">
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
          <SelectTrigger className="w-full text-xs sm:text-sm h-9 px-3.5 rounded-xl bg-card border-slate-200 font-body">
            <SelectValue placeholder="ফন্ট সিলেক্ট করুন" />
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
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-xs font-semibold text-muted-foreground font-headline">
            ফন্ট সাইজ (Font Size)
          </Label>

          {/* Stepper & Direct Number Input Control */}
          <div className="flex items-center gap-1 bg-muted/40 rounded-xl border border-slate-200/80 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => handleSizeChange(Math.round((displayFontSize - 0.5) * 10) / 10)}
              disabled={displayFontSize <= 6}
              className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="ফন্ট সাইজ কমান (-0.5 pt)"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center px-1.5 h-7 bg-card rounded-lg border border-slate-200/70 shadow-2xs">
              <input
                type="number"
                min={6}
                max={36}
                step="any"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                className="w-11 text-center font-bold text-xs bg-transparent border-0 outline-none p-0 focus:ring-0 font-solaiman [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                aria-label="Font size in points"
              />
              <span className="text-[10px] text-muted-foreground font-semibold select-none pl-0.5">pt</span>
            </div>

            <button
              type="button"
              onClick={() => handleSizeChange(Math.round((displayFontSize + 0.5) * 10) / 10)}
              disabled={displayFontSize >= 36}
              className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="ফন্ট সাইজ বাড়ান (+0.5 pt)"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Size Presets */}
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: "ছোট (১২)", size: 12 },
            { label: "স্ট্যান্ডার্ড (১৩)", size: 13 },
            { label: "মাঝারি (১৪)", size: 14 },
            { label: "বড় (১৬)", size: 16 },
          ].map((preset) => {
            const targetSize = preset.size + FONT_SIZE_OFFSET;
            const isSelected = settings.fontSize === targetSize;
            return (
              <button
                key={preset.size}
                type="button"
                onClick={() => handleSizeChange(preset.size)}
                className={`py-1.5 px-1.5 text-[11px] rounded-xl font-headline transition-colors cursor-pointer border flex items-center justify-center text-center ${
                  isSelected
                    ? "bg-indigo-50/80 border-indigo-500 text-indigo-950 font-bold shadow-2xs"
                    : "bg-muted/30 hover:bg-muted/60 text-muted-foreground border-slate-200/60 hover:text-foreground"
                }`}
              >
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>

        {/* Range Slider */}
        <div className="pt-1">
          <input 
            type="range" 
            min={8} 
            max={28} 
            step={0.5}
            value={Math.max(8, Math.min(28, displayFontSize))}
            onChange={(e) => handleSizeChange(parseFloat(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-muted rounded-lg appearance-none"
          />
          <div className="flex justify-between items-center text-[10px] text-muted-foreground font-solaiman mt-1 px-0.5">
            <span>৮ pt</span>
            <span>১৮ pt</span>
            <span>২৮ pt</span>
          </div>
        </div>
      </div>
    </div>
  );
};
