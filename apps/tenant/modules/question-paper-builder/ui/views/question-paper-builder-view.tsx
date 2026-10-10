"use client";

import React, { useEffect, useState, useRef } from "react";
import { useBuilderStore } from "../../store/use-builder-store";
import { BuilderSidebar } from "../components/sidebar/builder-sidebar";
import { BuilderAiPanel } from "../components/sidebar/builder-ai-panel";
import { BuilderCanvas } from "../components/canvas/builder-canvas";
import { FloatingFormatToolbar } from "../components/toolbar/floating-format-toolbar";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft, Loader2, Save, Copy, Download, SlidersHorizontal, Sparkles } from "lucide-react";
import Link from "next/link";
import { toast } from "@workspace/ui/components/sonner";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
} from "@workspace/ui/components/sheet";
import {
  useQuestionPaperById,
  useUpdateQuestionPaper,
  useUpdateQuestionPaperSettings,
  useQuestionPaperDistributionStatuses,
} from "@/modules/question-paper/services/use-question-paper";
import { GenerateSetsModal } from "../components/modals/generate-sets-modal";
import { IncompletePaperModal } from "../components/modals/incomplete-paper-modal";
import { PublishBeforeDownloadModal } from "../components/modals/publish-before-download-modal";
import { useTenant } from "@/modules/layout/ui/components/tenant-provider";
import { useDownloadPaper } from "../../hooks/use-download-paper";
import { ExportOverlay } from "../components/canvas/export-overlay";
import { CanvasZoomControls } from "../components/toolbar/canvas-zoom-controls";

interface Props {
  paperId: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// Invisible component to handle auto-saving without triggering re-renders on the main view
function AutoSaveManager({ paperId }: { paperId: string }) {
  const settings = useBuilderStore((state) => state.settings);
  const hasUnsavedChanges = useBuilderStore((state) => state.hasUnsavedChanges);
  const setSaveStatus = useBuilderStore((state) => state.setSaveStatus);
  const markSaved = useBuilderStore((state) => state.markSaved);

  const { mutateAsync: updateSettings } = useUpdateQuestionPaperSettings();
  const debouncedSettings = useDebounce(settings, 1200);
  const initialMount = useRef(true);

  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }

    if (hasUnsavedChanges) {
      setSaveStatus("saving");
      updateSettings({ id: paperId, settings: debouncedSettings })
        .then(() => {
          markSaved();
        })
        .catch((err: any) => {
          setSaveStatus("error");
          toast.error(err?.message || "স্বয়ংক্রিয় সংরক্ষণ ব্যর্থ হয়েছে");
        });
    }
  }, [debouncedSettings, paperId, hasUnsavedChanges, updateSettings, setSaveStatus, markSaved]);

  return null;
}

export const QuestionPaperBuilderView: React.FC<Props> = ({ paperId }) => {
  const { tenant } = useTenant();
  const { hydratePaper, saveStatus, markSaved, settings, rehydrateCounter } = useBuilderStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isSettingsSheetOpen, setIsSettingsSheetOpen] = useState(false);
  const [isAiSheetOpen, setIsAiSheetOpen] = useState(false);
  const lastRehydratedCounter = useRef(-1);

  const { data: paperQuery, isLoading, error } = useQuestionPaperById(paperId);
  const { data: distributionStatuses } = useQuestionPaperDistributionStatuses(paperId);
  const { mutateAsync: updateSettingsMutation, isPending: isManualSaving } = useUpdateQuestionPaperSettings();
  const { mutateAsync: updatePaperMutation, isPending: isPublishing } = useUpdateQuestionPaper();
  const { downloadAsPdf, isDownloading } = useDownloadPaper({ paperTitle: paperQuery?.title });

  const incompleteDistributions = React.useMemo(() => {
    if (!distributionStatuses || distributionStatuses.length === 0) return [];
    return distributionStatuses.filter(
      (dist) => (dist.addedCount || 0) < (dist.targetCount || 0)
    );
  }, [distributionStatuses]);

  const handleDownloadClick = () => {
    if (incompleteDistributions.length > 0) {
      setShowIncompleteModal(true);
      return;
    }

    if (paperQuery?.status !== "Published") {
      setShowPublishModal(true);
      return;
    }

    downloadAsPdf();
  };

  const handleConfirmPublishAndDownload = async () => {
    try {
      await updatePaperMutation({
        id: paperId,
        status: "Published",
      });
      setShowPublishModal(false);
      toast.success("প্রশ্নপত্র সফলভাবে প্রকাশিত হয়েছে");
      downloadAsPdf();
    } catch (err: any) {
      toast.error(err?.message || "প্রশ্নপত্রের স্ট্যাটাস পরিবর্তন করতে ব্যর্থ হয়েছে");
    }
  };

  useEffect(() => {
    if (paperQuery && (!isHydrated || lastRehydratedCounter.current !== rehydrateCounter)) {
      lastRehydratedCounter.current = rehydrateCounter;
      hydratePaper(
        paperId,
        (paperQuery.settings || {}) as any,
        paperQuery,
        tenant.nameBn || tenant.name
      );
      setIsHydrated(true);
    }
  }, [paperQuery, isHydrated, rehydrateCounter, hydratePaper, paperId, tenant]);

  // Global Keyboard Shortcuts for Zooming (Ctrl/Cmd + Plus, Minus, 0)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault();
          const { zoom, setZoom } = useBuilderStore.getState();
          const current = typeof zoom === "number" ? zoom : 1.0;
          setZoom(Math.min(2.5, +(current + 0.15).toFixed(2)));
        } else if (e.key === "-") {
          e.preventDefault();
          const { zoom, setZoom } = useBuilderStore.getState();
          const current = typeof zoom === "number" ? zoom : 1.0;
          setZoom(Math.max(0.3, +(current - 0.15).toFixed(2)));
        } else if (e.key === "0") {
          e.preventDefault();
          const { setZoom } = useBuilderStore.getState();
          setZoom("auto");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleManualSave = async () => {
    useBuilderStore.setState({ saveStatus: "saving" });
    try {
      await updateSettingsMutation({ id: paperId, settings });
      markSaved();
      toast.success("সকল পরিবর্তন সংরক্ষণ করা হয়েছে");
    } catch (err: any) {
      useBuilderStore.setState({ saveStatus: "error" });
      toast.error(err?.message || "সংরক্ষণ করতে ব্যর্থ হয়েছে");
    }
  };

  if (isLoading || !isHydrated) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-background items-center justify-center font-display">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">প্রশ্নপত্র লোড হচ্ছে...</p>
      </div>
    );
  }

  if (error || !paperQuery) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-background items-center justify-center font-display">
        <p className="text-red-500 font-medium">প্রশ্নপত্রের তথ্য লোড করা যায়নি।</p>
        <Button asChild className="mt-4">
          <Link href="/question-papers">তালিকায় ফিরে যান</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full min-h-0 max-h-full print:h-auto overflow-hidden print:overflow-visible bg-background font-display select-none">
      <AutoSaveManager paperId={paperId} />
      
      {/* Top Header */}
      <header className="h-16 flex items-center justify-between px-2.5 sm:px-6 border-b border-border bg-card shrink-0 print:hidden z-40 shadow-xs gap-2">
        {/* Left Side: Back button & Title & Save Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8.5 sm:h-9 px-2 sm:px-3 rounded-xl border-border bg-card hover:bg-muted text-xs font-bold font-headline text-foreground cursor-pointer gap-1.5 shrink-0 shadow-2xs transition-all active:scale-95"
          >
            <Link href="/question-papers" title="প্রশ্নপত্র তালিকায় ফিরে যান">
              <ArrowLeft className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="hidden sm:inline">তালিকায় ফিরুন</span>
              <span className="inline sm:hidden text-[11px]">ফিরে যান</span>
            </Link>
          </Button>

          <div className="flex flex-col justify-center min-w-0">
            <h1
              className="font-headline font-bold text-xs xs:text-sm sm:text-base text-foreground truncate max-w-[110px] xs:max-w-[150px] sm:max-w-[220px] md:max-w-[300px] lg:max-w-md leading-tight"
              title={paperQuery.title}
            >
              {paperQuery.title}
            </h1>

            {/* Save Status & Paper Meta Sub-line */}
            <div className="flex items-center gap-1.5 mt-0.5">
              {saveStatus === "saving" && (
                <span className="text-[10px] sm:text-[11px] text-muted-foreground flex items-center gap-1 font-body">
                  <Loader2 className="w-2.5 h-2.5 animate-spin text-indigo-600 dark:text-indigo-400" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </span>
              )}
              {saveStatus === "saved" && (
                <span className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-body flex items-center gap-1 font-semibold">
                  <span>✓</span>
                  <span>সংরক্ষিত</span>
                </span>
              )}
              {saveStatus === "error" && (
                <span className="text-[10px] sm:text-[11px] text-rose-600 dark:text-rose-400 font-body font-semibold">
                  সংরক্ষণ ব্যর্থ
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Zoom Controls */}
          <CanvasZoomControls className="hidden sm:flex" />

          {/* Generate Sets Modal Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGenerateModal(true)}
            className="h-8.5 sm:h-9 px-2.5 sm:px-3 rounded-xl border-slate-200 dark:border-white/10 text-xs font-bold text-foreground hover:bg-muted/80 cursor-pointer gap-1.5 font-headline shrink-0"
            title="সেট তৈরি করুন"
          >
            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">সেট তৈরি</span>
          </Button>

          {/* Download PDF Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadClick}
            disabled={isDownloading}
            className="h-8.5 sm:h-9 px-2.5 sm:px-3 rounded-xl border-slate-200 dark:border-white/10 text-xs font-bold text-foreground hover:bg-muted/80 cursor-pointer gap-1.5 font-headline shrink-0"
            title="ডাউনলোড PDF"
          >
            {isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
            ) : (
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
            )}
            <span className="hidden sm:inline">ডাউনলোড PDF</span>
          </Button>

          {/* Save Button */}
          <Button
            size="sm"
            onClick={handleManualSave}
            disabled={saveStatus === "saving" || isManualSaving}
            className="h-8.5 sm:h-9 px-3 sm:px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold font-headline cursor-pointer gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-50 shrink-0"
            title="সংরক্ষণ করুন"
          >
            {saveStatus === "saving" || isManualSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>সংরক্ষণ</span>
          </Button>
        </div>
      </header>

      {/* Dedicated Mobile & Tablet Utility Toolbar Below Header (< xl) */}
      <div className="xl:hidden h-12 bg-card/95 backdrop-blur-md border-b border-border px-3 sm:px-6 flex items-center justify-between gap-2.5 shrink-0 z-30 shadow-2xs">
        {/* Settings Sheet Trigger */}
        <Sheet open={isSettingsSheetOpen} onOpenChange={setIsSettingsSheetOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="flex-1 h-8.5 px-3 rounded-xl bg-muted/60 hover:bg-muted border border-border/80 text-foreground font-headline font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>লেআউট ও সেটিংস</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" showCloseButton={false} className="w-[330px] sm:w-[380px] p-0 flex flex-col h-full bg-card border-r border-border">
            <BuilderSidebar className="w-full h-full flex border-none" onClose={() => setIsSettingsSheetOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* AI Assistant Sheet Trigger */}
        <Sheet open={isAiSheetOpen} onOpenChange={setIsAiSheetOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="flex-1 h-8.5 px-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/60 border border-indigo-500/25 text-indigo-600 dark:text-indigo-400 font-headline font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>এআই সহকারী</span>
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" showCloseButton={false} className="w-[330px] sm:w-[400px] p-0 flex flex-col h-full bg-card border-l border-border">
            <BuilderAiPanel paperTitle={paperQuery.title} className="w-full h-full flex border-none" onClose={() => setIsAiSheetOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden print:overflow-visible relative min-h-0">
        <BuilderSidebar className="hidden xl:flex" />
        <main className="flex-1 relative overflow-hidden print:overflow-visible bg-muted/30 print:bg-transparent min-h-0">
          <BuilderCanvas paperId={paperId} paper={paperQuery} />
        </main>
        <BuilderAiPanel paperTitle={paperQuery.title} className="hidden xl:flex" />
      </div>

      <GenerateSetsModal 
        open={showGenerateModal} 
        onOpenChange={setShowGenerateModal} 
        originalPaperTitle={paperQuery.title}
        originalPaper={paperQuery}
      />
      <IncompletePaperModal
        open={showIncompleteModal}
        onOpenChange={setShowIncompleteModal}
        paperId={paperId}
        incompleteDistributions={incompleteDistributions}
      />
      <PublishBeforeDownloadModal
        open={showPublishModal}
        onOpenChange={setShowPublishModal}
        paperTitle={paperQuery.title}
        onConfirm={handleConfirmPublishAndDownload}
        isLoading={isPublishing}
      />
      <ExportOverlay />
    </div>
  );
};

