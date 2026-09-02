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

    let originalDescriptor: PropertyDescriptor | undefined;

    try {
      // 0. Intercept CSSStyleSheet.prototype.cssRules to prevent SecurityError from cross-origin stylesheets
      if (typeof CSSStyleSheet !== "undefined") {
        originalDescriptor = Object.getOwnPropertyDescriptor(
          CSSStyleSheet.prototype,
          "cssRules"
        );
        const originalGet = originalDescriptor?.get;

        if (originalGet) {
          try {
            Object.defineProperty(CSSStyleSheet.prototype, "cssRules", {
              get() {
                try {
                  return originalGet.call(this);
                } catch (e) {
                  // Return an empty array so html-to-image doesn't fail on CORS-restricted stylesheets
                  return [];
                }
              },
              configurable: true,
            });
          } catch (err) {
            console.warn("Failed to patch CSSStyleSheet.prototype.cssRules:", err);
          }
        }
      }

      // 1. Wait for fonts
      await waitForFonts();

      // 2. Temporarily set zoom to 1 for true-size capture
      setZoom(1);

      // 3. Wait for reflow and ensure page nodes are mounted
      let pageNodes: HTMLElement[] = [];

      for (let attempt = 0; attempt < 15; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 150));

        // Strategy 1: Find by [data-page-content] attribute
        let found = Array.from(document.querySelectorAll<HTMLElement>("[data-page-content]"));
        
        // Strategy 2: Find by [data-page-index] wrappers
        if (found.length === 0) {
          const wrappers = Array.from(document.querySelectorAll<HTMLElement>("[data-page-index]"));
          found = wrappers
            .map((w) => w.querySelector<HTMLElement>("[data-page-content]") || (w.querySelector(".shadow-xl") as HTMLElement) || (w.firstElementChild as HTMLElement) || w)
            .filter(Boolean);
        }

        // Strategy 3: Find by .shadow-xl class inside print-container
        if (found.length === 0) {
          const printContainer = document.getElementById("print-container");
          if (printContainer) {
            found = Array.from(printContainer.querySelectorAll<HTMLElement>(".shadow-xl"));
          }
        }

        if (found.length > 0) {
          pageNodes = found;
          break;
        }
      }

      // Ultimate Fallback: If no page elements were matched, capture the print-container element directly
      if (pageNodes.length === 0) {
        const printContainer = document.getElementById("print-container");
        if (printContainer) {
          const canvasWrap = printContainer.querySelector<HTMLElement>(".print\\:hidden") || printContainer;
          pageNodes = [canvasWrap];
        }
      }

      pageNodes.sort((a, b) => {
        const idxA = parseInt(a.getAttribute("data-page-seq-index") || a.getAttribute("data-page-index") || a.parentElement?.getAttribute("data-page-index") || "0", 10);
        const idxB = parseInt(b.getAttribute("data-page-seq-index") || b.getAttribute("data-page-index") || b.parentElement?.getAttribute("data-page-index") || "0", 10);
        return idxA - idxB;
      });

      // 5. Determine PDF dimensions and sheet settings
      const isBookFold = settings.bookFoldLayout;
      const dims = PAPER_DIMENSIONS[settings.paperSize] ?? PAPER_DIMENSIONS.A4!;
      const isLandscape = settings.paperOrientation === "landscape";

      const logicalWidth = isLandscape ? dims!.h : dims!.w;
      const logicalHeight = isLandscape ? dims!.w : dims!.h;

      // For book fold, the sheet width is double the logical page width, and orientation is landscape
      const pdfWidth = isBookFold ? logicalWidth * 2 : logicalWidth;
      const pdfHeight = logicalHeight;

      // 6. Create jsPDF instance
      const pdf = new jsPDF({
        orientation: isBookFold ? "landscape" : (isLandscape ? "landscape" : "portrait"),
        unit: "mm",
        format: [pdfWidth, pdfHeight],
      });

      setExportProgress({ current: 0, total: pageNodes.length });

      // 7. Capture each page as a PNG data URL
      const pageImages: string[] = [];
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
        pageImages.push(dataUrl);
      }

      // 8. Compile captured pages into the PDF document
      if (isBookFold) {
        // Pad to multiple of 4 pages (should already be padded in canvas rendering, but safeguard)
        while (pageImages.length % 4 !== 0) {
          pageImages.push(""); // empty string represents a blank page
        }

        const S = pageImages.length / 4;
        let addedFirst = false;

        for (let i = 0; i < S; i++) {
          // Front Side: Left = Last page, Right = First page
          const frontLeftIdx = pageImages.length - 1 - 2 * i;
          const frontRightIdx = 2 * i;
          const frontLeftImg = pageImages[frontLeftIdx];
          const frontRightImg = pageImages[frontRightIdx];

          if (addedFirst) {
            pdf.addPage([pdfWidth, pdfHeight], "landscape");
          } else {
            addedFirst = true;
          }
          
          if (frontLeftImg) {
            pdf.addImage(frontLeftImg, "PNG", 0, 0, logicalWidth, logicalHeight);
          }
          if (frontRightImg) {
            pdf.addImage(frontRightImg, "PNG", logicalWidth, 0, logicalWidth, logicalHeight);
          }

          // Back Side: Left = Second page, Right = Second to last page
          const backLeftIdx = 2 * i + 1;
          const backRightIdx = pageImages.length - 2 - 2 * i;
          const backLeftImg = pageImages[backLeftIdx];
          const backRightImg = pageImages[backRightIdx];

          pdf.addPage([pdfWidth, pdfHeight], "landscape");
          
          if (backLeftImg) {
            pdf.addImage(backLeftImg, "PNG", 0, 0, logicalWidth, logicalHeight);
          }
          if (backRightImg) {
            pdf.addImage(backRightImg, "PNG", logicalWidth, 0, logicalWidth, logicalHeight);
          }
        }
      } else {
        // Standard Sequential Layout
        for (let i = 0; i < pageImages.length; i++) {
          const img = pageImages[i];
          if (!img) continue;

          if (i > 0) {
            pdf.addPage([pdfWidth, pdfHeight], isLandscape ? "l" : "p");
          }
          pdf.addImage(img, "PNG", 0, 0, pdfWidth, pdfHeight);
        }
      }

      // 9. Save the PDF
      const filename = paperTitle
        ? `${paperTitle.replace(/[<>:"/\\|?*]/g, "_")}.pdf`
        : "question-paper.pdf";
      pdf.save(filename);

      toast.success("পিডিএফ ডাউনলোড সম্পন্ন হয়েছে");
    } catch (error: any) {
      console.error("PDF download failed:", error);
      toast.error(error?.message || "পিডিএফ তৈরি করতে ব্যর্থ হয়েছে");
    } finally {
      // Restore original CSSStyleSheet.prototype.cssRules
      if (typeof CSSStyleSheet !== "undefined" && originalDescriptor) {
        try {
          Object.defineProperty(CSSStyleSheet.prototype, "cssRules", originalDescriptor);
        } catch (err) {
          console.warn("Failed to restore CSSStyleSheet.prototype.cssRules:", err);
        }
      }

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
