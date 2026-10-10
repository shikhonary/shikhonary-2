"use client";

import React from "react";
import { useBuilderStore } from "../../../../store/use-builder-store";
import { Label } from "@workspace/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { FileText, RectangleVertical, RectangleHorizontal } from "lucide-react";

export const PageSetupCard: React.FC = () => {
  const settings = useBuilderStore((state) => state.settings);
  const updateSettings = useBuilderStore((state) => state.updateSettings);

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-4 shadow-xs space-y-4">
      {/* Card Header */}
      <div className="flex items-center gap-2.5 pb-1 border-b border-border/60">
        <div className="size-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/50 dark:border-indigo-800/30">
          <FileText className="w-3.5 h-3.5" />
        </div>
        <div>
          <h3 className="font-headline font-bold text-xs sm:text-sm text-foreground">
            পৃষ্ঠার আকার ও মার্জিন
          </h3>
          <p className="text-[11px] text-muted-foreground font-body">
            কাগজের সাইজ, ওরিয়েন্টেশন ও মার্জিন
          </p>
        </div>
      </div>

      {/* Paper Size */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground font-headline">
          পেইজ সাইজ
        </Label>
        <Select 
          value={settings.paperSize} 
          onValueChange={(v: any) => updateSettings({ paperSize: v })}
        >
          <SelectTrigger className="w-full text-xs sm:text-sm h-9 px-3.5 rounded-xl bg-card border-slate-200 dark:border-white/10 font-body">
            <SelectValue placeholder="সাইজ নির্বাচন করুন" />
          </SelectTrigger>
          <SelectContent className="font-body text-xs sm:text-sm rounded-xl">
            <SelectItem value="A4">A4 (210 × 297 mm)</SelectItem>
            <SelectItem value="Letter">Letter (8.5 × 11 in)</SelectItem>
            <SelectItem value="Legal">Legal (8.5 × 14 in)</SelectItem>
            <SelectItem value="A5">A5 (148 × 210 mm)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orientation */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground font-headline">
          পেইজ ওরিয়েন্টেশন
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => updateSettings({ paperOrientation: "portrait" })}
            className={`flex items-center justify-between py-2 px-3 text-xs rounded-xl font-headline transition-all cursor-pointer border ${
              settings.paperOrientation === "portrait"
                ? "bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-500 text-indigo-950 dark:text-indigo-200 font-bold shadow-2xs"
                : "bg-muted/30 hover:bg-muted/60 text-muted-foreground border-slate-200/60 dark:border-white/[0.06] hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <RectangleVertical className="w-3.5 h-3.5" />
              <span>পোর্ট্রেট</span>
            </div>
            <span className={`size-3.5 rounded-full border flex items-center justify-center shrink-0 ${
              settings.paperOrientation === "portrait"
                ? "border-indigo-600 dark:border-indigo-400"
                : "border-slate-300 dark:border-zinc-600"
            }`}>
              {settings.paperOrientation === "portrait" && (
                <span className="size-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              )}
            </span>
          </button>
          <button
            type="button"
            onClick={() => updateSettings({ paperOrientation: "landscape" })}
            className={`flex items-center justify-between py-2 px-3 text-xs rounded-xl font-headline transition-all cursor-pointer border ${
              settings.paperOrientation === "landscape"
                ? "bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-500 text-indigo-950 dark:text-indigo-200 font-bold shadow-2xs"
                : "bg-muted/30 hover:bg-muted/60 text-muted-foreground border-slate-200/60 dark:border-white/[0.06] hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <RectangleHorizontal className="w-3.5 h-3.5" />
              <span>ল্যান্ডস্কেপ</span>
            </div>
            <span className={`size-3.5 rounded-full border flex items-center justify-center shrink-0 ${
              settings.paperOrientation === "landscape"
                ? "border-indigo-600 dark:border-indigo-400"
                : "border-slate-300 dark:border-zinc-600"
            }`}>
              {settings.paperOrientation === "landscape" && (
                <span className="size-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Margins */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-muted-foreground font-headline">
            মার্জিন (মি.মি.)
          </Label>
          <div className="flex gap-1">
            {[
              { label: "স্বাভাবিক (২০)", val: 20 },
              { label: "সংকীর্ণ (১০)", val: 10 },
              { label: "চওড়া (৩০)", val: 30 },
            ].map((preset) => {
              const isMatch = 
                settings.margins.top === preset.val && 
                settings.margins.bottom === preset.val && 
                settings.margins.left === preset.val && 
                settings.margins.right === preset.val;

              return (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => updateSettings({ margins: { top: preset.val, bottom: preset.val, left: preset.val, right: preset.val } })}
                  className={`flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-lg border font-headline transition-colors cursor-pointer ${
                    isMatch
                      ? "bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 text-indigo-900 dark:text-indigo-200 font-bold"
                      : "border-slate-200 dark:border-white/10 bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className={`size-2 rounded-full border flex items-center justify-center shrink-0 ${
                    isMatch ? "border-indigo-600 dark:border-indigo-400" : "border-slate-300 dark:border-zinc-600"
                  }`}>
                    {isMatch && <span className="size-1 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
                  </span>
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {(["top", "bottom", "left", "right"] as const).map((side) => (
            <div 
              key={side} 
              className="flex items-center justify-between bg-muted/30 dark:bg-zinc-900/40 px-2.5 py-1.5 rounded-xl border border-slate-200/60 dark:border-white/[0.06]"
            >
              <Label className="text-xs text-muted-foreground font-headline w-12">
                {side === "top" ? "উপরে" : side === "bottom" ? "নিচে" : side === "left" ? "বামে" : "ডানে"}
              </Label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={settings.margins[side]}
                  onChange={(e) => 
                    updateSettings({ 
                      margins: { ...settings.margins, [side]: parseInt(e.target.value) || 0 } 
                    })
                  }
                  className="w-12 h-7 text-xs text-center border border-slate-200 dark:border-white/10 rounded-lg bg-card text-foreground font-solaiman focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  min={0}
                  max={100}
                />
                <span className="text-[10px] text-muted-foreground">mm</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
