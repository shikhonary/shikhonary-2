"use client";

import React, { useEffect, useState, useRef } from "react";
import { useBuilderStore } from "../../store/use-builder-store";
import { BuilderSidebar } from "../components/sidebar/builder-sidebar";
import { BuilderCanvas } from "../components/canvas/builder-canvas";
import { FloatingFormatToolbar } from "../components/toolbar/floating-format-toolbar";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft, Loader2, Save, Copy, Download } from "lucide-react";
import Link from "next/link";
import { toast } from "@workspace/ui/components/sonner";
import {
  useQuestionPaperById,
  useUpdateQuestionPaperSettings,
} from "@/modules/question-paper/services/use-question-paper";
import { GenerateSetsModal } from "../components/modals/generate-sets-modal";
import { useTenant } from "@/modules/layout/ui/components/tenant-provider";
import { useDownloadPaper } from "../../hooks/use-download-paper";
import { ExportOverlay } from "../components/canvas/export-overlay";

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
  const { hydratePaper, saveStatus, markSaved, settings } = useBuilderStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const { data: paperQuery, isLoading, error } = useQuestionPaperById(paperId);
  const { mutateAsync: updateSettingsMutation, isPending: isManualSaving } = useUpdateQuestionPaperSettings();
  const { downloadAsPdf, isDownloading } = useDownloadPaper({ paperTitle: paperQuery?.title });

  useEffect(() => {
    if (paperQuery && !isHydrated) {
      hydratePaper(
        paperId,
        (paperQuery.settings || {}) as any,
        paperQuery,
        tenant.nameBn || tenant.name
      );
      setIsHydrated(true);
    }
  }, [paperQuery, isHydrated, hydratePaper, paperId, tenant]);

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
    <div className="flex flex-col h-screen print:h-auto overflow-hidden print:overflow-visible bg-background font-display">
      <AutoSaveManager paperId={paperId} />
      
      {/* Top Header */}
      <header className="h-14 flex items-center justify-between px-4 border-b bg-card shrink-0 print:hidden z-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/question-papers">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold line-clamp-1 max-w-[200px] md:max-w-md">
              {paperQuery.title}
            </h1>
            {saveStatus === "saving" && (
              <span className="text-xs text-muted-foreground flex items-center gap-1 font-body">
                <Loader2 className="w-3 h-3 animate-spin text-primary" /> সংরক্ষণ হচ্ছে...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="text-xs text-emerald-600 font-body">✓ সংরক্ষিত</span>
            )}
            {saveStatus === "error" && (
              <span className="text-xs text-red-600 font-body">সংরক্ষণ ব্যর্থ</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowGenerateModal(true)} className="cursor-pointer gap-1.5">
            <Copy className="w-3.5 h-3.5" />
            <span>সেট তৈরি</span>
          </Button>
          <Button variant="outline" size="sm" onClick={downloadAsPdf} disabled={isDownloading} className="cursor-pointer gap-1.5">
            {isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>ডাউনলোড PDF</span>
          </Button>
          <Button size="sm" onClick={handleManualSave} disabled={saveStatus === "saving" || isManualSaving} className="cursor-pointer gap-1.5 bg-primary text-white">
            {saveStatus === "saving" || isManualSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>সংরক্ষণ করুন</span>
          </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden print:overflow-visible relative">
        <BuilderSidebar />
        <main className="flex-1 relative overflow-auto print:overflow-visible bg-muted/30 print:bg-transparent">
          <BuilderCanvas paperId={paperId} paper={paperQuery} />
          <FloatingFormatToolbar />
        </main>
      </div>

      <GenerateSetsModal 
        open={showGenerateModal} 
        onOpenChange={setShowGenerateModal} 
        originalPaperTitle={paperQuery.title}
        originalPaper={paperQuery}
      />
      <ExportOverlay />
    </div>
  );
};

