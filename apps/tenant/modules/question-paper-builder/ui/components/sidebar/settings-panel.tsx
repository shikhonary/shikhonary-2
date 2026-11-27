"use client";

import React, { useState } from "react";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Button } from "@workspace/ui/components/button";
import { BookmarkPlus } from "lucide-react";
import { useSaveAsTemplateModalStore } from "@/modules/question-paper/store/use-save-as-template-modal-store";
import { useBuilderStore } from "../../../store/use-builder-store";
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
  const openSaveAsTemplateModal = useSaveAsTemplateModalStore((state) => state.openModal);
  const paperId = useBuilderStore((state) => state.paperId);
  const settings = useBuilderStore((state) => state.settings);

  const handleSaveAsTemplate = () => {
    if (!paperId) return;
    const title = settings.examName || "প্রশ্নপত্র";
    openSaveAsTemplateModal({
      paperId,
      initialTitle: `${title} - ব্লুপ্রিন্ট টেমপ্লেট`,
      defaultGeneric: false,
    });
  };

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

          {(activeTab === "all" || activeTab === "layout" || activeTab === "questions") && (
            <TypographyCard />
          )}

          {(activeTab === "all" || activeTab === "questions") && (
            <>
              <QuestionSettingsCard />
              <OMRSettingsCard />
            </>
          )}

          {/* Blueprint Template Save Section */}
          <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-800/40 bg-gradient-to-br from-indigo-50/60 via-card to-card dark:from-indigo-950/20 dark:via-card dark:to-card p-4 shadow-xs space-y-3">
            <div className="flex items-start gap-3">
              <div className="size-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <BookmarkPlus className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-headline font-bold text-xs sm:text-sm text-foreground">
                  ব্লুপ্রিন্ট টেমপ্লেট হিসেবে সেভ করুন
                </h4>
                <p className="text-[11px] text-muted-foreground font-body leading-relaxed mt-0.5">
                  লেআউট, মার্জিন, কলাম ও মানবন্টন পরবর্তী ব্যবহারের জন্য সংরক্ষণ করুন (প্রশ্ন ছাড়া)।
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleSaveAsTemplate}
              disabled={!paperId}
              variant="outline"
              className="w-full h-9 rounded-xl border-indigo-200 dark:border-indigo-800/60 bg-white dark:bg-card hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-headline font-bold text-xs cursor-pointer gap-2 transition-all active:scale-98 shadow-2xs"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>টেমপ্লেট হিসেবে সংরক্ষণ</span>
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
