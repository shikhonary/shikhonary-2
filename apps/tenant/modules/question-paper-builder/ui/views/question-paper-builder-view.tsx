"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useBuilderStore } from "../../store/use-builder-store";
import { BuilderSidebar } from "../components/sidebar/builder-sidebar";
import { BuilderAiPanel } from "../components/sidebar/builder-ai-panel";
import { BuilderCanvas } from "../components/canvas/builder-canvas";
import { FloatingFormatToolbar } from "../components/toolbar/floating-format-toolbar";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft, Loader2, Save, Copy, Download, SlidersHorizontal, Sparkles, Lock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { toast } from "@workspace/ui/components/sonner";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
} from "@workspace/ui/components/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
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
import { CanvasHistoryControls } from "../components/toolbar/canvas-history-controls";
import { buildQuestionPaperTitle, toBengaliDigits } from "@workspace/utils";
import { cn } from "@workspace/ui/lib/utils";

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
  const setSaveStatus = useBuilderStore((state) => state.setSaveStatus);
  const markSaved = useBuilderStore((state) => state.markSaved);

  const { mutateAsync: updateSettings } = useUpdateQuestionPaperSettings();
  const debouncedSettings = useDebounce(settings, 1200);
  const initialMount = useRef(true);
  const lastSavedSettingsRef = useRef<string>("");

  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      lastSavedSettingsRef.current = JSON.stringify(settings);
      return;
    }

    const currentStringified = JSON.stringify(debouncedSettings);
    const hasUnsaved = useBuilderStore.getState().hasUnsavedChanges;

    // Only save when debounced settings differ from last saved snapshot or when unsaved changes exist
    if (hasUnsaved || currentStringified !== lastSavedSettingsRef.current) {
      setSaveStatus("saving");
      updateSettings({ id: paperId, settings: debouncedSettings })
        .then(() => {
          lastSavedSettingsRef.current = currentStringified;
          markSaved();
        })
        .catch((err: any) => {
          setSaveStatus("error");
          toast.error(err?.message || "অটো-সেভ করা যায়নি");
        });
    }
  }, [debouncedSettings, paperId, updateSettings, setSaveStatus, markSaved]);

  return null;
}

export const QuestionPaperBuilderView: React.FC<Props> = ({ paperId }) => {
  const { tenant } = useTenant();
  const { hydratePaper, saveStatus, markSaved, settings, rehydrateCounter, hasUnsavedChanges } = useBuilderStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [incompleteActionType, setIncompleteActionType] = useState<"download" | "generate-sets">("download");
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishActionType, setPublishActionType] = useState<"download" | "generate-sets">("download");
  const [isSettingsSheetOpen, setIsSettingsSheetOpen] = useState(false);
  const [isAiSheetOpen, setIsAiSheetOpen] = useState(false);
  const lastRehydratedCounter = useRef(-1);

  const { data: paperQuery, isLoading, error } = useQuestionPaperById(paperId);
  const { data: distributionStatuses } = useQuestionPaperDistributionStatuses(paperId);
  const { mutateAsync: updateSettingsMutation, isPending: isManualSaving } = useUpdateQuestionPaperSettings();
  const { mutateAsync: updatePaperMutation, isPending: isPublishing } = useUpdateQuestionPaper();
  const effectivePaperTitle = React.useMemo(() => {
    if (!paperQuery) return undefined;
    return buildQuestionPaperTitle({
      className: paperQuery.className,
      examName: paperQuery.examName,
      subjects: paperQuery.subjects,
    }) || paperQuery.title;
  }, [paperQuery]);
  const { downloadAsPdf, isDownloading } = useDownloadPaper({ paperTitle: effectivePaperTitle });

  const incompleteDistributions = React.useMemo(() => {
    if (!distributionStatuses || distributionStatuses.length === 0) return [];
    return distributionStatuses.filter(
      (dist) => (dist.addedCount || 0) < (dist.targetCount || 0)
    );
  }, [distributionStatuses]);

  const totalTargetQuestions = React.useMemo(() => {
    return (distributionStatuses || []).reduce((acc, d) => acc + (d.targetCount || 0), 0);
  }, [distributionStatuses]);

  const totalAddedQuestions = React.useMemo(() => {
    return (distributionStatuses || []).reduce((acc, d) => acc + (d.addedCount || 0), 0);
  }, [distributionStatuses]);

  const isPaperComplete = Boolean(
    distributionStatuses &&
    distributionStatuses.length > 0 &&
    totalTargetQuestions > 0 &&
    totalAddedQuestions >= totalTargetQuestions &&
    incompleteDistributions.length === 0
  );

  const remainingQuestions = Math.max(0, totalTargetQuestions - totalAddedQuestions);

  const handleDownloadClick = async () => {
    if (isDownloading) return;

    if (!isPaperComplete) {
      setIncompleteActionType("download");
      setShowIncompleteModal(true);
      return;
    }

    if (paperQuery?.status !== "Published") {
      setPublishActionType("download");
      setShowPublishModal(true);
      return;
    }

    // Save paper settings before download
    try {
      await updateSettingsMutation({ id: paperId, settings });
      markSaved();
    } catch (e) {
      console.error(e);
    }

    downloadAsPdf();
  };

  const handleGenerateSetsClick = async () => {
    if (!isPaperComplete) {
      setIncompleteActionType("generate-sets");
      setShowIncompleteModal(true);
      return;
    }

    if (paperQuery?.status !== "Published") {
      setPublishActionType("generate-sets");
      setShowPublishModal(true);
      return;
    }

    // Save paper settings before generating sets
    try {
      await updateSettingsMutation({ id: paperId, settings });
      markSaved();
    } catch (e) {
      console.error(e);
    }

    setShowGenerateModal(true);
  };

  const handleConfirmPublish = async () => {
    try {
      // 1. Save paper settings
      await updateSettingsMutation({
        id: paperId,
        settings,
      });
      markSaved();

      // 2. Publish paper
      await updatePaperMutation({
        id: paperId,
        status: "Published",
      });

      setShowPublishModal(false);

      if (publishActionType === "generate-sets") {
        toast.success("প্রশ্নপত্র সফলভাবে সেভ ও পাবলিশ হয়েছে");
        setShowGenerateModal(true);
      } else {
        toast.success("প্রশ্নপত্র সফলভাবে সেভ ও পাবলিশ হয়েছে");
        downloadAsPdf();
      }
    } catch (err: any) {
      toast.error(err?.message || "প্রশ্নপত্র সেভ বা স্ট্যাটাস আপডেট করা যায়নি");
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

  const handleManualSave = useCallback(async () => {
    useBuilderStore.setState({ saveStatus: "saving" });
    try {
      const currentSettings = useBuilderStore.getState().settings;
      await updateSettingsMutation({ id: paperId, settings: currentSettings });
      markSaved();
      toast.success("সব পরিবর্তন সেভ হয়েছে");
    } catch (err: any) {
      useBuilderStore.setState({ saveStatus: "error" });
      toast.error(err?.message || "সেভ করা যায়নি");
    }
  }, [paperId, updateSettingsMutation, markSaved]);

  const handleManualSaveRef = useRef(handleManualSave);
  handleManualSaveRef.current = handleManualSave;

  // Global Keyboard Shortcuts for Save, Undo/Redo & Zooming (Ctrl/Cmd + S, Z, Y, Plus, Minus, 0)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process when modifier is active (Ctrl or Cmd)
      if (!e.ctrlKey && !e.metaKey) return;

      // Check for Save shortcut (Ctrl+S / Cmd+S)
      const isS = e.code === "KeyS" || e.key?.toLowerCase() === "s";
      if (isS) {
        e.preventDefault();
        e.stopPropagation();
        handleManualSaveRef.current();
        return;
      }

      const target = (e.target || document.activeElement) as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      // Check both key and code to support all international, Mac, and Bengali keyboard layouts
      const isZ = e.code === "KeyZ" || e.key?.toLowerCase() === "z";
      const isY = e.code === "KeyY" || e.key?.toLowerCase() === "y";

      if (isZ && !e.shiftKey) {
        // Undo: Ctrl+Z or Cmd+Z
        e.preventDefault();
        e.stopPropagation();
        useBuilderStore.getState().undo();
      } else if ((isZ && e.shiftKey) || isY) {
        // Redo: Ctrl+Shift+Z, Cmd+Shift+Z, Ctrl+Y, Cmd+Y
        e.preventDefault();
        e.stopPropagation();
        useBuilderStore.getState().redo();
      } else if (e.key === "=" || e.key === "+" || e.code === "Equal") {
        e.preventDefault();
        e.stopPropagation();
        const { zoom, setZoom } = useBuilderStore.getState();
        const current = typeof zoom === "number" ? zoom : 1.0;
        setZoom(Math.min(2.5, +(current + 0.15).toFixed(2)));
      } else if (e.key === "-" || e.code === "Minus") {
        e.preventDefault();
        e.stopPropagation();
        const { zoom, setZoom } = useBuilderStore.getState();
        const current = typeof zoom === "number" ? zoom : 1.0;
        setZoom(Math.max(0.3, +(current - 0.15).toFixed(2)));
      } else if (e.key === "0" || e.code === "Digit0") {
        e.preventDefault();
        e.stopPropagation();
        const { setZoom } = useBuilderStore.getState();
        setZoom("auto");
      }
    };

    // Use capture phase on document to intercept before child components or Radix UI can stop propagation
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, []);

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
            className="h-8.5 sm:h-9 px-2 sm:px-3 rounded-xl border-border bg-card hover:bg-muted text-xs font-bold font-headline text-foreground cursor-pointer gap-1 sm:gap-1.5 shrink-0 shadow-2xs transition-all active:scale-95"
          >
            <Link href="/question-papers" title="প্রশ্নপত্র তালিকায় ফিরে যান">
              <ArrowLeft className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="hidden sm:inline">তালিকায় ফিরুন</span>
              <span className="inline sm:hidden">তালিকা</span>
            </Link>
          </Button>

          <div className="flex flex-col justify-center min-w-0">
            <div className="hidden sm:flex items-center gap-2">
              <h1
                className="font-headline font-bold text-xs xs:text-sm sm:text-base text-foreground truncate max-w-[110px] xs:max-w-[150px] sm:max-w-[220px] md:max-w-[300px] lg:max-w-md leading-tight"
                title={paperQuery.title}
              >
                {paperQuery.title}
              </h1>
              {paperQuery.status === "Published" && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-headline shrink-0">
                  <Lock className="w-2.5 h-2.5" /> প্রকাশিত
                </span>
              )}
            </div>

            {/* Save Status & Paper Meta Sub-line */}
            <div className="flex items-center gap-1.5 mt-0.5">
              {saveStatus === "saving" && (
                <span className="text-[10px] sm:text-[11px] text-muted-foreground flex items-center gap-1 font-body">
                  <Loader2 className="w-2.5 h-2.5 animate-spin text-indigo-600 dark:text-indigo-400" />
                  <span>সেভ হচ্ছে...</span>
                </span>
              )}
              {hasUnsavedChanges && saveStatus !== "saving" && (
                <span className="text-[10px] sm:text-[11px] text-amber-600 dark:text-amber-400 font-body flex items-center gap-1 font-medium">
                  <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>পরিবর্তন হচ্ছে...</span>
                </span>
              )}
              {!hasUnsavedChanges && saveStatus === "saved" && (
                <span className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-body flex items-center gap-1 font-semibold">
                  <span>✓</span>
                  <span>সেভ হয়েছে</span>
                </span>
              )}
              {saveStatus === "error" && (
                <span className="text-[10px] sm:text-[11px] text-rose-600 dark:text-rose-400 font-body font-semibold">
                  সেভ হয়নি
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Right Action Buttons */}
        <TooltipProvider delayDuration={150}>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* History Controls (Undo / Redo) */}
            <CanvasHistoryControls className="flex" />

            {/* Zoom Controls */}
            <CanvasZoomControls className="hidden sm:flex" />

            {/* Generate Sets Modal Trigger */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateSetsClick}
                  className="h-8.5 sm:h-9 px-2.5 sm:px-3 rounded-xl border-slate-200 dark:border-white/10 text-xs font-bold text-foreground cursor-pointer gap-1 sm:gap-1.5 font-headline shrink-0 transition-all hover:bg-muted/60"
                >
                  <Copy className={cn("w-3.5 h-3.5", !isPaperComplete ? "text-amber-500" : "text-muted-foreground")} />
                  <span className="hidden sm:inline">সেট তৈরি</span>
                  <span className="inline sm:hidden">সেট</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="center" className="rounded-xl shadow-lg border border-border/20 px-3 py-2 text-xs font-body max-w-xs z-50">
                {!isPaperComplete ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 font-bold font-headline text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>প্রশ্নপত্র অসম্পূর্ণ ({toBengaliDigits(totalAddedQuestions)}/{toBengaliDigits(totalTargetQuestions)}টি যুক্ত)</span>
                    </div>
                    <p className="text-[11px] opacity-90 leading-tight">
                      ক্লিক করে ঘাটতিগুলো দেখুন এবং সেট তৈরি সম্পন্ন করুন
                    </p>
                  </div>
                ) : (
                  <span>মাল্টিপল সেট তৈরি করুন</span>
                )}
              </TooltipContent>
            </Tooltip>

            {/* Download PDF Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadClick}
                  disabled={isDownloading}
                  className={cn(
                    "h-8.5 sm:h-9 px-2.5 sm:px-3 rounded-xl border-slate-200 dark:border-white/10 text-xs font-bold text-foreground cursor-pointer gap-1 sm:gap-1.5 font-headline shrink-0 transition-all hover:bg-muted/60",
                    isDownloading && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {isDownloading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  ) : (
                    <Download className={cn("w-3.5 h-3.5", !isPaperComplete ? "text-amber-500" : "text-muted-foreground")} />
                  )}
                  <span className="hidden sm:inline">PDF ডাউনলোড</span>
                  <span className="inline sm:hidden">ডাউনলোড</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="center" className="rounded-xl shadow-lg border border-border/20 px-3 py-2 text-xs font-body max-w-xs z-50">
                {isDownloading ? (
                  <span>PDF প্রস্তুত হচ্ছে...</span>
                ) : !isPaperComplete ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 font-bold font-headline text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>প্রশ্নপত্র অসম্পূর্ণ ({toBengaliDigits(totalAddedQuestions)}/{toBengaliDigits(totalTargetQuestions)}টি যুক্ত)</span>
                    </div>
                    <p className="text-[11px] opacity-90 leading-tight">
                      ক্লিক করে ড্রাফট ডাউনলোড করুন বা বাকি প্রশ্নগুলো দেখুন
                    </p>
                  </div>
                ) : (
                  <span>প্রশ্নপত্র PDF ফরম্যাটে ডাউনলোড করুন</span>
                )}
              </TooltipContent>
            </Tooltip>

            {/* Save Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  onClick={handleManualSave}
                  disabled={saveStatus === "saving" || isManualSaving}
                  className="h-8.5 sm:h-9 px-3 sm:px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold font-headline cursor-pointer gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-50 shrink-0"
                >
                  {saveStatus === "saving" || isManualSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">সেভ করুন</span>
                  <span className="inline sm:hidden">সেভ</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="end" className="rounded-xl shadow-lg border border-border/20 px-3 py-1.5 text-xs font-body z-50">
                <span>পরিবর্তন সেভ করুন (Ctrl+S)</span>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
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
              <span>AI সহকারী</span>
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" showCloseButton={false} className="w-[330px] sm:w-[400px] p-0 flex flex-col h-full bg-card border-l border-border">
            <BuilderAiPanel paperTitle={paperQuery.title} className="w-full h-full flex border-none" onClose={() => setIsAiSheetOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Published Notice Banner */}
      {paperQuery.status === "Published" && (
        <div className="bg-emerald-50/90 dark:bg-emerald-950/40 border-b border-emerald-200/60 dark:border-emerald-800/30 px-3 sm:px-6 py-2 flex items-center gap-2.5 text-emerald-950 dark:text-emerald-200 text-xs font-body shrink-0 z-30 print:hidden shadow-2xs">
          <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p>
            <strong className="font-headline font-semibold">প্রশ্নপত্রটি প্রকাশিত (সুরক্ষিত):</strong> প্রশ্নসমূহ স্থায়ীভাবে লক করা হয়েছে। তবে আপনি ফন্ট সাইজ, পেজ ব্রেক এবং প্রিন্ট লেআউট পরিবর্তন ও সংরক্ষণ করতে পারবেন।
          </p>
        </div>
      )}

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
        actionType={incompleteActionType}
        incompleteDistributions={incompleteDistributions}
      />
      <PublishBeforeDownloadModal
        open={showPublishModal}
        onOpenChange={setShowPublishModal}
        paperTitle={paperQuery.title}
        actionType={publishActionType}
        onConfirm={handleConfirmPublish}
        isLoading={isPublishing || isManualSaving}
      />
      <ExportOverlay />
    </div>
  );
};

