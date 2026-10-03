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

/** Resolves after the browser has painted a frame, keeping the loading UI animating. */
function nextPaint(): Promise<void> {
  return new Promise((resolve) =>
    requestAnimationFrame(() => setTimeout(resolve, 0))
  );
}

/** Safe inset (mm) so printers' unprintable edges don't clip content. */
const SAFE_INSET_MM = 6.5;

/** Places a page image inside the box, scaled uniformly and centered with a safe inset. */
function placePage(pdf: jsPDF, img: string, x: number, y: number, w: number, h: number) {
  const scale = Math.min((w - 2 * SAFE_INSET_MM) / w, (h - 2 * SAFE_INSET_MM) / h);
  const dw = w * scale;
  const dh = h * scale;
  pdf.addImage(img, "PNG", x + (w - dw) / 2, y + (h - dh) / 2, dw, dh, undefined, "SLOW");
}

/**
 * Darkens mid-tones (anti-aliased text edges) so printed text isn't faint.
 * White stays white; gamma > 1 pulls grey pixels towards black.
 */
function hardenImage(dataUrl: string, gamma = 1.8): Promise<string> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(dataUrl);
        ctx.drawImage(image, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const lut = new Uint8Array(256);
        for (let i = 0; i < 256; i++) lut[i] = Math.round(255 * Math.pow(i / 255, gamma));
        const px = data.data;
        for (let i = 0; i < px.length; i += 4) {
          px[i] = lut[px[i]!]!;
          px[i + 1] = lut[px[i + 1]!]!;
          px[i + 2] = lut[px[i + 2]!]!;
        }
        ctx.putImageData(data, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(dataUrl);
      }
    };
    image.onerror = () => resolve(dataUrl);
    image.src = dataUrl;
  });
}

/** Temporary style giving text slightly heavier, crisper strokes during capture. */
function injectExportStyle(): HTMLStyleElement {
  const style = document.createElement("style");
  style.setAttribute("data-export-style", "true");
  style.textContent = `
    [data-page-content], [data-page-content] * {
      text-rendering: geometricPrecision;
      -webkit-text-stroke: 0.15px currentColor;
    }
  `;
  document.head.appendChild(style);
  return style;
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
      setIsExporting,
      setExportProgress,
    } = useBuilderStore.getState();

    setIsExporting(true);
    setExportProgress(null);
    // Let the overlay mount and paint before any heavy work starts
    await nextPaint();

    let originalDescriptor: PropertyDescriptor | undefined;
    let exportStyleEl: HTMLStyleElement | null = null;

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

      // 2. Find the page nodes. Capture overrides the zoom transform on the clone,
      //    so the live canvas is not re-rendered (that re-render caused the stall).
      let pageNodes: HTMLElement[] = [];

      for (let attempt = 0; attempt < 15; attempt++) {
        if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, 150));

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
      const isTwoPagesPerSheet = settings.twoPagesPerSheet;
      const isSideBySide = isBookFold || isTwoPagesPerSheet;
      const dims = PAPER_DIMENSIONS[settings.paperSize] ?? PAPER_DIMENSIONS.A4!;
      const isLandscape = settings.paperOrientation === "landscape";

      const logicalWidth = isLandscape ? dims!.h : dims!.w;
      const logicalHeight = isLandscape ? dims!.w : dims!.h;

      // For book fold or 2 pages per sheet, the sheet width is double the logical page width, and orientation is landscape
      const pdfWidth = isSideBySide ? logicalWidth * 2 : logicalWidth;
      const pdfHeight = logicalHeight;

      // 6. Create jsPDF instance
      const pdf = new jsPDF({
        orientation: isSideBySide ? "landscape" : (isLandscape ? "landscape" : "portrait"),
        unit: "mm",
        format: [pdfWidth, pdfHeight],
      });

      setExportProgress({ current: 0, total: pageNodes.length });

      // 7. Capture each page as a PNG data URL (4x ≈ 384 DPI) with crisp, darkened text
      const pageImages: string[] = [];
      exportStyleEl = injectExportStyle();
      for (let i = 0; i < pageNodes.length; i++) {
        const pageNode = pageNodes[i];
        if (!pageNode) continue;

        // `current` = pages already completed; yield so the overlay repaints before heavy work
        setExportProgress({ current: i, total: pageNodes.length });
        await nextPaint();

        let dataUrl: string;
        // Overrides applied to the *cloned* page only, so the live builder never reflows:
        // - transform none: capture true size regardless of the on-screen zoom
        // - drop page margins (top/bottom always; left/right for multi-column).
        //   The safe inset applied when placing the page still protects the printer edge.
        const removeSideMargins = Number(settings.columns) > 1;
        const cloneStyle: Record<string, string> = {
          transform: "none",
          paddingTop: "0px",
          paddingBottom: "0px",
          ...(removeSideMargins ? { paddingLeft: "0px", paddingRight: "0px" } : {}),
        };
        try {
          dataUrl = await toPng(pageNode, {
            pixelRatio: 4,
            filter: exportFilter,
            cacheBust: true,
            backgroundColor: "#ffffff",
            style: cloneStyle,
          });
        } catch {
          // Fallback: try with lower pixel ratio if memory issues
          dataUrl = await toPng(pageNode, {
            pixelRatio: 2,
            filter: exportFilter,
            cacheBust: true,
            backgroundColor: "#ffffff",
            style: cloneStyle,
          });
        }

        pageImages.push(await hardenImage(dataUrl));
        setExportProgress({ current: i + 1, total: pageNodes.length });
        await nextPaint();

      }
      exportStyleEl.remove();
      exportStyleEl = null;

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
            placePage(pdf, frontLeftImg, 0, 0, logicalWidth, logicalHeight);
          }
          if (frontRightImg) {
            placePage(pdf, frontRightImg, logicalWidth, 0, logicalWidth, logicalHeight);
          }

          // Back Side: Left = Second page, Right = Second to last page
          const backLeftIdx = 2 * i + 1;
          const backRightIdx = pageImages.length - 2 - 2 * i;
          const backLeftImg = pageImages[backLeftIdx];
          const backRightImg = pageImages[backRightIdx];

          pdf.addPage([pdfWidth, pdfHeight], "landscape");
          
          if (backLeftImg) {
            placePage(pdf, backLeftImg, 0, 0, logicalWidth, logicalHeight);
          }
          if (backRightImg) {
            placePage(pdf, backRightImg, logicalWidth, 0, logicalWidth, logicalHeight);
          }
        }
      } else if (isTwoPagesPerSheet) {
        // Sequential 2 Pages per Sheet Layout: [1 | 2], [3 | 4], [5 | 6]...
        const sheetCount = Math.ceil(pageImages.length / 2);
        let addedFirst = false;

        for (let i = 0; i < sheetCount; i++) {
          const leftIdx = 2 * i;
          const rightIdx = 2 * i + 1;
          const leftImg = pageImages[leftIdx];
          const rightImg = pageImages[rightIdx];

          if (addedFirst) {
            pdf.addPage([pdfWidth, pdfHeight], "landscape");
          } else {
            addedFirst = true;
          }

          if (leftImg) {
            placePage(pdf, leftImg, 0, 0, logicalWidth, logicalHeight);
          }
          if (rightImg) {
            placePage(pdf, rightImg, logicalWidth, 0, logicalWidth, logicalHeight);
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
          placePage(pdf, img, 0, 0, pdfWidth, pdfHeight);
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
      (exportStyleEl as HTMLStyleElement | null)?.remove();
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
