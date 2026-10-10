"use client";

import React, { useState } from "react";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { PageSetupCard } from "./settings/page-setup-card";
import { PrintLayoutCard } from "./settings/print-layout-card";
import { TypographyCard } from "./settings/typography-card";
import { QuestionSettingsCard } from "./settings/question-settings-card";
import { HeaderTogglesCard } from "./settings/header-toggles-card";
import { BrandingCard } from "./settings/branding-card";
import { OMRSettingsCard } from "./settings/omr-settings-card";

type TabKey = "all" | "header" | "layout" | "questions";

export const SettingsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-zinc-950/30">
      {/* Category Navigation Pills */}
      <div className="p-3 border-b border-border/60 bg-card shrink-0">
        <div className="grid grid-cols-4 gap-1 p-1 bg-muted/40 dark:bg-zinc-900/60 rounded-xl border border-slate-200/60 dark:border-white/[0.06]">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`py-1.5 px-1 text-[11px] rounded-lg font-headline transition-all cursor-pointer text-center truncate ${
              activeTab === "all"
                ? "bg-indigo-600 text-white font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            সবগুলো
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("header")}
            className={`py-1.5 px-1 text-[11px] rounded-lg font-headline transition-all cursor-pointer text-center truncate ${
              activeTab === "header"
                ? "bg-indigo-600 text-white font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            হেডার
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("layout")}
            className={`py-1.5 px-1 text-[11px] rounded-lg font-headline transition-all cursor-pointer text-center truncate ${
              activeTab === "layout"
                ? "bg-indigo-600 text-white font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            লেআউট
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("questions")}
            className={`py-1.5 px-1 text-[11px] rounded-lg font-headline transition-all cursor-pointer text-center truncate ${
              activeTab === "questions"
                ? "bg-indigo-600 text-white font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            প্রশ্ন/OMR
          </button>
        </div>
      </div>

      {/* Scrollable Settings Cards */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {(activeTab === "all" || activeTab === "header") && (
            <>
              <HeaderTogglesCard />
              <BrandingCard />
            </>
          )}

          {(activeTab === "all" || activeTab === "layout") && (
            <>
              <PageSetupCard />
              <PrintLayoutCard />
            </>
          )}

          {(activeTab === "all" || activeTab === "questions") && (
            <>
              <TypographyCard />
              <QuestionSettingsCard />
              <OMRSettingsCard />
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
