"use client";

import { useCallback, useRef } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { useBuilderStore } from "../store/use-builder-store";
import { toast } from "@workspace/ui/components/sonner";

const PAPER_DIMENSIONS: Record<string, { w: number; h: number }> = {
  A4: { w: 210, h: 297 },
  Letter: { w: 216, h: 279 },
  Legal: { w: 216, h: 356 },
  A5: { w: 148, h: 210 },
};

/**
 * Waits for all fonts (especially SolaimanLipi) to be loaded and ready.
 */
async function waitForFonts(): Promise<void> {
  await document.fonts.ready;

  // Explicitly check SolaimanLipi — the primary Bengali font
  if (!document.fonts.check("12px SolaimanLipi")) {
    // Give it a moment to load if not yet available
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

/**
 * Filter function for html-to-image: excludes interactive-only elements
 * that shouldn't appear in the downloaded PDF.
 */
function exportFilter(node: HTMLElement): boolean {
  // Skip elements with print:hidden that are purely interactive
  if (node.classList?.contains("print:hidden")) return false;
  // Skip the measurement container
  if (node.id === "page-content-measurer") return false;
  // Skip data-export-hide elements (we'll add this to action blocks)
  if (node.dataset?.exportHide === "true") return false;
  return true;
}

interface UseDownloadPaperOptions {
  paperTitle?: string;
}

export function useDownloadPaper({ paperTitle }: UseDownloadPaperOptions = {}) {
  const isDownloadingRef = useRef(false);

  const downloadAsPdf = useCallback(async () => {
    if (isDownloadingRef.current) return;
    isDownloadingRef.current = true;

    const {
      settings,
      zoom: originalZoom,
      setZoom,
      setIsExporting,
      setExportProgress,
    } = useBuilderStore.getState();

    setIsExporting(true);
    setExportProgress(null);

    try {
      // 1. Wait for fonts
      await waitForFonts();

      // 2. Temporarily set zoom to 1 for true-size capture
      setZoom(1);

      // 3. Wait for reflow
      await new Promise((resolve) => setTimeout(resolve, 400));

      // 4. Find all page content nodes
      const pageNodes = document.querySelectorAll<HTMLElement>(
        "[data-page-content]"
      );

      if (pageNodes.length === 0) {
        throw new Error("কোনো পৃষ্ঠা পাওয়া যায়নি");
      }

      // 5. Determine PDF dimensions
      const dims = PAPER_DIMENSIONS[settings.paperSize] ?? PAPER_DIMENSIONS.A4!;
      const isLandscape = settings.paperOrientation === "landscape";
      const pdfWidth = isLandscape ? dims!.h : dims!.w;
      const pdfHeight = isLandscape ? dims!.w : dims!.h;

      // 6. Create jsPDF instance
      const pdf = new jsPDF({
        orientation: isLandscape ? "landscape" : "portrait",
        unit: "mm",
        format: [pdfWidth, pdfHeight],
      });

      setExportProgress({ current: 0, total: pageNodes.length });

      // 7. Capture each page
      for (let i = 0; i < pageNodes.length; i++) {
        const pageNode = pageNodes[i];
        if (!pageNode) continue;

        setExportProgress({ current: i + 1, total: pageNodes.length });

        // Capture as PNG with 3x pixel ratio for near-print quality (~288 DPI)
        let dataUrl: string;
        try {
          dataUrl = await toPng(pageNode, {
            pixelRatio: 3,
            filter: exportFilter,
            cacheBust: true,
            backgroundColor: "#ffffff",
          });
        } catch {
          // Fallback: try with lower pixel ratio if memory issues
          dataUrl = await toPng(pageNode, {
            pixelRatio: 2,
            filter: exportFilter,
            cacheBust: true,
            backgroundColor: "#ffffff",
          });
        }

        // Add page to PDF (first page is auto-created)
        if (i > 0) {
          pdf.addPage([pdfWidth, pdfHeight], isLandscape ? "l" : "p");
        }

        // Add the captured image to fill the entire page
        pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      }

      // 8. Save the PDF
      const filename = paperTitle
        ? `${paperTitle.replace(/[<>:"/\\|?*]/g, "_")}.pdf`
        : "question-paper.pdf";
      pdf.save(filename);

      toast.success("পিডিএফ ডাউনলোড সম্পন্ন হয়েছে");
    } catch (error: any) {
      console.error("PDF download failed:", error);
      toast.error(error?.message || "পিডিএফ তৈরি করতে ব্যর্থ হয়েছে");
    } finally {
      // 9. Restore original zoom and clean up
      const { setZoom: restoreZoom, setIsExporting: restoreExporting, setExportProgress: restoreProgress } = useBuilderStore.getState();
      restoreZoom(originalZoom);
      restoreExporting(false);
      restoreProgress(null);
      isDownloadingRef.current = false;
    }
  }, [paperTitle]);

  const isDownloading = useBuilderStore((state) => state.isExporting);

  return { downloadAsPdf, isDownloading };
}
