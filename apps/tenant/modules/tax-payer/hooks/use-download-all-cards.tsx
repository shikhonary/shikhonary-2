"use client"

import { useState, useCallback } from "react"
import { createRoot } from "react-dom/client"
import { toPng } from "html-to-image"
import JSZip from "jszip"
import jsPDF from "jspdf"
import { CardFront, TaxPayerCardData } from "../components/holding-card-front"
import type { TenantInfo } from "@/modules/layout/ui/components/tenant-provider"
import solaimanLipiCss from "../styles/solaimanLipiEmbedded.css?raw"

const BENGALI_FONT_FAMILY = "'SolaimanLipi', 'Noto Sans Bengali', sans-serif"

const ensureFont = async () => {
  if (typeof document === "undefined") return
  const styleId = "solaiman-lipi-embedded-font"
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style")
    style.id = styleId
    style.textContent = solaimanLipiCss
    document.head.appendChild(style)
  }
  if (document.fonts) {
    await document.fonts.load("400 1em SolaimanLipi")
    await document.fonts.load("700 1em SolaimanLipi")
    await document.fonts.ready
  }
}

const renderCardToDataUrl = async (
  taxPayer: TaxPayerCardData,
  tenant: Partial<TenantInfo> & {
    name: string
    nameBn?: string | null
    unionName?: string | null
    upazilaName?: string | null
    districtName?: string | null
    logo?: string | null
    chairmanName?: string | null
  }
): Promise<string> => {
  const container = document.createElement("div")
  container.style.position = "fixed"
  container.style.left = "-9999px"
  container.style.top = "0"
  container.style.zIndex = "-1"
  document.body.appendChild(container)

  const root = createRoot(container)
  root.render(<CardFront taxPayer={taxPayer} tenant={tenant} forExport />)

  await new Promise((r) => setTimeout(r, 400))

  const cardEl = container.firstElementChild as HTMLElement
  if (!cardEl) {
    root.unmount()
    container.remove()
    throw new Error("Card element rendering failed")
  }

  try {
    const dataUrl = await toPng(cardEl, {
      pixelRatio: 3,
      cacheBust: true,
      fontEmbedCSS: solaimanLipiCss,
      style: { fontFamily: BENGALI_FONT_FAMILY, lineHeight: "1.5" },
    })
    return dataUrl
  } finally {
    root.unmount()
    container.remove()
  }
}

export const useDownloadAllCards = () => {
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  const downloadAll = useCallback(
    async (
      taxPayers: TaxPayerCardData[],
      tenant: Partial<TenantInfo> & {
        name: string
        nameBn?: string | null
        unionName?: string | null
        upazilaName?: string | null
        districtName?: string | null
        logo?: string | null
        chairmanName?: string | null
        slug?: string
      }
    ) => {
      if (!taxPayers.length) return
      setDownloading(true)
      setProgress({ current: 0, total: taxPayers.length })

      try {
        await ensureFont()

        const zip = new JSZip()
        const cardW = 3.375 * 25.4 // mm
        const cardH = 2.125 * 25.4 // mm

        for (let i = 0; i < taxPayers.length; i++) {
          const tp = taxPayers[i]
          if (!tp) continue
          setProgress({ current: i + 1, total: taxPayers.length })
          const dataUrl = await renderCardToDataUrl(tp, tenant)

          const pdf = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: [cardW, cardH],
          })
          pdf.addImage(dataUrl, "PNG", 0, 0, cardW, cardH)

          const pdfBlob = pdf.output("arraybuffer")
          const safeHolding = taxPayerFileName(tp.holding)
          const safeName = taxPayerFileName(tp.name)
          const fileName = `holding-${safeHolding}-${safeName}.pdf`
          zip.file(fileName, pdfBlob)
        }

        const blob = await zip.generateAsync({ type: "blob" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `holding-cards-${tenant.slug || "export"}.zip`
        a.click()
        URL.revokeObjectURL(url)
      } catch (err) {
        console.error("Bulk download cards failed:", err)
        throw err
      } finally {
        setDownloading(false)
        setProgress({ current: 0, total: 0 })
      }
    },
    []
  )

  return { downloadAll, downloading, progress }
}

function taxPayerFileName(str: string): string {
  return str.replace(/[/\\?%*:|"<>]/g, "_").trim()
}
