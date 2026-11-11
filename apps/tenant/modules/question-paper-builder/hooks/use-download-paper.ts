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

interface CapturedPageImage {
  dataUrl: string;
  width: number;
  height: number;
}

/** Places a page image inside the target box while strictly preserving its natural aspect ratio. */
function placePage(pdf: jsPDF, img: CapturedPageImage, x: number, y: number, w: number, h: number) {
  const imgAspect = img.width > 0 && img.height > 0 ? img.width / img.height : w / h;
  const boxAspect = w / h;
  let dw = w;
  let dh = h;

  if (imgAspect > boxAspect) {
    dh = w / imgAspect;
  } else {
    dw = h * imgAspect;
  }

  pdf.addImage(img.dataUrl, "PNG", x + (w - dw) / 2, y + (h - dh) / 2, dw, dh, undefined, "FAST");
}

/** Reads natural dimensions and applies gentle gamma darkening so thin regular strokes print crisp and dark. */
function processExportImage(
  dataUrl: string,
  gamma = 1.55,
): Promise<CapturedPageImage> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve({ dataUrl, width, height });
        return;
      }

      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(0, 0, width, height);
      const pixels = imageData.data;

      // Precompute lookup table for fast per-channel gamma adjustment
      const lut = new Uint8ClampedArray(256);
      for (let v = 0; v < 256; v++) {
        lut[v] = v >= 248 ? v : Math.round(255 * Math.pow(v / 255, gamma));
      }

      for (let idx = 0; idx < pixels.length; idx += 4) {
        if ((pixels[idx + 3] ?? 0) === 0) continue;
        pixels[idx] = lut[pixels[idx] ?? 0] ?? 0;
        pixels[idx + 1] = lut[pixels[idx + 1] ?? 0] ?? 0;
        pixels[idx + 2] = lut[pixels[idx + 2] ?? 0] ?? 0;
      }

      ctx.putImageData(imageData, 0, 0);
      resolve({
        dataUrl: canvas.toDataURL("image/png"),
        width,
        height,
      });
    };
    image.onerror = () => resolve({ dataUrl, width: 0, height: 0 });
    image.src = dataUrl;
  });
}

/** Temporary style ensuring crisp font rendering and pure-black body text during PDF capture. */
function injectExportStyle(): HTMLStyleElement {
  const style = document.createElement("style");
  style.setAttribute("data-export-style", "true");
  style.textContent = `
    [data-page-content], [data-page-content] * {
      text-rendering: geometricPrecision;
    }
    [data-page-content] .text-foreground {
      color: #000000 !important;
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

      // 7. Capture each page as a PNG data URL (4x ≈ 384 DPI) preserving exact canvas margins & aspect ratio
      const pageImages: Array<CapturedPageImage | null> = [];
      exportStyleEl = injectExportStyle();
      for (let i = 0; i < pageNodes.length; i++) {
        const pageNode = pageNodes[i];
        if (!pageNode) continue;

        // `current` = pages already completed; yield so the overlay repaints before heavy work
        setExportProgress({ current: i, total: pageNodes.length });
        await nextPaint();

        let dataUrl: string;
        // Reset only the on-screen zoom transform on the clone so margins & line wrapping match WYSIWYG 1:1
        const cloneStyle: Record<string, string> = {
          transform: "none",
        };
        const ratios = [6, 4, 2];
        for (let r = 0; r < ratios.length; r++) {
          try {
            dataUrl = await toPng(pageNode, {
              pixelRatio: ratios[r],
              filter: exportFilter,
              cacheBust: true,
              backgroundColor: "#ffffff",
              style: cloneStyle,
            });
            break;
          } catch (err) {
            if (r === ratios.length - 1) throw err;
          }
        }

        pageImages.push(await processExportImage(dataUrl!));
        setExportProgress({ current: i + 1, total: pageNodes.length });
        await nextPaint();

      }
      exportStyleEl.remove();
      exportStyleEl = null;

      // 8. Compile captured pages into the PDF document
      if (isBookFold) {
        // Pad to multiple of 4 pages (should already be padded in canvas rendering, but safeguard)
        while (pageImages.length % 4 !== 0) {
          pageImages.push(null); // null represents a blank page
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
