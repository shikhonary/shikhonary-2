"use client";

import React from "react";
import { useBuilderStore } from "../../../store/use-builder-store";
import { ZoomIn, ZoomOut, Maximize2, Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@workspace/ui/components/dropdown-menu";
import { cn } from "@workspace/ui/lib/utils";

const toBengaliDigits = (num: number | string): string => {
  const bn = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num).replace(/[0-9]/g, (d) => bn[parseInt(d, 10)] || d);
};

const ZOOM_PRESETS = [
  { label: "ফিট টু স্ক্রিন (Auto)", value: "auto" as const },
  { label: "৫০%", value: 0.5 },
  { label: "৭৫%", value: 0.75 },
  { label: "১০০% (আসল সাইজ)", value: 1.0 },
  { label: "১২৫%", value: 1.25 },
  { label: "১৫০%", value: 1.5 },
  { label: "২০০%", value: 2.0 },
];

export const CanvasZoomControls: React.FC<{ className?: string }> = ({ className }) => {
  const zoom = useBuilderStore((state) => state.zoom);
  const effectiveZoom = useBuilderStore((state) => state.effectiveZoom);
  const setZoom = useBuilderStore((state) => state.setZoom);

  // Zoom in / Zoom out step logic
  const handleZoomIn = () => {
    const current = typeof zoom === "number" ? zoom : (effectiveZoom || 1.0);
    const next = Math.min(2.5, +(current + 0.15).toFixed(2));
    setZoom(next);
  };

  const handleZoomOut = () => {
    const current = typeof zoom === "number" ? zoom : (effectiveZoom || 1.0);
    const next = Math.max(0.3, +(current - 0.15).toFixed(2));
    setZoom(next);
  };

  const getDisplayLabel = () => {
    const pct = Math.round((typeof zoom === "number" ? zoom : (effectiveZoom || 1)) * 100);
    if (zoom === "auto") {
      return `${toBengaliDigits(pct)}% (ফিট)`;
    }
    return `${toBengaliDigits(pct)}%`;
  };

  return (
    <div
      className={cn(
        "flex items-center gap-0.5 h-8.5 sm:h-9 px-1 rounded-xl border border-slate-200 dark:border-white/10 bg-card text-foreground select-none font-display shrink-0 shadow-2xs transition-all",
        className
      )}
    >
      {/* Zoom Out Button */}
      <button
        type="button"
        onClick={handleZoomOut}
        disabled={typeof zoom === "number" && zoom <= 0.3}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
        title="জুম কমান (Ctrl + -)"
      >
        <ZoomOut className="w-3.5 h-3.5" />
      </button>

      {/* Preset Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="h-7 px-1.5 sm:px-2 rounded-lg text-xs font-bold font-headline text-foreground hover:bg-muted/80 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
            title="জুম লেভেল পরিবর্তন করুন"
          >
            <span className="text-[11px] sm:text-xs">{getDisplayLabel()}</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" side="bottom" sideOffset={6} className="w-52 font-display z-50 p-1.5">
          <DropdownMenuLabel className="text-[11px] font-bold text-muted-foreground">
            ক্যানভাস জুম লেভেল
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {ZOOM_PRESETS.map((preset) => {
            const isSelected = zoom === preset.value;
            return (
              <DropdownMenuItem
                key={String(preset.value)}
                onClick={() => setZoom(preset.value)}
                className="text-xs font-medium flex items-center justify-between cursor-pointer py-1.5 rounded-lg"
              >
                <span>{preset.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5 text-[10px] text-muted-foreground bg-muted/60 rounded-lg flex items-center gap-1.5 font-body">
            <span className="shrink-0">💡 টিপস:</span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-background border border-border font-mono font-bold text-[9px] text-foreground">Ctrl</kbd> + <span className="font-semibold text-foreground">Scroll</span> করে জুম করুন
            </span>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Zoom In Button */}
      <button
        type="button"
        onClick={handleZoomIn}
        disabled={typeof zoom === "number" && zoom >= 2.5}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
        title="জুম বাড়ান (Ctrl + +)"
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-3.5 bg-border mx-0.5" />

      {/* Fit to Screen Quick Action */}
      <button
        type="button"
        onClick={() => setZoom(zoom === "auto" ? 1.0 : "auto")}
        className={cn(
          "w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95",
          zoom === "auto"
            ? "bg-indigo-600 text-white shadow-2xs"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
        )}
        title={zoom === "auto" ? "১০০% ভিউতে যান" : "স্ক্রিনে ফিট করুন (Ctrl + 0)"}
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
