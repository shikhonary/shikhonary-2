"use client";

import React from "react";
import { SlidersHorizontal, Sparkles, X } from "lucide-react";
import { SettingsPanel } from "./settings-panel";
import { cn } from "@workspace/ui/lib/utils";

interface BuilderSidebarProps {
  className?: string;
  onClose?: () => void;
}

export const BuilderSidebar: React.FC<BuilderSidebarProps> = ({ className, onClose }) => {
  return (
    <aside
      className={cn(
        "w-[360px] 2xl:w-[390px] border-r border-border bg-card flex flex-col shadow-xs z-10 h-full relative shrink-0",
        className
      )}
    >
      {/* Sidebar Top Header */}
      <div className="h-16 px-4 border-b border-border flex items-center justify-between shrink-0 bg-card">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-2xs">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-headline font-bold text-sm text-foreground tracking-tight">
              লেআউট ও সেটিংস
            </h2>
            <p className="text-[11px] text-muted-foreground font-body">
              রিয়েল-টাইম প্রশ্নপত্র কাস্টমাইজেশন
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Settings Scrollable Panel */}
      <div className="flex-1 overflow-hidden relative">
        <SettingsPanel />
      </div>
    </aside>
  );
};

