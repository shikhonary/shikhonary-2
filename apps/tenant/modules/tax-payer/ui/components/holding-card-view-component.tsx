"use client"

import React, { useEffect, useRef, useState } from "react"
import { toPng } from "html-to-image"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { Download, RefreshCw, Loader2 } from "lucide-react"
import { CardFront, TaxPayerCardData } from "./holding-card-front"
import { CardBack } from "./holding-card-back"
import type { TenantInfo } from "@/modules/layout/ui/components/tenant-provider"
import solaimanLipiCss from "../styles/solaimanLipiEmbedded.css?raw"

const BENGALI_FONT_FAMILY = "'SolaimanLipi', sans-serif"
const BENGALI_TEXT_STYLE: React.CSSProperties = {
  fontFamily: BENGALI_FONT_FAMILY,
  lineHeight: 1.6,
}

const ensureEmbeddedFontCss = () => {
  if (typeof document === "undefined") return
  const styleId = "solaiman-lipi-embedded-font"
  if (document.getElementById(styleId)) return

  const style = document.createElement("style")
  style.id = styleId
  style.textContent = solaimanLipiCss
  document.head.appendChild(style)
}

interface HoldingCardViewComponentProps {
  taxPayer: TaxPayerCardData
  tenant: Partial<TenantInfo> & {
    name: string
    nameBn?: string | null
    unionName?: string | null
    upazilaName?: string | null
    districtName?: string | null
    logo?: string | null
    chairmanName?: string | null
    phone?: string | null
    email?: string | null
  }
}

export const HoldingCardViewComponent: React.FC<HoldingCardViewComponentProps> = ({
  taxPayer,
  tenant,
}) => {
  const [flipped, setFlipped] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const frontRef = useRef<HTMLDivElement>(null)
  const backRef = useRef<HTMLDivElement>(null)
  const flipContainerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ensureEmbeddedFontCss()
    if (typeof document !== "undefined" && document.fonts) {
      void document.fonts.load("400 1em SolaimanLipi")
      void document.fonts.load("700 1em SolaimanLipi")
    }
  }, [])

  const downloadCard = async () => {
    if (!taxPayer) return
    setDownloading(true)

    const frontEl = frontRef.current
    const backEl = backRef.current
    const flipContainer = flipContainerRef.current
    const wrapper = wrapperRef.current

    if (!frontEl || !backEl || !flipContainer || !wrapper) {
      setDownloading(false)
      return
    }

    const origTransform = flipContainer.style.transform
    const origTransition = flipContainer.style.transition
    const origTransformStyle = flipContainer.style.transformStyle
    const origWrapperPerspective = wrapper.style.perspective

    const backDiv = backEl.parentElement
    const frontDiv = frontEl.parentElement
    const origBackTransform = backDiv?.style.transform || ""
    const origBackBfv = backDiv?.style.backfaceVisibility || ""
    const origFrontBfv = frontDiv?.style.backfaceVisibility || ""
    const origBackPos = backDiv?.style.position || ""
    const origBackInset = backDiv?.style.inset || ""

    try {
      flipContainer.style.transition = "none"
      flipContainer.style.transform = "none"
      flipContainer.style.transformStyle = "flat"
      wrapper.style.perspective = "none"

      if (frontDiv) frontDiv.style.backfaceVisibility = "visible"
      if (backDiv) {
        backDiv.style.position = "relative"
        backDiv.style.inset = "auto"
        backDiv.style.transform = "none"
        backDiv.style.backfaceVisibility = "visible"
      }

      ensureEmbeddedFontCss()
      if (document.fonts) {
        await document.fonts.load("400 1em SolaimanLipi")
        await document.fonts.load("700 1em SolaimanLipi")
        await document.fonts.ready
      }
      await new Promise<void>((r) => requestAnimationFrame(() => r()))
      await new Promise((r) => setTimeout(r, 200))

      const scale = 3
      const exportOptions = {
        pixelRatio: scale,
        cacheBust: true,
        fontEmbedCSS: solaimanLipiCss,
        style: { fontFamily: BENGALI_FONT_FAMILY, lineHeight: "1.6" },
        useCORS: true,
      }

      const frontPng = await toPng(frontEl, exportOptions)
      const backPng = await toPng(backEl, exportOptions)

      const loadImg = (src: string) => {
        const img = new Image()
        img.src = src
        return new Promise<HTMLImageElement>((res) => {
          img.onload = () => res(img)
        })
      }

      const [frontImg, backImg] = await Promise.all([loadImg(frontPng), loadImg(backPng)])

      const padding = 40 * scale
      const gap = 60 * scale
      const maxW = Math.max(frontImg.width, backImg.width) + padding * 2
      const totalH = padding + frontImg.height + gap + backImg.height + padding

      const canvas = document.createElement("canvas")
      canvas.width = maxW
      canvas.height = totalH
      const ctx = canvas.getContext("2d")!
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, maxW, totalH)

      const frontX = Math.round((maxW - frontImg.width) / 2)
      const backX = Math.round((maxW - backImg.width) / 2)
      ctx.drawImage(frontImg, frontX, padding)
      ctx.drawImage(backImg, backX, padding + frontImg.height + gap)

      const link = document.createElement("a")
      link.download = `holding-card-${taxPayer.holding}.jpg`
      link.href = canvas.toDataURL("image/jpeg", 0.95)
      link.click()

      toast.success("সফল! কার্ড ডাউনলোড হয়েছে।")
    } catch (err: any) {
      console.error("Card download failed:", err)
      toast.error("ত্রুটি! ডাউনলোড করতে সমস্যা হয়েছে।")
    } finally {
      flipContainer.style.transform = origTransform
      flipContainer.style.transition = origTransition
      flipContainer.style.transformStyle = origTransformStyle
      wrapper.style.perspective = origWrapperPerspective

      if (frontDiv) frontDiv.style.backfaceVisibility = origFrontBfv
      if (backDiv) {
        backDiv.style.position = origBackPos
        backDiv.style.inset = origBackInset
        backDiv.style.transform = origBackTransform
        backDiv.style.backfaceVisibility = origBackBfv
      }

      setDownloading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-5 w-full py-2">
      {/* Top Action Toolbar */}
      <div className="flex max-w-full flex-wrap items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFlipped((f) => !f)}
          className="border-emerald-600 bg-emerald-600 text-white shadow-md hover:bg-emerald-700 font-bold gap-2 cursor-pointer transition-all"
        >
          <RefreshCw className={`h-4 w-4 transition-transform duration-500 ${flipped ? "rotate-180" : ""}`} />
          <span>{flipped ? "সামনে" : "পেছনে"}</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={downloadCard}
          disabled={downloading}
          className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-bold gap-2 cursor-pointer transition-all"
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span>ডাউনলোড</span>
        </Button>
      </div>

      {/* 3D Flip Card Frame with Horizontal Scroll for Mobile */}
      <div className="w-full overflow-x-auto overflow-y-hidden max-w-full py-2 px-1">
        <div className="w-max mx-auto min-w-full flex items-center justify-center">
          <div
            ref={wrapperRef}
            className="bengali-text shrink-0"
            style={{
              perspective: "1200px",
              width: "3.3in",
              minWidth: "3.3in",
              ...BENGALI_TEXT_STYLE,
            }}
          >
          <div
            ref={flipContainerRef}
            className="relative transition-transform duration-700 ease-in-out cursor-pointer"
            onClick={() => setFlipped((f) => !f)}
            style={{
              transformStyle: "preserve-3d",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front Side */}
            <div className="relative" style={{ backfaceVisibility: "hidden" }}>
              <div ref={frontRef}>
                <CardFront taxPayer={taxPayer} tenant={tenant} />
              </div>
            </div>

            {/* Back Side */}
            <div
              className="absolute inset-0"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div ref={backRef}>
                <CardBack />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)
}
